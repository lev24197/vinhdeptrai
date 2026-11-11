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
let statusUpdatedAt = '';

// Biến trạng thái dùng chung cho tiến trình GitHub Actions / tạo từ trực tiếp (js/actions.js)
let actionPollTimer = null;
let runnerStartTime = null;

// Database chính của hệ thống (do Python & GitHub Actions cập nhật): status.json = { updated_at, topics: [...] }
const DATABASE_FILE = 'status.json';

/**
 * Trình tải thông minh (Smart Fetch):
 * - Trên GitHub Pages / HTTP: ưu tiên file cùng thư mục, lỗi thì tự fallback về GitHub Raw.
 * - Trên file:/// (mở trực tiếp trên máy): tải thẳng từ GitHub Raw.
 * Luôn trả về Response có res.ok === true, nếu không sẽ ném lỗi.
 */
async function smartFetch(relativePath) {
  const cleanPath = String(relativePath).replace(/^\.?\//, '');
  const owner = localStorage.getItem('gh_owner') || 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const isFileProto = window.location.protocol === 'file:';

  if (!isFileProto) {
    try {
      const res = await fetch(`./${cleanPath}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return res;
    } catch (e) {}
  }

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}?t=${Date.now()}`;
  const resRemote = await fetch(rawUrl, { cache: 'no-store' });
  if (resRemote.ok) return resRemote;
  throw new Error(`Không thể nạp ${cleanPath} (local lẫn GitHub Raw đều lỗi HTTP ${resRemote.status})`);
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
    const logs = await res.json();
    if (Array.isArray(logs)) {
      // run_logs.json lưu bản ghi mới nhất ở đầu mảng
      logs.slice(0, 60).reverse().forEach(entry => {
        const rawTime = entry.time || entry.timestamp || '--:--';
        consoleLogs.unshift({
          time: String(rawTime).includes(' ') ? String(rawTime).split(' ')[1] : rawTime,
          level: entry.level || 'INFO',
          step: entry.step || 'PYTHON',
          message: (entry.message || '') + (entry.stt ? ` (chủ đề #${entry.stt})` : '')
        });
      });
      renderConsoleLogs();
    }
  } catch (e) {
    // run_logs.json là tùy chọn — không có cũng không ảnh hưởng database
  }
}

async function loadData(silent = false) {
  const badge = document.getElementById('syncBadge');
  if (!silent && badge) {
    badge.innerText = '🔄 Đang tải dữ liệu...';
    badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border-2 border-[#141414]';
  }

  try {
    const res = await smartFetch(DATABASE_FILE);
    const data = await res.json();
    // Hỗ trợ cả 2 định dạng: { updated_at, topics: [...] } hoặc mảng thuần [...]
    allTopics = Array.isArray(data) ? data : (Array.isArray(data.topics) ? data.topics : []);
    statusUpdatedAt = (!Array.isArray(data) && data.updated_at) ? data.updated_at : '';
    if (!allTopics.length) throw new Error(`${DATABASE_FILE} không chứa danh sách chủ đề`);

    if (typeof updateDashboardUI === 'function') updateDashboardUI();
    if (typeof renderGridMap === 'function') renderGridMap();

    // Khởi tạo tự động cho các trang chức năng chuyên biệt
    const activePage = typeof getActivePageFilename === 'function' ? getActivePageFilename() : 'index.html';
    if (activePage === 'studio.html' && typeof initStudioPage === 'function') initStudioPage();
    if (activePage === 'audio.html' && typeof initAudioPage === 'function') initAudioPage();
    if (activePage === 'corpus.html' && typeof initCorpusPage === 'function') initCorpusPage();
    if (activePage === 'audit.html' && typeof initAuditPage === 'function') initAuditPage();
    if (activePage === 'quiz.html' && typeof renderQuizTopicSelection === 'function') renderQuizTopicSelection();

    const mode = window.location.protocol === 'file:' ? '☁️ GitHub Cloud' : '🌐 GitHub Pages';
    const updatedLabel = statusUpdatedAt ? statusUpdatedAt.split(' ')[1] || statusUpdatedAt : new Date().toLocaleTimeString('vi-VN');
    if (badge) {
      badge.innerText = `🟢 ${allTopics.length} chủ đề • DB ${updatedLabel} (${mode})`;
      badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-[#E3F7ED] text-[#141414] border-2 border-[#141414] shadow-[2px_2px_0px_#141414]';
      badge.onclick = null;
    }
    if (!silent) logToConsole('SUCCESS', 'DATABASE', `Đã nạp database ${DATABASE_FILE}: ${allTopics.length} chủ đề (cập nhật ${statusUpdatedAt || 'không rõ'}).`);
  } catch (err) {
    if (badge) {
      badge.innerText = '⚠️ Chưa kết nối dữ liệu (Bấm ⚙️ Cấu hình API)';
      badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border-2 border-[#141414] cursor-pointer';
      badge.onclick = () => { if (typeof openSettings === 'function') openSettings(); };
    }
    logToConsole('ERROR', 'DATABASE', `Không thể nạp database ${DATABASE_FILE}: ${err.message}. Kiểm tra GitHub Owner/Repo/Branch trong ⚙️ Cấu hình API.`);
  }
}
