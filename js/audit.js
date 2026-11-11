// ============================================================================
// MODULE: js/audit.js
// Chức năng: Kiểm Toán Chất Lượng Định Dạng 9 Cột Anki (8 Tiêu Chí Chuyên Sâu)
//            100% Icon-Free Swiss Editorial Design.
// ============================================================================

let auditIssuesList = [];

async function runQualityAudit() {
  const completed = allTopics.filter(t => t.status === 'completed');
  const tbody = document.getElementById('auditTableBody');
  const progressBox = document.getElementById('auditScanProgressBox');
  const progressBar = document.getElementById('auditScanProgressBar');
  const progressText = document.getElementById('auditScanProgressText');

  if (!completed.length) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-zinc-500 font-mono-code text-xs uppercase">Chưa có chủ đề nào hoàn thành để kiểm toán.</td></tr>`;
    return;
  }

  if (progressBox) progressBox.classList.remove('hidden');
  logToConsole('INFO', 'AUDIT_START', `Bắt đầu kiểm toán chuyên sâu 8 tiêu chí cho ${completed.length} chủ đề...`);

  let perfectCount = 0;
  let issueTopicCount = 0;
  let totalErrors = 0;
  auditIssuesList = [];
  let rowsHtml = [];

  for (let i = 0; i < completed.length; i++) {
    const t = completed[i];
    const pct = Math.round(((i + 1) / completed.length) * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.innerText = `ĐANG KIỂM TRA #${t.stt}: ${t.topic} (${i + 1}/${completed.length})...`;

    let issues = [];
    let lineCount = 0;
    let colOk = true;
    let ipaSoundOk = true;

    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (!res.ok) {
        issues.push('Không tải được file .txt');
        colOk = false;
        ipaSoundOk = false;
      } else {
        const text = await res.text();
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        lineCount = lines.length;

        if (lineCount !== 100) {
          issues.push(`Số dòng: ${lineCount}/100`);
        }

        let badCols = 0, badIpa = 0, badSound = 0, badCloze = 0, badEx = 0, emptyMean = 0;
        let seenWordsInFile = new Set();
        let dupInFile = 0;

        lines.forEach((line) => {
          const cols = line.split('\t');
          if (cols.length !== 9) {
            badCols++;
            colOk = false;
          } else {
            const w = cols[0].trim().toLowerCase();
            if (seenWordsInFile.has(w)) dupInFile++;
            seenWordsInFile.add(w);

            if (!cols[1].includes('_')) badCloze++;
            if (!cols[2].startsWith('/') || !cols[2].endsWith('/')) { badIpa++; ipaSoundOk = false; }
            if (!cols[3].startsWith('[sound:') || !cols[3].endsWith('.mp3]')) { badSound++; ipaSoundOk = false; }
            if (!cols[4].trim() || !cols[5].trim()) emptyMean++;
            if (!cols[8].includes('1.') || !cols[8].includes('2.')) badEx++;
          }
        });

        if (badCols > 0) issues.push(`${badCols} dòng sai 9 cột`);
        if (dupInFile > 0) issues.push(`Trùng nội bộ ${dupInFile} từ`);
        if (badCloze > 0) issues.push(`${badCloze} dòng lỗi Cloze`);
        if (badIpa > 0) issues.push(`${badIpa} dòng sai IPA`);
        if (badSound > 0) issues.push(`${badSound} dòng sai thẻ âm thanh`);
        if (emptyMean > 0) issues.push(`${emptyMean} dòng trống nghĩa`);
        if (badEx > 0) issues.push(`${badEx} dòng thiếu 2 ví dụ`);
      }
    } catch (e) {
      issues.push('Lỗi đọc dữ liệu');
    }

    if (issues.length === 0) {
      perfectCount++;
    } else {
      issueTopicCount++;
      totalErrors += issues.length;
      auditIssuesList.push({ stt: t.stt, topic: t.topic, lineCount, issues });
    }

    const safeTopic = t.topic.replace(/'/g, "\\'");
    rowsHtml.push(`
      <tr class="hover:bg-[#F4F1EA] transition border-b border-zinc-200 ${issues.length > 0 ? 'bg-rose-50/40' : ''}">
        <td class="p-3 font-mono-code font-bold text-zinc-600">#${t.stt}</td>
        <td class="p-3 font-semibold text-zinc-900 text-xs sm:text-sm">${t.topic}</td>
        <td class="p-3 text-center font-mono-code font-bold ${lineCount === 100 ? 'text-[#0F766E]' : 'text-[#BE123C]'}">${lineCount}/100</td>
        <td class="p-3 text-center font-mono-code text-xs font-bold">${colOk ? '<span class="text-[#0F766E]">CHUẨN</span>' : '<span class="text-[#BE123C]">LỖI CỘT</span>'}</td>
        <td class="p-3 text-center font-mono-code text-xs font-bold">${ipaSoundOk ? '<span class="text-[#0F766E]">CHUẨN</span>' : '<span class="text-[#D97706]">CẦN SỬA</span>'}</td>
        <td class="p-3">
          ${issues.length === 0
            ? `<span class="px-2 py-0.5 bg-[#F4F1EA] text-[#0F766E] border border-[#0F766E] text-xs font-mono-code font-bold uppercase">CHUẨN 100%</span>`
            : `<div class="flex flex-wrap items-center gap-1.5">
                ${issues.map(iss => `<span class="px-2 py-0.5 bg-[#F4F1EA] text-[#BE123C] border border-[#BE123C] text-xs font-mono-code font-bold uppercase">${iss}</span>`).join('')}
                <button onclick="previewFile(${t.stt}, '${safeTopic}')" class="ml-auto neo-btn px-2 py-0.5 bg-[#111111] text-white text-xs uppercase">SỬA</button>
              </div>`
          }
        </td>
      </tr>
    `);
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('auditTotalScanned', completed.length);
  setTxt('auditPerfectCount', perfectCount);
  setTxt('auditIssueCount', issueTopicCount);
  setTxt('auditTotalErrors', totalErrors);

  if (tbody) tbody.innerHTML = rowsHtml.join('');

  const rerunBtn = document.getElementById('btnRerunAuditIssues');
  if (rerunBtn) {
    if (auditIssuesList.length > 0) {
      rerunBtn.classList.remove('hidden');
      rerunBtn.innerText = `TỰ ĐỘNG SỬA ${auditIssuesList.length} CHỦ ĐỀ CẢNH BÁO`;
    } else {
      rerunBtn.classList.add('hidden');
    }
  }

  setTimeout(() => { if (progressBox) progressBox.classList.add('hidden'); }, 800);
  logToConsole('SUCCESS', 'AUDIT_COMPLETE', `Hoàn tất kiểm toán: ${perfectCount} hoàn hảo, ${issueTopicCount} chủ đề có cảnh báo.`);
}

function downloadAuditReportTxt() {
  if (!auditIssuesList.length) {
    alert('Tất cả chủ đề đã đạt chuẩn 100% hoặc bạn chưa bấm Quét kiểm toán!');
    return;
  }
  const lines = [
    `BÁO CÁO KIỂM TOÁN CHẤT LƯỢNG TỪ VỰNG ANKI (${new Date().toLocaleString('vi-VN')})`,
    `Tổng số chủ đề cần lưu ý: ${auditIssuesList.length}`,
    `-------------------------------------------------------------------------`,
    ...auditIssuesList.map(item => `#${item.stt} - ${item.topic} (${item.lineCount}/100 từ): ${item.issues.join(', ')}`)
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Bao_Cao_Kiem_Toan_Anki_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
}

async function triggerRerunIssues() {
  if (!auditIssuesList.length) return;
  if (!confirm(`Bạn muốn tự động tạo lại ${auditIssuesList.length} chủ đề bị cảnh báo chất lượng ngay bây giờ?`)) return;
  for (const item of auditIssuesList) {
    await generateSingleInBrowser(item.stt, item.topic);
  }
}

function initAuditPage() {
  if (Array.isArray(allTopics) && allTopics.length > 0) {
    runQualityAudit();
  }
}
