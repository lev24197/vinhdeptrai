// ============================================================================
// MODULE: js/corpus.js
// Chức năng: Kho Từ Điển Tổng (Global Vocabulary Bank) & Máy Dò Từ Trùng Lặp
//            100% Icon-Free Swiss Editorial Design.
// ============================================================================

let globalCorpusList = [];
let corpusWordMap = {};
let corpusFilterMode = 'all';

async function buildGlobalCorpus() {
  const completed = allTopics.filter(t => t.status === 'completed');
  if (!completed.length) {
    alert('Chưa có chủ đề nào hoàn thành để quét kho từ điển!');
    return;
  }

  const progressBox = document.getElementById('corpusScanProgressBox');
  const progressBar = document.getElementById('corpusScanProgressBar');
  const progressText = document.getElementById('corpusScanProgressText');
  if (progressBox) progressBox.classList.remove('hidden');

  globalCorpusList = [];
  corpusWordMap = {};

  logToConsole('INFO', 'CORPUS_SCAN', `Bắt đầu quét kho từ vựng tổng từ ${completed.length} chủ đề...`);

  for (let i = 0; i < completed.length; i++) {
    const t = completed[i];
    const pct = Math.round(((i + 1) / completed.length) * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.innerText = `ĐANG ĐỌC CHỦ ĐỀ #${t.stt}: ${t.topic} (${i + 1}/${completed.length})...`;

    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, idx) => {
          const cols = line.split('\t');
          const word = (cols[0] || '').trim();
          const wKey = word.toLowerCase();
          if (!wKey) return;

          const entry = {
            word,
            wKey,
            ipa: cols[2] || '',
            def: cols[4] || '',
            vi: cols[5] || '',
            plural: cols[7] || '',
            stt: t.stt,
            topic: t.topic,
            level: idx < 50 ? 'A2-B2' : 'C1-C2'
          };
          globalCorpusList.push(entry);

          if (!corpusWordMap[wKey]) corpusWordMap[wKey] = [];
          corpusWordMap[wKey].push({ stt: t.stt, topic: t.topic });
        });
      }
    } catch (e) {}
  }

  const totalInstances = globalCorpusList.length;
  const uniqueWords = Object.keys(corpusWordMap).length;
  const dupWords = Object.values(corpusWordMap).filter(arr => arr.length > 1).length;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('corpusTotalWords', totalInstances.toLocaleString());
  setTxt('corpusUniqueWords', uniqueWords.toLocaleString());
  setTxt('corpusDuplicateCount', dupWords.toLocaleString());

  setTimeout(() => { if (progressBox) progressBox.classList.add('hidden'); }, 600);
  logToConsole('SUCCESS', 'CORPUS_DONE', `Hoàn tất quét ${totalInstances} từ (${uniqueWords} từ độc nhất, ${dupWords} từ trùng lặp).`);
  renderCorpusTable();
}

function setCorpusFilter(mode) {
  corpusFilterMode = mode;
  const btnAll = document.getElementById('corpusFilterAll');
  const btnDup = document.getElementById('corpusFilterDup');
  if (btnAll) btnAll.className = mode === 'all'
    ? 'neo-btn px-3 py-2 text-xs font-mono-code font-bold uppercase bg-[#111111] text-white'
    : 'neo-btn px-3 py-2 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 hover:bg-[#F4F1EA]';
  if (btnDup) btnDup.className = mode === 'duplicates'
    ? 'neo-btn px-3 py-2 text-xs font-mono-code font-bold uppercase bg-[#D97706] text-white'
    : 'neo-btn px-3 py-2 text-xs font-mono-code font-bold uppercase bg-white text-[#D97706] border-[#D97706] hover:bg-amber-50';
  renderCorpusTable();
}

function renderCorpusTable() {
  const tbody = document.getElementById('corpusTableBody');
  if (!tbody) return;
  if (!globalCorpusList.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-zinc-500 font-mono-code text-xs uppercase">Bấm nút "QUÉT & ĐỒNG BỘ KHO TỪ VỰNG" để nạp dữ liệu.</td></tr>`;
    return;
  }

  const q = (document.getElementById('corpusSearchInput')?.value || '').toLowerCase().trim();
  let filtered = globalCorpusList.filter(item => {
    const isDup = (corpusWordMap[item.wKey]?.length || 1) > 1;
    if (corpusFilterMode === 'duplicates' && !isDup) return false;
    if (!q) return true;
    return item.wKey.includes(q) || item.vi.toLowerCase().includes(q) || item.def.toLowerCase().includes(q) || item.topic.toLowerCase().includes(q);
  });

  const displaySlice = filtered.slice(0, 300);
  tbody.innerHTML = displaySlice.map(item => {
    const occurrences = corpusWordMap[item.wKey] || [];
    const isDup = occurrences.length > 1;
    const safeWord = item.word.replace(/'/g, "\\'");
    const safeTopic = item.topic.replace(/'/g, "\\'");
    return `
      <tr class="hover:bg-[#F4F1EA] transition border-b border-zinc-200 ${isDup ? 'bg-amber-50/50' : ''}">
        <td class="p-3 font-bold text-zinc-900">
          <div class="flex items-center gap-2">
            <button onclick="speakWord('${safeWord}', event)" class="neo-btn px-2 py-0.5 bg-[#EAE5DA] text-[#111111] text-xs font-mono-code uppercase">PHÁT ÂM</button>
            <span class="text-xs sm:text-sm font-bold">${item.word}</span>
            ${isDup ? `<span class="px-1.5 py-0.5 bg-white text-[#D97706] border border-[#D97706] text-xs font-mono-code font-bold uppercase">${occurrences.length} CHỦ ĐỀ</span>` : ''}
          </div>
        </td>
        <td class="p-3 font-mono-code text-xs text-[#1D4ED8]">${item.ipa}</td>
        <td class="p-3 font-semibold text-xs text-[#0F766E]">${item.vi}</td>
        <td class="p-3 text-xs text-zinc-700 max-w-xs truncate" title="${item.def.replace(/"/g, '&quot;')}">${item.def}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 text-xs font-mono-code font-bold border border-[#111111] ${item.level === 'A2-B2' ? 'bg-[#EAE5DA] text-[#0F766E]' : 'bg-[#EAE5DA] text-[#7C3AED]'}">${item.level}</span>
        </td>
        <td class="p-3">
          <button onclick="previewFile(${item.stt}, '${safeTopic}')" class="text-xs font-mono-code font-bold text-[#111111] hover:underline uppercase">
            #${item.stt} - ${item.topic}
          </button>
        </td>
      </tr>
    `;
  }).join('') + (filtered.length > 300 ? `<tr><td colspan="6" class="p-3 text-center text-xs font-mono-code text-zinc-500 bg-[#F4F1EA] uppercase">Đang hiển thị 300 / ${filtered.length.toLocaleString()} kết quả khớp. Nhập từ khóa cụ thể hơn để lọc sâu.</td></tr>` : '');
}

function initCorpusPage() {
  if (Array.isArray(allTopics) && allTopics.length > 0 && globalCorpusList.length === 0) {
    buildGlobalCorpus();
  }
}
