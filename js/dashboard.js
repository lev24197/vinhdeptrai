// ============================================================================
// MODULE: js/dashboard.js
// Chức năng: Bảng Điều Khiển Tiến Độ (KPIs), Phân Loại 8 Nhóm Lĩnh Vực
//            & Bảng Quản Lý 1.000 Chủ Đề (Tìm kiếm, Bộ lọc, Phân trang).
// ============================================================================

function getTopicCategory(stt) {
  if (stt <= 125) return { id: 'nature', name: '🌿 Tự Nhiên', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (stt <= 250) return { id: 'career', name: '💼 Kinh Tế & Nghề', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (stt <= 375) return { id: 'health', name: '🏥 Y Tế & Thể Thao', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (stt <= 500) return { id: 'tech', name: '🔬 Khoa Học & CN', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (stt <= 625) return { id: 'society', name: '🏛️ Xã Hội & Luật', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (stt <= 750) return { id: 'art', name: '🎨 Nghệ Thuật', color: 'bg-pink-50 text-pink-700 border-pink-200' };
  if (stt <= 875) return { id: 'food', name: '🍜 Ẩm Thực & Đời Sống', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { id: 'abstract', name: '🧠 Tư Duy & Học Thuật', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
}

function updateDashboardUI() {
  const total = allTopics.length || 1000;
  const completedList = allTopics.filter(t => t.status === 'completed');
  const completedCount = completedList.length;
  const pendingCount = total - completedCount;
  const issueCount = completedList.filter(t => t.word_count !== 100).length;
  const totalWords = completedList.reduce((acc, t) => acc + (t.word_count || 100), 0);
  const pct = ((completedCount / total) * 100).toFixed(1);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('statCompleted', completedCount.toLocaleString());
  setTxt('statPending', pendingCount.toLocaleString());
  setTxt('statWords', totalWords.toLocaleString());
  setTxt('statWordsSub', `${((totalWords / 100000) * 100).toFixed(1)}% mục tiêu`);
  setTxt('statPercent', `${pct}%`);
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = `${pct}%`;

  const nextTopic = allTopics.find(t => t.status !== 'completed');
  if (nextTopic) {
    setTxt('statNextStt', `#${nextTopic.stt}`);
    const nextNameEl = document.getElementById('statNextName');
    if (nextNameEl) {
      nextNameEl.innerText = nextTopic.topic;
      nextNameEl.title = nextTopic.topic;
    }
  } else {
    setTxt('statNextStt', 'HOÀN TẤT!');
    setTxt('statNextName', 'Đã đủ 1.000 chủ đề');
  }

  setTxt('countAll', total);
  setTxt('countCompleted', completedCount);
  setTxt('countPending', pendingCount);
  setTxt('countIssue', issueCount);

  applyFiltersAndRender();
  if (typeof renderGridMap === 'function') {
    renderGridMap();
  }
}

function setStatusFilter(status) {
  currentStatusFilter = status;
  currentPage = 1;
  ['all', 'completed', 'pending', 'issue'].forEach(s => {
    const btn = document.getElementById(`filter-${s}`);
    if (!btn) return;
    if (s === status) {
      btn.className = 'filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm transition';
    } else {
      btn.className = 'filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition';
    }
  });
  applyFiltersAndRender();
}

function setCategoryFilter(cat) {
  currentCategoryFilter = cat;
  currentPage = 1;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.className = 'cat-pill px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition';
  });
  const activeBtn = document.getElementById(`cat-${cat}`);
  if (activeBtn) {
    activeBtn.className = 'cat-pill px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-white transition';
  }
  applyFiltersAndRender();
}

function applyFiltersAndRender() {
  const searchEl = document.getElementById('searchInput');
  const query = searchEl ? searchEl.value.toLowerCase().trim() : '';
  const sortEl = document.getElementById('sortSelect');
  const sortMode = sortEl ? sortEl.value : 'stt_asc';
  const sizeEl = document.getElementById('pageSizeSelect');
  pageSize = sizeEl ? parseInt(sizeEl.value || '50', 10) : 50;

  filteredTopics = allTopics.filter(t => {
    if (currentStatusFilter === 'completed' && t.status !== 'completed') return false;
    if (currentStatusFilter === 'pending' && t.status === 'completed') return false;
    if (currentStatusFilter === 'issue' && (t.status !== 'completed' || t.word_count === 100)) return false;

    if (currentCategoryFilter !== 'all') {
      const cat = getTopicCategory(t.stt);
      if (cat.id !== currentCategoryFilter) return false;
    }

    if (query) {
      const matchTopic = t.topic.toLowerCase().includes(query);
      const matchStt = String(t.stt) === query || `#${t.stt}` === query;
      if (!matchTopic && !matchStt) return false;
    }
    return true;
  });

  filteredTopics.sort((a, b) => {
    if (sortMode === 'stt_asc') return a.stt - b.stt;
    if (sortMode === 'stt_desc') return b.stt - a.stt;
    if (sortMode === 'completed_first') {
      if (a.status === b.status) return a.stt - b.stt;
      return a.status === 'completed' ? -1 : 1;
    }
    if (sortMode === 'pending_first') {
      if (a.status === b.status) return a.stt - b.stt;
      return a.status !== 'completed' ? -1 : 1;
    }
    return 0;
  });

  renderTable();
  renderPagination();
}

function toggleSelectAllPage(checkbox) {
  const start = (currentPage - 1) * pageSize;
  const slice = filteredTopics.slice(start, start + pageSize);
  slice.forEach(t => {
    if (checkbox.checked) selectedTopics.add(t.stt);
    else selectedTopics.delete(t.stt);
  });
  renderTable();
}

function toggleRowSelect(stt) {
  if (selectedTopics.has(stt)) selectedTopics.delete(stt);
  else selectedTopics.add(stt);
  const badge = document.getElementById('selectedCountBadge');
  if (badge) {
    if (selectedTopics.size > 0) {
      badge.classList.remove('hidden');
      badge.innerText = `Đã chọn: ${selectedTopics.size} chủ đề`;
    } else {
      badge.classList.add('hidden');
    }
  }
}

function renderTable() {
  const tbody = document.getElementById('topicTableBody');
  if (!tbody) return;
  const start = (currentPage - 1) * pageSize;
  const slice = filteredTopics.slice(start, start + pageSize);

  const badge = document.getElementById('selectedCountBadge');
  if (badge) {
    if (selectedTopics.size > 0) {
      badge.classList.remove('hidden');
      badge.innerText = `Đã chọn: ${selectedTopics.size} chủ đề`;
    } else {
      badge.classList.add('hidden');
    }
  }

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400">Không tìm thấy chủ đề nào khớp với bộ lọc hiện tại.</td></tr>`;
    return;
  }

  tbody.innerHTML = slice.map(t => {
    const isDone = t.status === 'completed';
    const isChecked = selectedTopics.has(t.stt);
    const cat = getTopicCategory(t.stt);
    const wordOk = isDone && t.word_count === 100;
    const safeTopic = t.topic.replace(/'/g, "\\'");

    return `
      <tr class="hover:bg-slate-50/90 transition ${isChecked ? 'bg-indigo-50/50' : ''}">
        <td class="p-3.5 text-center">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleRowSelect(${t.stt})" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
        </td>
        <td class="p-3.5 font-mono-code text-xs font-bold text-slate-500">#${t.stt}</td>
        <td class="p-3.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${cat.color}">${cat.name}</span>
            <span class="font-semibold text-slate-900">${t.topic}</span>
          </div>
        </td>
        <td class="p-3.5 text-center">
          ${isDone
            ? (wordOk
                ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Chuẩn 100t</span>`
                : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">⚠️ ${t.word_count} từ</span>`)
            : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">⏳ Chưa tạo</span>`
          }
        </td>
        <td class="p-3.5 text-center font-mono-code text-xs font-bold ${isDone ? 'text-slate-800' : 'text-slate-300'}">
          ${isDone ? `${t.word_count} từ` : '—'}
        </td>
        <td class="p-3.5 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${isDone ? `
              <button onclick="previewFile(${t.stt}, '${safeTopic}')" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition shadow-sm" title="Mở Studio xem bảng 9 cột, học Flashcard 3D & Gõ Cloze">
                Xem / Sửa
              </button>
              <button onclick="downloadSingleFile(${t.stt}, '${safeTopic}')" class="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold transition" title="Tải file .txt đơn lẻ cho Anki">
                ⬇ .TXT
              </button>
              <button onclick="downloadTopicAudioZipDirect(${t.stt}, '${safeTopic}', this)" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition shadow-sm" title="Tự động cào 100 file phát âm MP3 chuẩn Cambridge đóng gói .ZIP">
                🔊 Tạo Audio (ZIP)
              </button>
              <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-md text-xs font-semibold transition" title="Tạo lại trực tiếp trên trình duyệt (Thấy ngay từng từ)">
                ↻ Tạo lại
              </button>
            ` : `
              <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition shadow-sm" title="Tạo ngay 100 từ trực tiếp trên trình duyệt (Thấy ngay từng từ sinh ra)">
                ⚡ Tạo 100 từ ngay
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const total = filteredTopics.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);
  const infoEl = document.getElementById('paginationInfo');
  if (infoEl) infoEl.innerText = `Hiển thị ${start}–${end} / ${total} chủ đề (Trang ${currentPage}/${totalPages})`;

  const ctrl = document.getElementById('paginationControls');
  if (!ctrl) return;
  let html = '';

  html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === 1 ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">‹ Trước</button>`;

  const maxBtns = 5;
  let startP = Math.max(1, currentPage - 2);
  let endP = Math.min(totalPages, startP + maxBtns - 1);
  if (endP - startP < maxBtns - 1) startP = Math.max(1, endP - maxBtns + 1);

  for (let p = startP; p <= endP; p++) {
    html += `<button onclick="changePage(${p})" class="px-3 py-1 rounded border text-xs font-bold ${p === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">${p}</button>`;
  }

  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-2.5 py-1 rounded border text-xs font-semibold ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">Sau ›</button>`;
  ctrl.innerHTML = html;
}

function changePage(p) {
  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize));
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTable();
  renderPagination();
}
