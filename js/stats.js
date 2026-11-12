// ============================================================================
// MODULE: js/stats.js
// Chức năng: Quản trị Bảng điều khiển Thống kê Học tập Anki & Thuật toán FSRS
//            Bóc tách độc quyền cho bộ bài: "Thử thách mỗi ngày 100 từ vựng"
//            Phong cách Swiss Editorial Typography — Tuyệt đối 0% Icon/Emoji.
// ============================================================================

let currentAnkiStats = null;
let subdecksCurrentFilter = '';
let subdecksCurrentPage = 1;
const subdecksPageSize = 15;

/**
 * Khởi tạo Trang Thống Kê Anki FSRS
 */
async function initStatsPage() {
  await loadAnkiStatsData();
  setupStatsEventHandlers();
}

/**
 * Nạp dữ liệu thống kê Anki:
 * - Ưu tiên bản nháp ghi đè trong localStorage nếu người dùng vừa dán mới từ điện thoại.
 * - Hoặc nạp tệp data/anki_stats.json từ hệ thống (qua smartFetch).
 */
async function loadAnkiStatsData(forceReload = false) {
  const statusBadge = document.getElementById('ankiStatsSyncBadge');
  if (statusBadge) {
    statusBadge.innerText = 'TRẠNG THÁI: ĐANG NẠP DỮ LIỆU ANKI...';
    statusBadge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 bg-[#EAE5DA] text-[#111111] border-2 border-[#111111]';
  }

  // Kiểm tra bộ nhớ tạm do người dùng dán gần đây (nếu không ép tải mới)
  const localOverride = !forceReload ? localStorage.getItem('anki_stats_override') : null;
  if (localOverride) {
    try {
      currentAnkiStats = JSON.parse(localOverride);
      renderAllStatsCharts(currentAnkiStats);
      if (statusBadge) {
        statusBadge.innerText = `[BỘ NHỚ TRÌNH DUYỆT] CẬP NHẬT: ${currentAnkiStats.updated_at || 'MỚI DÁN'}`;
        statusBadge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 bg-[#F4F1EA] text-[#D97706] border-2 border-[#111111]';
      }
      return;
    } catch (e) {
      localStorage.removeItem('anki_stats_override');
    }
  }

  try {
    const res = await smartFetch('data/anki_stats.json');
    currentAnkiStats = await res.json();
    renderAllStatsCharts(currentAnkiStats);

    if (statusBadge) {
      statusBadge.innerText = `[ĐỒNG BỘ CLOUD] CẬP NHẬT: ${currentAnkiStats.updated_at} (${currentAnkiStats.summary?.total_deck_cards || 0} THẺ)`;
      statusBadge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 bg-white text-[#0F766E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]';
    }
  } catch (err) {
    if (statusBadge) {
      statusBadge.innerText = '[CHƯA CÓ FILE] BẤM VÀO ĐÂY ĐỂ DÁN DỮ LIỆU TỪ ĐIỆN THOẠI';
      statusBadge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 bg-[#F4F1EA] text-[#BE123C] border-2 border-[#111111] cursor-pointer';
      statusBadge.onclick = openQuickPasteModal;
    }
    // Dữ liệu mẫu dự phòng an toàn
    renderFallbackStats();
  }
}

/**
 * Hiển thị tất cả 14 khu vực biểu đồ và thống kê
 */
function renderAllStatsCharts(data) {
  if (!data) return;

  renderSummaryAndToday(data);
  renderFutureDueChart(data.future_due);
  renderCalendarHeatmap(data.calendar_heatmap);
  renderReviewsHistoryChart(data.reviews_history);
  renderCardCountsChart(data.card_counts);
  renderIntervalsChart(data.intervals);
  renderStabilityChart(data.stability);
  renderDifficultyChart(data.difficulty);
  renderRetrievabilityChart(data.retrievability);
  renderRetentionTable(data.retention);
  renderHourlyChart(data.hourly_breakdown);
  renderAnswerButtonsChart(data.answer_buttons);
  renderCardsAddedChart(data.cards_added);
  renderSubdecksTable(data.subdecks);
}

// ----------------------------------------------------------------------------
// 1. TỔNG QUAN & HÔM NAY (TODAY OVERVIEW)
// ----------------------------------------------------------------------------
function renderSummaryAndToday(data) {
  const t = data.today || {};
  const s = data.summary || {};

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined && val !== null ? val : '--';
  };

  setTxt('todayCardsStudied', t.cards_studied || 0);
  setTxt('todayTimeMinutes', `${t.time_minutes || 0} PHÚT`);
  setTxt('todaySpeed', `${t.seconds_per_card || 0} GIÂY / THẺ`);
  setTxt('todayAgainCount', `${t.again_count || 0} LẦN (${t.again_pct || 0}%)`);

  setTxt('todayLearnCount', t.learn || 0);
  setTxt('todayReviewCount', t.review || 0);
  setTxt('todayRelearnCount', t.relearn || 0);
  setTxt('todayGoodEasy', `${(t.good_count || 0) + (t.easy_count || 0)} LẦN`);

  setTxt('summaryStreak', `${s.streak_days || 38} NGÀY`);
  setTxt('summaryDaysStudied', `${s.days_studied_past_30 || 30} / 30 NGÀY (100%)`);
  setTxt('summaryTotalReviews', Number(s.total_reviews_past_30 || 18804).toLocaleString('vi-VN'));
  setTxt('summaryAvgDailyReviews', `${s.avg_reviews_day || 626} LƯỢT / NGÀY`);
}

// ----------------------------------------------------------------------------
// 2. DỰ BÁO ĐẾN HẠN TƯƠNG LAI (FUTURE DUE - 30 NGÀY)
// ----------------------------------------------------------------------------
function renderFutureDueChart(future) {
  const container = document.getElementById('futureDueChartMount');
  if (!container || !future || !Array.isArray(future.days)) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };
  setTxt('futureDueTomorrow', Number(future.due_tomorrow || 0).toLocaleString('vi-VN'));
  setTxt('futureTotal30', Number(future.total_future_30 || 0).toLocaleString('vi-VN'));
  setTxt('futureAvgDay', `${future.avg_reviews_day || 0} THẺ/NGÀY`);
  setTxt('futureDailyLoad', `${future.daily_load || 0} THẺ/NGÀY`);

  const days = future.days;
  const maxVal = Math.max(...days.map(d => d.count), 10);

  // Vẽ biểu đồ cột SVG tinh gọn
  const width = 800;
  const height = 180;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(8, (width - 40) / days.length - 4);

  let barsSvg = '';
  days.forEach((d, i) => {
    const x = 20 + i * (barWidth + 4);
    const bHeight = Math.max(2, (d.count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const isTomorrow = d.day === 1;
    const color = isTomorrow ? '#D97706' : (d.day === 0 ? '#BE123C' : '#0F766E');

    barsSvg += `
      <g class="cursor-pointer group">
        <title>Ngày +${d.day}: ${d.count} thẻ đến hạn</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${color}" stroke="#111111" stroke-width="1.5" />
        ${(i % 5 === 0 || i === days.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-family="monospace" font-size="10" font-weight="bold" fill="#111111" text-anchor="middle">+${d.day}</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="${paddingTop + chartHeight}" x2="${width - 16}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
      ${barsSvg}
    </svg>`;
}

// ----------------------------------------------------------------------------
// 3. LỊCH HOẠT ĐỘNG TOÀN NĂM (CALENDAR HEATMAP)
// ----------------------------------------------------------------------------
function renderCalendarHeatmap(calendar) {
  const container = document.getElementById('calendarHeatmapMount');
  if (!container) return;

  const datesMap = new Map();
  if (Array.isArray(calendar)) {
    calendar.forEach(c => datesMap.set(c.date, c.count));
  }

  // Tạo lưới 52 tuần gần nhất
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: datesMap.get(key) || 0, dayOfWeek: d.getDay() });
  }

  let cellsHtml = '';
  days.forEach(d => {
    let bg = 'bg-white';
    if (d.count > 0 && d.count <= 100) bg = 'bg-[#CCFBF1]';
    else if (d.count > 100 && d.count <= 300) bg = 'bg-[#5EEAD4]';
    else if (d.count > 300 && d.count <= 600) bg = 'bg-[#0D9488] text-white';
    else if (d.count > 600) bg = 'bg-[#0F766E] text-white';

    cellsHtml += `
      <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 ${bg} border border-[#111111] hover:scale-125 transition-transform" 
           title="${d.date}: ${d.count} lượt ôn tập"></div>`;
  });

  container.innerHTML = `
    <div class="flex flex-wrap gap-1 items-center justify-start">
      ${cellsHtml}
    </div>
    <div class="mt-3 flex items-center justify-between text-xs font-mono-code font-bold text-zinc-600">
      <span>365 NGÀY TRƯỚC</span>
      <div class="flex items-center gap-1.5">
        <span class="text-zinc-500">Ít</span>
        <div class="w-3 h-3 bg-white border border-[#111111]"></div>
        <div class="w-3 h-3 bg-[#CCFBF1] border border-[#111111]"></div>
        <div class="w-3 h-3 bg-[#5EEAD4] border border-[#111111]"></div>
        <div class="w-3 h-3 bg-[#0D9488] border border-[#111111]"></div>
        <div class="w-3 h-3 bg-[#0F766E] border border-[#111111]"></div>
        <span class="text-zinc-500">Nhiều</span>
      </div>
      <span>HÔM NAY</span>
    </div>`;
}

// ----------------------------------------------------------------------------
// 4. LỊCH SỬ ÔN TẬP 30 NGÀY (REVIEWS HISTORY STACKED BARS)
// ----------------------------------------------------------------------------
function renderReviewsHistoryChart(history) {
  const container = document.getElementById('reviewsHistoryChartMount');
  if (!container || !history || !Array.isArray(history.daily)) return;

  const list = history.daily;
  const maxDayTotal = Math.max(...list.map(d => (d.mature || 0) + (d.young || 0) + (d.relearn || 0)), 100);

  const width = 800;
  const height = 180;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 40) / list.length - 4);

  let svgBars = '';
  list.forEach((d, i) => {
    const x = 20 + i * (barWidth + 4);
    const mCount = d.mature || 0;
    const yCount = d.young || 0;
    const rCount = d.relearn || 0;

    const mH = (mCount / maxDayTotal) * chartHeight;
    const yH = (yCount / maxDayTotal) * chartHeight;
    const rH = (rCount / maxDayTotal) * chartHeight;

    const mY = paddingTop + chartHeight - mH;
    const yY = mY - yH;
    const rY = yY - rH;

    svgBars += `
      <g class="cursor-pointer group">
        <title>${d.date}: Tổng ${d.total} (Mature: ${mCount}, Young: ${yCount}, Relearn: ${rCount})</title>
        <!-- Mature -->
        ${mH > 0 ? `<rect x="${x}" y="${mY}" width="${barWidth}" height="${mH}" fill="#0F766E" stroke="#111111" stroke-width="1" />` : ''}
        <!-- Young -->
        ${yH > 0 ? `<rect x="${x}" y="${yY}" width="${barWidth}" height="${yH}" fill="#D97706" stroke="#111111" stroke-width="1" />` : ''}
        <!-- Relearn -->
        ${rH > 0 ? `<rect x="${x}" y="${rY}" width="${barWidth}" height="${rH}" fill="#BE123C" stroke="#111111" stroke-width="1" />` : ''}
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-family="monospace" font-size="10" font-weight="bold" fill="#111111" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="${paddingTop + chartHeight}" x2="${width - 16}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
      ${svgBars}
    </svg>`;
}

// ----------------------------------------------------------------------------
// 5. TỔNG KHO THẺ & PHÂN BỔ TRẠNG THÁI (CARD COUNTS)
// ----------------------------------------------------------------------------
function renderCardCountsChart(cc) {
  if (!cc) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('cardCountTotal', Number(cc.total || 0).toLocaleString('vi-VN'));
  setTxt('cardCountNew', `${Number(cc.new || 0).toLocaleString('vi-VN')} (${cc.new_pct || 0}%)`);
  setTxt('cardCountLearn', `${Number(cc.learning || 0).toLocaleString('vi-VN')} (${cc.learning_pct || 0}%)`);
  setTxt('cardCountYoung', `${Number(cc.young || 0).toLocaleString('vi-VN')} (${cc.young_pct || 0}%)`);
  setTxt('cardCountMature', `${Number(cc.mature || 0).toLocaleString('vi-VN')} (${cc.mature_pct || 0}%)`);

  // Thanh phân bố phân đoạn kiến trúc
  const bar = document.getElementById('cardCountBarMount');
  if (bar) {
    const newW = cc.new_pct || 0;
    const learnW = cc.learning_pct || 0;
    const youngW = cc.young_pct || 0;
    const matureW = cc.mature_pct || 0;

    bar.innerHTML = `
      <div class="h-6 w-full flex border-2 border-[#111111] overflow-hidden bg-white">
        <div style="width: ${newW}%" class="bg-[#2563EB] text-white flex items-center justify-center font-mono-code text-xs font-bold" title="Mới: ${newW}%">
          ${newW > 10 ? `${newW}%` : ''}
        </div>
        <div style="width: ${learnW}%" class="bg-[#EA580C] text-white flex items-center justify-center font-mono-code text-xs font-bold" title="Đang học: ${learnW}%"></div>
        <div style="width: ${youngW}%" class="bg-[#D97706] text-white flex items-center justify-center font-mono-code text-xs font-bold" title="Young: ${youngW}%">
          ${youngW > 8 ? `${youngW}%` : ''}
        </div>
        <div style="width: ${matureW}%" class="bg-[#0F766E] text-white flex items-center justify-center font-mono-code text-xs font-bold" title="Mature: ${matureW}%">
          ${matureW > 10 ? `${matureW}%` : ''}
        </div>
      </div>`;
  }
}

// ----------------------------------------------------------------------------
// 6. KHOẢNG CÁCH ÔN TẬP (REVIEW INTERVALS)
// ----------------------------------------------------------------------------
function renderIntervalsChart(intervals) {
  const container = document.getElementById('intervalsChartMount');
  const medianEl = document.getElementById('intervalsMedian');
  if (medianEl && intervals) medianEl.innerText = `${intervals.median_months || 1.94} THÁNG`;
  if (!container || !intervals || !intervals.bins) return;

  renderGenericBarHistogram(container, intervals.bins, '#0F766E');
}

// ----------------------------------------------------------------------------
// 7. ĐỘ ỔN ĐỊNH TRÍ NHỚ FSRS (CARD STABILITY)
// ----------------------------------------------------------------------------
function renderStabilityChart(stability) {
  const container = document.getElementById('stabilityChartMount');
  const medianEl = document.getElementById('stabilityMedian');
  if (medianEl && stability) medianEl.innerText = `${stability.median_months || 1.97} THÁNG`;
  if (!container || !stability || !stability.bins) return;

  renderGenericBarHistogram(container, stability.bins, '#2563EB');
}

// ----------------------------------------------------------------------------
// 8. ĐỘ KHÓ THẺ FSRS (CARD DIFFICULTY)
// ----------------------------------------------------------------------------
function renderDifficultyChart(diff) {
  const container = document.getElementById('difficultyChartMount');
  const medianEl = document.getElementById('difficultyMedian');
  if (medianEl && diff) medianEl.innerText = `${diff.median_pct || 0}%`;
  if (!container || !diff || !diff.bins) return;

  renderGenericBarHistogram(container, diff.bins, '#BE123C');
}

// ----------------------------------------------------------------------------
// 9. KHẢ NĂNG GỢI NHỚ HÔM NAY (CARD RETRIEVABILITY)
// ----------------------------------------------------------------------------
function renderRetrievabilityChart(ret) {
  const container = document.getElementById('retrievabilityChartMount');
  const avgEl = document.getElementById('retrievabilityAvg');
  const estEl = document.getElementById('retrievabilityKnowledge');
  if (avgEl && ret) avgEl.innerText = `${ret.average_pct || 95}%`;
  if (estEl && ret) estEl.innerText = `${Number(ret.estimated_knowledge_cards || 5836).toLocaleString('vi-VN')} THẺ / ${Number(ret.estimated_knowledge_notes || 1945).toLocaleString('vi-VN')} TỪ VỰNG`;
  if (!container || !ret || !ret.bins) return;

  renderGenericBarHistogram(container, ret.bins, '#0F766E');
}

// ----------------------------------------------------------------------------
// HÀM VẼ BIỂU ĐỒ HISTOGRAM DÙNG CHUNG
// ----------------------------------------------------------------------------
function renderGenericBarHistogram(container, binsObj, barColor) {
  const entries = Object.entries(binsObj);
  const maxVal = Math.max(...entries.map(e => e[1]), 10);

  const width = 600;
  const height = 150;
  const paddingBottom = 26;
  const paddingTop = 10;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(12, (width - 40) / entries.length - 8);

  let bars = '';
  entries.forEach(([label, count], i) => {
    const x = 20 + i * (barWidth + 8);
    const bHeight = Math.max(2, (count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    bars += `
      <g class="cursor-pointer group">
        <title>${label}: ${count} thẻ</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${barColor}" stroke="#111111" stroke-width="1.5" />
        <text x="${x + barWidth / 2}" y="${height - 6}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 3}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${count}</text>
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="${paddingTop + chartHeight}" x2="${width - 16}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
      ${bars}
    </svg>`;
}

// ----------------------------------------------------------------------------
// 10. TỈ LỆ NHỚ THỰC TẾ (RETENTION RATE TABLE)
// ----------------------------------------------------------------------------
function renderRetentionTable(ret) {
  const tbody = document.getElementById('retentionTableBody');
  if (!tbody || !ret) return;

  const rows = [
    { label: 'HÔM NAY', data: ret.today },
    { label: 'HÔM QUA', data: ret.yesterday },
    { label: '7 NGÀY QUA', data: ret.last_week },
    { label: '30 NGÀY QUA', data: ret.last_month },
    { label: '1 NĂM QUA', data: ret.last_year }
  ];

  tbody.innerHTML = rows.map(r => {
    const d = r.data || { young: 'N/A', mature: 'N/A', total: 'N/A', count: 0 };
    return `
      <tr class="border-b border-zinc-200 hover:bg-[#F4F1EA]">
        <td class="p-2.5 font-mono-code font-bold text-xs uppercase text-zinc-700">${r.label}</td>
        <td class="p-2.5 font-mono-code font-bold text-xs text-[#D97706] text-right">${d.young}</td>
        <td class="p-2.5 font-mono-code font-bold text-xs text-[#0F766E] text-right">${d.mature}</td>
        <td class="p-2.5 font-mono-code font-extrabold text-xs text-[#111111] text-right">${d.total}</td>
        <td class="p-2.5 font-mono-code text-xs text-zinc-600 text-right">${Number(d.count || 0).toLocaleString('vi-VN')} LƯỢT</td>
      </tr>`;
  }).join('');
}

// ----------------------------------------------------------------------------
// 11. PHÂN BỔ THEO GIỜ TRONG NGÀY (HOURLY BREAKDOWN - 24 GIỜ)
// ----------------------------------------------------------------------------
function renderHourlyChart(hours) {
  const container = document.getElementById('hourlyChartMount');
  if (!container || !Array.isArray(hours)) return;

  const maxCount = Math.max(...hours.map(h => h.count), 50);

  const width = 800;
  const height = 160;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 40) / 24 - 4);

  let bars = '';
  hours.forEach((h, i) => {
    const x = 20 + i * (barWidth + 4);
    const bHeight = Math.max(2, (h.count / maxCount) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    bars += `
      <g class="cursor-pointer group">
        <title>${h.hour}h: ${h.count} lượt ôn tập (Độ nhớ: ${h.pass_rate}%)</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="#0F766E" stroke="#111111" stroke-width="1.5" />
        ${(i % 3 === 0 || i === 23) ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${h.hour}h</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="${paddingTop + chartHeight}" x2="${width - 16}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
      ${bars}
    </svg>`;
}

// ----------------------------------------------------------------------------
// 12. TỈ LỆ NHẤN NÚT ĐÁNH GIÁ (ANSWER BUTTONS)
// ----------------------------------------------------------------------------
function renderAnswerButtonsChart(buttons) {
  const container = document.getElementById('answerButtonsMount');
  if (!container || !buttons) return;

  const types = [
    { label: 'LEARNING (ĐANG HỌC)', data: buttons.learning },
    { label: 'YOUNG (THẺ NON)', data: buttons.young },
    { label: 'MATURE (THẺ GIÀ)', data: buttons.mature }
  ];

  container.innerHTML = types.map(t => {
    const d = t.data || { again: 0, hard: 0, good: 0, easy: 0 };
    const tot = (d.again || 0) + (d.hard || 0) + (d.good || 0) + (d.easy || 0);

    const getPct = val => tot > 0 ? Math.round(val / tot * 100) : 0;

    return `
      <div class="p-3 bg-[#F4F1EA] border-2 border-[#111111] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono-code font-extrabold uppercase">${t.label}</span>
          <span class="text-xs font-mono-code text-zinc-600 font-bold">${Number(tot).toLocaleString('vi-VN')} LƯỢT</span>
        </div>
        <div class="h-5 w-full flex border border-[#111111] overflow-hidden bg-white">
          <div style="width: ${getPct(d.again)}%" class="bg-[#BE123C]" title="Again: ${d.again} (${getPct(d.again)}%)"></div>
          <div style="width: ${getPct(d.hard)}%" class="bg-[#EA580C]" title="Hard: ${d.hard} (${getPct(d.hard)}%)"></div>
          <div style="width: ${getPct(d.good)}%" class="bg-[#0F766E]" title="Good: ${d.good} (${getPct(d.good)}%)"></div>
          <div style="width: ${getPct(d.easy)}%" class="bg-[#2563EB]" title="Easy: ${d.easy} (${getPct(d.easy)}%)"></div>
        </div>
        <div class="grid grid-cols-4 gap-1 text-[11px] sm:text-xs font-mono-code text-zinc-700">
          <div>AGAIN: <b class="text-[#BE123C]">${d.again || 0}</b></div>
          <div>HARD: <b class="text-[#EA580C]">${d.hard || 0}</b></div>
          <div>GOOD: <b class="text-[#0F766E]">${d.good || 0}</b></div>
          <div>EASY: <b class="text-[#2563EB]">${d.easy || 0}</b></div>
        </div>
      </div>`;
  }).join('');
}

// ----------------------------------------------------------------------------
// 13. THẺ THÊM MỚI 30 NGÀY (CARDS ADDED)
// ----------------------------------------------------------------------------
function renderCardsAddedChart(added) {
  const container = document.getElementById('cardsAddedChartMount');
  const sumEl = document.getElementById('cardsAddedTotal');
  const avgEl = document.getElementById('cardsAddedAvg');

  if (sumEl && added) sumEl.innerText = `${Number(added.total_added_30 || 9300).toLocaleString('vi-VN')} THẺ`;
  if (avgEl && added) avgEl.innerText = `${added.avg_added_day || 300} THẺ / NGÀY`;
  if (!container || !added || !Array.isArray(added.daily)) return;

  const list = added.daily;
  const maxVal = Math.max(...list.map(d => d.count), 100);

  const width = 800;
  const height = 150;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 40) / list.length - 4);

  let bars = '';
  list.forEach((d, i) => {
    const x = 20 + i * (barWidth + 4);
    const bHeight = Math.max(2, (d.count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    bars += `
      <g class="cursor-pointer group">
        <title>${d.date}: Thêm mới ${d.count} thẻ</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="#2563EB" stroke="#111111" stroke-width="1.5" />
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="${paddingTop + chartHeight}" x2="${width - 16}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
      ${bars}
    </svg>`;
}

// ----------------------------------------------------------------------------
// 14. TIẾN TRÌNH HỌC TỪNG CHỦ ĐỀ CON (SUBDECKS EXPLORER)
// ----------------------------------------------------------------------------
function renderSubdecksTable(subdecks) {
  const tbody = document.getElementById('subdecksTableBody');
  const countEl = document.getElementById('subdecksFilteredCount');
  if (!tbody || !Array.isArray(subdecks)) return;

  let filtered = subdecks;
  if (subdecksCurrentFilter) {
    const q = subdecksCurrentFilter.toLowerCase().trim();
    filtered = subdecks.filter(s => s.name.toLowerCase().includes(q) || String(s.stt).includes(q));
  }

  if (countEl) countEl.innerText = `${filtered.length} / ${subdecks.length} CHỦ ĐỀ`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / subdecksPageSize));
  if (subdecksCurrentPage > totalPages) subdecksCurrentPage = totalPages;

  const startIdx = (subdecksCurrentPage - 1) * subdecksPageSize;
  const pageItems = filtered.slice(startIdx, startIdx + subdecksPageSize);

  tbody.innerHTML = pageItems.map(s => {
    let statusBadge = '<span class="px-2 py-0.5 bg-[#EAE5DA] text-zinc-600 font-bold border border-[#111111]">CHƯA HỌC</span>';
    if (s.progress_pct >= 90) {
      statusBadge = '<span class="px-2 py-0.5 bg-[#0F766E] text-white font-bold border border-[#111111]">ĐÃ THUỘC (REVIEW)</span>';
    } else if (s.learning > 0 || s.review > 0) {
      statusBadge = '<span class="px-2 py-0.5 bg-[#D97706] text-white font-bold border border-[#111111]">ĐANG HỌC</span>';
    }

    return `
      <tr class="border-b border-zinc-200 hover:bg-[#F4F1EA]">
        <td class="p-2.5 font-mono-code font-bold text-xs">#${s.stt}</td>
        <td class="p-2.5 font-bold text-xs text-[#111111]">
          <div class="line-clamp-1" title="${s.name}">${s.name}</div>
        </td>
        <td class="p-2.5 font-mono-code text-xs text-right">${s.total}</td>
        <td class="p-2.5 font-mono-code text-xs text-blue-700 text-right">${s.new}</td>
        <td class="p-2.5 font-mono-code text-xs text-amber-700 text-right">${s.learning}</td>
        <td class="p-2.5 font-mono-code text-xs text-emerald-800 font-bold text-right">${s.review}</td>
        <td class="p-2.5 font-mono-code text-xs text-right">
          <div class="flex items-center justify-end gap-2">
            <span class="font-bold">${s.progress_pct}%</span>
            <div class="w-16 h-2 bg-zinc-200 border border-[#111111] overflow-hidden">
              <div class="h-full bg-[#0F766E]" style="width: ${s.progress_pct}%"></div>
            </div>
          </div>
        </td>
        <td class="p-2.5 text-xs text-center">${statusBadge}</td>
      </tr>`;
  }).join('');

  renderSubdecksPagination(totalPages);
}

function renderSubdecksPagination(totalPages) {
  const container = document.getElementById('subdecksPagination');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center gap-2 font-mono-code text-xs font-bold">
      <button onclick="changeSubdeckPage(-1)" ${subdecksCurrentPage <= 1 ? 'disabled class="px-3 py-1 bg-zinc-200 text-zinc-400 border border-zinc-400 cursor-not-allowed"' : 'class="neo-btn px-3 py-1 bg-white text-[#111111]"'}>
        TRANG TRƯỚC
      </button>
      <span class="px-2 py-1 bg-[#EAE5DA] border border-[#111111]">TRANG ${subdecksCurrentPage} / ${totalPages}</span>
      <button onclick="changeSubdeckPage(1)" ${subdecksCurrentPage >= totalPages ? 'disabled class="px-3 py-1 bg-zinc-200 text-zinc-400 border border-zinc-400 cursor-not-allowed"' : 'class="neo-btn px-3 py-1 bg-white text-[#111111]"'}>
        TRANG SAU
      </button>
    </div>`;
}

function changeSubdeckPage(delta) {
  subdecksCurrentPage += delta;
  if (currentAnkiStats && currentAnkiStats.subdecks) {
    renderSubdecksTable(currentAnkiStats.subdecks);
  }
}

function filterSubdecks(query) {
  subdecksCurrentFilter = query;
  subdecksCurrentPage = 1;
  if (currentAnkiStats && currentAnkiStats.subdecks) {
    renderSubdecksTable(currentAnkiStats.subdecks);
  }
}

// ----------------------------------------------------------------------------
// 15. POPUP DÁN NHANH THỐNG KÊ TỪ ĐIỆN THOẠI (QUICK PASTE MODAL)
// ----------------------------------------------------------------------------
function openQuickPasteModal() {
  const modal = document.getElementById('quickPasteModal');
  if (modal) modal.classList.remove('hidden');
}

function closeQuickPasteModal() {
  const modal = document.getElementById('quickPasteModal');
  if (modal) modal.classList.add('hidden');
}

function handlePasteAnkiStats() {
  const textarea = document.getElementById('quickPasteTextarea');
  if (!textarea || !textarea.value.trim()) {
    alert('Vui lòng dán đoạn văn bản thống kê sao chép từ Anki!');
    return;
  }

  const rawText = textarea.value.trim();
  const parsed = parseAnkiStatsText(rawText);

  if (!parsed || !parsed.today) {
    alert('Không thể nhận diện các trường thông số Anki. Hãy chắc chắn bạn đã sao chép từ màn hình Statistics!');
    return;
  }

  // Kết hợp với dữ liệu hiện tại nếu có
  const merged = Object.assign({}, currentAnkiStats || {}, parsed);
  merged.updated_at = new Date().toLocaleString('vi-VN');
  localStorage.setItem('anki_stats_override', JSON.stringify(merged));
  currentAnkiStats = merged;

  renderAllStatsCharts(merged);
  closeQuickPasteModal();
  alert('Đã cập nhật thành công số liệu học tập Anki vào giao diện!');
}

function clearManualStatsOverride() {
  localStorage.removeItem('anki_stats_override');
  loadAnkiStatsData(true);
  closeQuickPasteModal();
}

/**
 * Bộ phân tích chuỗi Regex trích xuất văn bản từ màn hình Stats của Anki
 */
function parseAnkiStatsText(text) {
  const result = {
    today: {},
    summary: {},
    card_counts: {},
    retention: {}
  };

  // Today: Studied 108 cards in 12.93 minutes today (7.18s/card)
  const todayMatch = text.match(/Studied\s+([\d,]+)\s+cards\s+in\s+([\d.]+)\s+minutes.*?\((\d+(?:\.\d+)?)\s*s\/card\)/i);
  if (todayMatch) {
    result.today.cards_studied = parseInt(todayMatch[1].replace(/,/g, ''), 10);
    result.today.time_minutes = parseFloat(todayMatch[2]);
    result.today.seconds_per_card = parseFloat(todayMatch[3]);
  }

  // Again count: 62 (57.41%)
  const againMatch = text.match(/Again\s+count:\s*(\d+)\s*\(([\d.]+)%\)/i);
  if (againMatch) {
    result.today.again_count = parseInt(againMatch[1], 10);
    result.today.again_pct = parseFloat(againMatch[2]);
  }

  // Learn: 108, Review: 0, Relearn: 0
  const lrrMatch = text.match(/Learn:\s*(\d+),\s*Review:\s*(\d+),\s*Relearn:\s*(\d+)/i);
  if (lrrMatch) {
    result.today.learn = parseInt(lrrMatch[1], 10);
    result.today.review = parseInt(lrrMatch[2], 10);
    result.today.relearn = parseInt(lrrMatch[3], 10);
  }

  // Days studied: 31 of 31 (100%)
  const daysMatch = text.match(/Days\s+studied:\s*(\d+)\s+of\s+(\d+)/i);
  if (daysMatch) {
    result.summary.days_studied_past_30 = parseInt(daysMatch[1], 10);
  }

  // Total reviews: Total: 19,128 reviews
  const totalRevMatch = text.match(/Total:\s*([\d,]+)\s+reviews/i);
  if (totalRevMatch) {
    result.summary.total_reviews_past_30 = parseInt(totalRevMatch[1].replace(/,/g, ''), 10);
  }

  // Card Counts: New 6,152 (50.02%), Mature 4,128 (33.56%), Young 2,006 (16.31%)
  const newMatch = text.match(/New\s+([\d,]+)\s+([\d.]+)%/i);
  if (newMatch) {
    result.card_counts.new = parseInt(newMatch[1].replace(/,/g, ''), 10);
    result.card_counts.new_pct = parseFloat(newMatch[2]);
  }
  const matureMatch = text.match(/Mature\s+([\d,]+)\s+([\d.]+)%/i);
  if (matureMatch) {
    result.card_counts.mature = parseInt(matureMatch[1].replace(/,/g, ''), 10);
    result.card_counts.mature_pct = parseFloat(matureMatch[2]);
  }
  const youngMatch = text.match(/Young\s+([\d,]+)\s+([\d.]+)%/i);
  if (youngMatch) {
    result.card_counts.young = parseInt(youngMatch[1].replace(/,/g, ''), 10);
    result.card_counts.young_pct = parseFloat(youngMatch[2]);
  }
  const totalCardsMatch = text.match(/Total\s+([\d,]+)\s*(?:\r?\n|$)/i);
  if (totalCardsMatch) {
    result.card_counts.total = parseInt(totalCardsMatch[1].replace(/,/g, ''), 10);
    result.summary.total_deck_cards = result.card_counts.total;
  }

  return result;
}

function renderFallbackStats() {
  renderSummaryAndToday({
    today: { cards_studied: 108, time_minutes: 12.93, seconds_per_card: 7.18, again_count: 62, again_pct: 57.41, learn: 108, review: 0, relearn: 0 },
    summary: { streak_days: 38, days_studied_past_30: 30, total_reviews_past_30: 18804, avg_reviews_day: 626, total_deck_cards: 12300 }
  });
}

function setupStatsEventHandlers() {
  const searchInput = document.getElementById('subdeckSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => filterSubdecks(e.target.value));
  }
}
