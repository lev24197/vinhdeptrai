// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - ENDLESS TOWER OF BABEL & BOSS RUSH
// Module 4: Tháp Thách Thức Vô Tận & Đấu Trường Boss Sinh Tồn
// ============================================================================

const GamificationTower = {
  activeMode: null, // 'tower' | 'boss_rush'
  currentFloor: 1,
  towerBoons: [], // Danh sách bùa chú Roguelike đang kích hoạt trong lượt này

  // Danh mục 8 Cổ Vật Bùa Chú Roguelike
  BOONS_POOL: [
    { id: 'boon_wise_lens', title: 'Thấu Kính Minh Triết', icon: '🔍', desc: 'Vĩnh viễn loại bỏ 1 đáp án sai trong tất cả các câu hỏi còn lại của lượt này!', color: '#38BDF8' },
    { id: 'boon_giant_heart', title: 'Trái Tim Khổng Lồ', icon: '💖', desc: 'Lập tức hồi phục đầy 100% HP và tăng thêm +40 Máu tối đa trong suốt ải!', color: '#EF4444' },
    { id: 'boon_soul_scythe', title: 'Lưỡi Hái Hút Hồn', icon: '⚔️', desc: 'Mỗi khi một quái vật bị tiêu diệt, Hiệp Sĩ được hút ngay +15 HP hồi phục!', color: '#10B981' },
    { id: 'boon_berserk', title: 'Cuồng Nộ Chiến Trận', icon: '🔥', desc: 'Tăng cực đại +40% Sát thương (ATK) của Hiệp Sĩ cho mọi đòn đánh!', color: '#F59E0B' },
    { id: 'boon_mana_surge', title: 'Suối Nguồn Ma Pháp', icon: '🔮', desc: 'Mỗi câu trả lời đúng tự động hồi phục thêm +10 MP năng lượng!', color: '#8B5CF6' },
    { id: 'boon_iron_skin', title: 'Kim Cang Bất Hoại', icon: '🛡️', desc: 'Tăng thêm +25 Giáp phòng thủ (DEF), giảm mạnh sát thương từ đòn đánh của quái!', color: '#94A3B8' },
    { id: 'boon_crit_frenzy', title: 'Bão Táp Bạo Kích', icon: '⚡', desc: 'Tăng thêm +25% Tỉ lệ Bạo kích (Crit) và sát thương bạo kích nhân gấp 2.5 lần!', color: '#FACC15' },
    { id: 'boon_midas_touch', title: 'Bàn Tay Midas', icon: '🪙', desc: 'Gấp đôi số Vàng thưởng rơi ra khi kết thúc mỗi tầng tháp!', color: '#EAB308' }
  ],

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

  // Bắt đầu chế độ Tháp Babel Vô Tận
  startEndlessTower: function(startFloor = 1) {
    this.activeMode = 'tower';
    this.currentFloor = startFloor;
    this.towerBoons = [];

    this.closeModal();

    // Chuyển sang Combat View và thiết lập trận đấu Tháp
    if (typeof showCombatView === 'function') showCombatView();

    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) badge.innerText = `🗼 THÁP BABEL - TẦNG ${this.currentFloor}`;

    // Khởi tạo danh sách câu hỏi tổng hợp từ các chủ đề đã học
    this.loadTowerQuestions(this.currentFloor);
  },

  // Bắt đầu chế độ Boss Rush (5 Boss Sinh Tồn Liên Hoàn)
  startBossRush: function() {
    this.activeMode = 'boss_rush';
    this.currentFloor = 1; // 1 đến 5 Boss
    this.towerBoons = [];

    this.closeModal();

    if (typeof showCombatView === 'function') showCombatView();

    const badge = document.getElementById('dungeonTopicBadge');
    if (badge) badge.innerText = `👑 BOSS RUSH - TRẬN 1/5`;

    this.loadBossRushQuestions();
  },

  // Nạp câu hỏi cho Tháp Babel
  loadTowerQuestions: async function(floor) {
    const completed = (allTopics || []).filter(t => t.status === 'completed');
    if (completed.length === 0) {
      alert('Bạn chưa học chủ đề nào! Vui lòng chọn học từ vựng trước khi vào Tháp Babel.');
      return;
    }

    // Chọn ngẫu nhiên 3 chủ đề completed để lấy từ vựng
    const shuffled = [...completed].sort(() => 0.5 - Math.random());
    const selectedStts = shuffled.slice(0, 3).map(t => t.stt);

    if (typeof startDungeonSession === 'function') {
      // 1 Tầng tháp gồm 5 câu hỏi nhanh
      window.activeDungeonStt = selectedStts[0];
      quizSelectedStts = new Set(selectedStts);
      quizTargetQuestionCount = 5;
      quizGameMode = 'rpg';

      try {
        await startQuizSession();
        // Sau khi spawn quái vật, cường hóa chỉ số quái theo độ sâu tầng tháp
        this.scaleMonsterForTower(floor);
      } catch (e) {
        console.error('Lỗi nạp Tháp Babel:', e);
      }
    }
  },

  // Nạp câu hỏi cho Boss Rush
  loadBossRushQuestions: async function() {
    const completed = (allTopics || []).filter(t => t.status === 'completed');
    const shuffled = [...completed].sort(() => 0.5 - Math.random());
    const selectedStts = shuffled.slice(0, 5).map(t => t.stt);

    if (typeof startDungeonSession === 'function') {
      window.activeDungeonStt = selectedStts[0];
      quizSelectedStts = new Set(selectedStts);
      quizTargetQuestionCount = 10;
      quizGameMode = 'rpg';

      try {
        await startQuizSession();
      } catch (e) {
        console.error('Lỗi nạp Boss Rush:', e);
      }
    }
  },

  // Tăng cường chỉ số quái theo tầng tháp
  scaleMonsterForTower: function(floor) {
    if (typeof BattleEngine === 'undefined' || !BattleEngine.monster) return;
    const m = BattleEngine.monster;
    const isEliteFloor = (floor % 5 === 0);

    const floorMult = 1 + (floor - 1) * 0.12;
    m.maxHp = Math.round(m.maxHp * floorMult);
    m.hp = m.maxHp;
    m.ghostHp = m.maxHp;
    m.atk = Math.round((m.atk || 25) * floorMult);
    m.def = Math.round((m.def || 10) * floorMult);

    if (isEliteFloor) {
      m.isBoss = true;
      m.name = `🔥 [TRÙM TẦNG ${floor}] CỰ MA THÁP BABEL`;
      m.scale = 1.35;
      m.color = '#EF4444';
      if (typeof BattleEngine.triggerBossAlert === 'function') BattleEngine.triggerBossAlert();
    } else {
      m.name = `[TẦNG ${floor}] Quái Ma Tháp`;
    }

    BattleEngine.updateBattleUI();
  },

  // Xử lý khi vượt qua 1 tầng tháp
  onFloorCleared: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    if (this.currentFloor > user.tower_records.max_floor) {
      user.tower_records.max_floor = this.currentFloor;
    }

    const goldReward = 40 + this.currentFloor * 10;
    const expReward = 50 + this.currentFloor * 15;
    user.gold = (user.gold || 0) + goldReward;
    if (typeof addXP === 'function') addXP(expReward, `Tháp Babel Tầng ${this.currentFloor}`);

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

    // Mở popup chọn Cổ Vật Roguelike (Boon) để tiếp tục leo tầng tiếp theo
    this.showRoguelikeBoonChoiceModal();
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

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-xl w-full p-5 space-y-4 border-4 border-[#FFE787] shadow-[8px_8px_0px_#111] animate-scaleIn">
        <div class="text-center space-y-1">
          <span class="text-4xl animate-bounce">🏛️</span>
          <h2 class="font-display font-extrabold text-xl uppercase text-[#FFE787] tracking-wider">
            CHÚC MỪNG VƯỢT TẦNG ${this.currentFloor}!
          </h2>
          <p class="text-xs text-slate-300">Hãy chọn 1 trong 3 Cổ Vật Cổ Đại để gia tăng sức mạnh trước khi bước tiếp:</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          ${choices.map((b, idx) => `
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

      if (typeof GamificationQuests !== 'undefined') {
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
      BattleEngine.hero.maxHp += 40;
      BattleEngine.hero.hp = BattleEngine.hero.maxHp;
    } else if (boonId === 'boon_wise_lens') {
      if (typeof GamificationSkills !== 'undefined') {
        GamificationSkills.eliminateWrongAnswers();
      }
    } else if (boonId === 'boon_iron_skin') {
      BattleEngine.hero.def = (BattleEngine.hero.def || 10) + 25;
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
              <div class="text-[11px] text-slate-400">Đấu trường thử thách cực hạn người học từ vựng. Leo tầng nhận Bùa Chú Roguelike!</div>
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
                <span class="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 rounded text-[10px] font-mono-code font-bold">ROGUELIKE</span>
              </div>

              <p class="text-[11px] text-slate-300 my-2.5 leading-relaxed">
                Leo từng tầng tháp, mỗi tầng gồm 5 câu hỏi nhanh. Cứ mỗi 5 tầng là 1 Tầng Trùm Cực Mạnh! Cứ qua mỗi tầng sẽ được chọn 1 Cổ Vật Roguelike gia tăng sức mạnh.
              </p>

              <div class="bg-[#121422] border border-slate-800 p-2 rounded text-[11px] font-mono-code text-slate-300 space-y-1">
                <div>🎁 Thưởng tầng: <b class="text-yellow-400">+50-200 Vàng</b> • <b class="text-emerald-400">+100-300 EXP</b></div>
                <div>👑 Mốc tầng 5, 10, 15: <b class="text-blue-400">Rương Cổ Vật & Đá Cường Hóa</b></div>
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
                    <span class="text-[10px] font-mono-code text-slate-400 font-bold">5 Trùm Cuối Liên Hoàn</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700 rounded text-[10px] font-mono-code font-bold">THỬ THÁCH</span>
              </div>

              <p class="text-[11px] text-slate-300 my-2.5 leading-relaxed">
                Đấu liên hoàn 5 Trùm Cuối ngẫu nhiên trong 100 Boss mà KHÔNG ĐƯỢC HỒI MÁU giữa các trận (chỉ dùng bình máu mang theo trong túi).
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
          <span class="font-mono-code font-bold">Thử thách không giới hạn lượt tham gia mỗi ngày!</span>
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
