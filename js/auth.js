// ==================== HỆ THỐNG TÀI KHOẢN CLOUD SUPABASE & ĐỘNG CƠ RPG PIXEL ====================
// Module quản lý: Đăng nhập / Đăng ký Supabase Cloud, Nhân vật RPG, Cấp độ, Máu (HP), Năng lượng (MP),
// Vàng 🪙, Kim cương 💎, Trang bị, và Đồng bộ dữ liệu đám mây thời gian thực.

const SUPABASE_URL_KEY = 'sb_project_url';
const SUPABASE_KEY_KEY = 'sb_anon_key';
const LOCAL_PROFILE_KEY = 'anki_rpg_local_profile';

let supabaseClient = null;
let currentSession = null;
let currentRpgUser = null; // Dữ liệu nhân vật hiện tại

if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window, 'supabaseClient', {
      get() { return supabaseClient; },
      set(val) { supabaseClient = val; },
      configurable: true
    });
    Object.defineProperty(window, 'currentSession', {
      get() { return currentSession; },
      set(val) { currentSession = val; },
      configurable: true
    });
    Object.defineProperty(window, 'currentRpgUser', {
      get() { return currentRpgUser; },
      set(val) { currentRpgUser = val; },
      configurable: true
    });
  } catch (e) {
    window.currentRpgUser = currentRpgUser;
    window.supabaseClient = supabaseClient;
    window.currentSession = currentSession;
  }
}

// Cấu hình 4 Lớp Nhân Vật Pixel RPG
const RPG_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Chiến Binh (Warrior)',
    icon: '⚔️',
    desc: 'Máu trâu, giáp khỏe. Đòn đánh chí mạng (Critical) bùng nổ khi giữ chuỗi Combo đúng!',
    baseHp: 120,
    baseMp: 40,
    perk: '+20% Máu tối đa & Tăng sát thương theo Streak combo'
  },
  mage: {
    id: 'mage',
    name: 'Pháp Sư (Mage)',
    icon: '🧙‍♂️',
    desc: 'Lượng MP dồi dào. Tung phép cực mạnh khi gặp từ vựng học thuật C1-C2 khó.',
    baseHp: 80,
    baseMp: 100,
    perk: '+50% Năng lượng & x2 sát thương với từ vựng C1-C2'
  },
  ranger: {
    id: 'ranger',
    name: 'Xạ Thủ (Ranger)',
    icon: '🏹',
    desc: 'Tầm nhìn nhạy bén. Tự động kích hoạt Mắt Đại Bàng loại bỏ các đáp án sai.',
    baseHp: 95,
    baseMp: 60,
    perk: 'Tự động có thêm lượt dùng Cuộn Giấy Gợi Ý mỗi trận'
  },
  assassin: {
    id: 'assassin',
    name: 'Sát Thủ (Assassin)',
    icon: '🥷',
    desc: 'Phản xạ chớp nhoáng. Nhận thêm nhiều Vàng và EXP từ mỗi quái vật bị hạ gục.',
    baseHp: 90,
    baseMp: 50,
    perk: '+35% Vàng và EXP nhận được sau mỗi trận đấu'
  }
};

// Danh sách Huy hiệu Thành tựu
const BADGES_CONFIG = {
  first_login: { id: 'first_login', name: 'Tân Thủ Nhập Môn', icon: '🎉', desc: 'Gia nhập thế giới Pixel RPG Anki.', rewardXp: 50, rewardGold: 50 },
  first_quiz: { id: 'first_quiz', name: 'Chiến Tích Đầu Tiên', icon: '🎯', desc: 'Đánh bại quái vật trong lượt đấu đầu tiên.', rewardXp: 50, rewardGold: 30 },
  streak_3: { id: 'streak_3', name: 'Ý Chí Kiên Định', icon: '🔥', desc: 'Duy trì chuỗi luyện tập 3 ngày liên tiếp.', rewardXp: 100, rewardGold: 50 },
  streak_7: { id: 'streak_7', name: 'Chiến Binh Bền Bỉ', icon: '⚡', desc: 'Duy trì chuỗi luyện tập 7 ngày liên tiếp.', rewardXp: 200, rewardGold: 100 },
  combo_5: { id: 'combo_5', name: 'Cuồng Phong Trảm', icon: '🌪️', desc: 'Đạt chuỗi 5 đòn đánh chính xác liên tiếp.', rewardXp: 60, rewardGold: 30 },
  combo_10: { id: 'combo_10', name: 'Vô Song Trảm', icon: '🚀', desc: 'Đạt chuỗi 10 đòn đánh chính xác tuyệt đối.', rewardXp: 150, rewardGold: 80 },
  perfect_quiz: { id: 'perfect_quiz', name: 'Chiến Thắng Hoàn Mỹ', icon: '💯', desc: 'Vượt qua ải không mất một giọt máu nào.', rewardXp: 120, rewardGold: 60 },
  boss_slayer: { id: 'boss_slayer', name: 'Thợ Săn Trùm Cuối', icon: '👑', desc: 'Hạ gục thành công Boss của một chủ đề.', rewardXp: 200, rewardGold: 100 },
  level_5: { id: 'level_5', name: 'Đại Hiệp Khởi Nghiệp', icon: '⭐', desc: 'Đạt tới Level 5 trên con đường RPG.', rewardXp: 250, rewardGold: 150 }
};

// Cửa hàng vật phẩm trang bị RPG
const SHOP_ITEMS = {
  health_potion: { id: 'health_potion', name: 'Bình Máu Siêu Cấp', icon: '🧪', cost: 40, desc: 'Hồi phục ngay 50 HP khi bị quái vật phản đòn.' },
  mana_potion: { id: 'mana_potion', name: 'Bình Năng Lượng MP', icon: '🔮', cost: 50, desc: 'Hồi phục ngay 40 MP để tung kỹ năng diệt quái.' },
  streak_freeze: { id: 'streak_freeze', name: 'Băng Thạch Bảo Hộ', icon: '🧊', cost: 100, desc: 'Tự động bảo vệ chuỗi ngày Streak khi lỡ quên luyện tập 1 ngày.' },
  double_xp: { id: 'double_xp', name: 'Thuốc x2 Kinh Nghiệm', icon: '✨', cost: 150, desc: 'Nhân đôi toàn bộ EXP nhận được trong 30 phút.' },
  hint_scroll: { id: 'hint_scroll', name: 'Cuộn Giấy Khai Sáng', icon: '📜', cost: 60, desc: 'Loại bỏ 2 đáp án sai trong lượt tấn công.' }
};

// Công thức tính EXP cần cho cấp độ kế tiếp
function getXpForLevel(level) {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.35));
}

// 1. KHỞI TẠO HỆ THỐNG SUPABASE
async function initAuthSystem() {
  const url = localStorage.getItem(SUPABASE_URL_KEY);
  const key = localStorage.getItem(SUPABASE_KEY_KEY);

  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      const { data: { session } } = await supabaseClient.auth.getSession();
      currentSession = session;

      if (currentSession?.user) {
        await loadProfileFromSupabase(currentSession.user.id);
      } else {
        loadLocalProfileFallback();
      }

      // Lắng nghe thay đổi trạng thái đăng nhập thời gian thực
      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        currentSession = session;
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfileFromSupabase(session.user.id);
          showToastAlert(`☁️ Chào mừng trở lại, ${currentRpgUser.display_name}!`);
        } else if (event === 'SIGNED_OUT') {
          currentRpgUser = null;
          loadLocalProfileFallback();
          showToastAlert('👋 Đã đăng xuất khỏi Supabase Cloud.');
        }
        updateHeaderUserWidget();
        renderAccountCenterModal();
      });

    } catch (e) {
      console.warn('Lỗi kết nối Supabase, chuyển sang chế độ Local:', e);
      loadLocalProfileFallback();
    }
  } else {
    loadLocalProfileFallback();
  }

  checkDailyStreak();
  updateHeaderUserWidget();
}

// Đảm bảo thuộc tính user.dust luôn chuẩn hóa và ánh xạ 2 chiều với user.magic_dust
function ensureDustProperty(user) {
  if (!user) return;
  if (typeof user.dust === 'undefined') {
    user.dust = (typeof user.magic_dust !== 'undefined') ? Number(user.magic_dust) : 20;
  }
  try {
    const desc = Object.getOwnPropertyDescriptor(user, 'magic_dust');
    if (!desc || desc.configurable) {
      Object.defineProperty(user, 'magic_dust', {
        get() { return this.dust || 0; },
        set(val) { this.dust = Math.max(0, parseInt(val, 10) || 0); },
        configurable: true,
        enumerable: false
      });
    }
  } catch (e) {
    user.magic_dust = user.dust;
  }
}

// Tải hoặc khởi tạo nhân vật trong LocalStorage nếu chưa nối Supabase
function loadLocalProfileFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) {
      currentRpgUser = JSON.parse(raw);
    } else {
      currentRpgUser = createDefaultRpgCharacter('Vinh Đẹp Trai', 'warrior', '🦁');
      saveCurrentRpgUser();
    }
  } catch (e) {
    currentRpgUser = createDefaultRpgCharacter('Vinh Đẹp Trai', 'warrior', '🦁');
  }

  // Chuẩn hóa profile khi nạp từ LocalStorage
  if (currentRpgUser) {
    ensureDustProperty(currentRpgUser);
    if (typeof currentRpgUser.skill_points === 'undefined') currentRpgUser.skill_points = 0;
    if (typeof currentRpgUser.enhance_stones === 'undefined') currentRpgUser.enhance_stones = 5;
    if (typeof currentRpgUser.gacha_pity === 'undefined') currentRpgUser.gacha_pity = 0;
    if (!Array.isArray(currentRpgUser.unlocked_dungeons) || currentRpgUser.unlocked_dungeons.length === 0) {
      currentRpgUser.unlocked_dungeons = [1];
    }
    if (!Array.isArray(currentRpgUser.unlocked_titles) || currentRpgUser.unlocked_titles.length === 0) {
      currentRpgUser.unlocked_titles = ['Tân Binh Anki'];
    }
    if (!currentRpgUser.equipped_title) currentRpgUser.equipped_title = 'Tân Binh Anki';
    if (!currentRpgUser.stats) {
      currentRpgUser.stats = { monsters_slain: 0, bosses_slain: 0, dungeons_cleared: 0, perfect_quizzes: 0, total_turns: 0, quizzes_played: 0, total_correct: 0, max_combo: 0 };
    }
    if (currentRpgUser.inventory) {
      if (typeof currentRpgUser.inventory.health_potions !== 'undefined') {
        currentRpgUser.inventory.health_potion = (currentRpgUser.inventory.health_potion || 0) + (currentRpgUser.inventory.health_potions || 0);
        delete currentRpgUser.inventory.health_potions;
      }
      if (typeof currentRpgUser.inventory.double_xp_potion !== 'undefined') {
        currentRpgUser.inventory.double_xp = (currentRpgUser.inventory.double_xp || 0) + (currentRpgUser.inventory.double_xp_potion || 0);
        delete currentRpgUser.inventory.double_xp_potion;
      }
    }
  }
}

function createDefaultRpgCharacter(name, rpgClass = 'warrior', avatar = '🦁') {
  const cls = RPG_CLASSES[rpgClass] || RPG_CLASSES.warrior;
  const user = {
    id: 'local_' + Date.now(),
    is_cloud: false,
    display_name: name || 'Hiệp Sĩ Anki',
    avatar: avatar || '🦁',
    rpg_class: rpgClass,
    level: 1,
    xp: 0,
    hp: cls.baseHp,
    max_hp: cls.baseHp,
    mp: cls.baseMp,
    max_mp: cls.baseMp,
    gold: 100,
    gems: 10,
    dust: 20,
    enhance_stones: 5,
    gacha_pity: 0,
    skill_points: 0,
    streak: 1,
    last_active_date: getTodayStr(),
    equipped_weapon: 'Tập Sự Kiếm',
    equipped_armor: 'Áo Vải Tân Thủ',
    equipped_title: 'Tân Binh Anki',
    unlocked_titles: ['Tân Binh Anki'],
    inventory: {
      health_potion: 3,
      mana_potion: 2,
      streak_freeze: 1,
      double_xp: 0,
      hint_scroll: 2
    },
    equipment_enhances: {
      weapon: 0,
      helmet: 0,
      armor: 0,
      gloves: 0,
      boots: 0
    },
    unlocked_dungeons: [1],
    badges: ['first_login'],
    stats: {
      monsters_slain: 0,
      bosses_slain: 0,
      dungeons_cleared: 0,
      perfect_quizzes: 0,
      total_turns: 0,
      quizzes_played: 0,
      total_correct: 0,
      max_combo: 0
    },
    mistake_bank: []
  };
  ensureDustProperty(user);
  return user;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 2. SUPABASE AUTH: ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT
async function supabaseSignUp(email, password, displayName, avatar, rpgClass) {
  if (!supabaseClient) {
    alert('Vui lòng nhập Supabase Project URL & Anon Key trong mục Cấu Hình trước nhé!');
    switchAccountModalTab('config');
    return;
  }

  const btn = document.getElementById('btnSubmitSignUp');
  if (btn) btn.innerText = '⏳ Đang tạo tài khoản...';

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          display_name: displayName.trim() || 'Hiệp Sĩ Anki',
          avatar: avatar || '🦁',
          rpg_class: rpgClass || 'warrior'
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Tự động tạo row hồ sơ nếu trigger phía server chưa kịp chạy
      await ensureProfileCreated(data.user.id, email, displayName, avatar, rpgClass);
      await loadProfileFromSupabase(data.user.id);
      showToastAlert('🎉 Đăng ký tài khoản Supabase thành công! Dữ liệu đã được bảo vệ trên Cloud.');
      switchAccountModalTab('profile');
    }
  } catch (err) {
    alert('Lỗi đăng ký: ' + err.message);
  } finally {
    if (btn) btn.innerText = 'Đăng Ký Tài Khoản RPG';
  }
}

async function supabaseSignIn(email, password) {
  if (!supabaseClient) {
    alert('Vui lòng kết nối Supabase trong mục Cấu Hình trước!');
    switchAccountModalTab('config');
    return;
  }

  const btn = document.getElementById('btnSubmitSignIn');
  if (btn) btn.innerText = '⏳ Đang đăng nhập...';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    if (data.user) {
      await loadProfileFromSupabase(data.user.id);
      switchAccountModalTab('profile');
    }
  } catch (err) {
    alert('Lỗi đăng nhập: ' + err.message);
  } finally {
    if (btn) btn.innerText = 'Đăng Nhập';
  }
}

async function supabaseSignOut() {
  if (confirm('Bạn có chắc muốn đăng xuất khỏi tài khoản Supabase Cloud này?')) {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
  }
}

async function ensureProfileCreated(userId, email, displayName, avatar, rpgClass) {
  if (!supabaseClient) return;
  const cls = RPG_CLASSES[rpgClass] || RPG_CLASSES.warrior;
  try {
    const { data } = await supabaseClient.from('profiles').select('id').eq('id', userId).single();
    if (!data) {
      await supabaseClient.from('profiles').insert({
        id: userId,
        email: email,
        display_name: displayName || 'Hiệp Sĩ Anki',
        avatar: avatar || '🦁',
        rpg_class: rpgClass || 'warrior',
        level: 1,
        xp: 0,
        hp: cls.baseHp,
        max_hp: cls.baseHp,
        mp: cls.baseMp,
        max_mp: cls.baseMp,
        gold: 100,
        gems: 10,
        streak: 1,
        inventory: {
          health_potion: 3,
          mana_potion: 2,
          streak_freeze: 1,
          double_xp: 0,
          hint_scroll: 2,
          dust: 20,
          enhance_stones: 5,
          gacha_pity: 0
        },
        unlocked_dungeons: [1],
        badges: ['first_login'],
        stats: {
          monsters_slain: 0,
          bosses_slain: 0,
          dungeons_cleared: 0,
          perfect_quizzes: 0,
          total_turns: 0,
          quizzes_played: 0,
          total_correct: 0,
          max_combo: 0
        }
      });
    }
  } catch (e) {}
}

function unpackSupabaseProfileRow(profileData) {
  if (!profileData) return null;
  const user = {
    ...profileData,
    is_cloud: true
  };

  // Giải nén cấu trúc trang bị từ JSONB inventory nếu có
  if (profileData.inventory && typeof profileData.inventory === 'object') {
    const inv = profileData.inventory;
    if (inv.equipped) user.equipped = inv.equipped;
    if (inv.equipment_inventory) user.equipment_inventory = inv.equipment_inventory;
    if (inv.equipment_enhances) user.equipment_enhances = inv.equipment_enhances;
    if (typeof inv.dust !== 'undefined') user.dust = inv.dust;
    else if (typeof inv.magic_dust !== 'undefined') user.dust = inv.magic_dust;
    if (typeof inv.enhance_stones !== 'undefined') user.enhance_stones = inv.enhance_stones;
    if (typeof inv.gacha_pity !== 'undefined') user.gacha_pity = inv.gacha_pity;
    if (inv.daily_quests) user.daily_quests = inv.daily_quests;
    if (inv.quests) user.quests = inv.quests;
    if (inv.weekly_quests) user.weekly_quests = inv.weekly_quests;

    if (!user.quests) user.quests = {};
    if (user.quests.daily && !user.daily_quests) user.daily_quests = user.quests.daily;
    if (user.daily_quests && !user.quests.daily) user.quests.daily = user.daily_quests;
    if (user.quests.weekly && !user.weekly_quests) user.weekly_quests = user.quests.weekly;
    if (user.weekly_quests && !user.quests.weekly) user.quests.weekly = user.weekly_quests;
    if (inv.achievements) user.achievements = inv.achievements;
    if (inv.equipped_title) user.equipped_title = inv.equipped_title;
    if (inv.unlocked_titles) user.unlocked_titles = inv.unlocked_titles;
    if (typeof inv.skill_points !== 'undefined') user.skill_points = inv.skill_points;
    if (inv.skills_unlocked) user.skills_unlocked = inv.skills_unlocked;
    if (inv.pets) user.pets = inv.pets;
    if (inv.equipped_pet) user.equipped_pet = inv.equipped_pet;
    if (inv.tower_records) user.tower_records = inv.tower_records;

    // Chuẩn hóa inventory: health_potions -> health_potion, double_xp_potion -> double_xp
    if (typeof inv.health_potions !== 'undefined') {
      inv.health_potion = (inv.health_potion || 0) + (inv.health_potions || 0);
      delete inv.health_potions;
    }
    if (typeof inv.double_xp_potion !== 'undefined') {
      inv.double_xp = (inv.double_xp || 0) + (inv.double_xp_potion || 0);
      delete inv.double_xp_potion;
    }
  }

  // Đảm bảo user.dust được chuẩn hóa
  if (typeof user.dust === 'undefined') {
    if (typeof user.magic_dust !== 'undefined') user.dust = user.magic_dust;
    else user.dust = 20;
  }
  ensureDustProperty(user);
  return user;
}

async function loadProfileFromSupabase(userIdOrRow) {
  if (userIdOrRow && typeof userIdOrRow === 'object') {
    const unpacked = unpackSupabaseProfileRow(userIdOrRow);
    currentRpgUser = unpacked;
    return unpacked;
  }
  if (!supabaseClient) return null;
  try {
    const previousGuestUser = currentRpgUser;
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', userIdOrRow).single();
    if (error && error.code !== 'PGRST116') throw error;

    let profileData = data;
    if (!profileData) {
      // Tạo hồ sơ khởi điểm nếu chưa có
      await ensureProfileCreated(
        userIdOrRow,
        currentSession?.user?.email,
        previousGuestUser?.display_name || 'Hiệp Sĩ Anki',
        previousGuestUser?.avatar || '🦁',
        previousGuestUser?.rpg_class || 'warrior'
      );
      const { data: newData } = await supabaseClient.from('profiles').select('*').eq('id', userIdOrRow).single();
      profileData = newData;
    }

    if (profileData) {
      currentRpgUser = unpackSupabaseProfileRow(profileData);

      // Nâng cấp & Merge tiến trình Guest nếu tài khoản Cloud là tài khoản mới
      if (previousGuestUser && !previousGuestUser.is_cloud) {
        const isBrandNewCloud = (
          (currentRpgUser.level <= 1) &&
          ((currentRpgUser.xp || 0) === 0) &&
          (!currentRpgUser.stats || (currentRpgUser.stats.monsters_slain || 0) === 0)
        );
        if (isBrandNewCloud) {
          console.info('Hợp nhất tiến trình Guest vào tài khoản Cloud mới...');
          currentRpgUser.level = Math.max(currentRpgUser.level || 1, previousGuestUser.level || 1);
          currentRpgUser.xp = Math.max(currentRpgUser.xp || 0, previousGuestUser.xp || 0);
          currentRpgUser.gold = Math.max(currentRpgUser.gold || 0, previousGuestUser.gold || 0);
          currentRpgUser.gems = Math.max(currentRpgUser.gems || 0, previousGuestUser.gems || 0);
          currentRpgUser.dust = Math.max(currentRpgUser.dust || 0, previousGuestUser.dust || 0);
          currentRpgUser.enhance_stones = Math.max(currentRpgUser.enhance_stones || 0, previousGuestUser.enhance_stones || 0);
          currentRpgUser.skill_points = Math.max(currentRpgUser.skill_points || 0, previousGuestUser.skill_points || 0);
          currentRpgUser.streak = Math.max(currentRpgUser.streak || 1, previousGuestUser.streak || 1);

          // Merge unlocked_dungeons
          const mergedDungeons = Array.from(new Set([
            ...(Array.isArray(currentRpgUser.unlocked_dungeons) ? currentRpgUser.unlocked_dungeons : [1]),
            ...(Array.isArray(previousGuestUser.unlocked_dungeons) ? previousGuestUser.unlocked_dungeons : [1])
          ])).sort((a, b) => a - b);
          currentRpgUser.unlocked_dungeons = mergedDungeons;

          // Merge badges
          const mergedBadges = Array.from(new Set([
            ...(Array.isArray(currentRpgUser.badges) ? currentRpgUser.badges : ['first_login']),
            ...(Array.isArray(previousGuestUser.badges) ? previousGuestUser.badges : [])
          ]));
          currentRpgUser.badges = mergedBadges;

          // Merge titles
          if (Array.isArray(previousGuestUser.unlocked_titles) && previousGuestUser.unlocked_titles.length > 0) {
            currentRpgUser.unlocked_titles = Array.from(new Set([
              ...(Array.isArray(currentRpgUser.unlocked_titles) ? currentRpgUser.unlocked_titles : ['Tân Binh Anki']),
              ...previousGuestUser.unlocked_titles
            ]));
          }

          // Merge stats
          if (previousGuestUser.stats) {
            currentRpgUser.stats = currentRpgUser.stats || {};
            for (const key of Object.keys(previousGuestUser.stats)) {
              currentRpgUser.stats[key] = Math.max(currentRpgUser.stats[key] || 0, previousGuestUser.stats[key] || 0);
            }
          }

          // Merge equipment inventory if cloud was empty
          if (previousGuestUser.equipment_inventory && (!currentRpgUser.equipment_inventory || currentRpgUser.equipment_inventory.length === 0)) {
            currentRpgUser.equipment_inventory = previousGuestUser.equipment_inventory;
          }
          if (previousGuestUser.equipped && !currentRpgUser.equipped) {
            currentRpgUser.equipped = previousGuestUser.equipped;
          }
          if (previousGuestUser.equipment_enhances) {
            currentRpgUser.equipment_enhances = { ...(currentRpgUser.equipment_enhances || {}), ...previousGuestUser.equipment_enhances };
          }

          // Merge consumable items
          if (previousGuestUser.inventory) {
            currentRpgUser.inventory = currentRpgUser.inventory || {};
            for (const k of ['health_potion', 'mana_potion', 'streak_freeze', 'double_xp', 'hint_scroll']) {
              if (typeof previousGuestUser.inventory[k] !== 'undefined') {
                currentRpgUser.inventory[k] = Math.max(currentRpgUser.inventory[k] || 0, previousGuestUser.inventory[k] || 0);
              }
            }
          }
          if (previousGuestUser.max_hp && previousGuestUser.max_hp > (currentRpgUser.max_hp || 0)) {
            currentRpgUser.max_hp = previousGuestUser.max_hp;
            currentRpgUser.hp = currentRpgUser.max_hp;
          }
          if (previousGuestUser.max_mp && previousGuestUser.max_mp > (currentRpgUser.max_mp || 0)) {
            currentRpgUser.max_mp = previousGuestUser.max_mp;
            currentRpgUser.mp = currentRpgUser.max_mp;
          }
        }
      }

      // Đảm bảo unlocked_dungeons và unlocked_titles hợp lệ
      if (!Array.isArray(currentRpgUser.unlocked_dungeons) || currentRpgUser.unlocked_dungeons.length === 0) {
        currentRpgUser.unlocked_dungeons = [1];
      }
      if (!Array.isArray(currentRpgUser.unlocked_titles) || currentRpgUser.unlocked_titles.length === 0) {
        currentRpgUser.unlocked_titles = ['Tân Binh Anki'];
      }
      if (!currentRpgUser.equipped_title) {
        currentRpgUser.equipped_title = 'Tân Binh Anki';
      }

      saveLocalProfileCache();
      // Đẩy ngược lại lên cloud để đồng bộ dữ liệu merge
      saveCurrentRpgUser();
      return currentRpgUser;
    }
  } catch (e) {
    console.error('Lỗi khi nạp Profile từ Supabase:', e);
    loadLocalProfileFallback();
  }
  return currentRpgUser;
}

// Đồng bộ hồ sơ (vừa lưu LocalStorage vừa đẩy lên Supabase Cloud)
async function saveCurrentRpgUser() {
  if (!currentRpgUser) return;
  saveLocalProfileCache();
  updateHeaderUserWidget();

  if (currentRpgUser.is_cloud && supabaseClient && currentSession?.user) {
    try {
      const updateData = {
        display_name: currentRpgUser.display_name,
        avatar: currentRpgUser.avatar,
        rpg_class: currentRpgUser.rpg_class,
        level: currentRpgUser.level,
        xp: currentRpgUser.xp,
        hp: currentRpgUser.hp,
        max_hp: currentRpgUser.max_hp,
        mp: currentRpgUser.mp,
        max_mp: currentRpgUser.max_mp,
        gold: currentRpgUser.gold,
        gems: currentRpgUser.gems,
        streak: currentRpgUser.streak,
        last_active_date: currentRpgUser.last_active_date,
        equipped_weapon: currentRpgUser.equipped_weapon || 'Vũ Khí Cơ Bản',
        equipped_armor: currentRpgUser.equipped_armor || 'Giáp Cơ Bản',
        inventory: {
          ...(typeof currentRpgUser.inventory === 'object' ? currentRpgUser.inventory : {}),
          equipped: currentRpgUser.equipped,
          equipment_inventory: currentRpgUser.equipment_inventory,
          equipment_enhances: currentRpgUser.equipment_enhances,
          dust: currentRpgUser.dust || 0,
          magic_dust: currentRpgUser.dust || 0,
          enhance_stones: currentRpgUser.enhance_stones || 0,
          gacha_pity: currentRpgUser.gacha_pity || 0,
          daily_quests: currentRpgUser.daily_quests,
          quests: currentRpgUser.quests,
          weekly_quests: currentRpgUser.weekly_quests || currentRpgUser.quests?.weekly,
          achievements: currentRpgUser.achievements,
          equipped_title: currentRpgUser.equipped_title || 'Tân Binh Anki',
          unlocked_titles: currentRpgUser.unlocked_titles || ['Tân Binh Anki'],
          skill_points: currentRpgUser.skill_points || 0,
          skills_unlocked: currentRpgUser.skills_unlocked,
          pets: currentRpgUser.pets,
          equipped_pet: currentRpgUser.equipped_pet,
          tower_records: currentRpgUser.tower_records
        },
        unlocked_dungeons: currentRpgUser.unlocked_dungeons || [1],
        badges: currentRpgUser.badges || ['first_login'],
        stats: currentRpgUser.stats || {},
        mistake_bank: currentRpgUser.mistake_bank || [],
        updated_at: new Date().toISOString()
      };
      await supabaseClient.from('profiles').update(updateData).eq('id', currentSession.user.id);
    } catch (e) {
      console.warn('Lỗi đồng bộ hồ sơ lên Supabase Cloud:', e);
    }
  }
}

function saveLocalProfileCache() {
  if (currentRpgUser) {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(currentRpgUser));
  }
}

// 3. ĐỘNG CƠ RPG GAMIFICATION (CỘNG EXP, VÀNG, MÁU & THĂNG CẤP)
function addXP(amount, reason = '') {
  if (!currentRpgUser) return;

  let multiplier = 1;
  const now = Date.now();
  if (currentRpgUser.double_xp_until && currentRpgUser.double_xp_until > now) {
    multiplier = 2;
  }

  // Bonus lớp Sát Thủ: +35% EXP
  if (currentRpgUser.rpg_class === 'assassin') {
    multiplier *= 1.35;
  }

  // Bonus trang bị & Set đồ
  if (typeof calculatePlayerTotalStats === 'function') {
    const stats = calculatePlayerTotalStats(currentRpgUser);
    if (stats.expBonus) {
      multiplier *= (1 + stats.expBonus / 100);
    }
  }

  const finalXp = Math.round(amount * multiplier);
  currentRpgUser.xp += finalXp;

  // Kiểm tra Level Up
  let needed = getXpForLevel(currentRpgUser.level);
  let leveledUp = false;
  while (currentRpgUser.xp >= needed) {
    currentRpgUser.xp -= needed;
    currentRpgUser.level++;
    leveledUp = true;
    currentRpgUser.max_hp += 15;
    currentRpgUser.hp = currentRpgUser.max_hp; // Hồi đầy máu khi thăng cấp!
    currentRpgUser.max_mp += 10;
    currentRpgUser.mp = currentRpgUser.max_mp;
    currentRpgUser.gold += 50; // Thưởng 50 Vàng
    currentRpgUser.gems += 2;  // Thưởng 2 Kim Cương
    currentRpgUser.skill_points = (currentRpgUser.skill_points || 0) + 1; // Thưởng 1 Điểm Kỹ Năng!

    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
      GamificationQuests.trackProgress('level_up', currentRpgUser.level);
    }
    needed = getXpForLevel(currentRpgUser.level);
  }

  if (leveledUp) {
    triggerLevelUpModal(currentRpgUser.level);
    checkBadges();
  }

  saveCurrentRpgUser();
  showFloatingExpNotify(finalXp, multiplier > 1);
  return finalXp;
}

function addCoins(amount, reason = '') {
  if (!currentRpgUser) return;
  let mult = 1;
  if (currentRpgUser.rpg_class === 'assassin') mult = 1.35;

  if (typeof calculatePlayerTotalStats === 'function') {
    const stats = calculatePlayerTotalStats(currentRpgUser);
    if (stats.goldBonus) {
      mult *= (1 + stats.goldBonus / 100);
    }
  }

  const earned = Math.round(amount * mult);
  currentRpgUser.gold = (currentRpgUser.gold || 0) + earned;
  if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
    GamificationQuests.trackProgress('gold_balance', currentRpgUser.gold);
    GamificationQuests.trackProgress('gold_earned', earned);
  }
  checkBadges();
  saveCurrentRpgUser();
}

function checkDailyStreak() {
  if (!currentRpgUser) return;
  const today = getTodayStr();
  const lastDate = currentRpgUser.last_active_date;

  if (!lastDate) {
    currentRpgUser.last_active_date = today;
    currentRpgUser.streak = 1;
    saveCurrentRpgUser();
    return;
  }

  if (lastDate === today) return;

  const d1 = new Date(lastDate);
  const d2 = new Date(today);
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    currentRpgUser.streak++;
    currentRpgUser.gold += 15;
    currentRpgUser.last_active_date = today;
    checkBadges();
    saveCurrentRpgUser();
  } else if (diffDays > 1) {
    if (currentRpgUser.inventory?.streak_freeze > 0) {
      currentRpgUser.inventory.streak_freeze--;
      currentRpgUser.last_active_date = today;
      showToastAlert('🧊 Băng Thạch đã bảo vệ chuỗi Streak ' + currentRpgUser.streak + ' ngày của bạn!');
      saveCurrentRpgUser();
    } else {
      currentRpgUser.streak = 1;
      currentRpgUser.last_active_date = today;
      saveCurrentRpgUser();
    }
  }
}

function checkBadges() {
  if (!currentRpgUser) return;
  const unlocked = new Set(currentRpgUser.badges || []);
  const stats = currentRpgUser.stats || {};
  const newlyUnlocked = [];

  const testBadge = (id, condition) => {
    if (!unlocked.has(id) && condition) {
      unlocked.add(id);
      newlyUnlocked.push(BADGES_CONFIG[id]);
      if (BADGES_CONFIG[id]?.rewardXp) currentRpgUser.xp += BADGES_CONFIG[id].rewardXp;
      if (BADGES_CONFIG[id]?.rewardGold) currentRpgUser.gold += BADGES_CONFIG[id].rewardGold;
    }
  };

  testBadge('first_quiz', stats.quizzes_played >= 1);
  testBadge('streak_3', currentRpgUser.streak >= 3);
  testBadge('streak_7', currentRpgUser.streak >= 7);
  testBadge('combo_5', stats.max_combo >= 5);
  testBadge('combo_10', stats.max_combo >= 10);
  testBadge('perfect_quiz', (stats.perfect_quizzes || 0) >= 1 || (stats.perfect_dungeons || 0) >= 1);
  testBadge('boss_slayer', (stats.bosses_slain || 0) >= 1);
  testBadge('level_5', currentRpgUser.level >= 5);

  currentRpgUser.badges = Array.from(unlocked);
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(b => showBadgeUnlockedModal(b));
  }
}

// Ghi nhận sau trận chiến Quiz
function recordQuizFinishToAccount(quizData) {
  if (!currentRpgUser) return;
  checkDailyStreak();

  if (!currentRpgUser.stats) currentRpgUser.stats = {};
  const s = currentRpgUser.stats;
  s.quizzes_played = (s.quizzes_played || 0) + 1;
  s.total_turns = (s.total_turns || 0) + (quizData?.totalAnswered || 0);
  s.total_correct = (s.total_correct || 0) + (quizData?.totalCorrect || 0);
  s.max_combo = Math.max(s.max_combo || 0, quizData?.maxStreak || 0);

  if (quizData?.totalCorrect > 0) {
    s.monsters_slain = (s.monsters_slain || 0) + quizData.totalCorrect;
  }

  if (quizData?.bossSlain || quizData?.isBoss) {
    s.bosses_slain = (s.bosses_slain || 0) + 1;
    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
      GamificationQuests.trackProgress('slay_boss', 1);
      GamificationQuests.trackProgress('slay_boss_1', 1);
    }
  }

  if (quizData?.damageTaken === 0 || quizData?.perfect || (quizData?.totalAnswered > 0 && quizData?.totalCorrect === quizData?.totalAnswered)) {
    s.perfect_quizzes = (s.perfect_quizzes || 0) + 1;
  }

  // Thưởng hoàn thành
  addXP(40, 'Thắng trận Quiz');
  addCoins(15, 'Tiền thưởng ải');

  // Lưu từ sai vào Ngân hàng Quái Báo Thù
  if (quizData?.mistakes && quizData.mistakes.length > 0) {
    if (!currentRpgUser.mistake_bank) currentRpgUser.mistake_bank = [];
    quizData.mistakes.forEach(m => {
      const exist = currentRpgUser.mistake_bank.find(w => w.word.toLowerCase() === m.word.toLowerCase());
      if (exist) {
        exist.wrong_count = (exist.wrong_count || 1) + 1;
        exist.last_wrong_date = getTodayStr();
      } else {
        currentRpgUser.mistake_bank.push({
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
  saveCurrentRpgUser();
}

/**
 * Ghi nhận chiến công vượt ải Hầm ngục
 */
window.recordDungeonCleared = function(stt) {
  if (!currentRpgUser) return;
  if (!Array.isArray(currentRpgUser.unlocked_dungeons)) {
    currentRpgUser.unlocked_dungeons = [1];
  }
  const nextDungeon = parseInt(stt, 10) + 1;
  if (nextDungeon <= 100 && !currentRpgUser.unlocked_dungeons.includes(nextDungeon)) {
    currentRpgUser.unlocked_dungeons.push(nextDungeon);
    currentRpgUser.unlocked_dungeons.sort((a, b) => a - b);
  }
  if (!currentRpgUser.stats) currentRpgUser.stats = {};
  currentRpgUser.stats.dungeons_cleared = (currentRpgUser.stats.dungeons_cleared || 0) + 1;
  checkBadges();
  saveCurrentRpgUser();
  if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
    GamificationQuests.trackProgress('dungeon_clear', 1);
  }
};

/**
 * Ghi nhận tiêu diệt Boss
 */
window.recordBossSlain = function(bossData) {
  if (!currentRpgUser) return;
  if (!currentRpgUser.stats) currentRpgUser.stats = {};
  currentRpgUser.stats.bosses_slain = (currentRpgUser.stats.bosses_slain || 0) + 1;
  checkBadges();
  saveCurrentRpgUser();
  if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
    GamificationQuests.trackProgress('slay_boss', 1);
    GamificationQuests.trackProgress('slay_boss_1', 1);
  }
};

/**
 * Mở khóa danh hiệu mới
 */
window.unlockTitle = function(titleName) {
  if (!currentRpgUser || !titleName) return;
  if (!Array.isArray(currentRpgUser.unlocked_titles)) {
    currentRpgUser.unlocked_titles = ['Tân Binh Anki'];
  }
  if (!currentRpgUser.unlocked_titles.includes(titleName)) {
    currentRpgUser.unlocked_titles.push(titleName);
    saveCurrentRpgUser();
    if (typeof showToastAlert === 'function') {
      showToastAlert(`🎖️ Đã mở khóa Danh hiệu mới: [${titleName}]!`);
    }
  }
};

// 4. MUA & DÙNG VẬT PHẨM TRANG BỊ
function buyShopItem(itemKey) {
  if (!currentRpgUser) return;
  let key = itemKey;
  if (key === 'double_xp_potion' && !SHOP_ITEMS['double_xp_potion'] && SHOP_ITEMS['double_xp']) {
    key = 'double_xp';
  }
  const item = SHOP_ITEMS[key];
  if (!item) return;

  if (currentRpgUser.gold < item.cost) {
    alert(`Không đủ Vàng! Cần ${item.cost} 🪙, hiện bạn chỉ có ${currentRpgUser.gold} 🪙.`);
    return;
  }

  currentRpgUser.gold -= item.cost;
  if (!currentRpgUser.inventory) currentRpgUser.inventory = {};
  currentRpgUser.inventory[key] = (currentRpgUser.inventory[key] || 0) + 1;

  saveCurrentRpgUser();
  renderAccountCenterModal();
  showToastAlert(`🛍️ Đã mua 1x ${item.name}!`);
}

function useShopItem(itemKey) {
  if (!currentRpgUser) return;
  if (!currentRpgUser.inventory) currentRpgUser.inventory = {};

  // Hỗ trợ fallback health_potions (số nhiều) -> health_potion (số ít)
  if (currentRpgUser.inventory.health_potions) {
    currentRpgUser.inventory.health_potion = (currentRpgUser.inventory.health_potion || 0) + (currentRpgUser.inventory.health_potions || 0);
    delete currentRpgUser.inventory.health_potions;
  }

  // Hỗ trợ alias double_xp vs double_xp_potion & health_potion
  let effectiveKey = itemKey;
  if (itemKey === 'health_potion' || itemKey === 'health_potions') {
    effectiveKey = 'health_potion';
  } else if (itemKey === 'double_xp' || itemKey === 'double_xp_potion') {
    if ((currentRpgUser.inventory['double_xp'] || 0) > 0) {
      effectiveKey = 'double_xp';
    } else if ((currentRpgUser.inventory['double_xp_potion'] || 0) > 0) {
      effectiveKey = 'double_xp_potion';
    } else {
      effectiveKey = 'double_xp';
    }
  }

  const count = currentRpgUser.inventory?.[effectiveKey] || 0;
  if (count <= 0) {
    alert('Bạn chưa sở hữu vật phẩm này!');
    return;
  }

  if (itemKey === 'health_potion' || itemKey === 'health_potions') {
    currentRpgUser.inventory[effectiveKey]--;
    currentRpgUser.hp = Math.min(currentRpgUser.max_hp, currentRpgUser.hp + 50);
    showToastAlert('🧪 Đã hồi phục +50 HP máu!');
  } else if (itemKey === 'mana_potion') {
    currentRpgUser.inventory[effectiveKey]--;
    currentRpgUser.mp = Math.min(currentRpgUser.max_mp, currentRpgUser.mp + 40);
    showToastAlert('🔮 Đã hồi phục +40 MP năng lượng!');
  } else if (itemKey === 'double_xp' || itemKey === 'double_xp_potion') {
    currentRpgUser.inventory[effectiveKey]--;
    const currentEnd = Math.max(Date.now(), currentRpgUser.double_xp_until || 0);
    currentRpgUser.double_xp_until = currentEnd + (30 * 60 * 1000);
    showToastAlert('✨ Đã kích hoạt x2 EXP trong 30 phút!');
  }

  saveCurrentRpgUser();
  renderAccountCenterModal();
}

// 5. CẤU HÌNH SUPABASE KEYS
function saveSupabaseConfig(url, key) {
  if (!url || !key) {
    alert('Vui lòng điền đủ Project URL và Anon Key của Supabase!');
    return;
  }
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  showToastAlert('⚙️ Đã lưu cấu hình Supabase Cloud! Đang khởi tạo kết nối...');
  initAuthSystem();
  renderAccountCenterModal();
}

// 6. GIAO DIỆN & HEADER WIDGET
function updateHeaderUserWidget() {
  const widget = document.getElementById('headerUserWidget');
  if (!widget) return;

  if (!currentRpgUser) {
    widget.innerHTML = `
      <button onclick="openAccountCenter('auth')" class="neo-btn px-3 py-1.5 rounded-full bg-[#FFE787] text-[#111] text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-300">
        🔑 Đăng Nhập Cloud
      </button>
    `;
    return;
  }

  const isCloud = currentRpgUser.is_cloud && currentSession;
  const cls = RPG_CLASSES[currentRpgUser.rpg_class] || RPG_CLASSES.warrior;

  widget.innerHTML = `
    <button onclick="openAccountCenter('profile')" class="neo-btn px-2.5 sm:px-3 py-1.5 rounded-full bg-white text-[#111] text-xs font-extrabold flex items-center gap-2 hover:bg-slate-100 transition shadow-[2px_2px_0px_#111]">
      <span class="text-xs" title="${isCloud ? 'Đã kết nối Supabase Cloud' : 'Chế độ Local Offline'}">${isCloud ? '☁️' : '💻'}</span>
      <span class="w-6 h-6 rounded-full bg-amber-200 border border-[#111] flex items-center justify-center text-sm">${currentRpgUser.avatar || '🦁'}</span>
      <span class="font-display font-extrabold text-xs hidden md:inline truncate max-w-[90px]">${currentRpgUser.display_name}</span>
        ${currentRpgUser.equipped_title ? `<span class="hidden lg:inline text-[10px] font-mono-code font-extrabold bg-[#FFE787] text-[#111] px-1.5 py-0.5 rounded border border-[#111]">[${currentRpgUser.equipped_title}]</span>` : ""}
      <span class="font-mono-code text-[11px] bg-[#141414] text-white px-1.5 py-0.5 rounded font-bold">${cls.icon} Lv.${currentRpgUser.level}</span>
      <span class="font-mono-code text-xs font-bold text-amber-600 flex items-center gap-0.5">🔥 ${currentRpgUser.streak || 1}</span>
      <span class="font-mono-code text-xs font-bold text-yellow-600 flex items-center gap-0.5">🪙 ${currentRpgUser.gold || 0}</span>
    </button>
  `;
}

// 7. MODAL GAMIFICATION & SUPABASE HUB
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
  ['profile', 'auth', 'config', 'badges', 'shop'].forEach(t => {
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
  if (!currentRpgUser) return;

  const isCloud = currentRpgUser.is_cloud && currentSession;
  const cls = RPG_CLASSES[currentRpgUser.rpg_class] || RPG_CLASSES.warrior;
  const neededXp = getXpForLevel(currentRpgUser.level);
  const xpPct = Math.min(100, Math.round((currentRpgUser.xp / neededXp) * 100));
  const hpPct = Math.min(100, Math.round((currentRpgUser.hp / currentRpgUser.max_hp) * 100));
  const mpPct = Math.min(100, Math.round((currentRpgUser.mp / currentRpgUser.max_mp) * 100));

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
  const setWidth = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = val; };

  // TAB 1: PROFILE
  setTxt('accHeroAvatar', currentRpgUser.avatar || '🦁');
  setTxt('accHeroUsername', currentRpgUser.display_name);
  setTxt('accHeroClassBadge', `${cls.icon} ${cls.name}`);
  setTxt('accHeroLevel', `Level ${currentRpgUser.level}`);
  setHtml('accHeroCloudStatus', isCloud
    ? `<span class="bg-[#199A5E] text-white text-[10px] px-2 py-0.5 rounded font-mono-code font-bold">☁️ SUPABASE CLOUD SYNC: ${currentSession.user.email}</span>`
    : `<span class="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded font-mono-code font-bold">💻 CHẾ ĐỘ LOCAL (Bấm tab [03] để kết nối Cloud)</span>`);

  // Thanh HP / MP / XP
  setTxt('accHpText', `${currentRpgUser.hp}/${currentRpgUser.max_hp} HP`);
  setWidth('accHpBar', `${hpPct}%`);

  setTxt('accMpText', `${currentRpgUser.mp}/${currentRpgUser.max_mp} MP`);
  setWidth('accMpBar', `${mpPct}%`);

  setTxt('accHeroXpText', `${currentRpgUser.xp}/${neededXp} XP (${xpPct}%)`);
  setWidth('accHeroXpBar', `${xpPct}%`);

  // Thống kê
  setTxt('accStatStreak', `${currentRpgUser.streak || 1} Ngày 🔥`);
  setTxt('accStatCoins', `${currentRpgUser.gold || 0} 🪙`);
  setTxt('accStatGems', `${currentRpgUser.gems || 0} 💎`);
  setTxt('accStatDust', `${currentRpgUser.dust || 0} 🌌`);
  setTxt('accStatStones', `${currentRpgUser.enhance_stones || 0} 🪨`);
  setTxt('accStatMonsters', `${currentRpgUser.stats?.monsters_slain || 0} 👾`);
  const weaponItem = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(currentRpgUser.equipped?.weapon) : null;
  const armorItem = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(currentRpgUser.equipped?.armor) : null;
  setTxt('accStatWeapon', weaponItem ? weaponItem.name : (currentRpgUser.equipped_weapon || 'Tập Sự Kiếm'));
  setTxt('accStatArmor', armorItem ? armorItem.name : (currentRpgUser.equipped_armor || 'Áo Vải Tân Thủ'));

  // Input sửa tên
  const editName = document.getElementById('editAccUsernameInput');
  if (editName && !editName.value) editName.value = currentRpgUser.display_name;
  const editAvatar = document.getElementById('editAccAvatarSelect');
  if (editAvatar) editAvatar.value = currentRpgUser.avatar;

  // TAB 2: AUTH FORM
  const authStatusCard = document.getElementById('accAuthStatusCard');
  if (authStatusCard) {
    if (isCloud) {
      authStatusCard.innerHTML = `
        <div class="bg-emerald-50 border-2 border-[#111] p-4 flex items-center justify-between">
          <div>
            <div class="font-display font-extrabold text-sm text-[#111]">ĐANG ĐĂNG NHẬP CLOUD: ${currentSession.user.email}</div>
            <p class="text-xs text-slate-600 mt-1">Dữ liệu cấp độ và nhân vật của bạn được đồng bộ tự động lên Supabase.</p>
          </div>
          <button onclick="supabaseSignOut()" class="neo-btn px-3 py-1.5 bg-red-600 text-white text-xs font-bold">Đăng Xuất</button>
        </div>
      `;
    } else {
      authStatusCard.innerHTML = `
        <div class="bg-amber-50 border-2 border-[#111] p-3 text-xs text-amber-900 font-semibold">
          💡 Bạn đang ở chế độ khách (Local). Hãy đăng nhập để lưu trữ dữ liệu vĩnh viễn trên đám mây Supabase!
        </div>
      `;
    }
  }

  // TAB 3: CONFIG KEYS
  const urlInput = document.getElementById('cfgSbUrl');
  const keyInput = document.getElementById('cfgSbKey');
  if (urlInput) urlInput.value = localStorage.getItem(SUPABASE_URL_KEY) || '';
  if (keyInput) keyInput.value = localStorage.getItem(SUPABASE_KEY_KEY) || '';

  // TAB 4: BADGES
  const badgeGrid = document.getElementById('accBadgeGrid');
  if (badgeGrid) {
    const unlocked = new Set(currentRpgUser.badges || []);
    badgeGrid.innerHTML = Object.values(BADGES_CONFIG).map(b => {
      const isGot = unlocked.has(b.id);
      return `
        <div class="neo-box-sm p-3 ${isGot ? 'bg-[#FFFDF7] border-[#141414]' : 'bg-slate-100 opacity-60 border-slate-300'} flex items-start gap-3">
          <div class="text-3xl shrink-0 ${isGot ? '' : 'grayscale'}">${b.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h4 class="font-display font-extrabold text-xs uppercase ${isGot ? 'text-[#141414]' : 'text-slate-500'}">${b.name}</h4>
              ${isGot ? '<span class="text-[10px] font-mono-code font-bold bg-[#199A5E] text-white px-1 rounded">ĐÃ ĐẠT</span>' : '<span class="text-[10px] font-mono-code font-bold text-slate-400">CHƯA</span>'}
            </div>
            <p class="text-[11px] text-slate-600 mt-1">${b.desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // TAB 5: SHOP
  const shopGrid = document.getElementById('accShopGrid');
  if (shopGrid) {
    const inv = currentRpgUser.inventory || {};
    shopGrid.innerHTML = Object.values(SHOP_ITEMS).map(item => {
      const owned = inv[item.id] || 0;
      return `
        <div class="neo-box-sm p-3.5 bg-white flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-3xl">${item.icon}</span>
              <span class="font-mono-code text-[11px] font-bold bg-amber-100 border border-[#111] px-1.5 py-0.5 rounded">Có: ${owned}</span>
            </div>
            <h4 class="font-display font-extrabold text-xs uppercase">${item.name}</h4>
            <p class="text-[11px] text-slate-600 mt-1 leading-snug">${item.desc}</p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-1.5">
            <span class="font-mono-code text-xs font-extrabold text-yellow-700">${item.cost} 🪙</span>
            <div class="flex gap-1">
              ${owned > 0 && (item.id === 'health_potion' || item.id === 'mana_potion' || item.id === 'double_xp') ? `<button onclick="useShopItem('${item.id}')" class="neo-btn px-2 py-0.5 bg-[#199A5E] text-white text-[10px] font-bold">Dùng</button>` : ''}
              <button onclick="buyShopItem('${item.id}')" class="neo-btn px-2.5 py-0.5 bg-[#FFE787] text-[#111] text-[10px] font-bold hover:bg-amber-300">Mua</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// 8. TOAST NOTIFICATIONS & LEVEL UP MODAL
function showFloatingExpNotify(xpAmount, isDouble = false) {
  const div = document.createElement('div');
  div.className = 'fixed bottom-8 right-8 z-50 neo-box-sm bg-[#FFE787] text-[#111] px-4 py-2 font-display font-extrabold text-sm flex items-center gap-2 shadow-[4px_4px_0px_#111] animate-bounce';
  div.innerHTML = `<span>⚡</span> <span>+${xpAmount} EXP ${isDouble ? '(x2 Buff!)' : ''}</span>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2200);
}

function showToastAlert(msg) {
  const div = document.createElement('div');
  div.className = 'fixed top-20 right-4 z-50 neo-box-sm bg-[#141414] text-white px-4 py-2.5 font-bold text-xs flex items-center gap-2 shadow-[4px_4px_0px_#FFE787] max-w-sm';
  div.innerHTML = `<span>✨</span> <span>${msg}</span>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

function triggerLevelUpModal(newLevel) {
  if (typeof playQuizSound === 'function') playQuizSound('fanfare');
  showToastAlert(`🎊 THĂNG CẤP LÊN LEVEL ${newLevel}! HP/MP đã được hồi phục đầy và nhận thêm +50 🪙`);
}

function showBadgeUnlockedModal(badge) {
  if (!badge) return;
  if (typeof playQuizSound === 'function') playQuizSound('fanfare');
  showToastAlert(`🎖️ MỞ KHÓA HUY HIỆU: "${badge.name}" (${badge.icon})! Nhận +${badge.rewardXp || 0} EXP & +${badge.rewardGold || 0} 🪙`);
}

function handleUpdateProfileForm() {
  if (!currentRpgUser) return;
  const nameInput = document.getElementById('editAccUsernameInput');
  const avatarSelect = document.getElementById('editAccAvatarSelect');
  if (nameInput && nameInput.value.trim()) {
    currentRpgUser.display_name = nameInput.value.trim();
  }
  if (avatarSelect && avatarSelect.value) {
    currentRpgUser.avatar = avatarSelect.value;
  }
  saveCurrentRpgUser();
  renderAccountCenterModal();
  showToastAlert('✅ Đã cập nhật thông tin nhân vật thành công!');
}

if (typeof window !== 'undefined') {
  window.loadProfileFromSupabase = loadProfileFromSupabase;
  window.unpackSupabaseProfileRow = unpackSupabaseProfileRow;
  window.saveCurrentRpgUser = saveCurrentRpgUser;
}
if (typeof global !== 'undefined') {
  global.loadProfileFromSupabase = loadProfileFromSupabase;
  global.unpackSupabaseProfileRow = unpackSupabaseProfileRow;
  global.saveCurrentRpgUser = saveCurrentRpgUser;
}
