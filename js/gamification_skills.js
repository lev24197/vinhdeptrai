// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - 4-CLASS SKILL TREE & TACTICAL COMBAT
// Module 2: Cây Kỹ Năng 4 Hệ Phái & Tuyệt Kỹ Tác Chiến
// ============================================================================

const GamificationSkills = {
  // Bản đồ 4 Hệ phái với 2 Kỹ Năng Chủ Động (Active) & 2 Thiên Phú Bị Động (Passive)
  CLASS_SKILLS: {
    warrior: {
      name: 'Chiến Binh',
      icon: '🛡️',
      color: '#EF4444',
      active_1: {
        id: 'w_active_1', slot: 1, name: 'Cuồng Trảm Sấm Sét', mp: 20, icon: '⚔️',
        desc: 'Hiệp sĩ dồn toàn lực vung kiếm chém sấm sét, tăng x2.2 sát thương đòn đánh tiếp theo!',
        effect: 'dmg_mult_2.2'
      },
      active_2: {
        id: 'w_active_2', slot: 2, name: 'Khiên Phản Đòn', mp: 25, icon: '🛡️',
        desc: 'Dựng khiên thép chặn đòn: giảm 80% sát thương quái đánh và phản lại 100% sát thương đó vào mặt quái!',
        effect: 'reflect_shield'
      },
      passive_1: {
        id: 'w_passive_1', name: 'Thân Thể Thép', icon: '🪖',
        desc: 'Tăng vĩnh viễn +15 Giáp phòng thủ (DEF) và +30 Máu tối đa (Max HP).'
      },
      passive_2: {
        id: 'w_passive_2', name: 'Bất Tử Chiến Ý', icon: '❤️‍🔥',
        desc: 'Khi nhận đòn đánh chí tử hạ gục, Hiệp sĩ sống sót kiên cường với 1 HP một lần duy nhất trong mỗi ải.'
      }
    },
    mage: {
      name: 'Pháp Sư',
      icon: '🔮',
      color: '#8B5CF6',
      active_1: {
        id: 'm_active_1', slot: 1, name: 'Bão Băng Tê Liệt', mp: 25, icon: '❄️',
        desc: 'Phóng bão băng cực hàn làm đóng băng quái vật, khiến quái bị mất lượt phản đòn tiếp theo!',
        effect: 'freeze_monster'
      },
      active_2: {
        id: 'm_active_2', slot: 2, name: 'Hỏa Cầu Hủy Diệt', mp: 35, icon: '☄️',
        desc: 'Triệu hồi quả cầu lửa hư không gây sát thương x3.0 và thiêu rụi bỏ qua 50% DEF quái vật!',
        effect: 'meteor_strike'
      },
      passive_1: {
        id: 'm_passive_1', name: 'Minh Triết Cổ Đại', icon: '📖',
        desc: 'Trả lời đúng từ vựng cấp độ C1-C2 Nâng cao lập tức hồi phục ngay +15 MP năng lượng!'
      },
      passive_2: {
        id: 'm_passive_2', name: 'Khiên Linh Hồn', icon: '✨',
        desc: 'Tăng vĩnh viễn +25 MP tối đa và tăng 15% sát thương ma pháp cơ bản.'
      }
    },
    ranger: {
      name: 'Xạ Thủ',
      icon: '🏹',
      color: '#10B981',
      active_1: {
        id: 'r_active_1', slot: 1, name: 'Mắt Đại Bàng', mp: 15, icon: '👁️',
        desc: 'Tập trung nhãn lực thần tốc: tự động loại bỏ ngay lập tức 2 đáp án sai trong câu hỏi hiện tại!',
        effect: 'eliminate_2_options'
      },
      active_2: {
        id: 'r_active_2', slot: 2, name: 'Mưa Tên Xuyên Giáp', mp: 25, icon: '🎯',
        desc: 'Bắn loạt mũi tên xé gió gây 2 đòn sát thương liên tiếp và bỏ qua 40% giáp của quái!',
        effect: 'arrow_barrage'
      },
      passive_1: {
        id: 'r_passive_1', name: 'Tập Trung Cao Độ', icon: '🎯',
        desc: 'Tăng vĩnh viễn +15% Tỉ lệ Bạo kích (Crit Chance) cho mọi đòn đánh.'
      },
      passive_2: {
        id: 'r_passive_2', name: 'Thợ Săn Tiền Thưởng', icon: '🪙',
        desc: 'Tăng thêm +30% Vàng rơi ra khi tiêu diệt quái vật và Boss.'
      }
    },
    assassin: {
      name: 'Sát Thủ',
      icon: '🗡️',
      color: '#F59E0B',
      active_1: {
        id: 'a_active_1', slot: 1, name: 'Bóng Ma Hư Không', mp: 20, icon: '💨',
        desc: 'Hóa thành bóng ma tàng hình: 100% né tránh hoàn toàn đợt tấn công tiếp theo của quái!',
        effect: 'absolute_dodge'
      },
      active_2: {
        id: 'a_active_2', slot: 2, name: 'Ám Sát Trọng Thương', mp: 30, icon: '🩸',
        desc: 'Đòn đánh kế tiếp chắc chắn là Bạo Kích với lượng sát thương khổng lồ gấp x3.5 lần!',
        effect: 'guaranteed_crit_3.5'
      },
      passive_1: {
        id: 'a_passive_1', name: 'Lưỡi Dao Tẩm Độc', icon: '🧪',
        desc: 'Mỗi cú đánh chính xác khiến quái vật nhiễm độc, rút thêm 25 HP liên tục mỗi lượt.'
      },
      passive_2: {
        id: 'a_passive_2', name: 'Khinh Thân Thần Tốc', icon: '⚡',
        desc: 'Tăng vĩnh viễn +15% Tỉ lệ Né Đòn (Dodge Chance) cho Hiệp Sĩ.'
      }
    }
  },

  // Đảm bảo dữ liệu kỹ năng của người chơi được khởi tạo
  ensureInitialized: function(user) {
    if (!user) return;
    if (!user.rpg_class) user.rpg_class = 'warrior';
    if (typeof user.skill_points !== 'number') {
      // Số điểm kỹ năng = level - 1
      user.skill_points = Math.max(0, (user.level || 1) - 1);
    }
    if (!user.skills_unlocked) {
      user.skills_unlocked = {
        active_1: true, // Mặc định mở kỹ năng 1 cho người mới
        active_2: false,
        passive_1: false,
        passive_2: false
      };
    }
  },

  // Mở khóa 1 kỹ năng bằng Skill Point
  unlockSkill: function(skillKey) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    if (user.skills_unlocked[skillKey]) {
      alert('Kỹ năng này đã được mở khóa!');
      return;
    }

    if (user.skill_points < 1) {
      alert('Bạn không đủ Điểm Kỹ Năng (SP)! Hãy lên cấp qua các bài học để nhận thêm SP.');
      return;
    }

    user.skill_points -= 1;
    user.skills_unlocked[skillKey] = true;

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    this.renderSkillTreeModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
    if (typeof BattleEngine !== 'undefined') BattleEngine.updateBattleUI();
  },

  // Tẩy điểm kỹ năng (Reset Skills)
  resetSkills: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    if (confirm('Bạn có muốn đặt lại toàn bộ Điểm Kỹ Năng để học lại từ đầu không?')) {
      const totalPoints = Math.max(0, (user.level || 1) - 1);
      user.skill_points = totalPoints;
      user.skills_unlocked = {
        active_1: true,
        active_2: false,
        passive_1: false,
        passive_2: false
      };

      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
      this.renderSkillTreeModal();
      if (typeof renderLobbyView === 'function') renderLobbyView();
    }
  },

  // ==================== KÍCH HOẠT KỸ NĂNG TRONG TRẬN CHIẾN ====================
  castCombatSkill: function(slotNum) {
    if (typeof BattleEngine === 'undefined' || !BattleEngine.active) return;
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const cls = user.rpg_class || 'warrior';
    const classData = this.CLASS_SKILLS[cls] || this.CLASS_SKILLS.warrior;
    const skillKey = slotNum === 1 ? 'active_1' : 'active_2';
    const skill = classData[skillKey];

    if (!user.skills_unlocked[skillKey]) {
      if (typeof BattleEngine.addFloatDamage === 'function') {
        BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 30, '⚠️ KỸ NĂNG CHƯA MỞ KHÓA!', '#EF4444', false);
      }
      return;
    }

    if (BattleEngine.hero.mp < skill.mp) {
      if (typeof BattleEngine.addFloatDamage === 'function') {
        BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 30, '⚠️ KHÔNG ĐỦ MP!', '#38BDF8', false);
      }
      if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playHit === 'function') RetroAudio.playHit();
      return;
    }

    // Tiêu hao MP
    BattleEngine.hero.mp -= skill.mp;
    if (user) user.mp = BattleEngine.hero.mp;

    // Kích hoạt hiệu ứng cụ thể của chiêu thức
    this.applySkillEffect(skill.effect, skill.name);

    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playMagic === 'function') RetroAudio.playMagic();
    BattleEngine.updateBattleUI();
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
  },

  applySkillEffect: function(effectType, skillName) {
    if (typeof BattleEngine === 'undefined') return;

    if (effectType === 'dmg_mult_2.2') {
      BattleEngine.pendingBerserk = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `⚡ ${skillName}! SÁT THƯƠNG x2.2`, '#EF4444', true);
    } else if (effectType === 'reflect_shield') {
      BattleEngine.pendingReflectShield = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `🛡️ ${skillName}! PHẢN SÁT THƯƠNG`, '#F59E0B', true);
    } else if (effectType === 'freeze_monster') {
      if (BattleEngine.monster) {
        BattleEngine.monster.frozen = true;
        BattleEngine.addFloatDamage(BattleEngine.monster.x, BattleEngine.monster.y - 35, `❄️ ĐÓNG BĂNG! QUÁI MẤT LƯỢT`, '#38BDF8', true);
      }
    } else if (effectType === 'meteor_strike') {
      BattleEngine.pendingMeteorStrike = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `☄️ ${skillName}! HỎA CẦU x3.0`, '#8B5CF6', true);
    } else if (effectType === 'eliminate_2_options') {
      this.eliminateWrongAnswers();
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `👁️ ${skillName}! GẠCH 2 ĐÁP ÁN`, '#10B981', true);
    } else if (effectType === 'arrow_barrage') {
      BattleEngine.pendingArrowBarrage = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `🎯 ${skillName}! XUYÊN GIÁP 40%`, '#10B981', true);
    } else if (effectType === 'absolute_dodge') {
      BattleEngine.pendingAbsoluteDodge = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `💨 ${skillName}! 100% NÉ ĐÒN`, '#38BDF8', true);
    } else if (effectType === 'guaranteed_crit_3.5') {
      BattleEngine.pendingCrit35 = true;
      BattleEngine.addFloatDamage(BattleEngine.hero.x, BattleEngine.hero.y - 35, `🩸 ${skillName}! BẠO KÍCH x3.5`, '#F59E0B', true);
    }
  },

  // Hỗ trợ Xạ Thủ loại bỏ 2 đáp án sai trong câu hỏi hiện tại
  eliminateWrongAnswers: function() {
    if (typeof quizQuestions === 'undefined' || typeof quizCurrentIdx === 'undefined') return;
    const q = quizQuestions[quizCurrentIdx];
    if (!q || !q.options) return;

    let removed = 0;
    q.options.forEach((opt, idx) => {
      if (!opt.isCorrect && removed < 2) {
        const btn = document.getElementById('quizOptBtn-' + idx);
        if (btn && !btn.classList.contains('opacity-30')) {
          btn.classList.add('opacity-30', 'line-through', 'pointer-events-none');
          removed++;
        }
      }
    });
  },

  // ==================== GIAO DIỆN CÂY KỸ NĂNG (MODAL SKILL TREE) ====================
  openModal: function() {
    let modal = document.getElementById('rpgSkillTreeModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rpgSkillTreeModal';
      modal.className = 'fixed inset-0 bg-black/85 hidden items-center justify-center p-2 sm:p-4 z-50';
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderSkillTreeModal();
  },

  closeModal: function() {
    const modal = document.getElementById('rpgSkillTreeModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  renderSkillTreeModal: function() {
    const modal = document.getElementById('rpgSkillTreeModal');
    if (!modal) return;

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    const cls = user.rpg_class || 'warrior';
    const classData = this.CLASS_SKILLS[cls] || this.CLASS_SKILLS.warrior;
    const sp = user.skill_points || 0;
    const unlocked = user.skills_unlocked || {};

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-2xl w-full p-4 sm:p-5 space-y-3 border-3 border-[#111] shadow-[6px_6px_0px_#FFE787] flex flex-col justify-between max-h-[90vh]">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${classData.icon}</span>
            <div>
              <h3 class="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                CÂY KỸ NĂNG: ${classData.name.toUpperCase()}
              </h3>
              <div class="text-[11px] text-slate-400">Tăng cấp Hiệp Sĩ để nhận thêm Điểm Kỹ Năng (SP). Mỗi cấp = +1 SP</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="bg-[#181B2E] border border-amber-500/60 px-3 py-1 rounded text-xs font-mono-code font-bold text-amber-300">
              Điểm SP: <b class="text-base text-yellow-400">${sp}</b>
            </div>
            <button onclick="GamificationSkills.closeModal()" class="neo-btn w-8 h-8 bg-white text-[#111] font-bold flex items-center justify-center text-sm hover:bg-red-500 hover:text-white">✕</button>
          </div>
        </div>

        <!-- Nội dung 2 Nhánh Kỹ Năng: Chủ Động & Bị Động -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          
          <!-- Cột 1: Kỹ Năng Chủ Động (Active Skills) -->
          <div class="bg-[#10121F] border-2 border-slate-800 p-3 rounded space-y-2.5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="font-display font-extrabold text-xs uppercase text-[#FFE787] flex items-center gap-1.5">
                <span>⚔️</span> KỸ NĂNG CHỦ ĐỘNG (ACTIVE)
              </span>
              <span class="text-[10px] font-mono-code text-slate-400 font-bold">DÙNG MP</span>
            </div>

            <!-- Active 1 -->
            ${this.renderSkillCard(classData.active_1, 'active_1', unlocked.active_1, sp, 'Phím [1]')}

            <!-- Active 2 -->
            ${this.renderSkillCard(classData.active_2, 'active_2', unlocked.active_2, sp, 'Phím [2]')}
          </div>

          <!-- Cột 2: Thiên Phú Bị Động (Passive Talents) -->
          <div class="bg-[#10121F] border-2 border-slate-800 p-3 rounded space-y-2.5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="font-display font-extrabold text-xs uppercase text-emerald-400 flex items-center gap-1.5">
                <span>🌳</span> THIÊN PHÚ BỊ ĐỘNG (PASSIVE)
              </span>
              <span class="text-[10px] font-mono-code text-slate-400 font-bold">VĨNH VIỄN</span>
            </div>

            <!-- Passive 1 -->
            ${this.renderSkillCard(classData.passive_1, 'passive_1', unlocked.passive_1, sp, 'Tự động')}

            <!-- Passive 2 -->
            ${this.renderSkillCard(classData.passive_2, 'passive_2', unlocked.passive_2, sp, 'Tự động')}
          </div>

        </div>

        <!-- Footer Modal -->
        <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
          <button onclick="GamificationSkills.resetSkills()" class="text-slate-400 hover:text-amber-400 font-mono-code font-bold underline">
            🔄 Đặt lại Điểm Kỹ Năng (Reset SP)
          </button>
          <button onclick="GamificationSkills.closeModal()" class="neo-btn px-4 py-1.5 bg-white text-[#111] font-extrabold">ĐÓNG</button>
        </div>
      </div>
    `;
  },

  renderSkillCard: function(skill, key, isUnlocked, sp, shortcutLabel) {
    return `
      <div class="p-2.5 rounded border-2 transition ${isUnlocked ? 'bg-[#181B2E] border-amber-500/50 shadow-sm' : 'bg-[#0B0D17] border-slate-800 opacity-75'}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl p-1 bg-[#121422] border border-slate-700 rounded">${skill.icon}</span>
            <div>
              <div class="font-display font-extrabold text-xs text-white uppercase flex items-center gap-1.5">
                <span>${skill.name}</span>
                <span class="text-[9px] font-mono-code px-1 rounded ${isUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'}">${shortcutLabel}</span>
              </div>
              ${skill.mp ? `<span class="text-[10px] font-mono-code font-bold text-blue-400">Tiêu hao: ${skill.mp} MP</span>` : ''}
            </div>
          </div>
          <div>
            ${isUnlocked ? `
              <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-mono-code font-extrabold">ĐÃ MỞ</span>
            ` : sp > 0 ? `
              <button onclick="GamificationSkills.unlockSkill('${key}')" class="neo-btn px-2.5 py-1 bg-[#F59E0B] hover:bg-amber-400 text-[#111] text-[10px] font-display font-extrabold uppercase animate-pulse">
                Học (1 SP)
              </button>
            ` : `
              <span class="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[10px] font-mono-code font-bold">Khóa</span>
            `}
          </div>
        </div>
        <p class="text-[11px] text-slate-300 mt-1.5 leading-relaxed">${skill.desc}</p>
      </div>
    `;
  }
};

// Xuất global cho toàn bộ trang
if (typeof window !== 'undefined') {
  window.GamificationSkills = GamificationSkills;
}
