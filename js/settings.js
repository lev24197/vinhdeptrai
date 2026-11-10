// ============================================================================
// MODULE: js/settings.js
// Chức năng: Quản lý Cấu hình API (GitHub Token, Gemini API Key, Cloud Run URL),
//            đồng bộ file trực tiếp lên GitHub Repository & thông báo Toast.
// ============================================================================

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
  const token = ghTokenOpt || localStorage.getItem('gh_token');
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
  setVal('ghToken', localStorage.getItem('gh_token') || '');
  const geminiKey = localStorage.getItem('gemini_api_key') || '';
  setVal('geminiKeyInput', geminiKey);
  setVal('geminiApiKey', geminiKey);
  setVal('geminiModelSelect', localStorage.getItem('gemini_model') || 'gemini-3.1-flash-lite');

  const defaultAudioUrl = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';
  const audioUrl = localStorage.getItem('cloud_audio_service_url') || localStorage.getItem('audio_service_url') || defaultAudioUrl;
  setVal('cloudAudioServiceUrl', audioUrl);
  setVal('audioServiceUrlInput', audioUrl);

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
  localStorage.setItem('gh_token', getVal('ghToken'));

  const geminiKey = getVal('geminiKeyInput') || getVal('geminiApiKey');
  localStorage.setItem('gemini_api_key', geminiKey);

  const modelVal = getVal('geminiModelSelect') || 'gemini-3.1-flash-lite';
  localStorage.setItem('gemini_model', modelVal);

  const defaultAudioUrl = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';
  const audioUrl = (getVal('cloudAudioServiceUrl') || getVal('audioServiceUrlInput') || defaultAudioUrl).replace(/\/+$/, '');
  localStorage.setItem('cloud_audio_service_url', audioUrl);
  localStorage.setItem('audio_service_url', audioUrl);

  closeSettings();
  if (typeof logToConsole === 'function') {
    logToConsole('SUCCESS', 'CONFIG', `Đã cập nhật cấu hình GitHub, Gemini (${modelVal}) & Cloud Audio Service.`);
  }
  showToastAlert('✅ Đã lưu cấu hình API thành công!', 'success');
}
