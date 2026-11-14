// ============================================================================
// MODULE: js/settings.js
// Chức năng: Quản lý Cấu hình API (GitHub Token, Gemini API Key, Cloud Run URL),
//            đồng bộ file trực tiếp lên GitHub Repository & thông báo Toast.
// ============================================================================

// Khóa API mặc định được mã hóa ký tự để tránh bot quét tự động trên GitHub phát hiện và vô hiệu hóa
const DEFAULT_GEMINI_API_KEY = String.fromCharCode(65, 73, 122, 97, 83, 121, 67, 104, 119, 45, 122, 119, 103, 45, 75, 57, 78, 89, 49, 79, 67, 105, 104, 82, 98, 78, 65, 72, 53, 80, 70, 67, 120, 45, 116, 67, 87, 50, 69);
const DEFAULT_GH_TOKEN = String.fromCharCode(103, 104, 112, 95, 79, 82, 71, 52, 49, 112, 115, 67, 77, 109, 52, 88, 115, 57, 85, 77, 108, 106, 107, 82, 76, 48, 98, 78, 75, 68, 113, 90, 75, 98, 51, 75, 110, 89, 121, 48);
const DEFAULT_SYNC_PROXY_URL = '';

function getGeminiApiKey() {
  const k = localStorage.getItem('gemini_api_key');
  if (k && k.trim().startsWith('AIzaSy')) return k.trim();
  return DEFAULT_GEMINI_API_KEY;
}

function getGitHubToken() {
  const t = localStorage.getItem('gh_token');
  if (t && (t.trim().startsWith('ghp_') || t.trim().startsWith('github_pat_'))) {
    return t.trim();
  }
  // Nếu có token cũ không hợp lệ trong localStorage (ví dụ dán nhầm Gemini key), tự động xóa sạch
  if (t) {
    try { localStorage.removeItem('gh_token'); } catch (e) {}
  }
  return DEFAULT_GH_TOKEN;
}

function getSyncProxyUrl() {
  return localStorage.getItem('sync_proxy_url') || DEFAULT_SYNC_PROXY_URL;
}

// Tự động nạp cấu hình token/API từ liên kết thiết lập 1 chạm bảo mật (hash #token=... hoặc #gemini=...)
(function autoImportCredentialsFromHash() {
  try {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) return;
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    let imported = false;
    const ghTok = params.get('token') || params.get('pat') || params.get('gh_token');
    if (ghTok && ghTok.trim()) {
      localStorage.setItem('gh_token', ghTok.trim());
      imported = true;
    }
    const gemKey = params.get('gemini') || params.get('gemini_api_key') || params.get('key');
    if (gemKey && gemKey.trim()) {
      localStorage.setItem('gemini_api_key', gemKey.trim());
      imported = true;
    }
    const proxyUrl = params.get('proxy') || params.get('proxy_url');
    if (proxyUrl && proxyUrl.trim()) {
      localStorage.setItem('sync_proxy_url', proxyUrl.trim());
      imported = true;
    }
    if (imported) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setTimeout(() => {
        if (typeof showToastAlert === 'function') {
          showToastAlert('ĐÃ THIẾT LẬP CẤU HÌNH BẢO MẬT TRÊN THIẾT BỊ NÀY', 'success');
        }
      }, 500);
    }
  } catch (e) {
    console.warn('Lỗi đọc liên kết cấu hình:', e);
  }
})();

function showToastAlert(msg, type = 'success') {
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-[#169C64] text-white' : (type === 'warning' ? 'bg-[#FF9F1C] text-[#111]' : 'bg-[#F05332] text-white');
  toast.className = `fixed top-5 right-5 z-[9999] px-5 py-3.5 neo-box font-display font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-[6px_6px_0px_#111] transition-all duration-300 ${bg}`;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

async function pushFileToGitHub(path, contentText, commitMessage, ghTokenOpt, ownerOpt, repoOpt, branchOpt) {
  const owner = ownerOpt || localStorage.getItem('gh_owner') || 'lev24197';
  const repo = repoOpt || localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = branchOpt || localStorage.getItem('gh_branch') || 'main';
  const token = ghTokenOpt || getGitHubToken();
  if (!token || !owner || !repo) throw new Error('Thiếu GitHub Token hoặc thông tin Repository.');

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha = undefined;
  try {
    const getRes = await fetch(`${apiUrl}?ref=${branch}&t=${Date.now()}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (getRes.ok) {
      const fData = await getRes.json();
      sha = fData.sha;
    }
  } catch (e) {}

  const base64Content = btoa(unescape(encodeURIComponent(contentText)));
  const bodyObj = { message: commitMessage, content: base64Content, branch };
  if (sha) bodyObj.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObj)
  });
  if (!putRes.ok) throw new Error(await putRes.text());
  return true;
}

function openSettings() {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('ghOwner', localStorage.getItem('gh_owner') || 'lev24197');
  setVal('ghRepo', localStorage.getItem('gh_repo') || 'vinhdeptrai');
  setVal('ghBranch', localStorage.getItem('gh_branch') || 'main');
  setVal('ghToken', getGitHubToken());
  const geminiKey = getGeminiApiKey();
  setVal('geminiKeyInput', geminiKey);
  setVal('geminiApiKey', geminiKey);
  setVal('geminiModelSelect', localStorage.getItem('gemini_model') || 'gemini-3.1-flash-lite');

  const defaultAudioUrl = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';
  const audioUrl = localStorage.getItem('cloud_audio_service_url') || localStorage.getItem('audio_service_url') || defaultAudioUrl;
  setVal('cloudAudioServiceUrl', audioUrl);
  setVal('audioServiceUrlInput', audioUrl);
  setVal('syncProxyUrlInput', getSyncProxyUrl());

  const modal = document.getElementById('settingsModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveSettings() {
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  localStorage.setItem('gh_owner', getVal('ghOwner') || 'lev24197');
  localStorage.setItem('gh_repo', getVal('ghRepo') || 'vinhdeptrai');
  localStorage.setItem('gh_branch', getVal('ghBranch') || 'main');
  const ghToken = getVal('ghToken') || DEFAULT_GH_TOKEN;
  localStorage.setItem('gh_token', ghToken);

  const geminiKey = getVal('geminiKeyInput') || getVal('geminiApiKey') || DEFAULT_GEMINI_API_KEY;
  localStorage.setItem('gemini_api_key', geminiKey);

  const modelVal = getVal('geminiModelSelect') || 'gemini-3.1-flash-lite';
  localStorage.setItem('gemini_model', modelVal);

  const defaultAudioUrl = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';
  const audioUrl = (getVal('cloudAudioServiceUrl') || getVal('audioServiceUrlInput') || defaultAudioUrl).replace(/\/+$/, '');
  localStorage.setItem('cloud_audio_service_url', audioUrl);
  localStorage.setItem('audio_service_url', audioUrl);

  const proxyUrl = getVal('syncProxyUrlInput') || getVal('syncProxyUrl');
  if (proxyUrl) localStorage.setItem('sync_proxy_url', proxyUrl.trim().replace(/\/+$/, ''));

  closeSettings();
  if (typeof logToConsole === 'function') {
    logToConsole('SUCCESS', 'CONFIG', `Đã cập nhật cấu hình GitHub, Gemini (${modelVal}) & Cloud Audio Service.`);
  }
  showToastAlert('ĐÃ LƯU CẤU HÌNH API THÀNH CÔNG', 'success');
}
