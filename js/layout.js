// ============================================================================
// MODULE: js/layout.js
// Chức năng: Quản lý Bố cục Dùng chung (Shared Layout Injector) cho cả 7 trang HTML
//            Phong cách Swiss Editorial / Pure Typographic — Tuyệt đối 0 Icon/Emoji.
// ============================================================================

function getActivePageFilename() {
  const path = window.location.pathname || '';
  const filename = path.split('/').pop() || 'index.html';
  if (!filename || filename === '' || !filename.endsWith('.html')) return 'index.html';
  return filename.toLowerCase();
}

function getSharedNavbarHTML() {
  return `
  <header class="bg-[#F4F1EA] border-b-2 border-[#111111] sticky top-0 z-40">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <a href="index.html" class="flex items-center gap-3.5 group">
        <div class="w-10 h-10 bg-[#111111] text-white font-mono-code font-extrabold text-sm flex items-center justify-center border-2 border-[#111111] group-hover:bg-[#0F766E] transition">
          AD
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-lg sm:text-xl font-display font-extrabold uppercase tracking-tight text-[#111111]">The Anki Dictionary</h1>
            <span class="tid-badge-num bg-[#EAE5DA] text-[#111111]">EDITION 9-COL</span>
          </div>
          <p class="text-xs font-mono-code text-zinc-600 hidden sm:block">HỆ THỐNG BIÊN SOẠN TỪ VỰNG HỌC THUẬT & ÂM THANH CAMBRIDGE</p>
        </div>
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <span id="syncBadge" class="text-xs font-mono-code font-bold px-3 py-1.5 bg-white text-[#111111] border-2 border-[#111111]">
          TRẠNG THÁI: ĐANG ĐỒNG BỘ...
        </span>
        <button onclick="toggleConsoleDrawer()" class="neo-btn px-3.5 py-1.5 bg-[#111111] text-white text-xs uppercase flex items-center gap-2 relative">
          <span>NHẬT KÝ HỆ THỐNG</span>
          <span id="consoleErrorBadge" class="hidden px-1.5 py-0.5 bg-[#BE123C] text-white text-xs font-mono-code font-extrabold">LỖI</span>
        </button>
        <button onclick="openSettings()" class="neo-btn px-3.5 py-1.5 bg-white text-[#111111] hover:bg-[#EAE5DA] text-xs uppercase">
          CẤU HÌNH API
        </button>
      </div>
    </div>

    <nav class="bg-[#EAE5DA] border-t-2 border-[#111111]">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <a href="index.html" data-nav-page="index.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">01</span> <span>DANH SÁCH & TẠO AI</span>
        </a>
        <a href="grid.html" data-nav-page="grid.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">02</span> <span>BẢN ĐỒ LƯỚI</span>
        </a>
        <a href="studio.html" data-nav-page="studio.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">03</span> <span>STUDIO HỌC & SỬA TỪ</span>
        </a>
        <a href="audio.html" data-nav-page="audio.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">04</span> <span>ÂM THANH CAMBRIDGE</span>
        </a>
        <a href="corpus.html" data-nav-page="corpus.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">05</span> <span>KHO TỪ ĐIỂN TỔNG</span>
        </a>
        <a href="audit.html" data-nav-page="audit.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">06</span> <span>KIỂM TOÁN 9 CỘT</span>
        </a>
        <a href="quiz.html" data-nav-page="quiz.html" class="nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111]">
          <span class="font-mono-code opacity-60">07</span> <span>TRẮC NGHIỆM TỪ VỰNG</span>
        </a>
      </div>
    </nav>
  </header>`;
}

function getSharedLiveRunnerHTML() {
  return `
  <section id="liveRunnerBanner" class="hidden neo-box bg-[#EAE5DA] text-[#111111] p-5 transition-all mb-6">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 bg-[#111111] text-white font-mono-code text-xs font-bold uppercase">TIẾN TRÌNH TRỰC TIẾP</span>
        <h4 id="liveRunnerTitle" class="font-display font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#111111]">
          ĐANG CHẠY TIẾN TRÌNH TẠO TỪ VỰNG...
        </h4>
      </div>
      <div class="flex items-center gap-3 text-xs font-mono-code font-bold">
        <span id="liveRunnerTimer" class="bg-white border-2 border-[#111111] px-2.5 py-1">THỜI GIAN: 00:00</span>
        <button onclick="toggleConsoleDrawer(true)" class="neo-btn bg-[#111111] text-white px-3 py-1 uppercase">
          MỞ NHẬT KÝ
        </button>
      </div>
    </div>

    <div class="w-full h-6 bg-white border-2 border-[#111111] p-0.5 mb-4">
      <div id="liveRunnerBar" class="h-full bg-[#0F766E] transition-all duration-300 flex items-center justify-end pr-2 text-xs font-mono-code font-extrabold text-white" style="width: 15%">15%</div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-code font-bold">
      <div id="stepIndicator1" class="p-2 border-2 border-[#111111] bg-white flex items-center justify-between gap-2">
        <span>01. GỬI LỆNH API</span> <span id="stepIcon1" class="uppercase text-zinc-500">[CHỜ]</span>
      </div>
      <div id="stepIndicator2" class="p-2 border-2 border-[#111111] bg-white/60 flex items-center justify-between gap-2">
        <span>02. MÁY CHỦ</span> <span id="stepIcon2" class="uppercase text-zinc-500">[CHỜ]</span>
      </div>
      <div id="stepIndicator3" class="p-2 border-2 border-[#111111] bg-white/60 flex items-center justify-between gap-2">
        <span>03. SINH 100 TỪ</span> <span id="stepIcon3" class="uppercase text-zinc-500">[CHỜ]</span>
      </div>
      <div id="stepIndicator4" class="p-2 border-2 border-[#111111] bg-white/60 flex items-center justify-between gap-2">
        <span>04. LƯU FILE TXT</span> <span id="stepIcon4" class="uppercase text-zinc-500">[CHỜ]</span>
      </div>
      <div id="stepIndicator5" class="p-2 border-2 border-[#111111] bg-white/60 flex items-center justify-between gap-2">
        <span>05. ĐỒNG BỘ WEB</span> <span id="stepIcon5" class="uppercase text-zinc-500">[CHỜ]</span>
      </div>
    </div>

    <div id="liveWordTrackerBox" class="mt-4 bg-white border-2 border-[#111111] p-4">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-[#111111]">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-[#111111] text-white font-mono-code text-xs font-extrabold">LUỒNG TỪ VỰNG</span>
          <span id="liveTopicNameBadge" class="font-display font-extrabold text-sm text-[#111111]">Đang chuẩn bị chủ đề...</span>
        </div>
        <div class="flex items-center gap-2 font-mono-code text-xs">
          <span id="liveWordCategoryBadge" class="px-2 py-0.5 font-bold border border-[#111111] bg-[#EAE5DA] text-[#111111]">A2-B2 GIAO TIẾP</span>
          <span id="liveWordCounterBadge" class="px-2.5 py-0.5 font-extrabold bg-[#111111] text-white border border-[#111111]">0 / 100 TỪ (0%)</span>
        </div>
      </div>

      <div id="liveCurrentWordCard" class="p-3 bg-[#F4F1EA] border-2 border-[#111111] mb-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-2.5">
            <span class="text-xs font-mono-code font-bold text-zinc-500">ĐANG BIÊN SOẠN:</span>
            <span id="liveCurrentWordName" class="text-lg sm:text-xl font-display font-extrabold text-[#0F766E]">Đang kết nối Gemini AI...</span>
            <span id="liveCurrentWordIpa" class="text-sm font-mono-code font-bold text-[#1D4ED8]"></span>
          </div>
          <span id="liveCurrentWordPlural" class="text-xs font-mono-code text-zinc-600"></span>
        </div>
        <div class="mt-1.5 text-sm font-bold text-[#0F766E]" id="liveCurrentWordVi">Vui lòng đợi trong giây lát...</div>
        <div class="mt-1 text-xs text-zinc-700 italic" id="liveCurrentWordDef"></div>
        <div class="mt-2 pt-2 border-t border-zinc-300 text-xs text-zinc-600 space-y-0.5 font-mono-code">
          <div id="liveCurrentWordEx1"></div>
          <div id="liveCurrentWordEx2"></div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-600 mb-1.5">
          <span>DANH SÁCH TỪ VỰNG VỪA SINH RA TRONG CHỦ ĐỀ NÀY:</span>
          <span>ĐÃ TẠO: <span id="liveStreamedCount">0</span> TỪ</span>
        </div>
        <div id="liveWordChipsContainer" class="max-h-36 overflow-y-auto p-2 bg-[#F4F1EA] border border-[#111111] flex flex-wrap gap-1.5">
          <span class="text-xs text-zinc-500 italic">Các từ vựng mới sinh ra sẽ xuất hiện lần lượt tại đây...</span>
        </div>
      </div>
    </div>
  </section>`;
}

function getSharedPreviewModalHTML() {
  return `
  <div id="previewModal" class="fixed inset-0 bg-black/75 hidden flex items-center justify-center z-50 p-2 sm:p-4">
    <div class="bg-[#F4F1EA] border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-w-7xl w-full max-h-[94vh] flex flex-col overflow-hidden">
      <div class="p-4 sm:p-5 border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-3 bg-[#EAE5DA]">
        <div>
          <div class="flex items-center gap-2">
            <span id="previewBadge" class="px-2.5 py-0.5 bg-[#111111] text-white text-xs font-mono-code font-bold">#1</span>
            <h3 id="previewTitle" class="font-display font-extrabold text-lg text-[#111111] uppercase">Chi tiết chủ đề</h3>
          </div>
          <p id="previewSubText" class="text-xs font-mono-code text-zinc-600 mt-0.5"></p>
        </div>

        <div class="flex items-center bg-white p-1 border-2 border-[#111111]">
          <button onclick="switchPreviewTab('table')" id="pTab-table" class="px-3 py-1.5 text-xs font-bold uppercase bg-[#111111] text-white transition">
            01. BẢNG 9 CỘT & SỬA
          </button>
          <button onclick="switchPreviewTab('flashcard')" id="pTab-flashcard" class="px-3 py-1.5 text-xs font-bold uppercase text-zinc-700 hover:text-black transition">
            02. THẺ 3D FLASHCARD
          </button>
          <button onclick="switchPreviewTab('quiz')" id="pTab-quiz" class="px-3 py-1.5 text-xs font-bold uppercase text-zinc-700 hover:text-black transition">
            03. GÕ TỪ CLOZE
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="togglePlaylistAudio()" id="btnPlaylistAudio" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase">
            PHÁT TỰ ĐỘNG 100 TỪ
          </button>
          <button onclick="printCurrentTopicSheet()" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase">
            IN BẢN PDF / A4
          </button>
          <button id="previewDownloadBtn" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase">
            TẢI FILE .TXT
          </button>
          <button onclick="downloadTopicAudioZip()" id="btnDownloadAudioZip" class="neo-btn px-3 py-1.5 bg-[#0F766E] text-white text-xs uppercase">
            TẢI AUDIO (.ZIP)
          </button>
          <button onclick="closePreviewModal()" class="neo-btn px-3 py-1.5 bg-[#111111] text-white text-xs uppercase">
            ĐÓNG
          </button>
        </div>
      </div>

      <div id="previewTab-table" class="flex-1 overflow-auto flex flex-col">
        <div class="px-4 py-2.5 bg-white border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <input id="previewSearchInput" type="text" oninput="renderPreviewTable()" placeholder="Lọc nhanh từ vựng hoặc nghĩa trong chủ đề này..." class="px-3 py-1.5 text-xs border-2 border-[#111111] w-72 focus:outline-none" />
          </div>
          <div class="flex items-center gap-2">
            <button onclick="toggleEditMode()" id="btnToggleEdit" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase">
              CHẾ ĐỘ CHỈNH SỬA
            </button>
            <button onclick="saveEditedFileToGitHub()" id="btnSaveCloud" class="hidden neo-btn px-3.5 py-1.5 bg-[#0F766E] text-white text-xs uppercase">
              LƯU LÊN GITHUB
            </button>
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-[#EAE5DA] text-[#111111] sticky top-0 z-10 border-b-2 border-[#111111] font-mono-code uppercase">
              <tr>
                <th class="p-3 w-12">STT</th>
                <th class="p-3">TỪ VỰNG & CLOZE</th>
                <th class="p-3">IPA & SOUND</th>
                <th class="p-3">ĐỊNH NGHĨA (EN)</th>
                <th class="p-3">NGHĨA TIẾNG VIỆT</th>
                <th class="p-3">SỐ NHIỀU</th>
                <th class="p-3">2 CÂU VÍ DỤ</th>
              </tr>
            </thead>
            <tbody id="previewTableBody" class="divide-y divide-zinc-200 bg-white"></tbody>
          </table>
        </div>
      </div>

      <div id="previewTab-flashcard" class="hidden flex-1 p-6 bg-[#F4F1EA] flex flex-col items-center justify-center">
        <div class="max-w-xl w-full">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2 text-xs font-mono-code font-bold">
              <span class="px-2.5 py-1 border border-[#111111] bg-white text-[#BE123C]">KHÓ: <strong id="srsCountHard">0</strong></span>
              <span class="px-2.5 py-1 border border-[#111111] bg-white text-[#D97706]">TẠM NHỚ: <strong id="srsCountGood">0</strong></span>
              <span class="px-2.5 py-1 border border-[#111111] bg-white text-[#0F766E]">ĐÃ THUỘC: <strong id="srsCountEasy">0</strong></span>
            </div>
            <button onclick="toggleFlashcardAutoSlide()" id="btnAutoSlide" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs uppercase">
              TỰ ĐỘNG LẬT (3 GIÂY)
            </button>
          </div>

          <div id="flashcardScene" class="flashcard-scene w-full h-80 cursor-pointer" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner relative w-full h-full">
              <div class="flashcard-face absolute inset-0 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-8 flex flex-col items-center justify-center text-center">
                <span id="fcCategoryBadge" class="px-2.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-[#111111] border border-[#111111] mb-3">PHẦN 1: GIAO TIẾP (A2-B2)</span>
                <h2 id="fcWord" class="text-4xl font-display font-extrabold text-[#111111] tracking-tight mb-2">word</h2>
                <div class="flex items-center gap-2 mb-4">
                  <span id="fcIpa" class="font-mono-code text-lg text-[#1D4ED8]">/wɜːrd/</span>
                  <button onclick="speakWord(document.getElementById('fcWord').innerText, event)" class="neo-btn px-2.5 py-1 bg-[#EAE5DA] text-[#111111] text-xs font-mono-code uppercase">PHÁT ÂM</button>
                </div>
                <p id="fcCloze" class="font-mono-code text-sm text-zinc-600 bg-[#F4F1EA] px-3 py-1 border border-[#111111]">w _ _ d</p>
                <p class="text-xs font-mono-code text-zinc-500 mt-6 uppercase">Nhấp vào thẻ hoặc nhấn phím Space để lật mặt sau</p>
              </div>
              <div class="flashcard-face flashcard-back absolute inset-0 bg-[#111111] text-white border-2 border-[#111111] p-7 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-zinc-700 pb-3 mb-3">
                    <span id="fcMeaningVi" class="text-2xl font-display font-extrabold text-[#5EEAD4]">Nghĩa tiếng Việt</span>
                    <span id="fcPlural" class="text-xs font-mono-code bg-zinc-800 px-2.5 py-1 text-zinc-300">Số nhiều: words</span>
                  </div>
                  <p id="fcDefEn" class="text-sm text-zinc-200 italic mb-4">English definition here</p>
                  <div id="fcExamples" class="text-xs text-zinc-300 space-y-1.5 bg-zinc-900 p-3.5 border border-zinc-700 leading-relaxed font-mono-code"></div>
                </div>
                <p class="text-xs font-mono-code text-zinc-400 text-center uppercase">Nhấp vào thẻ để lật lại mặt trước</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-4">
            <button onclick="markSrsStatus('hard')" class="neo-btn py-2 bg-white text-[#BE123C] text-xs uppercase">01. KHÓ NHỚ</button>
            <button onclick="markSrsStatus('good')" class="neo-btn py-2 bg-white text-[#D97706] text-xs uppercase">02. TẠM NHỚ</button>
            <button onclick="markSrsStatus('easy')" class="neo-btn py-2 bg-white text-[#0F766E] text-xs uppercase">03. ĐÃ THUỘC</button>
          </div>

          <div class="flex items-center justify-between mt-4">
            <button onclick="nextFlashcard(-1)" class="neo-btn px-5 py-2.5 bg-white text-[#111111] text-xs uppercase">TỪ TRƯỚC</button>
            <div class="flex items-center gap-3">
              <span id="fcCounter" class="font-mono-code text-sm font-bold text-[#111111]">1 / 100</span>
              <button onclick="shuffleFlashcard()" class="neo-btn px-3 py-1.5 bg-[#EAE5DA] text-[#111111] text-xs uppercase">NGẪU NHIÊN</button>
            </div>
            <button onclick="nextFlashcard(1)" class="neo-btn px-5 py-2.5 bg-[#111111] text-white text-xs uppercase">TỪ TIẾP THEO</button>
          </div>
        </div>
      </div>

      <div id="previewTab-quiz" class="hidden flex-1 p-6 bg-[#F4F1EA] flex flex-col items-center justify-center">
        <div class="max-w-xl w-full neo-box bg-white p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-mono-code font-bold uppercase tracking-wider text-[#111111]">LUYỆN GÕ TỪ VỰNG KHuyết CHỮ (CLOZE TEST)</span>
            <div class="flex items-center gap-2 text-xs font-mono-code font-bold">
              <span class="px-2.5 py-1 bg-[#EAE5DA] text-[#0F766E] border border-[#111111]" id="quizScoreCorrect">ĐÚNG: 0</span>
              <span class="px-2.5 py-1 bg-[#EAE5DA] text-[#BE123C] border border-[#111111]" id="quizScoreWrong">SAI: 0</span>
            </div>
          </div>
          <div class="p-4 bg-[#F4F1EA] border-2 border-[#111111] mb-4">
            <div class="text-xs font-mono-code text-zinc-500 font-bold mb-1 uppercase">NGHĨA TIẾNG VIỆT & ĐỊNH NGHĨA:</div>
            <div id="quizMeaningVi" class="text-lg font-display font-extrabold text-[#0F766E] mb-1">...</div>
            <div id="quizDefEn" class="text-xs text-zinc-700 italic">...</div>
          </div>
          <div class="text-center mb-4">
            <div class="text-xs font-mono-code text-zinc-500 mb-1 uppercase">GỢI Ý KHUYẾT CHỮ & PHIÊN ÂM:</div>
            <div id="quizClozeHint" class="font-mono-code text-2xl font-extrabold text-[#111111] tracking-widest mb-1">_ _ _ _</div>
            <div class="flex items-center justify-center gap-2">
              <span id="quizIpaHint" class="font-mono-code text-sm text-[#1D4ED8]">/ipa/</span>
              <button onclick="speakWord(currentQuizItem?.word || '', event)" class="neo-btn px-2.5 py-1 bg-[#EAE5DA] text-[#111111] text-xs uppercase">PHÁT ÂM GỢI Ý</button>
            </div>
          </div>
          <div class="flex gap-2">
            <input id="quizAnswerInput" type="text" onkeydown="if(event.key==='Enter') checkQuizAnswer()" placeholder="Gõ từ tiếng Anh đầy đủ rồi nhấn Enter..." class="flex-1 px-4 py-2.5 border-2 border-[#111111] font-bold text-[#111111] text-xs focus:outline-none" />
            <button onclick="checkQuizAnswer()" class="neo-btn px-5 py-2.5 bg-[#111111] text-white text-xs uppercase">KIỂM TRA</button>
            <button onclick="revealQuizAnswer()" class="neo-btn px-3 py-2.5 bg-white text-[#111111] text-xs uppercase">ĐÁP ÁN</button>
          </div>
          <div id="quizFeedbackBox" class="hidden mt-4 p-3 border-2 border-[#111111] text-xs font-semibold"></div>
          <div class="mt-4 pt-3 border-t border-zinc-200 flex justify-end">
            <button onclick="nextQuizQuestion()" class="neo-btn px-4 py-2 bg-[#111111] text-white text-xs uppercase">CÂU TIẾP THEO</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function getSharedCommonModalsHTML() {
  return `
  <!-- CONSOLE LOG DRAWER -->
  <div id="consoleDrawer" class="fixed bottom-0 inset-x-0 z-50 bg-[#111111] text-zinc-100 border-t-2 border-[#111111] shadow-2xl transition-transform duration-300 translate-y-full">
    <div class="max-w-[1440px] mx-auto">
      <div class="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 bg-[#0F766E] text-white font-mono-code text-xs font-bold">TERMINAL</span>
          <span class="font-mono-code text-xs font-bold uppercase tracking-wider text-zinc-200">NHẬT KÝ HỆ THỐNG & LỊCH SỬ CHẠY AI</span>
          <span id="consoleLogCount" class="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs font-mono-code">0 BẢN GHI</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadRunLogs()" class="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono-code uppercase transition">TẢI LẠI RUN_LOGS.JSON</button>
          <button onclick="clearConsoleLogs()" class="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono-code uppercase transition">XÓA MÀN HÌNH</button>
          <button onclick="toggleConsoleDrawer(false)" class="px-3 py-1 bg-[#BE123C] text-white text-xs font-mono-code font-bold uppercase transition">THU GỌN</button>
        </div>
      </div>
      <div id="consoleLogContainer" class="h-64 overflow-y-auto p-4 font-mono-code text-xs space-y-1.5 bg-[#111111]"></div>
    </div>
  </div>

  <!-- FLOATING STUDY REMINDER WIDGET -->
  <div id="studyReminderWidget" class="fixed bottom-5 right-5 z-40 hidden max-w-sm bg-white text-[#111111] p-4 border-2 border-[#111111] shadow-[5px_5px_0px_#111111]">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="tid-badge-num">NHẮC NHỞ HỌC TẬP</span>
        <h4 class="font-display font-extrabold text-sm text-[#111111] mt-2 uppercase">Lịch Ôn Tập Từ Vựng Hàng Ngày</h4>
        <p id="studyReminderText" class="text-xs text-zinc-700 mt-1 font-medium">Bạn đã sẵn sàng chinh phục chủ đề từ vựng hôm nay chưa?</p>
      </div>
      <button onclick="dismissStudyReminder()" class="text-zinc-600 hover:text-black text-xs font-mono-code font-extrabold px-2 py-0.5 border border-[#111111]">ĐÓNG</button>
    </div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <a href="quiz.html" class="neo-btn px-3 py-1.5 bg-[#111111] text-white text-xs uppercase">
        VÀO THI TRẮC NGHIỆM
      </a>
    </div>
  </div>

  <!-- SETTINGS MODAL -->
  <div id="settingsModal" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50 p-4">
    <div class="bg-[#F4F1EA] border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-w-md w-full p-6 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#111111]">
        <h3 class="font-display font-extrabold text-lg text-[#111111] uppercase">Cấu Hình Kết Nối API</h3>
        <button onclick="closeSettings()" class="text-xs font-mono-code font-bold px-2 py-1 border border-[#111111] bg-white">ĐÓNG</button>
      </div>
      <div class="space-y-3 text-xs">
        <div class="p-3 bg-white border-2 border-[#111111]">
          <label class="block font-mono-code font-extrabold text-[#111111] mb-1 uppercase">01. Gemini API Key (Tạo từ trực tiếp):</label>
          <input id="geminiKeyInput" type="password" placeholder="AIzaSy..." class="w-full px-3 py-2 border-2 border-[#111111] bg-[#F4F1EA] font-mono-code mb-2" />
          <label class="block font-mono-code font-bold text-[#111111] mb-1 uppercase">Mô Hình Gemini AI:</label>
          <select id="geminiModelSelect" class="w-full px-3 py-2 border-2 border-[#111111] bg-[#F4F1EA] font-bold text-[#111111]">
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Nhanh nhất - Khuyên dùng)</option>
            <option value="gemini-3-flash">Gemini 3 Flash (Cân bằng Tốc độ & Độ sâu)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ổn định cao)</option>
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Siêu nhẹ)</option>
          </select>
        </div>

        <div class="p-3 bg-white border-2 border-[#111111]">
          <label class="block font-mono-code font-extrabold text-[#111111] mb-1 uppercase">02. Google Cloud Run Audio URL (Cambridge MP3):</label>
          <input id="cloudAudioServiceUrl" type="text" placeholder="https://anki-audio-service-918034752495.asia-southeast1.run.app" class="w-full px-3 py-2 border-2 border-[#111111] bg-[#F4F1EA] font-mono-code text-[#111111]" />
          <p class="text-xs text-zinc-600 mt-1">Máy chủ Cloud Run tự động cào 100% phát âm chuẩn Cambridge Dictionary US/UK.</p>
        </div>

        <div class="p-3 bg-white border-2 border-[#111111] space-y-2">
          <div>
            <label class="block font-mono-code font-bold text-[#111111] mb-1 uppercase">03. Chủ sở hữu GitHub (Owner):</label>
            <input id="ghOwner" type="text" placeholder="lev24197" class="w-full px-3 py-2 border-2 border-[#111111] font-mono-code bg-[#F4F1EA]" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-[#111111] mb-1 uppercase">Tên Repository:</label>
            <input id="ghRepo" type="text" placeholder="vinhdeptrai" class="w-full px-3 py-2 border-2 border-[#111111] font-mono-code bg-[#F4F1EA]" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-[#111111] mb-1 uppercase">Nhánh (Branch):</label>
            <input id="ghBranch" type="text" value="main" class="w-full px-3 py-2 border-2 border-[#111111] font-mono-code bg-[#F4F1EA]" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-[#111111] mb-1 uppercase">GitHub Personal Access Token (PAT):</label>
            <input id="ghToken" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" class="w-full px-3 py-2 border-2 border-[#111111] font-mono-code bg-[#F4F1EA]" />
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button onclick="closeSettings()" class="neo-btn px-4 py-2 bg-white text-[#111111] text-xs uppercase">HỦY</button>
        <button onclick="saveSettings()" class="neo-btn px-4 py-2 bg-[#111111] text-white text-xs uppercase">LƯU CẤU HÌNH</button>
      </div>
    </div>
  </div>`;
}

function initSharedLayout() {
  const navMount = document.getElementById('sharedNavbarMount');
  if (navMount) {
    navMount.innerHTML = getSharedNavbarHTML();
  }

  const activePage = getActivePageFilename();
  document.querySelectorAll('.nav-page-link').forEach(link => {
    const target = (link.getAttribute('data-nav-page') || '').toLowerCase();
    if (target === activePage) {
      link.className = 'nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-[#111111] text-white';
    } else {
      link.className = 'nav-page-link neo-btn px-3.5 py-1.5 text-xs uppercase whitespace-nowrap flex items-center gap-2 bg-white text-[#111111] hover:bg-[#F4F1EA]';
    }
  });

  const runnerMount = document.getElementById('sharedLiveRunnerMount');
  if (runnerMount && !document.getElementById('liveRunnerBanner')) {
    runnerMount.innerHTML = getSharedLiveRunnerHTML();
  }

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
