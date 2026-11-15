// ==================== ĐIỀU KHIỂN GITHUB ACTIONS & TẠO TỪ REAL-TIME ====================

// ==================== GLOBAL TOP PROGRESS BAR & RUNNER CONTROLLERS ====================

function getOrCreateGlobalTopProgressBar() {
  let bar = document.getElementById('globalTopProgressBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'globalTopProgressBar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    bar.className = 'fixed top-0 left-0 right-0 h-[3.5px] z-[99999] pointer-events-none transition-all duration-300';
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.right = '0';
    bar.style.height = '3.5px';
    bar.style.zIndex = '99999';
    bar.style.width = '0%';
    bar.style.pointerEvents = 'none';
    bar.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
    bar.style.opacity = '0';
    bar.style.background = 'linear-gradient(90deg, #6366f1, #38bdf8, #34d399)';
    bar.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.5)';
    if (document.body) {
      document.body.prepend(bar);
    }
  }
  return bar;
}

function updateGlobalLoadingBar(pct, title = '', isError = false) {
  let el = document.getElementById('globalTopProgressBar');
  if (!el) {
    el = getOrCreateGlobalTopProgressBar();
  }
  if (!el) return;

  const clampedPct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  el.setAttribute('aria-valuenow', String(clampedPct));
  if (title) el.setAttribute('title', title);

  const inner = el.querySelector('[role="progressbar"], .progress-bar, div') || el;

  el.style.opacity = '1';
  el.classList.remove('hidden');

  if (inner !== el) {
    el.style.width = '100%';
    inner.style.width = `${clampedPct}%`;
  } else {
    el.style.width = `${clampedPct}%`;
  }

  if (isError) {
    const errorBg = 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)';
    inner.style.background = errorBg;
    inner.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.7)';
    if (inner.classList) {
      inner.classList.add('bg-rose-600');
    }
  } else {
    if (clampedPct >= 100) {
      const finishBg = 'linear-gradient(90deg, #10b981, #059669)';
      inner.style.background = finishBg;
      inner.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.7)';
    } else {
      const activeBg = 'linear-gradient(90deg, #6366f1, #38bdf8, #34d399)';
      inner.style.background = activeBg;
      inner.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.5)';
    }
  }

  if (clampedPct >= 100 && !isError) {
    setTimeout(() => {
      if (el.getAttribute('aria-valuenow') === '100') {
        hideGlobalLoadingBar();
      }
    }, 1200);
  }
}

function hideGlobalLoadingBar() {
  const el = document.getElementById('globalTopProgressBar');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    if (el.style.opacity === '0') {
      const inner = el.querySelector('[role="progressbar"], .progress-bar, div') || el;
      inner.style.width = '0%';
      el.setAttribute('aria-valuenow', '0');
    }
  }, 350);
}

window.getOrCreateGlobalTopProgressBar = getOrCreateGlobalTopProgressBar;
window.updateGlobalLoadingBar = updateGlobalLoadingBar;
window.hideGlobalLoadingBar = hideGlobalLoadingBar;

function showLiveRunner(title, pct, stepIndex, isError = false) {
  // Luôn cập nhật thanh tiến trình top bar toàn cục
  updateGlobalLoadingBar(pct, title, isError);

  const banner = document.getElementById('liveRunnerBanner');
  if (!banner) return;

  const wasHidden = banner.classList.contains('hidden') || banner.style.display === 'none';
  banner.classList.remove('hidden');
  banner.style.display = '';

  // Cuộn mượt đến banner khi mới bắt đầu chạy tiến trình
  if (wasHidden || stepIndex === 1 || pct <= 15) {
    try {
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }

  const titleEl = document.getElementById('liveRunnerTitle');
  if (titleEl) titleEl.innerText = title;

  const bar = document.getElementById('liveRunnerBar');
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.innerText = `${pct}%`;

    if (isError) {
      bar.className = 'h-full bg-rose-600 transition-all duration-300 flex items-center justify-end pr-2 text-xs font-mono-code font-extrabold text-white rounded-full';
    } else {
      bar.className = 'h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 flex items-center justify-end pr-2 text-xs font-mono-code font-extrabold text-white rounded-full';
    }
  }

  const badge = document.getElementById('liveRunnerBadge');
  if (badge) {
    if (isError) {
      badge.className = 'px-2.5 py-0.5 bg-rose-600 text-white font-mono-code text-xs font-bold uppercase rounded-full';
      badge.innerText = 'ERROR';
    } else {
      badge.className = 'px-2.5 py-0.5 bg-indigo-600 text-white font-mono-code text-xs font-bold uppercase rounded-full';
      badge.innerText = 'LIVE RUNNER';
    }
  }

  // Cập nhật cả 2 chuẩn hiển thị bước: step-i (legacy) và stepIndicatorI (modern clean SaaS)
  for (let i = 1; i <= 5; i++) {
    const elLegacy = document.getElementById('step-' + i);
    const elModern = document.getElementById('stepIndicator' + i);
    const iconEl = document.getElementById('stepIcon' + i);
    const elements = [elLegacy, elModern].filter(Boolean);
    if (elements.length === 0) continue;

    const isPast = i < stepIndex;
    const isCurrent = i === stepIndex;

    elements.forEach(el => {
      if (isPast) {
        el.className = 'p-2.5 border border-emerald-500/80 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-between gap-2 transition-all';
      } else if (isCurrent) {
        if (isError) {
          el.className = 'p-2.5 border border-rose-500 rounded-xl bg-rose-50 text-rose-800 font-bold flex items-center justify-between gap-2 animate-pulse transition-all';
        } else {
          el.className = 'p-2.5 border-2 border-indigo-600 rounded-xl bg-indigo-50 text-indigo-900 font-extrabold flex items-center justify-between gap-2 shadow-xs transition-all';
        }
      } else {
        el.className = 'p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/70 text-slate-500 flex items-center justify-between gap-2 transition-all';
      }
    });

    if (iconEl) {
      if (isPast) {
        iconEl.textContent = '✓ XONG';
        iconEl.className = 'uppercase text-emerald-600 font-extrabold text-[10px]';
      } else if (isCurrent) {
        iconEl.textContent = isError ? '✕ LỖI' : '● ĐANG CHẠY';
        iconEl.className = isError ? 'uppercase text-rose-600 font-extrabold text-[10px]' : 'uppercase text-indigo-600 font-extrabold text-[10px] animate-pulse';
      } else {
        iconEl.textContent = '[CHỜ]';
        iconEl.className = 'uppercase text-slate-400 font-normal text-[10px]';
      }
    }
  }
}
window.showLiveRunner = showLiveRunner;

async function triggerWorkflow(batchSize, targetStt) {
  activeWorkflowTargetStt = targetStt || '';
  const owner = (localStorage.getItem('gh_owner') && localStorage.getItem('gh_owner') !== 'letuanvinh') ? localStorage.getItem('gh_owner') : 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const fallbackTok = typeof DEFAULT_GH_TOKEN !== 'undefined' ? DEFAULT_GH_TOKEN : (typeof window !== 'undefined' && window.DEFAULT_GH_TOKEN ? window.DEFAULT_GH_TOKEN : '');
  const token = (typeof getGitHubToken === 'function' ? getGitHubToken() : '') || (localStorage.getItem('gh_token') || '') || fallbackTok;

  if (!owner || !repo || !token) {
    alert('Vui lòng bấm "Cấu hình API" và điền Owner, Repo, GitHub Token trước!');
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
  const owner = (localStorage.getItem('gh_owner') && localStorage.getItem('gh_owner') !== 'letuanvinh') ? localStorage.getItem('gh_owner') : 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const fallbackTok = typeof DEFAULT_GH_TOKEN !== 'undefined' ? DEFAULT_GH_TOKEN : (typeof window !== 'undefined' && window.DEFAULT_GH_TOKEN ? window.DEFAULT_GH_TOKEN : '');
  const token = (typeof getGitHubToken === 'function' ? getGitHubToken() : '') || (localStorage.getItem('gh_token') || '') || fallbackTok;
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

          showLiveRunner('[MÁY ẢO GITHUB] ĐANG GỌI GEMINI 3.1 FLASH LITE TẠO 100 TỪ VỰNG...', estPct, stepIdx);

          const trackerBox = document.getElementById('liveWordTrackerBox');
          if (trackerBox) trackerBox.classList.remove('hidden');

          const counterBadge = document.getElementById('liveWordCounterBadge');
          if (counterBadge) counterBadge.innerText = estWords + ' / 100 từ (~' + estPct + '%) • Đang chạy trên GitHub Runner';

          const catBadge = document.getElementById('liveWordCategoryBadge');
          if (catBadge) {
            catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-indigo-100 text-indigo-900';
            catBadge.innerText = '100 từ chuẩn (~' + estWords + '/100)';
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
          stepIdx = 4;
          showLiveRunner('ĐANG GHI DỮ LIỆU: COMMIT & PUSH LÊN GITHUB REPO...', pct, stepIdx);
        } else {
          showLiveRunner('ĐANG CHẠY BƯỚC: ' + stepName.toUpperCase(), pct, stepIdx);
        }
        logToConsole('INFO', 'STEP_PROGRESS', 'GitHub Runner đang thực thi: ' + stepName);
      }
    } else if (run.status === 'completed') {
      if (actionPollTimer) { clearInterval(actionPollTimer); actionPollTimer = null; }
      if (run.conclusion === 'success') {
        showLiveRunner('[HOÀN TẤT] TẠO TỪ VỰNG! ĐANG ĐỒNG BỘ DỮ LIỆU...', 100, 5, false);
        logToConsole('SUCCESS', 'WORKFLOW_DONE', 'Job #' + run.id + ' đã hoàn thành xuất sắc!');
        syncCompletedWordsFromGitHub(owner, repo, branch, token, activeWorkflowTargetStt);
        setTimeout(() => {
          loadData(false);
        }, 1500);
      } else {
        showLiveRunner('[THẤT BẠI] TIẾN TRÌNH (' + run.conclusion.toUpperCase() + ') — XEM CHI TIẾT TRONG BẢNG LOG', 100, 3, true);
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
        chip.innerHTML = '<span class="text-xs text-zinc-500 font-extrabold">#' + (idx + 1) + '</span><span class="font-bold underline decoration-zinc-400">' + word + '</span><span class="text-xs text-zinc-700 font-sans font-normal">• ' + vi + '</span>';
        chipsContainer.appendChild(chip);
      });
      chipsContainer.scrollTop = chipsContainer.scrollHeight;
    }

    const streamedCount = document.getElementById('liveStreamedCount');
    if (streamedCount) streamedCount.innerText = String(lines.length);

    const counterBadge = document.getElementById('liveWordCounterBadge');
    if (counterBadge) counterBadge.innerText = lines.length + ' / 100 từ (100%)';

    const nameEl = document.getElementById('liveCurrentWordName');
    if (nameEl) nameEl.innerText = '[HOÀN TẤT] ĐỦ ' + lines.length + ' TỪ VỰNG CHO CHỦ ĐỀ #' + stt + '!';

    const viEl = document.getElementById('liveCurrentWordVi');
    if (viEl) viEl.innerText = 'Đã lưu file output/' + stt + '.txt lên GitHub thành công';

    const defEl = document.getElementById('liveCurrentWordDef');
    if (defEl) defEl.innerText = '100 danh từ chuẩn bám sát chủ đề. Dữ liệu đã sẵn sàng để học và nhập Anki.';
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
  showLiveRunner(`[BẮT ĐẦU] ĐANG KHỞI ĐỘNG CHỦ ĐỀ #${pending.stt}: ${pending.topic.toUpperCase()}`, 5, 1);
  updateGlobalLoadingBar(5, `Bắt đầu tạo chủ đề #${pending.stt}...`);
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
    catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-indigo-100 text-indigo-900';
    catBadge.innerText = '100 từ chuẩn bám sát chủ đề';
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
  const modeLabel = mode || '100 từ chuẩn';
  const startNum = currentCount + 1;
  const endNum = Math.min(target, currentCount + 10);

  const titleEl = document.getElementById('liveRunnerTitle');
  if (titleEl) {
    titleEl.innerText = '[GEMINI 3.1 FLASH LITE] ĐANG TẠO TỪ ' + startNum + ' - ' + endNum + ' / 100 (' + modeLabel + ')...';
  }

  const nameEl = document.getElementById('liveCurrentWordName');
  if (nameEl) {
    nameEl.innerHTML = '<span class="inline-flex items-center gap-2 text-[#0F766E] font-bold">Đang phân tích & sinh từ #' + startNum + ' - #' + endNum + '...</span>';
  }

  const ipaEl = document.getElementById('liveCurrentWordIpa');
  if (ipaEl) ipaEl.innerText = '/...tra cứu IPA.../';

  const viEl = document.getElementById('liveCurrentWordVi');
  if (viEl) viEl.innerText = 'Chủ đề: ' + topicVi;

  const defEl = document.getElementById('liveCurrentWordDef');
  if (defEl) defEl.innerText = 'Mô hình Gemini 3.1 Flash Lite đang phân tích ngữ cảnh, tra cứu phiên âm US IPA và tạo câu ví dụ...';
}

function updateLiveWordProgress(item, currentCount, totalTarget = 100, mode = '100 từ chuẩn', topicVi = '') {
  const trackerBox = document.getElementById('liveWordTrackerBox');
  if (trackerBox) trackerBox.classList.remove('hidden');

  const pct = Math.min(100, Math.round((currentCount / totalTarget) * 100));
  const streamPct = Math.max(10, Math.min(88, Math.round(10 + (currentCount / totalTarget) * 78)));
  const modeLabel = mode || '100 TỪ CHUẨN';
  const streamTitle = '[ĐANG TẠO TỪ VỰNG] ' + (topicVi ? topicVi.toUpperCase() + ' • ' : '') + '[' + currentCount + '/' + totalTarget + ' TỪ - ' + modeLabel + ']';

  showLiveRunner(streamTitle, streamPct, 3);
  updateGlobalLoadingBar(streamPct, `Đang sinh từ #${currentCount}/${totalTarget}...`);

  // Cập nhật thanh loading bar chính
  const bar = document.getElementById('liveRunnerBar');
  if (bar) {
    bar.style.width = streamPct + '%';
    bar.innerText = streamPct + '% (' + currentCount + '/' + totalTarget + ' từ)';
  }

  // Cập nhật Title chính
  const titleEl = document.getElementById('liveRunnerTitle');
  if (titleEl) {
    titleEl.innerText = streamTitle;
  }

  // Cập nhật Badge số lượng
  const counterBadge = document.getElementById('liveWordCounterBadge');
  if (counterBadge) {
    counterBadge.innerText = currentCount + ' / ' + totalTarget + ' từ (' + pct + '%)';
  }

  // Cập nhật Phân loại
  const catBadge = document.getElementById('liveWordCategoryBadge');
  if (catBadge) {
    catBadge.className = 'px-2 py-0.5 font-bold border border-[#111] bg-indigo-100 text-indigo-900';
    catBadge.innerText = mode || '100 từ chuẩn';
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
    chip.innerHTML = '<span class="text-xs text-zinc-500 font-extrabold">#' + currentCount + '</span><span class="font-bold underline decoration-zinc-400">' + word + '</span><span class="text-xs text-zinc-700 font-sans font-normal">• ' + vi + '</span>';
    chipsContainer.appendChild(chip);
    chipsContainer.scrollTop = chipsContainer.scrollHeight;
  }

  const streamedCount = document.getElementById('liveStreamedCount');
  if (streamedCount) streamedCount.innerText = String(currentCount);
}

let cachedWorkingModel = null;

// Hàm gọi Gemini API đa model với cơ chế Fallback tự động & bóc tách JSON an toàn
async function callGeminiApiWithFallback(prompt, geminiKey, temperature = 0.65) {
  const preferredModel = localStorage.getItem('gemini_model') || 'gemini-3.1-flash-lite';
  const candidateModels = [
    cachedWorkingModel,
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  const models = [...new Set(candidateModels)];
  let lastError = null;
  for (const model of models) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: temperature }
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
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedWorkingModel = model;
        return parsed;
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Không thể kết nối đến các Gemini model. Vui lòng kiểm tra lại API Key.');
}

async function generateSingleInBrowser(stt, topicVi) {
  runnerStartTime = Date.now();
  showLiveRunner('[WEB REAL-TIME] ĐANG KHỞI TẠO CHỦ ĐỀ #' + stt + ': ' + (topicVi || '').toUpperCase(), 5, 1);
  updateGlobalLoadingBar(5, 'Khởi tạo chủ đề #' + stt + '...');
  resetLiveWordTracker(stt, topicVi);

  let geminiKey = typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : (localStorage.getItem('gemini_api_key') || '');
  const owner = (localStorage.getItem('gh_owner') && localStorage.getItem('gh_owner') !== 'letuanvinh') ? localStorage.getItem('gh_owner') : 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const fallbackTok = typeof DEFAULT_GH_TOKEN !== 'undefined' ? DEFAULT_GH_TOKEN : (typeof window !== 'undefined' && window.DEFAULT_GH_TOKEN ? window.DEFAULT_GH_TOKEN : '');
  const ghToken = (typeof getGitHubToken === 'function' ? getGitHubToken() : '') || (localStorage.getItem('gh_token') || '') || fallbackTok;
  const preferredModel = localStorage.getItem('gemini_model') || 'gemini-3.1-flash-lite';

  if (!geminiKey) {
    const inputKey = prompt('Để tạo từ vựng trực tiếp trên Web và thấy ngay từng từ sinh ra trong 2 giây, vui lòng dán Gemini API Key (Tier 1) của bạn vào đây:');
    if (inputKey && inputKey.trim()) {
      geminiKey = inputKey.trim();
      localStorage.setItem('gemini_api_key', geminiKey);
      logToConsole('SUCCESS', 'AUTH', 'Đã lưu Gemini API Key thành công!');
    } else {
      openSettings();
      return;
    }
  }

  logToConsole('INFO', 'WEB_GEN', 'Bắt đầu tạo trực tiếp chủ đề #' + stt + ' (' + topicVi + ') bằng model ' + preferredModel + '...');

  try {
    const collected = [];
    const seen = new Set();

    // PROMPT 1: Yêu cầu 105 danh từ tiếng Anh số ít riêng biệt bám sát chủ đề topicVi
    showBatchCallingStatus(stt, topicVi, collected.length, 100, 1, '100 danh từ chuẩn');
    logToConsole('INFO', 'WEB_GEN_PROMPT1', 'Đang gửi Prompt 1 yêu cầu 105 danh từ bám sát chủ đề "' + topicVi + '"...');

    const prompt1 = `Generate a JSON array of 105 distinct English singular nouns strictly belonging to the topic/category: "${topicVi}".
CRITICAL DOMAIN RULES:
1. Every word MUST directly, authentically, and concretely belong to the domain/category of "${topicVi}".
2. Concrete English singular nouns only (NO adjectives, NO verbs, NO adverbs).
3. ABSOLUTELY FORBIDDEN: General academic meta-words or abstract essay buzzwords ("paradigm", "efficacy", "sustainability", "resilience", "framework", "feasibility", "stakeholder", "amelioration", "optimization").
Each object in the array must have the following exact keys:
"word": English singular noun (lowercase),
"ipa": US phonetic transcription enclosed in slashes (e.g. /.../),
"definition": concise English definition,
"meaning_vi": natural Vietnamese translation of the noun in this specific topic context,
"plural": plural form of the noun,
"example_1": natural contextual English sentence using the word,
"example_2": another natural contextual English sentence using the word.
Return ONLY the raw valid JSON array.`;

    try {
      const items1 = await callGeminiApiWithFallback(prompt1, geminiKey, 0.65);
      if (Array.isArray(items1)) {
        for (const item of items1) {
          const w = String(item.word || '').trim().toLowerCase();
          if (w && !seen.has(w)) {
            seen.add(w);
            collected.push(item);
            updateLiveWordProgress(item, collected.length, 100, '100 từ chuẩn', topicVi);
            await new Promise(r => setTimeout(r, 40));
            if (collected.length >= 100) break;
          }
        }
      }
    } catch (e1) {
      logToConsole('WARNING', 'PROMPT1_ERR', 'Prompt 1 gặp lỗi: ' + e1.message);
    }

    logToConsole('INFO', 'WEB_GEN_P1_STATUS', 'Kết quả Prompt 1: Đã thu thập ' + collected.length + '/100 từ.');

    // PROMPT 2: Chỉ chạy khi Prompt 1 chưa đủ 100 từ, tối đa 2 prompts tổng cộng
    if (collected.length < 100) {
      const needed = 100 - collected.length;
      showBatchCallingStatus(stt, topicVi, collected.length, 100, 2, 'Bù đắp từ vựng');
      logToConsole('WARNING', 'WEB_GEN_PROMPT2', 'Đang gửi Prompt 2 để bù đắp (cần thêm ' + needed + ' từ, hiện có ' + collected.length + '/100)...');

      const excludeStr = seen.size > 0 ? `STRICTLY DO NOT REPEAT ANY of these already generated words (${seen.size} words): ${[...seen].join(', ')}.\n` : '';
      const prompt2 = `Generate a JSON array of 100 distinct English singular nouns strictly belonging to the topic/category: "${topicVi}".
CRITICAL DOMAIN RULES:
1. Every word MUST directly, authentically, and concretely belong to the domain/category of "${topicVi}".
2. Concrete English singular nouns only (NO adjectives, NO verbs, NO adverbs).
3. ABSOLUTELY FORBIDDEN: General academic meta-words or abstract essay buzzwords ("paradigm", "efficacy", "sustainability", "resilience", "framework", "feasibility", "stakeholder", "amelioration", "optimization").
${excludeStr}Each object in the array must have the following exact keys:
"word": English singular noun (lowercase),
"ipa": US phonetic transcription enclosed in slashes (e.g. /.../),
"definition": concise English definition,
"meaning_vi": natural Vietnamese translation of the noun in this specific topic context,
"plural": plural form of the noun,
"example_1": natural contextual English sentence using the word,
"example_2": another natural contextual English sentence using the word.
Return ONLY the raw valid JSON array.`;

      try {
        const items2 = await callGeminiApiWithFallback(prompt2, geminiKey, 0.75);
        if (Array.isArray(items2)) {
          for (const item of items2) {
            const w = String(item.word || '').trim().toLowerCase();
            if (w && !seen.has(w)) {
              seen.add(w);
              collected.push(item);
              updateLiveWordProgress(item, collected.length, 100, 'Bù đắp từ vựng', topicVi);
              await new Promise(r => setTimeout(r, 40));
              if (collected.length >= 100) break;
            }
          }
        }
      } catch (e2) {
        logToConsole('WARNING', 'PROMPT2_ERR', 'Prompt 2 gặp lỗi: ' + e2.message);
      }
    }

    // Khóa cắt chuẩn xác đúng 100 từ
    const finalItems = collected.slice(0, 100);
    if (finalItems.length < 100) {
      const errMsg = 'Chủ đề #' + stt + ' (' + topicVi + ') chỉ đạt ' + finalItems.length + '/100 từ. Vui lòng bấm tạo lại!';
      logToConsole('ERROR', 'INCOMPLETE_BLOCKED', errMsg);
      showLiveRunner('[THẤT BẠI] CHỈ ĐẠT ' + finalItems.length + '/100 TỪ', 100, 5, true);
      alert(errMsg);
      return;
    }

    const collectedNouns = finalItems;

    showLiveRunner('ĐANG ĐÓNG GÓI 9 CỘT TSV CHO ' + collectedNouns.length + ' TỪ VỰNG...', 90, 4);
    updateGlobalLoadingBar(90, 'Đang đóng gói 9 cột TSV...');
    const lines = finalItems.map(item => {
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
    if (nameEl) nameEl.innerText = '[THÀNH CÔNG] ĐÃ XUẤT ĐỦ ' + lines.length + ' TỪ!';
    const viEl = document.getElementById('liveCurrentWordVi');
    if (viEl) viEl.innerText = 'Chủ đề #' + stt + ': ' + topicVi;
    const defEl = document.getElementById('liveCurrentWordDef');
    if (defEl) defEl.innerText = '100 danh từ chuẩn bám sát chủ đề. Dữ liệu đã sẵn sàng để học và nhập Anki.';

    // Nếu có cấu hình GitHub Token thì đẩy thẳng file lên Repo và cập nhật status.json
    if (owner && repo && ghToken) {
      showLiveRunner('ĐANG LƯU FILE output/' + stt + '.txt LÊN GITHUB...', 95, 5);
      updateGlobalLoadingBar(95, 'Đang lưu output/' + stt + '.txt lên GitHub...');
      await pushFileToGitHub('output/' + stt + '.txt', tsvContent, 'Generate topic #' + stt + ' (' + topicVi + ') via Web Studio');
      logToConsole('SUCCESS', 'GITHUB_COMMIT', 'Đã lưu output/' + stt + '.txt (' + lines.length + ' từ) lên GitHub!');

      // Tự động đồng bộ status.json lên GitHub
      try {
        showLiveRunner('ĐANG CẬP NHẬT status.json LÊN GITHUB...', 98, 5);
        updateGlobalLoadingBar(98, 'Đang cập nhật status.json...');
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
      logToConsole('WARNING', 'NO_GH_TOKEN', 'Đã tải ' + stt + '.txt về máy. Để tự động lưu lên GitHub Pages, bạn hãy nhập GitHub Token vào mục Cấu hình API.');
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
    showLiveRunner('[HOÀN TẤT] CHỦ ĐỀ #' + stt + ': ' + topicVi.toUpperCase() + ' (' + lines.length + ' TỪ)!', 100, 5, false);
    updateGlobalLoadingBar(100, 'Hoàn tất chủ đề #' + stt + '!', false);
  } catch (e) {
    showLiveRunner('[LỖI] KHI TẠO CHỦ ĐỀ #' + stt + ': ' + e.message, 100, 3, true);
    updateGlobalLoadingBar(100, 'Lỗi: ' + e.message, true);
    logToConsole('ERROR', 'WEB_GEN_FAIL', 'Chủ đề #' + stt + ' (' + topicVi + ') thất bại: ' + e.message);
    toggleConsoleDrawer(true);
  }
}

