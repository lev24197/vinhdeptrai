// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - ENDLESS TOWER OF BABEL & BOSS RUSH
// Module 4: Tháp Thách Thức Vô Tận & Đấu Trường Boss Sinh Tồn
// ============================================================================

const GamificationTower = {
  activeMode: null, // 'tower' | 'boss_rush'
  currentFloor: 1,
  towerBoons: [], // Danh sách bùa chú Roguelike đang kích hoạt trong lượt leo tháp này

  // ==================== 10+ BÙA CHÚ CỔ VẬT ROGUELIKE (BOONS POOL) ====================
  BOONS_POOL: [
    { id: 'boon_wise_lens', title: 'Thấu Kính Minh Triết', icon: '🔍', desc: 'Vĩnh viễn loại bỏ 1 đáp án sai trong tất cả các câu hỏi còn lại của lượt này!', color: '#38BDF8' },
    { id: 'boon_giant_heart', title: 'Trái Tim Khổng Lồ', icon: '💖', desc: 'Lập tức hồi phục đầy 100% HP và tăng thêm +40 Máu tối đa trong suốt ải!', color: '#EF4444' },
    { id: 'boon_soul_scythe', title: 'Lưỡi Hái Hút Hồn', icon: '⚔️', desc: 'Mỗi khi một quái vật bị tiêu diệt, Hiệp Sĩ được hút ngay +15 HP hồi phục!', color: '#10B981' },
    { id: 'boon_berserk', title: 'Cuồng Nộ Chiến Trận', icon: '🔥', desc: 'Tăng cực đại +40% Sát thương (ATK) của Hiệp Sĩ cho mọi đòn đánh!', color: '#F59E0B' },
    { id: 'boon_mana_surge', title: 'Suối Nguồn Ma Pháp', icon: '🔮', desc: 'Mỗi câu trả lời đúng tự động hồi phục thêm +10 MP năng lượng!', color: '#8B5CF6' },
    { id: 'boon_iron_skin', title: 'Kim Cang Bất Hoại', icon: '🛡️', desc: 'Tăng thêm +25 Giáp phòng thủ (DEF), giảm mạnh sát thương từ đòn đánh của quái!', color: '#94A3B8' },
    { id: 'boon_crit_frenzy', title: 'Bão Táp Bạo Kích', icon: '⚡', desc: 'Tăng thêm +25% Tỉ lệ Bạo kích (Crit) và sát thương bạo kích nhân gấp 2.5 lần!', color: '#FACC15' },
    { id: 'boon_midas_touch', title: 'Bàn Tay Midas', icon: '🪙', desc: 'Gấp đôi số Vàng thưởng rơi ra khi kết thúc mỗi tầng tháp!', color: '#EAB308' },
    { id: 'boon_phoenix_feather', title: 'Lông Vũ Phượng Hoàng', icon: '🪶', desc: 'Khi nhận sát thương chí tử, lập tức hồi sinh với 50% Máu tối đa một lần duy nhất!', color: '#F97316' },
    { id: 'boon_vampiric_aura', title: 'Huyết Sắc Hộ Thể', icon: '🩸', desc: 'Mọi đòn đánh chính xác hút 15% lượng sát thương gây ra chuyển hóa thành máu!', color: '#E11D48' }
  ],

  // ==================== 10+ ĐẶC KỸ / BIẾN THỂ TRÙM THÁP (FLOOR BOSS MODIFIERS) ====================
  FLOOR_MODIFIERS: [
    {
      id: 'iron_reflect',
      name: 'Phản Đòn Thép',
      icon: '🛡️',
      color: '#94A3B8',
      desc: 'Giáp thép phản xạ: phản lại 20% sát thương nhận vào về phía Hiệp Sĩ.',
      reflectPercent: 0.20
    },
    {
      id: 'flame_aura',
      name: 'Hào Quang Lửa',
      icon: '🔥',
      color: '#EF4444',
      desc: 'Nhiệt độ dung nham: thiêu đốt Hiệp Sĩ 10 HP mỗi lượt.',
      burnDmgPerTurn: 10
    },
    {
      id: 'divine_shield',
      name: 'Khiên Hộ Thể',
      icon: '✨',
      color: '#FACC15',
      desc: 'Hộ thể cổ đại: tạo lớp khiên hấp thụ 100 sát thương đầu tiên của trận đấu.',
      shieldAbsorb: 100
    },
    {
      id: 'vampiric_bite',
      name: 'Hút Huyết',
      icon: '🩸',
      color: '#DC2626',
      desc: 'Khát máu tột cùng: quái vật hồi phục 25% lượng sát thương đánh trúng Hiệp Sĩ.',
      vampHealPercent: 0.25
    },
    {
      id: 'speed_blitz',
      name: 'Cuồng Tốc',
      icon: '⚡',
      color: '#38BDF8',
      desc: 'Tốc độ xé gió: rút ngắn thời gian trả lời câu hỏi của người chơi đi 2 giây.',
      timerReductionSec: 2
    },
    {
      id: 'armor_pierce',
      name: 'Xuyên Giáp',
      icon: '🗡️',
      color: '#F97316',
      desc: 'Đòn đánh sắc lẹm: đòn đánh của Boss bỏ qua 30% giáp phòng thủ của người chơi.',
      ignoreDefPercent: 0.30
    },
    {
      id: 'toxic_cloud',
      name: 'Mây Độc',
      icon: '🧪',
      color: '#10B981',
      desc: 'Mây độc bao phủ: giảm 50% hiệu quả hồi máu từ bình máu và kỹ năng.',
      healingReductionPercent: 0.50
    },
    {
      id: 'storm_surge',
      name: 'Bão Điện',
      icon: '🌩️',
      color: '#818CF8',
      desc: 'Lôi điện gầm thét: 25% cơ hội làm tê liệt khiến Hiệp Sĩ bị mất lượt hành động.',
      paralyzeChance: 0.25
    },
    {
      id: 'frost_chill',
      name: 'Hàn Băng',
      icon: '❄️',
      color: '#06B6D4',
      desc: 'Băng giá buốt giá: làm chậm nhịp độ và cản trở việc tích tụ combo streak.',
      comboSlowdown: true
    },
    {
      id: 'cosmic_surge',
      name: 'Hư Không Bùng Nổ',
      icon: '🌌',
      color: '#A855F7',
      desc: 'Sức mạnh vũ trụ vô tận: sức tấn công (ATK) của Boss tự tăng thêm 10% sau mỗi lượt.',
      atkGainPerTurnPercent: 0.10
    }
  ],

  // Trạng thái vận hành chế độ Boss Rush (5 Boss Sinh Tồn Liên Hoàn)
  bossRushState: {
    currentBossIdx: 1,
    totalBosses: 5,
    bossesList: [],
    preservedHeroHp: null
  },

  // Khởi tạo hồ sơ kỷ lục Tháp
  ensureInitialized: function(user) {
    if (!user) return;
    if (!user.tower_records) {
      user.tower_records = {
        max_floor: 1,
        best_streak: 0,
        boss_rush_wins: 0,
        claimed_floor_rewards: []
      };
    }
  },

  // Lấy Modifier theo tầng tháp (50+ tầng)
  getFloorModifier: function(floor) {
    const f = Math.max(1, Number(floor) || 1);
    // Luân chuyển đều qua 10 modifier theo chỉ số tầng
    const idx = (f - 1) % this.FLOOR_MODIFIERS.length;
    return this.FLOOR_MODIFIERS[idx];
  },

  // Bắt đầu chế độ Tháp Babel Vô Tận (Endless Tower)
  startEndlessTower: function(startFloor = 1) {
    this.activeMode = 'tower';
    this.currentFloor = Math.max(1, Number(startFloor) || 1);
    this.towerBoons = [];

    this.closeModal();

    if (typeof showCombatView === 'function') showCombatView();

    const modifier = this.getFloorModifier(this.currentFloor);
    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) {
      badge.innerText = `🗼 THÁP BABEL - TẦNG ${this.currentFloor} (${modifier.icon} ${modifier.name})`;
    }

    this.loadTowerQuestions(this.currentFloor);
  },

  // Bắt đầu chế độ Boss Rush (5 Boss Sinh Tồn Liên Hoàn)
  startBossRush: function() {
    this.activeMode = 'boss_rush';
    this.bossRushState.currentBossIdx = 1;
    this.bossRushState.preservedHeroHp = null;
    this.towerBoons = [];

    this.closeModal();

    if (typeof showCombatView === 'function') showCombatView();

    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) badge.innerText = `👑 BOSS RUSH - TRẬN 1/5`;

    this.loadBossRushQuestions();
  },

  // Nạp câu hỏi cho Tháp Babel
  loadTowerQuestions: async function(floor) {
    const all = (typeof allTopics !== 'undefined' && Array.isArray(allTopics)) ? allTopics : [];
    const completed = all.filter(t => t.status === 'completed');
    const sourceTopics = completed.length > 0 ? completed : all;

    if (sourceTopics.length === 0) {
      if (typeof alert === 'function') alert('Đang chuẩn bị từ vựng Tháp Babel...');
      return;
    }

    const shuffled = [...sourceTopics].sort(() => 0.5 - Math.random());
    const selectedStts = shuffled.slice(0, 3).map(t => t.stt);

    if (typeof startDungeonSession === 'function' || typeof startQuizSession === 'function') {
      window.activeDungeonStt = selectedStts[0];
      if (typeof quizSelectedStts !== 'undefined') quizSelectedStts = new Set(selectedStts);
      if (typeof quizTargetQuestionCount !== 'undefined') quizTargetQuestionCount = 5;
      if (typeof quizGameMode !== 'undefined') quizGameMode = 'rpg';

      try {
        if (typeof startQuizSession === 'function') {
          await startQuizSession();
        }
        this.scaleMonsterForTower(floor);
      } catch (e) {
        console.error('Lỗi nạp Tháp Babel:', e);
      }
    }
  },

  // Nạp câu hỏi cho Boss Rush
  loadBossRushQuestions: async function() {
    const all = (typeof allTopics !== 'undefined' && Array.isArray(allTopics)) ? allTopics : [];
    const completed = all.filter(t => t.status === 'completed');
    const sourceTopics = completed.length > 0 ? completed : all;

    const shuffled = [...sourceTopics].sort(() => 0.5 - Math.random());
    const selectedStts = shuffled.slice(0, 5).map(t => t.stt);

    if (typeof startDungeonSession === 'function' || typeof startQuizSession === 'function') {
      window.activeDungeonStt = selectedStts[0];
      if (typeof quizSelectedStts !== 'undefined') quizSelectedStts = new Set(selectedStts);
      if (typeof quizTargetQuestionCount !== 'undefined') quizTargetQuestionCount = 10;
      if (typeof quizGameMode !== 'undefined') quizGameMode = 'rpg';

      try {
        if (typeof startQuizSession === 'function') {
          await startQuizSession();
        }
        this.scaleBossRushEncounter(this.bossRushState.currentBossIdx);
      } catch (e) {
        console.error('Lỗi nạp Boss Rush:', e);
      }
    }
  },

  // Tăng cường chỉ số quái theo tầng tháp (50+ tầng)
  scaleMonsterForTower: function(floor) {
    if (typeof BattleEngine === 'undefined' || !BattleEngine.monster) return;
    const m = BattleEngine.monster;
    const f = Math.max(1, Number(floor) || 1);
    const isEliteFloor = (f % 5 === 0);

    if (m.baseHp === undefined) m.baseHp = m.maxHp || 100;
    if (m.baseAtk === undefined) m.baseAtk = m.atk || 25;
    if (m.baseDef === undefined) m.baseDef = m.def || 10;

    // Công thức tăng tiến chuẩn: 1 + (floor - 1) * 0.12
    const floorMult = +(1 + (f - 1) * 0.12).toFixed(2);
    m.maxHp = Math.round(m.baseHp * floorMult);
    m.hp = m.maxHp;
    m.ghostHp = m.maxHp;
    m.atk = Math.round(m.baseAtk * floorMult);
    m.def = Math.round(m.baseDef * floorMult);

    // Gán Floor Boss Modifier
    const modifier = this.getFloorModifier(f);
    m.floorModifier = modifier;

    if (modifier.id === 'divine_shield') {
      m.shield = modifier.shieldAbsorb || 100;
      m.maxShield = m.shield;
    }

    if (isEliteFloor) {
      m.isBoss = true;
      m.name = `🔥 [TRÙM TẦNG ${f}] CỰ MA THÁP BABEL • ${modifier.name}`;
      m.scale = 1.35;
      m.color = modifier.color || '#EF4444';
      if (typeof BattleEngine.triggerBossAlert === 'function') BattleEngine.triggerBossAlert();
    } else {
      m.name = `[TẦNG ${f}] Quái Ma Tháp (${modifier.name})`;
    }

    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) {
      badge.innerText = `🗼 THÁP BABEL - TẦNG ${f} (${modifier.icon} ${modifier.name})`;
    }

    if (typeof BattleEngine.updateBattleUI === 'function') BattleEngine.updateBattleUI();
    return m;
  },

  // Cấu hình chỉ số cho trận đấu Boss Rush
  scaleBossRushEncounter: function(bossNum) {
    if (typeof BattleEngine === 'undefined' || !BattleEngine.monster) return;
    const m = BattleEngine.monster;
    m.isBoss = true;
    m.scale = 1.4;

    const mult = 1.2 + (bossNum - 1) * 0.25;
    m.maxHp = Math.round((m.maxHp || 600) * mult);
    m.hp = m.maxHp;
    m.ghostHp = m.maxHp;
    m.atk = Math.round((m.atk || 45) * mult);
    m.def = Math.round((m.def || 20) * mult);

    const modifier = this.getFloorModifier(bossNum * 3);
    m.floorModifier = modifier;
    m.name = `💀 [BOSS ${bossNum}/5] ĐẠI MA VƯƠNG SINH TỒN • ${modifier.name}`;

    // Khôi phục HP trước đó của Hiệp Sĩ nếu có (không hồi máu tự động)
    if (this.bossRushState.preservedHeroHp !== null && BattleEngine.hero) {
      BattleEngine.hero.hp = Math.max(1, this.bossRushState.preservedHeroHp);
    }

    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) badge.innerText = `👑 BOSS RUSH - TRẬN ${bossNum}/5 (${modifier.icon} ${modifier.name})`;

    if (typeof BattleEngine.updateBattleUI === 'function') BattleEngine.updateBattleUI();
  },

  // Tính toán phần thưởng kinh tế sau khi vượt qua một tầng tháp
  calculateFloorReward: function(floor) {
    const f = Math.max(1, Number(floor) || 1);
    // Vàng: Tối thiểu 40 + floor * 10 (floor 5 = 90) hoặc floor * 15 ở các tầng cao
    const gold = Math.max(40 + f * 10, f * 15);
    // EXP: Tối thiểu 50 + floor * 15 (floor 5 = 125) hoặc floor * 25
    const exp = Math.max(50 + f * 15, f * 25);
    // Đá Cường Hóa: Mỗi 5 tầng tặng 1..10 viên
    const enhanceStones = (f % 5 === 0) ? Math.max(1, Math.floor(f / 5)) : 0;
    // Gems: Mỗi 10 tầng tặng Gems
    const gems = (f % 10 === 0) ? Math.max(2, Math.floor(f / 10) * 2) : 0;

    return { floor: f, gold, exp, enhanceStones, gems };
  },

  // Xử lý khi vượt qua 1 tầng tháp
  onFloorCleared: function(floor) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    const f = floor || this.currentFloor || 1;
    this.currentFloor = f;

    if (user && user.tower_records) {
      if (this.currentFloor > user.tower_records.max_floor) {
        user.tower_records.max_floor = this.currentFloor;
      }
    }

    const rewards = this.calculateFloorReward(this.currentFloor);
    if (user) {
      user.gold = (user.gold || 0) + rewards.gold;
      if (rewards.enhanceStones > 0) {
        user.enhance_stones = (user.enhance_stones || 0) + rewards.enhanceStones;
      }
      if (rewards.gems > 0) {
        user.gems = (user.gems || 0) + rewards.gems;
      }
      if (typeof addXP === 'function') addXP(rewards.exp, `Tháp Babel Tầng ${this.currentFloor}`);
      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    }

    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.trackProgress === 'function') {
      GamificationQuests.trackProgress('tower_floor_clear', 1);
    }

    // Mở popup chọn Cổ Vật Roguelike (Boon) để tiếp tục leo tầng tiếp theo
    this.showRoguelikeBoonChoiceModal();

    return rewards;
  },

  // Xử lý khi tiêu diệt 1 Boss trong Boss Rush
  onBossRushCleared: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    if (typeof BattleEngine !== 'undefined' && BattleEngine.hero) {
      this.bossRushState.preservedHeroHp = BattleEngine.hero.hp;
    }

    if (this.bossRushState.currentBossIdx < this.bossRushState.totalBosses) {
      // Sang boss tiếp theo
      this.bossRushState.currentBossIdx += 1;
      if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
        GamificationQuests.showToastNotification(`🔥 Hạ gục Boss ${this.bossRushState.currentBossIdx - 1}/5! Bước vào trận đấu tiếp theo...`, '#EF4444');
      }
      this.loadBossRushQuestions();
    } else {
      // Vượt qua toàn bộ 5 Boss gauntlet!
      if (user && user.tower_records) {
        user.tower_records.boss_rush_wins = (user.tower_records.boss_rush_wins || 0) + 1;
      }
      if (user) {
        user.gold = (user.gold || 0) + 500;
        user.gems = (user.gems || 0) + 10;
        user.enhance_stones = (user.enhance_stones || 0) + 5;
        if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
      }

      if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') {
        RetroAudio.playFanfare();
      }

      if (typeof alert === 'function') {
        alert('🎉 CHÚC MỪNG HIỆP SĨ! Bạn đã xuất sắc hoàn thành trọn vẹn 5/5 Boss Rush Sinh Tồn!\nPhần thưởng: +500 Vàng, +10 Gems, +5 Đá Cường Hóa!');
      }

      if (typeof returnToDungeonLobby === 'function') returnToDungeonLobby();
    }
  },

  // Hiển thị Popup chọn 1 trong 3 Cổ Vật Roguelike (Hades style)
  showRoguelikeBoonChoiceModal: function() {
    let modal = document.getElementById('rpgBoonModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rpgBoonModal';
      modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center p-3 z-50';
      document.body.appendChild(modal);
    }

    // Chọn ngẫu nhiên 3 cổ vật độc nhất
    const shuffled = [...this.BOONS_POOL].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);
    const rewards = this.calculateFloorReward(this.currentFloor);

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-xl w-full p-5 space-y-4 border-4 border-[#FFE787] shadow-[8px_8px_0px_#111] animate-scaleIn">
        <div class="text-center space-y-1">
          <span class="text-4xl animate-bounce">🏛️</span>
          <h2 class="font-display font-extrabold text-xl uppercase text-[#FFE787] tracking-wider">
            CHÚC MỪNG VƯỢT TẦNG ${this.currentFloor}!
          </h2>
          <div class="text-xs font-mono-code text-slate-300">
            Thưởng: <b class="text-yellow-400">+${rewards.gold}🪙</b> • <b class="text-emerald-400">+${rewards.exp} EXP</b>
            ${rewards.enhanceStones > 0 ? ` • <b class="text-blue-400">+${rewards.enhanceStones} Đá Cường Hóa</b>` : ''}
            ${rewards.gems > 0 ? ` • <b class="text-purple-400">+${rewards.gems} Gems</b>` : ''}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Hãy chọn 1 trong 3 Cổ Vật Cổ Đại để gia tăng sức mạnh trước khi leo tầng tiếp theo:</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          ${choices.map((b) => `
            <div onclick="GamificationTower.selectBoon('${b.id}')" class="p-3 bg-[#121424] hover:bg-[#1E233D] border-2 border-slate-700 hover:border-amber-400 rounded cursor-pointer transition flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div class="text-3xl text-center mb-1">${b.icon}</div>
                <div class="font-display font-extrabold text-xs text-white text-center uppercase group-hover:text-amber-300">${b.title}</div>
                <p class="text-[11px] text-slate-300 text-center mt-1.5 leading-snug">${b.desc}</p>
              </div>
              <button class="w-full mt-2.5 py-1 bg-[#10B981] group-hover:bg-emerald-500 text-white text-[10px] font-display font-extrabold uppercase rounded shadow-sm">
                CHỌN CỔ VẬT
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();
  },

  // Chọn Cổ Vật và tiến lên tầng tiếp theo
  selectBoon: function(boonId) {
    const boon = this.BOONS_POOL.find(b => b.id === boonId);
    if (boon) {
      this.towerBoons.push(boon);
      this.applyBoonEffect(boon.id);

      if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
        GamificationQuests.showToastNotification(`✨ Đã nhận: [${boon.title}]!`, boon.color);
      }
    }

    const modal = document.getElementById('rpgBoonModal');
    if (modal) modal.classList.add('hidden');

    // Tiến lên tầng tiếp theo!
    this.currentFloor += 1;
    this.loadTowerQuestions(this.currentFloor);
  },

  // Áp dụng hiệu ứng Cổ Vật vào BattleEngine
  applyBoonEffect: function(boonId) {
    if (typeof BattleEngine === 'undefined') return;

    if (boonId === 'boon_giant_heart') {
      BattleEngine.hero.maxHp = (BattleEngine.hero.maxHp || 100) + 40;
      BattleEngine.hero.hp = BattleEngine.hero.maxHp;
    } else if (boonId === 'boon_wise_lens') {
      if (typeof GamificationSkills !== 'undefined' && typeof GamificationSkills.eliminateWrongAnswers === 'function') {
        GamificationSkills.eliminateWrongAnswers();
      }
    } else if (boonId === 'boon_iron_skin') {
      BattleEngine.hero.def = (BattleEngine.hero.def || 10) + 25;
    } else if (boonId === 'boon_berserk') {
      BattleEngine.hero.atk = Math.round((BattleEngine.hero.atk || 35) * 1.4);
    } else if (boonId === 'boon_mana_surge') {
      BattleEngine.hero.mp = Math.min(BattleEngine.hero.maxMp || 50, (BattleEngine.hero.mp || 20) + 20);
    } else if (boonId === 'boon_crit_frenzy') {
      BattleEngine.hero.crit = Math.min(75, (BattleEngine.hero.crit || 5) + 25);
    } else if (boonId === 'boon_soul_scythe') {
      BattleEngine.hero.vampiricHeal = (BattleEngine.hero.vampiricHeal || 0) + 15;
    }
  },

  // ==================== GIAO DIỆN MODAL THÁP BABEL (TOWER DASHBOARD) ====================
  openModal: function() {
    let modal = document.getElementById('rpgTowerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rpgTowerModal';
      modal.className = 'fixed inset-0 bg-black/85 hidden items-center justify-center p-2 sm:p-4 z-50';
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderTowerModal();
  },

  closeModal: function() {
    const modal = document.getElementById('rpgTowerModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  renderTowerModal: function() {
    const modal = document.getElementById('rpgTowerModal');
    if (!modal) return;

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    const maxFloor = user.tower_records?.max_floor || 1;
    const bossRushWins = user.tower_records?.boss_rush_wins || 0;

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-2xl w-full p-4 sm:p-5 space-y-3 border-3 border-[#111] shadow-[6px_6px_0px_#FFE787] flex flex-col justify-between max-h-[90vh]">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🗼</span>
            <div>
              <h3 class="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                THÁP BABEL VÔ TẬN & BOSS RUSH
              </h3>
              <div class="text-[11px] text-slate-400">Đấu trường thử thách cực hạn: 50+ Tầng Tháp, 10+ Biến Thể Trùm & Đấu Liên Hoàn 5 Boss!</div>
            </div>
          </div>
          <button onclick="GamificationTower.closeModal()" class="neo-btn w-8 h-8 bg-white text-[#111] font-bold flex items-center justify-center text-sm hover:bg-red-500 hover:text-white">✕</button>
        </div>

        <!-- 2 Chế Độ Chơi: Tháp Babel vs Boss Rush -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          
          <!-- Thẻ Tháp Babel -->
          <div class="p-3.5 bg-[#10121F] border-2 border-amber-500/60 rounded flex flex-col justify-between shadow-md">
            <div>
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-3xl">🗼</span>
                  <div>
                    <h4 class="font-display font-extrabold text-sm text-white uppercase">THÁP BABEL VÔ TẬN</h4>
                    <span class="text-[10px] font-mono-code text-amber-300 font-bold">Kỷ lục: Tầng ${maxFloor}</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 rounded text-[10px] font-mono-code font-bold">50+ TẦNG</span>
              </div>

              <p class="text-[11px] text-slate-300 my-2.5 leading-relaxed">
                Leo từng tầng tháp, mỗi tầng gồm 5 câu đố. Cứ mỗi 5 tầng là 1 Tầng Trùm Cực Mạnh mang 1 trong 10 Biến Thể đặc thù (Phản đòn, Mây độc, Hút huyết...)! Qua tầng nhận Cổ Vật Roguelike.
              </p>

              <div class="bg-[#121422] border border-slate-800 p-2 rounded text-[11px] font-mono-code text-slate-300 space-y-1">
                <div>🎁 Thưởng tầng: <b class="text-yellow-400">+50-750 Vàng</b> • <b class="text-emerald-400">+100-1250 EXP</b></div>
                <div>👑 Mốc tầng 5, 10, 15: <b class="text-blue-400">Đá Cường Hóa & Gems</b></div>
              </div>
            </div>

            <div class="pt-3 mt-2 border-t border-slate-800">
              <button onclick="GamificationTower.startEndlessTower(1)" class="w-full py-2.5 bg-[#FFE787] hover:bg-amber-300 text-[#111] font-display font-extrabold text-xs uppercase rounded border-2 border-[#111] shadow-[3px_3px_0px_#111] flex items-center justify-center gap-1.5 transition">
                <span>⚔️</span> <span>BẮT ĐẦU LEO THÁP (TẦNG 1)</span> <span>➔</span>
              </button>
            </div>
          </div>

          <!-- Thẻ Boss Rush -->
          <div class="p-3.5 bg-[#10121F] border-2 border-red-500/60 rounded flex flex-col justify-between shadow-md">
            <div>
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-3xl">💀</span>
                  <div>
                    <h4 class="font-display font-extrabold text-sm text-red-400 uppercase">BOSS RUSH SINH TỒN</h4>
                    <span class="text-[10px] font-mono-code text-slate-400 font-bold">Đã thắng: ${bossRushWins} lần</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700 rounded text-[10px] font-mono-code font-bold">5 BOSS</span>
              </div>

              <p class="text-[11px] text-slate-300 my-2.5 leading-relaxed">
                Đấu liên hoàn 5 Trùm Cuối ngẫu nhiên mà KHÔNG ĐƯỢC HỒI MÁU tự động giữa các trận. Vận dụng kỹ năng, bình máu và chiến thuật để sinh tồn!
              </p>

              <div class="bg-[#121422] border border-slate-800 p-2 rounded text-[11px] font-mono-code text-slate-300 space-y-1">
                <div>🏆 Thắng 5/5 Boss: <b class="text-amber-300">Rương Thần Binh Sử Thi</b></div>
                <div>💎 Thưởng đặc biệt: <b class="text-blue-400">+10 Gems</b> • <b class="text-emerald-400">+5 Đá Cường Hóa</b></div>
              </div>
            </div>

            <div class="pt-3 mt-2 border-t border-slate-800">
              <button onclick="GamificationTower.startBossRush()" class="w-full py-2.5 bg-[#EF4444] hover:bg-red-600 text-white font-display font-extrabold text-xs uppercase rounded border-2 border-[#111] shadow-[3px_3px_0px_#111] flex items-center justify-center gap-1.5 transition">
                <span>🔥</span> <span>VÀO ĐẤU TRƯỜNG BOSS RUSH</span> <span>➔</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Modal -->
        <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span class="font-mono-code font-bold">Thử thách vô tận không giới hạn lượt tham gia mỗi ngày!</span>
          <button onclick="GamificationTower.closeModal()" class="neo-btn px-4 py-1.5 bg-white text-[#111] font-extrabold">ĐÓNG</button>
        </div>
      </div>
    `;
  }
};

// Xuất global cho toàn bộ trang
if (typeof window !== 'undefined') {
  window.GamificationTower = GamificationTower;
}
