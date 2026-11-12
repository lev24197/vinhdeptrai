// ============================================================================
// MODULE: js/dashboard.js
// Chức năng: Bảng Điều Khiển Tiến Độ (KPIs), Phân Loại 8 Nhóm Lĩnh Vực
//            & Bảng Quản Lý Chủ Đề (100% Icon-Free Swiss Editorial).
// ============================================================================

function getTopicCategory(stt) {
  if (stt <= 125) return { id: 'nature', name: 'TỰ NHIÊN & ĐỊA LÝ', color: 'bg-[#F4F1EA] text-[#0F766E] border-[#0F766E]' };
  if (stt <= 250) return { id: 'career', name: 'KINH TẾ & NGHỀ NGHIỆP', color: 'bg-[#F4F1EA] text-[#1D4ED8] border-[#1D4ED8]' };
  if (stt <= 375) return { id: 'health', name: 'Y TẾ & THỂ THAO', color: 'bg-[#F4F1EA] text-[#BE123C] border-[#BE123C]' };
  if (stt <= 500) return { id: 'tech', name: 'KHOA HỌC & CÔNG NGHỆ', color: 'bg-[#F4F1EA] text-[#7C3AED] border-[#7C3AED]' };
  if (stt <= 625) return { id: 'society', name: 'XÃ HỘI & PHÁP LUẬT', color: 'bg-[#F4F1EA] text-[#D97706] border-[#D97706]' };
  if (stt <= 750) return { id: 'art', name: 'VĂN HÓA & NGHỆ THUẬT', color: 'bg-[#F4F1EA] text-[#DB2777] border-[#DB2777]' };
  if (stt <= 875) return { id: 'food', name: 'ẨM THỰC & ĐỜI SỐNG', color: 'bg-[#F4F1EA] text-[#EA580C] border-[#EA580C]' };
  return { id: 'abstract', name: 'TƯ DUY & HỌC THUẬT', color: 'bg-[#F4F1EA] text-[#374151] border-[#374151]' };
}

function updateDashboardUI() {
  const total = allTopics.length || 1000;
  const completedList = allTopics.filter(t => t.status === 'completed');
  const completedCount = completedList.length;
  const pendingCount = total - completedCount;
  const issueCount = completedList.filter(t => t.word_count !== 100).length;
  const totalWords = completedList.reduce((acc, t) => acc + (t.word_count || 100), 0);
  const targetWords = total * 100;
  const pct = total > 0 ? ((completedCount / total) * 100).toFixed(1) : '0.0';

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('statCompleted', completedCount.toLocaleString());
  setTxt('statPending', pendingCount.toLocaleString());
  setTxt('statWords', totalWords.toLocaleString());
  setTxt('statWordsSub', `${((totalWords / targetWords) * 100).toFixed(1)}% MỤC TIÊU`);
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
    setTxt('statNextStt', 'HOÀN TẤT');
    setTxt('statNextName', `Đã đủ toàn bộ ${total} chủ đề`);
  }

  setTxt('countAll', total);
  setTxt('countCompleted', completedCount);
  setTxt('countPending', pendingCount);
  setTxt('countIssue', issueCount);

  applyFiltersAndRender();
  if (typeof renderGridMap === 'function') {
    renderGridMap();
  }
  if (typeof initAutoScheduleCountdown === 'function') {
    initAutoScheduleCountdown();
  }
}

function setStatusFilter(status) {
  currentStatusFilter = status;
  currentPage = 1;
  ['all', 'completed', 'pending', 'issue'].forEach(s => {
    const btn = document.getElementById(`filter-${s}`);
    if (!btn) return;
    if (s === status) {
      btn.className = 'filter-pill px-3 py-1.5 text-xs font-mono-code font-bold uppercase bg-[#111111] text-white transition';
    } else {
      btn.className = 'filter-pill px-3 py-1.5 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 border border-[#111111] hover:bg-[#F4F1EA] transition';
    }
  });
  applyFiltersAndRender();
}

function setCategoryFilter(cat) {
  currentCategoryFilter = cat;
  currentPage = 1;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.className = 'cat-pill px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 border border-[#111111] hover:bg-[#F4F1EA] transition';
  });
  const activeBtn = document.getElementById(`cat-${cat}`);
  if (activeBtn) {
    activeBtn.className = 'cat-pill px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-[#111111] text-white border border-[#111111] transition';
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
      badge.innerText = `ĐÃ CHỌN: ${selectedTopics.size} CHỦ ĐỀ`;
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
      badge.innerText = `ĐÃ CHỌN: ${selectedTopics.size} CHỦ ĐỀ`;
    } else {
      badge.classList.add('hidden');
    }
  }

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-10 text-center font-mono-code text-xs text-zinc-500 uppercase">Không tìm thấy chủ đề nào khớp với bộ lọc hiện tại.</td></tr>`;
    return;
  }

  tbody.innerHTML = slice.map(t => {
    const isDone = t.status === 'completed';
    const isChecked = selectedTopics.has(t.stt);
    const cat = getTopicCategory(t.stt);
    const wordOk = isDone && t.word_count === 100;
    const safeTopic = t.topic.replace(/'/g, "\\'");

    return `
      <tr class="hover:bg-[#F4F1EA] transition border-b border-zinc-200 ${isChecked ? 'bg-[#EAE5DA]' : ''}">
        <td class="p-3 text-center">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleRowSelect(${t.stt})" class="border-2 border-[#111111] accent-[#111111] cursor-pointer" />
        </td>
        <td class="p-3 font-mono-code text-xs font-bold text-zinc-600">#${t.stt}</td>
        <td class="p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 text-xs font-mono-code font-bold border ${cat.color}">${cat.name}</span>
            <span class="font-bold text-zinc-900 text-xs sm:text-sm">${t.topic}</span>
          </div>
        </td>
        <td class="p-3 text-center">
          ${isDone
            ? (wordOk
                ? `<span class="inline-block px-2.5 py-0.5 text-xs font-mono-code font-extrabold bg-[#F4F1EA] text-[#0F766E] border border-[#0F766E]">CHUẨN 100 TỪ</span>`
                : `<span class="inline-block px-2.5 py-0.5 text-xs font-mono-code font-extrabold bg-[#F4F1EA] text-[#D97706] border border-[#D97706]">CẢNH BÁO: ${t.word_count} TỪ</span>`)
            : `<span class="inline-block px-2.5 py-0.5 text-xs font-mono-code font-bold bg-[#EAE5DA] text-zinc-600 border border-zinc-400">CHƯA TẠO</span>`
          }
        </td>
        <td class="p-3 text-center font-mono-code text-xs font-bold ${isDone ? 'text-zinc-900' : 'text-zinc-400'}">
          ${isDone ? `${t.word_count} TỪ` : '—'}
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${isDone ? `
              <button onclick="previewFile(${t.stt}, '${safeTopic}')" class="neo-btn px-2.5 py-1 bg-[#111111] text-white text-xs uppercase" title="Mở Studio xem bảng 9 cột, học Flashcard 3D & Gõ Cloze">
                XEM / SỬA
              </button>
              <button onclick="downloadSingleFile(${t.stt}, '${safeTopic}')" class="neo-btn px-2 py-1 bg-white text-[#111111] text-xs font-mono-code uppercase" title="Tải file .txt đơn lẻ cho Anki">
                XUẤT .TXT
              </button>
              <button onclick="downloadTopicAudioZipDirect(${t.stt}, '${safeTopic}', this)" class="neo-btn px-2.5 py-1 bg-[#0F766E] text-white text-xs uppercase" title="Tự động cào 100 file phát âm MP3 chuẩn Cambridge đóng gói .ZIP">
                TẠO AUDIO (.ZIP)
              </button>
              <button onclick="openCurationModal(${t.stt}, '${safeTopic}')" class="neo-btn px-2 py-1 bg-white text-[#D97706] border border-[#D97706] text-xs uppercase" title="Tùy chọn 2: Tạo lại qua lọc chọn 100 trong 150 từ">
                LỌC LẠI
              </button>
              <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="neo-btn px-2 py-1 bg-[#EAE5DA] text-[#111111] text-xs uppercase" title="Tạo lại trực tiếp trên trình duyệt">
                TẠO LẠI
              </button>
            ` : `
              <button onclick="openCurationModal(${t.stt}, '${safeTopic}')" class="neo-btn px-2.5 py-1 bg-[#D97706] text-white text-xs uppercase" title="Tùy chọn 2: Lọc chọn 100 từ trong 150 từ trước khi tạo">
                LỌC 100/150 TỪ
              </button>
              <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="neo-btn px-3 py-1 bg-[#111111] text-white text-xs uppercase" title="Tạo ngay 100 từ trực tiếp trên trình duyệt">
                TẠO 100 TỪ (AI)
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
  if (infoEl) infoEl.innerText = `HIỂN THỊ ${start}–${end} / ${total} CHỦ ĐỀ (TRANG ${currentPage}/${totalPages})`;

  const ctrl = document.getElementById('paginationControls');
  if (!ctrl) return;
  let html = '';

  html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="neo-btn px-2.5 py-1 text-xs font-mono-code uppercase ${currentPage === 1 ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed' : 'bg-white text-[#111111]'}">TRƯỚC</button>`;

  const maxBtns = 5;
  let startP = Math.max(1, currentPage - 2);
  let endP = Math.min(totalPages, startP + maxBtns - 1);
  if (endP - startP < maxBtns - 1) startP = Math.max(1, endP - maxBtns + 1);

  for (let p = startP; p <= endP; p++) {
    html += `<button onclick="changePage(${p})" class="neo-btn px-3 py-1 text-xs font-mono-code font-bold ${p === currentPage ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}">${p}</button>`;
  }

  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="neo-btn px-2.5 py-1 text-xs font-mono-code uppercase ${currentPage === totalPages ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed' : 'bg-white text-[#111111]'}">SAU</button>`;
  ctrl.innerHTML = html;
}

function changePage(p) {
  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize));
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTable();
  renderPagination();
}

// ============================================================================
// KHUNG GIỜ TỰ ĐỘNG CLOUD 4 ĐỢT / NGÀY & BỘ ĐẾM THỜI GIAN THỰC
// 09:00 Sáng VN (02:00 UTC) | 12:00 Trưa VN (05:00 UTC)
// 15:00 Chiều VN (08:00 UTC) | 18:00 Chiều VN (11:00 UTC)
// ============================================================================

let autoScheduleTimer = null;

function getVietnamNow() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000));
}

function getNextScheduleRunInfo() {
  const vnNow = getVietnamNow();
  const slots = [
    { hour: 9, label: '09:00 SÁNG', id: '9' },
    { hour: 12, label: '12:00 TRƯA', id: '12' },
    { hour: 15, label: '15:00 CHIỀU', id: '15' },
    { hour: 18, label: '18:00 CHIỀU', id: '18' }
  ];

  let targetDate = null;
  let activeSlot = null;
  let isTomorrow = false;

  for (const s of slots) {
    const candidate = new Date(vnNow);
    candidate.setHours(s.hour, 0, 0, 0);
    if (candidate.getTime() > vnNow.getTime()) {
      targetDate = candidate;
      activeSlot = s;
      break;
    }
  }

  if (!targetDate) {
    activeSlot = slots[0];
    targetDate = new Date(vnNow);
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(activeSlot.hour, 0, 0, 0);
    isTomorrow = true;
  }

  const diffMs = targetDate.getTime() - vnNow.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    activeSlot,
    isTomorrow,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formattedCountdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  };
}

function getUpcomingBatchTopics(count = 3) {
  if (!allTopics || !allTopics.length) return [];
  // Giống hệt logic của generate.py: ưu tiên chủ đề thiếu từ (< 100 từ) rồi đến chủ đề chưa tạo
  const incomplete = allTopics.filter(t => t.word_count > 0 && t.word_count < 100);
  const pending = allTopics.filter(t => t.status !== 'completed' && t.status !== 'incomplete');
  return [...incomplete, ...pending].slice(0, count);
}

function updateUpcomingScheduleUI() {
  const container = document.getElementById('upcoming3TopicsContainer');
  const targetLabel = document.getElementById('nextSlotTargetLabel');
  const countdownEl = document.getElementById('autoScheduleCountdown');
  if (!container && !countdownEl) return;

  const info = getNextScheduleRunInfo();

  // Highlight slot active
  ['9', '12', '15', '18'].forEach(slotId => {
    const badge = document.getElementById(`slotBadge-${slotId}`);
    if (!badge) return;
    if (slotId === info.activeSlot.id) {
      badge.className = 'px-2.5 py-1 border-2 border-[#111111] font-mono-code font-extrabold bg-[#0F766E] text-white shadow-[2px_2px_0px_#111111]';
    } else {
      badge.className = 'px-2.5 py-1 border border-[#111111] font-mono-code font-bold bg-white text-zinc-700';
    }
  });

  if (targetLabel) {
    targetLabel.innerText = info.isTomorrow
      ? `ĐỢT KẾ TIẾP: ${info.activeSlot.label} (NGÀY MAI)`
      : `ĐỢT KẾ TIẾP: ${info.activeSlot.label} (HÔM NAY)`;
  }

  if (countdownEl) {
    countdownEl.innerText = info.formattedCountdown;
  }

  // Render 3 chủ đề dự kiến kế tiếp
  const upcomingTopics = getUpcomingBatchTopics(3);
  if (container) {
    if (!upcomingTopics.length) {
      container.innerHTML = `
        <div class="col-span-full p-6 text-center font-mono-code text-xs text-[#0F766E] font-bold uppercase bg-[#F4F1EA] border border-[#111111]">
          TẤT CẢ 1.000 CHỦ ĐỀ ĐÃ ĐƯỢC TẠO HOÀN TẤT!
        </div>`;
      return;
    }

    container.innerHTML = upcomingTopics.map((t, idx) => {
      const cat = getTopicCategory(t.stt);
      const safeTopic = t.topic.replace(/'/g, "\\'");
      const isFix = t.word_count > 0 && t.word_count < 100;
      return `
        <div class="p-3 bg-[#F4F1EA] border-2 border-[#111111] flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="px-2 py-0.5 bg-[#111111] text-white font-mono-code font-extrabold text-xs">#${t.stt}</span>
            <span class="px-2 py-0.5 border ${cat.color} font-mono-code font-bold text-xs truncate max-w-[130px]">${cat.name}</span>
          </div>
          <div>
            <h5 class="font-display font-extrabold text-xs sm:text-sm text-[#111111] line-clamp-2" title="${t.topic}">${t.topic}</h5>
            <div class="text-xs font-mono-code text-zinc-600 mt-1">
              ${isFix ? `HIỆN CÓ: ${t.word_count}/100 TỪ (CẦN BỔ SUNG)` : 'CHƯA TẠO (SẼ TẠO ĐỦ 100 TỪ)'}
            </div>
          </div>
          <div class="pt-2 border-t border-zinc-300 flex items-center justify-between">
            <span class="text-xs font-mono-code font-bold ${isFix ? 'text-[#D97706]' : 'text-[#0F766E]'} uppercase">
              ${isFix ? '[ƯU TIÊN SỬA]' : `[VỊ TRÍ ${idx + 1}/3]`}
            </span>
            <button onclick="generateSingleInBrowser(${t.stt}, '${safeTopic}')" class="neo-btn px-2 py-0.5 bg-white text-[#111111] text-xs font-mono-code uppercase hover:bg-[#EAE5DA]" title="Tạo ngay chủ đề này trên trình duyệt">
              TẠO NGAY
            </button>
          </div>
        </div>`;
    }).join('');
  }
}

function initAutoScheduleCountdown() {
  if (autoScheduleTimer) clearInterval(autoScheduleTimer);
  updateUpcomingScheduleUI();
  autoScheduleTimer = setInterval(() => {
    const countdownEl = document.getElementById('autoScheduleCountdown');
    if (!countdownEl) return;
    const info = getNextScheduleRunInfo();
    countdownEl.innerText = info.formattedCountdown;
    if (info.totalSeconds === 0) {
      updateUpcomingScheduleUI();
      if (typeof loadData === 'function') loadData(true);
    }
  }, 1000);
}
