// ============================================================================
// MODULE: js/audio.js
// Chức năng: Trung tâm Âm thanh Cambridge MP3 & Google Cloud Run Audio Service
//            100% Icon-Free Swiss Editorial Design.
// ============================================================================

const DEFAULT_CLOUD_AUDIO_URL = 'https://anki-audio-service-918034752495.asia-southeast1.run.app';

function getCloudAudioServiceUrl() {
  return (localStorage.getItem('cloud_audio_service_url') || DEFAULT_CLOUD_AUDIO_URL).trim().replace(/\/+$/, '');
}

function fallbackSpeechSynthesis(word) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function speakWord(word, event) {
  if (event) event.stopPropagation();
  const cleanWord = String(word || '').trim();
  if (!cleanWord) return;

  const serviceUrl = getCloudAudioServiceUrl();
  if (serviceUrl) {
    if (window._currentCloudAudio) {
      try { window._currentCloudAudio.pause(); } catch (e) {}
    }
    const audio = new Audio(`${serviceUrl}/speak?word=${encodeURIComponent(cleanWord)}`);
    window._currentCloudAudio = audio;
    audio.play().catch(() => {
      fallbackSpeechSynthesis(cleanWord);
    });
    return;
  }
  fallbackSpeechSynthesis(cleanWord);
}

function makeClozeJS(word) {
  if (!word) return '';
  const chars = word.trim().split('');
  return chars.map((ch, idx) => {
    if (ch === ' ') return '  ';
    if (ch === '-') return '-';
    return (idx === 0 || idx === chars.length - 1 || idx % 3 === 0) ? ch : '_';
  }).join(' ');
}

function makeSoundJS(word) {
  const slug = word.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `[sound:${slug}.mp3]`;
}

async function downloadTopicAudioZipDirect(stt, topicTitle, triggerBtn = null) {
  if (!stt) return;

  let serviceUrl = getCloudAudioServiceUrl();
  if (!serviceUrl) {
    const inputUrl = prompt(
      'NHẬP URL GOOGLE CLOUD RUN AUDIO SERVICE:\n' +
      '(Mặc định: https://anki-audio-service-918034752495.asia-southeast1.run.app)',
      DEFAULT_CLOUD_AUDIO_URL
    );
    if (!inputUrl || !inputUrl.trim()) return;
    serviceUrl = inputUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('cloud_audio_service_url', serviceUrl);
  }

  let words = [];
  if (typeof currentPreviewStt !== 'undefined' && currentPreviewStt === stt && Array.isArray(currentPreviewLines) && currentPreviewLines.length > 0) {
    words = currentPreviewLines.map(cols => (cols[0] || '').trim()).filter(Boolean);
  } else {
    try {
      const res = await smartFetch(`output/${stt}.txt`);
      if (!res.ok) {
        alert(`Chủ đề #${stt} chưa có file dữ liệu từ vựng (output/${stt}.txt). Vui lòng tạo từ vựng trước!`);
        return;
      }
      const txt = await res.text();
      words = txt.split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => (line.split('\t')[0] || '').trim())
        .filter(Boolean);
    } catch (err) {
      alert(`Không thể đọc dữ liệu chủ đề #${stt}: ${err.message}`);
      return;
    }
  }

  if (words.length === 0) {
    alert(`Không tìm thấy từ vựng nào trong chủ đề #${stt} để tạo âm thanh!`);
    return;
  }

  const btn = triggerBtn || document.getElementById('btnDownloadAudioZip');
  const originalHtml = btn ? btn.innerHTML : '';
  let timerInterval = null;
  let elapsedSec = 0;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `ĐANG TẢI CAMBRIDGE (0s)...`;
    timerInterval = setInterval(() => {
      elapsedSec++;
      btn.innerHTML = `ĐANG TẢI CAMBRIDGE (${elapsedSec}s)...`;
    }, 1000);
  }

  if (typeof logToConsole === 'function') {
    logToConsole('INFO', 'CLOUD_AUDIO', `Đang cào ${words.length} file MP3 chuẩn Cambridge cho chủ đề #${stt} (${topicTitle || ''})...`);
  }

  try {
    const res = await fetch(`${serviceUrl}/crawl_zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stt: stt,
        topic_title: topicTitle || `Topic_${stt}`,
        words: words
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const totalWords = res.headers.get('X-Total-Words') || words.length;
    const successWords = res.headers.get('X-Success-Words') || words.length;
    const elapsed = res.headers.get('X-Elapsed-Seconds') || elapsedSec;
    const sourcesRaw = res.headers.get('X-Audio-Sources') || '';

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anki_audio_topic_${stt}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    let sourceSummary = '';
    try {
      if (sourcesRaw) {
        const parsed = JSON.parse(sourcesRaw);
        sourceSummary = Object.entries(parsed).map(([k, v]) => `${k}: ${v} từ`).join(' | ');
      }
    } catch (e) {}

    if (typeof logToConsole === 'function') {
      logToConsole('SUCCESS', 'CLOUD_AUDIO', `Đã tải xong gói ZIP gồm ${successWords}/${totalWords} file MP3 chuẩn Cambridge trong ${elapsed}s! ${sourceSummary ? '[' + sourceSummary + ']' : ''}`);
    }
    if (typeof showToastAlert === 'function') {
      showToastAlert(`ĐÃ TẢI ${successWords}/${totalWords} FILE MP3 CHỦ ĐỀ #${stt} (${elapsed}S)! ${sourceSummary}`, 'success');
    }
  } catch (err) {
    if (typeof logToConsole === 'function') {
      logToConsole('ERROR', 'CLOUD_AUDIO', `Lỗi tải âm thanh từ Cloud Service: ${err.message}`);
    }
    alert(
      `Không thể tải file âm thanh từ Cloud Service: ${err.message}\n\n` +
      `Hãy kiểm tra lại Cloud Audio Service URL trong phần "CẤU HÌNH API".`
    );
  } finally {
    if (timerInterval) clearInterval(timerInterval);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

async function downloadTopicAudioZip() {
  if (typeof currentPreviewStt === 'undefined' || !currentPreviewStt) return;
  const title = document.getElementById('previewTitle')?.innerText || `Topic_${currentPreviewStt}`;
  const btn = document.getElementById('btnDownloadAudioZip');
  await downloadTopicAudioZipDirect(currentPreviewStt, title, btn);
}

async function downloadSelectedOrFirstAudioZip() {
  const targets = (typeof selectedTopics !== 'undefined' && selectedTopics.size > 0)
    ? allTopics.filter(t => selectedTopics.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Chưa có chủ đề nào hoàn thành để tạo gói âm thanh MP3!');
    return;
  }

  if (typeof selectedTopics !== 'undefined' && selectedTopics.size === 0) {
    const first = targets[0];
    if (!confirm(`Bạn chưa tích chọn ô chủ đề nào.\nBạn có muốn tải gói 100 file MP3 chuẩn Cambridge cho Chủ đề #${first.stt}: "${first.topic}" không?`)) {
      return;
    }
    const btn = document.getElementById('btnBulkAudioZip');
    await downloadTopicAudioZipDirect(first.stt, first.topic, btn);
    return;
  }

  const btn = document.getElementById('btnBulkAudioZip');
  for (const t of targets) {
    await downloadTopicAudioZipDirect(t.stt, t.topic, btn);
  }
}

// ==================== TRANG CHUYÊN BIỆT: AUDIO.HTML ====================
async function checkCloudAudioHealth() {
  const statusEl = document.getElementById('audioServiceStatusBadge');
  const urlInput = document.getElementById('audioPageServiceUrl');
  const serviceUrl = (urlInput ? urlInput.value.trim() : getCloudAudioServiceUrl()).replace(/\/+$/, '');

  if (urlInput) {
    localStorage.setItem('cloud_audio_service_url', serviceUrl);
  }

  if (!statusEl) return;
  statusEl.className = 'px-3 py-1 font-mono-code text-xs font-extrabold border-2 border-[#111111] bg-white text-[#111111] uppercase';
  statusEl.innerText = 'ĐANG KIỂM TRA KẾT NỐI...';

  const t0 = performance.now();
  try {
    const res = await fetch(`${serviceUrl}/health`);
    const ms = Math.round(performance.now() - t0);
    if (res.ok) {
      statusEl.className = 'px-3 py-1 font-mono-code text-xs font-extrabold border-2 border-[#111111] bg-[#0F766E] text-white uppercase';
      statusEl.innerText = `ONLINE (${ms}MS) • CAMBRIDGE ENGINE SẴN SÀNG`;
    } else {
      statusEl.className = 'px-3 py-1 font-mono-code text-xs font-extrabold border-2 border-[#111111] bg-[#BE123C] text-white uppercase';
      statusEl.innerText = `LỖI HTTP ${res.status}`;
    }
  } catch (e) {
    statusEl.className = 'px-3 py-1 font-mono-code text-xs font-extrabold border-2 border-[#111111] bg-[#BE123C] text-white uppercase';
    statusEl.innerText = `KHÔNG THỂ KẾT NỐI (${e.message})`;
  }
}

async function testCambridgeWordAudio() {
  const input = document.getElementById('audioTestWordInput');
  const resultBox = document.getElementById('audioTestResultBox');
  if (!input || !resultBox) return;

  const word = input.value.trim();
  if (!word) {
    alert('Vui lòng nhập từ đơn hoặc từ ghép tiếng Anh cần kiểm tra (ví dụ: weight plate, barbell collar, dumbbell)!');
    return;
  }

  const serviceUrl = getCloudAudioServiceUrl();
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = `<div class="text-xs font-mono-code font-bold text-zinc-600 uppercase">Đang cào & kiểm tra trực tiếp từ "${word}" trên Cambridge Dictionary...</div>`;

  try {
    const res = await fetch(`${serviceUrl}/debug_word?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    const safeWord = word.replace(/'/g, "\\'");

    if (data.ok) {
      resultBox.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-[#F4F1EA] border-2 border-[#111111] p-3.5">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-display font-extrabold text-base text-[#111111] uppercase">${data.word}</span>
              <span class="px-2 py-0.5 text-xs font-mono-code font-extrabold bg-[#0F766E] text-white border border-[#111111]">${data.source}</span>
              <span class="text-xs font-mono-code font-bold text-zinc-600">${(data.bytes / 1024).toFixed(1)} KB • ${data.elapsed_ms} MS</span>
            </div>
            <div class="text-xs text-zinc-600 mt-1 font-mono-code">THẺ ANKI: <strong>${makeSoundJS(data.word)}</strong></div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="speakWord('${safeWord}', event)" class="neo-btn px-4 py-2 bg-white text-[#111111] text-xs font-extrabold uppercase">
              PHÁT ÂM CAMBRIDGE
            </button>
            <a href="${serviceUrl}/speak?word=${encodeURIComponent(word)}" download="${word.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.mp3" class="neo-btn px-3 py-2 bg-[#111111] text-white text-xs font-extrabold uppercase">
              TẢI .MP3
            </a>
          </div>
        </div>
      `;
      speakWord(word);
    } else {
      resultBox.innerHTML = `<div class="p-3 bg-white border-2 border-[#BE123C] text-xs font-mono-code font-bold text-[#BE123C] uppercase">KHÔNG TÌM THẤY ÂM THANH CHO TỪ: "${word}"</div>`;
    }
  } catch (e) {
    resultBox.innerHTML = `<div class="p-3 bg-white border-2 border-[#BE123C] text-xs font-mono-code font-bold text-[#BE123C] uppercase">LỖI KẾT NỐI CLOUD RUN: ${e.message}</div>`;
  }
}

function renderAudioTopicsTable() {
  const tbody = document.getElementById('audioTopicsTableBody');
  if (!tbody) return;

  const q = (document.getElementById('audioTopicSearch')?.value || '').toLowerCase().trim();
  const completed = allTopics.filter(t => t.status === 'completed');
  const countBadge = document.getElementById('audioCompletedTopicsCount');
  if (countBadge) countBadge.innerText = `${completed.length} CHỦ ĐỀ HOÀN THÀNH`;

  const filtered = completed.filter(t => !q || t.topic.toLowerCase().includes(q) || String(t.stt).includes(q));

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-zinc-500 font-mono-code text-xs uppercase">Không tìm thấy chủ đề hoàn thành nào phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const safeTopic = t.topic.replace(/'/g, "\\'");
    const cat = typeof getTopicCategory === 'function' ? getTopicCategory(t.stt) : { name: '', color: '' };
    return `
      <tr class="hover:bg-[#F4F1EA] transition border-b border-zinc-200">
        <td class="p-3 font-mono-code font-extrabold text-xs text-zinc-600">#${t.stt}</td>
        <td class="p-3">
          <span class="inline-block text-xs font-mono-code font-bold px-1.5 py-0.5 border ${cat.color} mb-0.5">${cat.name}</span>
          <div class="font-bold text-xs sm:text-sm text-[#111111]">${t.topic}</div>
        </td>
        <td class="p-3 text-center font-mono-code text-xs font-bold text-[#0F766E]">${t.word_count || 100} TỪ</td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="previewFile(${t.stt}, '${safeTopic}')" class="neo-btn px-2.5 py-1.5 bg-white text-[#111111] text-xs font-extrabold uppercase">
              NGHE TỪNG TỪ
            </button>
            <button onclick="downloadTopicAudioZipDirect(${t.stt}, '${safeTopic}', this)" class="neo-btn px-3 py-1.5 bg-[#0F766E] text-white text-xs font-extrabold uppercase">
              TẢI 100 MP3 (.ZIP)
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initAudioPage() {
  const urlInput = document.getElementById('audioPageServiceUrl');
  if (urlInput) {
    urlInput.value = getCloudAudioServiceUrl();
  }
  renderAudioTopicsTable();
  checkCloudAudioHealth();
}
