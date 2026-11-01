// ==================== HỆ THỐNG TÀI KHOẢN & GAMIFICATION ENGINE (AUTH & PROFILES) ====================
// Quản lý: Đăng nhập/Đăng ký, Hồ sơ người học, Cấp độ & XP, Vàng 🪙, Chuỗi ngày Streak 🔥, 
// Bộ sưu tập Huy hiệu 🎖️, Cửa hàng vật phẩm 🛍️, và Sao lưu / Đồng bộ Đám mây.

const AUTH_STORAGE_KEY = 'anki_accounts_v1';
const CURRENT_USER_KEY = 'anki_active_user_id';

let currentAccount = null;
let allAccounts = [];

// Danh sách Avatar có sẵn
const AVATAR_LIST = [
  '🦁', '🐯', '⚡', '🧙‍♂️', '👑', '🚀', '🦊', '🥋', '💎', '🐉',
  '🦅', '🐺', '🔥', '🎯', '🪐', '🦄', '🤖', '👾', '🌟', '🏆'
];

// Danh sách Huy hiệu Thành tựu (Badges)
const BADGES_CONFIG = {
  first_login: { id: 'first_login', name: 'Bước Đầu Tiên', icon: '🎉', desc: 'Khởi tạo hồ sơ người học Anki thành công.', rewardXp: 50, rewardCoins: 50 },
  first_quiz: { id: 'first_quiz', name: 'Phát Súng Đầu Tiên', icon: '🎯', desc: 'Hoàn thành bài thi trắc nghiệm đầu tiên.', rewardXp: 50, rewardCoins: 30 },
  streak_3: { id: 'streak_3', name: 'Ý Chí Kiên Định', icon: '🔥', desc: 'Đạt chuỗi học liên tục 3 ngày.', rewardXp: 100, rewardCoins: 50 },
  streak_7: { id: 'streak_7', name: 'Thói Quen Vàng', icon: '⚡', desc: 'Duy trì chuỗi học liên tục 7 ngày.', rewardXp: 200, rewardCoins: 100 },
  combo_5: { id: 'combo_5', name: 'Cuồng Phong', icon: '🌪️', desc: 'Đạt chuỗi 5 câu trả lời đúng liên tiếp trong một bài thi.', rewardXp: 60, rewardCoins: 30 },
  combo_10: { id: 'combo_10', name: 'Bất Khả Xâm Phạm', icon: '🚀', desc: 'Đạt chuỗi 10 câu đúng liên tiếp tuyệt đối.', rewardXp: 150, rewardCoins: 80 },
  perfect_quiz: { id: 'perfect_quiz', name: 'Hoàn Hảo Tuyệt Đối', icon: '💯', desc: 'Đạt 100% độ chính xác trong một bài trắc nghiệm.', rewardXp: 120, rewardCoins: 60 },
  word_50: { id: 'word_50', name: 'Thợ Săn 50 Từ', icon: '📚', desc: 'Trả lời đúng tổng cộng 50 câu hỏi từ vựng.', rewardXp: 150, rewardCoins: 80 },
  word_200: { id: 'word_200', name: 'Bách Khoa Toàn Thư', icon: '🏛️', desc: 'Trả lời đúng tổng cộng 200 câu hỏi từ vựng.', rewardXp: 300, rewardCoins: 150 },
  coin_300: { id: 'coin_300', name: 'Đại Gia Vàng', icon: '🪙', desc: 'Tích lũy được trên 300 Vàng trong ví.', rewardXp: 80, rewardCoins: 0 },
  level_5: { id: 'level_5', name: 'Học Giả Bậc Thầy', icon: '👑', desc: 'Chạm mốc Cấp độ 5.', rewardXp: 250, rewardCoins: 150 },
  level_10: { id: 'level_10', name: 'Huyền Thoại Anki', icon: '🌌', desc: 'Đạt tới Cấp độ 10 vinh quang.', rewardXp: 500, rewardCoins: 300 }
};

// Cửa hàng vật phẩm (Shop items)
const SHOP_ITEMS = {
  streak_freeze: { id: 'streak_freeze', name: 'Bình Đóng Băng Chuỗi', icon: '🧊', cost: 100, desc: 'Bảo vệ chuỗi Streak không bị reset nếu lỡ quên học 1 ngày.' },
  double_xp: { id: 'double_xp', name: 'Bình Thuốc x2 EXP', icon: '🧪', cost: 150, desc: 'Nhân đôi toàn bộ kinh nghiệm nhận được trong 30 phút tới.' },
  hint_scroll: { id: 'hint_scroll', name: 'Cuộn Giấy Gợi Ý', icon: '📜', cost: 60, desc: 'Tự động loại bỏ 2 đáp án sai trong câu hỏi trắc nghiệm.' }
};

// Tính toán XP cần cho cấp độ kế tiếp (Công thức RPG lũy tiến mượt mà)
function getXpForLevel(level) {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.35));
}

// Danh hiệu dựa theo cấp độ
function getTitleForLevel(level) {
  if (level >= 10) return '👑 Huyền Thoại Anki';
  if (level >= 8) return '⚡ Đại Kiện Tướng Trí Nhớ';
  if (level >= 6) return '🎓 Học Giả Bậc Thầy';
  if (level >= 4) return '🏹 Thợ Săn Từ Vựng';
  if (level >= 2) return '⚔️ Chiến Binh Anki';
  return '🐣 Tân Binh Khởi Động';
}

// 1. KHỞI TẠO HỆ THỐNG AUTH
function initAuthSystem() {
  loadAllAccounts();
  const activeId = localStorage.getItem(CURRENT_USER_KEY);
  if (activeId) {
    currentAccount = allAccounts.find(a => a.id === activeId) || null;
  }

  // Nếu chưa có tài khoản nào trên máy, tạo mặc định tài khoản "Vinh Đẹp Trai"
  if (!currentAccount) {
    if (allAccounts.length > 0) {
      currentAccount = allAccounts[0];
      localStorage.setItem(CURRENT_USER_KEY, currentAccount.id);
    } else {
      currentAccount = createNewAccountInternal('Vinh Đẹp Trai', '🦁');
    }
  }

  checkAndUpdateDailyStreak();
  updateHeaderUserWidget();
}

function loadAllAccounts() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    allAccounts = raw ? JSON.parse(raw) : [];
  } catch (e) {
    allAccounts = [];
  }
}

function saveAllAccounts() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(allAccounts));
  if (currentAccount) {
    localStorage.setItem(CURRENT_USER_KEY, currentAccount.id);
  }
}

function saveCurrentAccount() {
  if (!currentAccount) return;
  const idx = allAccounts.findIndex(a => a.id === currentAccount.id);
  if (idx !== -1) {
    allAccounts[idx] = currentAccount;
  } else {
    allAccounts.push(currentAccount);
  }
  saveAllAccounts();
  updateHeaderUserWidget();
}

// Tạo tài khoản mới nội bộ
function createNewAccountInternal(username, avatar = '🦁', pin = '') {
  const newAcc = {
    id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    username: username.trim() || 'Người Dùng Anki',
    avatar: avatar || '🦁',
    pin: pin ? String(pin).trim() : '',
    level: 1,
    xp: 0,
    coins: 100, // Tặng khởi điểm 100 Vàng
    streak: 1,
    last_active_date: getTodayStr(),
    double_xp_until: 0,
    stats: {
      quizzes_played: 0,
      total_questions: 0,
      total_correct: 0,
      max_streak: 0,
      words_mastered: 0
    },
    inventory: {
      streak_freeze: 1, // Tặng sẵn 1 bình đóng băng
      double_xp: 0,
      hint_scroll: 2 // Tặng 2 cuộn gợi ý
    },
    mistake_bank: [],
    badges: ['first_login'],
    history: [],
    created_at: new Date().toISOString()
  };

  allAccounts.push(newAcc);
  currentAccount = newAcc;
  saveAllAccounts();
  return newAcc;
}

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 2. LOGIC GAMIFICATION: CỘNG XP, CỘNG VÀNG, THĂNG CẤP & STREAK
function addXP(amount, reason = '') {
  if (!currentAccount) return;

  let multiplier = 1;
  const now = Date.now();
  if (currentAccount.double_xp_until && currentAccount.double_xp_until > now) {
    multiplier = 2;
  }

  const finalXp = Math.round(amount * multiplier);
  currentAccount.xp += finalXp;

  // Kiểm tra lên cấp (Level Up)
  let needed = getXpForLevel(currentAccount.level);
  let leveledUp = false;
  while (currentAccount.xp >= needed) {
    currentAccount.xp -= needed;
    currentAccount.level++;
    leveledUp = true;
    currentAccount.coins += 50; // Thưởng 50 Vàng mỗi lần lên cấp
    needed = getXpForLevel(currentAccount.level);
  }

  if (leveledUp) {
    triggerLevelUpModal(currentAccount.level);
    checkBadges();
  }

  saveCurrentAccount();
  showFloatingExpNotify(finalXp, multiplier > 1);
  return finalXp;
}

function addCoins(amount, reason = '') {
  if (!currentAccount) return;
  currentAccount.coins += Math.round(amount);
  checkBadges();
  saveCurrentAccount();
}

function checkAndUpdateDailyStreak() {
  if (!currentAccount) return;
  const today = getTodayStr();
  const lastDate = currentAccount.last_active_date;

  if (!lastDate) {
    currentAccount.last_active_date = today;
    currentAccount.streak = 1;
    saveCurrentAccount();
    return;
  }

  if (lastDate === today) {
    // Đã học hôm nay
    return;
  }

  const d1 = new Date(lastDate);
  const d2 = new Date(today);
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Học ngày kế tiếp liên tục -> Tăng streak
    currentAccount.streak++;
    currentAccount.coins += 10; // Thưởng 10 vàng duy trì streak
    currentAccount.last_active_date = today;
    checkBadges();
    saveCurrentAccount();
  } else if (diffDays > 1) {
    // Bị gián đoạn
    if (currentAccount.inventory.streak_freeze > 0) {
      currentAccount.inventory.streak_freeze--;
      currentAccount.last_active_date = today;
      showToastAlert('🧊 Bình Đóng Băng đã bảo vệ chuỗi Streak 🔥 ' + currentAccount.streak + ' ngày của bạn!');
      saveCurrentAccount();
    } else {
      currentAccount.streak = 1;
      currentAccount.last_active_date = today;
      saveCurrentAccount();
    }
  }
}

// Kiểm tra mở khóa huy hiệu (Badges)
function checkBadges() {
  if (!currentAccount) return;
  const unlocked = new Set(currentAccount.badges || []);
  const stats = currentAccount.stats || {};
  const newlyUnlocked = [];

  const testBadge = (id, condition) => {
    if (!unlocked.has(id) && condition) {
      unlocked.add(id);
      newlyUnlocked.push(BADGES_CONFIG[id]);
      if (BADGES_CONFIG[id].rewardXp) currentAccount.xp += BADGES_CONFIG[id].rewardXp;
      if (BADGES_CONFIG[id].rewardCoins) currentAccount.coins += BADGES_CONFIG[id].rewardCoins;
    }
  };

  testBadge('first_quiz', stats.quizzes_played >= 1);
  testBadge('streak_3', currentAccount.streak >= 3);
  testBadge('streak_7', currentAccount.streak >= 7);
  testBadge('combo_5', stats.max_streak >= 5);
  testBadge('combo_10', stats.max_streak >= 10);
  testBadge('word_50', stats.total_correct >= 50);
  testBadge('word_200', stats.total_correct >= 200);
  testBadge('coin_300', currentAccount.coins >= 300);
  testBadge('level_5', currentAccount.level >= 5);
  testBadge('level_10', currentAccount.level >= 10);

  currentAccount.badges = Array.from(unlocked);

  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(b => {
      showBadgeUnlockedModal(b);
    });
  }
}

// Ghi nhận khi hoàn thành bài Quiz
function recordQuizFinishToAccount(quizData) {
  if (!currentAccount) return;
  checkAndUpdateDailyStreak();

  if (!currentAccount.stats) currentAccount.stats = {};
  const s = currentAccount.stats;
  s.quizzes_played = (s.quizzes_played || 0) + 1;
  s.total_questions = (s.total_questions || 0) + quizData.totalAnswered;
  s.total_correct = (s.total_correct || 0) + quizData.totalCorrect;
  s.max_streak = Math.max(s.max_streak || 0, quizData.maxStreak || 0);

  if (quizData.totalAnswered > 0 && quizData.totalCorrect === quizData.totalAnswered) {
    if (!currentAccount.badges.includes('perfect_quiz')) {
      currentAccount.badges.push('perfect_quiz');
      showBadgeUnlockedModal(BADGES_CONFIG.perfect_quiz);
    }
  }

  // Thưởng hoàn thành bài Quiz
  addXP(40, 'Hoàn thành bài Quiz');
  addCoins(15, 'Thưởng hoàn thành Quiz');

  // Lưu các từ sai vào mistake_bank
  if (quizData.mistakes && quizData.mistakes.length > 0) {
    if (!currentAccount.mistake_bank) currentAccount.mistake_bank = [];
    quizData.mistakes.forEach(m => {
      const existing = currentAccount.mistake_bank.find(w => w.word.toLowerCase() === m.word.toLowerCase());
      if (existing) {
        existing.wrong_count = (existing.wrong_count || 1) + 1;
        existing.last_wrong_date = getTodayStr();
      } else {
        currentAccount.mistake_bank.push({
          word: m.word,
          ipa: m.ipa || '',
          meaningVi: m.meaningVi || '',
          examples: m.examples || '',
          wrong_count: 1,
          last_wrong_date: getTodayStr()
        });
      }
    });
  }

  checkBadges();
  saveCurrentAccount();
}

// 3. CỬA HÀNG VẬT PHẨM (SHOP)
function buyShopItem(itemKey) {
  if (!currentAccount) return;
  const item = SHOP_ITEMS[itemKey];
  if (!item) return;

  if (currentAccount.coins < item.cost) {
    alert(`Bạn không đủ Vàng! Cần ${item.cost} 🪙, hiện bạn chỉ có ${currentAccount.coins} 🪙.`);
    return;
  }

  currentAccount.coins -= item.cost;
  if (!currentAccount.inventory) currentAccount.inventory = {};
  currentAccount.inventory[itemKey] = (currentAccount.inventory[itemKey] || 0) + 1;

  saveCurrentAccount();
  renderAccountCenterModal();
  showToastAlert(`🎉 Mua thành công 1x ${item.name}!`);
}

function useShopItem(itemKey) {
  if (!currentAccount) return;
  const count = currentAccount.inventory?.[itemKey] || 0;
  if (count <= 0) {
    alert('Bạn chưa sở hữu vật phẩm này!');
    return;
  }

  if (itemKey === 'double_xp') {
    currentAccount.inventory[itemKey]--;
    const currentEnd = Math.max(Date.now(), currentAccount.double_xp_until || 0);
    currentAccount.double_xp_until = currentEnd + (30 * 60 * 1000); // Thêm 30 phút
    showToastAlert('🧪 Đã kích hoạt x2 EXP trong 30 phút!');
  } else if (itemKey === 'streak_freeze') {
    alert('Bình Đóng Băng Chuỗi sẽ tự động kích hoạt bảo vệ khi bạn lỡ quên học 1 ngày, không cần bấm dùng thủ công nhé!');
    return;
  }

  saveCurrentAccount();
  renderAccountCenterModal();
}

// 4. SAO LƯU & PHỤC HỒI DỮ LIỆU (JSON & GITHUB GIST CLOUD SYNC)
function exportAccountDataJson() {
  if (!currentAccount) return;
  const data = {
    exported_at: new Date().toISOString(),
    version: '1.0',
    current_user_id: currentAccount.id,
    accounts: allAccounts
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Anki_Save_${currentAccount.username.replace(/\s+/g, '_')}_${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importAccountDataJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && Array.isArray(data.accounts)) {
        allAccounts = data.accounts;
        if (data.current_user_id) {
          currentAccount = allAccounts.find(a => a.id === data.current_user_id) || allAccounts[0];
        } else {
          currentAccount = allAccounts[0];
        }
        saveAllAccounts();
        updateHeaderUserWidget();
        renderAccountCenterModal();
        alert('🎉 Phục hồi dữ liệu tài khoản thành công!');
      } else {
        alert('File sao lưu không đúng định dạng chuẩn của Anki Dictionary!');
      }
    } catch (err) {
      alert('Lỗi khi đọc file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Đồng bộ bí mật lên GitHub Gist
async function syncToGitHubGist() {
  const ghToken = localStorage.getItem('gh_token');
  if (!ghToken) {
    alert('Để đồng bộ đám mây, bạn hãy điền GitHub Token trong mục ⚙️ Cấu hình API trước nhé!');
    if (typeof openSettings === 'function') openSettings();
    return;
  }

  const btn = document.getElementById('btnGistSyncUpload');
  if (btn) btn.innerText = '⏳ Đang đồng bộ lên Gist...';

  try {
    const backupContent = JSON.stringify({
      updated_at: new Date().toISOString(),
      current_user_id: currentAccount ? currentAccount.id : null,
      accounts: allAccounts
    }, null, 2);

    let gistId = localStorage.getItem('anki_cloud_gist_id');
    let res;

    if (gistId) {
      res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'The Anki Dictionary - Cloud Backup Data',
          files: { 'anki_gamification_backup.json': { content: backupContent } }
        })
      });
    } else {
      res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'The Anki Dictionary - Cloud Backup Data',
          public: false,
          files: { 'anki_gamification_backup.json': { content: backupContent } }
        })
      });
    }

    if (!res.ok) throw new Error(`GitHub Gist API error: ${res.status}`);
    const data = await res.json();
    localStorage.setItem('anki_cloud_gist_id', data.id);

    showToastAlert('☁️ Đã đồng bộ dữ liệu hồ sơ lên GitHub Cloud Gist an toàn!');
  } catch (err) {
    alert('Đồng bộ thất bại: ' + err.message);
  } finally {
    if (btn) btn.innerText = '☁️ Đồng Bộ Lên Đám Mây (Gist)';
  }
}

// 5. GIAO DIỆN & CẬP NHẬT HEADER WIDGET
function updateHeaderUserWidget() {
  const widget = document.getElementById('headerUserWidget');
  if (!widget) return;

  if (!currentAccount) {
    widget.innerHTML = `
      <button onclick="openAccountCenter('switch')" class="neo-btn px-3 py-1.5 rounded-full bg-[#FFE787] text-[#111] text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-300">
        🔑 Đăng Nhập / Tạo Hồ Sơ
      </button>
    `;
    return;
  }

  const neededXp = getXpForLevel(currentAccount.level);
  const xpPct = Math.min(100, Math.round((currentAccount.xp / neededXp) * 100));

  widget.innerHTML = `
    <button onclick="openAccountCenter('profile')" class="neo-btn px-2.5 sm:px-3 py-1.5 rounded-full bg-white text-[#111] text-xs font-extrabold flex items-center gap-2 hover:bg-slate-100 transition shadow-[2px_2px_0px_#111]">
      <span class="w-6 h-6 rounded-full bg-amber-200 border border-[#111] flex items-center justify-center text-sm">${currentAccount.avatar || '🦁'}</span>
      <span class="font-display font-extrabold text-xs hidden md:inline truncate max-w-[100px]">${currentAccount.username}</span>
      <span class="font-mono-code text-[11px] bg-[#141414] text-white px-1.5 py-0.5 rounded font-bold">Lv.${currentAccount.level}</span>
      <span class="font-mono-code text-xs font-bold text-amber-600 flex items-center gap-0.5">🔥 ${currentAccount.streak || 1}</span>
      <span class="font-mono-code text-xs font-bold text-yellow-600 flex items-center gap-0.5">🪙 ${currentAccount.coins || 0}</span>
    </button>
  `;
}

// 6. MODAL TRUNG TÂM TÀI KHOẢN & GAMIFICATION (ACCOUNT HUB)
function openAccountCenter(defaultTab = 'profile') {
  const modal = document.getElementById('accountCenterModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  switchAccountModalTab(defaultTab);
  renderAccountCenterModal();
}

function closeAccountCenter() {
  const modal = document.getElementById('accountCenterModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function switchAccountModalTab(tab) {
  ['profile', 'badges', 'shop', 'switch', 'backup'].forEach(t => {
    const pane = document.getElementById('accTabPane-' + t);
    if (pane) pane.classList.toggle('hidden', t !== tab);
    const btn = document.getElementById('accTabBtn-' + t);
    if (btn) {
      btn.className = t === tab
        ? 'neo-btn px-3 py-1.5 bg-[#141414] text-white text-xs font-display font-extrabold uppercase'
        : 'neo-btn px-3 py-1.5 bg-white text-[#141414] text-xs font-display font-extrabold uppercase';
    }
  });
}

function renderAccountCenterModal() {
  if (!currentAccount) return;

  // TAB 1: PROFILE
  const neededXp = getXpForLevel(currentAccount.level);
  const xpPct = Math.min(100, Math.round((currentAccount.xp / neededXp) * 100));
  const stats = currentAccount.stats || {};
  const accuracy = stats.total_questions > 0 ? Math.round((stats.total_correct / stats.total_questions) * 100) : 0;

  document.getElementById('accHeroAvatar').innerText = currentAccount.avatar || '🦁';
  document.getElementById('accHeroUsername').innerText = currentAccount.username;
  document.getElementById('accHeroTitle').innerText = getTitleForLevel(currentAccount.level);
  document.getElementById('accHeroLevel').innerText = `Level ${currentAccount.level}`;
  document.getElementById('accHeroXpText').innerText = `${currentAccount.xp} / ${neededXp} XP (${xpPct}%)`;
  document.getElementById('accHeroXpBar').style.width = `${xpPct}%`;

  document.getElementById('accStatStreak').innerText = `${currentAccount.streak || 1} Ngày`;
  document.getElementById('accStatCoins').innerText = `${currentAccount.coins || 0} 🪙`;
  document.getElementById('accStatQuizzes').innerText = stats.quizzes_played || 0;
  document.getElementById('accStatAccuracy').innerText = `${accuracy}% (${stats.total_correct || 0}/${stats.total_questions || 0})`;
  document.getElementById('accStatMaxCombo').innerText = stats.max_streak || 0;
  document.getElementById('accStatMistakes').innerText = (currentAccount.mistake_bank || []).length;

  // TAB 2: BADGES
  const badgeGrid = document.getElementById('accBadgeGrid');
  if (badgeGrid) {
    const unlocked = new Set(currentAccount.badges || []);
    badgeGrid.innerHTML = Object.values(BADGES_CONFIG).map(b => {
      const isGot = unlocked.has(b.id);
      return `
        <div class="neo-box-sm p-3 ${isGot ? 'bg-[#FFFDF7] border-[#141414]' : 'bg-slate-100 opacity-60 border-slate-300'} flex items-start gap-3 relative">
          <div class="text-3xl shrink-0 ${isGot ? '' : 'grayscale'}">${b.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h4 class="font-display font-extrabold text-xs uppercase ${isGot ? 'text-[#141414]' : 'text-slate-500'}">${b.name}</h4>
              ${isGot ? '<span class="text-[10px] font-mono-code font-bold bg-[#199A5E] text-white px-1 rounded">ĐÃ ĐẠT</span>' : '<span class="text-[10px] font-mono-code font-bold text-slate-400">CHƯA</span>'}
            </div>
            <p class="text-[11px] text-slate-600 mt-1 leading-snug">${b.desc}</p>
            <div class="text-[10px] font-mono-code font-bold text-amber-700 mt-1.5 flex gap-2">
              ${b.rewardXp ? `<span>+${b.rewardXp} XP</span>` : ''}
              ${b.rewardCoins ? `<span>+${b.rewardCoins} 🪙</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // TAB 3: SHOP
  const shopGrid = document.getElementById('accShopGrid');
  if (shopGrid) {
    const inv = currentAccount.inventory || {};
    shopGrid.innerHTML = Object.values(SHOP_ITEMS).map(item => {
      const owned = inv[item.id] || 0;
      return `
        <div class="neo-box-sm p-4 bg-white flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-3xl">${item.icon}</span>
              <span class="font-mono-code text-xs font-bold bg-amber-100 border border-[#111] px-2 py-0.5 rounded">Đang có: ${owned}</span>
            </div>
            <h4 class="font-display font-extrabold text-sm uppercase">${item.name}</h4>
            <p class="text-xs text-slate-600 mt-1">${item.desc}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <span class="font-mono-code text-xs font-extrabold text-yellow-700">${item.cost} 🪙</span>
            <div class="flex gap-1.5">
              ${item.id === 'double_xp' && owned > 0 ? `<button onclick="useShopItem('${item.id}')" class="neo-btn px-2.5 py-1 bg-[#199A5E] text-white text-[11px] font-extrabold">Dùng Ngay</button>` : ''}
              <button onclick="buyShopItem('${item.id}')" class="neo-btn px-3 py-1 bg-[#FFE787] text-[#111] text-[11px] font-extrabold hover:bg-amber-300">Mua</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // TAB 4: SWITCH ACCOUNT
  const accListContainer = document.getElementById('accAllAccountsList');
  if (accListContainer) {
    accListContainer.innerHTML = allAccounts.map(a => {
      const isCurrent = a.id === currentAccount.id;
      return `
        <div class="p-3 border-2 border-[#111] ${isCurrent ? 'bg-amber-100 shadow-[2px_2px_0px_#111]' : 'bg-white'} flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${a.avatar || '🦁'}</span>
            <div>
              <div class="font-display font-extrabold text-xs text-[#111] flex items-center gap-1.5">
                ${a.username}
                ${isCurrent ? '<span class="bg-[#199A5E] text-white text-[9px] px-1 font-mono-code font-bold rounded">ĐANG CHỌN</span>' : ''}
              </div>
              <div class="text-[11px] font-mono-code text-slate-500">Lv.${a.level} • 🔥 ${a.streak || 1} • 🪙 ${a.coins || 0}</div>
            </div>
          </div>
          <div>
            ${!isCurrent ? `<button onclick="switchActiveAccount('${a.id}')" class="neo-btn px-2.5 py-1 bg-[#141414] text-white text-xs font-bold">Chọn</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Chuyển sang tài khoản khác
function switchActiveAccount(accId) {
  const target = allAccounts.find(a => a.id === accId);
  if (!target) return;
  if (target.pin) {
    const inputPin = prompt(`Nhập mã PIN cho tài khoản "${target.username}":`);
    if (inputPin !== target.pin) {
      alert('Mã PIN không chính xác!');
      return;
    }
  }

  currentAccount = target;
  localStorage.setItem(CURRENT_USER_KEY, currentAccount.id);
  checkAndUpdateDailyStreak();
  updateHeaderUserWidget();
  renderAccountCenterModal();
  showToastAlert(`👋 Đã đăng nhập vào hồ sơ "${currentAccount.username}"!`);
}

// Tạo tài khoản mới từ Modal
function handleCreateNewAccountForm() {
  const nameInput = document.getElementById('newAccUsernameInput');
  const avatarInput = document.getElementById('newAccAvatarSelect');
  const pinInput = document.getElementById('newAccPinInput');

  const username = nameInput ? nameInput.value.trim() : '';
  if (!username) {
    alert('Vui lòng nhập tên người học!');
    return;
  }

  const avatar = avatarInput ? avatarInput.value : '🦁';
  const pin = pinInput ? pinInput.value.trim() : '';

  createNewAccountInternal(username, avatar, pin);
  updateHeaderUserWidget();
  switchAccountModalTab('profile');
  renderAccountCenterModal();
  showToastAlert(`🎉 Chào mừng ${username} đến với The Anki Dictionary!`);
}

// Cập nhật thông tin tài khoản hiện tại
function handleUpdateProfileForm() {
  if (!currentAccount) return;
  const nameInput = document.getElementById('editAccUsernameInput');
  const avatarInput = document.getElementById('editAccAvatarSelect');
  const pinInput = document.getElementById('editAccPinInput');

  if (nameInput && nameInput.value.trim()) {
    currentAccount.username = nameInput.value.trim();
  }
  if (avatarInput) {
    currentAccount.avatar = avatarInput.value;
  }
  if (pinInput) {
    currentAccount.pin = pinInput.value.trim();
  }

  saveCurrentAccount();
  renderAccountCenterModal();
  showToastAlert('✅ Đã lưu cập nhật hồ sơ!');
}

// 7. TOAST & NOTIFICATION EFFECTS
function showFloatingExpNotify(xpAmount, isDouble = false) {
  const div = document.createElement('div');
  div.className = 'fixed bottom-8 right-8 z-50 neo-box-sm bg-[#FFE787] text-[#111] px-4 py-2 font-display font-extrabold text-sm flex items-center gap-2 shadow-[4px_4px_0px_#111] animate-bounce';
  div.innerHTML = `<span>⚡</span> <span>+${xpAmount} XP ${isDouble ? '(x2 Buff!)' : ''}</span>`;
  document.body.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 2200);
}

function showToastAlert(msg) {
  const div = document.createElement('div');
  div.className = 'fixed top-20 right-4 z-50 neo-box-sm bg-[#141414] text-white px-4 py-2.5 font-bold text-xs flex items-center gap-2 shadow-[4px_4px_0px_#FFE787] max-w-sm';
  div.innerHTML = `<span>✨</span> <span>${msg}</span>`;
  document.body.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 3500);
}

function triggerLevelUpModal(newLevel) {
  if (typeof playQuizSound === 'function') playQuizSound('fanfare');
  showToastAlert(`🎊 CHÚC MỪNG BẠN ĐÃ THĂNG CẤP LÊN LEVEL ${newLevel}! Nhận thêm +50 🪙`);
}

function showBadgeUnlockedModal(badge) {
  if (!badge) return;
  if (typeof playQuizSound === 'function') playQuizSound('fanfare');
  showToastAlert(`🎖️ HUY HIỆU MỚI: "${badge.name}" (${badge.icon})! Nhận +${badge.rewardXp || 0} XP & +${badge.rewardCoins || 0} 🪙`);
}
