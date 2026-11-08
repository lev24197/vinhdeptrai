// ==================== ĐIỀU KHIỂN GITHUB ACTIONS & TẠO TỪ REAL-TIME ====================

function showLiveRunner(title, pct, stepIndex, isError = false) {
  const banner = document.getElementById('liveRunnerBanner');
  const bar = document.getElementById('liveRunnerBar');
  const badge = document.getElementById('liveRunnerBadge');
  if (!banner || !bar || !badge) return;

  banner.classList.remove('hidden');
  document.getElementById('liveRunnerTitle').innerText = title;
  bar.style.width = `${pct}%`;
  bar.innerText = `${pct}%`;

  if (isError) {
    bar.className = 'h-full bg-[#F05332] transition-all duration-300 flex items-center justify-end pr-2 text-[11px] font-mono-code font-extrabold text-white';
    badge.className = 'tid-badge-num bg-[#F05332]';
    badge.innerText = 'ERROR';
  } else {
    bar.className = 'h-full bg-[#169C64] progress-stripes transition-all duration-500 flex items-center justify-end pr-2 text-[11px] font-mono-code font-extrabold text-white';
    badge.className = 'tid-badge-num bg-blue-600';
    badge.innerText = 'LIVE RUNNER';
  }

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('step-' + i);
    if (!el) continue;
    if (i < stepIndex) el.className = 'p-1.5 border border-[#111] bg-[#169C64] text-white';
    else if (i === stepIndex) el.className = isError ? 'p-1.5 border border-[#111] bg-[#F05332] text-white' : 'p-1.5 border-2 border-[#111] bg-[#FFE787] text-[#111]';
    else el.className = 'p-1.5 border border-[#111] bg-slate-100 text-slate-400';
  }
}

async function triggerWorkflow(batchSize, targetStt) {
  activeWorkflowTargetStt = targetStt || '';
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const token = localStorage.getItem('gh_token');

  if (!owner || !repo || !token) {
    alert('Vui lòng bấm "⚙️ Cấu hình API" và điền Owner, Repo, GitHub Token trước!');
    openSettings();
    return;
  }

  const desc = targetStt ? `CHỦ ĐỀ #${targetStt}` : `${batchSize} CHỦ ĐỀ TIẾP THEO`;
  showLiveRunner(`ĐANG GỬI LỆNH TẠO ${desc} LÊN GITHUB ACTIONS...`, 12, 1);
  logToConsole('INFO', 'DISPATCH', `Đang kích hoạt workflow generate_anki.yml (batch=${batchSize}, target=${targetStt || 'auto'})...`);

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/generate_anki.yml/dispatches`, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.github+json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ref: branch, inputs: { batch_size: String(batchSize), target_stt: String(targetStt) } })
    });

    if (res.status === 204) {
      runnerStartTime = Date.now();
      logToConsole('SUCCESS', 'DISPATCH', 'GitHub đã nhận lệnh! Đang theo dõi từng bước thực thi của máy ảo Ubuntu...');
      showLiveRunner(`ĐÃ XẾP HÀNG TRÊN GITHUB • ĐANG KHỞI ĐỘNG MÁY ẢO...`, 25, 1);
      if (actionPollTimer) clearInterval(actionPollTimer);
      actionPollTimer = setInterval(pollGitHubActionSteps, 4500);
    } else {
      const errText = await res.text();
      showLiveRunner(`LỖI KHI GỌI GITHUB API (HTTP ${res.status})`, 100, 1, true);
      logToConsole('ERROR', 'DISPATCH_FAIL', `Không thể gọi workflow: ${errText}`);
      toggleConsoleDrawer(true);
    }
  } catch (e) {
    showLiveRunner(`LỖI KẾT NỐI MẠNG: ${e.message}`, 100, 1, true);
    logToConsole('ERROR', 'NETWORK', e.message);
    toggleConsoleDrawer(true);
  }
}

async function pollGitHubActionSteps() {
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const token = localStorage.getItem('gh_token');
  const branch = localStorage.getItem('gh_branch') || 'main';
  if (!owner || !repo) return;

  if (runnerStartTime) {
    const sec = Math.floor((Date.now() - runnerStartTime) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    const timerEl = document.getElementById('liveRunnerTimer');
    if (timerEl) timerEl.innerText = mm + ':' + ss;
  }

  try {
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const res = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/actions/runs?per_page=1', { headers });
    if (!res.ok) return;
    const data = await res.json();
    const run = data.workflow_runs?.[0];
    if (!run) return;

    const ghLink = document.getElementById('liveRunnerGhLink');
    if (ghLink) ghLink.href = run.html_url;

    if (run.status === 'queued') {
      showLiveRunner('ĐANG XẾP HÀNG CHỜ MÁY ẢO GITHUB ACTIONS...', 20, 1);
    } else if (run.status === 'in_progress') {
      const jobsRes = await fetch(run.jobs_url, { headers });
      const jobsData = await jobsRes.json();
      const job = jobsData.jobs?.[0];
      if (job && job.steps) {
        const activeStep = job.steps.find(s => s.status === 'in_progress') || job.steps[job.steps.length - 1];
        const stepName = activeStep ? activeStep.name : 'Đang xử lý...';
        let pct = 45, stepIdx = 2;
        if (stepName.includes('Install')) {
          pct = 40;
          stepIdx = 2;
          showLiveRunner('ĐANG CHẠY BƯỚC: ' + stepName.toUpperCase(), pct, stepIdx);
        } else if (stepName.includes('Run Anki Generator')) {
          stepIdx = 3;
          const elapsed = runnerStartTime ? Math.max(1, Math.floor((Date.now() - runnerStartTime) / 1000)) : 10;
          const estPct = Math.min(88, Math.max(42, Math.floor(40 + (elapsed - 15) * 0.8)));
          const estWords = Math.min(95, Math.max(5, Math.floor((estPct - 35) * (100 / 53))));

          showLiveRunner('⚡ [MÁY ẢO GITHUB] ĐANG GỌI GEMINI 3.1 FLASH LITE TẠO 100 TỪ VỰNG...', estPct, stepIdx);

          const trackerBox = document.getElementById('liveWordTrackerBox');
          if (trackerBox) trackerBox.classList.remove('hidden');

          const counterBadge = document.getElementById('liveWordCounterBadge');
          if (counterBadge) counterBadge.innerText = estWords + ' / 100 từ (~' + estPct + '%) • Đang chạy trên GitHub Runner';

          const catBadge = document.getElementById('liveWordCategoryBadge');
          if (catBadge) {
            if (estWords < 50) {
              catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-emerald-100 text-emerald-900';
              catBadge.innerText = 'A2-B2 Giao tiếp (~' + estWords + '/50)';
            } else {
              catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-purple-100 text-purple-900';
              catBadge.innerText = 'C1-C2 Nâng cao (~' + (estWords - 50) + '/50)';
            }
          }

          const nameEl = document.getElementById('liveCurrentWordName');
          if (nameEl) {
            nameEl.innerHTML = '<span class="inline-flex items-center gap-2 text-indigo-700 animate-pulse"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>Máy ảo Ubuntu đang sinh từ #' + estWords + ' / 100...</span>';
          }
          const viEl = document.getElementById('liveCurrentWordVi');
          if (viEl) viEl.innerText = 'Tiến trình Python generate.py đang chạy tự động trên máy chủ GitHub';
          const defEl = document.getElementById('liveCurrentWordDef');
          if (defEl) defEl.innerText = 'Gemini 3.1 Flash Lite đang tạo đủ 9 trường chuẩn Anki. Sau khi hoàn thành, toàn bộ 100 từ sẽ xuất hiện ngay tại đây.';
        } else if (stepName.includes('Commit')) {
          pct = 92;
          stepIdx = 5;
          showLiveRunner('ĐANG GHI DỮ LIỆU: COMMIT & PUSH LÊN GITHUB REPO...', pct, stepIdx);
        } else {
          showLiveRunner('ĐANG CHẠY BƯỚC: ' + stepName.toUpperCase(), pct, stepIdx);
        }
        logToConsole('INFO', 'STEP_PROGRESS', 'GitHub Runner đang thực thi: ' + stepName);
      }
    } else if (run.status === 'completed') {
      if (actionPollTimer) { clearInterval(actionPollTimer); actionPollTimer = null; }
      if (run.conclusion === 'success') {
        showLiveRunner('🎉 HOÀN TẤT TẠO TỪ VỰNG! ĐANG ĐỒNG BỘ DỮ LIỆU...', 100, 5, false);
        logToConsole('SUCCESS', 'WORKFLOW_DONE', 'Job #' + run.id + ' đã hoàn thành xuất sắc!');
        syncCompletedWordsFromGitHub(owner, repo, branch, token, activeWorkflowTargetStt);
        setTimeout(() => {
          loadData(false);
        }, 1500);
      } else {
        showLiveRunner('❌ TIẾN TRÌNH THẤT BẠI (' + run.conclusion.toUpperCase() + ') — XEM CHI TIẾT TRONG BẢNG LOG', 100, 3, true);
        logToConsole('ERROR', 'WORKFLOW_FAILED', 'Job #' + run.id + ' bị dừng với trạng thái: ' + run.conclusion + '. Hãy bấm "Mở GitHub Log" hoặc kiểm tra run_logs.json.');
        toggleConsoleDrawer(true);
        loadData(false);
      }
    }
  } catch (e) {}
}

async function syncCompletedWordsFromGitHub(owner, repo, branch, token, targetStt) {
  try {
    let stt = targetStt;
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    if (!stt) {
      const stRes = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/status.json?ref=' + branch, { headers });
      if (stRes.ok) {
        const fileObj = await stRes.json();
        const statusData = JSON.parse(decodeURIComponent(escape(atob(fileObj.content))));
        const doneTopics = (statusData.topics || []).filter(t => t.status === 'completed');
        if (doneTopics.length > 0) {
          stt = doneTopics[doneTopics.length - 1].stt;
        }
      }
    }
    if (!stt) return;

    const fileRes = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/output/' + stt + '.txt?ref=' + branch, { headers });
    if (!fileRes.ok) return;

    const fObj = await fileRes.json();
    const tsvContent = decodeURIComponent(escape(atob(fObj.content)));
    const lines = tsvContent.split('\n').filter(l => l.trim().length > 0);

    const trackerBox = document.getElementById('liveWordTrackerBox');
    if (trackerBox) trackerBox.classList.remove('hidden');

    const chipsContainer = document.getElementById('liveWordChipsContainer');
    if (chipsContainer && lines.length > 0) {
      chipsContainer.innerHTML = '';
      lines.forEach((line, idx) => {
        const parts = line.split('\t');
        const word = parts[0] || '';
        const vi = parts[5] || parts[6] || '';
        const isAdv = idx >= 50;
        const chip = document.createElement('div');
        const chipBg = isAdv ? 'bg-purple-100 text-purple-950 border-purple-800' : 'bg-emerald-100 text-emerald-950 border-emerald-800';
        chip.className = 'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono-code font-bold border ' + chipBg + ' rounded-none shadow-[1px_1px_0px_#111]';
        chip.innerHTML = '<span class="text-[10px] text-slate-500 font-extrabold">#' + (idx + 1) + '</span><span class="font-bold underline decoration-slate-400">' + word + '</span><span class="text-[11px] text-slate-600 font-sans font-normal">• ' + vi + '</span>';
        chipsContainer.appendChild(chip);
      });
      chipsContainer.scrollTop = chipsContainer.scrollHeight;
    }

    const streamedCount = document.getElementById('liveStreamedCount');
    if (streamedCount) streamedCount.innerText = String(lines.length);

    const counterBadge = document.getElementById('liveWordCounterBadge');
    if (counterBadge) counterBadge.innerText = lines.length + ' / 100 từ (100%)';

    const nameEl = document.getElementById('liveCurrentWordName');
    if (nameEl) nameEl.innerText = '🎉 HOÀN TẤT ĐỦ ' + lines.length + ' TỪ VỰNG CHO CHỦ ĐỀ #' + stt + '!';

    const viEl = document.getElementById('liveCurrentWordVi');
    if (viEl) viEl.innerText = 'Đã lưu file output/' + stt + '.txt lên GitHub thành công';

    const defEl = document.getElementById('liveCurrentWordDef');
    if (defEl) defEl.innerText = 'Gồm 50 từ giao tiếp (A2-B2) và 50 từ chuyên sâu (C1-C2). Dữ liệu đã sẵn sàng để học và nhập Anki.';
  } catch (e) {
    console.warn('Lỗi đồng bộ từ vựng sau GitHub Run:', e);
  }
}

function triggerCustomBatch() {
  const count = document.getElementById('customBatchInput')?.value || '3';
  triggerWorkflow(String(count), '');
}

async function generateDirectlyInBrowser() {
  const pending = allTopics.find(t => t.status !== 'completed');
  if (!pending) { alert('Tất cả chủ đề đều đã được tạo!'); return; }
  await generateSingleInBrowser(pending.stt, pending.topic);
}

// ==================== LIVE WORD STREAMING TRACKER ====================
function resetLiveWordTracker(stt, topicVi) {
  const trackerBox = document.getElementById('liveWordTrackerBox');
  if (trackerBox) trackerBox.classList.remove('hidden');

  const counterBadge = document.getElementById('liveWordCounterBadge');
  if (counterBadge) counterBadge.innerText = '0 / 100 từ (0%)';

  const catBadge = document.getElementById('liveWordCategoryBadge');
  if (catBadge) {
    catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-emerald-100 text-emerald-900';
    catBadge.innerText = 'A2-B2 Giao tiếp';
  }

  const topicBadge = document.getElementById('liveTopicNameBadge');
  if (topicBadge) topicBadge.innerText = '#' + stt + ': ' + topicVi;

  const wordName = document.getElementById('liveCurrentWordName');
  if (wordName) wordName.innerText = 'Đang gọi Gemini 3.1 Flash Lite...';

  const wordIpa = document.getElementById('liveCurrentWordIpa');
  if (wordIpa) wordIpa.innerText = '/.../';

  const wordVi = document.getElementById('liveCurrentWordVi');
  if (wordVi) wordVi.innerText = 'Đang khởi động tiến trình sinh từ...';

  const wordPlural = document.getElementById('liveCurrentWordPlural');
  if (wordPlural) wordPlural.innerText = '';

  const wordDef = document.getElementById('liveCurrentWordDef');
  if (wordDef) wordDef.innerText = 'Hệ thống đang gọi mô hình AI tối ưu nhất (Gemini 3.1 Flash Lite) từ Google AI Studio...';

  const ex1 = document.getElementById('liveCurrentWordEx1');
  if (ex1) ex1.innerText = '...';

  const ex2 = document.getElementById('liveCurrentWordEx2');
  if (ex2) ex2.innerText = '...';

  const chipsContainer = document.getElementById('liveWordChipsContainer');
  if (chipsContainer) {
    chipsContainer.innerHTML = '<span class="text-xs text-slate-400 italic">Chưa có từ nào được sinh. Đang gửi yêu cầu...</span>';
  }

  const streamedCount = document.getElementById('liveStreamedCount');
  if (streamedCount) streamedCount.innerText = '0';
}

function showBatchCallingStatus(stt, topicVi, currentCount, target, batchNum, mode) {
  const modeLabel = mode === 'advanced' ? 'C1-C2 Nâng cao' : 'A2-B2 Giao tiếp';
  const startNum = currentCount + 1;
  const endNum = Math.min(target, currentCount + 10);

  const titleEl = document.getElementById('liveRunnerTitle');
  if (titleEl) {
    titleEl.innerText = '⚡ [GEMINI 3.1 FLASH LITE] ĐANG TẠO TỪ ' + startNum + ' - ' + endNum + ' / 100 (' + modeLabel + ')...';
  }

  const nameEl = document.getElementById('liveCurrentWordName');
  if (nameEl) {
    nameEl.innerHTML = '<span class="inline-flex items-center gap-2 text-indigo-700 animate-pulse"><span class="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>Đang phân tích & sinh từ #' + startNum + ' → #' + endNum + '...</span>';
  }

  const ipaEl = document.getElementById('liveCurrentWordIpa');
  if (ipaEl) ipaEl.innerText = '/...tra cứu IPA.../';

  const viEl = document.getElementById('liveCurrentWordVi');
  if (viEl) viEl.innerText = 'Chủ đề: ' + topicVi;

  const defEl = document.getElementById('liveCurrentWordDef');
  if (defEl) defEl.innerText = 'Mô hình Gemini 3.1 Flash Lite đang phân tích ngữ cảnh, tra cứu phiên âm US IPA và tạo câu ví dụ...';
}

function updateLiveWordProgress(item, currentCount, totalTarget = 100, mode = 'conversational', topicVi = '') {
  const trackerBox = document.getElementById('liveWordTrackerBox');
  if (trackerBox) trackerBox.classList.remove('hidden');

  const pct = Math.min(100, Math.round((currentCount / totalTarget) * 100));

  // Cập nhật thanh loading bar chính
  const bar = document.getElementById('liveRunnerBar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.innerText = pct + '% (' + currentCount + '/' + totalTarget + ' từ)';
  }

  // Cập nhật Title chính
  const titleEl = document.getElementById('liveRunnerTitle');
  if (titleEl) {
    const modeLabel = mode === 'advanced' ? 'CHUYÊN SÂU C1-C2' : 'GIAO TIẾP A2-B2';
    titleEl.innerText = '⚡ ĐANG TẠO TỪ VỰNG: ' + (topicVi ? topicVi.toUpperCase() + ' • ' : '') + '[' + currentCount + '/' + totalTarget + ' TỪ - ' + modeLabel + ']';
  }

  // Cập nhật Badge số lượng
  const counterBadge = document.getElementById('liveWordCounterBadge');
  if (counterBadge) {
    counterBadge.innerText = currentCount + ' / ' + totalTarget + ' từ (' + pct + '%)';
  }

  // Cập nhật Phân loại A2-B2 hay C1-C2
  const catBadge = document.getElementById('liveWordCategoryBadge');
  if (catBadge) {
    if (mode === 'advanced') {
      catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-purple-100 text-purple-900';
      catBadge.innerText = 'C1-C2 Nâng cao';
    } else {
      catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-emerald-100 text-emerald-900';
      catBadge.innerText = 'A2-B2 Giao tiếp';
    }
  }

  // Hiển thị chi tiết từ đang tạo
  const word = String(item.word || '').trim().toLowerCase();
  let ipa = String(item.ipa || '').trim();
  if (ipa && !ipa.startsWith('/')) ipa = '/' + ipa.replace(/\//g, '') + '/';
  const vi = String(item.meaning_vi || '').trim();
  const plural = String(item.plural || '').trim();
  const def = String(item.definition || '').trim();
  const ex1 = String(item.example_1 || '').replace(/^[12]\.\s*/, '').trim();
  const ex2 = String(item.example_2 || '').replace(/^[12]\.\s*/, '').trim();

  const nameEl = document.getElementById('liveCurrentWordName');
  if (nameEl) nameEl.innerText = word;

  const ipaEl = document.getElementById('liveCurrentWordIpa');
  if (ipaEl) ipaEl.innerText = ipa;

  const viEl = document.getElementById('liveCurrentWordVi');
  if (viEl) viEl.innerText = vi;

  const pluralEl = document.getElementById('liveCurrentWordPlural');
  if (pluralEl) pluralEl.innerText = plural ? '(số nhiều: ' + plural + ')' : '';

  const defEl = document.getElementById('liveCurrentWordDef');
  if (defEl) defEl.innerText = def;

  const ex1El = document.getElementById('liveCurrentWordEx1');
  if (ex1El) ex1El.innerText = ex1;

  const ex2El = document.getElementById('liveCurrentWordEx2');
  if (ex2El) ex2El.innerText = ex2;

  // Cập nhật khay chips từ vựng
  const chipsContainer = document.getElementById('liveWordChipsContainer');
  if (chipsContainer) {
    if (currentCount === 1) chipsContainer.innerHTML = '';

    const chip = document.createElement('div');
    const chipBg = mode === 'advanced' ? 'bg-purple-100 text-purple-950 border-purple-800' : 'bg-emerald-100 text-emerald-950 border-emerald-800';
    chip.className = 'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono-code font-bold border ' + chipBg + ' rounded-none shadow-[1px_1px_0px_#111]';
    chip.innerHTML = '<span class="text-[10px] text-slate-500 font-extrabold">#' + currentCount + '</span><span class="font-bold underline decoration-slate-400">' + word + '</span><span class="text-[11px] text-slate-600 font-sans font-normal">• ' + vi + '</span>';
    chipsContainer.appendChild(chip);
    chipsContainer.scrollTop = chipsContainer.scrollHeight;
  }

  const streamedCount = document.getElementById('liveStreamedCount');
  if (streamedCount) streamedCount.innerText = String(currentCount);
}

// Hàm gọi Gemini API đa model với cơ chế Fallback tự động & bóc tách JSON an toàn
async function callGeminiApiWithFallback(prompt, geminiKey) {
  const models = [
    'gemini-3.1-flash-lite-preview',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  let lastError = null;
  for (const model of models) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.35 }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error('Model ' + model + ' trả về HTTP ' + res.status + ': ' + errText);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = new Error('Model ' + model + ' không trả về nội dung (finishReason: ' + (data.candidates?.[0]?.finishReason || 'UNKNOWN') + ')');
        continue;
      }

      // Xử lý bóc tách JSON an toàn
      let cleaned = rawText.trim();
      const firstBracket = cleaned.indexOf('[');
      const lastBracket = cleaned.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
      return JSON.parse(cleaned);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Không thể kết nối đến các Gemini model. Vui lòng kiểm tra lại API Key.');
}

async function generateSingleInBrowser(stt, topicVi) {
  let geminiKey = localStorage.getItem('gemini_api_key');
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const ghToken = localStorage.getItem('gh_token');

  if (!geminiKey) {
    const inputKey = prompt('⚡ Để tạo từ vựng trực tiếp trên Web và thấy ngay từng từ sinh ra trong 2 giây, vui lòng dán Gemini API Key (Tier 1) của bạn vào đây:');
    if (inputKey && inputKey.trim()) {
      geminiKey = inputKey.trim();
      localStorage.setItem('gemini_api_key', geminiKey);
      logToConsole('SUCCESS', 'AUTH', 'Đã lưu Gemini API Key thành công!');
    } else {
      openSettings();
      return;
    }
  }

  runnerStartTime = Date.now();
  showLiveRunner('⚡ [WEB REAL-TIME] ĐANG KHỞI TẠO CHỦ ĐỀ #' + stt + ': ' + topicVi.toUpperCase(), 5, 1);
  resetLiveWordTracker(stt, topicVi);
  logToConsole('INFO', 'WEB_GEN', 'Bắt đầu tạo trực tiếp chủ đề #' + stt + ' (' + topicVi + ') bằng Gemini 3.1 Flash Lite...');

  try {
    const collectedConv = [];
    const collectedAdv = [];
    const seen = new Set();

    // 1. Thu thập 50 danh từ thông dụng (A2-B2) qua các đợt lớn (25-30 từ/lần)
    let convBatchIndex = 0;
    let convEmptyStreak = 0;
    while (collectedConv.length < 50 && convBatchIndex < 12 && convEmptyStreak < 3) {
      convBatchIndex++;
      const needed = 50 - collectedConv.length;
      const askCount = Math.max(16, Math.min(30, needed + 6));
      const excludeSample = [...seen].slice(-40);

      showBatchCallingStatus(stt, topicVi, collectedConv.length, 50, convBatchIndex, 'conversational');
      logToConsole('INFO', 'WEB_GEN_CONV', 'Đang xin đợt ' + convBatchIndex + ' (' + askCount + ' từ giao tiếp, đã có: ' + collectedConv.length + '/50)...');

      const prompt = `Generate a JSON array of ${askCount} practical, common English singular nouns (CEFR A2-B2 level, essential daily vocabulary) that directly belong to the category/topic: "${topicVi}".
CRITICAL DOMAIN RULES:
1. Every single word MUST be a concrete English noun representing genuine types, varieties, core elements, key components, or direct items of "${topicVi}".
2. ABSOLUTELY FORBIDDEN: Generic academic essay buzzwords (no "paradigm", "efficacy", "sustainability", "resilience", "framework", "feasibility", "stakeholder").
3. Strictly NO adjectives, NO verbs.
${excludeSample.length ? `Exclude these already generated words: ${excludeSample.join(', ')}.\n` : ''}Each object must have exact keys: "word", "ipa" (enclosed in slashes /.../), "definition", "meaning_vi", "plural", "example_1", "example_2". Return ONLY valid JSON array.`;

      const items = await callGeminiApiWithFallback(prompt, geminiKey);
      if (!Array.isArray(items) || items.length === 0) {
        convEmptyStreak++;
        continue;
      }

      let addedThisBatch = 0;
      for (const item of items) {
        const w = String(item.word || '').trim().toLowerCase();
        if (w && !seen.has(w)) {
          seen.add(w);
          collectedConv.push(item);
          addedThisBatch++;
          updateLiveWordProgress(item, collectedConv.length, 100, 'conversational', topicVi);
          await new Promise(r => setTimeout(r, 45));
          if (collectedConv.length >= 50) break;
        }
      }
      if (addedThisBatch === 0) convEmptyStreak++;
      else convEmptyStreak = 0;
    }
    logToConsole('SUCCESS', 'CONV_OK', 'Pha 1 hoàn thành: ' + collectedConv.length + '/50 từ giao tiếp.');

    // 2. Thu thập 50 danh từ nâng cao/chuyên ngành (B2-C2)
    let advBatchIndex = 0;
    let advEmptyStreak = 0;
    while (collectedAdv.length < 50 && advBatchIndex < 12 && advEmptyStreak < 3) {
      advBatchIndex++;
      const needed = 50 - collectedAdv.length;
      const askCount = Math.max(16, Math.min(30, needed + 6));
      const totalSoFar = collectedConv.length + collectedAdv.length;
      const excludeSample = [...seen].slice(-40);

      showBatchCallingStatus(stt, topicVi, totalSoFar, 100, advBatchIndex, 'advanced');
      logToConsole('INFO', 'WEB_GEN_ADV', 'Đang xin đợt ' + advBatchIndex + ' (' + askCount + ' từ nâng cao, đã có: ' + collectedAdv.length + '/50)...');

      const prompt = `Generate a JSON array of ${askCount} advanced, specialized, prized, or domain-specific English singular nouns (CEFR B2-C2 level, specialized vocabulary) directly belonging to the category/topic: "${topicVi}".
CRITICAL DOMAIN RULES:
1. Every word MUST be a genuine specialized variety, specific sub-type, culinary cut, professional term, key component, or distinct item belonging to "${topicVi}".
2. ABSOLUTELY FORBIDDEN: Generic essay buzzwords (no "paradigm", "efficacy", "sustainability", "resilience", "framework", "feasibility", "modality").
3. Strictly NO adjectives, NO verbs.
${excludeSample.length ? `Exclude these already generated words: ${excludeSample.join(', ')}.\n` : ''}Each object must have exact keys: "word", "ipa" (enclosed in slashes /.../), "definition", "meaning_vi", "plural", "example_1", "example_2". Return ONLY valid JSON array.`;

      const items = await callGeminiApiWithFallback(prompt, geminiKey);
      if (!Array.isArray(items) || items.length === 0) {
        advEmptyStreak++;
        continue;
      }

      let addedThisBatch = 0;
      for (const item of items) {
        const w = String(item.word || '').trim().toLowerCase();
        if (w && !seen.has(w)) {
          seen.add(w);
          collectedAdv.push(item);
          addedThisBatch++;
          const currentTotal = collectedConv.length + collectedAdv.length;
          updateLiveWordProgress(item, currentTotal, 100, 'advanced', topicVi);
          await new Promise(r => setTimeout(r, 45));
          if (collectedAdv.length >= 50) break;
        }
      }
      if (addedThisBatch === 0) advEmptyStreak++;
      else advEmptyStreak = 0;
    }
    logToConsole('SUCCESS', 'ADV_OK', 'Pha 2 hoàn thành: ' + collectedAdv.length + '/50 từ nâng cao.');

    // 3. VÒNG LẶP BẢO HIỂM THÔNG MINH (ADAPTIVE TOP-UP): BẮT BUỘC ĐẠT ĐỦ ĐÚNG 100 TỪ
    let allCollected = [...collectedConv.slice(0, 50), ...collectedAdv.slice(0, 50)];
    let topupIndex = 0;
    while (allCollected.length < 100 && topupIndex < 10) {
      topupIndex++;
      const needed = 100 - allCollected.length;
      const askCount = Math.max(15, Math.min(30, needed + 8));
      const excludeSample = [...seen].slice(-35);

      showBatchCallingStatus(stt, topicVi, allCollected.length, 100, topupIndex, 'topup');
      logToConsole('WARNING', 'WEB_GEN_TOPUP', '[Bảo hiểm 100 từ] Đang bù đắp đợt ' + topupIndex + ' (cần thêm ' + needed + ' từ, đang có: ' + allCollected.length + '/100)...');

      // Mở rộng linh hoạt để quét sạch mọi khía cạnh thực tế của chủ đề
      const prompt = `Generate a JSON array of ${askCount} distinct English singular nouns related to all practical aspects, products, preparations, tools, varieties, and key terminology of "${topicVi}".
CRITICAL RULES: Authentic English nouns only. NO abstract essay fluff ("paradigm", "sustainability"). NO adjectives, NO verbs.
${excludeSample.length ? `Do NOT repeat these words: ${excludeSample.join(', ')}.\n` : ''}Each object must have exact keys: "word", "ipa" (enclosed in slashes /.../), "definition", "meaning_vi", "plural", "example_1", "example_2". Return ONLY valid JSON array.`;

      const items = await callGeminiApiWithFallback(prompt, geminiKey);
      if (!Array.isArray(items) || items.length === 0) continue;

      for (const item of items) {
        const w = String(item.word || '').trim().toLowerCase();
        if (w && !seen.has(w)) {
          seen.add(w);
          allCollected.push(item);
          updateLiveWordProgress(item, allCollected.length, 100, 'topup', topicVi);
          await new Promise(r => setTimeout(r, 45));
          if (allCollected.length >= 100) break;
        }
      }
    }

    // KHÓA BẢO ĐẢM TUYỆT ĐỐI: CHỈ LẤY ĐÚNG 100 TỪ & KHÔNG BAO GIỜ XUẤT FILE THIẾU TỪ
    allCollected = allCollected.slice(0, 100);
    if (allCollected.length < 100) {
      const errMsg = 'Chủ đề #' + stt + ' (' + topicVi + ') chỉ thu thập được ' + allCollected.length + '/100 từ sau nhiều lần thử lại. Hệ thống từ chối lưu file thiếu từ để đảm bảo chất lượng! Vui lòng bấm tạo lại.';
      logToConsole('ERROR', 'INCOMPLETE_BLOCKED', errMsg);
      showLiveRunner('❌ THẤT BẠI: CHỈ ĐẠT ' + allCollected.length + '/100 TỪ (TỪ CHỐI LƯU FILE THIẾU)', 100, 5, true);
      alert(errMsg);
      return;
    }

    const collected = allCollected;

    showLiveRunner('ĐANG ĐÓNG GÓI 9 CỘT TSV CHO ' + collected.length + ' TỪ VỰNG...', 90, 4);
    const lines = collected.map(item => {
      const w = String(item.word || '').trim().toLowerCase();
      const cloze = makeClozeJS(w);
      let ipa = String(item.ipa || '').trim();
      if (!ipa.startsWith('/')) ipa = '/' + ipa.replace(/\//g, '') + '/';
      const sound = makeSoundJS(w);
      const def = String(item.definition || '').replace(/\t|\n/g, ' ').trim();
      const vi = String(item.meaning_vi || '').replace(/\t|\n/g, ' ').trim();
      const plural = String(item.plural || '').trim().toLowerCase();
      const ex1 = String(item.example_1 || '').replace(/^[12]\.\s*/, '').trim();
      const ex2 = String(item.example_2 || '').replace(/^[12]\.\s*/, '').trim();
      return [w, cloze, ipa, sound, def, vi, vi, plural, '1. ' + ex1 + ' <br>2. ' + ex2].join('\t');
    });

    const tsvContent = lines.join('\n') + '\n';

    // Cập nhật thẻ hiển thị từ vựng thành công
    const nameEl = document.getElementById('liveCurrentWordName');
    if (nameEl) nameEl.innerText = '🎉 ĐÃ XUẤT THÀNH CÔNG ĐỦ ' + lines.length + ' TỪ!';
    const viEl = document.getElementById('liveCurrentWordVi');
    if (viEl) viEl.innerText = 'Chủ đề #' + stt + ': ' + topicVi;
    const defEl = document.getElementById('liveCurrentWordDef');
    if (defEl) defEl.innerText = 'Đầy đủ 50 từ giao tiếp (A2-B2) và 50 từ chuyên sâu (C1-C2). Dữ liệu đã sẵn sàng để nhập vào Anki.';

    // Nếu có cấu hình GitHub Token thì đẩy thẳng file lên Repo và cập nhật status.json
    if (owner && repo && ghToken) {
      showLiveRunner('ĐANG LƯU FILE output/' + stt + '.txt LÊN GITHUB...', 95, 5);
      await pushFileToGitHub('output/' + stt + '.txt', tsvContent, 'Generate topic #' + stt + ' (' + topicVi + ') via Web Studio');
      logToConsole('SUCCESS', 'GITHUB_COMMIT', 'Đã lưu output/' + stt + '.txt (' + lines.length + ' từ) lên GitHub!');

      // Tự động đồng bộ status.json lên GitHub
      try {
        showLiveRunner('ĐANG CẬP NHẬT status.json LÊN GITHUB...', 98, 5);
        const statusRes = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/status.json?ref=' + branch, {
          headers: { 'Authorization': 'Bearer ' + ghToken }
        });
        if (statusRes.ok) {
          const statusFileObj = await statusRes.json();
          const currentStatusData = JSON.parse(decodeURIComponent(escape(atob(statusFileObj.content))));
          const topItem = currentStatusData.topics?.find(t => t.stt === Number(stt));
          if (topItem) {
            topItem.status = 'completed';
            topItem.word_count = lines.length;
            topItem.file_path = 'output/' + stt + '.txt';
            topItem.generated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
            topItem.last_error = null;
          }
          currentStatusData.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const updatedStatusStr = JSON.stringify(currentStatusData, null, 2);
          await pushFileToGitHub('status.json', updatedStatusStr, 'Update status.json for topic #' + stt + ' via Web Studio');
          logToConsole('SUCCESS', 'GITHUB_STATUS', 'Đã cập nhật status.json trên GitHub thành công!');
        }
      } catch (stErr) {
        console.warn('Lỗi đồng bộ status.json:', stErr);
      }
    } else {
      // Khi không có GitHub Token: Tải file về máy để người dùng không bị mất dữ liệu
      const blob = new Blob([tsvContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = stt + '.txt';
      a.click();
      logToConsole('WARNING', 'NO_GH_TOKEN', 'Đã tải ' + stt + '.txt về máy. Để tự động lưu lên GitHub Pages, bạn hãy nhập GitHub Token vào mục ⚙️ Cấu hình API.');
    }

    // Cập nhật UI ngay lập tức
    const targetObj = allTopics.find(t => t.stt === Number(stt));
    if (targetObj) {
      targetObj.status = 'completed';
      targetObj.word_count = lines.length;
      targetObj.generated_at = new Date().toLocaleString('vi-VN');
      targetObj.last_error = null;
    }
    updateDashboardUI();
    renderGridMap();
    applyFiltersAndRender();
    showLiveRunner('🎉 HOÀN TẤT CHỦ ĐỀ #' + stt + ': ' + topicVi.toUpperCase() + ' (' + lines.length + ' TỪ)!', 100, 5, false);
  } catch (e) {
    showLiveRunner('❌ LỖI KHI TẠO CHỦ ĐỀ #' + stt + ': ' + e.message, 100, 3, true);
    logToConsole('ERROR', 'WEB_GEN_FAIL', 'Chủ đề #' + stt + ' (' + topicVi + ') thất bại: ' + e.message);
    toggleConsoleDrawer(true);
  }
}async function pushFileToGitHub(path, contentText, commitMessage) {
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const token = localStorage.getItem('gh_token');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha = undefined;
  const getRes = await fetch(apiUrl + `?ref=${branch}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (getRes.ok) {
    const fData = await getRes.json();
    sha = fData.sha;
  }

  const base64Content = btoa(unescape(encodeURIComponent(contentText)));
  const bodyObj = { message: commitMessage, content: base64Content, branch };
  if (sha) bodyObj.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyObj)
  });
  if (!putRes.ok) throw new Error(await putRes.text());
}

function openSettings() {
  document.getElementById('ghOwner').value = localStorage.getItem('gh_owner') || 'lev24197';
  document.getElementById('ghRepo').value = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  document.getElementById('ghBranch').value = localStorage.getItem('gh_branch') || 'main';
  document.getElementById('ghToken').value = localStorage.getItem('gh_token') || '';
  document.getElementById('geminiKeyInput').value = localStorage.getItem('gemini_api_key') || '';
  document.getElementById('settingsModal').classList.remove('hidden');
  document.getElementById('settingsModal').classList.add('flex');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
  document.getElementById('settingsModal').classList.remove('flex');
}

function saveSettings() {
  localStorage.setItem('gh_owner', document.getElementById('ghOwner').value.trim() || 'lev24197');
  localStorage.setItem('gh_repo', document.getElementById('ghRepo').value.trim() || 'vinhdeptrai');
  localStorage.setItem('gh_branch', document.getElementById('ghBranch').value.trim() || 'main');
  localStorage.setItem('gh_token', document.getElementById('ghToken').value.trim());
  localStorage.setItem('gemini_api_key', document.getElementById('geminiKeyInput').value.trim());
  closeSettings();
  logToConsole('SUCCESS', 'CONFIG', 'Đã cập nhật cấu hình GitHub & Gemini API Key.');
}
