// ==================== TRÌNH KẾT NỐI VÀ TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU (DATA CONNECTOR) ====================
let allTopics = [];
let filteredTopics = [];
let selectedStts = new Set();
let currentFilter = 'all';
let currentPage = 1;

let actionPollTimer = null;
let runnerStartTime = null;

// URL mặc định của Microservice Google Cloud Run tạo âm thanh Anki (Cambridge + Neural2)
const DEFAULT_AUDIO_SERVICE_URL = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';

function getAudioServiceUrl() {
  const custom = (localStorage.getItem('audio_service_url') || '').trim().replace(/\/+$/, '');
  return custom || DEFAULT_AUDIO_SERVICE_URL;
}

// Tự động nhận diện cấu hình Repo GitHub
function autoDetectGitHubRepo() {
  if (!localStorage.getItem('gh_owner')) localStorage.setItem('gh_owner', 'lev24197');
  if (!localStorage.getItem('gh_repo')) localStorage.setItem('gh_repo', 'vinhdeptrai');
  if (!localStorage.getItem('gh_branch')) localStorage.setItem('gh_branch', 'main');
}

/**
 * Trình tải thông minh (Smart Fetch):
 * - Nếu mở web bằng file:/// (nhấp đúp file trên máy tính) hoặc fetch local bị chặn CORS:
 *   ➜ Tự động chuyển hướng tải trực tiếp từ GitHub Raw của repo lev24197/vinhdeptrai!
 * - Nếu chạy trên HTTP/HTTPS (GitHub Pages hoặc Local Server):
 *   ➜ Tải file local, nếu lỗi thì tự động fallback về GitHub Raw.
 * Nhờ đó database LUÔN LUÔN được nạp 100% trong mọi môi trường!
 */
async function smartFetch(relativePath) {
  const cleanPath = relativePath.replace(/^\.?\//, '');
  const isFileProto = window.location.protocol === 'file:';
  const owner = localStorage.getItem('gh_owner') || 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const remoteUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;

  // Nếu đang chạy trên server HTTP/HTTPS, ưu tiên fetch local
  if (!isFileProto) {
    try {
      const res = await fetch(`./${cleanPath}?t=` + Date.now());
      if (res.ok) return res;
    } catch (e) {
      console.warn(`Local fetch failed cho ${cleanPath}, đang fallback về GitHub Raw...`);
    }
  }

  // Tải trực tiếp từ GitHub Raw (hỗ trợ CORS cho cả file:/// và các trình duyệt)
  const resRemote = await fetch(remoteUrl + '?t=' + Date.now());
  if (resRemote.ok) return resRemote;
  throw new Error(`Không thể nạp dữ liệu từ local lẫn GitHub (${cleanPath})`);
}

function logToConsole(level, step, msg) {
  const box = document.getElementById('consoleOutput');
  const quickBox = document.getElementById('quickLogBox');
  const time = new Date().toLocaleTimeString('vi-VN');
  let color = 'text-emerald-400';
  if (level === 'ERROR') color = 'text-red-400 font-bold';
  else if (level === 'WARNING') color = 'text-amber-300';
  else if (level === 'INFO') color = 'text-sky-300';

  const line = `<div class="${color}">[${time}] [${level}] [${step}] ${msg}</div>`;
  if (box) box.insertAdjacentHTML('afterbegin', line);
  if (quickBox) quickBox.insertAdjacentHTML('afterbegin', line);
}

function clearLocalConsole() {
  const box = document.getElementById('consoleOutput');
  if (box) box.innerHTML = '';
}

function toggleConsoleDrawer(forceOpen) {
  const d = document.getElementById('consoleDrawer');
  if (!d) return;
  if (typeof forceOpen === 'boolean') d.classList.toggle('hidden', !forceOpen);
  else d.classList.toggle('hidden');
}

async function loadRunLogs() {
  try {
    const res = await smartFetch('run_logs.json');
    const logs = await res.json();
    const box = document.getElementById('consoleOutput');
    const qBox = document.getElementById('quickLogBox');
    let errCount = 0;

    const html = logs.slice(0, 60).map(l => {
      if (l.level === 'ERROR') errCount++;
      let c = 'text-emerald-400';
      if (l.level === 'ERROR') c = 'text-red-400 font-bold';
      else if (l.level === 'WARNING') c = 'text-amber-300';
      else if (l.level === 'INFO') c = 'text-sky-300';
      const retryBtn = (l.level === 'ERROR' && l.stt)
        ? `<button onclick="triggerWorkflow('1','${l.stt}')" class="ml-2 px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px]">↻ Chạy lại #${l.stt}</button>`
        : '';
      return `<div class="${c}">[${l.time}] [${l.level}] [${l.step}] ${l.message} ${retryBtn}</div>`;
    }).join('');

    if (html) {
      if (box) box.innerHTML = html;
      if (qBox) qBox.innerHTML = html;
    }
    const bubble = document.getElementById('errorCountBubble');
    if (bubble) {
      if (errCount > 0) {
        bubble.innerText = errCount;
        bubble.classList.remove('hidden');
        bubble.classList.add('flex');
      } else {
        bubble.classList.add('hidden');
      }
    }
  } catch (e) {}
}

async function loadData(checkAction = false) {
  autoDetectGitHubRepo();
  const lastUpdatedEl = document.getElementById('lastUpdated');
  try {
    const res = await smartFetch('status.json');
    const data = await res.json();
    allTopics = data.topics || [];

    const isFileProto = window.location.protocol === 'file:';
    const sourceTag = isFileProto ? '🌐 GitHub Cloud' : '💻 Local';
    if (lastUpdatedEl) {
      lastUpdatedEl.innerHTML = `${data.updated_at || 'Vừa xong'} <span class="ml-1 text-[10px] opacity-75 font-mono-code">(${sourceTag})</span>`;
    }

    // Cập nhật tất cả các module giao diện
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
    if (typeof renderGridMap === 'function') renderGridMap();
    if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
    if (typeof renderQuizTopicSelection === 'function') renderQuizTopicSelection();
    loadRunLogs();

    logToConsole('SUCCESS', 'DATABASE', `Đã nạp thành công database: ${allTopics.length} chủ đề (${sourceTag})`);
    if (checkAction && typeof pollGitHubActionSteps === 'function') pollGitHubActionSteps();
  } catch (e) {
    if (lastUpdatedEl) lastUpdatedEl.innerText = 'Lỗi kết nối';
    logToConsole('ERROR', 'LOAD_STATUS', 'Không thể nạp database: ' + e.message);
  }
}
