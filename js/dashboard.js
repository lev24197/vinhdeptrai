// ==================== QUẢN LÝ BẢNG ĐIỀU KHIỂN & 500 CHỦ ĐỀ (DASHBOARD) ====================

let currentCategoryFilter = 'all';

// Phân loại chuyên mục chủ đề (Taxonomy)
const TOPIC_CATEGORIES = {
  food: { id: 'food', name: 'Ẩm Thực', icon: '🍲', color: '#F97316' },
  travel: { id: 'travel', name: 'Du Lịch', icon: '✈️', color: '#0EA5E9' },
  tech: { id: 'tech', name: 'Công Nghệ', icon: '💻', color: '#6366F1' },
  business: { id: 'business', name: 'Kinh Doanh', icon: '💼', color: '#EAB308' },
  health: { id: 'health', name: 'Y Tế & Thể Thao', icon: '🏥', color: '#EF4444' },
  art: { id: 'art', name: 'Thời Trang & Nghệ Thuật', icon: '🎨', color: '#EC4899' },
  edu: { id: 'edu', name: 'Giáo Dục & Xã Hội', icon: '🏫', color: '#8B5CF6' },
  nature: { id: 'nature', name: 'Tự Nhiên', icon: '🌿', color: '#10B981' }
};

function getTopicCategory(topic) {
  const t = (topic || '').toLowerCase();
  if (/cà phê|đồ uống|lẩu|ẩm thực|nấu|món ăn|bánh|rượu|cocktail|hải sản|thực phẩm|gia vị|trái cây|rau củ|trà|thịt|ăn uống/i.test(t)) {
    return TOPIC_CATEGORIES.food;
  }
  if (/du lịch|khách sạn|sân bay|bãi biển|resort|kỳ nghỉ|địa lý|thành phố|quốc gia|núi|sông|hàng không|hộ chiếu|danh lam/i.test(t)) {
    return TOPIC_CATEGORIES.travel;
  }
  if (/máy tính|phần mềm|internet|công nghệ|điện tử|viễn thông|robot|trí tuệ|khoa học|dữ liệu|mạng|thiết bị|lập trình|vũ trụ/i.test(t)) {
    return TOPIC_CATEGORIES.tech;
  }
  if (/kinh doanh|ngân hàng|tài chính|tiền tệ|đầu tư|công ty|văn phòng|kế toán|marketing|quản lý|thương mại|bất động sản|việc làm/i.test(t)) {
    return TOPIC_CATEGORIES.business;
  }
  if (/y tế|bệnh viện|sức khỏe|thuốc|thể thao|gym|bóng đá|giải phẫu|nha khoa|dinh dưỡng|bác sĩ|bệnh tật|cơ thể/i.test(t)) {
    return TOPIC_CATEGORIES.health;
  }
  if (/quần áo|thời trang|phụ kiện|âm nhạc|hội họa|điện ảnh|nhiếp ảnh|mỹ phẩm|trang sức|kiến trúc|điêu khắc/i.test(t)) {
    return TOPIC_CATEGORIES.art;
  }
  if (/gia đình|trường học|giáo dục|pháp luật|lịch sử|ngôn ngữ|xã hội|văn hóa|chính trị|triết học|tôn giáo/i.test(t)) {
    return TOPIC_CATEGORIES.edu;
  }
  return TOPIC_CATEGORIES.nature;
}

function updateDashboardUI() {
  const total = allTopics.length || 500;
  const completedList = allTopics.filter(t => t.status === 'completed');
  const completed = completedList.length;
  const perfect = completedList.filter(t => (t.word_count || 0) >= 100).length;
  const issuesList = allTopics.filter(t => t.status === 'failed' || (t.status === 'completed' && (t.word_count || 0) < 100));
  const pendingList = allTopics.filter(t => t.status !== 'completed');
  const pending = pendingList.length;
  const totalWords = allTopics.reduce((s, t) => s + (t.word_count || 0), 0);
  const daysLeft = Math.ceil(pending / 3);

  const cardTotal = document.getElementById('cardTotalBadge');
  if (cardTotal) cardTotal.innerText = `${total} CHỦ ĐỀ`;
  const cardDone = document.getElementById('cardCompletedBadge');
  if (cardDone) cardDone.innerText = `${completed} XONG`;
  const cardPerf = document.getElementById('cardPerfectText');
  if (cardPerf) cardPerf.innerText = `${perfect} chủ đề đạt chuẩn 100 từ, sẵn sàng học trên Anki.`;
  const cardPend = document.getElementById('cardPendingBadge');
  if (cardPend) cardPend.innerText = `${pending} ĐANG CHỜ`;
  const cardEta = document.getElementById('cardEtaText');
  if (cardEta) {
    cardEta.innerText = pending > 0
      ? `Dự kiến hoàn tất sau ${daysLeft} ngày với tốc độ 3 chủ đề/ngày.`
      : 'Đã hoàn thành toàn bộ chủ đề!';
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

  // Cập nhật Sàn Tiến Độ (Top 4 chủ đề mới tạo)
  const recent = [...completedList].sort((a, b) => (b.generated_at || '').localeCompare(a.generated_at || '')).slice(0, 4);
  const recentEl = document.getElementById('recentCompletedList');
  if (recentEl) {
    if (recent.length === 0) {
      recentEl.innerHTML = `<p class="text-slate-500 py-2">Chưa có chủ đề nào hoàn thành.</p>`;
    } else {
      recentEl.innerHTML = recent.map((t, i) => {
        const colors = ['bg-[#FF9F1C]', 'bg-[#8DD2FF]', 'bg-[#F7B32B]', 'bg-slate-200'];
        const safe = t.topic.replace(/'/g, "\\'");
        const cat = getTopicCategory(t.topic);
        return `
          <div onclick="previewFile(${t.stt}, '${safe}')" class="flex items-center justify-between py-1.5 border-b border-slate-200 cursor-pointer hover:bg-amber-50 px-1">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 ${colors[i] || 'bg-slate-200'} border-2 border-[#111] flex items-center justify-center font-mono-code text-xs font-extrabold">${i + 1}</span>
              <span class="font-extrabold truncate max-w-xs">#${t.stt} • ${cat.icon} ${t.topic}</span>
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

  // Đồng bộ số lượng file trên nút ZIP
  const zipCountEl = document.getElementById('zipBtnCount');
  if (zipCountEl) {
    zipCountEl.innerText = selectedStts.size > 0 ? `${selectedStts.size} đã chọn` : `${completed} đã tạo`;
  }
}

function setCategoryFilter(catId) {
  currentCategoryFilter = catId;
  currentPage = 1;
  document.querySelectorAll('.cat-filter-btn').forEach(b => {
    b.className = 'cat-filter-btn px-2.5 py-1 text-xs font-bold border border-[#111] bg-white text-[#111] hover:bg-slate-100 rounded-full';
  });
  const activeBtn = document.getElementById('catBtn-' + catId);
  if (activeBtn) {
    activeBtn.className = 'cat-filter-btn px-2.5 py-1 text-xs font-extrabold border-2 border-[#111] bg-[#111] text-white rounded-full';
  }
  applyFiltersAndRender();
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
    if (currentCategoryFilter !== 'all') {
      const cat = getTopicCategory(t.topic);
      if (cat.id !== currentCategoryFilter) return false;
    }
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
    const cat = getTopicCategory(t.topic);

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
        <a href="battle.html?stt=${t.stt}" class="px-2 py-1 bg-[#FF9F1C] text-[#111] hover:bg-amber-400 rounded text-xs font-extrabold shadow-sm inline-block" title="Vào đấu trường săn quái cày cấp với chủ đề này">⚔️ Đấu Quái</a>
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
        <td class="py-2.5 px-3 font-mono-code font-extrabold text-slate-500">#${t.stt}</td>
        <td class="py-2.5 px-4 font-extrabold text-[#111]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold" style="background:${cat.color}20; color:${cat.color}">
              ${cat.icon} ${cat.name}
            </span>
            <span class="hover:underline cursor-pointer" onclick="previewFile(${t.stt}, '${safeTopic}')">${t.topic}</span>
          </div>
        </td>
        <td class="py-2.5 px-4">${statusBadge}</td>
        <td class="py-2.5 px-4 font-mono-code font-bold">${wc > 0 ? `${wc} từ` : '—'}</td>
        <td class="py-2.5 px-4 font-mono-code text-[11px] text-slate-500">${t.generated_at || '—'}</td>
        <td class="py-2.5 px-4 text-right space-x-1">${actions}</td>
      </tr>
    `;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('paginationControls');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (currentPage > 1) {
    html += `<button onclick="currentPage--; renderTable()" class="neo-btn px-2.5 py-1 bg-white text-xs font-extrabold">← Trước</button>`;
  }

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
      html += `<button onclick="currentPage=${p}; renderTable()" class="neo-btn px-2.5 py-1 text-xs font-extrabold ${p === currentPage ? 'bg-[#111] text-white' : 'bg-white'}">${p}</button>`;
    } else if (p === currentPage - 3 || p === currentPage + 3) {
      html += `<span class="px-1 py-1 text-xs font-mono-code font-bold">...</span>`;
    }
  }

  if (currentPage < totalPages) {
    html += `<button onclick="currentPage++; renderTable()" class="neo-btn px-2.5 py-1 bg-white text-xs font-extrabold">Sau →</button>`;
  }
  container.innerHTML = html;
}

function toggleSelectTopic(stt, isChecked) {
  if (isChecked) selectedStts.add(stt);
  else selectedStts.delete(stt);
  updateDashboardUI();
}

function toggleSelectAllPage(isChecked) {
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 50;
  const start = (currentPage - 1) * pageSize;
  const items = filteredTopics.slice(start, start + pageSize);

  items.forEach(t => {
    if (isChecked) selectedStts.add(t.stt);
    else selectedStts.delete(t.stt);
  });
  renderTable();
  updateDashboardUI();
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
    alert(`Lỗi khi tải file #${stt}: ` + e.message);
  }
}

// ==================== TẢI XUỐNG ĐỒNG THỜI (PARALLEL FAST DOWNLOAD) ====================
async function downloadSelectedOrAllZip() {
  const targets = selectedStts.size > 0
    ? allTopics.filter(t => selectedStts.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Chưa có file hoàn thành nào để tải!');
    return;
  }

  showToastAlert(`📦 Đang nén song song ${targets.length} file vào ZIP...`);
  const zip = new JSZip();

  // Tải song song theo nhóm 15 file
  const chunkSize = 15;
  for (let i = 0; i < targets.length; i += chunkSize) {
    const chunk = targets.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async t => {
      try {
        const res = await smartFetch(`output/${t.stt}.txt`);
        if (res.ok) zip.file(`${t.stt}.txt`, await res.text());
      } catch (e) {}
    }));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anki_dictionary_${targets.length}_topics.zip`;
  a.click();
  showToastAlert(`🎉 Tải thành công tệp ZIP chứa ${targets.length} file Anki!`);
}

async function downloadSelectedOrAllMerged() {
  const targets = selectedStts.size > 0
    ? allTopics.filter(t => selectedStts.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Chưa có file hoàn thành nào!');
    return;
  }

  showToastAlert(`📑 Đang tổng hợp song song ${targets.length} chủ đề...`);
  const chunks = [];
  const chunkSize = 15;

  for (let i = 0; i < targets.length; i += chunkSize) {
    const chunk = targets.slice(i, i + chunkSize);
    const texts = await Promise.all(chunk.map(async t => {
      try {
        const res = await smartFetch(`output/${t.stt}.txt`);
        if (res.ok) return (await res.text()).trim();
      } catch (e) {}
      return '';
    }));
    chunks.push(...texts.filter(Boolean));
  }

  const blob = new Blob([chunks.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anki_merged_${targets.length}_topics.txt`;
  a.click();
  showToastAlert(`🎉 Tải thành công file gộp ${targets.length} chủ đề!`);
}

// Xuất file CSV (Tương thích Excel)
async function downloadSelectedOrAllCsv() {
  const targets = selectedStts.size > 0
    ? allTopics.filter(t => selectedStts.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Chưa có file hoàn thành nào!');
    return;
  }

  showToastAlert(`📊 Đang xuất định dạng CSV cho ${targets.length} chủ đề...`);
  const csvRows = ['"STT","Word","Cloze","IPA","Sound","Definition","Meaning_VI","Plural","Examples"'];
  const chunkSize = 15;

  for (let i = 0; i < targets.length; i += chunkSize) {
    const chunk = targets.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async t => {
      try {
        const res = await smartFetch(`output/${t.stt}.txt`);
        if (res.ok) {
          const lines = (await res.text()).split('\n').filter(l => l.trim());
          lines.forEach(line => {
            const cols = line.split('\t').map(c => `"${c.replace(/"/g, '""')}"`);
            csvRows.push([`"${t.stt}"`, ...cols].join(','));
          });
        }
      } catch (e) {}
    }));
  }

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anki_dictionary_${targets.length}_topics.csv`;
  a.click();
}
