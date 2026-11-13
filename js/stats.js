// ============================================================================
// MODULE: js/stats.js
// Chức năng: Quản trị Bảng điều khiển Thống kê Học tập Anki & Thuật toán FSRS
//            Bóc tách độc quyền cho bộ bài: "Thử thách mỗi ngày 100 từ vựng"
//            Bao gồm 14 Biểu đồ Kiến trúc Trực quan Sinh động & AI Gemini Cố Vấn
//            Phong cách Swiss Editorial Typography — Tuyệt đối 0% Icon/Emoji.
// ============================================================================

let currentAnkiStats = null;
let subdecksCurrentFilter = '';
let subdecksCategoryFilter = 'all'; // all, review, learning, new
let subdecksCurrentPage = 1;
const subdecksPageSize = 15;

/**
 * Khởi tạo Trang Thống Kê Anki FSRS
 */
async function initStatsPage() {
  await loadAnkiStatsData();
  setupStatsEventHandlers();
  loadCachedGeminiAnalysis();
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
// 2. DỰ BÁO ĐẾN HẠN TƯƠNG LAI (FUTURE DUE - 30 NGÀY VỚI ĐƯỜNG TÍCH LŨY CUMULATIVE)
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
  const maxBarVal = Math.max(...days.map(d => d.count), 10);

  // Tính toán tích lũy cho đường Area Curve phía sau
  let runningTotal = 0;
  const cumulative = days.map(d => {
    runningTotal += d.count;
    return runningTotal;
  });
  const maxCumul = Math.max(runningTotal, 100);

  const width = 800;
  const height = 200;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(8, (width - 60) / days.length - 4);

  // Tạo đường tích lũy (Cumulative Area Path)
  let areaPoints = `M 30,${paddingTop + chartHeight}`;
  let linePoints = '';
  days.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4) + barWidth / 2;
    const y = paddingTop + chartHeight - (cumulative[i] / maxCumul) * chartHeight;
    areaPoints += ` L ${x},${y}`;
    linePoints += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  });
  const lastX = 30 + (days.length - 1) * (barWidth + 4) + barWidth / 2;
  areaPoints += ` L ${lastX},${paddingTop + chartHeight} Z`;

  // Vẽ các cột bar
  let barsSvg = '';
  days.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4);
    const bHeight = Math.max(2, (d.count / maxBarVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const isTomorrow = d.day === 1;
    const color = isTomorrow ? '#D97706' : (d.day === 0 ? '#BE123C' : '#0F766E');

    barsSvg += `
      <g class="cursor-pointer group">
        <title>Ngày +${d.day}: ${d.count} thẻ đến hạn (Tích lũy: ${cumulative[i]})</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${color}" stroke="#111111" stroke-width="1.5" />
        ${(i % 5 === 0 || i === days.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="10" font-weight="bold" fill="#111111" text-anchor="middle">+${d.day}</text>
        ` : ''}
        ${isTomorrow ? `
          <text x="${x + barWidth / 2}" y="${y - 4}" font-family="monospace" font-size="9" font-weight="extrabold" fill="#D97706" text-anchor="middle">${d.count}</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-500 mb-1">
        <span>CỘT: SỐ THẺ HÀNG NGÀY (TRỤC TRÁI)</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-[#0F766E]"></span> ĐƯỜNG: TẢI TRỌNG TÍCH LŨY (${Number(runningTotal).toLocaleString('vi-VN')} LƯỢT)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <!-- Đường lưới ngang -->
        <line x1="20" y1="${paddingTop}" x2="${width - 20}" y2="${paddingTop}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4" />
        
        <!-- Vùng tích lũy Cumulative Area -->
        <path d="${areaPoints}" fill="#0F766E" opacity="0.1" />
        <path d="${linePoints}" fill="none" stroke="#0F766E" stroke-width="2" stroke-dasharray="3,3" />

        <!-- Trục hoành -->
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        
        <!-- Cột dữ liệu -->
        ${barsSvg}
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 3. LỊCH HOẠT ĐỘNG TOÀN NĂM (CALENDAR HEATMAP VỚI NHÃN THÁNG & THỨ)
// ----------------------------------------------------------------------------
function renderCalendarHeatmap(calendar) {
  const container = document.getElementById('calendarHeatmapMount');
  if (!container) return;

  const datesMap = new Map();
  if (Array.isArray(calendar)) {
    calendar.forEach(c => datesMap.set(c.date, c.count));
  }

  // 52 tuần x 7 ngày
  const today = new Date();
  const weeks = [];
  let currentWeek = [];

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = datesMap.get(dateStr) || 0;
    const dayOfWeek = d.getDay(); // 0 = CN, 1 = T2...

    currentWeek.push({ date: dateStr, count, dayOfWeek });
    if (dayOfWeek === 6 || i === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Render lưới tuần
  let weeksHtml = '';
  weeks.forEach(w => {
    let weekCols = '';
    w.forEach(d => {
      let bg = 'bg-white';
      let border = 'border-zinc-300';
      if (d.count > 0 && d.count <= 100) { bg = 'bg-[#CCFBF1]'; border = 'border-[#0F766E]'; }
      else if (d.count > 100 && d.count <= 300) { bg = 'bg-[#5EEAD4]'; border = 'border-[#0F766E]'; }
      else if (d.count > 300 && d.count <= 600) { bg = 'bg-[#0D9488]'; border = 'border-[#111111]'; }
      else if (d.count > 600) { bg = 'bg-[#0F766E]'; border = 'border-[#111111]'; }

      weekCols += `
        <div class="w-3 h-3 ${bg} border ${border} transition-transform hover:scale-150 cursor-pointer" 
             title="${d.date}: ${d.count} lượt ôn tập"></div>`;
    });
    weeksHtml += `<div class="flex flex-col gap-1">${weekCols}</div>`;
  });

  container.innerHTML = `
    <div class="space-y-2">
      <div class="overflow-x-auto pb-1">
        <div class="flex gap-1 items-start">
          <div class="flex flex-col justify-between h-28 text-xs font-mono-code font-bold text-zinc-500 pr-1 select-none">
            <span>T2</span>
            <span>T4</span>
            <span>T6</span>
            <span>CN</span>
          </div>
          <div class="flex gap-1 items-center">
            ${weeksHtml}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-600 pt-1 border-t border-zinc-200">
        <span>365 NGÀY TRƯỚC</span>
        <div class="flex items-center gap-1.5">
          <span class="text-zinc-500">0</span>
          <div class="w-3 h-3 bg-white border border-zinc-400"></div>
          <div class="w-3 h-3 bg-[#CCFBF1] border border-[#0F766E]"></div>
          <div class="w-3 h-3 bg-[#5EEAD4] border border-[#0F766E]"></div>
          <div class="w-3 h-3 bg-[#0D9488] border border-[#111111]"></div>
          <div class="w-3 h-3 bg-[#0F766E] border border-[#111111]"></div>
          <span class="text-zinc-500">600+ LƯỢT</span>
        </div>
        <span>HÔM NAY</span>
      </div>
    </div>`;
}

// ----------------------------------------------------------------------------
// 4. LỊCH SỬ ÔN TẬP 30 NGÀY (REVIEWS HISTORY VỚI ĐƯỜNG TRUNG BÌNH TRƯỢT 7 NGÀY)
// ----------------------------------------------------------------------------
function renderReviewsHistoryChart(history) {
  const container = document.getElementById('reviewsHistoryChartMount');
  if (!container || !history || !Array.isArray(history.daily)) return;

  const list = history.daily;
  const maxDayTotal = Math.max(...list.map(d => (d.mature || 0) + (d.young || 0) + (d.relearn || 0)), 100);

  // Tính trung bình trượt 7 ngày (7-day Moving Average)
  const ma7 = list.map((d, i) => {
    const windowStart = Math.max(0, i - 6);
    const slice = list.slice(windowStart, i + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.total, 0);
    return Math.round(sum / slice.length);
  });

  const width = 800;
  const height = 200;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 60) / list.length - 4);

  // Tạo đường MA7
  let ma7Points = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4) + barWidth / 2;
    const y = paddingTop + chartHeight - (ma7[i] / maxDayTotal) * chartHeight;
    ma7Points += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  });

  let svgBars = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4);
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
        <title>${d.date}: Tổng ${d.total} (Mature: ${mCount}, Young: ${yCount}, Relearn: ${rCount}) • MA7: ${ma7[i]}</title>
        ${mH > 0 ? `<rect x="${x}" y="${mY}" width="${barWidth}" height="${mH}" fill="#0F766E" stroke="#111111" stroke-width="1" />` : ''}
        ${yH > 0 ? `<rect x="${x}" y="${yY}" width="${barWidth}" height="${yH}" fill="#D97706" stroke="#111111" stroke-width="1" />` : ''}
        ${rH > 0 ? `<rect x="${x}" y="${rY}" width="${barWidth}" height="${rH}" fill="#BE123C" stroke="#111111" stroke-width="1" />` : ''}
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="10" font-weight="bold" fill="#111111" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-500 mb-1">
        <span>CỘT XẾP CHỒNG: SỐ THẺ HÀNG NGÀY</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-[#111111]"></span> ĐƯỜNG ĐEN: TRUNG BÌNH TRƯỢT 7 NGÀY (MA7)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        ${svgBars}
        <!-- Đường trung bình trượt MA7 -->
        <path d="${ma7Points}" fill="none" stroke="#111111" stroke-width="2.5" />
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 5. TỔNG KHO THẺ & PHÂN BỔ TRẠNG THÁI (BIỂU ĐỒ DONUT SVG KIẾN TRÚC)
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

  // Vẽ biểu đồ Donut Chart hình tròn SVG
  const donutMount = document.getElementById('cardCountDonutMount');
  if (donutMount) {
    const total = cc.total || 12300;
    const r = 54;
    const circumference = 2 * Math.PI * r; // ~339.29

    const pMature = (cc.mature || 4128) / total;
    const pYoung = (cc.young || 2006) / total;
    const pLearn = (cc.learning || 14) / total;
    const pNew = (cc.new || 6152) / total;

    const dashMature = pMature * circumference;
    const dashYoung = pYoung * circumference;
    const dashLearn = pLearn * circumference;
    const dashNew = pNew * circumference;

    let offset = 0;
    const offMature = offset; offset -= dashMature;
    const offYoung = offset; offset -= dashYoung;
    const offLearn = offset; offset -= dashLearn;
    const offNew = offset;

    donutMount.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center gap-6 justify-center">
        <div class="relative w-40 h-40 shrink-0">
          <svg viewBox="0 0 140 140" class="w-full h-full transform -rotate-90 select-none">
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#EAE5DA" stroke-width="20" />
            <!-- Mature (Xanh lục) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#0F766E" stroke-width="20"
                    stroke-dasharray="${dashMature} ${circumference}" stroke-dashoffset="${offMature}" />
            <!-- Young (Vàng hổ phách) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#D97706" stroke-width="20"
                    stroke-dasharray="${dashYoung} ${circumference}" stroke-dashoffset="${offYoung}" />
            <!-- Learning (Cam) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#EA580C" stroke-width="20"
                    stroke-dasharray="${dashLearn} ${circumference}" stroke-dashoffset="${offLearn}" />
            <!-- New (Xanh lam) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#2563EB" stroke-width="20"
                    stroke-dasharray="${dashNew} ${circumference}" stroke-dashoffset="${offNew}" />
            <circle cx="70" cy="70" r="${r - 10}" fill="none" stroke="#111111" stroke-width="1.5" />
            <circle cx="70" cy="70" r="${r + 10}" fill="none" stroke="#111111" stroke-width="1.5" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span class="text-xs font-mono-code font-bold text-zinc-500 uppercase">TỔNG</span>
            <span class="text-base font-display font-extrabold text-[#111111] leading-none">${Number(total).toLocaleString('vi-VN')}</span>
            <span class="text-xs font-mono-code font-bold text-zinc-500">THẺ</span>
          </div>
        </div>

        <div class="space-y-1.5 w-full text-xs font-mono-code">
          <div class="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
            <span class="flex items-center gap-1.5 font-bold"><span class="w-3 h-3 bg-[#2563EB] border border-[#111111]"></span> MỚI (NEW)</span>
            <span class="font-extrabold">${cc.new_pct}% (${Number(cc.new || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
            <span class="flex items-center gap-1.5 font-bold"><span class="w-3 h-3 bg-[#0F766E] border border-[#111111]"></span> THẺ GIÀ (MATURE &ge;21D)</span>
            <span class="font-extrabold">${cc.mature_pct}% (${Number(cc.mature || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
            <span class="flex items-center gap-1.5 font-bold"><span class="w-3 h-3 bg-[#D97706] border border-[#111111]"></span> THẺ NON (YOUNG &lt;21D)</span>
            <span class="font-extrabold">${cc.young_pct}% (${Number(cc.young || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
            <span class="flex items-center gap-1.5 font-bold"><span class="w-3 h-3 bg-[#EA580C] border border-[#111111]"></span> ĐANG HỌC (LEARNING)</span>
            <span class="font-extrabold">${cc.learning_pct}% (${Number(cc.learning || 0).toLocaleString('vi-VN')})</span>
          </div>
        </div>
      </div>`;
  }
}

// ----------------------------------------------------------------------------
// 6. KHOẢNG CÁCH ÔN TẬP (REVIEW INTERVALS VỚI ĐƯỜNG TÍCH LŨY CUMULATIVE)
// ----------------------------------------------------------------------------
function renderIntervalsChart(intervals) {
  const container = document.getElementById('intervalsChartMount');
  const medianEl = document.getElementById('intervalsMedian');
  if (medianEl && intervals) medianEl.innerText = `${intervals.median_months || 1.94} THÁNG`;
  if (!container || !intervals || !intervals.bins) return;

  renderGenericBarHistogram(container, intervals.bins, '#0F766E', 'KHOẢNG CÁCH (NGÀY/THÁNG)');
}

// ----------------------------------------------------------------------------
// 7. ĐỘ ỔN ĐỊNH TRÍ NHỚ FSRS (CARD STABILITY VỚI ĐƯỜNG MỤC TIÊU)
// ----------------------------------------------------------------------------
function renderStabilityChart(stability) {
  const container = document.getElementById('stabilityChartMount');
  const medianEl = document.getElementById('stabilityMedian');
  if (medianEl && stability) medianEl.innerText = `${stability.median_months || 1.97} THÁNG`;
  if (!container || !stability || !stability.bins) return;

  renderGenericBarHistogram(container, stability.bins, '#2563EB', 'ĐỘ ỔN ĐỊNH S (THỜI GIAN ĐỂ NHỚ RƠI VỀ 90%)');
}

// ----------------------------------------------------------------------------
// 8. ĐỘ KHÓ THẺ FSRS (CARD DIFFICULTY PHÂN DẢI MÀU TỪ DỄ ĐẾN KHÓ)
// ----------------------------------------------------------------------------
function renderDifficultyChart(diff) {
  const container = document.getElementById('difficultyChartMount');
  const medianEl = document.getElementById('difficultyMedian');
  if (medianEl && diff) medianEl.innerText = `${diff.median_pct || 0}%`;
  if (!container || !diff || !diff.bins) return;

  const entries = Object.entries(diff.bins);
  const maxVal = Math.max(...entries.map(e => e[1]), 10);

  // Bảng màu 5 cấp độ khó
  const colors = ['#0F766E', '#10B981', '#F59E0B', '#EA580C', '#BE123C'];

  const width = 600;
  const height = 160;
  const paddingBottom = 28;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(16, (width - 60) / entries.length - 12);

  let bars = '';
  entries.forEach(([label, count], i) => {
    const x = 30 + i * (barWidth + 12);
    const bHeight = Math.max(2, (count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const color = colors[i] || '#0F766E';

    bars += `
      <g class="cursor-pointer group">
        <title>Mức độ ${label}: ${count} thẻ</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${color}" stroke="#111111" stroke-width="1.5" />
        <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="10" font-weight="bold" fill="#111111" text-anchor="middle">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 4}" font-family="monospace" font-size="10" font-weight="extrabold" fill="#111111" text-anchor="middle">${count}</text>
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-500 mb-1">
        <span class="text-[#0F766E]">0-20% (RẤT DỄ)</span>
        <span class="text-[#D97706]">41-60% (VỪA)</span>
        <span class="text-[#BE123C]">81-100% (RẤT KHÓ)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        ${bars}
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 9. KHẢ NĂNG GỢI NHỚ HÔM NAY (FSRS RETRIEVABILITY VỚI ĐƯỜNG MỤC TIÊU 90%)
// ----------------------------------------------------------------------------
function renderRetrievabilityChart(ret) {
  const container = document.getElementById('retrievabilityChartMount');
  const avgEl = document.getElementById('retrievabilityAvg');
  const estEl = document.getElementById('retrievabilityKnowledge');
  if (avgEl && ret) avgEl.innerText = `${ret.average_pct || 95}%`;
  if (estEl && ret) estEl.innerText = `${Number(ret.estimated_knowledge_cards || 5836).toLocaleString('vi-VN')} THẺ / ${Number(ret.estimated_knowledge_notes || 1945).toLocaleString('vi-VN')} TỪ VỰNG`;
  if (!container || !ret || !ret.bins) return;

  renderGenericBarHistogram(container, ret.bins, '#0F766E', 'XÁC SUẤT GỢI NHỚ THẺ R (MỤC TIÊU 90% | THỰC TẾ 95%)');
}

// ----------------------------------------------------------------------------
// HÀM VẼ HISTOGRAM KIẾN TRÚC DÙNG CHUNG
// ----------------------------------------------------------------------------
function renderGenericBarHistogram(container, binsObj, barColor, subtitle) {
  const entries = Object.entries(binsObj);
  const maxVal = Math.max(...entries.map(e => e[1]), 10);

  const width = 600;
  const height = 160;
  const paddingBottom = 28;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(12, (width - 60) / entries.length - 8);

  let bars = '';
  entries.forEach(([label, count], i) => {
    const x = 30 + i * (barWidth + 8);
    const bHeight = Math.max(2, (count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    bars += `
      <g class="cursor-pointer group">
        <title>${label}: ${count} thẻ</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${barColor}" stroke="#111111" stroke-width="1.5" />
        <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 4}" font-family="monospace" font-size="9" font-weight="extrabold" fill="#111111" text-anchor="middle">${count}</text>
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      ${subtitle ? `<div class="text-xs font-mono-code font-bold text-zinc-500 mb-1">${subtitle}</div>` : ''}
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        ${bars}
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 10. TỈ LỆ NHỚ THỰC TẾ (RETENTION RATE VỚI MINI PROGRESS BARS)
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
    const numY = parseFloat(d.young) || 0;
    const numM = parseFloat(d.mature) || 0;

    return `
      <tr class="border-b border-zinc-200 hover:bg-[#F4F1EA]">
        <td class="p-2.5 font-mono-code font-bold text-xs uppercase text-zinc-800">${r.label}</td>
        <td class="p-2.5 text-right font-mono-code text-xs">
          <div class="flex items-center justify-end gap-1.5">
            <span class="font-bold text-[#D97706]">${d.young}</span>
            ${numY > 0 ? `<div class="w-10 h-1.5 bg-zinc-200 border border-[#111111] overflow-hidden"><div class="h-full bg-[#D97706]" style="width:${numY}%"></div></div>` : ''}
          </div>
        </td>
        <td class="p-2.5 text-right font-mono-code text-xs">
          <div class="flex items-center justify-end gap-1.5">
            <span class="font-bold text-[#0F766E]">${d.mature}</span>
            ${numM > 0 ? `<div class="w-10 h-1.5 bg-zinc-200 border border-[#111111] overflow-hidden"><div class="h-full bg-[#0F766E]" style="width:${numM}%"></div></div>` : ''}
          </div>
        </td>
        <td class="p-2.5 font-mono-code font-extrabold text-xs text-[#111111] text-right">
          <span class="px-1.5 py-0.5 bg-[#EAE5DA] border border-[#111111]">${d.total}</span>
        </td>
        <td class="p-2.5 font-mono-code text-xs text-zinc-600 text-right">${Number(d.count || 0).toLocaleString('vi-VN')} LƯỢT</td>
      </tr>`;
  }).join('');
}

// ----------------------------------------------------------------------------
// 11. PHÂN BỔ THEO GIỜ TRONG NGÀY (DUAL-AXIS: CỘT LƯỢT ÔN & ĐƯỜNG PASS RATE %)
// ----------------------------------------------------------------------------
function renderHourlyChart(hours) {
  const container = document.getElementById('hourlyChartMount');
  if (!container || !Array.isArray(hours)) return;

  const maxCount = Math.max(...hours.map(h => h.count), 50);

  const width = 800;
  const height = 180;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 60) / 24 - 4);

  // Đường tỷ lệ nhớ Pass Rate (%)
  let linePoints = '';
  let dotNodes = '';
  hours.forEach((h, i) => {
    const x = 30 + i * (barWidth + 4) + barWidth / 2;
    const y = paddingTop + chartHeight - (h.pass_rate / 100.0) * chartHeight;
    linePoints += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
    if (h.count > 0) {
      dotNodes += `<circle cx="${x}" cy="${y}" r="2.5" fill="#D97706" stroke="#111111" stroke-width="1"><title>${h.hour}h: Nhớ ${h.pass_rate}%</title></circle>`;
    }
  });

  let bars = '';
  hours.forEach((h, i) => {
    const x = 30 + i * (barWidth + 4);
    const bHeight = Math.max(2, (h.count / maxCount) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const isPeak = h.hour >= 21 && h.hour <= 23;
    const barColor = isPeak ? '#0F766E' : '#2563EB';

    bars += `
      <g class="cursor-pointer group">
        <title>${h.hour}h: ${h.count} lượt ôn tập • Độ nhớ: ${h.pass_rate}%</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="${barColor}" stroke="#111111" stroke-width="1.5" />
        ${(i % 3 === 0 || i === 23) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${h.hour}h</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-500 mb-1">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-[#0F766E] border border-[#111111]"></span> CỘT: KHỐI LƯỢNG ÔN TẬP (GIỜ CAO ĐIỂM 21H-23H)</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-[#D97706]"></span> ĐƯỜNG VÀNG: TỈ LỆ NHỚ PASS RATE (%)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        ${bars}
        <!-- Đường Pass rate % -->
        <path d="${linePoints}" fill="none" stroke="#D97706" stroke-width="2" />
        ${dotNodes}
      </svg>
    </div>`;
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
        <div class="h-5 w-full flex border-2 border-[#111111] overflow-hidden bg-white">
          <div style="width: ${getPct(d.again)}%" class="bg-[#BE123C]" title="Again: ${d.again} (${getPct(d.again)}%)"></div>
          <div style="width: ${getPct(d.hard)}%" class="bg-[#EA580C]" title="Hard: ${d.hard} (${getPct(d.hard)}%)"></div>
          <div style="width: ${getPct(d.good)}%" class="bg-[#0F766E]" title="Good: ${d.good} (${getPct(d.good)}%)"></div>
          <div style="width: ${getPct(d.easy)}%" class="bg-[#2563EB]" title="Easy: ${d.easy} (${getPct(d.easy)}%)"></div>
        </div>
        <div class="grid grid-cols-4 gap-1 text-xs font-mono-code text-zinc-700">
          <div>AGAIN: <b class="text-[#BE123C]">${Number(d.again || 0).toLocaleString('vi-VN')}</b></div>
          <div>HARD: <b class="text-[#EA580C]">${Number(d.hard || 0).toLocaleString('vi-VN')}</b></div>
          <div>GOOD: <b class="text-[#0F766E]">${Number(d.good || 0).toLocaleString('vi-VN')}</b></div>
          <div>EASY: <b class="text-[#2563EB]">${Number(d.easy || 0).toLocaleString('vi-VN')}</b></div>
        </div>
      </div>`;
  }).join('');
}

// ----------------------------------------------------------------------------
// 13. THẺ THÊM MỚI 30 NGÀY (CARDS ADDED VỚI ĐƯỜNG MỤC TIÊU 300 THẺ/NGÀY)
// ----------------------------------------------------------------------------
function renderCardsAddedChart(added) {
  const container = document.getElementById('cardsAddedChartMount');
  const sumEl = document.getElementById('cardsAddedTotal');
  const avgEl = document.getElementById('cardsAddedAvg');

  if (sumEl && added) sumEl.innerText = `${Number(added.total_added_30 || 9300).toLocaleString('vi-VN')} THẺ`;
  if (avgEl && added) avgEl.innerText = `${added.avg_added_day || 300} THẺ / NGÀY`;
  if (!container || !added || !Array.isArray(added.daily)) return;

  const list = added.daily;
  const maxVal = Math.max(...list.map(d => d.count), 400);

  const width = 800;
  const height = 160;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 60) / list.length - 4);

  // Đường mục tiêu 300 thẻ/ngày
  const targetY = paddingTop + chartHeight - (300 / maxVal) * chartHeight;

  let bars = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4);
    const bHeight = Math.max(2, (d.count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    bars += `
      <g class="cursor-pointer group">
        <title>${d.date}: Thêm mới ${d.count} thẻ</title>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" fill="#2563EB" stroke="#111111" stroke-width="1.5" />
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="monospace" font-size="9" font-weight="bold" fill="#111111" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-mono-code font-bold text-zinc-500 mb-1">
        <span>CỘT XANH: THẺ THÊM MỚI HÀNG NGÀY</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-[#BE123C] border-dashed"></span> ĐƯỜNG ĐỎ: MỤC TIÊU 300 THẺ / NGÀY</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <!-- Đường mục tiêu 300 -->
        <line x1="20" y1="${targetY}" x2="${width - 20}" y2="${targetY}" stroke="#BE123C" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#111111" stroke-width="2" />
        ${bars}
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 14. TIẾN TRÌNH HỌC TỪNG CHỦ ĐỀ CON (SUBDECKS EXPLORER VỚI BỘ LỌC)
// ----------------------------------------------------------------------------
function renderSubdecksTable(subdecks) {
  const tbody = document.getElementById('subdecksTableBody');
  const countEl = document.getElementById('subdecksFilteredCount');
  if (!tbody || !Array.isArray(subdecks)) return;

  let filtered = subdecks;

  // Lọc theo từ khóa
  if (subdecksCurrentFilter) {
    const q = subdecksCurrentFilter.toLowerCase().trim();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || String(s.stt).includes(q));
  }

  // Lọc theo trạng thái
  if (subdecksCategoryFilter === 'review') {
    filtered = filtered.filter(s => s.progress_pct >= 90);
  } else if (subdecksCategoryFilter === 'learning') {
    filtered = filtered.filter(s => (s.learning > 0 || s.review > 0) && s.progress_pct < 90);
  } else if (subdecksCategoryFilter === 'new') {
    filtered = filtered.filter(s => s.learning === 0 && s.review === 0);
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

function setSubdeckCategoryFilter(cat) {
  subdecksCategoryFilter = cat;
  subdecksCurrentPage = 1;

  ['all', 'review', 'learning', 'new'].forEach(c => {
    const btn = document.getElementById(`subdeckCatBtn-${c}`);
    if (!btn) return;
    if (c === cat) {
      btn.className = 'px-3 py-1 bg-[#111111] text-white text-xs font-mono-code font-bold uppercase';
    } else {
      btn.className = 'neo-btn px-3 py-1 bg-white text-[#111111] text-xs font-mono-code font-bold uppercase';
    }
  });

  if (currentAnkiStats && currentAnkiStats.subdecks) {
    renderSubdecksTable(currentAnkiStats.subdecks);
  }
}

// ----------------------------------------------------------------------------
// 15. AI GEMINI PHÂN TÍCH & CỐ VẤN KẾT QUẢ HỌC TẬP (FSRS ADVISORY)
// ----------------------------------------------------------------------------
async function analyzeAnkiStatsWithGemini() {
  const geminiKey = localStorage.getItem('gemini_api_key') || '';
  const resultContainer = document.getElementById('geminiAnalysisResult');
  const btn = document.getElementById('btnGeminiAnalyze');

  if (!geminiKey) {
    alert(
      "ĐỂ DÙNG AI GEMINI NHẬN XÉT KẾT QUẢ HỌC:\n\n" +
      "Vui lòng nhấn vào nút 'CẤU HÌNH API' trên thanh menu trên cùng và nhập GEMINI API KEY của bạn.\n" +
      "(API Key được lưu an toàn trong trình duyệt của bạn để gọi trực tiếp tới Google Gemini)."
    );
    if (typeof openSettings === 'function') openSettings();
    return;
  }

  if (!currentAnkiStats) {
    alert("Chưa có số liệu học tập để AI phân tích!");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'AI GEMINI ĐANG PHÂN TÍCH...';
  }

  if (resultContainer) {
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = `
      <div class="p-6 bg-[#EAE5DA] border-2 border-[#111111] text-center space-y-2 animate-pulse">
        <div class="font-mono-code text-xs font-bold text-zinc-600 uppercase">TIẾN TRÌNH AI</div>
        <div class="font-display font-extrabold text-base text-[#111111] uppercase">
          AI Gemini đang đọc dữ liệu 14 biểu đồ và phân tích thuật toán FSRS...
        </div>
        <p class="text-xs font-mono-code text-zinc-500">
          Đang tính toán tải trọng tương lai, chỉ số ghi nhớ Retention và lập kế hoạch học tập tối ưu.
        </p>
      </div>`;
  }

  const d = currentAnkiStats;
  const prompt = `
Bạn là chuyên gia cố vấn phương pháp học Spaced Repetition (Lặp lại ngắt quãng) và chuyên gia phân tích thuật toán Anki FSRS (Free Spaced Repetition Scheduler).

Dưới đây là TOÀN BỘ SỐ LIỆU HỌC TẬP THỰC TẾ của học viên trên bộ bài "Thử thách mỗi ngày 100 từ vựng":
- Bộ bài: "${d.deck_name}"
- Chuỗi học liên tục (Streak): ${d.summary?.streak_days || 38} ngày
- Tỷ lệ chuyên cần 30 ngày qua: ${d.summary?.days_studied_past_30 || 30}/30 ngày (100%)
- Khối lượng ôn tập 30 ngày qua: ${d.summary?.total_reviews_past_30 || 18804} lượt (trung bình ${d.summary?.avg_reviews_day || 626} thẻ/ngày)
- Tổng số thẻ trong bộ bài: ${d.card_counts?.total || 12300} thẻ (Mới: ${d.card_counts?.new_pct || 50}%, Thẻ non Young: ${d.card_counts?.young_pct || 16.3}%, Thẻ già Mature: ${d.card_counts?.mature_pct || 33.6}%)
- Buổi học hôm nay: Đã học ${d.today?.cards_studied || 108} thẻ trong ${d.today?.time_minutes || 12.93} phút (tốc độ ${d.today?.seconds_per_card || 7.18}s/thẻ). Tỷ lệ bấm Again: ${d.today?.again_count || 62} lần (${d.today?.again_pct || 57.4}%), Learn: ${d.today?.learn || 108}, Review: 0.
- Chỉ số trí nhớ FSRS:
  + Độ giữ lại thực tế (Retention trên thẻ Review): 89.7% (Hôm qua 92.5%, 7 ngày qua 90.7%, 30 ngày qua 89.7%)
  + Khả năng gợi nhớ trung bình (Retrievability): ${d.retrievability?.average_pct || 95}%
  + Độ ổn định trung vị (Stability): ${d.stability?.median_months || 1.97} tháng
  + Độ khó trung vị (Difficulty): ${d.difficulty?.median_pct || 0}%
  + Dự báo ngày mai đến hạn (Due tomorrow): ${d.future_due?.due_tomorrow || 400} thẻ (Tải trọng dự kiến: ${d.future_due?.daily_load || 436} thẻ/ngày)
- Tiến độ chủ đề: Đã học xong và chuyển sang Review toàn bộ chủ đề A đến T (hơn 20 chủ đề hoàn tất 100%). Hiện đang học dở chủ đề U (176 new, 14 learn, 110 review) và chủ đề V (299 new, 1 review).
- Khung giờ hay học nhất: 21h đến 23h đêm.

YÊU CẦU:
Hãy viết một bản BÁO CÁO CỐ VẤN CHIẾN LƯỢC HỌC TẬP (FSRS Study Advisory) gồm 4 phần rõ ràng:
1. ĐIỂM TỔNG QUAN & ĐỘ BỀN BỈ: Chấm điểm hiệu suất (Grade A+, A hay B...) và nhận xét chuỗi 38 ngày học liên tục, tốc độ phản xạ 7.18s/thẻ.
2. PHÂN TÍCH TRÍ NHỚ FSRS & TỈ LỆ RETENTION: Phân tích sâu con số 89.7% retention so với mục tiêu 90%, giải thích vì sao tỷ lệ Again 57% hôm nay là bình thường khi bắt đầu chủ đề mới U.
3. CẢNH BÁO TẢI TRỌNG 30 NGÀY TỚI: Cảnh báo về 400 thẻ due ngày mai, tải trọng 436 thẻ/ngày, cách chống ngợp thẻ (Review Hell).
4. KẾ HOẠCH HÀNH ĐỘNG CỤ THỂ CHO NGÀY MAI: Hướng dẫn phân bổ khung giờ học (tận dụng khung giờ 21h-23h), chiến thuật xử lý dứt điểm chủ đề U và V.

QUY TẮC ĐỊNH DẠNG:
- Trả về tiếng Việt chuẩn xác, súc tích, chuyên sâu, truyền cảm hứng cao.
- TUYỆT ĐỐI KHÔNG DÙNG ICON HOẶC EMOJI (0% icon/emoji). Dùng các thẻ Markdown chuẩn: tiêu đề ##, in đậm **, gạch đầu dòng -.
`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  let responseText = null;
  let usedModel = '';

  for (const m of candidateModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const txt = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) {
          responseText = txt;
          usedModel = m;
          break;
        }
      }
    } catch (e) {}
  }

  if (btn) {
    btn.disabled = false;
    btn.innerText = 'PHÂN TÍCH KẾT QUẢ BẰNG AI GEMINI';
  }

  if (!responseText) {
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="p-4 bg-[#F4F1EA] border-2 border-[#BE123C] text-xs font-mono-code text-[#BE123C] space-y-2">
          <b>LỖI KẾT NỐI GEMINI API:</b> Không thể tạo nhận xét. Vui lòng kiểm tra lại Gemini API Key trong mục 'CẤU HÌNH API' và thử lại.
        </div>`;
    }
    return;
  }

  // Lưu cache
  const cachedPayload = {
    model: usedModel,
    timestamp: new Date().toLocaleString('vi-VN'),
    text: responseText
  };
  localStorage.setItem('anki_gemini_analysis', JSON.stringify(cachedPayload));
  renderGeminiAnalysisUI(cachedPayload);
}

function loadCachedGeminiAnalysis() {
  const cached = localStorage.getItem('anki_gemini_analysis');
  if (cached) {
    try {
      const payload = JSON.parse(cached);
      renderGeminiAnalysisUI(payload);
    } catch (e) {}
  }
}

function renderGeminiAnalysisUI(payload) {
  const resultContainer = document.getElementById('geminiAnalysisResult');
  if (!resultContainer || !payload || !payload.text) return;

  resultContainer.classList.remove('hidden');

  // Chuyển markdown cơ bản sang HTML thuần Swiss typography
  const formattedHtml = formatMarkdownToSwissHTML(payload.text);

  resultContainer.innerHTML = `
    <div class="p-6 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-[#0F766E] text-white text-xs font-mono-code font-extrabold uppercase">
            BÁO CÁO CỐ VẤN CHIẾN LƯỢC FSRS
          </span>
          <span class="text-xs font-mono-code font-bold text-zinc-600 uppercase">
            MODEL: ${payload.model} • ${payload.timestamp}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="copyGeminiAnalysisText()" class="neo-btn px-3 py-1 bg-white text-[#111111] text-xs font-mono-code font-bold uppercase hover:bg-[#EAE5DA]">
            SAO CHÉP BÁO CÁO
          </button>
          <button onclick="analyzeAnkiStatsWithGemini()" class="neo-btn px-3 py-1 bg-[#111111] text-white text-xs font-mono-code font-bold uppercase">
            PHÂN TÍCH LẠI
          </button>
        </div>
      </div>

      <div class="prose max-w-none text-xs sm:text-sm font-sans space-y-3 leading-relaxed text-[#111111]">
        ${formattedHtml}
      </div>
    </div>`;
}

function copyGeminiAnalysisText() {
  const cached = localStorage.getItem('anki_gemini_analysis');
  if (!cached) return;
  try {
    const payload = JSON.parse(cached);
    navigator.clipboard.writeText(payload.text).then(() => {
      alert('Đã sao chép toàn bộ nhận xét AI Gemini vào bộ nhớ tạm!');
    });
  } catch (e) {}
}

function formatMarkdownToSwissHTML(md) {
  return md
    .split('\n\n')
    .map(block => {
      const b = block.trim();
      if (!b) return '';

      if (b.startsWith('## ') || b.startsWith('### ')) {
        const title = b.replace(/^#+\s*/, '');
        return `<h4 class="text-sm sm:text-base font-display font-extrabold uppercase tracking-tight text-[#111111] pt-3 pb-1 border-b border-[#111111] mt-2">${title}</h4>`;
      }

      if (b.startsWith('- ') || b.startsWith('* ')) {
        const items = b.split('\n').map(line => {
          const itemText = line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-[#111111]">$1</b>');
          return `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 bg-[#111111] shrink-0 mt-1.5"></span><span>${itemText}</span></li>`;
        }).join('');
        return `<ul class="space-y-1.5 pl-2 font-mono-code text-xs">${items}</ul>`;
      }

      // Đoạn văn thường
      const parsedText = b.replace(/\*\*(.*?)\*\*/g, '<b class="font-extrabold text-[#111111]">$1</b>');
      return `<p class="text-xs sm:text-sm text-zinc-800">${parsedText}</p>`;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// 16. POPUP DÁN NHANH THỐNG KÊ TỪ ĐIỆN THOẠI (QUICK PASTE MODAL)
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

function parseAnkiStatsText(text) {
  const result = {
    today: {},
    summary: {},
    card_counts: {},
    retention: {}
  };

  const todayMatch = text.match(/Studied\s+([\d,]+)\s+cards\s+in\s+([\d.]+)\s+minutes.*?\((\d+(?:\.\d+)?)\s*s\/card\)/i);
  if (todayMatch) {
    result.today.cards_studied = parseInt(todayMatch[1].replace(/,/g, ''), 10);
    result.today.time_minutes = parseFloat(todayMatch[2]);
    result.today.seconds_per_card = parseFloat(todayMatch[3]);
  }

  const againMatch = text.match(/Again\s+count:\s*(\d+)\s*\(([\d.]+)%\)/i);
  if (againMatch) {
    result.today.again_count = parseInt(againMatch[1], 10);
    result.today.again_pct = parseFloat(againMatch[2]);
  }

  const lrrMatch = text.match(/Learn:\s*(\d+),\s*Review:\s*(\d+),\s*Relearn:\s*(\d+)/i);
  if (lrrMatch) {
    result.today.learn = parseInt(lrrMatch[1], 10);
    result.today.review = parseInt(lrrMatch[2], 10);
    result.today.relearn = parseInt(lrrMatch[3], 10);
  }

  const daysMatch = text.match(/Days\s+studied:\s*(\d+)\s+of\s+(\d+)/i);
  if (daysMatch) {
    result.summary.days_studied_past_30 = parseInt(daysMatch[1], 10);
  }

  const totalRevMatch = text.match(/Total:\s*([\d,]+)\s+reviews/i);
  if (totalRevMatch) {
    result.summary.total_reviews_past_30 = parseInt(totalRevMatch[1].replace(/,/g, ''), 10);
  }

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

// ----------------------------------------------------------------------------
// 17. TRUNG TÂM ĐỒNG BỘ ANKIWEB & TIẾN TRÌNH THỜI GIAN THỰC GITHUB ACTIONS
// ----------------------------------------------------------------------------
let syncPollInterval = null;

function openSyncAnkiModal() {
  const modal = document.getElementById('syncAnkiModal');
  if (!modal) {
    openQuickPasteModal();
    return;
  }
  modal.classList.remove('hidden');

  const token = localStorage.getItem('gh_token') || '';
  const tokenStatus = document.getElementById('syncModalTokenStatus');
  const tokenInput = document.getElementById('syncModalTokenInput');
  if (tokenStatus) {
    if (token) {
      tokenStatus.innerText = 'ĐÃ CẤU HÌNH';
      tokenStatus.className = 'font-extrabold text-[#0F766E]';
      if (tokenInput && !tokenInput.value) tokenInput.value = token;
    } else {
      tokenStatus.innerText = 'CHƯA CẤU HÌNH';
      tokenStatus.className = 'font-extrabold text-[#BE123C]';
    }
  }

  const currentStatusEl = document.getElementById('syncModalCurrentStatus');
  if (currentStatusEl && currentAnkiStats) {
    const isLocal = !!localStorage.getItem('anki_stats_override');
    currentStatusEl.innerText = `${isLocal ? '[Bản dán điện thoại]' : '[AnkiWeb Cloud]'} ${currentAnkiStats.updated_at || 'Chưa rõ'} (${currentAnkiStats.card_counts?.total || 12300} thẻ)`;
  }
}

function closeSyncAnkiModal() {
  const modal = document.getElementById('syncAnkiModal');
  if (modal) modal.classList.add('hidden');
}

async function executeCloudSyncFromModal() {
  const tokenInput = document.getElementById('syncModalTokenInput');
  const inputVal = tokenInput ? tokenInput.value.trim() : '';
  if (inputVal) {
    localStorage.setItem('gh_token', inputVal);
  }
  const token = inputVal || localStorage.getItem('gh_token') || '';
  if (!token) {
    alert("Vui lòng nhập GitHub Personal Access Token (PAT) để kích hoạt máy ảo.");
    if (tokenInput) tokenInput.focus();
    return;
  }
  await executeCloudSyncProcess(token);
}

async function triggerAnkiWebSync() {
  const token = localStorage.getItem('gh_token') || '';
  if (!token) {
    openSyncAnkiModal();
    return;
  }
  await executeCloudSyncProcess();
}

async function executeCloudSyncProcess(tokenOverride = '') {
  const owner = localStorage.getItem('gh_owner') || 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const token = tokenOverride || localStorage.getItem('gh_token') || '';
  const btn = document.getElementById('btnSyncAnkiWeb');
  const modalBtn = document.getElementById('btnModalExecuteSync');
  const runStatusBox = document.getElementById('syncModalRunStatus');
  const badge = document.getElementById('ankiStatsSyncBadge');

  if (!token) {
    openSyncAnkiModal();
    return;
  }

  const setBtnText = (txt, disabled = true) => {
    if (btn) { btn.disabled = disabled; btn.innerText = txt; }
    if (modalBtn) { modalBtn.disabled = disabled; modalBtn.innerText = txt; }
    if (badge && disabled) {
      badge.innerText = `[ĐANG ĐỒNG BỘ] ${txt}`;
      badge.className = 'text-xs font-mono-code font-bold px-3 py-1.5 bg-[#FEF3C7] text-[#D97706] border-2 border-[#111111] animate-pulse';
    }
  };

  const showStatusMsg = (msg, isErr = false) => {
    if (runStatusBox) {
      runStatusBox.classList.remove('hidden');
      runStatusBox.innerHTML = `<span class="${isErr ? 'text-[#BE123C] font-bold' : 'text-[#111111]'}">${msg}</span>`;
    }
  };

  setBtnText('ĐANG GỬI LỆNH LÊN CLOUD...');
  showStatusMsg('Đang kết nối GitHub API để kích hoạt máy ảo Ubuntu...');

  const startTime = Date.now();

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/sync_ankiweb.yml/dispatches`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: branch })
    });

    if (res.status === 204) {
      setBtnText('MÁY ẢO ĐÃ NHẬN LỆNH...');
      showStatusMsg('Lệnh đồng bộ đã gửi thành công! Đang chờ máy ảo GitHub khởi động và đăng nhập AnkiWeb...');
      if (typeof showToastAlert === 'function') {
        showToastAlert('Đã gửi lệnh đồng bộ! Máy ảo đang kết nối AnkiWeb...', 'success');
      }

      startPollingSyncRun(owner, repo, token, startTime);
    } else {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.message || '';
      } catch (e) {}

      let humanMsg = `Lỗi kích hoạt GitHub Actions (HTTP ${res.status})`;
      if (res.status === 404) {
        humanMsg = "Lỗi HTTP 404: Không tìm thấy workflow hoặc GitHub Token thiếu quyền 'workflow' và 'repo'. Vui lòng kiểm tra quyền hạn của GitHub Token.";
      } else if (res.status === 401) {
        humanMsg = "Lỗi HTTP 401: GitHub Token không hợp lệ hoặc đã hết hạn.";
      } else if (errDetail) {
        humanMsg += `: ${errDetail}`;
      }

      setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
      showStatusMsg(humanMsg, true);
      alert(humanMsg);
    }
  } catch (err) {
    setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
    showStatusMsg(`Lỗi kết nối mạng: ${err.message}`, true);
    alert(`Lỗi kết nối API: ${err.message}`);
  }
}

function startPollingSyncRun(owner, repo, token, startTime) {
  if (syncPollInterval) clearInterval(syncPollInterval);
  let pollAttempts = 0;
  const maxAttempts = 35; // tối đa 140 giây

  const btn = document.getElementById('btnSyncAnkiWeb');
  const modalBtn = document.getElementById('btnModalExecuteSync');
  const runStatusBox = document.getElementById('syncModalRunStatus');

  const setBtnText = (txt, disabled = true) => {
    if (btn) { btn.disabled = disabled; btn.innerText = txt; }
    if (modalBtn) { modalBtn.disabled = disabled; modalBtn.innerText = txt; }
  };

  const showStatusMsg = (msg, isErr = false) => {
    if (runStatusBox) {
      runStatusBox.classList.remove('hidden');
      runStatusBox.innerHTML = `<span class="${isErr ? 'text-[#BE123C] font-bold' : 'text-[#111111]'}">${msg}</span>`;
    }
  };

  syncPollInterval = setInterval(async () => {
    pollAttempts++;
    if (pollAttempts > maxAttempts) {
      clearInterval(syncPollInterval);
      setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
      showStatusMsg('Thời gian chờ quá lâu. Đang tải lại dữ liệu mới nhất...');
      await loadAnkiStatsData(true);
      return;
    }

    try {
      const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/sync_ankiweb.yml/runs?per_page=3&t=${Date.now()}`;
      const res = await fetch(runsUrl, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) return;
      const data = await res.json();
      const runs = data.workflow_runs || [];
      const recentRun = runs.find(r => new Date(r.created_at).getTime() >= (startTime - 15000));

      if (recentRun) {
        if (recentRun.status === 'queued') {
          setBtnText('MÁY ẢO ĐANG XẾP HÀNG...');
          showStatusMsg(`Máy ảo Ubuntu đang xếp hàng (Run #${recentRun.run_number})...`);
        } else if (recentRun.status === 'in_progress') {
          setBtnText('ĐANG ĐỒNG BỘ ANKIWEB...');
          showStatusMsg(`Máy ảo đang chạy: Đăng nhập AnkiWeb, tải SQLite và bóc tách 14 biểu đồ...`);
        } else if (recentRun.status === 'completed') {
          clearInterval(syncPollInterval);
          if (recentRun.conclusion === 'success') {
            setBtnText('ĐỒNG BỘ THÀNH CÔNG!');
            showStatusMsg('[HOÀN TẤT] Đồng bộ AnkiWeb thành công! Dữ liệu 14 biểu đồ đã được cập nhật.');
            if (typeof showToastAlert === 'function') {
              showToastAlert('Đồng bộ AnkiWeb Cloud thành công! Dữ liệu đã cập nhật.', 'success');
            }
            localStorage.removeItem('anki_stats_override');
            setTimeout(async () => {
              await loadAnkiStatsData(true);
              setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
              closeSyncAnkiModal();
            }, 2500);
          } else {
            setBtnText('ĐỒNG BỘ THẤT BẠI', false);
            const errMsg = `Máy ảo báo lỗi (conclusion: ${recentRun.conclusion}). Vui lòng kiểm tra tài khoản ANKIWEB_USERNAME và ANKIWEB_PASSWORD trong GitHub Secrets!`;
            showStatusMsg(errMsg, true);
            if (typeof showToastAlert === 'function') {
              showToastAlert(errMsg, 'danger');
            }
          }
        }
      }
    } catch (e) {}
  }, 4000);
}
