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
  if (!owner || !repo || !token) return;

  if (runnerStartTime) {
    const sec = Math.floor((Date.now() - runnerStartTime) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    const timerEl = document.getElementById('liveRunnerTimer');
    if (timerEl) timerEl.innerText = `${mm}:${ss}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const run = data.workflow_runs?.[0];
    if (!run) return;

    const ghLink = document.getElementById('liveRunnerGhLink');
    if (ghLink) ghLink.href = run.html_url;

    if (run.status === 'queued') {
      showLiveRunner('ĐANG XẾP HÀNG CHỜ MÁY ẢO GITHUB ACTIONS...', 20, 1);
    } else if (run.status === 'in_progress') {
      const jobsRes = await fetch(run.jobs_url, { headers: { 'Authorization': `Bearer ${token}` } });
      const jobsData = await jobsRes.json();
      const job = jobsData.jobs?.[0];
      if (job && job.steps) {
        const activeStep = job.steps.find(s => s.status === 'in_progress') || job.steps[job.steps.length - 1];
        const stepName = activeStep ? activeStep.name : 'Đang xử lý...';
        let pct = 45, stepIdx = 2;
        if (stepName.includes('Install')) { pct = 40; stepIdx = 2; }
        else if (stepName.includes('Run Anki Generator')) { pct = 70; stepIdx = 3; }
        else if (stepName.includes('Commit')) { pct = 90; stepIdx = 5; }

        showLiveRunner(`ĐANG CHẠY BƯỚC: ${stepName.toUpperCase()}`, pct, stepIdx);
        logToConsole('INFO', 'STEP_PROGRESS', `GitHub Runner đang thực thi: ${stepName}`);
      }
    } else if (run.status === 'completed') {
      if (actionPollTimer) { clearInterval(actionPollTimer); actionPollTimer = null; }
      if (run.conclusion === 'success') {
        showLiveRunner('🎉 HOÀN TẤT TẠO TỪ VỰNG! ĐANG ĐỒNG BỘ DỮ LIỆU...', 100, 5, false);
        logToConsole('SUCCESS', 'WORKFLOW_DONE', `Job #${run.id} đã hoàn thành xuất sắc!`);
        setTimeout(() => {
          loadData(false);
          setTimeout(() => document.getElementById('liveRunnerBanner')?.classList.add('hidden'), 5000);
        }, 2000);
      } else {
        showLiveRunner(`❌ TIẾN TRÌNH THẤT BẠI (${run.conclusion.toUpperCase()}) — XEM CHI TIẾT TRONG BẢNG LOG`, 100, 3, true);
        logToConsole('ERROR', 'WORKFLOW_FAILED', `Job #${run.id} bị dừng với trạng thái: ${run.conclusion}. Hãy bấm "Mở GitHub Log" hoặc kiểm tra run_logs.json.`);
        toggleConsoleDrawer(true);
        loadData(false);
      }
    }
  } catch (e) {}
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

async function generateSingleInBrowser(stt, topicVi) {
  const geminiKey = localStorage.getItem('gemini_api_key');
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const ghToken = localStorage.getItem('gh_token');

  if (!geminiKey) {
    alert('Để tạo trực tiếp trên trình duyệt kèm thanh tiến trình Real-time, bạn hãy điền Gemini API Key trong mục ⚙️ Cấu hình API nhé!');
    openSettings();
    return;
  }

  runnerStartTime = Date.now();
  showLiveRunner(`⚡ [WEB REAL-TIME] ĐANG KHỞI TẠO CHỦ ĐỀ #${stt}: ${topicVi.toUpperCase()}`, 15, 1);
  logToConsole('INFO', 'WEB_GEN', `Bắt đầu tạo trực tiếp chủ đề #${stt} (${topicVi}) ngay trên trình duyệt...`);

  try {
    const collectedConv = [];
    const collectedAdv = [];
    const seen = new Set();

    // 1. Thu thập 50 danh từ giao tiếp thông dụng (A2-B2)
    showLiveRunner(`⚡ [1/2] ĐANG TẠO 50 DANH TỪ GIAO TIẾP CHO "${topicVi.toUpperCase()}"...`, 35, 3);
    logToConsole('INFO', 'WEB_GEN_CONV', `Đang xin 50 danh từ giao tiếp thông dụng (A2-B2)...`);
    for (let attempt = 1; attempt <= 2; attempt++) {
      const needed = 50 - collectedConv.length;
      if (needed <= 0) break;
      const askCount = Math.min(35, needed + 5);
      const prompt = `Generate a JSON array of ${askCount} practical, common conversational English singular nouns (CEFR A2-B2 level, daily communication & spoken English) related to the topic: "${topicVi}". Exclude: ${[...seen].join(', ') || 'None'}. Each object must have exact keys: "word", "ipa" (enclosed in slashes /.../), "definition", "meaning_vi", "plural", "example_1", "example_2". Return ONLY valid JSON array.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
        })
      });
      if (!res.ok) throw new Error(`Gemini API trả về HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const items = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]');
      for (const item of items) {
        const w = String(item.word || '').trim().toLowerCase();
        if (w && !seen.has(w)) {
          seen.add(w);
          collectedConv.push(item);
          if (collectedConv.length === 50) break;
        }
      }
    }
    logToConsole('SUCCESS', 'CONV_OK', `Đã thu thập được ${collectedConv.length}/50 từ giao tiếp.`);

    // 2. Thu thập 50 danh từ nâng cao chuyên ngành (C1-C2 / Thuật ngữ chuyên môn bám sát chủ đề)
    showLiveRunner(`⚡ [2/2] ĐANG TẠO 50 DANH TỪ KỸ THUẬT NÂNG CAO CHO "${topicVi.toUpperCase()}"...`, 70, 3);
    logToConsole('INFO', 'WEB_GEN_ADV', `Đang xin 50 danh từ kỹ thuật nâng cao chuyên ngành (C1-C2) bám sát thực tế...`);
    for (let attempt = 1; attempt <= 2; attempt++) {
      const needed = 50 - collectedAdv.length;
      if (needed <= 0) break;
      const askCount = Math.min(35, needed + 5);
      const prompt = `Generate a JSON array of ${askCount} advanced, technical, and domain-specific English nouns (single or standard compound nouns, CEFR C1-C2 level) directly and physically belonging to the topic: "${topicVi}".
CRITICAL REQUIREMENTS:
1. Every word MUST be a concrete, technical, or specialized NOUN representing real physical structures, specialized components, equipment, materials, facilities, or distinct sub-types in this specific domain ("${topicVi}").
2. STRICTLY FORBIDDEN - DO NOT use generic academic essay meta-words or abstract qualities such as: 'paradigm', 'efficacy', 'amelioration', 'prognosis', 'disbursement', 'constraint', 'resilience', 'sustainability', 'governance', 'policy', 'framework', 'incentive', 'stakeholder', 'trajectory', 'optimization', 'vulnerability', 'scalability', 'interoperability', 'modality', 'feasibility'.
3. NO adjectives, NO verbs. Must be 100% authentic domain nouns an engineer, field technician, or domain specialist would use.
Exclude already used words: ${[...seen].join(', ') || 'None'}.
Each object must have exact keys: "word", "ipa" (enclosed in slashes /.../), "definition", "meaning_vi", "plural", "example_1", "example_2". Return ONLY valid JSON array.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
        })
      });
      if (!res.ok) throw new Error(`Gemini API trả về HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const items = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]');
      for (const item of items) {
        const w = String(item.word || '').trim().toLowerCase();
        if (w && !seen.has(w)) {
          seen.add(w);
          collectedAdv.push(item);
          if (collectedAdv.length === 50) break;
        }
      }
    }
    logToConsole('SUCCESS', 'ADV_OK', `Đã thu thập được ${collectedAdv.length}/50 từ nâng cao.`);

    const collected = [...collectedConv.slice(0, 50), ...collectedAdv.slice(0, 50)];

    showLiveRunner(`ĐANG ĐÓNG GÓI 9 CỘT TSV CHO ${collected.length} TỪ VỰNG...`, 85, 4);
    const lines = collected.map(item => {
      const w = String(item.word || '').trim().toLowerCase();
      const cloze = makeClozeJS(w);
      let ipa = String(item.ipa || '').trim();
      if (!ipa.startsWith('/')) ipa = `/${ipa.replace(/\//g, '')}/`;
      const sound = makeSoundJS(w);
      const def = String(item.definition || '').replace(/\t|\n/g, ' ').trim();
      const vi = String(item.meaning_vi || '').replace(/\t|\n/g, ' ').trim();
      const plural = String(item.plural || '').trim().toLowerCase();
      const ex1 = String(item.example_1 || '').replace(/^[12]\.\s*/, '').trim();
      const ex2 = String(item.example_2 || '').replace(/^[12]\.\s*/, '').trim();
      return [w, cloze, ipa, sound, def, vi, vi, plural, `1. ${ex1} <br>2. ${ex2}`].join('\t');
    });

    const tsvContent = lines.join('\n') + '\n';

    // Nếu có cấu hình GitHub Token thì đẩy thẳng file lên Repo
    if (owner && repo && ghToken) {
      showLiveRunner(`ĐANG LƯU FILE output/${stt}.txt LÊN GITHUB...`, 95, 5);
      await pushFileToGitHub(`output/${stt}.txt`, tsvContent, `Generate topic #${stt} (${topicVi}) via Web Studio`);
      logToConsole('SUCCESS', 'GITHUB_COMMIT', `Đã lưu output/${stt}.txt (${lines.length} từ) lên GitHub!`);
    } else {
      const blob = new Blob([tsvContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${stt}.txt`;
      a.click();
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
    showLiveRunner(`🎉 HOÀN TẤT CHỦ ĐỀ #${stt}: ${topicVi.toUpperCase()} (${lines.length} TỪ)!`, 100, 5, false);
  } catch (e) {
    showLiveRunner(`❌ LỖI KHI TẠO CHỦ ĐỀ #${stt}: ${e.message}`, 100, 3, true);
    logToConsole('ERROR', 'WEB_GEN_FAIL', `Chủ đề #${stt} (${topicVi}) thất bại: ${e.message}`);
    toggleConsoleDrawer(true);
  }
}

async function pushFileToGitHub(path, contentText, commitMessage) {
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
