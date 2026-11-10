// ============================================================================
// MODULE: js/export.js
// Chức năng: Xuất dữ liệu từ vựng Anki ra các định dạng:
//            - File .TXT đơn lẻ chuẩn Anki 9 cột
//            - Gói nén .ZIP nhiều chủ đề
//            - Gộp toàn bộ thành 1 file .TXT tổng hợp (Merged)
//            - Xuất bảng tính .CSV (UTF-8 BOM cho Excel / Google Sheets)
// ============================================================================

async function downloadSingleFile(stt, topicVi) {
  try {
    const res = await smartFetch(`output/${stt}.txt`);
    if (!res.ok) throw new Error('File không tồn tại');
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${stt}_${topicVi.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, '').replace(/\s+/g, '_')}.txt`;
    a.click();
    logToConsole('SUCCESS', 'DOWNLOAD_TXT', `Đã tải xuống file output/${stt}.txt.`);
  } catch (e) {
    alert(`Không thể tải file output/${stt}.txt!`);
  }
}

async function downloadSelectedOrAllZip() {
  const targets = selectedTopics.size > 0
    ? allTopics.filter(t => selectedTopics.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Không có chủ đề hoàn thành nào để tải ZIP!');
    return;
  }

  logToConsole('INFO', 'ZIP_EXPORT', `Đang nén ${targets.length} file chủ đề vào gói ZIP...`);
  const zip = new JSZip();

  for (const t of targets) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) {
        const content = await res.text();
        const safeName = t.topic.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, '').replace(/\s+/g, '_');
        zip.file(`${t.stt}_${safeName}.txt`, content);
      }
    } catch (e) {}
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Anki_Vocab_${targets.length}_Topics_${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  logToConsole('SUCCESS', 'ZIP_EXPORT_DONE', `Đã xuất thành công gói ZIP gồm ${targets.length} chủ đề.`);
}

async function downloadSelectedOrAllMerged() {
  const targets = selectedTopics.size > 0
    ? allTopics.filter(t => selectedTopics.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Không có chủ đề hoàn thành nào để gộp file!');
    return;
  }

  logToConsole('INFO', 'MERGE_EXPORT', `Đang gộp ${targets.length} chủ đề thành 1 file Anki .txt duy nhất...`);
  let mergedLines = [];

  for (const t of targets) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) {
        const content = (await res.text()).trim();
        if (content) mergedLines.push(content);
      }
    } catch (e) {}
  }

  const finalTxt = mergedLines.join('\n');
  const blob = new Blob([finalTxt], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Anki_Merged_${targets.length}_Topics_All_In_One.txt`;
  a.click();
  logToConsole('SUCCESS', 'MERGE_DONE', `Đã gộp và tải xuống ${targets.length} chủ đề vào 1 file .txt!`);
}

async function downloadSelectedOrAllCsv() {
  const targets = selectedTopics.size > 0
    ? allTopics.filter(t => selectedTopics.has(t.stt) && t.status === 'completed')
    : allTopics.filter(t => t.status === 'completed');

  if (!targets.length) {
    alert('Không có chủ đề hoàn thành nào để xuất CSV!');
    return;
  }

  logToConsole('INFO', 'CSV_EXPORT', `Đang xuất bảng Excel/CSV cho ${targets.length} chủ đề...`);
  let csvRows = [
    ['STT_Chu_De', 'Ten_Chu_De', 'Phan_Loai', 'Tu_Vung', 'Cloze', 'IPA', 'Am_Thanh', 'Dinh_Nghia_EN', 'Nghia_Tieng_Viet', 'So_Nhieu', 'Vi_Du']
  ];

  for (const t of targets) {
    try {
      const res = await smartFetch(`output/${t.stt}.txt`);
      if (res.ok) {
        const lines = (await res.text()).split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, idx) => {
          const c = line.split('\t');
          const cat = idx < 50 ? '1. Giao tiếp (A2-B2)' : '2. Nâng cao (C1-C2)';
          csvRows.push([
            t.stt, t.topic, cat,
            c[0] || '', c[1] || '', c[2] || '', c[3] || '',
            c[4] || '', c[5] || '', c[7] || '',
            (c[8] || '').replace(/<br>/g, ' | ')
          ]);
        });
      }
    } catch (e) {}
  }

  const csvString = '\uFEFF' + csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Anki_Excel_${targets.length}_Topics.csv`;
  a.click();
  logToConsole('SUCCESS', 'CSV_DONE', `Đã xuất file CSV (${csvRows.length - 1} dòng từ vựng).`);
}
