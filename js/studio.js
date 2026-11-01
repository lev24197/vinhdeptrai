// ==================== STUDIO XEM, SỬA LIVE, FLASHCARD & QUIZ KHUYẾT CHỮ ====================
let activeStt = null;
let currentModalWords = [];
let currentFcIndex = 0;
let modalQuizIndex = 0;
let modalQuizScore = 0;

function speakWord(word) {
  if (typeof speakWordTTS === 'function') speakWordTTS(word);
}

function makeClozeJS(word) {
  return word.trim().split(/\s+/).map(p => p.length <= 2 ? p : p[0] + '_'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
}

function makeSoundJS(word) {
  return `[sound:${word.trim().toLowerCase().replace(/\s+/g, '_')}.mp3]`;
}

async function previewFile(stt, topic) {
  activeStt = stt;
  document.getElementById('previewSttBadge').innerText = `#${stt}`;
  document.getElementById('previewTitle').innerText = topic;
  const dlBtn = document.getElementById('previewDownloadBtn');
  if (dlBtn) {
    dlBtn.onclick = () => downloadSingleFile(stt);
  }
  switchModalTab('table');

  const modal = document.getElementById('previewModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  try {
    const res = await smartFetch(`output/${stt}.txt`);
    const rawText = await res.text();
    document.getElementById('rawTsvTextarea').value = rawText;

    const lines = rawText.split('\n').filter(l => l.trim());
    currentModalWords = lines.map((line, idx) => {
      const cols = line.split('\t');
      return {
        index: idx,
        word: cols[0] || '',
        cloze: cols[1] || '',
        ipa: cols[2] || '',
        sound: cols[3] || '',
        definition: cols[4] || '',
        vi: cols[5] || '',
        plural: cols[7] || '',
        examples: cols[8] || ''
      };
    });

    currentFcIndex = 0;
    modalQuizIndex = 0;
    modalQuizScore = 0;
    renderModalWords();
    renderFlashcard();
    loadQuizQuestion();
  } catch (e) {
    alert(`Không tải được nội dung chủ đề #${stt}: ` + e.message);
  }
}

function closePreview() {
  const modal = document.getElementById('previewModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function renderModalWords() {
  const q = document.getElementById('modalWordSearch')?.value.toLowerCase().trim() || '';
  const filtered = currentModalWords.filter(w => !q || w.word.toLowerCase().includes(q) || w.vi.toLowerCase().includes(q));
  const countInfo = document.getElementById('modalWordCountInfo');
  if (countInfo) countInfo.innerText = `${filtered.length} / ${currentModalWords.length} từ`;

  const body = document.getElementById('previewBody');
  if (!body) return;
  body.innerHTML = filtered.map(item => {
    const isAdv = item.index >= 50;
    const tag = isAdv
      ? `<span class="text-[9px] font-mono-code font-bold bg-[#8C43F6] text-white px-1 py-0.2 rounded mr-1">C1</span>`
      : `<span class="text-[9px] font-mono-code font-bold bg-[#169C64] text-white px-1 py-0.2 rounded mr-1">A2</span>`;

    return `
      <tr class="hover:bg-amber-50 align-top">
        <td class="p-2 font-mono-code font-bold">${item.index + 1}</td>
        <td class="p-2">
          <div class="flex items-center gap-1">
            ${tag}
            <button onclick="speakWord('${item.word.replace(/'/g, "\\'")}')" class="text-indigo-700 font-bold hover:scale-110 transition-transform">🔊</button>
            <input value="${item.word}" onchange="updateWordCell(${item.index}, 'word', this.value)" class="font-extrabold bg-transparent border-b border-transparent focus:border-[#111] w-32" />
          </div>
        </td>
        <td class="p-2 font-mono-code text-slate-600" id="clozeCell-${item.index}">${item.cloze}</td>
        <td class="p-2"><input value="${item.ipa}" onchange="updateWordCell(${item.index}, 'ipa', this.value)" class="font-mono-code text-indigo-700 bg-transparent border-b border-transparent focus:border-[#111] w-28" /></td>
        <td class="p-2"><input value="${item.definition}" onchange="updateWordCell(${item.index}, 'definition', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-full" /></td>
        <td class="p-2"><input value="${item.vi}" onchange="updateWordCell(${item.index}, 'vi', this.value)" class="font-extrabold text-[#169C64] bg-transparent border-b border-transparent focus:border-[#111] w-36" /></td>
        <td class="p-2"><input value="${item.plural}" onchange="updateWordCell(${item.index}, 'plural', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-28" /></td>
        <td class="p-2"><input value="${item.examples.replace(/"/g, '&quot;')}" onchange="updateWordCell(${item.index}, 'examples', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-full" /></td>
      </tr>
    `;
  }).join('');
}

function updateWordCell(idx, field, val) {
  const item = currentModalWords[idx];
  item[field] = val.trim();
  if (field === 'word') {
    item.cloze = makeClozeJS(item.word);
    item.sound = makeSoundJS(item.word);
    const c = document.getElementById(`clozeCell-${idx}`);
    if (c) c.innerText = item.cloze;
  }
  const lines = currentModalWords.map(i => [i.word, i.cloze, i.ipa, i.sound, i.definition, i.vi, i.vi, i.plural, i.examples].join('\t'));
  document.getElementById('rawTsvTextarea').value = lines.join('\n') + '\n';
}

async function saveEditedFileToGitHub() {
  const btn = document.getElementById('btnSaveGitHub');
  btn.innerText = '⏳ Đang lưu...';
  try {
    await pushFileToGitHub(`output/${activeStt}.txt`, document.getElementById('rawTsvTextarea').value, `Update output/${activeStt}.txt via Web`);
    alert(`Đã lưu thành công file output/${activeStt}.txt lên GitHub!`);
  } catch (e) {
    alert('Lỗi khi lưu lên GitHub: ' + e.message);
  }
  btn.innerText = '💾 Lưu lên GitHub';
}

function switchModalTab(tab) {
  ['table', 'flashcard', 'quiz'].forEach(t => {
    const el = document.getElementById('modalView' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) {
      el.classList.toggle('hidden', t !== tab);
      if (t !== 'table') el.classList.toggle('flex', t === tab);
    }
    const tabBtn = document.getElementById('modalTab-' + t);
    if (tabBtn) {
      tabBtn.className = t === tab
        ? 'neo-btn px-3 py-1 bg-[#111] text-white text-xs font-extrabold'
        : 'neo-btn px-3 py-1 bg-white text-[#111] text-xs font-extrabold';
    }
  });
}

function renderFlashcard() {
  if (!currentModalWords.length) return;
  const item = currentModalWords[currentFcIndex];
  document.getElementById('flashcardBox').classList.remove('flipped');
  document.getElementById('fcProgress').innerText = `Thẻ ${currentFcIndex + 1} / ${currentModalWords.length}`;
  document.getElementById('fcCloze').innerText = item.cloze;
  document.getElementById('fcDef').innerText = item.definition;
  document.getElementById('fcViFront').innerText = `Nghĩa: ${item.vi}`;
  document.getElementById('fcWord').innerText = item.word;
  document.getElementById('fcIpa').innerText = item.ipa;
  document.getElementById('fcPlural').innerText = item.plural;
  document.getElementById('fcSoundTag').innerText = item.sound;
  document.getElementById('fcViBack').innerText = item.vi;
  document.getElementById('fcExamples').innerHTML = item.examples;
}

function toggleFlipCard() {
  const box = document.getElementById('flashcardBox');
  if (box) box.classList.toggle('flipped');
}

function changeFlashcard(d) {
  currentFcIndex = (currentFcIndex + d + currentModalWords.length) % currentModalWords.length;
  renderFlashcard();
}

function speakCurrentCard() {
  if (currentModalWords.length) {
    speakWord(currentModalWords[currentFcIndex].word);
  }
}

function loadQuizQuestion() {
  if (!currentModalWords.length) return;
  const item = currentModalWords[modalQuizIndex];
  document.getElementById('quizProgressText').innerText = `CÂU ${modalQuizIndex + 1}/${currentModalWords.length}`;
  document.getElementById('quizScoreText').innerText = modalQuizScore;
  document.getElementById('quizClozeHint').innerText = item.cloze;
  document.getElementById('quizMeaningVi').innerText = item.vi;
  document.getElementById('quizDefEn').innerText = item.definition;
  document.getElementById('quizUserInput').value = '';
  document.getElementById('quizFeedback').classList.add('hidden');
}

function checkQuizAnswer() {
  const item = currentModalWords[modalQuizIndex];
  const ans = document.getElementById('quizUserInput').value.trim().toLowerCase();
  const fb = document.getElementById('quizFeedback');
  fb.classList.remove('hidden');
  if (ans === item.word.toLowerCase()) {
    modalQuizScore++;
    document.getElementById('quizScoreText').innerText = modalQuizScore;
    fb.className = 'p-3 border-2 border-[#111] bg-[#38E54D] text-[#111] text-xs font-extrabold text-center';
    fb.innerText = `🎉 CHÍNH XÁC! "${item.word}" (${item.ipa})`;
    speakWord(item.word);
    setTimeout(nextQuizQuestion, 1100);
  } else {
    fb.className = 'p-3 border-2 border-[#111] bg-[#F05332] text-white text-xs font-extrabold text-center';
    fb.innerText = `Chưa đúng! Đáp án chuẩn là: "${item.word}"`;
  }
}

function nextQuizQuestion() {
  modalQuizIndex = (modalQuizIndex + 1) % currentModalWords.length;
  loadQuizQuestion();
}

function speakQuizWord() {
  if (currentModalWords.length) {
    speakWord(currentModalWords[modalQuizIndex].word);
  }
}
