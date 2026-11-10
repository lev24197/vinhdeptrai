// ============================================================================
// MODULE: js/corpus.js
// Chức năng: Kho Từ Điển Tổng (Global Vocabulary Bank) & Máy Dò Từ Trùng Lặp
//            - Quét toàn bộ từ vựng đã tạo trên tất cả chủ đề hoàn thành
//            - Tra cứu nhanh từ vựng, IPA, nghĩa Việt, phân loại A2-B2 / C1-C2
//            - Phát hiện các từ xuất hiện ở nhiều hơn 1 chủ đề
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
    if (progressText) progressText.innerText = `Đang đọc chủ đề #${t.stt}: ${t.topic} (${i + 1}/${completed.length})...`;

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
    ? 'px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white'
    : 'px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200';
  if (btnDup) btnDup.className = mode === 'duplicates'
    ? 'px-3 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white'
    : 'px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
  renderCorpusTable();
}

function renderCorpusTable() {
  const tbody = document.getElementById('corpusTableBody');
  if (!tbody) return;
  if (!globalCorpusList.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">Bấm nút <strong>"🔄 Quét & Đồng bộ toàn bộ Kho Từ Vựng"</strong> để nạp dữ liệu.</td></tr>`;
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
      <tr class="hover:bg-slate-50 transition ${isDup ? 'bg-amber-50/40' : ''}">
        <td class="p-3 font-bold text-slate-900">
          <div class="flex items-center gap-1.5">
            <button onclick="speakWord('${safeWord}', event)" class="w-6 h-6 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">🔊</button>
            <span>${item.word}</span>
            ${isDup ? `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">x${occurrences.length} chủ đề</span>` : ''}
          </div>
        </td>
        <td class="p-3 font-mono-code text-indigo-600">${item.ipa}</td>
        <td class="p-3 font-semibold text-emerald-700">${item.vi}</td>
        <td class="p-3 text-slate-600 max-w-xs truncate" title="${item.def.replace(/"/g, '&quot;')}">${item.def}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.level === 'A2-B2' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}">${item.level}</span>
        </td>
        <td class="p-3">
          <button onclick="previewFile(${item.stt}, '${safeTopic}')" class="text-xs font-semibold text-indigo-600 hover:underline">
            #${item.stt} - ${item.topic}
          </button>
        </td>
      </tr>
    `;
  }).join('') + (filtered.length > 300 ? `<tr><td colspan="6" class="p-3 text-center text-xs text-slate-400 bg-slate-50">Đang hiển thị 300 / ${filtered.length.toLocaleString()} kết quả khớp. Hãy gõ từ khóa cụ thể hơn để lọc sâu.</td></tr>` : '');
}

function initCorpusPage() {
  if (Array.isArray(allTopics) && allTopics.length > 0 && globalCorpusList.length === 0) {
    buildGlobalCorpus();
  }
}
