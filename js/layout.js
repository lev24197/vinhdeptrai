// ============================================================================
// MODULE: js/layout.js
// Chức năng: Quản lý Bố cục Dùng chung (Shared Layout Injector) cho cả 7 trang HTML:
//            - Header & Thanh Điều Hướng 7 Trang (Navbar)
//            - Thanh Tiến Trình AI Real-time (Live Runner Banner)
//            - Ngăn kéo Nhật ký (Console Drawer), Nhắc nhở Ôn tập,
//              Hộp thoại Cấu hình API (Settings Modal) & Preview Studio Modal.
// ============================================================================

function getActivePageFilename() {
  const path = window.location.pathname || '';
  const filename = path.split('/').pop() || 'index.html';
  if (!filename || filename === '' || !filename.endsWith('.html')) return 'index.html';
  return filename.toLowerCase();
}

function getSharedNavbarHTML() {
  return `
  <header class="bg-[#F6F4EE] border-b-[3px] border-[#141414] sticky top-0 z-40">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <a href="index.html" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-lg bg-[#169C64] text-white font-display font-extrabold text-xl flex items-center justify-center border-2 border-[#141414] shadow-[2px_2px_0px_#141414] group-hover:bg-[#FF9F1C] group-hover:text-[#141414] transition">
          D
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-display font-extrabold tracking-tight text-[#141414]">The Anki Dictionary</h1>
            <span class="tid-badge-num bg-[#FFE787] text-[#141414] font-mono-code">1000 TOPICS</span>
          </div>
          <p class="text-[11px] font-medium text-slate-600 hidden sm:block">Hệ Thống Quản Trị 100.000 Từ Vựng Chuẩn Anki & Âm Thanh Cambridge MP3</p>
        </div>
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <span id="syncBadge" class="text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-white text-[#141414] border-2 border-[#141414] shadow-[2px_2px_0px_#141414]">
          ⏳ Đang đồng bộ...
        </span>
        <button onclick="toggleConsoleDrawer()" class="neo-btn px-3.5 py-1.5 rounded-full bg-[#141414] text-white text-xs font-bold flex items-center gap-1.5 relative">
          <span>🖥️ Nhật ký & Log</span>
          <span id="consoleErrorBadge" class="hidden px-1.5 py-0.2 bg-[#F05332] text-white rounded-full text-[10px] font-extrabold animate-bounce">!</span>
        </button>
        <button onclick="openSettings()" class="neo-btn px-3.5 py-1.5 rounded-full bg-[#FFE787] text-[#141414] text-xs font-bold flex items-center gap-1.5">
          ⚙️ Cấu hình API
        </button>
      </div>
    </div>

    <nav class="bg-[#EFECE6] border-t-2 border-[#141414]">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <a href="index.html" data-nav-page="index.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          📋 1. Danh Sách & Tạo AI
        </a>
        <a href="grid.html" data-nav-page="grid.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          🟩 2. Bản Đồ 1.000 Ô
        </a>
        <a href="studio.html" data-nav-page="studio.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          🎓 3. Studio Học & Sửa Từ
        </a>
        <a href="audio.html" data-nav-page="audio.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          🔊 4. Âm Thanh Cambridge MP3
        </a>
        <a href="corpus.html" data-nav-page="corpus.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          📚 5. Kho Từ Điển Tổng
        </a>
        <a href="audit.html" data-nav-page="audit.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          🛡️ 6. Kiểm Toán 9 Cột
        </a>
        <a href="quiz.html" data-nav-page="quiz.html" class="nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414]">
          🎯 7. Trắc Nghiệm Từ Vựng
        </a>
      </div>
    </nav>
  </header>`;
}

function getSharedLiveRunnerHTML() {
  return `
  <section id="liveRunnerBanner" class="hidden neo-box bg-[#FFE787] text-[#141414] p-5 transition-all mb-6">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
      <div class="flex items-center gap-3">
        <span class="relative flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F05332] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-[#F05332] border border-[#111]"></span>
        </span>
        <h4 id="liveRunnerTitle" class="font-display font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#141414]">
          ⚡ ĐANG CHẠY TIẾN TRÌNH TẠO TỪ VỰNG...
        </h4>
      </div>
      <div class="flex items-center gap-3 text-xs font-mono-code font-bold">
        <span id="liveRunnerTimer" class="bg-white border-2 border-[#111] px-2.5 py-1 shadow-[2px_2px_0px_#111]">⏱ 00:00</span>
        <button onclick="toggleConsoleDrawer(true)" class="neo-btn bg-[#141414] text-white px-3 py-1">
          Xem Chi Tiết Log
        </button>
      </div>
    </div>

    <div class="w-full h-6 bg-white border-2 border-[#111] p-0.5 shadow-[2px_2px_0px_#111] mb-4">
      <div id="liveRunnerBar" class="h-full bg-[#169C64] transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-mono-code font-extrabold text-white" style="width: 15%">15%</div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-code font-bold">
      <div id="stepIndicator1" class="p-2 border-2 border-[#111] bg-white flex items-center gap-2">
        <span id="stepIcon1">⏳</span> <span>1. Gửi lệnh API</span>
      </div>
      <div id="stepIndicator2" class="p-2 border-2 border-[#111] bg-white/60 flex items-center gap-2">
        <span id="stepIcon2">⚪</span> <span>2. Khởi tạo máy chủ</span>
      </div>
      <div id="stepIndicator3" class="p-2 border-2 border-[#111] bg-white/60 flex items-center gap-2">
        <span id="stepIcon3">⚪</span> <span>3. AI Sinh 100 từ</span>
      </div>
      <div id="stepIndicator4" class="p-2 border-2 border-[#111] bg-white/60 flex items-center gap-2">
        <span id="stepIcon4">⚪</span> <span>4. Lưu file .TXT</span>
      </div>
      <div id="stepIndicator5" class="p-2 border-2 border-[#111] bg-white/60 flex items-center gap-2">
        <span id="stepIcon5">⚪</span> <span>5. Đồng bộ Web</span>
      </div>
    </div>

    <div id="liveWordTrackerBox" class="mt-4 bg-white border-2 border-[#111] p-4 shadow-[3px_3px_0px_#111]">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-[#111]">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-[#141414] text-[#FFE787] font-mono-code text-xs font-extrabold">LIVE WORD STREAM</span>
          <span id="liveTopicNameBadge" class="font-display font-extrabold text-sm text-[#141414]">Đang chuẩn bị chủ đề...</span>
        </div>
        <div class="flex items-center gap-2 font-mono-code text-xs">
          <span id="liveWordCategoryBadge" class="px-2 py-0.5 font-bold border border-[#111] bg-emerald-100 text-emerald-900">A2-B2 Giao tiếp</span>
          <span id="liveWordCounterBadge" class="px-2.5 py-0.5 font-extrabold bg-[#FF9F1C] text-[#111] border border-[#111]">0 / 100 từ (0%)</span>
        </div>
      </div>

      <div id="liveCurrentWordCard" class="p-3 bg-[#F6F4EE] border-2 border-[#111] mb-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-2.5">
            <span class="text-xs font-mono-code font-bold text-slate-500">ĐANG TẠO:</span>
            <span id="liveCurrentWordName" class="text-lg sm:text-xl font-display font-extrabold text-[#169C64]">Đang kết nối Gemini AI...</span>
            <span id="liveCurrentWordIpa" class="text-sm font-mono-code font-bold text-indigo-700"></span>
          </div>
          <span id="liveCurrentWordPlural" class="text-xs font-mono-code text-slate-600"></span>
        </div>
        <div class="mt-1.5 text-sm font-bold text-emerald-800" id="liveCurrentWordVi">Vui lòng đợi trong giây lát...</div>
        <div class="mt-1 text-xs text-slate-700 italic" id="liveCurrentWordDef"></div>
        <div class="mt-2 pt-2 border-t border-slate-300 text-[11px] text-slate-600 space-y-0.5 font-mono-code">
          <div id="liveCurrentWordEx1"></div>
          <div id="liveCurrentWordEx2"></div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between text-[11px] font-mono-code font-bold text-slate-600 mb-1.5">
          <span>DANH SÁCH TỪ VỰNG VỪA SINH RA TRONG CHỦ ĐỀ NÀY:</span>
          <span>Cuộn để xem (<span id="liveStreamedCount">0</span> từ)</span>
        </div>
        <div id="liveWordChipsContainer" class="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-[#111] flex flex-wrap gap-1.5">
          <span class="text-xs text-slate-400 italic">Các từ vựng mới sinh ra sẽ xuất hiện lần lượt tại đây...</span>
        </div>
      </div>
    </div>
  </section>`;
}

function getSharedPreviewModalHTML() {
  return `
  <div id="previewModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm hidden flex items-center justify-center z-50 p-2 sm:p-4">
    <div class="bg-[#F6F4EE] border-[3px] border-[#141414] rounded-xl shadow-[8px_8px_0px_#141414] max-w-7xl w-full max-h-[94vh] flex flex-col overflow-hidden">
      <div class="p-4 sm:p-5 border-b-2 border-[#141414] flex flex-wrap items-center justify-between gap-3 bg-[#EFECE6]">
        <div>
          <div class="flex items-center gap-2">
            <span id="previewBadge" class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-mono-code font-bold">#1</span>
            <h3 id="previewTitle" class="font-extrabold text-lg text-slate-900">Chi tiết chủ đề</h3>
          </div>
          <p id="previewSubText" class="text-xs text-slate-500 mt-0.5"></p>
        </div>

        <div class="flex items-center bg-white p-1 rounded-lg border-2 border-[#141414]">
          <button onclick="switchPreviewTab('table')" id="pTab-table" class="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-600 text-white transition">
            📑 Bảng 9 Cột & Sửa
          </button>
          <button onclick="switchPreviewTab('flashcard')" id="pTab-flashcard" class="px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 transition">
            🗂️ Lật Thẻ 3D Flashcard
          </button>
          <button onclick="switchPreviewTab('quiz')" id="pTab-quiz" class="px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 transition">
            ✍️ Luyện Gõ Từ Cloze
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="togglePlaylistAudio()" id="btnPlaylistAudio" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition">
            📻 Nghe tự động 100 từ
          </button>
          <button onclick="printCurrentTopicSheet()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
            🖨️ In PDF / A4
          </button>
          <button id="previewDownloadBtn" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition">
            ⬇ Tải .TXT
          </button>
          <button onclick="downloadTopicAudioZip()" id="btnDownloadAudioZip" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition">
            🔊 Tải Audio (.ZIP)
          </button>
          <button onclick="closePreviewModal()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition">
            ✕ Đóng
          </button>
        </div>
      </div>

      <div id="previewTab-table" class="flex-1 overflow-auto flex flex-col">
        <div class="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <input id="previewSearchInput" type="text" oninput="renderPreviewTable()" placeholder="🔍 Lọc nhanh từ vựng hoặc nghĩa trong chủ đề này..." class="px-3 py-1 text-xs rounded-lg border border-slate-300 w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="flex items-center gap-2">
            <button onclick="toggleEditMode()" id="btnToggleEdit" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition">
              ✏️ Bật chế độ Chỉnh sửa
            </button>
            <button onclick="saveEditedFileToGitHub()" id="btnSaveCloud" class="hidden px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition">
              ☁️ Lưu trực tiếp lên GitHub
            </button>
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-100 text-slate-600 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th class="p-3 w-10">#</th>
                <th class="p-3">Từ vựng & Cloze</th>
                <th class="p-3">IPA & Sound</th>
                <th class="p-3">Định nghĩa (EN)</th>
                <th class="p-3">Nghĩa Tiếng Việt</th>
                <th class="p-3">Số nhiều</th>
                <th class="p-3">2 Câu Ví dụ</th>
              </tr>
            </thead>
            <tbody id="previewTableBody" class="divide-y divide-slate-200 bg-white"></tbody>
          </table>
        </div>
      </div>

      <div id="previewTab-flashcard" class="hidden flex-1 p-6 bg-slate-100 flex flex-col items-center justify-center">
        <div class="max-w-xl w-full">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700">Khó: <strong id="srsCountHard">0</strong></span>
              <span class="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">Tạm nhớ: <strong id="srsCountGood">0</strong></span>
              <span class="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700">Đã thuộc: <strong id="srsCountEasy">0</strong></span>
            </div>
            <button onclick="toggleFlashcardAutoSlide()" id="btnAutoSlide" class="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition">
              ▶️ Tự động lật & chuyển (3s)
            </button>
          </div>

          <div id="flashcardScene" class="flashcard-scene w-full h-80 cursor-pointer" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner relative w-full h-full">
              <div class="flashcard-face absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-8 flex flex-col items-center justify-center text-center">
                <span id="fcCategoryBadge" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">PHẦN 1: GIAO TIẾP (A2-B2)</span>
                <h2 id="fcWord" class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">word</h2>
                <div class="flex items-center gap-2 mb-4">
                  <span id="fcIpa" class="font-mono-code text-lg text-indigo-600">/wɜːrd/</span>
                  <button onclick="speakWord(document.getElementById('fcWord').innerText, event)" class="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition">🔊</button>
                </div>
                <p id="fcCloze" class="font-mono-code text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded border border-slate-200">w _ _ d</p>
                <p class="text-[11px] text-slate-400 mt-6">👆 Bấm vào thẻ hoặc nhấn phím Space để lật xem nghĩa & ví dụ</p>
              </div>
              <div class="flashcard-face flashcard-back absolute inset-0 bg-slate-900 text-white rounded-2xl shadow-lg p-7 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                    <span id="fcMeaningVi" class="text-2xl font-extrabold text-emerald-400">Nghĩa tiếng Việt</span>
                    <span id="fcPlural" class="text-xs font-mono-code bg-slate-800 px-2.5 py-1 rounded text-slate-300">Số nhiều: words</span>
                  </div>
                  <p id="fcDefEn" class="text-sm text-slate-200 italic mb-4">English definition here</p>
                  <div id="fcExamples" class="text-xs text-slate-300 space-y-1.5 bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 leading-relaxed"></div>
                </div>
                <p class="text-[11px] text-slate-400 text-center">👆 Bấm vào thẻ để lật lại mặt trước</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-4">
            <button onclick="markSrsStatus('hard')" class="py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition">😓 Khó nhớ (Ôn lại)</button>
            <button onclick="markSrsStatus('good')" class="py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition">🤔 Tạm nhớ</button>
            <button onclick="markSrsStatus('easy')" class="py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition">⚡ Đã thuộc làu</button>
          </div>

          <div class="flex items-center justify-between mt-4">
            <button onclick="nextFlashcard(-1)" class="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow border border-slate-200 transition">← Từ trước</button>
            <div class="flex items-center gap-3">
              <span id="fcCounter" class="font-mono-code text-sm font-bold text-slate-700">1 / 100</span>
              <button onclick="shuffleFlashcard()" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition">🔀 Ngẫu nhiên</button>
            </div>
            <button onclick="nextFlashcard(1)" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition">Từ tiếp theo →</button>
          </div>
        </div>
      </div>

      <div id="previewTab-quiz" class="hidden flex-1 p-6 bg-slate-100 flex flex-col items-center justify-center">
        <div class="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">✍️ Thử thách Gõ Từ Vựng (Cloze Test)</span>
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md" id="quizScoreCorrect">Đúng: 0</span>
              <span class="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md" id="quizScoreWrong">Sai: 0</span>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
            <div class="text-xs text-slate-400 font-semibold mb-1">Nghĩa Tiếng Việt & Định nghĩa:</div>
            <div id="quizMeaningVi" class="text-lg font-extrabold text-emerald-700 mb-1">...</div>
            <div id="quizDefEn" class="text-xs text-slate-600 italic">...</div>
          </div>
          <div class="text-center mb-4">
            <div class="text-xs text-slate-400 mb-1">Gợi ý khuyết chữ (Cloze) & Phiên âm:</div>
            <div id="quizClozeHint" class="font-mono-code text-2xl font-extrabold text-slate-800 tracking-widest mb-1">_ _ _ _</div>
            <div class="flex items-center justify-center gap-2">
              <span id="quizIpaHint" class="font-mono-code text-sm text-indigo-600">/ipa/</span>
              <button onclick="speakWord(currentQuizItem?.word || '', event)" class="px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">🔊 Nghe gợi ý</button>
            </div>
          </div>
          <div class="flex gap-2">
            <input id="quizAnswerInput" type="text" onkeydown="if(event.key==='Enter') checkQuizAnswer()" placeholder="Gõ từ tiếng Anh đầy đủ rồi nhấn Enter..." class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onclick="checkQuizAnswer()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition">Kiểm tra</button>
            <button onclick="revealQuizAnswer()" class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition">Xem đáp án</button>
          </div>
          <div id="quizFeedbackBox" class="hidden mt-4 p-3 rounded-xl text-xs font-semibold"></div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button onclick="nextQuizQuestion()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition">Câu hỏi tiếp theo →</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function getSharedCommonModalsHTML() {
  return `
  <!-- CONSOLE LOG DRAWER -->
  <div id="consoleDrawer" class="fixed bottom-0 inset-x-0 z-50 bg-slate-950 text-slate-100 border-t-2 border-indigo-500 shadow-2xl transition-transform duration-300 translate-y-full">
    <div class="max-w-[1440px] mx-auto">
      <div class="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-mono-code text-xs font-bold uppercase tracking-wider text-indigo-400">🖥️ Terminal Nhật Ký Hệ Thống & Lịch Sử Chạy AI</span>
          <span id="consoleLogCount" class="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-mono-code">0 bản ghi</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadRunLogs()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition">🔄 Tải lại run_logs.json</button>
          <button onclick="clearConsoleLogs()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold transition">🗑️ Xóa màn hình</button>
          <button onclick="toggleConsoleDrawer(false)" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition">✕ Thu gọn</button>
        </div>
      </div>
      <div id="consoleLogContainer" class="h-64 overflow-y-auto p-4 font-mono-code text-xs space-y-1.5 bg-slate-950"></div>
    </div>
  </div>

  <!-- FLOATING STUDY REMINDER WIDGET -->
  <div id="studyReminderWidget" class="fixed bottom-5 right-5 z-40 hidden max-w-sm bg-[#FFE787] text-[#141414] rounded-xl p-4 border-[3px] border-[#141414] shadow-[5px_5px_0px_#141414]">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">⏰</span>
        <div>
          <h4 class="font-display font-extrabold text-sm text-[#141414]">Nhắc Nhở Ôn Tập Hôm Nay!</h4>
          <p id="studyReminderText" class="text-xs text-slate-800 mt-0.5 font-medium">Bạn đã sẵn sàng chinh phục chủ đề từ vựng hôm nay chưa?</p>
        </div>
      </div>
      <button onclick="dismissStudyReminder()" class="text-slate-700 hover:text-black text-xs font-extrabold px-1.5 py-0.5">✕</button>
    </div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <a href="quiz.html" class="neo-btn px-3 py-1.5 bg-[#169C64] text-white rounded-lg text-xs font-extrabold">
        🎯 Vào Thi Trắc Nghiệm Ngay
      </a>
    </div>
  </div>

  <!-- SETTINGS MODAL -->
  <div id="settingsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
    <div class="bg-[#F6F4EE] border-[3px] border-[#141414] rounded-xl shadow-[8px_8px_0px_#141414] max-w-md w-full p-6 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display font-extrabold text-lg text-[#141414]">⚙️ Cấu Hình Kết Nối API</h3>
        <button onclick="closeSettings()" class="text-slate-500 hover:text-black font-bold">✕</button>
      </div>
      <div class="space-y-3 text-xs">
        <div class="p-3 bg-indigo-50 border-2 border-indigo-300 rounded-xl">
          <label class="block font-extrabold text-indigo-950 mb-1">⚡ Gemini API Key (Tạo trực tiếp trên trình duyệt):</label>
          <input id="geminiKeyInput" type="password" placeholder="AIzaSy..." class="w-full px-3 py-2 rounded-lg border border-indigo-300 bg-white font-mono-code mb-2" />
          <label class="block font-bold text-indigo-900 mb-1">🤖 Chọn Mô Hình Gemini AI:</label>
          <select id="geminiModelSelect" class="w-full px-3 py-2 rounded-lg border border-indigo-300 bg-white font-bold text-indigo-950">
            <option value="gemini-3.1-flash-lite">⚡ Gemini 3.1 Flash Lite (Nhanh nhất - Khuyên dùng)</option>
            <option value="gemini-3-flash">🚀 Gemini 3 Flash (Cân bằng Tốc độ & Độ sâu)</option>
            <option value="gemini-2.5-flash">💎 Gemini 2.5 Flash (Ổn định cao)</option>
            <option value="gemini-2.5-flash-lite">🪶 Gemini 2.5 Flash Lite (Siêu nhẹ)</option>
          </select>
        </div>

        <div class="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
          <label class="block font-extrabold text-emerald-950 mb-1">🔊 Google Cloud Run Audio Service URL (Cambridge MP3):</label>
          <input id="cloudAudioServiceUrl" type="text" placeholder="https://anki-audio-service-918034752495.asia-southeast1.run.app" class="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white font-mono-code text-emerald-950" />
          <p class="text-[11px] text-emerald-700 mt-1">Máy chủ Cloud Run tự động cào 100% phát âm chuẩn Cambridge Dictionary US/UK.</p>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Chủ sở hữu GitHub (Owner / Username):</label>
          <input id="ghOwner" type="text" placeholder="VD: lev24197" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-code bg-white" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tên Repository:</label>
          <input id="ghRepo" type="text" placeholder="VD: vinhdeptrai" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-code bg-white" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nhánh (Branch):</label>
          <input id="ghBranch" type="text" value="main" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-code bg-white" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">GitHub Personal Access Token (PAT - quyền repo & workflow):</label>
          <input id="ghToken" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-code bg-white" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button onclick="closeSettings()" class="neo-btn px-4 py-2 rounded-lg bg-white text-slate-700 text-xs font-bold">Hủy</button>
        <button onclick="saveSettings()" class="neo-btn px-4 py-2 rounded-lg bg-[#169C64] text-white text-xs font-bold">Lưu cấu hình</button>
      </div>
    </div>
  </div>`;
}

function initSharedLayout() {
  // 1. Gắn Navbar dùng chung nếu có #sharedNavbarMount
  const navMount = document.getElementById('sharedNavbarMount');
  if (navMount) {
    navMount.innerHTML = getSharedNavbarHTML();
  }

  // 2. Highlight trang đang mở trên thanh điều hướng
  const activePage = getActivePageFilename();
  document.querySelectorAll('.nav-page-link').forEach(link => {
    const target = (link.getAttribute('data-nav-page') || '').toLowerCase();
    if (target === activePage) {
      link.className = 'nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-[#169C64] text-white shadow-[2px_2px_0px_#141414]';
    } else {
      link.className = 'nav-page-link neo-btn px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 bg-white text-[#141414] hover:bg-[#FFE787]';
    }
  });

  // 3. Gắn Live Runner Banner nếu có #sharedLiveRunnerMount và chưa có #liveRunnerBanner
  const runnerMount = document.getElementById('sharedLiveRunnerMount');
  if (runnerMount && !document.getElementById('liveRunnerBanner')) {
    runnerMount.innerHTML = getSharedLiveRunnerHTML();
  }

  // 4. Gắn các Modal dùng chung nếu có #sharedModalsMount
  const modalsMount = document.getElementById('sharedModalsMount');
  if (modalsMount) {
    let html = '';
    if (!document.getElementById('previewModal')) {
      html += getSharedPreviewModalHTML();
    }
    if (!document.getElementById('settingsModal')) {
      html += getSharedCommonModalsHTML();
    }
    modalsMount.innerHTML = html;
  }
}
