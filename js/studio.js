// ==================== STUDIO XEM, SỬA LIVE, FLASHCARD 2.0 & QUIZ KHUYẾT CHỮ ====================
let activeStt = null;
let currentModalWords = [];
let currentFcIndex = 0;
let modalQuizIndex = 0;
let modalQuizScore = 0;

// Trạng thái Slideshow & Audio Player
let fcSlideshowTimer = null;
let isFcSlideshowRunning = false;
let fcSlideshowInterval = 4000;
let fcAutoPronounce = true;

let audioPlaylistIndex = 0;
let isAudioPlaylistRunning = false;
let audioPlaylistSpeed = 1.0;

function speakWord(word) {
  if (typeof speakWordTTS === 'function') {
    speakWordTTS(word);
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = audioPlaylistSpeed;
    window.speechSynthesis.speak(u);
  }
}

function makeClozeJS(word) {
  return word.trim().split(/\s+/).map(p => p.length <= 2 ? p : p[0] + '_'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
}

function makeSoundJS(word) {
  return `[sound:${word.trim().toLowerCase().replace(/\s+/g, '_')}.mp3]`;
}

// Mở Modal Xem / Sửa Chủ Đề
async function previewFile(stt, topic) {
  activeStt = stt;
  const sttBadge = document.getElementById('previewSttBadge');
  if (sttBadge) sttBadge.innerText = `#${stt}`;
  const titleEl = document.getElementById('previewTitle');
  if (titleEl) titleEl.innerText = topic;

  const dlBtn = document.getElementById('previewDownloadBtn');
  if (dlBtn) dlBtn.onclick = () => downloadSingleFile(stt);

  switchModalTab('table');

  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // Dừng mọi tiến trình auto nếu có
  stopFlashcardSlideshow();
  stopAudioPlaylist();

  try {
    const res = await smartFetch(`output/${stt}.txt`);
    let rawText = await res.text();

    // Kiểm tra bản nháp lưu tạm trong LocalStorage nếu có
    const draftKey = `draft_topic_${stt}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft && savedDraft !== rawText) {
      if (confirm(`Tìm thấy bản nháp đã chỉnh sửa chưa lưu cho chủ đề #${stt}. Bạn có muốn khôi phục bản nháp này không?`)) {
        rawText = savedDraft;
      }
    }

    const tsvArea = document.getElementById('rawTsvTextarea');
    if (tsvArea) tsvArea.value = rawText;

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
  stopFlashcardSlideshow();
  stopAudioPlaylist();
  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ==================== TAB 1: BẢNG 9 CỘT SỬA TRỰC TIẾP ====================
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

    const isCurrentPlaying = (isAudioPlaylistRunning && item.index === audioPlaylistIndex);
    const rowClass = isCurrentPlaying ? 'bg-amber-200 font-bold border-l-4 border-amber-600' : 'hover:bg-amber-50';

    return `
      <tr class="${rowClass} align-top transition-colors">
        <td class="p-2 font-mono-code text-[11px] text-slate-500">${tag}${item.index + 1}</td>
        <td class="p-2 font-extrabold text-[#2C317A]">
          <div class="flex items-center gap-1">
            <button onclick="speakWord('${item.word}')" class="text-xs hover:scale-125 transition" title="Nghe phát âm">🔊</button>
            <input value="${item.word}" onchange="updateWordCell(${item.index}, 'word', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] font-bold w-full" />
          </div>
        </td>
        <td class="p-2 font-mono-code text-slate-600" id="clozeCell-${item.index}">${item.cloze}</td>
        <td class="p-2 font-mono-code"><input value="${item.ipa}" onchange="updateWordCell(${item.index}, 'ipa', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-28" /></td>
        <td class="p-2 text-slate-700"><input value="${item.definition.replace(/"/g, '&quot;')}" onchange="updateWordCell(${item.index}, 'definition', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-full" /></td>
        <td class="p-2 text-[#169C64] font-bold"><input value="${item.vi}" onchange="updateWordCell(${item.index}, 'vi', this.value)" class="bg-transparent border-b border-transparent focus:border-[#111] w-32" /></td>
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
  const fullText = lines.join('\n') + '\n';
  const tsvArea = document.getElementById('rawTsvTextarea');
  if (tsvArea) tsvArea.value = fullText;

  // Tự động lưu bản nháp vào LocalStorage
  if (activeStt) {
    localStorage.setItem(`draft_topic_${activeStt}`, fullText);
    const draftNotice = document.getElementById('modalDraftNotice');
    if (draftNotice) {
      draftNotice.innerText = 'Đã tự động lưu bản nháp lúc ' + new Date().toLocaleTimeString();
      draftNotice.classList.remove('hidden');
    }
  }
}

// Sao chép toàn bộ TSV vào Clipboard
function copyTsvToClipboard() {
  const rawText = document.getElementById('rawTsvTextarea')?.value;
  if (!rawText) return;
  navigator.clipboard.writeText(rawText).then(() => {
    if (typeof showToastAlert === 'function') {
      showToastAlert('📋 Đã sao chép 100 dòng TSV vào Clipboard! Có thể dán ngay vào Anki Desktop.');
    } else {
      alert('📋 Đã sao chép 100 dòng TSV vào Clipboard!');
    }
  }).catch(() => {
    alert('Không thể truy cập Clipboard trình duyệt.');
  });
}

// Lưu lên GitHub Actions
async function saveEditedFileToGitHub() {
  const btn = document.getElementById('btnSaveGitHub');
  if (btn) btn.innerText = '⏳ Đang lưu...';
  try {
    if (typeof pushFileToGitHub === 'function') {
      await pushFileToGitHub(`output/${activeStt}.txt`, document.getElementById('rawTsvTextarea').value, `Update output/${activeStt}.txt via Web`);
      if (activeStt) localStorage.removeItem(`draft_topic_${activeStt}`);
      alert(`Đã lưu thành công file output/${activeStt}.txt lên GitHub!`);
    } else {
      alert('Chức năng pushFileToGitHub yêu cầu kết nối GitHub Token trong mục Cấu hình API.');
    }
  } catch (e) {
    alert('Lỗi khi lưu lên GitHub: ' + e.message);
  }
  if (btn) btn.innerText = '💾 Lưu lên GitHub';
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

  if (tab !== 'flashcard') {
    stopFlashcardSlideshow();
  }
}

// ==================== TAB 2: FLASHCARD 2.0 (SRS LEITNER & SLIDESHOW) ====================
function renderFlashcard() {
  if (!currentModalWords.length) return;
  const item = currentModalWords[currentFcIndex];
  const box = document.getElementById('flashcardBox');
  if (box) box.classList.remove('flipped');

  const prog = document.getElementById('fcProgress');
  if (prog) prog.innerText = `Thẻ ${currentFcIndex + 1} / ${currentModalWords.length}`;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('fcCloze', item.cloze);
  setTxt('fcDef', item.definition);
  setTxt('fcViFront', `Nghĩa: ${item.vi}`);
  setTxt('fcWord', item.word);
  setTxt('fcIpa', item.ipa);
  setTxt('fcPlural', item.plural);
  setTxt('fcSoundTag', item.sound);
  setTxt('fcViBack', item.vi);

  const exEl = document.getElementById('fcExamples');
  if (exEl) exEl.innerHTML = item.examples;

  // Hiển thị trạng thái SRS hiện tại của từ nếu có
  const srsRecord = getWordSRSRecord(item.word);
  const srsBadge = document.getElementById('fcSrsBadge');
  if (srsBadge) {
    if (srsRecord && srsRecord.level > 0) {
      srsBadge.innerText = `⭐ Cấp độ nhớ: Lv.${srsRecord.level} (${srsRecord.reps} lần ôn)`;
      srsBadge.className = 'text-[10px] font-mono-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded';
    } else {
      srsBadge.innerText = 'Chưa có dữ liệu SRS';
      srsBadge.className = 'text-[10px] font-mono-code font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded';
    }
  }
}

function toggleFlipCard() {
  const box = document.getElementById('flashcardBox');
  if (box) {
    box.classList.toggle('flipped');
    if (box.classList.contains('flipped') && fcAutoPronounce) {
      speakCurrentCard();
    }
  }
}

function changeFlashcard(d) {
  currentFcIndex = (currentFcIndex + d + currentModalWords.length) % currentModalWords.length;
  renderFlashcard();
}

function speakCurrentCard() {
  if (currentModalWords.length && currentModalWords[currentFcIndex]) {
    speakWord(currentModalWords[currentFcIndex].word);
  }
}

// Đánh giá Leitner SRS (1: Again, 2: Hard, 3: Good, 4: Easy)
function rateFlashcardSRS(grade) {
  if (!currentModalWords.length) return;
  const item = currentModalWords[currentFcIndex];
  const srsKey = `srs_record_${item.word.toLowerCase()}`;
  let rec = JSON.parse(localStorage.getItem(srsKey) || '{"level":0,"reps":0,"last":0}');

  if (grade === 1) { // Chưa nhớ
    rec.level = 1;
    rec.reps++;
  } else if (grade === 2) { // Tạm ổn
    rec.level = Math.max(1, rec.level);
    rec.reps++;
  } else if (grade === 3) { // Nhớ tốt
    rec.level = (rec.level || 1) + 1;
    rec.reps++;
  } else if (grade === 4) { // Quá dễ
    rec.level = (rec.level || 1) + 2;
    rec.reps++;
  }
  rec.last = Date.now();
  localStorage.setItem(srsKey, JSON.stringify(rec));

  // Tự động chuyển sang thẻ kế tiếp
  changeFlashcard(1);
}

function getWordSRSRecord(word) {
  try {
    return JSON.parse(localStorage.getItem(`srs_record_${word.toLowerCase()}`));
  } catch (e) {
    return null;
  }
}

// Chế độ Auto-Slideshow (Tự động lướt thẻ)
function toggleFlashcardSlideshow() {
  if (isFcSlideshowRunning) {
    stopFlashcardSlideshow();
  } else {
    startFlashcardSlideshow();
  }
}

function startFlashcardSlideshow() {
  isFcSlideshowRunning = true;
  const btn = document.getElementById('fcBtnSlideshow');
  if (btn) {
    btn.innerHTML = '⏸ Dừng Tự Động';
    btn.className = 'neo-btn px-3 py-1 bg-red-600 text-white text-xs font-extrabold';
  }

  const loop = () => {
    if (!isFcSlideshowRunning) return;
    // Bước 1: Lật thẻ xem đáp án
    toggleFlipCard();
    // Bước 2: Đợi 1/2 khoảng thời gian rồi sang thẻ mới
    setTimeout(() => {
      if (!isFcSlideshowRunning) return;
      changeFlashcard(1);
      fcSlideshowTimer = setTimeout(loop, fcSlideshowInterval);
    }, fcSlideshowInterval / 2);
  };

  fcSlideshowTimer = setTimeout(loop, fcSlideshowInterval / 2);
}

function stopFlashcardSlideshow() {
  isFcSlideshowRunning = false;
  if (fcSlideshowTimer) clearTimeout(fcSlideshowTimer);
  fcSlideshowTimer = null;
  const btn = document.getElementById('fcBtnSlideshow');
  if (btn) {
    btn.innerHTML = '▶️ Tự Động Lướt';
    btn.className = 'neo-btn px-3 py-1 bg-amber-400 text-[#111] text-xs font-extrabold';
  }
}

// ==================== TRÌNH PHÁT AUDIO LIÊN TỤC 100 TỪ (VOCABULARY AUDIO PLAYLIST) ====================
function toggleAudioPlaylist() {
  if (isAudioPlaylistRunning) {
    stopAudioPlaylist();
  } else {
    startAudioPlaylist();
  }
}

function startAudioPlaylist() {
  if (!currentModalWords.length) return;
  isAudioPlaylistRunning = true;
  audioPlaylistIndex = 0;
  updateAudioPlaylistUI(true);
  playNextInAudioPlaylist();
}

function stopAudioPlaylist() {
  isAudioPlaylistRunning = false;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  updateAudioPlaylistUI(false);
  renderModalWords();
}

function playNextInAudioPlaylist() {
  if (!isAudioPlaylistRunning || audioPlaylistIndex >= currentModalWords.length) {
    stopAudioPlaylist();
    return;
  }

  const item = currentModalWords[audioPlaylistIndex];
  renderModalWords(); // Highlight dòng đang đọc

  const trackInfo = document.getElementById('audioPlaylistTrackInfo');
  if (trackInfo) trackInfo.innerText = `#${audioPlaylistIndex + 1}/100: ${item.word} (${item.vi})`;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(item.word);
    u.lang = 'en-US';
    u.rate = audioPlaylistSpeed;
    u.onend = () => {
      if (!isAudioPlaylistRunning) return;
      audioPlaylistIndex++;
      setTimeout(playNextInAudioPlaylist, 1200); // Tạm dừng 1.2s trước từ kế
    };
    u.onerror = () => {
      audioPlaylistIndex++;
      setTimeout(playNextInAudioPlaylist, 1000);
    };
    window.speechSynthesis.speak(u);
  } else {
    audioPlaylistIndex++;
    setTimeout(playNextInAudioPlaylist, 1500);
  }
}

function updateAudioPlaylistUI(running) {
  const btn = document.getElementById('btnToggleAudioPlaylist');
  if (btn) {
    btn.innerText = running ? '⏹ Dừng Nghe' : '🎧 Nghe Liên Tục 100 Từ';
    btn.className = running
      ? 'neo-btn px-3 py-1 bg-red-600 text-white text-xs font-extrabold flex items-center gap-1'
      : 'neo-btn px-3 py-1 bg-[#8C43F6] text-white text-xs font-extrabold flex items-center gap-1';
  }
  const bar = document.getElementById('audioPlaylistBar');
  if (bar) bar.classList.toggle('hidden', !running);
}

function setAudioPlaylistSpeed(speed) {
  audioPlaylistSpeed = speed;
  ['0.8', '1.0', '1.2'].forEach(s => {
    const b = document.getElementById(`audioSpeedBtn-${s}`);
    if (b) {
      b.className = (parseFloat(s) === speed)
        ? 'px-2 py-0.5 bg-[#111] text-white rounded font-mono-code text-[10px] font-bold'
        : 'px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono-code text-[10px] font-bold';
    }
  });
}

// ==================== BẢN IN HỌC TẬP & PDF (PRINTABLE CHEAT SHEET) ====================
function openPrintableSheet() {
  if (!currentModalWords.length) return;
  const title = document.getElementById('previewTitle')?.innerText || `Chủ đề #${activeStt}`;
  const win = window.open('', '_blank');
  if (!win) {
    alert('Trình duyệt đang chặn cửa sổ pop-up. Vui lòng cho phép mở pop-up để xem bản in.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Bản In Từ Vựng: ${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #111; line-height: 1.4; }
        h1 { font-size: 20px; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
        .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f4f4f4; text-transform: uppercase; font-size: 10px; }
        .word { font-weight: bold; color: #1a365d; font-size: 12px; }
        .ipa { font-family: monospace; color: #718096; }
        .vi { color: #22543d; font-weight: bold; }
        .ex { font-size: 10px; color: #4a5568; }
        @media print {
          @page { margin: 1.2cm; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${title} (100 Từ Vựng Chuẩn Anki)</h1>
      <div class="meta">The Anki Dictionary Studio • Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} • Tổng số từ: ${currentModalWords.length}</div>
      <table>
        <thead>
          <tr>
            <th style="width: 30px">#</th>
            <th style="width: 140px">Từ vựng (Noun)</th>
            <th style="width: 100px">Phiên âm IPA</th>
            <th style="width: 120px">Nghĩa Tiếng Việt</th>
            <th>Định nghĩa tiếng Anh & Hai câu ví dụ</th>
          </tr>
        </thead>
        <tbody>
          ${currentModalWords.map(w => `
            <tr>
              <td>${w.index + 1}</td>
              <td class="word">${w.word} ${w.plural ? `<small style="color:#718096">(${w.plural})</small>` : ''}</td>
              <td class="ipa">${w.ipa}</td>
              <td class="vi">${w.vi}</td>
              <td>
                <div><b>${w.definition}</b></div>
                <div class="ex">${w.examples}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// ==================== TAB 3: QUIZ GÕ TỪ KHUYẾT CHỮ ====================
function loadQuizQuestion() {
  if (!currentModalWords.length) return;
  const item = currentModalWords[modalQuizIndex];
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('quizProgressText', `CÂU ${modalQuizIndex + 1}/${currentModalWords.length}`);
  setTxt('quizScoreText', modalQuizScore);
  setTxt('quizClozeHint', item.cloze);
  setTxt('quizMeaningVi', item.vi);
  setTxt('quizDefEn', item.definition);

  const input = document.getElementById('quizUserInput');
  if (input) input.value = '';

  const fb = document.getElementById('quizFeedback');
  if (fb) fb.classList.add('hidden');
}

function checkQuizAnswer() {
  const item = currentModalWords[modalQuizIndex];
  const input = document.getElementById('quizUserInput');
  const ans = (input ? input.value : '').trim().toLowerCase();
  const fb = document.getElementById('quizFeedback');
  if (!fb) return;

  fb.classList.remove('hidden');
  if (ans === item.word.toLowerCase()) {
    modalQuizScore++;
    const scoreText = document.getElementById('quizScoreText');
    if (scoreText) scoreText.innerText = modalQuizScore;
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
  if (currentModalWords.length && currentModalWords[modalQuizIndex]) {
    speakWord(currentModalWords[modalQuizIndex].word);
  }
}

// Phím tắt Flashcard & Modal Hotkeys
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('previewModal');
  if (!modal || modal.classList.contains('hidden')) return;

  // Nếu đang gõ text vào input thì không bắt phím tắt flashcard
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

  const fcView = document.getElementById('modalViewFlashcard');
  const isFcVisible = fcView && !fcView.classList.contains('hidden');

  if (e.key === 'Escape') {
    closePreview();
  } else if (isFcVisible) {
    if (e.code === 'Space') {
      e.preventDefault();
      toggleFlipCard();
    } else if (e.key === 'ArrowLeft') {
      changeFlashcard(-1);
    } else if (e.key === 'ArrowRight') {
      changeFlashcard(1);
    } else if (e.key === '1') {
      rateFlashcardSRS(1); // Again
    } else if (e.key === '2') {
      rateFlashcardSRS(2); // Hard
    } else if (e.key === '3') {
      rateFlashcardSRS(3); // Good
    } else if (e.key === '4') {
      rateFlashcardSRS(4); // Easy
    }
  }
});
