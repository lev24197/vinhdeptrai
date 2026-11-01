// ==================== QUẢN LÝ BẢNG ĐIỀU KHIỂN & 1.000 CHỦ ĐỀ (DASHBOARD) ====================

function updateDashboardUI() {
  const total = allTopics.length || 1000;
  const completedList = allTopics.filter(t => t.status === 'completed');
  const completed = completedList.length;
  const perfect = completedList.filter(t => (t.word_count || 0) >= 100).length;
  const issuesList = allTopics.filter(t => t.status === 'failed' || (t.status === 'completed' && (t.word_count || 0) < 100));
  const pendingList = allTopics.filter(t => t.status !== 'completed');
  const pending = pendingList.length;
  const totalWords = allTopics.reduce((s, t) => s + (t.word_count || 0), 0);
  const daysLeft = Math.ceil(pending / 3);

  const cardTotal = document.getElementById('cardTotalBadge');
  if (cardTotal) cardTotal.innerText = `${total} TOPICS`;
  const cardDone = document.getElementById('cardCompletedBadge');
  if (cardDone) cardDone.innerText = `${completed} DONE`;
  const cardPerf = document.getElementById('cardPerfectText');
  if (cardPerf) cardPerf.innerText = `${perfect} chủ đề đạt chuẩn 100 từ, sẵn sàng học trên Anki.`;
  const cardPend = document.getElementById('cardPendingBadge');
  if (cardPend) cardPend.innerText = `${pending} QUEUE`;
  const cardEta = document.getElementById('cardEtaText');
  if (cardEta) {
    cardEta.innerText = pending > 0
      ? `Dự kiến hoàn tất sau ${daysLeft} ngày với tốc độ 3 chủ đề/ngày.`
      : 'Đã hoàn thành toàn bộ 1.000 chủ đề!';
  }
  const cardIssue = document.getElementById('cardIssueBadge');
  if (cardIssue) cardIssue.innerText = `${issuesList.length} CẦN XEM`;
  const cardWords = document.getElementById('cardWordsBadge');
  if (cardWords) cardWords.innerText = `${totalWords.toLocaleString()} TỪ`;

  const nextQueue = document.getElementById('nextQueueBadge');
  if (nextQueue) {
    nextQueue.innerText = pendingList[0]
      ? `#${pendingList[0].stt} - ${pendingList[0].topic}`
      : 'Đã hoàn thành 100%!';
  }

  const pct = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  const bigProg = document.getElementById('bigProgressPercent');
  if (bigProg) bigProg.innerText = `${pct}% (${completed}/${total})`;
  const barPerf = document.getElementById('barPerfect');
  if (barPerf) {
    barPerf.style.width = `${(perfect / total) * 100}%`;
    barPerf.innerText = completed > 0 ? `${pct}%` : '';
  }
  const barPart = document.getElementById('barPartial');
  if (barPart) barPart.style.width = `${(issuesList.length / total) * 100}%`;

  // Cập nhật bảng Sàn Tiến Độ (Top 4 chủ đề mới tạo)
  const recent = [...completedList].sort((a, b) => (b.generated_at || '').localeCompare(a.generated_at || '')).slice(0, 4);
  const recentEl = document.getElementById('recentCompletedList');
  if (recentEl) {
    if (recent.length === 0) {
      recentEl.innerHTML = `<p class="text-slate-500">Chưa có chủ đề nào hoàn thành.</p>`;
    } else {
      recentEl.innerHTML = recent.map((t, i) => {
        const colors = ['bg-[#FF9F1C]', 'bg-[#8DD2FF]', 'bg-[#F7B32B]', 'bg-slate-200'];
        const safe = t.topic.replace(/'/g, "\\'");
        return `
          <div onclick="previewFile(${t.stt}, '${safe}')" class="flex items-center justify-between py-1.5 border-b border-slate-200 cursor-pointer hover:bg-amber-50 px-1">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 ${colors[i] || 'bg-slate-200'} border-2 border-[#111] flex items-center justify-center font-mono-code text-xs font-extrabold">${i + 1}</span>
              <span class="font-extrabold">#${t.stt} • ${t.topic}</span>
            </div>
            <span class="font-mono-code font-extrabold text-[#169C64]">${t.word_count || 0} từ</span>
          </div>
        `;
      }).join('');
    }
  }

  // Cập nhật Widget nhắc ôn góc phải dưới
  const remList = document.getElementById('reminderDeckList');
  if (remList && recent.length > 0) {
    remList.innerHTML = recent.slice(0, 2).map(t => `<li>• Bộ thẻ "#${t.stt} - ${t.topic}" (${t.word_count} từ)</li>`).join('') +
      (completed > 2 ? `<li class="text-slate-500">... và ${completed - 2} bộ thẻ khác</li>` : '');
  }
}

function setFilter(f) {
  currentFilter = f;
  currentPage = 1;
  ['all', 'completed', 'pending', 'issues'].forEach(k => {
    const btn = document.getElementById('btn-' + k);
    if (!btn) return;
    btn.className = k === f
      ? 'neo-btn px-3 py-1.5 text-xs font-extrabold bg-[#111] text-white'
      : 'neo-btn px-3 py-1.5 text-xs font-extrabold bg-white text-[#111]';
  });
  applyFiltersAndRender();
}

function setFilterAndScroll(f) {
  if (typeof switchMainTab === 'function') switchMainTab('list');
  setFilter(f);
  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

function applyFiltersAndRender() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const rangeVal = document.getElementById('rangeSelect')?.value || 'all';
  const sortVal = document.getElementById('sortSelect')?.value || 'stt_asc';

  let minStt = 1, maxStt = 999999;
  if (rangeVal !== 'all') [minStt, maxStt] = rangeVal.split('-').map(Number);

  filteredTopics = allTopics.filter(t => {
    if (t.stt < minStt || t.stt > maxStt) return false;
    if (currentFilter === 'completed' && t.status !== 'completed') return false;
    if (currentFilter === 'pending' && t.status === 'completed') return false;
    if (currentFilter === 'issues' && !(t.status === 'failed' || (t.status === 'completed' && (t.word_count || 0) < 100))) return false;
    if (q && !String(t.stt).includes(q) && !t.topic.toLowerCase().includes(q)) return false;
    return true;
  });

  filteredTopics.sort((a, b) => {
    if (sortVal === 'stt_asc') return a.stt - b.stt;
    if (sortVal === 'stt_desc') return b.stt - a.stt;
    if (sortVal === 'date_desc') return (b.generated_at || '').localeCompare(a.generated_at || '');
    if (sortVal === 'words_asc') return (a.word_count || 0) - (b.word_count || 0);
    return 0;
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 50;
  const total = filteredTopics.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const items = filteredTopics.slice(start, start + pageSize);
  const showText = document.getElementById('showingCountText');
  if (showText) {
    showText.innerText = `(${total > 0 ? start + 1 : 0}-${Math.min(start + pageSize, total)} / ${total})`;
  }

  tbody.innerHTML = items.map(t => {
    const isDone = t.status === 'completed';
    const isFail = t.status === 'failed';
    const isSelected = selectedStts.has(t.stt);
    const wc = t.word_count || 0;
    const safeTopic = t.topic.replace(/'/g, "\\'");

    let statusBadge = `<span class="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-mono-code text-[11px] font-bold">Chờ tạo</span>`;
    if (isFail) {
      statusBadge = `<span class="px-2 py-0.5 bg-red-100 text-red-700 border border-red-500 rounded font-mono-code text-[11px] font-bold" title="${t.last_error || 'Lỗi'}">⚠️ Lỗi</span>`;
    } else if (isDone && wc >= 100) {
      statusBadge = `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-600 rounded font-mono-code text-[11px] font-bold">✓ Chuẩn 100t</span>`;
    } else if (isDone && wc < 100) {
      statusBadge = `<span class="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-600 rounded font-mono-code text-[11px] font-bold">Thiếu (${wc}/100)</span>`;
    }

    let actions = '';
    if (isDone) {
      actions = `
        <a href="battle.html?stt=${t.stt}" class="px-2 py-1 bg-[#FF9F1C] text-[#111] hover:bg-amber-400 rounded text-xs font-extrabold shadow-sm inline-block" title="Vào đánh quái cày cấp với chủ đề này">⚔️ Đấu Quái</a>
        <button onclick="previewFile(${t.stt}, '${safeTopic}')" class="px-2.5 py-1 bg-[#141414] text-white hover:bg-slate-800 rounded text-xs font-bold shadow-sm">Xem / Sửa</button>
        <button onclick="downloadSingleFile(${t.stt})" class="px-2 py-1 bg-[#3F6AE4] text-white hover:bg-blue-600 rounded text-xs font-bold">⬇ .TXT</button>
        <button onclick="triggerWorkflow('1', '${t.stt}')" class="px-2 py-1 bg-white hover:bg-amber-100 border border-[#111] rounded text-[11px] font-bold" title="Tạo lại chủ đề này">↻ Tạo lại</button>
      `;
    } else {
      actions = `
        <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="px-2.5 py-1 bg-[#38E54D] text-[#111] hover:bg-emerald-400 border border-[#111] rounded text-xs font-extrabold shadow-sm">⚡ Tạo Trên Web</button>
        <button onclick="triggerWorkflow('1', '${t.stt}')" class="px-2 py-1 bg-[#141414] text-white hover:bg-slate-800 rounded text-xs font-bold">Chạy Bot ↗</button>
      `;
    }

    return `
      <tr class="hover:bg-amber-50/60 transition ${isSelected ? 'bg-amber-100/50' : ''}">
        <td class="py-2.5 px-3 text-center">
          <input type="checkbox" onchange="toggleSelectTopic(${t.stt}, this.checked)" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded cursor-pointer" />
        </td>
        <td class="py-2.5 px-3 font-mono-code font-extrabold">#${t.stt}</td>
        <td class="py-2.5 px-4 font-bold text-[#141414]">${t.topic}</td>
        <td class="py-2.5 px-4">${statusBadge}</td>
        <td class="py-2.5 px-4 font-mono-code font-bold">${wc > 0 ? `${wc} từ` : '—'}</td>
        <td class="py-2.5 px-4 font-mono-code text-[11px] text-slate-500">${t.generated_at ? t.generated_at.slice(0, 16) : '—'}</td>
        <td class="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">${actions}</td>
      </tr>
    `;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const c = document.getElementById('paginationControls');
  if (!c) return;
  if (totalPages <= 1) { c.innerHTML = ''; return; }

  let pages = [];
  const cur = currentPage;
  pages.push(1);
  if (cur > 3) pages.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(totalPages - 1, cur + 1); i++) {
    pages.push(i);
  }
  if (cur < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  c.innerHTML = pages.map(p => {
    if (p === '...') return `<span class="px-2 py-1 text-slate-400">...</span>`;
    const isActive = p === cur;
    return `
      <button onclick="currentPage=${p}; renderTable()" class="neo-box-sm px-2.5 py-1 text-xs font-extrabold ${isActive ? 'bg-[#141414] text-white' : 'bg-white hover:bg-slate-100'}">
        ${p}
      </button>
    `;
  }).join('');
}

function toggleSelectAllPage(checked) {
  const pageSize = parseInt(document.getElementById('pageSizeSelect')?.value || '50', 10);
  const start = (currentPage - 1) * pageSize;
  const items = filteredTopics.slice(start, start + pageSize);
  items.forEach(t => {
    if (checked) selectedStts.add(t.stt);
    else selectedStts.delete(t.stt);
  });
  renderTable();
}

function toggleSelectTopic(stt, checked) {
  if (checked) selectedStts.add(stt);
  else selectedStts.delete(stt);
  renderTable();
}

function renderGridMap() {
  const container = document.getElementById('topicGridMap');
  if (!container) return;
  container.innerHTML = allTopics.map(t => {
    const isDone = t.status === 'completed';
    const wc = t.word_count || 0;
    let cls = 'bg-white text-slate-700';
    if (t.status === 'failed') cls = 'bg-[#F05332] text-white';
    else if (isDone && wc >= 100) cls = 'bg-[#169C64] text-white';
    else if (isDone && wc < 100) cls = 'bg-[#F7B32B] text-[#111]';
    const safe = t.topic.replace(/'/g, "\\'");
    const act = isDone ? `previewFile(${t.stt}, '${safe}')` : `triggerWorkflow('1', '${t.stt}')`;

    return `
      <div
        onclick="${act}"
        onmouseenter="document.getElementById('gridHoverInfo').innerText = '#${t.stt}: ${safe} (${t.status})'"
        class="aspect-square border border-[#111] text-[10px] font-mono-code font-bold flex items-center justify-center cursor-pointer hover:scale-125 transition-transform z-0 hover:z-10 shadow-[1px_1px_0px_#111] ${cls}"
        title="#${t.stt}: ${t.topic}">
        ${t.stt}
      </div>
    `;
  }).join('');
}

async function downloadSingleFile(stt) {
  try {
    const res = await smartFetch(`output/${stt}.txt`);
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${stt}.txt`;
    a.click();
  } catch (e) {
    alert(`Không tải được file output/${stt}.txt: ` + e.message);
  }
}

async function downloadSelectedOrAllZip() {
  const targets = selectedStts.size > 0
    ? allTopics.filter(t => selectedStts.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');
  if (!targets.length) { alert('Chưa có file hoàn thành nào để tải!'); return; }
  const zip = new JSZip();
  for (const t of targets) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) zip.file(`${t.stt}.txt`, await res.text());
    } catch (e) {}
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anki_1000_topics_${targets.length}_files.zip`;
  a.click();
}

async function downloadSelectedOrAllMerged() {
  const targets = selectedStts.size > 0
    ? allTopics.filter(t => selectedStts.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');
  if (!targets.length) { alert('Chưa có file hoàn thành nào!'); return; }
  const chunks = [];
  for (const t of targets) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) chunks.push((await res.text()).trim());
    } catch (e) {}
  }
  const blob = new Blob([chunks.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anki_merged_${targets.length}_topics.txt`;
  a.click();
}
