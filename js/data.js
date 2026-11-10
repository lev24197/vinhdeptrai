// ============================================================================
// MODULE: js/data.js
// Chức năng: Quản lý kết nối dữ liệu trung tâm (smartFetch, loadData, loadRunLogs)
//            & Terminal Nhật ký Hệ thống (Console Log Drawer).
// ============================================================================

let allTopics = [];
let filteredTopics = [];
let selectedTopics = new Set();
let currentStatusFilter = 'all';
let currentCategoryFilter = 'all';
let currentPage = 1;
let pageSize = 50;
let consoleLogs = [];

async function smartFetch(relativePath) {
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const isLocal = window.location.protocol === 'file:';

  if (isLocal && owner && repo) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${relativePath}?t=${Date.now()}`;
    return fetch(rawUrl);
  }
  return fetch(`${relativePath}?t=${Date.now()}`);
}

function logToConsole(level, step, message) {
  const timeStr = new Date().toLocaleTimeString('vi-VN');
  consoleLogs.unshift({ time: timeStr, level, step, message });
  renderConsoleLogs();

  if (level === 'ERROR') {
    const errBadge = document.getElementById('consoleErrorBadge');
    if (errBadge) errBadge.classList.remove('hidden');
  }
}

function renderConsoleLogs() {
  const container = document.getElementById('consoleLogContainer');
  const countEl = document.getElementById('consoleLogCount');
  if (countEl) countEl.innerText = `${consoleLogs.length} bản ghi`;
  if (!container) return;

  container.innerHTML = consoleLogs.map(log => {
    let color = 'text-slate-300';
    let badgeBg = 'bg-slate-800 text-slate-300';
    if (log.level === 'SUCCESS') { color = 'text-emerald-400'; badgeBg = 'bg-emerald-950 text-emerald-300 border border-emerald-700'; }
    if (log.level === 'WARNING') { color = 'text-amber-300'; badgeBg = 'bg-amber-950 text-amber-300 border border-amber-700'; }
    if (log.level === 'ERROR') { color = 'text-rose-400 font-bold'; badgeBg = 'bg-rose-950 text-rose-300 border border-rose-700'; }

    return `<div class="flex items-start gap-2 border-b border-slate-900 pb-1">
      <span class="text-slate-500 shrink-0">[${log.time}]</span>
      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${badgeBg}">${log.level}</span>
      <span class="text-indigo-400 font-bold shrink-0">[${log.step}]</span>
      <span class="${color} break-all">${log.message}</span>
    </div>`;
  }).join('');
}

function clearConsoleLogs() {
  consoleLogs = [];
  renderConsoleLogs();
  const errBadge = document.getElementById('consoleErrorBadge');
  if (errBadge) errBadge.classList.add('hidden');
}

function toggleConsoleDrawer(forceState) {
  const drawer = document.getElementById('consoleDrawer');
  if (!drawer) return;
  const isHidden = drawer.classList.contains('translate-y-full');
  const shouldOpen = forceState !== undefined ? forceState : isHidden;
  if (shouldOpen) {
    drawer.classList.remove('translate-y-full');
    const errBadge = document.getElementById('consoleErrorBadge');
    if (errBadge) errBadge.classList.add('hidden');
  } else {
    drawer.classList.add('translate-y-full');
  }
}

async function loadRunLogs() {
  try {
    const res = await smartFetch('run_logs.json');
    if (!res.ok) return;
    const logs = await res.json();
    if (Array.isArray(logs)) {
      logs.slice(-30).forEach(entry => {
        consoleLogs.unshift({
          time: entry.timestamp ? entry.timestamp.split(' ')[1] || entry.timestamp : '--:--',
          level: entry.level || 'INFO',
          step: entry.step || 'PYTHON',
          message: entry.message || ''
        });
      });
      renderConsoleLogs();
    }
  } catch (e) {}
}

async function loadData(silent = false) {
  const badge = document.getElementById('syncBadge');
  if (!silent && badge) {
    badge.innerText = '🔄 Đang tải dữ liệu...';
    badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border-2 border-[#141414]';
  }

  try {
    const res = await smartFetch('progress.json');
    if (!res.ok) throw new Error('Không tìm thấy progress.json');
    allTopics = await res.json();

    if (typeof updateDashboardUI === 'function') updateDashboardUI();
    if (typeof renderGridMap === 'function') renderGridMap();

    // Khởi tạo tự động cho các trang chức năng chuyên biệt
    const activePage = typeof getActivePageFilename === 'function' ? getActivePageFilename() : 'index.html';
    if (activePage === 'studio.html' && typeof initStudioPage === 'function') initStudioPage();
    if (activePage === 'audio.html' && typeof initAudioPage === 'function') initAudioPage();
    if (activePage === 'corpus.html' && typeof initCorpusPage === 'function') initCorpusPage();
    if (activePage === 'audit.html' && typeof initAuditPage === 'function') initAuditPage();
    if (activePage === 'quiz.html' && typeof renderQuizTopicSelection === 'function') renderQuizTopicSelection();

    const mode = (window.location.protocol === 'file:' && localStorage.getItem('gh_owner')) ? '☁️ GitHub Cloud' : '💻 Local';
    if (badge) {
      badge.innerText = `🟢 Đồng bộ lúc ${new Date().toLocaleTimeString('vi-VN')} (${mode})`;
      badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-[#E3F7ED] text-[#141414] border-2 border-[#141414] shadow-[2px_2px_0px_#141414]';
    }
    if (!silent) logToConsole('SUCCESS', 'SYNC_DATA', `Đã đồng bộ thành công ${allTopics.length} chủ đề từ progress.json.`);
  } catch (err) {
    if (badge) {
      badge.innerText = '⚠️ Chưa kết nối dữ liệu (Bấm ⚙️ Cấu hình API)';
      badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border-2 border-[#141414] cursor-pointer';
      badge.onclick = () => { if (typeof openSettings === 'function') openSettings(); };
    }
    logToConsole('ERROR', 'SYNC_FAIL', 'Không thể đọc progress.json trực tiếp. Nếu mở file:// trên máy, hãy nhập GitHub Owner & Repo trong phần ⚙️ Cấu hình API.');
  }
}
