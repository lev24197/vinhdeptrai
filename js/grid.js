// ============================================================================
// MODULE: js/grid.js
// Chức năng: Bản đồ Lưới Trực Quan 1.000 Chủ Đề (Visual Grid Map) &
//            Thống kê chi tiết tiến độ theo 8 nhóm lĩnh vực.
//            100% Icon-Free Swiss Editorial Design.
// ============================================================================

let gridCategoryFilter = 'all';
let gridStatusFilter = 'all';

function setGridFilter(category, status) {
  if (category !== undefined && category !== null) gridCategoryFilter = category;
  if (status !== undefined && status !== null) gridStatusFilter = status;
  renderGridMap();
  renderGridCategoryStats();
}

function onGridCellClick(stt, topicTitle, isDone) {
  if (isDone) {
    if (typeof previewFile === 'function') {
      previewFile(stt, topicTitle);
    } else {
      window.location.href = `studio.html?stt=${stt}`;
    }
  } else {
    if (typeof generateSingleInBrowser === 'function') {
      generateSingleInBrowser(stt, topicTitle);
    }
  }
}

function renderGridMap() {
  const container = document.getElementById('gridContainer');
  if (!container) return;

  const searchInput = document.getElementById('gridSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  container.innerHTML = allTopics.map(t => {
    const isDone = t.status === 'completed';
    const isError = isDone && t.word_count !== 100;
    const cat = typeof getTopicCategory === 'function' ? getTopicCategory(t.stt) : { id: 'all', name: '' };

    const matchCat = gridCategoryFilter === 'all' || cat.id === gridCategoryFilter;
    const matchStatus = gridStatusFilter === 'all'
      || (gridStatusFilter === 'completed' && isDone)
      || (gridStatusFilter === 'pending' && !isDone)
      || (gridStatusFilter === 'issue' && isError);
    const matchSearch = !query || t.topic.toLowerCase().includes(query) || String(t.stt) === query;

    const isDimmed = !(matchCat && matchStatus && matchSearch);

    let bg = 'bg-white text-zinc-500 border-zinc-300 hover:border-[#111111] hover:text-[#111111]';
    if (isDone && !isError) {
      bg = 'bg-[#0F766E] text-white border-[#111111] font-extrabold';
    } else if (isError) {
      bg = 'bg-[#D97706] text-white border-[#111111] font-extrabold';
    }

    if (isDimmed) {
      bg += ' opacity-20 scale-90';
    }

    const safeTopic = t.topic.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const titleTooltip = `#${t.stt}: ${t.topic} (${isDone ? t.word_count + ' từ - Xem/Sửa' : 'Chưa tạo - Tạo bằng AI'})`;

    return `<div onclick="onGridCellClick(${t.stt}, '${safeTopic}', ${isDone})"
      title="${titleTooltip}"
      class="grid-cell h-8 border flex items-center justify-center text-xs font-mono-code cursor-pointer select-none transition-all ${bg}">
      ${t.stt}
    </div>`;
  }).join('');

  renderGridCategoryStats();
}

function renderGridCategoryStats() {
  const statsContainer = document.getElementById('gridCategoryBreakdown');
  if (!statsContainer || typeof getTopicCategory !== 'function') return;

  const categories = [
    { id: 'nature', range: '1–125' },
    { id: 'career', range: '126–250' },
    { id: 'health', range: '251–375' },
    { id: 'tech', range: '376–500' },
    { id: 'society', range: '501–625' },
    { id: 'art', range: '626–750' },
    { id: 'food', range: '751–875' },
    { id: 'abstract', range: '876–1000' }
  ];

  statsContainer.innerHTML = categories.map(c => {
    const topicsInCat = allTopics.filter(t => getTopicCategory(t.stt).id === c.id);
    const sampleCat = topicsInCat.length ? getTopicCategory(topicsInCat[0].stt) : { id: c.id, name: c.id, color: 'bg-white text-zinc-800 border-zinc-300' };
    const total = topicsInCat.length || 125;
    const done = topicsInCat.filter(t => t.status === 'completed').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const isActive = gridCategoryFilter === c.id;

    return `
      <div onclick="setGridFilter('${isActive ? 'all' : c.id}', null)"
        class="neo-box-sm p-3 cursor-pointer transition ${isActive ? 'bg-[#111111] text-white ring-2 ring-[#111111]' : 'bg-white text-[#111111]'}">
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <span class="text-xs font-display font-extrabold truncate uppercase ${isActive ? 'text-white' : 'text-[#111111]'}">${sampleCat.name}</span>
          <span class="font-mono-code text-xs font-bold px-1.5 py-0.5 border ${isActive ? 'border-white text-white' : 'border-[#111111] text-[#111111]'}">#${c.range}</span>
        </div>
        <div class="w-full h-2 border border-[#111111] bg-[#F4F1EA] mb-1.5 overflow-hidden">
          <div class="h-full bg-[#0F766E] transition-all duration-300" style="width: ${pct}%"></div>
        </div>
        <div class="flex items-center justify-between text-xs font-mono-code font-bold ${isActive ? 'text-zinc-300' : 'text-zinc-600'}">
          <span>ĐÃ XONG: ${done}/${total}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}
