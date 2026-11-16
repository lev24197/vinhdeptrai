// ============================================================================
// MODULE: js/stats.js
// Chức năng: Quản trị Bảng điều khiển Thống kê Học tập Anki & Thuật toán FSRS
//            Bóc tách độc quyền cho bộ bài: "Thử thách mỗi ngày 100 từ vựng"
//            Bao gồm 14 Biểu đồ Trực quan Sinh động & AI Gemini Cố Vấn
//            Giao diện Modern Clean SaaS — Gradients thanh lịch, góc bo tròn,
//            Tooltip tương tác mượt mà trên chuột và cảm ứng di động.
// ============================================================================

let currentAnkiStats = null;
let subdecksCurrentFilter = '';
let subdecksCategoryFilter = 'all'; // all, review, learning, new
let subdecksCurrentPage = 1;
const subdecksPageSize = 15;

/**
 * Modern Interactive Floating Tooltip Controller
 */
function showStatsTooltip(e, htmlContent) {
  let tip = document.getElementById('statsModernTooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'statsModernTooltip';
    tip.className = 'fixed pointer-events-none z-[9999] px-3.5 py-2.5 bg-slate-900/90 text-white text-xs rounded-xl shadow-xl backdrop-blur-md border border-slate-700/60 transition-opacity duration-150 font-sans leading-snug';
    document.body.appendChild(tip);
  }
  tip.innerHTML = htmlContent;
  tip.style.opacity = '1';
  tip.style.display = 'block';

  let clientX = e.clientX;
  let clientY = e.clientY;
  if (clientX === undefined && e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  if (clientX === undefined) {
    clientX = window.innerWidth / 2;
    clientY = window.innerHeight / 2;
  }

  const tipRect = tip.getBoundingClientRect();
  let left = clientX + 14;
  let top = clientY - tipRect.height - 10;

  if (left + tipRect.width > window.innerWidth - 12) {
    left = clientX - tipRect.width - 14;
  }
  if (top < 12) {
    top = clientY + 16;
  }

  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

function hideStatsTooltip() {
  const tip = document.getElementById('statsModernTooltip');
  if (tip) {
    tip.style.opacity = '0';
    setTimeout(() => {
      if (tip && tip.style.opacity === '0') tip.style.display = 'none';
    }, 150);
  }
}

/**
 * Standard SVG Defs for Modern Gradients
 */
function getSvgDefs() {
  return `
    <defs>
      <!-- Indigo to Violet Gradient -->
      <linearGradient id="gradIndigoViolet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="100%" stop-color="#8B5CF6" />
      </linearGradient>
      <!-- Emerald to Teal Gradient -->
      <linearGradient id="gradEmeraldTeal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10B981" />
        <stop offset="100%" stop-color="#14B8A6" />
      </linearGradient>
      <!-- Amber to Orange Gradient -->
      <linearGradient id="gradAmberOrange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>
      <!-- Rose to Pink Gradient -->
      <linearGradient id="gradRosePink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F43F5E" />
        <stop offset="100%" stop-color="#FB7185" />
      </linearGradient>
      <!-- Blue to Cyan Gradient -->
      <linearGradient id="gradBlueCyan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3B82F6" />
        <stop offset="100%" stop-color="#06B6D4" />
      </linearGradient>
      <!-- Soft Area Gradients for Curves -->
      <linearGradient id="areaEmerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10B981" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#10B981" stop-opacity="0.01" />
      </linearGradient>
      <linearGradient id="areaIndigo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366F1" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#6366F1" stop-opacity="0.01" />
      </linearGradient>
    </defs>
  `;
}

/**
 * Khởi tạo Trang Thống Kê Anki FSRS
 */
async function initStatsPage() {
  await loadAnkiStatsData();
  setupStatsEventHandlers();
  loadCachedGeminiAnalysis();
  runFsrsSimulationWeb();
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
    statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 animate-pulse';
  }

  // Kiểm tra bộ nhớ tạm do người dùng dán gần đây (nếu không ép tải mới)
  const localOverride = !forceReload ? localStorage.getItem('anki_stats_override') : null;
  if (localOverride) {
    try {
      currentAnkiStats = JSON.parse(localOverride);
      if (typeof window !== 'undefined') window.currentAnkiStats = currentAnkiStats;
      renderAllStatsCharts(currentAnkiStats);
      if (statusBadge) {
        statusBadge.innerText = `[BỘ NHỚ TRÌNH DUYỆT] CẬP NHẬT: ${currentAnkiStats.updated_at || 'MỚI DÁN'}`;
        statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 cursor-pointer shadow-sm';
      }
      return;
    } catch (e) {
      localStorage.removeItem('anki_stats_override');
    }
  }

  try {
    let loaded = false;
    const token = typeof getGitHubToken === 'function' ? getGitHubToken() : (localStorage.getItem('gh_token') || '');
    const owner = localStorage.getItem('gh_owner') || 'lev24197';
    const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
    const branch = localStorage.getItem('gh_branch') || 'main';

    // Khi ép làm mới (forceReload), ưu tiên tải dữ liệu mới nhất trực tiếp từ GitHub API (không bị cache CDN của GitHub Pages)
    if (forceReload && token && owner && repo) {
      try {
        const ghApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/anki_stats.json?ref=${branch}&t=${Date.now()}`;
        const ghRes = await fetch(ghApiUrl, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          if (ghData && ghData.content) {
            const rawText = decodeURIComponent(escape(atob(ghData.content.replace(/\s/g, ''))));
            currentAnkiStats = JSON.parse(rawText);
            loaded = true;
          }
        }
      } catch (e) {
        console.warn('Lỗi tải trực tiếp từ GitHub API, thử phương thức thông thường:', e);
      }
    }

    if (!loaded) {
      const res = await (typeof smartFetch === 'function' ? smartFetch('data/anki_stats.json') : fetch('data/anki_stats.json'));
      currentAnkiStats = await res.json();
    }
    if (typeof window !== 'undefined') window.currentAnkiStats = currentAnkiStats;
    renderAllStatsCharts(currentAnkiStats);

    if (statusBadge) {
      statusBadge.innerText = `[ĐỒNG BỘ CLOUD] CẬP NHẬT: ${currentAnkiStats.updated_at} (${currentAnkiStats.summary?.total_deck_cards || 0} THẺ)`;
      statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 cursor-pointer hover:bg-emerald-100 transition-colors shadow-sm';
    }
  } catch (err) {
    if (statusBadge) {
      statusBadge.innerText = '[CHƯA CÓ FILE] BẤM VÀO ĐÂY ĐỂ DÁN DỮ LIỆU TỪ ĐIỆN THOẠI';
      statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 cursor-pointer hover:bg-rose-100 transition-colors shadow-sm';
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

  setTxt('todayCardsStudied', Number(t.cards_studied || 0).toLocaleString('vi-VN'));
  setTxt('todayTimeMinutes', `${t.time_minutes || 0} PHÚT`);
  setTxt('todaySpeed', `${t.seconds_per_card || 0} GIÂY / THẺ`);
  setTxt('todayAgainCount', `${t.again_count || 0} LẦN (${t.again_pct || 0}%)`);

  setTxt('todayLearnCount', t.learn || 0);
  setTxt('todayReviewCount', t.review || 0);
  setTxt('todayRelearnCount', t.relearn || 0);
  setTxt('todayGoodEasy', `${(t.good_count || 0) + (t.easy_count || 0)} LẦN`);

  setTxt('summaryStreak', `${s.streak_days || 38} NGÀY`);
  setTxt('summaryDaysStudied', `${s.days_studied_past_30 || 30} / 30 NGÀY`);
  setTxt('summaryTotalReviews', Number(s.total_reviews_past_30 || 18804).toLocaleString('vi-VN'));
  setTxt('summaryAvgDailyReviews', `${s.avg_reviews_day || 626} THẺ / NGÀY`);

  // Đồng bộ thời gian thực cho Bảng điều khiển Anki trên Trang chủ index.html
  renderIndexDashboardAnkiStats(data);
}

// ----------------------------------------------------------------------------
// 1.1. BẢNG ĐIỀU KHIỂN ÔN TẬP ANKI TRÊN TRANG CHỦ (INDEX.HTML REAL-TIME SYNC)
// ----------------------------------------------------------------------------
function renderIndexDashboardAnkiStats(data) {
  if (!data) return;
  const t = data.today || {};
  const s = data.summary || {};
  const cc = data.card_counts || {};
  const ret = data.retention || {};

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined && val !== null ? val : '--';
  };

  // 1. Chuỗi học (Streak)
  const streakVal = s.streak_days !== undefined ? s.streak_days : 38;
  setTxt('indexAnkiStreak', `${streakVal} NGÀY`);
  const daysStudied = s.days_studied_past_30 || 30;
  const streakRate = Math.round((daysStudied / 30) * 100);
  setTxt('indexAnkiStreakSub', `Học liên tục ${streakRate}% (${daysStudied}/30 ngày)`);

  // 2. Hôm nay đã học
  const cardsToday = Number(t.cards_studied || 0).toLocaleString('vi-VN');
  setTxt('indexAnkiTodayCards', `${cardsToday} THẺ`);
  const timeMin = t.time_minutes ? `${t.time_minutes} phút` : '0 phút';
  const speed = t.seconds_per_card ? ` (${t.seconds_per_card}s/thẻ)` : '';
  setTxt('indexAnkiTodaySub', `${timeMin}${speed}`);

  // 3. Độ nhớ Retention (lấy thẻ Review thực tế 30 ngày qua hoặc tuần qua)
  let retPct = '89.7%';
  if (ret.last_month && ret.last_month.total && ret.last_month.total !== 'N/A') {
    retPct = ret.last_month.total;
  } else if (ret.last_week && ret.last_week.total && ret.last_week.total !== 'N/A') {
    retPct = ret.last_week.total;
  } else if (ret.yesterday && ret.yesterday.total && ret.yesterday.total !== 'N/A') {
    retPct = ret.yesterday.total;
  }
  setTxt('indexAnkiRetention', retPct);
  setTxt('indexAnkiRetentionSub', 'Pass rate thẻ Review (FSRS)');

  // 4. Tổng kho bộ bài
  const totalCards = cc.total || s.total_deck_cards || 12300;
  setTxt('indexAnkiTotalCards', `${Number(totalCards).toLocaleString('vi-VN')} THẺ`);
  const matureCards = Number(cc.mature || 4128).toLocaleString('vi-VN');
  setTxt('indexAnkiTotalSub', `${matureCards} thẻ Mature (≥21d)`);

  // Badge trạng thái cập nhật trên trang chủ
  const syncBadge = document.getElementById('indexAnkiSyncBadge');
  if (syncBadge) {
    const isOverride = typeof localStorage !== 'undefined' ? localStorage.getItem('anki_stats_override') : null;
    const updateTime = data.updated_at ? (data.updated_at.split(' ')[1] || data.updated_at) : 'MỚI';
    if (isOverride) {
      syncBadge.innerText = `[BỘ NHỚ TRÌNH DUYỆT] ${updateTime}`;
      syncBadge.className = 'px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-mono-code font-bold uppercase';
    } else {
      syncBadge.innerText = `[ĐỒNG BỘ CLOUD] ${data.updated_at || 'MỚI NHẤT'}`;
      syncBadge.className = 'px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-mono-code font-semibold uppercase';
    }
  }
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

  // Tính toán tích lũy cho đường Area Curve
  let runningTotal = 0;
  const cumulative = days.map(d => {
    runningTotal += d.count;
    return runningTotal;
  });
  const maxCumul = Math.max(runningTotal, 100);

  const width = 800;
  const height = 210;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(8, (width - 60) / days.length - 5);

  // Tạo đường tích lũy (Cumulative Area Path)
  let areaPoints = `M 30,${paddingTop + chartHeight}`;
  let linePoints = '';
  days.forEach((d, i) => {
    const x = 30 + i * (barWidth + 5) + barWidth / 2;
    const y = paddingTop + chartHeight - (cumulative[i] / maxCumul) * chartHeight;
    areaPoints += ` L ${x},${y}`;
    linePoints += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  });
  const lastX = 30 + (days.length - 1) * (barWidth + 5) + barWidth / 2;
  areaPoints += ` L ${lastX},${paddingTop + chartHeight} Z`;

  // Vẽ các cột bar hiện đại với góc bo tròn rx="3" ry="3"
  let barsSvg = '';
  days.forEach((d, i) => {
    const x = 30 + i * (barWidth + 5);
    const bHeight = Math.max(3, (d.count / maxBarVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const isTomorrow = d.day === 1;
    const isToday = d.day === 0;
    const barFill = isTomorrow ? 'url(#gradAmberOrange)' : (isToday ? 'url(#gradRosePink)' : 'url(#gradIndigoViolet)');

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;Ngày +${d.day}&lt;/div&gt;&lt;div class=&quot;text-indigo-300 font-medium&quot;&gt;${d.count} thẻ đến hạn&lt;/div&gt;&lt;div class=&quot;text-emerald-400 text-[11px]&quot;&gt;Tích lũy: ${Number(cumulative[i]).toLocaleString('vi-VN')} thẻ&lt;/div&gt;`;

    barsSvg += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="3" ry="3" fill="${barFill}" class="transition-opacity duration-150 hover:opacity-80" />
        ${(i % 5 === 0 || i === days.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="600" fill="#64748B" text-anchor="middle">+${d.day}</text>
        ` : ''}
        ${isTomorrow ? `
          <text x="${x + barWidth / 2}" y="${y - 6}" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#D97706" text-anchor="middle">${d.count}</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-indigo-500"></span> CỘT: SỐ THẺ HÀNG NGÀY (TRỤC TRÁI)</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 rounded-full bg-emerald-500"></span> ĐƯỜNG: TẢI TRỌNG TÍCH LŨY (${Number(runningTotal).toLocaleString('vi-VN')} LƯỢT)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        ${getSvgDefs()}
        <!-- Đường lưới ngang nhẹ nhàng -->
        <line x1="20" y1="${paddingTop}" x2="${width - 20}" y2="${paddingTop}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4,4" />
        
        <!-- Vùng tích lũy Cumulative Area -->
        <path d="${areaPoints}" fill="url(#areaEmerald)" />
        <path d="${linePoints}" fill="none" stroke="#10B981" stroke-width="2.5" />

        <!-- Trục hoành -->
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
        
        <!-- Cột dữ liệu -->
        ${barsSvg}
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 3. LỊCH HOẠT ĐỘNG TOÀN NĂM (CALENDAR HEATMAP VỚI NHÃN THÁNG, THỨ & FLOATING TOOLTIP)
// ----------------------------------------------------------------------------
function renderCalendarHeatmap(calendar) {
  const container = document.getElementById('calendarHeatmapMount');
  if (!container) return;

  const datesMap = new Map();
  if (Array.isArray(calendar)) {
    calendar.forEach(c => datesMap.set(c.date, c.count));
  }

  // 52 tuần x 7 ngày = 364 ngày gần nhất
  const today = new Date();
  const weeks = [];
  let currentWeek = [];

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = datesMap.get(dateStr) || 0;
    const dayOfWeek = (d.getDay() + 6) % 7; // Chuyển sang 0 = T2, 6 = CN

    currentWeek.push({ date: dateStr, count, dayOfWeek, rawDate: d });
    if (dayOfWeek === 6 || i === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Khởi tạo SVG Heatmap với rx="2" ry="2"
  const cellSize = 11;
  const cellGap = 3.5;
  const leftPadding = 30;
  const topPadding = 18;
  const totalWeeks = weeks.length;
  const svgWidth = leftPadding + totalWeeks * (cellSize + cellGap) + 10;
  const svgHeight = topPadding + 7 * (cellSize + cellGap) + 10;

  // Nhãn tháng
  let monthLabelsSvg = '';
  let lastMonth = -1;
  weeks.forEach((w, wIdx) => {
    if (w.length > 0) {
      const m = w[0].rawDate.getMonth();
      if (m !== lastMonth && wIdx % 4 === 0) {
        lastMonth = m;
        const x = leftPadding + wIdx * (cellSize + cellGap);
        const mNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        monthLabelsSvg += `<text x="${x}" y="12" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#94A3B8">${mNames[m]}</text>`;
      }
    }
  });

  // Render lưới ô nhiệt SVG với rx="2" ry="2" và refined emerald palette
  let cellsSvg = '';
  weeks.forEach((w, wIdx) => {
    const x = leftPadding + wIdx * (cellSize + cellGap);
    w.forEach(d => {
      const y = topPadding + d.dayOfWeek * (cellSize + cellGap);
      let fillColor = '#F1F5F9'; // 0 lượt ôn: slate-100

      if (d.count > 0 && d.count <= 100) {
        fillColor = '#A7F3D0'; // Emerald-200
      } else if (d.count > 100 && d.count <= 300) {
        fillColor = '#34D399'; // Emerald-400
      } else if (d.count > 300 && d.count <= 600) {
        fillColor = '#059669'; // Emerald-600
      } else if (d.count > 600) {
        fillColor = '#047857'; // Emerald-700
      }

      const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;${d.date}&lt;/div&gt;&lt;div class=&quot;text-emerald-400 font-bold mt-0.5&quot;&gt;${Number(d.count).toLocaleString('vi-VN')} lượt ôn tập&lt;/div&gt;`;

      cellsSvg += `
        <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${fillColor}"
              class="transition-opacity duration-150 hover:opacity-75 cursor-pointer"
              onmousemove="showStatsTooltip(event, '${tipHtml}')"
              onmouseleave="hideStatsTooltip()"
              ontouchstart="showStatsTooltip(event, '${tipHtml}')"
              ontouchend="hideStatsTooltip()" />`;
    });
  });

  container.innerHTML = `
    <div class="space-y-3">
      <div class="overflow-x-auto pb-1">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto min-w-[620px] select-none" xmlns="http://www.w3.org/2000/svg">
          <!-- Nhãn thứ bên trái -->
          <text x="4" y="${topPadding + 0 * (cellSize + cellGap) + 9}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#94A3B8">T2</text>
          <text x="4" y="${topPadding + 2 * (cellSize + cellGap) + 9}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#94A3B8">T4</text>
          <text x="4" y="${topPadding + 4 * (cellSize + cellGap) + 9}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#94A3B8">T6</text>
          <text x="4" y="${topPadding + 6 * (cellSize + cellGap) + 9}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#94A3B8">CN</text>

          <!-- Nhãn tháng bên trên -->
          ${monthLabelsSvg}

          <!-- Các ô nhiệt Heatmap -->
          ${cellsSvg}
        </svg>
      </div>

      <!-- Chú thích dải màu Emerald chuẩn Modern Clean SaaS -->
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
        <span>365 NGÀY TRƯỚC</span>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400">0</span>
          <div class="w-3 h-3 rounded-[3px] bg-[#F1F5F9] border border-slate-200"></div>
          <div class="w-3 h-3 rounded-[3px] bg-[#A7F3D0]"></div>
          <div class="w-3 h-3 rounded-[3px] bg-[#34D399]"></div>
          <div class="w-3 h-3 rounded-[3px] bg-[#059669]"></div>
          <div class="w-3 h-3 rounded-[3px] bg-[#047857]"></div>
          <span class="text-slate-400">600+ LƯỢT</span>
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
  const height = 210;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 60) / list.length - 5);

  // Tạo đường MA7
  let ma7Points = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 5) + barWidth / 2;
    const y = paddingTop + chartHeight - (ma7[i] / maxDayTotal) * chartHeight;
    ma7Points += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  });

  let svgBars = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 5);
    const mCount = d.mature || 0;
    const yCount = d.young || 0;
    const rCount = d.relearn || 0;

    const mH = (mCount / maxDayTotal) * chartHeight;
    const yH = (yCount / maxDayTotal) * chartHeight;
    const rH = (rCount / maxDayTotal) * chartHeight;

    const mY = paddingTop + chartHeight - mH;
    const yY = mY - yH;
    const rY = yY - rH;

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;${d.date}&lt;/div&gt;&lt;div class=&quot;text-slate-200 mt-0.5&quot;&gt;Tổng: &lt;b&gt;${d.total}&lt;/b&gt; lượt&lt;/div&gt;&lt;div class=&quot;text-emerald-400&quot;&gt;Mature: ${mCount}&lt;/div&gt;&lt;div class=&quot;text-amber-400&quot;&gt;Young: ${yCount}&lt;/div&gt;&lt;div class=&quot;text-rose-400&quot;&gt;Relearn: ${rCount}&lt;/div&gt;&lt;div class=&quot;text-indigo-300 font-semibold mt-1 border-t border-slate-700 pt-1&quot;&gt;MA7: ${ma7[i]} lượt/ngày&lt;/div&gt;`;

    svgBars += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        ${mH > 0 ? `<rect x="${x}" y="${mY}" width="${barWidth}" height="${mH}" rx="2" ry="2" fill="url(#gradEmeraldTeal)" class="transition-opacity duration-150 hover:opacity-85" />` : ''}
        ${yH > 0 ? `<rect x="${x}" y="${yY}" width="${barWidth}" height="${yH}" rx="2" ry="2" fill="url(#gradAmberOrange)" class="transition-opacity duration-150 hover:opacity-85" />` : ''}
        ${rH > 0 ? `<rect x="${x}" y="${rY}" width="${barWidth}" height="${rH}" rx="2" ry="2" fill="url(#gradRosePink)" class="transition-opacity duration-150 hover:opacity-85" />` : ''}
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="600" fill="#64748B" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>CỘT XẾP CHỒNG: SỐ THẺ HÀNG NGÀY</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 rounded-full bg-indigo-600"></span> ĐƯỜNG TÍM: TRUNG BÌNH TRƯỢT 7 NGÀY (MA7)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        ${getSvgDefs()}
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
        ${svgBars}
        <!-- Đường trung bình trượt MA7 -->
        <path d="${ma7Points}" fill="none" stroke="#6366F1" stroke-width="2.5" />
      </svg>
    </div>`;
}

// ----------------------------------------------------------------------------
// 5. TỔNG KHO THẺ & PHÂN BỔ TRẠNG THÁI (BIỂU ĐỒ DONUT SVG HIỆN ĐẠI)
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

  // Vẽ biểu đồ Donut Chart hình tròn SVG Modern SaaS
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
        <div class="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 140 140" class="w-full h-full transform -rotate-90 select-none">
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#F1F5F9" stroke-width="18" />
            <!-- Mature (Xanh ngọc Emerald) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#10B981" stroke-width="18"
                    stroke-dasharray="${dashMature} ${circumference}" stroke-dashoffset="${offMature}" class="transition-all duration-300" />
            <!-- Young (Vàng hổ phách Amber) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#F59E0B" stroke-width="18"
                    stroke-dasharray="${dashYoung} ${circumference}" stroke-dashoffset="${offYoung}" class="transition-all duration-300" />
            <!-- Learning (Cam) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#F97316" stroke-width="18"
                    stroke-dasharray="${dashLearn} ${circumference}" stroke-dashoffset="${offLearn}" class="transition-all duration-300" />
            <!-- New (Indigo) -->
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="#6366F1" stroke-width="18"
                    stroke-dasharray="${dashNew} ${circumference}" stroke-dashoffset="${offNew}" class="transition-all duration-300" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">TỔNG THẺ</span>
            <span class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">${Number(total).toLocaleString('vi-VN')}</span>
            <span class="text-[10px] font-medium text-slate-400 mt-0.5">FSRS DECK</span>
          </div>
        </div>

        <div class="space-y-2 w-full text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span class="flex items-center gap-2 font-semibold text-slate-700"><span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> MỚI (NEW)</span>
            <span class="font-extrabold text-slate-900">${cc.new_pct}% (${Number(cc.new || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span class="flex items-center gap-2 font-semibold text-slate-700"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> THẺ GIÀ (MATURE &ge;21D)</span>
            <span class="font-extrabold text-slate-900">${cc.mature_pct}% (${Number(cc.mature || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span class="flex items-center gap-2 font-semibold text-slate-700"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> THẺ NON (YOUNG &lt;21D)</span>
            <span class="font-extrabold text-slate-900">${cc.young_pct}% (${Number(cc.young || 0).toLocaleString('vi-VN')})</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span class="flex items-center gap-2 font-semibold text-slate-700"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> ĐANG HỌC (LEARNING)</span>
            <span class="font-extrabold text-slate-900">${cc.learning_pct}% (${Number(cc.learning || 0).toLocaleString('vi-VN')})</span>
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

  renderGenericBarHistogram(container, intervals.bins, 'url(#gradEmeraldTeal)', 'KHOẢNG CÁCH (NGÀY/THÁNG)');
}

// ----------------------------------------------------------------------------
// 7. ĐỘ ỔN ĐỊNH TRÍ NHỚ FSRS (CARD STABILITY VỚI ĐƯỜNG MỤC TIÊU)
// ----------------------------------------------------------------------------
function renderStabilityChart(stability) {
  const container = document.getElementById('stabilityChartMount');
  const medianEl = document.getElementById('stabilityMedian');
  if (medianEl && stability) medianEl.innerText = `${stability.median_months || 1.97} THÁNG`;
  if (!container || !stability || !stability.bins) return;

  renderGenericBarHistogram(container, stability.bins, 'url(#gradIndigoViolet)', 'ĐỘ ỔN ĐỊNH S (THỜI GIAN ĐỂ NHỚ RƠI VỀ 90%)');
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

  // Bảng màu 5 cấp độ khó Modern SaaS
  const colors = ['#10B981', '#14B8A6', '#F59E0B', '#F97316', '#F43F5E'];

  const width = 600;
  const height = 170;
  const paddingBottom = 30;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(16, (width - 60) / entries.length - 12);

  let bars = '';
  entries.forEach(([label, count], i) => {
    const x = 30 + i * (barWidth + 12);
    const bHeight = Math.max(4, (count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const color = colors[i] || '#10B981';

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;Mức độ: ${label}&lt;/div&gt;&lt;div class=&quot;text-slate-200 mt-0.5&quot;&gt;&lt;b&gt;${Number(count).toLocaleString('vi-VN')}&lt;/b&gt; thẻ&lt;/div&gt;`;

    bars += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="4" ry="4" fill="${color}" class="transition-opacity duration-150 hover:opacity-85" />
        <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="600" fill="#64748B" text-anchor="middle">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 6}" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#1E293B" text-anchor="middle">${Number(count).toLocaleString('vi-VN')}</text>
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span class="text-emerald-600">0-20% (RẤT DỄ)</span>
        <span class="text-amber-600">41-60% (VỪA)</span>
        <span class="text-rose-600">81-100% (RẤT KHÓ)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
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

  renderGenericBarHistogram(container, ret.bins, 'url(#gradEmeraldTeal)', 'XÁC SUẤT GỢI NHỚ THẺ R (MỤC TIÊU 90% | THỰC TẾ 95%)');
}

// ----------------------------------------------------------------------------
// HÀM VẼ HISTOGRAM HIỆN ĐẠI DÙNG CHUNG
// ----------------------------------------------------------------------------
function renderGenericBarHistogram(container, binsObj, barColor, subtitle) {
  const entries = Object.entries(binsObj);
  const maxVal = Math.max(...entries.map(e => e[1]), 10);

  const width = 600;
  const height = 170;
  const paddingBottom = 30;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(12, (width - 60) / entries.length - 8);

  let bars = '';
  entries.forEach(([label, count], i) => {
    const x = 30 + i * (barWidth + 8);
    const bHeight = Math.max(4, (count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;${label}&lt;/div&gt;&lt;div class=&quot;text-slate-200 mt-0.5&quot;&gt;&lt;b&gt;${Number(count).toLocaleString('vi-VN')}&lt;/b&gt; thẻ&lt;/div&gt;`;

    bars += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="4" ry="4" fill="${barColor}" class="transition-opacity duration-150 hover:opacity-85" />
        <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#64748B" text-anchor="middle">${label}</text>
        <text x="${x + barWidth / 2}" y="${y - 6}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="700" fill="#1E293B" text-anchor="middle">${Number(count).toLocaleString('vi-VN')}</text>
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      ${subtitle ? `<div class="text-xs font-semibold text-slate-500 mb-2">${subtitle}</div>` : ''}
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        ${getSvgDefs()}
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
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
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
        <td class="p-3 font-semibold text-xs text-slate-800 uppercase">${r.label}</td>
        <td class="p-3 text-right text-xs">
          <div class="flex items-center justify-end gap-2">
            <span class="font-bold text-amber-600">${d.young}</span>
            ${numY > 0 ? `<div class="w-12 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style="width:${numY}%"></div></div>` : ''}
          </div>
        </td>
        <td class="p-3 text-right text-xs">
          <div class="flex items-center justify-end gap-2">
            <span class="font-bold text-emerald-600">${d.mature}</span>
            ${numM > 0 ? `<div class="w-12 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style="width:${numM}%"></div></div>` : ''}
          </div>
        </td>
        <td class="p-3 font-extrabold text-xs text-slate-900 text-right">
          <span class="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">${d.total}</span>
        </td>
        <td class="p-3 text-xs text-slate-500 font-medium text-right">${Number(d.count || 0).toLocaleString('vi-VN')} LƯỢT</td>
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
  const height = 190;
  const paddingBottom = 30;
  const paddingTop = 20;
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
      dotNodes += `<circle cx="${x}" cy="${y}" r="3" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5"><title>${h.hour}h: Nhớ ${h.pass_rate}%</title></circle>`;
    }
  });

  let bars = '';
  hours.forEach((h, i) => {
    const x = 30 + i * (barWidth + 4);
    const bHeight = Math.max(3, (h.count / maxCount) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;
    const isPeak = h.hour >= 21 && h.hour <= 23;
    const barFill = isPeak ? 'url(#gradEmeraldTeal)' : 'url(#gradIndigoViolet)';

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;${h.hour}h:00 - ${h.hour}h:59&lt;/div&gt;&lt;div class=&quot;text-slate-200 mt-0.5&quot;&gt;&lt;b&gt;${h.count}&lt;/b&gt; lượt ôn tập&lt;/div&gt;&lt;div class=&quot;text-amber-400 font-semibold&quot;&gt;Độ nhớ: ${h.pass_rate}%&lt;/div&gt;`;

    bars += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="3" ry="3" fill="${barFill}" class="transition-opacity duration-150 hover:opacity-85" />
        ${(i % 3 === 0 || i === 23) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#64748B" text-anchor="middle">${h.hour}h</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-emerald-500"></span> CỘT: KHỐI LƯỢNG ÔN TẬP (GIỜ CAO ĐIỂM 21H-23H)</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 rounded-full bg-amber-500"></span> ĐƯỜNG VÀNG: TỈ LỆ NHỚ PASS RATE (%)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        ${getSvgDefs()}
        <line x1="20" y1="${paddingTop + chartHeight / 2}" x2="${width - 20}" y2="${paddingTop + chartHeight / 2}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
        ${bars}
        <!-- Đường Pass rate % -->
        <path d="${linePoints}" fill="none" stroke="#F59E0B" stroke-width="2.5" />
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
      <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.label}</span>
          <span class="text-xs text-slate-500 font-semibold">${Number(tot).toLocaleString('vi-VN')} LƯỢT</span>
        </div>
        <div class="h-3 w-full flex rounded-full overflow-hidden bg-slate-200/80 shadow-inner">
          <div style="width: ${getPct(d.again)}%" class="bg-rose-500 transition-all duration-300" title="Again: ${d.again} (${getPct(d.again)}%)"></div>
          <div style="width: ${getPct(d.hard)}%" class="bg-orange-500 transition-all duration-300" title="Hard: ${d.hard} (${getPct(d.hard)}%)"></div>
          <div style="width: ${getPct(d.good)}%" class="bg-emerald-500 transition-all duration-300" title="Good: ${d.good} (${getPct(d.good)}%)"></div>
          <div style="width: ${getPct(d.easy)}%" class="bg-indigo-500 transition-all duration-300" title="Easy: ${d.easy} (${getPct(d.easy)}%)"></div>
        </div>
        <div class="grid grid-cols-4 gap-2 text-xs font-medium text-slate-600 pt-0.5">
          <div>AGAIN: <b class="text-rose-600 font-bold">${Number(d.again || 0).toLocaleString('vi-VN')}</b></div>
          <div>HARD: <b class="text-orange-600 font-bold">${Number(d.hard || 0).toLocaleString('vi-VN')}</b></div>
          <div>GOOD: <b class="text-emerald-600 font-bold">${Number(d.good || 0).toLocaleString('vi-VN')}</b></div>
          <div>EASY: <b class="text-indigo-600 font-bold">${Number(d.easy || 0).toLocaleString('vi-VN')}</b></div>
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
  const height = 180;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;
  const barWidth = Math.max(6, (width - 60) / list.length - 4);

  // Đường mục tiêu 300 thẻ/ngày
  const targetY = paddingTop + chartHeight - (300 / maxVal) * chartHeight;

  let bars = '';
  list.forEach((d, i) => {
    const x = 30 + i * (barWidth + 4);
    const bHeight = Math.max(3, (d.count / maxVal) * chartHeight);
    const y = paddingTop + chartHeight - bHeight;

    const tipHtml = `&lt;div class=&quot;font-semibold text-white&quot;&gt;${d.date}&lt;/div&gt;&lt;div class=&quot;text-indigo-300 font-bold mt-0.5&quot;&gt;+${d.count} thẻ mới&lt;/div&gt;`;

    bars += `
      <g class="cursor-pointer group"
         onmousemove="showStatsTooltip(event, '${tipHtml}')" 
         onmouseleave="hideStatsTooltip()"
         ontouchstart="showStatsTooltip(event, '${tipHtml}')"
         ontouchend="hideStatsTooltip()">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="3" ry="3" fill="url(#gradIndigoViolet)" class="transition-opacity duration-150 hover:opacity-85" />
        ${(i % 5 === 0 || i === list.length - 1) ? `
          <text x="${x + barWidth / 2}" y="${height - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="600" fill="#64748B" text-anchor="middle">${d.day_offset}d</text>
        ` : ''}
      </g>`;
  });

  container.innerHTML = `
    <div class="relative">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-indigo-500"></span> CỘT: THẺ THÊM MỚI HÀNG NGÀY</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 rounded-full bg-rose-500 border-dashed"></span> ĐƯỜNG ĐỎ: MỤC TIÊU 300 THẺ / NGÀY</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
        ${getSvgDefs()}
        <!-- Đường mục tiêu 300 -->
        <line x1="20" y1="${targetY}" x2="${width - 20}" y2="${targetY}" stroke="#F43F5E" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="20" y1="${paddingTop + chartHeight}" x2="${width - 20}" y2="${paddingTop + chartHeight}" stroke="#E2E8F0" stroke-width="1.5" />
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
    let statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">CHƯA HỌC</span>';
    if (s.progress_pct >= 90) {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold">ĐÃ THUỘC (REVIEW)</span>';
    } else if (s.learning > 0 || s.review > 0) {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 font-bold">ĐANG HỌC</span>';
    }

    return `
      <tr class="border-b border-slate-100 hover:bg-indigo-50/20 transition-colors">
        <td class="p-3 font-semibold text-xs text-slate-500">#${s.stt}</td>
        <td class="p-3 font-bold text-xs text-slate-900">
          <div class="line-clamp-1" title="${s.name}">${s.name}</div>
        </td>
        <td class="p-3 text-xs text-right font-medium">${s.total}</td>
        <td class="p-3 text-xs text-indigo-600 font-semibold text-right">${s.new}</td>
        <td class="p-3 text-xs text-orange-600 font-semibold text-right">${s.learning}</td>
        <td class="p-3 text-xs text-emerald-700 font-bold text-right">${s.review}</td>
        <td class="p-3 text-xs text-right">
          <div class="flex items-center justify-end gap-2.5">
            <span class="font-bold text-slate-900">${s.progress_pct}%</span>
            <div class="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style="width: ${s.progress_pct}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 text-xs text-center">${statusBadge}</td>
      </tr>`;
  }).join('');

  renderSubdecksPagination(totalPages);
}

function renderSubdecksPagination(totalPages) {
  const container = document.getElementById('subdecksPagination');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-between w-full text-xs font-semibold">
      <button onclick="changeSubdeckPage(-1)" ${subdecksCurrentPage <= 1 ? 'disabled class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"' : 'class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all"'}>
        TRANG TRƯỚC
      </button>
      <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">TRANG ${subdecksCurrentPage} / ${totalPages}</span>
      <button onclick="changeSubdeckPage(1)" ${subdecksCurrentPage >= totalPages ? 'disabled class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"' : 'class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all"'}>
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
      btn.className = 'px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all';
    } else {
      btn.className = 'px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-semibold transition-all shadow-sm';
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
  const geminiKey = typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : (localStorage.getItem('gemini_api_key') || '');
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
      <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100 text-center space-y-2 animate-pulse shadow-sm">
        <div class="text-xs font-bold text-indigo-700 uppercase tracking-wider">TIẾN TRÌNH AI</div>
        <div class="font-bold text-base text-slate-900">
          AI Gemini đang đọc dữ liệu 14 biểu đồ và phân tích thuật toán FSRS...
        </div>
        <p class="text-xs text-slate-500 font-medium">
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
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
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
    btn.innerText = 'DÙNG AI GEMINI NHẬN XÉT KẾT QUẢ';
  }

  if (!responseText) {
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1.5">
          <b class="font-bold">LỖI KẾT NỐI GEMINI API:</b> Không thể tạo nhận xét. Vui lòng kiểm tra lại Gemini API Key trong mục 'CẤU HÌNH API' và thử lại.
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

  // Chuyển markdown cơ bản sang HTML Modern Clean SaaS
  const formattedHtml = formatMarkdownToSwissHTML(payload.text);

  resultContainer.innerHTML = `
    <div class="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase">
            BÁO CÁO CỐ VẤN CHIẾN LƯỢC FSRS
          </span>
          <span class="text-xs font-medium text-slate-500">
            MODEL: ${payload.model} • ${payload.timestamp}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="copyGeminiAnalysisText()" class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all">
            SAO CHÉP BÁO CÁO
          </button>
          <button onclick="analyzeAnkiStatsWithGemini()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all">
            PHÂN TÍCH LẠI
          </button>
        </div>
      </div>

      <div class="prose max-w-none text-xs sm:text-sm font-sans space-y-3 leading-relaxed text-slate-700">
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
        return `<h4 class="text-base font-bold text-slate-900 pt-3 pb-1.5 border-b border-slate-100 mt-2">${title}</h4>`;
      }

      if (b.startsWith('- ') || b.startsWith('* ')) {
        const items = b.split('\n').map(line => {
          const itemText = line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-slate-900">$1</b>');
          return `<li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span><span>${itemText}</span></li>`;
        }).join('');
        return `<ul class="space-y-1.5 pl-1 text-xs sm:text-sm text-slate-700 font-sans">${items}</ul>`;
      }

      // Đoạn văn thường
      const parsedText = b.replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-slate-900">$1</b>');
      return `<p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">${parsedText}</p>`;
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
    alert('Vui lòng dán văn bản sao chép từ màn hình Statistics của Anki vào khung!');
    return;
  }

  const rawText = textarea.value.trim();
  const parsed = parseAnkiStatsText(rawText);

  if (!parsed || !parsed.today || parsed.today.cards_studied === undefined) {
    alert('Không thể nhận diện cấu trúc thống kê Anki. Vui lòng đảm bảo bạn đã bấm "Copy" trên màn hình Statistics của Anki!');
    return;
  }

  // Kết hợp với dữ liệu hiện có
  const merged = currentAnkiStats ? JSON.parse(JSON.stringify(currentAnkiStats)) : {};
  merged.deck_name = "Thử thách mỗi ngày 100 từ vựng";
  merged.updated_at = new Date().toLocaleString('vi-VN');
  merged.today = Object.assign(merged.today || {}, parsed.today);
  if (parsed.summary) merged.summary = Object.assign(merged.summary || {}, parsed.summary);
  if (parsed.card_counts) merged.card_counts = Object.assign(merged.card_counts || {}, parsed.card_counts);

  localStorage.setItem('anki_stats_override', JSON.stringify(merged));
  currentAnkiStats = merged;
  renderAllStatsCharts(merged);

  closeQuickPasteModal();
  alert('Đã cập nhật số liệu thống kê mới từ điện thoại thành công!');
}

function clearManualStatsOverride() {
  localStorage.removeItem('anki_stats_override');
  closeQuickPasteModal();
  loadAnkiStatsData(true);
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

  const streakMatch = text.match(/(?:current\s+)?streak[:\s]+(\d+)/i) || 
                      text.match(/chuỗi\s+(?:học)?[:\s]+(\d+)/i) ||
                      text.match(/(\d+)\s+days?\s+streak/i);
  if (streakMatch) {
    result.summary.streak_days = parseInt(streakMatch[1], 10);
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

  const tokenStatus = document.getElementById('syncModalTokenStatus');
  if (tokenStatus) {
    tokenStatus.innerText = 'ĐÃ TỰ ĐỘNG CẤU HÌNH SẴN';
    tokenStatus.className = 'font-bold text-emerald-700';
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
  await executeCloudSyncProcess();
}

async function triggerAnkiWebSync() {
  await executeCloudSyncProcess();
}

async function executeCloudSyncProcess(tokenOverride = '') {
  const owner = (localStorage.getItem('gh_owner') && localStorage.getItem('gh_owner') !== 'letuanvinh') ? localStorage.getItem('gh_owner') : 'lev24197';
  const repo = localStorage.getItem('gh_repo') || 'vinhdeptrai';
  const branch = localStorage.getItem('gh_branch') || 'main';
  const proxyUrl = typeof getSyncProxyUrl === 'function' ? getSyncProxyUrl() : (localStorage.getItem('sync_proxy_url') || '');
  const fallbackTok = (typeof DEFAULT_GH_TOKEN !== 'undefined' ? DEFAULT_GH_TOKEN : (typeof window !== 'undefined' && window.DEFAULT_GH_TOKEN ? window.DEFAULT_GH_TOKEN : ''));
  const token = tokenOverride || (typeof getGitHubToken === 'function' ? getGitHubToken() : '') || (localStorage.getItem('gh_token') || '') || fallbackTok;
  const btn = document.getElementById('btnSyncAnkiWeb');
  const modalBtn = document.getElementById('btnModalExecuteSync');
  const runStatusBox = document.getElementById('syncModalRunStatus');
  const badge = document.getElementById('ankiStatsSyncBadge');

  const setBtnText = (txt, disabled = true) => {
    if (btn) { btn.disabled = disabled; btn.innerText = txt; }
    if (modalBtn) { modalBtn.disabled = disabled; modalBtn.innerText = txt; }
    if (badge && disabled) {
      badge.innerText = `[ĐANG ĐỒNG BỘ] ${txt}`;
      badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse';
    }
  };

  const showStatusMsg = (msg, isErr = false) => {
    if (runStatusBox) {
      runStatusBox.classList.remove('hidden');
      runStatusBox.innerHTML = `<span class="${isErr ? 'text-rose-600 font-bold' : 'text-slate-800'}">${msg}</span>`;
    }
  };

  setBtnText('ĐANG GỬI LỆNH LÊN CLOUD...');
  showStatusMsg('Đang kích hoạt máy ảo GitHub Actions...');

  const startTime = Date.now();

  try {
    let dispatchSuccess = false;
    if (proxyUrl && proxyUrl.startsWith('http')) {
      showStatusMsg('Đang gửi lệnh qua Serverless Proxy bảo mật...');
      const pRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: 'sync_ankiweb.yml', ref: branch })
      });
      if (pRes.ok) {
        dispatchSuccess = true;
      } else {
        const pErr = await pRes.text();
        throw new Error(`Proxy báo lỗi HTTP ${pRes.status}: ${pErr}`);
      }
    } else {
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
        dispatchSuccess = true;
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
          const defTok = fallbackTok;
          if (token !== defTok && defTok) {
            try { localStorage.setItem('gh_token', defTok); } catch (e) {}
            return executeCloudSyncProcess(defTok);
          }
          humanMsg = "Lỗi HTTP 401: GitHub Token không hợp lệ hoặc đã hết hạn.";
        } else if (errDetail) {
          humanMsg += `: ${errDetail}`;
        }
        throw new Error(humanMsg);
      }
    }

    if (dispatchSuccess) {
      setBtnText('MÁY ẢO ĐÃ NHẬN LỆNH...');
      showStatusMsg('Lệnh đồng bộ đã gửi thành công! Đang chờ máy ảo GitHub khởi động và đăng nhập AnkiWeb...');
      if (typeof showToastAlert === 'function') {
        showToastAlert('Đã gửi lệnh đồng bộ! Máy ảo đang kết nối AnkiWeb...', 'success');
      }

      startPollingSyncRun(owner, repo, token, startTime);
    }
  } catch (err) {
    setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
    showStatusMsg(`Lỗi: ${err.message}`, true);
    alert(err.message);
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
      runStatusBox.innerHTML = `<span class="${isErr ? 'text-rose-600 font-bold' : 'text-slate-800'}">${msg}</span>`;
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
      const runsHeaders = { 'Accept': 'application/vnd.github+json' };
      if (token) runsHeaders['Authorization'] = `Bearer ${token}`;
      const res = await fetch(runsUrl, { headers: runsHeaders });

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
            // Tải dữ liệu mới nhất trực tiếp từ GitHub API ngay khi máy ảo hoàn thành
            await loadAnkiStatsData(true);
            setBtnText('ĐỒNG BỘ ANKIWEB CLOUD', false);
            setTimeout(() => {
              closeSyncAnkiModal();
            }, 1200);
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

// ============================================================================
// KHU VỰC 16: TRÌNH MÔ PHỎNG FSRS TARGET RETENTION & TẢI ÔN TẬP
// ============================================================================
function runFsrsSimulationWeb() {
  const sliderR = document.getElementById('webSliderRetention');
  const sliderN = document.getElementById('webSliderNewCards');
  if (!sliderR || !sliderN) return;

  const r = parseInt(sliderR.value, 10);
  const n = parseInt(sliderN.value, 10);

  const labelR = document.getElementById('webLabelRetention');
  const labelN = document.getElementById('webLabelNewCards');
  if (labelR) labelR.innerText = r + '%';
  if (labelN) labelN.innerText = n + ' từ/ngày';

  // FSRS Workload multiplier relative to 90% benchmark
  const benchmarkFactor = Math.log(0.90);
  const currentFactor = Math.log(r / 100);
  const fsrsMultiplier = Math.pow(benchmarkFactor / currentFactor, 1.15);

  const baseDailyReviews = Math.round(62 * fsrsMultiplier);
  const newCardReviews = Math.round(n * 2.1);
  const totalDaily = baseDailyReviews + newCardReviews;

  const secPerCard = (currentAnkiStats && currentAnkiStats.today && currentAnkiStats.today.seconds_per_card) || 3.95;
  const totalSeconds = totalDaily * secPerCard;
  const totalMinutes = (totalSeconds / 60).toFixed(1);

  const totalNewInYear = n * 365;
  const currentWords = 2105;
  const rememberedWords = Math.round((currentWords + totalNewInYear) * (r / 100));

  let efficiency = 10 - Math.abs(r - 90) * 0.45;
  if (n > 80) efficiency -= 0.5;
  efficiency = Math.max(6.5, Math.min(9.9, efficiency)).toFixed(1);

  const elDaily = document.getElementById('webSimDailyReviews');
  const elTime = document.getElementById('webSimDailyTime');
  const elYear = document.getElementById('webSimYearKnowledge');
  const elRealR = document.getElementById('webSimRealRetention');
  const elScore = document.getElementById('webSimEfficiencyScore');

  if (elDaily) elDaily.innerText = totalDaily + ' thẻ';
  if (elTime) elTime.innerText = totalMinutes + ' phút';
  if (elYear) elYear.innerText = rememberedWords.toLocaleString() + ' từ';
  if (elRealR) elRealR.innerText = r + '%';
  if (elScore) elScore.innerText = efficiency + '/10';
}

function resetFsrsSimulatorWeb() {
  const sliderR = document.getElementById('webSliderRetention');
  const sliderN = document.getElementById('webSliderNewCards');
  if (sliderR) sliderR.value = 90;
  if (sliderN) sliderN.value = 30;
  runFsrsSimulationWeb();
}

// Gán các hàm cốt lõi vào window để các module khác và test runner có thể truy cập
window.initStatsPage = initStatsPage;
window.loadAnkiStatsData = loadAnkiStatsData;
window.renderAllStatsCharts = renderAllStatsCharts;
window.parseAnkiStatsText = parseAnkiStatsText;
window.filterSubdecks = filterSubdecks;
window.changeSubdeckPage = changeSubdeckPage;
window.setSubdeckCategoryFilter = setSubdeckCategoryFilter;
window.openQuickPasteModal = openQuickPasteModal;
window.closeQuickPasteModal = closeQuickPasteModal;
window.handlePasteAnkiStats = handlePasteAnkiStats;
window.clearManualStatsOverride = clearManualStatsOverride;
window.openSyncAnkiModal = openSyncAnkiModal;
window.closeSyncAnkiModal = closeSyncAnkiModal;
window.executeCloudSyncFromModal = executeCloudSyncFromModal;
window.triggerAnkiWebSync = triggerAnkiWebSync;
window.analyzeAnkiStatsWithGemini = analyzeAnkiStatsWithGemini;
window.copyGeminiAnalysisText = copyGeminiAnalysisText;
window.showStatsTooltip = showStatsTooltip;
window.hideStatsTooltip = hideStatsTooltip;
window.runFsrsSimulationWeb = runFsrsSimulationWeb;
window.resetFsrsSimulatorWeb = resetFsrsSimulatorWeb;
window.renderIndexDashboardAnkiStats = renderIndexDashboardAnkiStats;

