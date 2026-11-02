// ==================== KHO TỪ ĐIỂN TỔNG & KIỂM TOÁN CHẤT LƯỢNG 9 CỘT 2.0 (CORPUS & QA) ====================
let globalCorpusList = [];
let lastAuditIssues = [];

// Quét toàn bộ kho từ vựng song song (Parallel Batched Fetching)
async function buildGlobalCorpus() {
  const completed = allTopics.filter(t => t.status === 'completed');
  const btn = document.getElementById('btnBuildCorpus');
  if (btn) btn.innerHTML = '<span class="tid-cta-arrow">⏳</span><span class="tid-cta-label">Đang quét...</span>';

  const map = new Map();
  const chunkSize = 15;
  let processed = 0;

  for (let i = 0; i < completed.length; i += chunkSize) {
    const chunk = completed.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async t => {
      try {
        const res = await smartFetch(`output/${t.stt}.txt`);
        if (!res.ok) return;
        const text = await res.text();
        text.split('\n').filter(l => l.trim()).forEach(line => {
          const cols = line.split('\t');
          const w = (cols[0] || '').trim().toLowerCase();
          if (!w) return;
          if (!map.has(w)) {
            map.set(w, {
              word: w,
              ipa: cols[2] || '',
              vi: cols[5] || '',
              count: 1,
              topics: [`#${t.stt}`]
            });
          } else {
            const e = map.get(w);
            e.count++;
            if (!e.topics.includes(`#${t.stt}`)) {
              e.topics.push(`#${t.stt}`);
            }
          }
        });
      } catch (e) {}
    }));

    processed += chunk.length;
    if (btn) {
      btn.innerHTML = `<span class="tid-cta-arrow">⏳</span><span class="tid-cta-label">Đang quét: ${processed}/${completed.length} (${Math.round((processed / completed.length) * 100)}%)</span>`;
    }
  }

  globalCorpusList = Array.from(map.values()).sort((a, b) => b.count - a.count);

  const container = document.getElementById('corpusTableContainer');
  if (container) container.classList.remove('hidden');

  if (btn) btn.innerHTML = '<span class="tid-cta-arrow">↻</span><span class="tid-cta-label">Quét Lại Kho Từ</span>';

  // Hiển thị thống kê nhanh về kho từ
  const totalOccurrences = globalCorpusList.reduce((acc, item) => acc + item.count, 0);
  const dupWords = globalCorpusList.filter(i => i.count > 1).length;

  const statsBox = document.getElementById('corpusStatsBanner');
  if (statsBox) {
    statsBox.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 border-2 border-[#111]">
        <div>
          <div class="text-[10px] font-mono-code uppercase font-bold text-slate-500">Tổng từ vựng</div>
          <div class="font-display font-extrabold text-lg text-[#2C317A]">${totalOccurrences.toLocaleString()}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono-code uppercase font-bold text-slate-500">Từ độc nhất</div>
          <div class="font-display font-extrabold text-lg text-[#169C64]">${globalCorpusList.length.toLocaleString()}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono-code uppercase font-bold text-slate-500">Từ trùng lặp (≥2 bài)</div>
          <div class="font-display font-extrabold text-lg text-amber-600">${dupWords.toLocaleString()} (${Math.round((dupWords / globalCorpusList.length) * 100 || 0)}%)</div>
        </div>
        <div>
          <div class="text-[10px] font-mono-code uppercase font-bold text-slate-500">Chủ đề đã quét</div>
          <div class="font-display font-extrabold text-lg text-[#3F6AE4]">${completed.length} bài</div>
        </div>
      </div>
    `;
    statsBox.classList.remove('hidden');
  }

  renderCorpusTable();
}

function renderCorpusTable() {
  const q = document.getElementById('corpusSearchInput')?.value.toLowerCase().trim() || '';
  const dup = document.getElementById('corpusOnlyDup')?.checked || false;
  const list = globalCorpusList.filter(i => (!dup || i.count > 1) && (!q || i.word.includes(q) || i.vi.toLowerCase().includes(q))).slice(0, 300);
  const tbody = document.getElementById('corpusTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 font-bold">Không tìm thấy từ vựng nào khớp với từ khóa tìm kiếm.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(i => `
    <tr class="hover:bg-amber-50/70 transition">
      <td class="p-2.5 font-extrabold text-[#2C317A]">
        <div class="flex items-center gap-1.5">
          <button onclick="speakWord('${i.word}')" class="text-xs hover:scale-125 transition" title="Nghe phát âm">🔊</button>
          <span>${i.word}</span>
        </div>
      </td>
      <td class="p-2.5 font-mono-code text-slate-600">${i.ipa}</td>
      <td class="p-2.5 text-[#169C64] font-bold">${i.vi}</td>
      <td class="p-2.5 font-mono-code font-extrabold ${i.count > 1 ? 'text-amber-700 bg-amber-50' : 'text-slate-600'}">${i.count} lần</td>
      <td class="p-2.5 font-mono-code text-slate-600 text-[11px]">${i.topics.join(', ')}</td>
    </tr>
  `).join('');
}

// ==================== KIỂM TOÁN CHẤT LƯỢNG ĐỊNH DẠNG 9 CỘT 8 TIÊU CHÍ ====================
async function runQualityAudit() {
  if (typeof switchMainTab === 'function') switchMainTab('audit');
  const completed = allTopics.filter(t => t.status === 'completed');
  const box = document.getElementById('auditResultContainer');
  const btn = document.getElementById('btnRunAudit');
  if (!box) return;

  if (btn) btn.innerHTML = '<span class="tid-cta-arrow">⏳</span><span class="tid-cta-label">Đang kiểm toán...</span>';
  box.innerHTML = `<div class="p-4 text-center font-bold text-slate-600">⏳ Đang kiểm tra sâu 8 tiêu chuẩn vàng trên toàn bộ ${completed.length} file...</div>`;

  const issues = [];
  const flawlessList = [];
  const chunkSize = 15;

  for (let i = 0; i < completed.length; i += chunkSize) {
    const chunk = completed.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async t => {
      try {
        const res = await smartFetch(`output/${t.stt}.txt`);
        if (!res.ok) {
          issues.push({ stt: t.stt, topic: t.topic, type: 'missing_file', msg: 'Không tìm thấy file output' });
          return;
        }

        const lines = (await res.text()).split('\n').filter(l => l.trim());
        const topicIssues = [];
        const seenWords = new Set();

        // Tiêu chí 1: Đủ 100 dòng
        if (lines.length !== 100) {
          topicIssues.push(`Số lượng dòng: ${lines.length}/100 dòng`);
        }

        lines.forEach((l, idx) => {
          const c = l.split('\t');
          // Tiêu chí 2: Đúng 9 cột Tab
          if (c.length !== 9) {
            topicIssues.push(`Dòng ${idx + 1}: Có ${c.length} cột (chuẩn 9 cột)`);
            return;
          }

          const word = (c[0] || '').trim().toLowerCase();
          const cloze = (c[1] || '').trim();
          const ipa = (c[2] || '').trim();
          const sound = (c[3] || '').trim();
          const def = (c[4] || '').trim();
          const vi = (c[5] || '').trim();
          const examples = (c[8] || '').trim();

          // Tiêu chí 3: Trùng từ nội bộ trong cùng 1 file
          if (seenWords.has(word)) {
            topicIssues.push(`Dòng ${idx + 1}: Trùng từ "${word}"`);
          } else {
            seenWords.add(word);
          }

          // Tiêu chí 4: Cloze khuyết chữ
          if (!cloze.includes('_') && !cloze.includes('[')) {
            topicIssues.push(`Dòng ${idx + 1} (${word}): Cột Cloze thiếu dấu gạch khuyết`);
          }

          // Tiêu chí 5: IPA
          if (ipa && !ipa.startsWith('/') && !ipa.startsWith('[')) {
            topicIssues.push(`Dòng ${idx + 1} (${word}): IPA không bọc trong /.../`);
          }

          // Tiêu chí 6: Thẻ Sound
          if (!sound.startsWith('[sound:') || !sound.endsWith('.mp3]')) {
            topicIssues.push(`Dòng ${idx + 1} (${word}): Thẻ âm thanh sai định dạng [sound:...mp3]`);
          }

          // Tiêu chí 7: Định nghĩa & Nghĩa tiếng Việt
          if (!def) topicIssues.push(`Dòng ${idx + 1} (${word}): Thiếu định nghĩa tiếng Anh`);
          if (!vi) topicIssues.push(`Dòng ${idx + 1} (${word}): Thiếu nghĩa tiếng Việt`);

          // Tiêu chí 8: Ví dụ ngăn cách bằng <br>
          if (examples && !examples.includes('<br>') && !examples.includes('\n')) {
            topicIssues.push(`Dòng ${idx + 1} (${word}): Hai câu ví dụ thiếu thẻ nối <br>`);
          }
        });

        if (topicIssues.length > 0) {
          issues.push({ stt: t.stt, topic: t.topic, issues: topicIssues });
        } else {
          flawlessList.push(t);
        }
      } catch (e) {
        issues.push({ stt: t.stt, topic: t.topic, type: 'fetch_error', msg: e.message });
      }
    }));
  }

  lastAuditIssues = issues;
  if (btn) btn.innerHTML = '<span class="tid-cta-arrow">🛡️</span><span class="tid-cta-label">Chạy Lại Kiểm Toán</span>';

  // Hiển thị kết quả kiểm toán
  if (issues.length === 0) {
    box.innerHTML = `
      <div class="p-6 bg-[#38E54D] border-2 border-[#111] text-center space-y-2">
        <div class="text-4xl">👑</div>
        <h3 class="font-display font-extrabold text-lg uppercase text-[#111]">HOÀN HẢO! TOÀN BỘ ${completed.length} FILE ĐẠT CHUẨN 9 CỘT ANKI!</h3>
        <p class="text-xs font-semibold text-slate-800">Không phát hiện bất kỳ lỗi định dạng, thiếu dòng hay trùng lặp từ nào.</p>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="space-y-4">
        <!-- Header tóm tắt kết quả -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-amber-100 border-2 border-[#111]">
          <div>
            <span class="font-display font-extrabold text-sm uppercase text-red-700">⚠️ PHÁT HIỆN ${issues.length} CHỦ ĐỀ CẦN ĐIỀU CHỈNH</span>
            <div class="text-[11px] font-semibold text-slate-700">${flawlessList.length}/${completed.length} chủ đề đạt điểm tuyệt đối 100%.</div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="downloadAuditReportTxt()" class="neo-btn px-3 py-1 bg-white text-xs font-extrabold">⬇ Tải Báo Cáo .TXT</button>
            <button onclick="triggerRerunIssues()" class="neo-btn px-3 py-1 bg-red-600 text-white text-xs font-extrabold">↻ Chạy Lại Qua Bot</button>
          </div>
        </div>

        <!-- Danh sách chi tiết các chủ đề có cảnh báo -->
        <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          ${issues.map(item => `
            <div class="p-3 bg-white border-2 border-[#111] space-y-1.5 shadow-[2px_2px_0px_#111]">
              <div class="flex items-center justify-between">
                <div class="font-display font-extrabold text-xs text-[#2C317A]">
                  #${item.stt} • ${item.topic}
                </div>
                <button onclick="previewFile(${item.stt}, '${item.topic.replace(/'/g, "\\'")}')" class="neo-btn px-2.5 py-0.5 bg-[#FFE787] text-[11px] font-extrabold">
                  Mở Sửa Ngay →
                </button>
              </div>
              <ul class="text-[11px] text-red-600 font-mono-code space-y-0.5 list-disc list-inside">
                ${(item.issues || [item.msg]).slice(0, 5).map(err => `<li>${err}</li>`).join('')}
                ${(item.issues && item.issues.length > 5) ? `<li class="text-slate-500 italic">... và ${item.issues.length - 5} lỗi khác</li>` : ''}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Tải tệp báo cáo kiểm toán định dạng
function downloadAuditReportTxt() {
  if (!lastAuditIssues.length) {
    alert('Không có lỗi kiểm toán nào được ghi nhận!');
    return;
  }
  let report = `BÁO CÁO KIỂM TOÁN CHẤT LƯỢNG ĐỊNH DẠNG ANKI 9 CỘT\nXuất ngày: ${new Date().toLocaleString('vi-VN')}\nTổng số chủ đề có lỗi: ${lastAuditIssues.length}\n${'='.repeat(60)}\n\n`;

  lastAuditIssues.forEach(item => {
    report += `CHỦ ĐỀ #${item.stt}: ${item.topic}\n`;
    (item.issues || [item.msg]).forEach(err => {
      report += `  - ${err}\n`;
    });
    report += '\n';
  });

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `qa_audit_report_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
}

// Kích hoạt bot tạo lại các chủ đề có lỗi
function triggerRerunIssues() {
  if (!lastAuditIssues.length) return;
  const targetStts = lastAuditIssues.map(i => i.stt).slice(0, 3).join(',');
  if (confirm(`Bạn có muốn gửi lệnh cho GitHub Actions chạy lại các chủ đề bị lỗi (${targetStts}) không?`)) {
    if (typeof triggerWorkflow === 'function') {
      triggerWorkflow(lastAuditIssues.length, targetStts);
    }
  }
}
