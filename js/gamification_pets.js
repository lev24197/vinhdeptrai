// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - COMPANION PET SYSTEM
// Module 5: Hệ Thống Linh Thú Nuôi Đồng Hành Trợ Chiến & Cho Ăn (Pet Feeding)
// ============================================================================

const GamificationPets = {
  // 4 Linh thú đồng hành chuẩn mực theo thiết kế
  PETS_DATA: {
    wise_owl: {
      id: 'wise_owl',
      name: 'Cú Thông Thái',
      title: 'Linh Thú Tri Thức & Thông Tuệ',
      icon: '🦉',
      color: '#38BDF8',
      desc: 'Linh thú thông thái biểu tượng của học thuật cổ đại. Tăng mạnh lượng Kinh Nghiệm (EXP) nhận được sau mỗi trận đấu và hỗ trợ gợi ý từ vựng.',
      bonusLabel: '+20%..+38% EXP & Gợi ý từ',
      expMultiplier: 0.20,
      studyHintChance: 0.10,
      costUnlock: { gold: 200, gems: 2 }
    },
    baby_drake: {
      id: 'baby_drake',
      name: 'Rồng Lửa Nhỏ',
      title: 'Hỏa Long Tập Sự',
      icon: '🐲',
      color: '#EF4444',
      desc: 'Chú rồng con sinh ra từ miệng núi lửa hầm ngục. Tự động phun hỏa cầu trợ chiến và thiêu đốt quái vật (Burn DoT) qua mỗi hiệp đấu.',
      bonusLabel: '15..60 DMG trợ chiến & Đốt cháy',
      assistDmg: 15,
      burnDmg: 5,
      costUnlock: { gold: 350, gems: 5 }
    },
    golden_shiba: {
      id: 'golden_shiba',
      name: 'Shiba Vàng May Mắn',
      title: 'Thần Thú Chiêu Tài',
      icon: '🐕',
      color: '#F59E0B',
      desc: 'Chú chó Shiba vàng thần tài mang lại vận may dồi dào. Tăng lượng Vàng rơi ra khi tiêu diệt quái vật, tăng tỉ lệ Bạo kích và nhặt Đá Cường Hóa.',
      bonusLabel: '+25%..+52% Vàng & +5%..+14% Crit',
      goldMultiplier: 0.25,
      critBonus: 5,
      costUnlock: { gold: 300, gems: 4 }
    },
    shadow_panther: {
      id: 'shadow_panther',
      name: 'Báo Bóng Đêm',
      title: 'U Linh Ám Dạ Thú',
      icon: '🐆',
      color: '#A855F7',
      desc: 'Báo đen huyền bí ẩn mình trong bóng tối. Tăng mạnh Tỉ lệ Né Đòn (Dodge), kích hoạt đòn đánh bóng ma hiểm hóc hoặc đóng băng boss khi nguy cấp.',
      bonusLabel: '+6%..+15% Né Đòn & Đột kích',
      dodgeBonus: 6,
      shadowStrikeDmg: 20,
      freezeChance: 0.15,
      costUnlock: { gold: 450, gems: 8 }
    }
  },

  // Danh mục Thức Ăn cho Linh Thú (Pet Feeding System)
  FOOD_ITEMS: {
    snack_apple: {
      id: 'snack_apple',
      name: 'Táo Rừng Tươi',
      icon: '🍎',
      costGold: 30,
      costDust: 0,
      affinityGain: 15,
      desc: 'Táo ngọt giòn rụm từ rừng cổ đại, tăng +15 Độ Thân Thiết.'
    },
    snack_fish: {
      id: 'snack_fish',
      name: 'Cá Biển Sâu',
      icon: '🐟',
      costGold: 50,
      costDust: 5,
      affinityGain: 25,
      desc: 'Cá biển dồi dào dưỡng chất, tăng +25 Độ Thân Thiết.'
    },
    snack_meat: {
      id: 'snack_meat',
      name: 'Thịt Nướng Hảo Hạng',
      icon: '🍖',
      costGold: 80,
      costDust: 10,
      affinityGain: 40,
      desc: 'Thịt thơm phức bổ sung thể lực, tăng +40 Độ Thân Thiết.'
    },
    snack_crystal: {
      id: 'snack_crystal',
      name: 'Pha Lê Ma Pháp',
      icon: '💎',
      costGold: 0,
      costDust: 25,
      affinityGain: 50,
      desc: 'Tinh hoa bụi ma pháp kết tinh, tăng +50 Độ Thân Thiết.'
    }
  },

  // Ánh xạ id linh thú (hỗ trợ fallback aliases: fortune_cat -> golden_shiba, frost_kitsune -> shadow_panther)
  resolvePetId: function(petId) {
    if (!petId) return 'wise_owl';
    if (petId === 'fortune_cat') return 'golden_shiba';
    if (petId === 'frost_kitsune') return 'shadow_panther';
    return petId;
  },

  // Lấy dữ liệu pet an toàn bao gồm cả alias
  getPetData: function(petId) {
    const canonical = this.resolvePetId(petId);
    return this.PETS_DATA[canonical] || this.PETS_DATA.wise_owl;
  },

  // Khởi tạo dữ liệu Linh thú cho người chơi
  ensureInitialized: function(user) {
    if (!user) return;
    if (!user.pets) {
      user.pets = {
        wise_owl: { unlocked: true, level: 1, xp: 0, affinity: 50 },
        baby_drake: { unlocked: false, level: 1, xp: 0, affinity: 50 },
        golden_shiba: { unlocked: false, level: 1, xp: 0, affinity: 50 },
        shadow_panther: { unlocked: false, level: 1, xp: 0, affinity: 50 }
      };
    } else {
      if (!user.pets.wise_owl) user.pets.wise_owl = { unlocked: true, level: 1, xp: 0, affinity: 50 };
      if (!user.pets.baby_drake) user.pets.baby_drake = { unlocked: false, level: 1, xp: 0, affinity: 50 };

      // Chuyển đổi dữ liệu cũ nếu có
      if (user.pets.fortune_cat && !user.pets.golden_shiba) {
        user.pets.golden_shiba = { ...user.pets.fortune_cat };
      }
      if (!user.pets.golden_shiba) user.pets.golden_shiba = { unlocked: false, level: 1, xp: 0, affinity: 50 };

      if (user.pets.frost_kitsune && !user.pets.shadow_panther) {
        user.pets.shadow_panther = { ...user.pets.frost_kitsune };
      }
      if (!user.pets.shadow_panther) user.pets.shadow_panther = { unlocked: false, level: 1, xp: 0, affinity: 50 };

      ['wise_owl', 'baby_drake', 'golden_shiba', 'shadow_panther'].forEach(k => {
        if (user.pets[k] && typeof user.pets[k].affinity !== 'number') {
          user.pets[k].affinity = 50;
        }
      });

      // Giữ mirror cho các bản lưu cũ
      user.pets.fortune_cat = user.pets.golden_shiba;
      user.pets.frost_kitsune = user.pets.shadow_panther;
    }

    if (!user.equipped_pet) {
      user.equipped_pet = 'wise_owl';
    } else {
      if (user.equipped_pet === 'fortune_cat') user.equipped_pet = 'golden_shiba';
      if (user.equipped_pet === 'frost_kitsune') user.equipped_pet = 'shadow_panther';
    }

    // Đồng bộ currency contract (user.dust)
    if (user.dust === undefined && user.magic_dust !== undefined) {
      user.dust = user.magic_dust;
    } else if (user.magic_dust === undefined && user.dust !== undefined) {
      user.magic_dust = user.dust;
    }
  },

  // Tính toán chỉ số Buff của Linh Thú tăng tiến nghiêm ngặt (Monotonic) theo cấp 1-10
  getPetBuffs: function(petId, level = 1, affinity = 50) {
    const canonical = this.resolvePetId(petId);
    const lvl = Math.max(1, Math.min(10, Number(level) || 1));
    const aff = Math.max(0, Math.min(100, Number(affinity) || 0));
    const isWellFed = aff >= 70;

    const buffs = {
      petId: canonical,
      level: lvl,
      affinity: aff,
      isWellFed: isWellFed,
      wellFedBonus: isWellFed ? { allStatsPercent: 10, energyBoost: 10, label: 'No Nê & Hưng Phấn (+10% Toàn Bộ Chỉ Số)' } : null
    };

    if (canonical === 'wise_owl') {
      // Cú Thông Thái: EXP tăng từ 20% (Lv1) lên 38% (Lv10), gợi ý từ tăng từ 10% lên 28%
      buffs.expMultiplier = +(0.20 + (lvl - 1) * 0.02).toFixed(2);
      buffs.studyHintChance = +(0.10 + (lvl - 1) * 0.02).toFixed(2);
      buffs.label = `+${Math.round(buffs.expMultiplier * 100)}% EXP học tập & ${Math.round(buffs.studyHintChance * 100)}% gợi ý từ`;
    } else if (canonical === 'baby_drake') {
      // Rồng Lửa Nhỏ: Sát thương phụ chiến tăng từ 15 (Lv1) lên 60 (Lv10), thiêu đốt tăng từ 5 lên 23 DMG/lượt
      buffs.assistDmg = 15 + (lvl - 1) * 5;
      buffs.burnDmg = 5 + (lvl - 1) * 2;
      buffs.burnTurns = 2;
      buffs.label = `Hỏa cầu trợ chiến ${buffs.assistDmg} DMG & Đốt cháy ${buffs.burnDmg} DMG/lượt`;
    } else if (canonical === 'golden_shiba') {
      // Shiba Vàng May Mắn: Vàng tăng từ 25% (Lv1) lên 52% (Lv10), Crit tăng từ +5% lên +14%
      buffs.goldMultiplier = +(0.25 + (lvl - 1) * 0.03).toFixed(2);
      buffs.critBonus = 5 + (lvl - 1);
      buffs.stoneChance = +(0.10 + (lvl - 1) * 0.02).toFixed(2);
      buffs.label = `+${Math.round(buffs.goldMultiplier * 100)}% Vàng & +${buffs.critBonus}% Tỉ lệ Crit`;
    } else if (canonical === 'shadow_panther') {
      // Báo Bóng Đêm: Né đòn tăng từ +6% (Lv1) lên +15% (Lv10), Đột kích ám ảnh tăng từ 20 lên 65 DMG
      buffs.dodgeBonus = 6 + (lvl - 1);
      buffs.shadowStrikeDmg = 20 + (lvl - 1) * 5;
      buffs.freezeChance = +(0.15 + (lvl - 1) * 0.02).toFixed(2);
      buffs.label = `+${buffs.dodgeBonus}% Né Đòn & Đột kích bóng ma ${buffs.shadowStrikeDmg} DMG`;
    }

    return buffs;
  },

  // Mở khóa Linh thú bằng Vàng & Gems
  unlockPet: function(petId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const canonical = this.resolvePetId(petId);
    const petData = this.PETS_DATA[canonical];
    if (!petData) return;

    if (user.pets[canonical]?.unlocked) {
      if (typeof alert === 'function') alert('Linh thú này đã được mở khóa!');
      return;
    }

    const cost = petData.costUnlock;
    if ((user.gold || 0) < cost.gold || (user.gems || 0) < cost.gems) {
      if (typeof alert === 'function') alert(`Bạn không đủ tài nguyên! Cần ${cost.gold} 🪙 và ${cost.gems} 💎 để thuần hóa ${petData.name}.`);
      return;
    }

    user.gold -= cost.gold;
    user.gems -= cost.gems;
    user.pets[canonical].unlocked = true;
    user.equipped_pet = canonical; // Tự động trang bị linh thú mới mở

    // Sync legacy mirror
    if (canonical === 'golden_shiba' && user.pets.fortune_cat) user.pets.fortune_cat.unlocked = true;
    if (canonical === 'shadow_panther' && user.pets.frost_kitsune) user.pets.frost_kitsune.unlocked = true;

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
      GamificationQuests.showToastNotification(`🎉 Thuần hóa thành công Linh Thú: [${petData.name}]!`, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Trang bị Linh thú đồng hành
  equipPet: function(petId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const canonical = this.resolvePetId(petId);
    if (!user.pets[canonical]?.unlocked) {
      if (typeof alert === 'function') alert('Bạn chưa mở khóa Linh thú này!');
      return;
    }

    user.equipped_pet = canonical;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playCoin === 'function') RetroAudio.playCoin();

    const petData = this.PETS_DATA[canonical];
    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
      GamificationQuests.showToastNotification(`🐾 [${petData.name}] đã xuất trận đồng hành cùng Hiệp Sĩ!`, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Nâng cấp cấp độ Linh thú bằng Vàng & user.dust (Cấp 1 đến 10)
  upgradePet: function(petId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return false;
    this.ensureInitialized(user);

    const canonical = this.resolvePetId(petId);
    const petState = user.pets[canonical];
    if (!petState || !petState.unlocked) return false;

    if (petState.level >= 10) {
      if (typeof alert === 'function') alert('Linh thú này đã đạt cấp độ tối đa (Level 10)!');
      return false;
    }

    const goldCost = 50 + petState.level * 30;
    const dustCost = 20 + petState.level * 15;

    const currentGold = user.gold || 0;
    const currentDust = (user.dust !== undefined) ? user.dust : (user.magic_dust || 0);

    if (currentGold < goldCost || currentDust < dustCost) {
      if (typeof alert === 'function') alert(`Không đủ nguyên liệu nâng cấp! Cần ${goldCost} 🪙 và ${dustCost} 🔮.`);
      return false;
    }

    user.gold = currentGold - goldCost;
    user.dust = currentDust - dustCost;
    user.magic_dust = user.dust; // Sync unified dust
    petState.level += 1;

    // Sync legacy mirror keys
    if (canonical === 'golden_shiba' && user.pets.fortune_cat) {
      user.pets.fortune_cat.level = petState.level;
    }
    if (canonical === 'shadow_panther' && user.pets.frost_kitsune) {
      user.pets.frost_kitsune.level = petState.level;
    }

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    const petData = this.PETS_DATA[canonical];
    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
      GamificationQuests.showToastNotification(`⭐ [${petData.name}] thăng cấp lên Level ${petState.level}!`, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
    return true;
  },

  // Hệ Thống Cho Ăn (Pet Feeding System)
  feedPet: function(petId, foodType = 'snack_apple') {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return { success: false, reason: 'no_user' };
    this.ensureInitialized(user);

    const canonical = this.resolvePetId(petId);
    const petState = user.pets[canonical];
    if (!petState || !petState.unlocked) {
      if (typeof alert === 'function') alert('Bạn chưa mở khóa Linh thú này để cho ăn!');
      return { success: false, reason: 'not_unlocked' };
    }

    const food = this.FOOD_ITEMS[foodType] || this.FOOD_ITEMS.snack_apple;
    const goldCost = food.costGold || 0;
    const dustCost = food.costDust || 0;

    const currentGold = user.gold || 0;
    const currentDust = (user.dust !== undefined) ? user.dust : (user.magic_dust || 0);

    if (currentGold < goldCost || currentDust < dustCost) {
      const msg = `Không đủ nguyên liệu mua thức ăn! Cần ${goldCost}🪙 và ${dustCost}🔮.`;
      if (typeof alert === 'function') alert(msg);
      return { success: false, reason: 'insufficient_funds' };
    }

    user.gold = Math.max(0, currentGold - goldCost);
    user.dust = Math.max(0, currentDust - dustCost);
    user.magic_dust = user.dust;

    const currentAff = (typeof petState.affinity === 'number') ? petState.affinity : 50;
    petState.affinity = Math.min(100, currentAff + food.affinityGain);

    if (canonical === 'golden_shiba' && user.pets.fortune_cat) {
      user.pets.fortune_cat.affinity = petState.affinity;
    }
    if (canonical === 'shadow_panther' && user.pets.frost_kitsune) {
      user.pets.frost_kitsune.affinity = petState.affinity;
    }

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    const petData = this.PETS_DATA[canonical];
    const isWellFed = petState.affinity >= 70;
    const toastMsg = isWellFed
      ? `🍖 [${petData.name}] ăn rất ngon miệng! Thân thiết: ${petState.affinity}/100. KÍCH HOẠT BUFF NO NÊ (+10% TOÀN BỘ CHỈ SỐ)!`
      : `🍖 [${petData.name}] ăn rất ngon miệng! Thân thiết: ${petState.affinity}/100 (+${food.affinityGain})`;

    if (typeof GamificationQuests !== 'undefined' && typeof GamificationQuests.showToastNotification === 'function') {
      GamificationQuests.showToastNotification(toastMsg, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
    if (typeof BattleEngine !== 'undefined' && typeof BattleEngine.updateBattleUI === 'function') BattleEngine.updateBattleUI();

    return {
      success: true,
      affinity: petState.affinity,
      isWellFed: isWellFed,
      foodGiven: food.name
    };
  },

  // ==================== VẼ LINH THÚ TRÊN CANVAS CHIẾN ĐẤU ====================
  drawPetOnCanvas: function(ctx, heroX, heroY, animTimer) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const rawId = user.equipped_pet || 'wise_owl';
    const petId = this.resolvePetId(rawId);
    const petData = this.PETS_DATA[petId];
    if (!petData) return;

    // Tọa độ thú cưng: bay hoặc đứng lơ lửng sau lưng/bên cạnh Hiệp Sĩ
    const bob = Math.sin(animTimer * 4) * 4;
    const petX = heroX - 42;
    const petY = heroY - 45 + bob;

    ctx.save();
    ctx.translate(petX, petY);

    // Bóng mờ đổ dưới chân linh thú
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 48 - bob, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hào quang lấp lánh quanh linh thú
    ctx.fillStyle = petData.color + '33';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    if (petId === 'wise_owl') {
      // 1. Cú Thông Thái (Wise Owl)
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
      // Mắt to tròn thông thái
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(-5, -4, 4.5, 0, Math.PI * 2); ctx.arc(5, -4, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(-4, -4, 2, 0, Math.PI * 2); ctx.arc(4, -4, 2, 0, Math.PI * 2); ctx.fill();
      // Mỏ vàng
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath(); ctx.moveTo(-3, 1); ctx.lineTo(3, 1); ctx.lineTo(0, 5); ctx.fill();
      // Cánh vỗ nhẹ
      const wingFlap = Math.sin(animTimer * 8) * 3;
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(-14, -2 + wingFlap, 4, 10);
      ctx.fillRect(10, -2 - wingFlap, 4, 10);
    } else if (petId === 'baby_drake') {
      // 2. Rồng Lửa Nhỏ (Baby Drake)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
      // Đầu & sừng rồng
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.arc(0, -8, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-6, -17, 3, 6); ctx.fillRect(3, -17, 3, 6);
      // Mắt rồng rực lửa
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-5, -9, 3, 4); ctx.fillRect(2, -9, 3, 4);
      // Cánh rồng
      const dFlap = Math.sin(animTimer * 8) * 5;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-10, -4); ctx.lineTo(-20, -14 + dFlap); ctx.lineTo(-12, 4); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -4); ctx.lineTo(20, -14 + dFlap); ctx.lineTo(12, 4); ctx.fill();
    } else if (petId === 'golden_shiba') {
      // 3. Shiba Vàng May Mắn (Golden Shiba)
      ctx.fillStyle = '#EAB308';
      ctx.beginPath(); ctx.ellipse(0, 2, 13, 13, 0, 0, Math.PI * 2); ctx.fill();
      // Bụng trắng kem
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath(); ctx.ellipse(0, 5, 8, 8, 0, 0, Math.PI * 2); ctx.fill();
      // Tai Shiba dựng tam giác
      ctx.fillStyle = '#CA8A04';
      ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(-6, -18); ctx.lineTo(-2, -8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9, -8); ctx.lineTo(6, -18); ctx.lineTo(2, -8); ctx.fill();
      // Đuôi cuộn cong dễ thương
      const tailWag = Math.sin(animTimer * 10) * 4;
      ctx.fillStyle = '#EAB308';
      ctx.beginPath(); ctx.arc(-14, 0 + tailWag, 4, 0, Math.PI * 2); ctx.fill();
      // Mũi & mắt Shiba
      ctx.fillStyle = '#1E293B';
      ctx.beginPath(); ctx.arc(-4, -2, 2, 0, Math.PI * 2); ctx.arc(4, -2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(0, 1, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (petId === 'shadow_panther') {
      // 4. Báo Bóng Đêm (Shadow Panther)
      ctx.fillStyle = '#312E81';
      ctx.beginPath(); ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
      // Đầu báo thanh thoát
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath(); ctx.arc(0, -6, 9, 0, Math.PI * 2); ctx.fill();
      // Tai báo đen nhọn
      ctx.fillStyle = '#4338CA';
      ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-6, -17); ctx.lineTo(-2, -6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(6, -17); ctx.lineTo(2, -6); ctx.fill();
      // Mắt tím phát quang huyền bí
      ctx.fillStyle = '#C084FC';
      ctx.beginPath(); ctx.ellipse(-4, -6, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.ellipse(4, -6, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      // Đuôi báo uốn lượn bóng ma
      ctx.strokeStyle = '#818CF8'; ctx.lineWidth = 2.5;
      const tailAnim = Math.sin(animTimer * 4) * 6;
      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.quadraticCurveTo(-18, 12 + tailAnim, -22, -2 + tailAnim);
      ctx.stroke();
    }

    ctx.restore();
  },

  // ==================== GIAO DIỆN TRẠI NUÔI LINH THÚ (PET SANCTUARY MODAL) ====================
  openModal: function() {
    let modal = document.getElementById('rpgPetModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rpgPetModal';
      modal.className = 'fixed inset-0 bg-black/85 hidden items-center justify-center p-2 sm:p-4 z-50';
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderSanctuaryModal();
  },

  closeModal: function() {
    const modal = document.getElementById('rpgPetModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  renderSanctuaryModal: function() {
    const modal = document.getElementById('rpgPetModal');
    if (!modal) return;

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    this.ensureInitialized(user);

    const equippedId = this.resolvePetId(user.equipped_pet || 'wise_owl');
    const petsList = Object.values(this.PETS_DATA);
    const userDust = (user?.dust !== undefined) ? user.dust : (user?.magic_dust || 0);

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-3xl w-full p-4 sm:p-5 space-y-3 border-3 border-[#111] shadow-[6px_6px_0px_#FFE787] flex flex-col justify-between max-h-[92vh]">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🐾</span>
            <div>
              <h3 class="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                TRẠI LINH THÚ: NUÔI DƯỠNG & ĐỒNG HÀNH TRỢ CHIẾN
              </h3>
              <div class="text-[11px] text-slate-400">Nuôi dưỡng tăng Thân Thiết (>=70 nhận Buff No Nê +10% toàn chỉ số) & Thăng cấp tăng sức mạnh</div>
            </div>
          </div>
          <button onclick="GamificationPets.closeModal()" class="neo-btn w-8 h-8 bg-white text-[#111] font-bold flex items-center justify-center text-sm hover:bg-red-500 hover:text-white">✕</button>
        </div>

        <!-- Danh sách 4 Linh thú -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          ${petsList.map(pet => {
            const petState = user.pets[pet.id] || { unlocked: false, level: 1, affinity: 50 };
            const isEquipped = (equippedId === pet.id);
            const isUnlocked = petState.unlocked;
            const lvl = petState.level || 1;
            const aff = (typeof petState.affinity === 'number') ? petState.affinity : 50;
            const isWellFed = aff >= 70;
            const buffs = this.getPetBuffs(pet.id, lvl, aff);
            const upgradeGold = 50 + lvl * 30;
            const upgradeDust = 20 + lvl * 15;

            return `
              <div class="p-3 rounded border-2 transition flex flex-col justify-between ${isEquipped ? 'bg-[#181B2E] border-amber-400 shadow-md' : isUnlocked ? 'bg-[#10121F] border-slate-700' : 'bg-[#0B0D17] border-slate-800 opacity-70'}">
                <div>
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                      <span class="text-3xl p-1 bg-[#121422] border border-slate-700 rounded">${pet.icon}</span>
                      <div>
                        <div class="font-display font-extrabold text-xs text-white uppercase flex items-center gap-1.5">
                          <span>${pet.name}</span>
                          ${isUnlocked ? `<span class="text-[10px] font-mono-code font-bold text-amber-300 bg-amber-950 px-1 rounded">Lv.${lvl}</span>` : ''}
                        </div>
                        <div class="text-[10px] font-mono-code text-slate-400 italic">${pet.title}</div>
                      </div>
                    </div>
                    <div>
                      ${isEquipped ? `
                        <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-mono-code font-extrabold">ĐỒNG HÀNH</span>
                      ` : ''}
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-300 my-2 leading-relaxed">${pet.desc}</p>
                  
                  <!-- Buff chỉ số hiện tại theo Level -->
                  <div class="bg-[#121422] border border-slate-800 p-2 rounded text-[11px] font-mono-code font-bold text-amber-300 space-y-1">
                    <div class="flex items-center justify-between">
                      <span>✨ Hiệu ứng (Lv.${lvl}):</span>
                      <span class="text-white">${buffs.label}</span>
                    </div>
                    ${isUnlocked ? `
                      <!-- Thanh Thân Thiết (Affinity) & Trạng thái No Nê -->
                      <div class="pt-1.5 border-t border-slate-800/80">
                        <div class="flex items-center justify-between text-[10px] mb-1">
                          <span class="text-slate-400">❤️ Thân Thiết: <b class="text-pink-400">${aff}/100</b></span>
                          ${isWellFed ? `
                            <span class="text-emerald-400 font-extrabold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700">🍖 NO NÊ (+10% ALL)</span>
                          ` : `
                            <span class="text-slate-400 font-normal">Cần 70 để kích hoạt Buff</span>
                          `}
                        </div>
                        <div class="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                          <div class="bg-gradient-to-r from-pink-500 to-amber-400 h-full transition-all" style="width: ${aff}%"></div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Thao Tác: Cho Ăn, Lên Cấp, Trang Bị -->
                <div class="pt-2.5 mt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                  ${isUnlocked ? `
                    <div class="flex items-center gap-1">
                      ${isEquipped ? `
                        <span class="text-[11px] font-mono-code text-slate-400 font-bold px-1">Đang mang</span>
                      ` : `
                        <button onclick="GamificationPets.equipPet('${pet.id}')" class="neo-btn px-2.5 py-1 bg-[#10B981] hover:bg-emerald-600 text-white font-display font-extrabold text-[10px] uppercase">
                          Đồng Hành ➔
                        </button>
                      `}
                      <!-- Menu Cho Ăn Nhanh -->
                      <div class="relative inline-block">
                        <button onclick="GamificationPets.feedPet('${pet.id}', 'snack_apple')" class="neo-btn px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono-code font-bold text-[10px]" title="Cho ăn Táo Rừng (30 Vàng, +15 Thân Thiết)">
                          🍎 Cho Ăn (30🪙)
                        </button>
                      </div>
                    </div>

                    ${lvl < 10 ? `
                      <button onclick="GamificationPets.upgradePet('${pet.id}')" class="neo-btn px-2.5 py-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-mono-code font-bold text-[10px] flex items-center gap-1" title="Cần ${upgradeGold} Vàng & ${upgradeDust} Bụi">
                        <span>⭐ Cấp ${lvl + 1}</span> <span class="text-amber-200">(${upgradeGold}🪙 ${upgradeDust}🔮)</span>
                      </button>
                    ` : `
                      <span class="text-[10px] font-mono-code text-amber-400 font-bold">Max Lv.10</span>
                    `}
                  ` : `
                    <div class="text-[10px] font-mono-code text-slate-400 font-bold">
                      Cần: <b class="text-yellow-400">${pet.costUnlock.gold}🪙</b> + <b class="text-blue-400">${pet.costUnlock.gems}💎</b>
                    </div>
                    <button onclick="GamificationPets.unlockPet('${pet.id}')" class="neo-btn px-3 py-1 bg-[#F59E0B] hover:bg-amber-400 text-[#111] font-display font-extrabold text-xs uppercase animate-pulse">
                      Thuần Hóa 🐾
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Modal -->
        <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span class="font-mono-code font-bold">Tài sản hiện có: <b class="text-yellow-400">${user?.gold || 0}🪙</b> • <b class="text-blue-400">${user?.gems || 0}💎</b> • <b class="text-purple-400">${userDust}🔮</b></span>
          <button onclick="GamificationPets.closeModal()" class="neo-btn px-4 py-1.5 bg-white text-[#111] font-extrabold">ĐÓNG</button>
        </div>
      </div>
    `;
  }
};

// Thiết lập alias mapping cho legacy pets ('fortune_cat' -> 'golden_shiba', 'frost_kitsune' -> 'shadow_panther')
// Đặt dưới dạng non-enumerable property để Object.keys(PETS_DATA).length vẫn bằng đúng 4!
Object.defineProperty(GamificationPets.PETS_DATA, 'fortune_cat', {
  get() { return this.golden_shiba; },
  set(val) { this.golden_shiba = val; },
  enumerable: false,
  configurable: true
});
Object.defineProperty(GamificationPets.PETS_DATA, 'frost_kitsune', {
  get() { return this.shadow_panther; },
  set(val) { this.shadow_panther = val; },
  enumerable: false,
  configurable: true
});

// Xuất global cho toàn bộ trang
if (typeof window !== 'undefined') {
  window.GamificationPets = GamificationPets;
}
