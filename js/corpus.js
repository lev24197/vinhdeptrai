// ==================== KHO TỪ ĐIỂN TỔNG & KIỂM TOÁN CHẤT LƯỢNG 9 CỘT (CORPUS & QA) ====================
let globalCorpusList = [];

async function buildGlobalCorpus() {
  const completed = allTopics.filter(t => t.status === 'completed');
  const btn = document.getElementById('btnBuildCorpus');
  if (btn) btn.innerText = '⏳ Đang quét...';
  const map = new Map();

  for (const t of completed) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (!res.ok) continue;
      const text = await res.text();
      text.split('\n').filter(l => l.trim()).forEach(line => {
        const cols = line.split('\t');
        const w = (cols[0] || '').trim().toLowerCase();
        if (!w) return;
        if (!map.has(w)) {
          map.set(w, { word: w, ipa: cols[2] || '', vi: cols[5] || '', count: 1, topics: [`#${t.stt}`] });
        } else {
          const e = map.get(w);
          e.count++;
          e.topics.push(`#${t.stt}`);
        }
      });
    } catch (e) {}
  }

  globalCorpusList = Array.from(map.values()).sort((a, b) => b.count - a.count);
  const container = document.getElementById('corpusTableContainer');
  if (container) container.classList.remove('hidden');
  if (btn) btn.innerHTML = '<span class="tid-cta-arrow">↻</span><span class="tid-cta-label">Quét Lại Kho Từ</span>';
  renderCorpusTable();
}

function renderCorpusTable() {
  const q = document.getElementById('corpusSearchInput')?.value.toLowerCase().trim() || '';
  const dup = document.getElementById('corpusOnlyDup')?.checked || false;
  const list = globalCorpusList.filter(i => (!dup || i.count > 1) && (!q || i.word.includes(q) || i.vi.toLowerCase().includes(q))).slice(0, 250);
  const tbody = document.getElementById('corpusTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(i => `
    <tr>
      <td class="p-2.5 font-extrabold text-[#2C317A]">${i.word}</td>
      <td class="p-2.5 font-mono-code">${i.ipa}</td>
      <td class="p-2.5 text-[#169C64] font-bold">${i.vi}</td>
      <td class="p-2.5 font-mono-code font-extrabold">${i.count} lần</td>
      <td class="p-2.5 font-mono-code text-slate-600">${i.topics.join(', ')}</td>
    </tr>
  `).join('');
}

async function runQualityAudit() {
  if (typeof switchMainTab === 'function') switchMainTab('audit');
  const completed = allTopics.filter(t => t.status === 'completed');
  const box = document.getElementById('auditResultContainer');
  if (!box) return;
  box.innerHTML = '⏳ Đang kiểm tra từng dòng trong các file đã hoàn thành...';
  const issues = [];

  for (const t of completed) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (!res.ok) continue;
      const lines = (await res.text()).split('\n').filter(l => l.trim());
      if (lines.length !== 100) issues.push({ stt: t.stt, topic: t.topic, msg: `Chỉ có ${lines.length}/100 dòng` });
      lines.forEach((l, idx) => {
        const c = l.split('\t');
        if (c.length !== 9) issues.push({ stt: t.stt, topic: t.topic, msg: `Dòng ${idx + 1}: Có ${c.length} cột (Chuẩn là 9)` });
        else if (!c[8].includes('<br>')) issues.push({ stt: t.stt, topic: t.topic, msg: `Dòng ${idx + 1} (${c[0]}): Thiếu thẻ <br> ở câu ví dụ` });
      });
    } catch (e) {}
  }

  if (issues.length === 0) {
    box.innerHTML = `<div class="p-4 bg-[#38E54D] border-2 border-[#111] text-center font-extrabold">✅ TUYỆT VỜI! Toàn bộ ${completed.length} file đều đạt chuẩn 9 cột Anki!</div>`;
  } else {
    box.innerHTML = `<div class="space-y-2 max-h-80 overflow-y-auto">${issues.map(i => `
      <div class="p-2.5 bg-red-100 border-2 border-[#111] flex justify-between items-center">
        <span><b>#${i.stt} (${i.topic})</b>: ${i.msg}</span>
        <button onclick="previewFile(${i.stt}, '${i.topic.replace(/'/g, "\\'")}')" class="neo-btn px-2.5 py-1 bg-[#FFE787] text-xs font-extrabold">Mở sửa →</button>
      </div>`).join('')}</div>`;
  }
}
