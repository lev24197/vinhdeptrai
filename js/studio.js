// ============================================================================
// MODULE: js/studio.js
// Chức năng: Studio Học & Chỉnh Sửa Chủ Đề (9-Column Live Editor,
//            3D Flashcards Leitner SRS, Cloze Typing Quiz, Audio Playlist & Print PDF)
//            100% Icon-Free Swiss Editorial Design.
// ============================================================================

let currentPreviewStt = null;
let currentPreviewLines = [];
let currentFlashcardIdx = 0;
let isEditMode = false;
let currentQuizItem = null;
let quizScoreCorrect = 0;
let quizScoreWrong = 0;

let isPlaylistPlaying = false;
let playlistTimeout = null;
let isAutoSlide = false;
let autoSlideInterval = null;
let srsMemoryMap = JSON.parse(localStorage.getItem('anki_srs_memory') || '{}');

function togglePlaylistAudio() {
  if (isPlaylistPlaying) {
    stopPlaylistAudio();
  } else {
    isPlaylistPlaying = true;
    const btn = document.getElementById('btnPlaylistAudio');
    if (btn) {
      btn.innerText = 'DỪNG ĐỌC TỰ ĐỘNG';
      btn.className = 'neo-btn px-3 py-1.5 bg-[#BE123C] text-white text-xs uppercase';
    }
    playNextInPlaylist(0);
  }
}

function stopPlaylistAudio() {
  isPlaylistPlaying = false;
  if (playlistTimeout) clearTimeout(playlistTimeout);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const btn = document.getElementById('btnPlaylistAudio');
  if (btn) {
    btn.innerText = 'PHÁT TỰ ĐỘNG 100 TỪ';
    btn.className = 'neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase';
  }
}

function playNextInPlaylist(idx) {
  if (!isPlaylistPlaying || idx >= currentPreviewLines.length) {
    stopPlaylistAudio();
    return;
  }
  const cols = currentPreviewLines[idx];
  const word = cols[0] || '';
  speakWord(word);

  const subText = document.getElementById('previewSubText');
  if (subText) subText.innerHTML = `<span class="text-[#0F766E] font-mono-code font-bold uppercase">ĐANG PHÁT TỰ ĐỘNG (#${idx + 1}/100): ${word} — ${cols[5] || ''}</span>`;

  playlistTimeout = setTimeout(() => {
    playNextInPlaylist(idx + 1);
  }, 3200);
}

function toggleFlashcardAutoSlide() {
  isAutoSlide = !isAutoSlide;
  const btn = document.getElementById('btnAutoSlide');
  if (isAutoSlide) {
    if (btn) {
      btn.innerText = 'DỪNG TRÌNH CHIẾU';
      btn.className = 'neo-btn px-3 py-1.5 bg-[#BE123C] text-white text-xs uppercase';
    }
    autoSlideInterval = setInterval(() => {
      const scene = document.getElementById('flashcardScene');
      if (scene && !scene.classList.contains('flipped')) {
        scene.classList.add('flipped');
      } else {
        nextFlashcard(1);
      }
    }, 2800);
  } else {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    if (btn) {
      btn.innerText = 'TỰ ĐỘNG LẬT (3 GIÂY)';
      btn.className = 'neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase';
    }
  }
}

function markSrsStatus(level) {
  if (!currentPreviewLines.length) return;
  const cols = currentPreviewLines[currentFlashcardIdx];
  const key = `${currentPreviewStt}_${(cols[0] || '').toLowerCase()}`;
  srsMemoryMap[key] = level;
  localStorage.setItem('anki_srs_memory', JSON.stringify(srsMemoryMap));
  updateSrsCounters();
  nextFlashcard(1);
}

function updateSrsCounters() {
  let hard = 0, good = 0, easy = 0;
  currentPreviewLines.forEach(cols => {
    const key = `${currentPreviewStt}_${(cols[0] || '').toLowerCase()}`;
    if (srsMemoryMap[key] === 'hard') hard++;
    if (srsMemoryMap[key] === 'good') good++;
    if (srsMemoryMap[key] === 'easy') easy++;
  });
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('srsCountHard', hard);
  setTxt('srsCountGood', good);
  setTxt('srsCountEasy', easy);
}

function printCurrentTopicSheet() {
  if (!currentPreviewLines.length) return;
  const title = document.getElementById('previewTitle')?.innerText || `Chủ đề #${currentPreviewStt}`;
  const win = window.open('', '_blank');
  const rows = currentPreviewLines.map((c, idx) => `
    <tr style="border-bottom: 1px solid #111111; font-size: 12px;">
      <td style="padding: 6px; font-weight: bold; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 6px; font-weight: bold;">${c[0] || ''} <span style="font-weight:normal; font-family:monospace;">${c[2] || ''}</span></td>
      <td style="padding: 6px; font-weight: bold;">${c[5] || ''}</td>
      <td style="padding: 6px;">${c[4] || ''}</td>
      <td style="padding: 6px; font-size: 11px;">${c[8] || ''}</td>
    </tr>
  `).join('');

  win.document.write(`
    <html>
    <head>
      <title>Bản In Học Tập - ${title}</title>
      <style>
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 24px; color: #111111; }
        h1 { font-size: 20px; margin-bottom: 4px; text-transform: uppercase; font-weight: 800; }
        p { font-size: 12px; color: #52525b; margin-top: 0; margin-bottom: 16px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; border: 2px solid #111111; }
        th { background: #eae5da; text-align: left; padding: 8px 6px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #111111; font-family: monospace; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #111111; color: white; border: 2px solid #111111; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 12px;">IN HOẶC LƯU PDF</button>
      </div>
      <h1>${title}</h1>
      <p>BỘ TỪ ĐIỂN 100 TỪ VỰNG CHUẨN ANKI (50 TỪ GIAO TIẾP A2-B2 & 50 TỪ NÂNG CAO C1-C2)</p>
      <table>
        <thead>
          <tr><th>STT</th><th>TỪ VỰNG & IPA</th><th>NGHĨA TIẾNG VIỆT</th><th>ĐỊNH NGHĨA TIẾNG ANH</th><th>VÍ DỤ THỰC TẾ</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);
  win.document.close();
}

async function previewFile(stt, topicTitle) {
  currentPreviewStt = stt;
  isEditMode = false;
  const modal = document.getElementById('previewModal');
  if (modal) modal.classList.remove('hidden');

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('previewBadge', `#${stt}`);
  setTxt('previewTitle', topicTitle);
  setTxt('previewSubText', 'Đang tải dữ liệu 9 cột từ kho lưu trữ...');

  const studioSelect = document.getElementById('studioTopicSelect');
  if (studioSelect && String(studioSelect.value) !== String(stt)) {
    studioSelect.value = String(stt);
  }

  const saveBtn = document.getElementById('btnSaveCloud');
  if (saveBtn) saveBtn.classList.add('hidden');
  const toggleBtn = document.getElementById('btnToggleEdit');
  if (toggleBtn) toggleBtn.innerText = 'CHẾ ĐỘ CHỈNH SỬA';

  switchPreviewTab('table');

  const dlBtn = document.getElementById('previewDownloadBtn');
  if (dlBtn) dlBtn.onclick = () => downloadSingleFile(stt, topicTitle);

  try {
    const res = await smartFetch(`output/${stt}.txt`);
    if (!res.ok) throw new Error('Không tìm thấy file');
    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    currentPreviewLines = lines.map(line => {
      const cols = line.split('\t');
      while (cols.length < 9) cols.push('');
      return cols;
    });

    setTxt('previewSubText', `TỔNG CỘNG: ${currentPreviewLines.length} TỪ VỰNG • ĐỊNH DẠNG 9 CỘT TSV ANKI`);
    renderPreviewTable();
    currentFlashcardIdx = 0;
    renderFlashcard();
    updateSrsCounters();
  } catch (e) {
    const tbody = document.getElementById('previewTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-[#BE123C] font-mono-code text-xs uppercase">Không thể tải nội dung file output/${stt}.txt</td></tr>`;
  }
}

function renderPreviewTable() {
  const tbody = document.getElementById('previewTableBody');
  if (!tbody) return;
  const searchEl = document.getElementById('previewSearchInput');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';

  const filtered = currentPreviewLines
    .map((cols, idx) => ({ cols, idx }))
    .filter(({ cols }) => {
      if (!q) return true;
      return (cols[0] || '').toLowerCase().includes(q)
        || (cols[5] || '').toLowerCase().includes(q)
        || (cols[4] || '').toLowerCase().includes(q);
    });

  if (!isEditMode) {
    tbody.innerHTML = filtered.map(({ cols, idx }) => {
      const isConversational = idx < 50;
      const badge = isConversational
        ? `<span class="inline-block px-1.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-[#0F766E] border border-[#0F766E] mb-1">A2-B2 GIAO TIẾP</span>`
        : `<span class="inline-block px-1.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-[#7C3AED] border border-[#7C3AED] mb-1">C1-C2 NÂNG CAO</span>`;
      const safeWord = (cols[0] || '').replace(/'/g, "\\'");

      return `
        <tr class="hover:bg-[#F4F1EA] align-top border-b border-zinc-200">
          <td class="p-3 font-mono-code text-zinc-500 font-bold">${idx + 1}</td>
          <td class="p-3">
            ${badge}
            <div class="flex items-center gap-2">
              <button onclick="speakWord('${safeWord}', event)" class="neo-btn px-2 py-0.5 bg-[#EAE5DA] text-[#111111] text-xs font-mono-code uppercase">PHÁT ÂM</button>
              <span class="font-bold text-zinc-900 text-xs sm:text-sm">${cols[0] || ''}</span>
            </div>
            <div class="font-mono-code text-xs text-zinc-500 mt-1">${cols[1] || ''}</div>
          </td>
          <td class="p-3">
            <div class="font-mono-code text-[#1D4ED8] font-bold text-xs">${cols[2] || ''}</div>
            <div class="font-mono-code text-xs text-zinc-500 mt-0.5">${cols[3] || ''}</div>
          </td>
          <td class="p-3 text-zinc-800 leading-relaxed max-w-xs text-xs">${cols[4] || ''}</td>
          <td class="p-3 font-semibold text-[#0F766E] text-xs">${cols[5] || ''}</td>
          <td class="p-3 font-mono-code text-zinc-700 text-xs">${cols[7] || ''}</td>
          <td class="p-3 text-zinc-700 leading-relaxed max-w-md text-xs font-mono-code">${cols[8] || ''}</td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = filtered.map(({ cols, idx }) => `
      <tr class="bg-[#F4F1EA] align-top border-b border-zinc-300">
        <td class="p-2 font-mono-code text-zinc-600 font-bold">${idx + 1}</td>
        <td class="p-2">
          <input type="text" value="${(cols[0] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 0, this.value)" class="w-full px-2 py-1 text-xs font-bold border-2 border-[#111111] mb-1" placeholder="Từ vựng" />
          <input type="text" value="${(cols[1] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 1, this.value)" class="w-full px-2 py-1 text-xs font-mono-code border border-zinc-400 bg-white" placeholder="Cloze" />
        </td>
        <td class="p-2">
          <input type="text" value="${(cols[2] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 2, this.value)" class="w-full px-2 py-1 text-xs font-mono-code border-2 border-[#111111] mb-1" placeholder="/IPA/" />
          <input type="text" value="${(cols[3] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 3, this.value)" class="w-full px-2 py-1 text-xs font-mono-code border border-zinc-400 bg-white" placeholder="[sound:...]" />
        </td>
        <td class="p-2">
          <textarea rows="2" onchange="updateCell(${idx}, 4, this.value)" class="w-full px-2 py-1 text-xs border-2 border-[#111111]">${cols[4] || ''}</textarea>
        </td>
        <td class="p-2">
          <input type="text" value="${(cols[5] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 5, this.value)" class="w-full px-2 py-1 text-xs font-semibold text-[#0F766E] border-2 border-[#111111]" />
        </td>
        <td class="p-2">
          <input type="text" value="${(cols[7] || '').replace(/"/g, '&quot;')}" onchange="updateCell(${idx}, 7, this.value)" class="w-full px-2 py-1 text-xs font-mono-code border-2 border-[#111111]" />
        </td>
        <td class="p-2">
          <textarea rows="2" onchange="updateCell(${idx}, 8, this.value)" class="w-full px-2 py-1 text-xs border-2 border-[#111111]">${cols[8] || ''}</textarea>
        </td>
      </tr>
    `).join('');
  }
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  const toggleBtn = document.getElementById('btnToggleEdit');
  const saveBtn = document.getElementById('btnSaveCloud');
  if (isEditMode) {
    if (toggleBtn) {
      toggleBtn.innerText = 'CHẾ ĐỘ XEM';
      toggleBtn.className = 'neo-btn px-3 py-1.5 bg-[#111111] text-white text-xs uppercase';
    }
    if (saveBtn) saveBtn.classList.remove('hidden');
  } else {
    if (toggleBtn) {
      toggleBtn.innerText = 'CHẾ ĐỘ CHỈNH SỬA';
      toggleBtn.className = 'neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase';
    }
  }
  renderPreviewTable();
}

function updateCell(rowIdx, colIdx, val) {
  if (!currentPreviewLines[rowIdx]) return;
  currentPreviewLines[rowIdx][colIdx] = val.trim();
  if (colIdx === 0) {
    currentPreviewLines[rowIdx][1] = makeClozeJS(val);
    currentPreviewLines[rowIdx][3] = makeSoundJS(val);
  }
  const saveBtn = document.getElementById('btnSaveCloud');
  if (saveBtn) saveBtn.classList.remove('hidden');
}

async function saveEditedFileToGitHub() {
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const token = localStorage.getItem('gh_token');

  if (!owner || !repo || !token) {
    alert('Vui lòng cấu hình GitHub Personal Access Token trong phần CẤU HÌNH API để lưu trực tiếp lên GitHub!');
    openSettings();
    return;
  }

  const saveBtn = document.getElementById('btnSaveCloud');
  if (saveBtn) {
    saveBtn.innerText = 'ĐANG LƯU LÊN GITHUB...';
    saveBtn.disabled = true;
  }

  const content = currentPreviewLines.map(cols => cols.slice(0, 9).join('\t')).join('\n') + '\n';
  const path = `output/${currentPreviewStt}.txt`;

  try {
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`
      }
    });

    let sha = undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const encoded = btoa(unescape(encodeURIComponent(content)));
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update topic #${currentPreviewStt} via Web Studio`,
        content: encoded,
        sha,
        branch
      })
    });

    if (putRes.ok) {
      logToConsole('SUCCESS', 'CLOUD_SAVE', `Đã lưu thành công chủ đề #${currentPreviewStt} lên nhánh ${branch}!`);
      alert(`Đã lưu thành công file output/${currentPreviewStt}.txt lên GitHub!`);
      isEditMode = false;
      toggleEditMode();
    } else {
      const err = await putRes.json();
      alert(`Lỗi khi lưu lên GitHub: ${err.message}`);
    }
  } catch (e) {
    alert(`Lỗi kết nối GitHub API: ${e.message}`);
  } finally {
    if (saveBtn) {
      saveBtn.innerText = 'LƯU LÊN GITHUB';
      saveBtn.disabled = false;
    }
  }
}

function switchPreviewTab(tab) {
  ['table', 'flashcard', 'quiz'].forEach(t => {
    const btn = document.getElementById(`pTab-${t}`);
    const view = document.getElementById(`previewTab-${t}`);
    if (btn) {
      btn.className = t === tab
        ? 'px-3 py-1.5 text-xs font-bold uppercase bg-[#111111] text-white transition'
        : 'px-3 py-1.5 text-xs font-bold uppercase text-zinc-700 hover:text-black transition';
    }
    if (view) {
      if (t === tab) view.classList.remove('hidden');
      else view.classList.add('hidden');
    }
  });

  if (tab === 'flashcard') renderFlashcard();
  if (tab === 'quiz') nextQuizQuestion();
}

function renderFlashcard() {
  if (!currentPreviewLines.length) return;
  if (currentFlashcardIdx < 0) currentFlashcardIdx = currentPreviewLines.length - 1;
  if (currentFlashcardIdx >= currentPreviewLines.length) currentFlashcardIdx = 0;

  const scene = document.getElementById('flashcardScene');
  if (scene) scene.classList.remove('flipped');
  const cols = currentPreviewLines[currentFlashcardIdx];

  const isConv = currentFlashcardIdx < 50;
  const catEl = document.getElementById('fcCategoryBadge');
  if (catEl) {
    catEl.innerText = isConv ? 'PHẦN 1: GIAO TIẾP (A2-B2)' : 'PHẦN 2: NÂNG CAO (C1-C2)';
    catEl.className = isConv
      ? 'px-2.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-[#0F766E] border border-[#0F766E] mb-3 uppercase'
      : 'px-2.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-[#7C3AED] border border-[#7C3AED] mb-3 uppercase';
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('fcWord', cols[0] || '');
  setTxt('fcIpa', cols[2] || '');
  setTxt('fcCloze', cols[1] || '');
  setTxt('fcMeaningVi', cols[5] || '');
  setTxt('fcPlural', cols[7] ? `Số nhiều: ${cols[7]}` : '');
  setTxt('fcDefEn', cols[4] || '');
  const exEl = document.getElementById('fcExamples');
  if (exEl) exEl.innerHTML = cols[8] || '';
  setTxt('fcCounter', `${currentFlashcardIdx + 1} / ${currentPreviewLines.length}`);
}

function nextFlashcard(delta) {
  currentFlashcardIdx += delta;
  renderFlashcard();
}

function shuffleFlashcard() {
  currentFlashcardIdx = Math.floor(Math.random() * currentPreviewLines.length);
  renderFlashcard();
}

function nextQuizQuestion() {
  if (!currentPreviewLines.length) return;
  const idx = Math.floor(Math.random() * currentPreviewLines.length);
  const cols = currentPreviewLines[idx];
  currentQuizItem = {
    idx,
    word: (cols[0] || '').trim(),
    cloze: cols[1] || '',
    ipa: cols[2] || '',
    def: cols[4] || '',
    vi: cols[5] || '',
    ex: cols[8] || ''
  };

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('quizMeaningVi', currentQuizItem.vi);
  setTxt('quizDefEn', currentQuizItem.def);
  setTxt('quizClozeHint', currentQuizItem.cloze);
  setTxt('quizIpaHint', currentQuizItem.ipa);

  const input = document.getElementById('quizAnswerInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  const fb = document.getElementById('quizFeedbackBox');
  if (fb) fb.classList.add('hidden');
}

function checkQuizAnswer() {
  if (!currentQuizItem) return;
  const input = document.getElementById('quizAnswerInput');
  const userAns = (input ? input.value : '').trim().toLowerCase();
  const target = currentQuizItem.word.toLowerCase();
  const fb = document.getElementById('quizFeedbackBox');
  if (fb) fb.classList.remove('hidden');

  if (userAns === target) {
    quizScoreCorrect++;
    const scEl = document.getElementById('quizScoreCorrect');
    if (scEl) scEl.innerText = `ĐÚNG: ${quizScoreCorrect}`;
    if (fb) {
      fb.className = 'mt-4 p-4 border-2 border-[#0F766E] bg-white text-xs font-mono-code font-bold uppercase text-[#0F766E]';
      fb.innerHTML = `CHÍNH XÁC: <span class="underline">${currentQuizItem.word}</span> (${currentQuizItem.ipa})<br><span class="text-xs font-normal text-zinc-600 mt-1 block normal-case">${currentQuizItem.ex}</span>`;
    }
    speakWord(currentQuizItem.word);
  } else {
    quizScoreWrong++;
    const swEl = document.getElementById('quizScoreWrong');
    if (swEl) swEl.innerText = `SAI: ${quizScoreWrong}`;
    if (fb) {
      fb.className = 'mt-4 p-4 border-2 border-[#BE123C] bg-white text-xs font-mono-code font-bold uppercase text-[#BE123C]';
      fb.innerHTML = `CHƯA ĐÚNG. ĐÁP ÁN ĐÚNG: <span class="underline">${currentQuizItem.word}</span> (${currentQuizItem.ipa})<br><span class="text-xs font-normal text-zinc-600 mt-1 block normal-case">${currentQuizItem.ex}</span>`;
    }
    speakWord(currentQuizItem.word);
  }
}

function revealQuizAnswer() {
  if (!currentQuizItem) return;
  const input = document.getElementById('quizAnswerInput');
  if (input) input.value = currentQuizItem.word;
  checkQuizAnswer();
}

function closePreviewModal() {
  stopPlaylistAudio();
  if (isAutoSlide) toggleFlashcardAutoSlide();
  const modal = document.getElementById('previewModal');
  if (modal && !modal.dataset.standalonePage) {
    modal.classList.add('hidden');
  }
}

// ==================== TRANG CHUYÊN BIỆT: STUDIO.HTML ====================
function populateStudioTopicSelect() {
  const select = document.getElementById('studioTopicSelect');
  if (!select) return;

  const completed = allTopics.filter(t => t.status === 'completed');
  if (!completed.length) {
    select.innerHTML = `<option value="">CHƯA CÓ CHỦ ĐỀ HOÀN THÀNH</option>`;
    return;
  }

  select.innerHTML = completed.map(t => `<option value="${t.stt}">#${t.stt} — ${t.topic} (${t.word_count || 100} TỪ)</option>`).join('');
}

function onStudioTopicSelectChange(sttVal) {
  const stt = parseInt(sttVal, 10);
  if (!stt) return;
  const topicObj = allTopics.find(t => t.stt === stt);
  previewFile(stt, topicObj ? topicObj.topic : `Chủ đề #${stt}`);
}

function initStudioPage() {
  populateStudioTopicSelect();
  const params = new URLSearchParams(window.location.search);
  const requestedStt = parseInt(params.get('stt') || '', 10);
  const completed = allTopics.filter(t => t.status === 'completed');
  const targetTopic = completed.find(t => t.stt === requestedStt) || completed[0];
  if (targetTopic) {
    previewFile(targetTopic.stt, targetTopic.topic);
  }
}
