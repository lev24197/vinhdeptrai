// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - GAMIFICATION QUESTS & ACHIEVEMENTS SYSTEM
// Module 1: Nhiệm Vụ Hàng Ngày (Daily Quests), Thành Tựu Vĩnh Cửu & Danh Hiệu
// ============================================================================

const GamificationQuests = {
  // Kho mẫu nhiệm vụ hàng ngày phong phú
  DAILY_POOL: [
    { id: 'dungeon_clear', title: 'Học Hỏi Bền Bỉ', desc: 'Chinh phục thành công ít nhất 1 ải Hầm ngục', icon: '🏰', target: 1, reward: { gold: 40, exp: 50, gems: 1 } },
    { id: 'combo_streak_5', title: 'Bách Phát Bách Trúng', desc: 'Đạt chuỗi Combo 5 câu đúng liên tiếp', icon: '🔥', target: 5, reward: { gold: 35, exp: 40, dust: 25 } },
    { id: 'c1_c2_words_8', title: 'Chinh Phục Thượng Thừa', desc: 'Trả lời đúng 8 từ vựng cấp độ C1-C2 Nâng cao', icon: '⚡', target: 8, reward: { gold: 50, exp: 60, stones: 1 } },
    { id: 'slay_boss_1', title: 'Đồ Tể Trùm Cuối', desc: 'Hạ gục 1 Trùm Cuối độc nhất trong trận chiến đa hiệp', icon: '👑', target: 1, reward: { gold: 60, exp: 80, gems: 2 } },
    { id: 'forge_enhance_1', title: 'Rèn Luyện Khí Giới', desc: 'Cường hóa trang bị tại Lò Rèn ít nhất 1 lần', icon: '🔨', target: 1, reward: { gold: 30, exp: 30, stones: 1, dust: 20 } },
    { id: 'open_chest_1', title: 'Vận May Thần Tài', desc: 'Mở 1 Rương Báu May Mắn tại Tiệm Gacha', icon: '🎁', target: 1, reward: { gold: 30, exp: 35, dust: 30 } },
    { id: 'use_potion_2', title: 'Tiếp Sức Chiến Đấu', desc: 'Sử dụng 2 bình máu hoặc bình mana trong trận', icon: '🧪', target: 2, reward: { gold: 25, exp: 30, dust: 15 } }
  ],

  // Danh mục 20 Thành tựu vĩnh cửu & Danh hiệu mở khóa
  ACHIEVEMENTS: [
    // 1. Nhánh Học Thuật (Academic)
    { id: 'ach_first_blood', cat: 'academic', title: 'Chiến Tích Đầu Tiên', desc: 'Trả lời đúng từ vựng đầu tiên trong đấu trường', icon: '🎯', target: 1, reward: { gold: 30, exp: 40, title: 'Tân Binh Hầm Ngục' } },
    { id: 'ach_combo_10', cat: 'academic', title: 'Chuỗi Sấm Sét', desc: 'Đạt Combo 10 câu đúng liên tiếp trong một ải', icon: '⚡', target: 10, reward: { gold: 100, gems: 2, title: 'Bách Phát Bách Trúng' } },
    { id: 'ach_combo_20', cat: 'academic', title: 'Bất Khả Chiến Bại', desc: 'Đạt Combo 20 câu đúng liên tiếp không sai một nhát', icon: '🌟', target: 20, reward: { gold: 250, gems: 5, title: 'Thần Xạ Thủ' } },
    { id: 'ach_c1_c2_30', cat: 'academic', title: 'Học Giả Thâm Uyên', desc: 'Trả lời đúng 30 từ vựng C1-C2 Nâng cao', icon: '📖', target: 30, reward: { gold: 120, gems: 3, title: 'Bậc Thầy Ngôn Từ' } },
    { id: 'ach_c1_c2_100', cat: 'academic', title: 'Bác Học Ngôn Ngữ', desc: 'Trả lời đúng 100 từ vựng C1-C2 Nâng cao', icon: '📜', target: 100, reward: { gold: 350, gems: 8, title: 'Đại Học Sĩ' } },

    // 2. Nhánh Hầm Ngục & Diệt Boss (Combat)
    { id: 'ach_dungeon_3', cat: 'combat', title: 'Kẻ Thám Hiểm', desc: 'Chinh phục thành công 3 ải hầm ngục', icon: '🏕️', target: 3, reward: { gold: 80, exp: 80, title: 'Kẻ Thám Hiểm' } },
    { id: 'ach_dungeon_15', cat: 'combat', title: 'Dũng Sĩ Hầm Ngục', desc: 'Chinh phục thành công 15 ải hầm ngục', icon: '🛡️', target: 15, reward: { gold: 250, gems: 5, title: 'Hiệp Sĩ Quả Cảm' } },
    { id: 'ach_dungeon_50', cat: 'combat', title: 'Chinh Phục Thượng Cổ', desc: 'Chinh phục thành công 50 ải hầm ngục', icon: '🏆', target: 50, reward: { gold: 600, gems: 15, title: 'Chúa Tể Hầm Ngục' } },
    { id: 'ach_boss_1', cat: 'combat', title: 'Trảm Trùm Cuối', desc: 'Tiêu diệt 1 Trùm Cuối độc nhất của chủ đề', icon: '👑', target: 1, reward: { gold: 60, gems: 2, title: 'Kẻ Diệt Trùm' } },
    { id: 'ach_boss_10', cat: 'combat', title: 'Đại Đồ Tể', desc: 'Tiêu diệt 10 Trùm Cuối độc nhất khác nhau', icon: '💀', target: 10, reward: { gold: 300, gems: 6, title: 'Đại Đồ Tể' } },
    { id: 'ach_boss_30', cat: 'combat', title: 'Bá Chủ Thống Trị', desc: 'Tiêu diệt 30 Trùm Cuối độc nhất', icon: '🐉', target: 30, reward: { gold: 800, gems: 20, title: 'Bá Vương Bất Diệt' } },

    // 3. Nhánh Lò Rèn & Trang Bị (Forge)
    { id: 'ach_enhance_3', cat: 'forge', title: 'Thợ Rèn Tập Sự', desc: 'Cường hóa 1 trang bị lên cấp độ +3', icon: '🔨', target: 3, reward: { gold: 60, dust: 30, title: 'Thợ Rèn Tập Sự' } },
    { id: 'ach_enhance_6', cat: 'forge', title: 'Bậc Thầy Cương Hóa', desc: 'Cường hóa 1 trang bị lên cấp độ +6', icon: '⚒️', target: 6, reward: { gold: 180, stones: 2, title: 'Thần Rèn Cổ Tộc' } },
    { id: 'ach_enhance_10', cat: 'forge', title: 'Tuyệt Phẩm Thần Khí', desc: 'Cường hóa 1 trang bị lên cảnh giới cực hạn +10', icon: '✨', target: 10, reward: { gold: 500, gems: 10, title: 'Huyền Thoại Lò Rèn' } },
    { id: 'ach_gacha_epic', cat: 'forge', title: 'Khí Vận Sử Thi', desc: 'Mở được trang bị phẩm chất Sử Thi (Epic) từ Rương Báu', icon: '🟣', target: 1, reward: { gold: 120, gems: 3, title: 'Kẻ Được Chọn' } },
    { id: 'ach_gacha_legend', cat: 'forge', title: 'Đứa Con Của Thần', desc: 'Mở được trang bị phẩm chất Huyền Thoại (Legendary)', icon: '🟡', target: 1, reward: { gold: 350, gems: 10, title: 'Đứa Con Thần Gió' } },

    // 4. Nhánh Cấp Độ & Tài Phú (Wealth)
    { id: 'ach_level_5', cat: 'wealth', title: 'Dấu Chân Trưởng Thành', desc: 'Đạt cấp độ Hiệp sĩ Level 5', icon: '⭐', target: 5, reward: { gold: 80, exp: 50, title: 'Tập Sự Dày Dạn' } },
    { id: 'ach_level_15', cat: 'wealth', title: 'Bậc Thầy Phiêu Lưu', desc: 'Đạt cấp độ Hiệp sĩ Level 15', icon: '🌟', target: 15, reward: { gold: 250, gems: 5, title: 'Tông Sư' } },
    { id: 'ach_gold_1000', cat: 'wealth', title: 'Phú Hộ Một Vùng', desc: 'Tích lũy đạt 1,000 Vàng trong túi', icon: '🪙', target: 1000, reward: { gold: 80, gems: 2, title: 'Phú Hộ' } },
    { id: 'ach_gold_5000', cat: 'wealth', title: 'Triệu Phú Hoàng Kim', desc: 'Tích lũy đạt 5,000 Vàng trong túi', icon: '💰', target: 5000, reward: { gold: 300, gems: 10, title: 'Triệu Phú Hoàng Kim' } }
  ],

  // Khởi tạo & Kiểm tra làm mới nhiệm vụ hàng ngày
  ensureInitialized: function(user) {
    if (!user) return;

    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Kiểm tra Daily Quests
    if (!user.daily_quests || user.daily_quests.date !== todayStr) {
      // Chọn ngẫu nhiên 4 nhiệm vụ độc nhất từ DAILY_POOL
      const shuffled = [...this.DAILY_POOL].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4).map(template => ({
        id: template.id,
        current: 0,
        target: template.target,
        completed: false,
        claimed: false
      }));

      user.daily_quests = {
        date: todayStr,
        claimed_chest: false,
        tasks: selected
      };
    }

    // 2. Kiểm tra Achievements
    if (!user.achievements) {
      user.achievements = {
        progress: {},
        unlocked_ids: [],
        claimed_ids: [],
        equipped_title: ''
      };
    }
    if (!user.achievements.progress) user.achievements.progress = {};
    if (!user.achievements.unlocked_ids) user.achievements.unlocked_ids = [];
    if (!user.achievements.claimed_ids) user.achievements.claimed_ids = [];
  },

  // Hàm dùng chung để cập nhật tiến độ ở mọi hành động trong game
  trackProgress: function(actionType, value = 1, metadata = {}) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    let stateChanged = false;

    // A. Cập nhật Daily Quests
    if (user.daily_quests && user.daily_quests.tasks) {
      user.daily_quests.tasks.forEach(task => {
        if (task.claimed) return;

        let matched = false;
        if (actionType === 'dungeon_clear' && task.id === 'dungeon_clear') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        } else if (actionType === 'combo_streak' && task.id === 'combo_streak_5') {
          if (value >= task.target) task.current = task.target;
          matched = true;
        } else if (actionType === 'c1_c2_word' && task.id === 'c1_c2_words_8') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        } else if (actionType === 'slay_boss' && task.id === 'slay_boss_1') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        } else if (actionType === 'forge_enhance' && task.id === 'forge_enhance_1') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        } else if (actionType === 'open_chest' && task.id === 'open_chest_1') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        } else if (actionType === 'use_potion' && task.id === 'use_potion_2') {
          task.current = Math.min(task.target, task.current + value);
          matched = true;
        }

        if (matched) {
          stateChanged = true;
          if (task.current >= task.target && !task.completed) {
            task.completed = true;
            this.showToastNotification(`🎉 Hoàn thành Nhiệm vụ: "${this.getDailyTemplate(task.id)?.title}"!`, '#10B981');
            if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();
          }
        }
      });
    }

    // B. Cập nhật Thành tựu Vĩnh Cửu (Achievements)
    const achs = this.ACHIEVEMENTS;
    achs.forEach(ach => {
      if (user.achievements.claimed_ids.includes(ach.id)) return;

      let cur = user.achievements.progress[ach.id] || 0;
      let updated = false;

      if (actionType === 'word_correct' && ach.id === 'ach_first_blood') {
        cur = Math.min(ach.target, cur + value);
        updated = true;
      } else if (actionType === 'combo_streak') {
        if (ach.id === 'ach_combo_10' || ach.id === 'ach_combo_20') {
          if (value > cur) { cur = Math.min(ach.target, value); updated = true; }
        }
      } else if (actionType === 'c1_c2_word') {
        if (ach.id === 'ach_c1_c2_30' || ach.id === 'ach_c1_c2_100') {
          cur = Math.min(ach.target, cur + value);
          updated = true;
        }
      } else if (actionType === 'dungeon_clear') {
        if (ach.id === 'ach_dungeon_3' || ach.id === 'ach_dungeon_15' || ach.id === 'ach_dungeon_50') {
          cur = Math.min(ach.target, cur + value);
          updated = true;
        }
      } else if (actionType === 'slay_boss') {
        if (ach.id === 'ach_boss_1' || ach.id === 'ach_boss_10' || ach.id === 'ach_boss_30') {
          cur = Math.min(ach.target, cur + value);
          updated = true;
        }
      } else if (actionType === 'enhance_level') {
        const enhLvl = metadata.level || value;
        if (ach.id === 'ach_enhance_3' && enhLvl >= 3) { cur = 3; updated = true; }
        if (ach.id === 'ach_enhance_6' && enhLvl >= 6) { cur = 6; updated = true; }
        if (ach.id === 'ach_enhance_10' && enhLvl >= 10) { cur = 10; updated = true; }
      } else if (actionType === 'gacha_drop') {
        const tier = metadata.tier;
        if (ach.id === 'ach_gacha_epic' && (tier === 'epic' || tier === 'legendary')) { cur = 1; updated = true; }
        if (ach.id === 'ach_gacha_legend' && tier === 'legendary') { cur = 1; updated = true; }
      } else if (actionType === 'level_up') {
        const lvl = user.level || 1;
        if (ach.id === 'ach_level_5' && lvl >= 5) { cur = 5; updated = true; }
        if (ach.id === 'ach_level_15' && lvl >= 15) { cur = 15; updated = true; }
      } else if (actionType === 'gold_balance') {
        const g = user.gold || 0;
        if (ach.id === 'ach_gold_1000' && g >= 1000) { cur = 1000; updated = true; }
        if (ach.id === 'ach_gold_5000' && g >= 5000) { cur = 5000; updated = true; }
      }

      if (updated) {
        user.achievements.progress[ach.id] = cur;
        stateChanged = true;
        if (cur >= ach.target && !user.achievements.unlocked_ids.includes(ach.id)) {
          user.achievements.unlocked_ids.push(ach.id);
          this.showToastNotification(`🏆 Mở khóa Thành Tựu: "${ach.title}"! Nhận danh hiệu: [${ach.reward.title}]`, '#F59E0B');
          if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();
        }
      }
    });

    if (stateChanged && typeof saveCurrentRpgUser === 'function') {
      saveCurrentRpgUser();
      this.updateLobbyBadge();
    }
  },

  getDailyTemplate: function(id) {
    return this.DAILY_POOL.find(t => t.id === id) || { title: 'Nhiệm Vụ Ngày', icon: '📜', target: 1, reward: { gold: 30 } };
  },

  // Nhận thưởng 1 nhiệm vụ ngày
  claimDailyQuest: function(questId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user?.daily_quests?.tasks) return;

    const task = user.daily_quests.tasks.find(t => t.id === questId);
    if (!task || !task.completed || task.claimed) return;

    task.claimed = true;
    const tpl = this.getDailyTemplate(questId);
    const rew = tpl.reward || {};

    if (rew.gold) user.gold = (user.gold || 0) + rew.gold;
    if (rew.gems) user.gems = (user.gems || 0) + rew.gems;
    if (rew.dust) user.magic_dust = (user.magic_dust || 0) + rew.dust;
    if (rew.stones) user.enhance_stones = (user.enhance_stones || 0) + rew.stones;
    if (rew.exp && typeof addXP === 'function') addXP(rew.exp, 'Nhiệm Vụ Ngày');

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    this.showToastNotification(`🎁 Đã nhận: +${rew.gold || 0} Vàng, +${rew.gems || 0} Gems, +${rew.exp || 0} EXP!`, '#10B981');
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playCoin === 'function') RetroAudio.playCoin();

    this.renderQuestsModal();
    this.updateLobbyBadge();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Nhận Rương Báu Hoàng Kim khi hoàn thành 4/4 nhiệm vụ ngày
  claimDailyChest: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user?.daily_quests?.tasks) return;

    const allDone = user.daily_quests.tasks.every(t => t.completed);
    if (!allDone || user.daily_quests.claimed_chest) return;

    user.daily_quests.claimed_chest = true;
    user.gold = (user.gold || 0) + 120;
    user.gems = (user.gems || 0) + 5;
    user.enhance_stones = (user.enhance_stones || 0) + 2;
    user.magic_dust = (user.magic_dust || 0) + 80;
    if (typeof addXP === 'function') addXP(150, 'Rương Báu Ngày Hoàn Hảo');

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    this.showToastNotification(`🌟 MỞ RƯƠNG HOÀNG KIM: +120 Vàng, +5 Gems, +2 Đá Cường Hóa, +80 Bụi Ma Pháp, +150 EXP!`, '#FFE787');
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    this.renderQuestsModal();
    this.updateLobbyBadge();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Nhận thưởng Thành tựu vĩnh cửu
  claimAchievement: function(achId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user?.achievements) return;

    const ach = this.ACHIEVEMENTS.find(a => a.id === achId);
    if (!ach) return;

    if (!user.achievements.unlocked_ids.includes(achId) || user.achievements.claimed_ids.includes(achId)) return;

    user.achievements.claimed_ids.push(achId);
    const rew = ach.reward || {};

    if (rew.gold) user.gold = (user.gold || 0) + rew.gold;
    if (rew.gems) user.gems = (user.gems || 0) + rew.gems;
    if (rew.dust) user.magic_dust = (user.magic_dust || 0) + rew.dust;
    if (rew.stones) user.enhance_stones = (user.enhance_stones || 0) + rew.stones;

    // Tự động trang bị danh hiệu nếu chưa có
    if (rew.title && !user.achievements.equipped_title) {
      user.achievements.equipped_title = rew.title;
    }

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    this.showToastNotification(`🏆 Đã nhận thành tựu "${ach.title}": +${rew.gold || 0} 🪙, +${rew.gems || 0} 💎! Danh hiệu: [${rew.title}]`, '#F59E0B');
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    this.renderQuestsModal();
    this.updateLobbyBadge();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Đổi danh hiệu hiển thị trên đầu nhân vật
  equipTitle: function(title) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user?.achievements) return;

    user.achievements.equipped_title = title;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    this.showToastNotification(`🎖️ Đã trang bị danh hiệu: [${title}]!`, '#38BDF8');

    this.renderQuestsModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Cập nhật số thông báo chưa nhận thưởng trên nút Lobby
  updateLobbyBadge: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;

    let claimableCount = 0;
    if (user.daily_quests?.tasks) {
      claimableCount += user.daily_quests.tasks.filter(t => t.completed && !t.claimed).length;
      if (user.daily_quests.tasks.every(t => t.completed) && !user.daily_quests.claimed_chest) {
        claimableCount += 1;
      }
    }
    if (user.achievements?.unlocked_ids) {
      const unclaimedAch = user.achievements.unlocked_ids.filter(id => !user.achievements.claimed_ids.includes(id));
      claimableCount += unclaimedAch.length;
    }

    const badgeEl = document.getElementById('lobbyQuestsAlertBadge');
    if (badgeEl) {
      if (claimableCount > 0) {
        badgeEl.innerText = claimableCount;
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
  },

  // Hiển thị thông báo Toast góc màn hình
  showToastNotification: function(msg, bgColor = '#10B981') {
    let container = document.getElementById('rpgToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rpgToastContainer';
      container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'neo-box px-3.5 py-2 text-xs font-display font-extrabold text-[#111] shadow-[3px_3px_0px_#111] transition-all duration-300 transform translate-y-3 opacity-0';
    toast.style.backgroundColor = bgColor;
    toast.innerText = msg;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  },

  // ==================== RENDER GIAO DIỆN MODAL NHIỆM VỤ & THÀNH TỰU ====================
  activeTab: 'daily',

  openModal: function(tab = 'daily') {
    this.activeTab = tab;
    let modal = document.getElementById('rpgQuestsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rpgQuestsModal';
      modal.className = 'fixed inset-0 bg-black/85 hidden items-center justify-center p-2 sm:p-4 z-50';
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderQuestsModal();
  },

  closeModal: function() {
    const modal = document.getElementById('rpgQuestsModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  switchTab: function(tab) {
    this.activeTab = tab;
    this.renderQuestsModal();
  },

  renderQuestsModal: function() {
    const modal = document.getElementById('rpgQuestsModal');
    if (!modal) return;

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    const isDaily = (this.activeTab === 'daily');

    let contentHtml = '';

    if (isDaily) {
      // 1. GIAO DIỆN NHIỆM VỤ HÀNG NGÀY
      const tasks = user?.daily_quests?.tasks || [];
      const completedCount = tasks.filter(t => t.completed).length;
      const allDone = tasks.length > 0 && completedCount === tasks.length;
      const chestClaimed = !!user?.daily_quests?.claimed_chest;

      contentHtml = `
        <!-- Thanh tiến độ Rương Báu Ngày -->
        <div class="bg-[#121424] border-2 border-[#111] p-3 rounded mb-3 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#FFE787]">
          <div class="flex items-center gap-3">
            <span class="text-3xl ${allDone ? 'animate-bounce' : ''}">${chestClaimed ? '✨' : '🎁'}</span>
            <div>
              <div class="font-display font-extrabold text-sm text-[#FFE787] uppercase flex items-center gap-2">
                <span>RƯƠNG BÁU HOÀNG KIM NGÀY</span>
                <span class="text-xs font-mono-code font-bold text-slate-300">(${completedCount}/${tasks.length})</span>
              </div>
              <div class="text-[11px] text-slate-300">Hoàn thành đủ 4 nhiệm vụ trong ngày để mở rương thưởng lớn: +120 Vàng, +5 Gems, +2 Đá, +80 Bụi!</div>
            </div>
          </div>
          <div>
            ${chestClaimed ? `
              <span class="px-3 py-1.5 bg-slate-800 text-slate-400 font-mono-code text-xs font-bold border border-slate-700 rounded">ĐÃ NHẬN</span>
            ` : allDone ? `
              <button onclick="GamificationQuests.claimDailyChest()" class="neo-btn px-4 py-2 bg-[#F59E0B] hover:bg-amber-400 text-[#111] font-display font-extrabold text-xs uppercase animate-pulse">
                👑 MỞ RƯƠNG
              </button>
            ` : `
              <span class="px-3 py-1.5 bg-[#1B1E32] text-amber-300 font-mono-code text-xs font-bold border border-amber-500/40 rounded">${completedCount}/4 ĐẠT</span>
            `}
          </div>
        </div>

        <!-- Danh sách 4 Nhiệm vụ ngày -->
        <div class="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          ${tasks.map(t => {
            const tpl = this.getDailyTemplate(t.id);
            const pct = Math.min(100, Math.round((t.current / t.target) * 100));
            const isDone = t.completed;
            const isClaimed = t.claimed;

            return `
              <div class="bg-[#10121F] border-2 border-slate-800 p-2.5 rounded flex items-center justify-between gap-3 hover:border-slate-700 transition">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-2xl shrink-0 p-1 bg-[#181B2E] border border-slate-700 rounded">${tpl.icon}</span>
                  <div class="min-w-0 truncate">
                    <div class="font-display font-extrabold text-xs text-white uppercase flex items-center gap-2">
                      <span class="truncate">${tpl.title}</span>
                      ${isClaimed ? '<span class="text-[9px] font-mono-code text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">ĐÃ NHẬN</span>' : ''}
                    </div>
                    <div class="text-[11px] text-slate-400 truncate">${tpl.desc}</div>
                    
                    <!-- Thanh tiến trình -->
                    <div class="w-48 sm:w-64 h-2 bg-slate-800 rounded overflow-hidden mt-1.5 border border-slate-700">
                      <div class="h-full ${isDone ? 'bg-[#10B981]' : 'bg-[#FF9F1C]'} transition-all" style="width: ${pct}%"></div>
                    </div>
                  </div>
                </div>

                <!-- Cột Thưởng & Nút Nhận -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="text-[11px] font-mono-code text-right text-slate-300 hidden sm:block">
                    <div>+${tpl.reward.gold || 0} 🪙 ${tpl.reward.gems ? `+${tpl.reward.gems} 💎` : ''}</div>
                    <div class="text-emerald-400 font-bold">${t.current}/${t.target}</div>
                  </div>
                  <div>
                    ${isClaimed ? `
                      <button disabled class="px-2.5 py-1 text-[11px] font-mono-code font-bold bg-slate-800 text-slate-500 rounded border border-slate-700">Xong</button>
                    ` : isDone ? `
                      <button onclick="GamificationQuests.claimDailyQuest('${t.id}')" class="neo-btn px-3 py-1 bg-[#10B981] hover:bg-emerald-600 text-white font-display font-extrabold text-xs uppercase">
                        Nhận 🎁
                      </button>
                    ` : `
                      <span class="text-xs font-mono-code font-bold text-amber-400 px-2 py-1 bg-[#181B2E] border border-slate-700 rounded">${t.current}/${t.target}</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // 2. GIAO DIỆN THÀNH TỰU VĨNH CỬU & DANH HIỆU
      const achs = this.ACHIEVEMENTS;
      const claimedCount = user?.achievements?.claimed_ids?.length || 0;
      const equippedTitle = user?.achievements?.equipped_title || 'Tân Binh';

      contentHtml = `
        <!-- Danh hiệu đang đeo -->
        <div class="bg-[#181B2E] border border-amber-500/50 p-2.5 rounded mb-3 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="text-amber-400 font-extrabold">🎖️ DANH HIỆU ĐANG MANG:</span>
            <span class="px-2 py-0.5 bg-[#FFE787] text-[#111] font-display font-extrabold rounded text-xs shadow-sm">[${equippedTitle}]</span>
          </div>
          <span class="font-mono-code text-slate-300 font-bold">${claimedCount}/${achs.length} Thành Tựu Hoàn Thành</span>
        </div>

        <!-- Danh sách 20 Thành tựu -->
        <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          ${achs.map(ach => {
            const cur = user?.achievements?.progress?.[ach.id] || 0;
            const isUnlocked = user?.achievements?.unlocked_ids?.includes(ach.id);
            const isClaimed = user?.achievements?.claimed_ids?.includes(ach.id);
            const pct = Math.min(100, Math.round((cur / ach.target) * 100));

            return `
              <div class="bg-[#10121F] border-2 ${isUnlocked ? 'border-amber-500/60' : 'border-slate-800'} p-2.5 rounded flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-2xl shrink-0 p-1 bg-[#181B2E] border border-slate-700 rounded">${ach.icon}</span>
                  <div class="min-w-0 truncate">
                    <div class="font-display font-extrabold text-xs text-white uppercase flex items-center gap-2">
                      <span class="truncate">${ach.title}</span>
                      ${ach.reward.title ? `<span class="text-[10px] font-mono-code text-amber-300 font-bold">[${ach.reward.title}]</span>` : ''}
                    </div>
                    <div class="text-[11px] text-slate-400 truncate">${ach.desc}</div>
                    
                    <div class="w-48 sm:w-64 h-2 bg-slate-800 rounded overflow-hidden mt-1.5 border border-slate-700">
                      <div class="h-full ${isUnlocked ? 'bg-[#F59E0B]' : 'bg-slate-600'} transition-all" style="width: ${pct}%"></div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <div class="text-[11px] font-mono-code text-right text-slate-300 hidden sm:block">
                    <div>+${ach.reward.gold || 0} 🪙 ${ach.reward.gems ? `+${ach.reward.gems} 💎` : ''}</div>
                    <div class="text-amber-400 font-bold">${cur}/${ach.target}</div>
                  </div>
                  <div>
                    ${isClaimed ? `
                      ${ach.reward.title && equippedTitle !== ach.reward.title ? `
                        <button onclick="GamificationQuests.equipTitle('${ach.reward.title}')" class="neo-btn px-2.5 py-1 text-[11px] font-mono-code font-bold bg-[#1E293B] hover:bg-slate-700 text-sky-300 border border-sky-600 rounded">
                          Đeo hiệu
                        </button>
                      ` : `
                        <span class="px-2.5 py-1 text-[11px] font-mono-code font-bold bg-slate-800 text-slate-500 rounded border border-slate-700">Đã nhận</span>
                      `}
                    ` : isUnlocked ? `
                      <button onclick="GamificationQuests.claimAchievement('${ach.id}')" class="neo-btn px-3 py-1 bg-[#F59E0B] hover:bg-amber-400 text-[#111] font-display font-extrabold text-xs uppercase">
                        Nhận 🏆
                      </button>
                    ` : `
                      <span class="text-xs font-mono-code font-bold text-slate-500 px-2 py-1 bg-[#181B2E] border border-slate-700 rounded">${cur}/${ach.target}</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-2xl w-full p-4 sm:p-5 space-y-3 border-3 border-[#111] shadow-[6px_6px_0px_#FFE787] flex flex-col justify-between max-h-[90vh]">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📜</span>
            <h3 class="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">SỔ TAY CHIẾN THẦN: NHIỆM VỤ & THÀNH TỰU</h3>
          </div>
          <button onclick="GamificationQuests.closeModal()" class="neo-btn w-8 h-8 bg-white text-[#111] font-bold flex items-center justify-center text-sm hover:bg-red-500 hover:text-white">✕</button>
        </div>

        <!-- 2 Tab Chuyển Đổi: Nhiệm Vụ Hàng Ngày vs Thành Tựu -->
        <div class="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2">
          <button onclick="GamificationQuests.switchTab('daily')" class="py-2 text-xs font-display font-extrabold uppercase rounded border-2 transition ${isDaily ? 'bg-[#FFE787] text-[#111] border-[#111] shadow-sm' : 'bg-[#181B2E] text-slate-400 border-slate-700 hover:text-white'}">
            📅 Nhiệm Vụ Hàng Ngày
          </button>
          <button onclick="GamificationQuests.switchTab('milestones')" class="py-2 text-xs font-display font-extrabold uppercase rounded border-2 transition ${!isDaily ? 'bg-[#FFE787] text-[#111] border-[#111] shadow-sm' : 'bg-[#181B2E] text-slate-400 border-slate-700 hover:text-white'}">
            🏆 Thành Tựu & Danh Hiệu
          </button>
        </div>

        <!-- Nội dung chính -->
        <div class="flex-1 overflow-hidden">
          ${contentHtml}
        </div>

        <!-- Footer Modal -->
        <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span class="font-mono-code font-bold">Tự động làm mới nhiệm vụ lúc 00:00 mỗi ngày</span>
          <button onclick="GamificationQuests.closeModal()" class="neo-btn px-4 py-1.5 bg-white text-[#111] font-extrabold">ĐÓNG</button>
        </div>
      </div>
    `;
  }
};

// Xuất global cho toàn bộ trang
if (typeof window !== 'undefined') {
  window.GamificationQuests = GamificationQuests;
}
