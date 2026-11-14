// ============================================================================
// MODULE: js/layout.js
// Chức năng: Quản lý Bố cục Dùng chung (Shared Layout Injector) cho cả 8 trang HTML
//            Phong cách Modern Clean SaaS • Glassmorphism • Fixed Mobile Bottom Bar
// ============================================================================

function getActivePageFilename() {
  const path = window.location.pathname || '';
  const filename = path.split('/').pop() || 'index.html';
  if (!filename || filename === '' || !filename.endsWith('.html')) return 'index.html';
  return filename.toLowerCase();
}

function getSharedNavbarHTML() {
  return `
  <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all duration-200">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <a href="index.html" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-mono-code font-bold text-sm flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
          AD
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-lg sm:text-xl font-display font-extrabold tracking-tight text-slate-900">The Anki Dictionary</h1>
            <span class="tid-badge-num bg-indigo-50 text-indigo-700 border border-indigo-200/60">EDITION 9-COL</span>
          </div>
          <p class="text-xs font-medium text-slate-500 hidden sm:block">HỆ THỐNG BIÊN SOẠN TỪ VỰNG HỌC THUẬT & ÂM THANH CAMBRIDGE</p>
        </div>
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <span id="syncBadge" class="text-xs font-mono-code font-semibold px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-full flex items-center gap-1.5 shadow-2xs">
          TRẠNG THÁI: ĐANG ĐỒNG BỘ...
        </span>
        <button onclick="toggleConsoleDrawer()" class="neo-btn px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
          <span>NHẬT KÝ HỆ THỐNG</span>
          <span id="consoleErrorBadge" class="hidden px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-mono-code font-extrabold rounded-full">LỖI</span>
        </button>
      </div>
    </div>

    <!-- Thanh Điều Hướng 8 Trang Chức Năng Riêng Biệt (Desktop Pill Tabs) -->
    <nav class="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <a href="index.html" data-nav-page="index.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">01</span> <span>DANH SÁCH & TẠO AI</span>
        </a>
        <a href="grid.html" data-nav-page="grid.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">02</span> <span>BẢN ĐỒ LƯỚI</span>
        </a>
        <a href="studio.html" data-nav-page="studio.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">03</span> <span>STUDIO HỌC & SỬA TỪ</span>
        </a>
        <a href="audio.html" data-nav-page="audio.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">04</span> <span>ÂM THANH CAMBRIDGE</span>
        </a>
        <a href="corpus.html" data-nav-page="corpus.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">05</span> <span>KHO TỪ ĐIỂN TỔNG</span>
        </a>
        <a href="audit.html" data-nav-page="audit.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">06</span> <span>KIỂM TOÁN 9 CỘT</span>
        </a>
        <a href="quiz.html" data-nav-page="quiz.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">07</span> <span>TRẮC NGHIỆM TỪ VỰNG</span>
        </a>
        <a href="stats.html" data-nav-page="stats.html" class="nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150">
          <span class="font-mono-code opacity-70 text-[11px]">08</span> <span>THỐNG KÊ ANKI FSRS</span>
        </a>
      </div>
    </nav>

    <!-- FIXED MOBILE BOTTOM NAVIGATION BAR (1-Tap Quick Jump Buttons) -->
    <nav id="mobileBottomNav" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 sm:hidden flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <a href="index.html" data-mobile-nav="index.html" class="mobile-nav-link flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span class="text-[10px] font-semibold whitespace-nowrap">01 Tạo từ</span>
      </a>
      <a href="grid.html" data-mobile-nav="grid.html" class="mobile-nav-link flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
        <span class="text-[10px] font-semibold whitespace-nowrap">02 Lưới</span>
      </a>
      <a href="studio.html" data-mobile-nav="studio.html" class="mobile-nav-link flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
        <span class="text-[10px] font-semibold whitespace-nowrap">03 Studio</span>
      </a>
      <a href="quiz.html" data-mobile-nav="quiz.html" class="mobile-nav-link flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-[10px] font-semibold whitespace-nowrap">07 Quiz</span>
      </a>
      <a href="stats.html" data-mobile-nav="stats.html" class="mobile-nav-link flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
        <span class="text-[10px] font-semibold whitespace-nowrap">08 Thống kê</span>
      </a>
    </nav>
  </header>`;
}

function getSharedLiveRunnerHTML() {
  return `
  <section id="liveRunnerBanner" class="hidden bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all mb-6">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
      <div class="flex items-center gap-3">
        <span class="px-2.5 py-0.5 bg-indigo-600 text-white font-mono-code text-xs font-bold uppercase rounded-full">TIẾN TRÌNH TRỰC TIẾP</span>
        <h4 id="liveRunnerTitle" class="font-display font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
          ĐANG CHẠY TIẾN TRÌNH TẠO TỪ VỰNG...
        </h4>
      </div>
      <div class="flex items-center gap-3 text-xs font-mono-code font-bold">
        <span id="liveRunnerTimer" class="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-slate-700">THỜI GIAN: 00:00</span>
        <button onclick="toggleConsoleDrawer(true)" class="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 uppercase rounded-lg shadow-sm text-xs font-medium">
          MỞ NHẬT KÝ
        </button>
      </div>
    </div>

    <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 mb-4 border border-slate-200/60">
      <div id="liveRunnerBar" class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-mono-code font-extrabold text-white" style="width: 15%">15%</div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-code font-bold">
      <div id="stepIndicator1" class="p-2.5 border border-slate-200 rounded-xl bg-white shadow-2xs flex items-center justify-between gap-2">
        <span class="text-slate-800">01. GỬI LỆNH API</span> <span id="stepIcon1" class="uppercase text-slate-400">[CHỜ]</span>
      </div>
      <div id="stepIndicator2" class="p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/70 flex items-center justify-between gap-2">
        <span class="text-slate-600">02. MÁY CHỦ</span> <span id="stepIcon2" class="uppercase text-slate-400">[CHỜ]</span>
      </div>
      <div id="stepIndicator3" class="p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/70 flex items-center justify-between gap-2">
        <span class="text-slate-600">03. SINH 100 TỪ</span> <span id="stepIcon3" class="uppercase text-slate-400">[CHỜ]</span>
      </div>
      <div id="stepIndicator4" class="p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/70 flex items-center justify-between gap-2">
        <span class="text-slate-600">04. LƯU FILE TXT</span> <span id="stepIcon4" class="uppercase text-slate-400">[CHỜ]</span>
      </div>
      <div id="stepIndicator5" class="p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/70 flex items-center justify-between gap-2">
        <span class="text-slate-600">05. ĐỒNG BỘ WEB</span> <span id="stepIcon5" class="uppercase text-slate-400">[CHỜ]</span>
      </div>
    </div>

    <div id="liveWordTrackerBox" class="mt-4 bg-slate-50/70 rounded-xl border border-slate-200/80 p-4">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-indigo-600 text-white font-mono-code text-xs font-bold rounded-full">LUỒNG TỪ VỰNG</span>
          <span id="liveTopicNameBadge" class="font-display font-bold text-sm text-slate-900">Đang chuẩn bị chủ đề...</span>
        </div>
        <div class="flex items-center gap-2 font-mono-code text-xs">
          <span id="liveWordCategoryBadge" class="px-2.5 py-0.5 font-bold border border-slate-200 bg-white text-slate-700 rounded-full">A2-B2 GIAO TIẾP</span>
          <span id="liveWordCounterBadge" class="px-2.5 py-0.5 font-extrabold bg-slate-900 text-white rounded-full">0 / 100 TỪ (0%)</span>
        </div>
      </div>

      <div id="liveCurrentWordCard" class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs mb-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-2.5">
            <span class="text-xs font-mono-code font-bold text-slate-400">ĐANG BIÊN SOẠN:</span>
            <span id="liveCurrentWordName" class="text-lg sm:text-xl font-display font-bold text-indigo-600">Đang kết nối Gemini AI...</span>
            <span id="liveCurrentWordIpa" class="text-sm font-mono-code font-bold text-teal-600"></span>
          </div>
          <span id="liveCurrentWordPlural" class="text-xs font-mono-code text-slate-500"></span>
        </div>
        <div class="mt-1.5 text-sm font-bold text-emerald-700" id="liveCurrentWordVi">Vui lòng đợi trong giây lát...</div>
        <div class="mt-1 text-xs text-slate-600 italic" id="liveCurrentWordDef"></div>
        <div class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-0.5 font-mono-code">
          <div id="liveCurrentWordEx1"></div>
          <div id="liveCurrentWordEx2"></div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-mono-code font-bold text-slate-500 mb-1.5">
          <span>DANH SÁCH TỪ VỰNG VỪA SINH RA TRONG CHỦ ĐỀ NÀY:</span>
          <span>ĐÃ TẠO: <span id="liveStreamedCount" class="text-indigo-600">0</span> TỪ</span>
        </div>
        <div id="liveWordChipsContainer" class="max-h-36 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200 flex flex-wrap gap-1.5">
          <span class="text-xs text-slate-400 italic">Các từ vựng mới sinh ra sẽ xuất hiện lần lượt tại đây...</span>
        </div>
      </div>
    </div>
  </section>`;
}

function getSharedPreviewModalHTML() {
  return `
  <div id="previewModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center z-50 p-2 sm:p-4">
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[94vh] flex flex-col overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div class="flex items-center gap-2.5">
            <span id="previewBadge" class="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-mono-code font-bold rounded-full">#1</span>
            <h3 id="previewTitle" class="font-display font-bold text-lg text-slate-900 uppercase">Chi tiết chủ đề</h3>
          </div>
          <p id="previewSubText" class="text-xs font-mono-code text-slate-500 mt-0.5"></p>
        </div>

        <div class="flex items-center bg-slate-100 p-1 border border-slate-200/80 rounded-xl gap-1">
          <button onclick="switchPreviewTab('table')" id="pTab-table" class="px-3.5 py-1.5 text-xs font-semibold uppercase bg-indigo-600 text-white rounded-lg shadow-sm transition">
            01. BẢNG 9 CỘT & SỬA
          </button>
          <button onclick="switchPreviewTab('flashcard')" id="pTab-flashcard" class="px-3.5 py-1.5 text-xs font-medium uppercase text-slate-600 hover:text-slate-900 rounded-lg transition">
            02. THẺ 3D FLASHCARD
          </button>
          <button onclick="switchPreviewTab('quiz')" id="pTab-quiz" class="px-3.5 py-1.5 text-xs font-medium uppercase text-slate-600 hover:text-slate-900 rounded-lg transition">
            03. GÕ TỪ CLOZE
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="togglePlaylistAudio()" id="btnPlaylistAudio" class="neo-btn px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium uppercase rounded-lg border border-slate-200 shadow-sm">
            PHÁT TỰ ĐỘNG 100 TỪ
          </button>
          <button onclick="printCurrentTopicSheet()" class="neo-btn px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium uppercase rounded-lg border border-slate-200 shadow-sm">
            IN BẢN PDF / A4
          </button>
          <button id="previewDownloadBtn" class="neo-btn px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium uppercase rounded-lg border border-slate-200 shadow-sm">
            TẢI FILE .TXT
          </button>
          <button onclick="downloadTopicAudioZip()" id="btnDownloadAudioZip" class="neo-btn px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium uppercase rounded-lg shadow-sm">
            TẢI AUDIO (.ZIP)
          </button>
          <button onclick="closePreviewModal()" class="neo-btn px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium uppercase rounded-lg shadow-sm">
            ĐÓNG
          </button>
        </div>
      </div>

      <div id="previewTab-table" class="flex-1 overflow-auto flex flex-col">
        <div class="px-4 py-3 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <input id="previewSearchInput" type="text" oninput="renderPreviewTable()" placeholder="Lọc nhanh từ vựng hoặc nghĩa trong chủ đề này..." class="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
          </div>
          <div class="flex items-center gap-2">
            <button onclick="toggleEditMode()" id="btnToggleEdit" class="neo-btn px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium uppercase shadow-sm">
              CHẾ ĐỘ CHỈNH SỬA
            </button>
            <button onclick="saveEditedFileToGitHub()" id="btnSaveCloud" class="hidden neo-btn px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium uppercase rounded-lg shadow-sm">
              LƯU LÊN GITHUB
            </button>
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 text-slate-600 sticky top-0 z-10 border-b border-slate-200/80 font-mono-code uppercase text-[11px]">
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
            <tbody id="previewTableBody" class="divide-y divide-slate-100 bg-white"></tbody>
          </table>
        </div>
      </div>

      <div id="previewTab-flashcard" class="hidden flex-1 p-6 bg-slate-50 flex flex-col items-center justify-center">
        <div class="max-w-xl w-full">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2 text-xs font-mono-code font-bold">
              <span class="px-3 py-1 border border-rose-200 bg-rose-50 text-rose-700 rounded-full">KHÓ: <strong id="srsCountHard">0</strong></span>
              <span class="px-3 py-1 border border-amber-200 bg-amber-50 text-amber-700 rounded-full">TẠM NHỚ: <strong id="srsCountGood">0</strong></span>
              <span class="px-3 py-1 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full">ĐÃ THUỘC: <strong id="srsCountEasy">0</strong></span>
            </div>
            <button onclick="toggleFlashcardAutoSlide()" id="btnAutoSlide" class="neo-btn px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium uppercase shadow-sm">
              TỰ ĐỘNG LẬT (3 GIÂY)
            </button>
          </div>

          <div id="flashcardScene" class="flashcard-scene w-full h-80 cursor-pointer" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner relative w-full h-full">
              <div class="flashcard-face absolute inset-0 bg-white border border-slate-200/90 rounded-2xl shadow-md p-8 flex flex-col items-center justify-center text-center">
                <span id="fcCategoryBadge" class="px-3 py-1 text-xs font-mono-code font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full mb-3">PHẦN 1: GIAO TIẾP (A2-B2)</span>
                <h2 id="fcWord" class="text-4xl font-display font-extrabold text-slate-900 tracking-tight mb-2">word</h2>
                <div class="flex items-center gap-2 mb-4">
                  <span id="fcIpa" class="font-mono-code text-lg text-indigo-600 font-semibold">/wɜːrd/</span>
                  <button onclick="speakWord(document.getElementById('fcWord').innerText, event)" class="neo-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono-code rounded-lg uppercase">PHÁT ÂM</button>
                </div>
                <p id="fcCloze" class="font-mono-code text-sm text-slate-600 bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200">w _ _ d</p>
                <p class="text-xs font-mono-code text-slate-400 mt-6 uppercase">Nhấp vào thẻ hoặc nhấn phím Space để lật mặt sau</p>
              </div>
              <div class="flashcard-face flashcard-back absolute inset-0 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-md p-7 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
                    <span id="fcMeaningVi" class="text-2xl font-display font-bold text-teal-300">Nghĩa tiếng Việt</span>
                    <span id="fcPlural" class="text-xs font-mono-code bg-slate-800 px-3 py-1 text-slate-300 rounded-full border border-slate-700">Số nhiều: words</span>
                  </div>
                  <p id="fcDefEn" class="text-sm text-slate-300 italic mb-4">English definition here</p>
                  <div id="fcExamples" class="text-xs text-slate-300 space-y-1.5 bg-slate-800/80 p-3.5 border border-slate-700 rounded-xl leading-relaxed font-mono-code"></div>
                </div>
                <p class="text-xs font-mono-code text-slate-400 text-center uppercase">Nhấp vào thẻ để lật lại mặt trước</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-4">
            <button onclick="markSrsStatus('hard')" class="neo-btn py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase transition">01. KHÓ NHỚ</button>
            <button onclick="markSrsStatus('good')" class="neo-btn py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold uppercase transition">02. TẠM NHỚ</button>
            <button onclick="markSrsStatus('easy')" class="neo-btn py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold uppercase transition">03. ĐÃ THUỘC</button>
          </div>

          <div class="flex items-center justify-between mt-4">
            <button onclick="nextFlashcard(-1)" class="neo-btn px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold uppercase shadow-sm">TỪ TRƯỚC</button>
            <div class="flex items-center gap-3">
              <span id="fcCounter" class="font-mono-code text-sm font-bold text-slate-700">1 / 100</span>
              <button onclick="shuffleFlashcard()" class="neo-btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs uppercase">NGẪU NHIÊN</button>
            </div>
            <button onclick="nextFlashcard(1)" class="neo-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase shadow-sm">TỪ TIẾP THEO</button>
          </div>
        </div>
      </div>

      <div id="previewTab-quiz" class="hidden flex-1 p-6 bg-slate-50 flex flex-col items-center justify-center">
        <div class="max-w-xl w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-mono-code font-bold uppercase tracking-wider text-slate-600">LUYỆN GÕ TỪ VỰNG KHUYẾT CHỮ (CLOZE TEST)</span>
            <div class="flex items-center gap-2 text-xs font-mono-code font-bold">
              <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full" id="quizScoreCorrect">ĐÚNG: 0</span>
              <span class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full" id="quizScoreWrong">SAI: 0</span>
            </div>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
            <div class="text-xs font-mono-code text-slate-500 font-bold mb-1 uppercase">NGHĨA TIẾNG VIỆT & ĐỊNH NGHĨA:</div>
            <div id="quizMeaningVi" class="text-lg font-display font-bold text-emerald-700 mb-1">...</div>
            <div id="quizDefEn" class="text-xs text-slate-600 italic">...</div>
          </div>
          <div class="text-center mb-4">
            <div class="text-xs font-mono-code text-slate-500 mb-1 uppercase">GỢI Ý KHUYẾT CHỮ & PHIÊN ÂM:</div>
            <div id="quizClozeHint" class="font-mono-code text-2xl font-extrabold text-slate-900 tracking-widest mb-1">_ _ _ _</div>
            <div class="flex items-center justify-center gap-2">
              <span id="quizIpaHint" class="font-mono-code text-sm text-indigo-600 font-semibold">/ipa/</span>
              <button onclick="speakWord(currentQuizItem?.word || '', event)" class="neo-btn px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs uppercase">PHÁT ÂM GỢI Ý</button>
            </div>
          </div>
          <div class="flex gap-2">
            <input id="quizAnswerInput" type="text" onkeydown="if(event.key==='Enter') checkQuizAnswer()" placeholder="Gõ từ tiếng Anh đầy đủ rồi nhấn Enter..." class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            <button onclick="checkQuizAnswer()" class="neo-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase shadow-sm">KIỂM TRA</button>
            <button onclick="revealQuizAnswer()" class="neo-btn px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold uppercase shadow-sm">ĐÁP ÁN</button>
          </div>
          <div id="quizFeedbackBox" class="hidden mt-4 p-3 rounded-xl border border-slate-200 text-xs font-semibold"></div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button onclick="nextQuizQuestion()" class="neo-btn px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase shadow-sm">CÂU TIẾP THEO</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function getSharedCommonModalsHTML() {
  return `
  <!-- CONSOLE LOG DRAWER -->
  <div id="consoleDrawer" class="fixed bottom-0 inset-x-0 z-50 bg-slate-950 text-slate-100 border-t border-slate-800 shadow-2xl transition-transform duration-300 translate-y-full">
    <div class="max-w-[1440px] mx-auto">
      <div class="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-0.5 bg-emerald-600 text-white font-mono-code text-xs font-bold rounded">TERMINAL</span>
          <span class="font-mono-code text-xs font-bold uppercase tracking-wider text-slate-200">NHẬT KÝ HỆ THỐNG & LỊCH SỬ CHẠY AI</span>
          <span id="consoleLogCount" class="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono-code rounded">0 BẢN GHI</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadRunLogs()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-code uppercase rounded transition">TẢI LẠI RUN_LOGS.JSON</button>
          <button onclick="clearConsoleLogs()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-code uppercase rounded transition">XÓA MÀN HÌNH</button>
          <button onclick="toggleConsoleDrawer(false)" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono-code font-bold uppercase rounded transition">THU GỌN</button>
        </div>
      </div>
      <div id="consoleLogContainer" class="h-64 overflow-y-auto p-4 font-mono-code text-xs space-y-1.5 bg-slate-950 text-slate-200"></div>
    </div>
  </div>

  <!-- FLOATING STUDY REMINDER WIDGET -->
  <div id="studyReminderWidget" class="fixed bottom-5 right-5 z-40 hidden max-w-sm bg-white/95 backdrop-blur-md text-slate-900 p-5 rounded-2xl border border-slate-200/90 shadow-2xl">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="tid-badge-num bg-indigo-50 text-indigo-700 border border-indigo-200/60">NHẮC NHỞ HỌC TẬP</span>
        <h4 class="font-display font-bold text-sm text-slate-900 mt-2 uppercase">Lịch Ôn Tập Từ Vựng Hàng Ngày</h4>
        <p id="studyReminderText" class="text-xs text-slate-600 mt-1 font-medium">Bạn đã sẵn sàng chinh phục chủ đề từ vựng hôm nay chưa?</p>
      </div>
      <button onclick="dismissStudyReminder()" class="text-slate-400 hover:text-slate-700 text-xs font-mono-code font-bold px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition">ĐÓNG</button>
    </div>
    <div class="mt-4 flex items-center justify-end gap-2">
      <a href="quiz.html" class="neo-btn px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase rounded-xl shadow-sm transition">
        VÀO THI TRẮC NGHIỆM
      </a>
    </div>
  </div>

  <!-- SETTINGS MODAL -->
  <div id="settingsModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 class="font-display font-bold text-lg text-slate-900 uppercase">Cấu Hình Kết Nối API</h3>
        <button onclick="closeSettings()" class="text-xs font-mono-code font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition">ĐÓNG</button>
      </div>
      <div class="space-y-3.5 text-xs">
        <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <label class="block font-mono-code font-bold text-slate-800 mb-1.5 uppercase">01. Gemini API Key (Tạo từ trực tiếp):</label>
          <input id="geminiKeyInput" type="password" placeholder="Gemini API Key..." class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono-code mb-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          <label class="block font-mono-code font-bold text-slate-800 mb-1.5 uppercase">Mô Hình Gemini AI:</label>
          <select id="geminiModelSelect" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Nhanh nhất - Khuyên dùng)</option>
            <option value="gemini-3-flash">Gemini 3 Flash (Cân bằng Tốc độ & Độ sâu)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ổn định cao)</option>
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Siêu nhẹ)</option>
          </select>
        </div>

        <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <label class="block font-mono-code font-bold text-slate-800 mb-1.5 uppercase">02. Google Cloud Run Audio URL (Cambridge MP3):</label>
          <input id="cloudAudioServiceUrl" type="text" placeholder="https://anki-audio-service-918034752495.asia-southeast1.run.app" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono-code text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          <p class="text-xs text-slate-500 mt-1.5">Máy chủ Cloud Run tự động cào 100% phát âm chuẩn Cambridge Dictionary US/UK.</p>
        </div>

        <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
          <div>
            <label class="block font-mono-code font-bold text-slate-800 mb-1 uppercase">03. Chủ sở hữu GitHub (Owner):</label>
            <input id="ghOwner" type="text" placeholder="lev24197" class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-code bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-slate-800 mb-1 uppercase">Tên Repository:</label>
            <input id="ghRepo" type="text" placeholder="vinhdeptrai" class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-code bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-slate-800 mb-1 uppercase">Nhánh (Branch):</label>
            <input id="ghBranch" type="text" value="main" class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-code bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label class="block font-mono-code font-bold text-slate-800 mb-1 uppercase">GitHub Personal Access Token (PAT):</label>
            <input id="ghToken" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-code bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2.5 mt-6">
        <button onclick="closeSettings()" class="neo-btn px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold uppercase shadow-sm">HỦY</button>
        <button onclick="saveSettings()" class="neo-btn px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase shadow-sm">LƯU CẤU HÌNH</button>
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
      link.className = 'nav-page-link px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-2 bg-indigo-600 text-white shadow-sm transition-all duration-150';
    } else {
      link.className = 'nav-page-link px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150';
    }
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    const target = (link.getAttribute('data-mobile-nav') || '').toLowerCase();
    if (target === activePage) {
      link.className = 'mobile-nav-link flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-indigo-600 bg-indigo-50/80 font-bold transition-all duration-150';
    } else {
      link.className = 'mobile-nav-link flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition-all duration-150';
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
