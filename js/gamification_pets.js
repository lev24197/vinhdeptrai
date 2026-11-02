// ============================================================================
// THE ANKI DICTIONARY & RPG ARENA - COMPANION PET SYSTEM
// Module 5: Hệ Thống Linh Thú Nuôi Đồng Hành Trợ Chiến
// ============================================================================

const GamificationPets = {
  PETS_DATA: {
    wise_owl: {
      id: 'wise_owl',
      name: 'Cú Bác Học',
      title: 'Linh Thú Tri Thức',
      icon: '🦉',
      color: '#38BDF8',
      desc: 'Linh thú thông thái biểu tượng của Oxford. Tăng mạnh lượng Kinh Nghiệm (EXP) nhận được sau mỗi trận đấu và đồng hành đọc từ vựng.',
      bonusLabel: '+25% EXP học từ vựng',
      expMultiplier: 0.25,
      costUnlock: { gold: 200, gems: 2 }
    },
    baby_drake: {
      id: 'baby_drake',
      name: 'Tiểu Hỏa Long',
      title: 'Hắc Long Tập Sự',
      icon: '🐲',
      color: '#EF4444',
      desc: 'Chú rồng con sinh ra từ miệng núi lửa hầm ngục. Tự động phun hỏa cầu phụ chiến gây 20 sát thương mỗi khi Hiệp Sĩ trả lời đúng.',
      bonusLabel: 'Phun lửa trợ chiến 20 DMG',
      assistDmg: 20,
      costUnlock: { gold: 350, gems: 5 }
    },
    fortune_cat: {
      id: 'fortune_cat',
      name: 'Mèo Chiêu Tài',
      title: 'Maneki Neko',
      icon: '🐱',
      color: '#F59E0B',
      desc: 'Mèo thần tài may mắn. Tăng 35% Vàng rơi ra khi tiêu diệt quái vật và có 15% cơ hội nhặt thêm Đá Cường Hóa sau ải.',
      bonusLabel: '+35% Vàng & 15% nhặt Đá',
      goldMultiplier: 0.35,
      costUnlock: { gold: 300, gems: 4 }
    },
    frost_kitsune: {
      id: 'frost_kitsune',
      name: 'Hồ Ly Băng',
      title: 'Tuyết Cửu Vĩ',
      icon: '🦊',
      color: '#A855F7',
      desc: 'Hồ ly tuyết linh thiêng vùng núi băng giá. 15% cơ hội lập tức đóng băng quái vật khi người chơi lỡ trả lời sai, cứu người chơi khỏi bị phản đòn.',
      bonusLabel: '15% Đóng băng Boss khi nguy cấp',
      freezeChance: 0.15,
      costUnlock: { gold: 450, gems: 8 }
    }
  },

  // Khởi tạo dữ liệu Linh thú cho người chơi
  ensureInitialized: function(user) {
    if (!user) return;
    if (!user.pets) {
      user.pets = {
        wise_owl: { unlocked: true, level: 1, xp: 0 }, // Cú Bác Học mở khóa mặc định
        baby_drake: { unlocked: false, level: 1, xp: 0 },
        fortune_cat: { unlocked: false, level: 1, xp: 0 },
        frost_kitsune: { unlocked: false, level: 1, xp: 0 }
      };
    }
    if (!user.equipped_pet) {
      user.equipped_pet = 'wise_owl';
    }
  },

  // Mở khóa Linh thú bằng Vàng & Gems
  unlockPet: function(petId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const petData = this.PETS_DATA[petId];
    if (!petData) return;

    if (user.pets[petId]?.unlocked) {
      alert('Linh thú này đã được mở khóa!');
      return;
    }

    const cost = petData.costUnlock;
    if ((user.gold || 0) < cost.gold || (user.gems || 0) < cost.gems) {
      alert(`Bạn không đủ tài nguyên! Cần ${cost.gold} 🪙 và ${cost.gems} 💎 để thuần hóa ${petData.name}.`);
      return;
    }

    user.gold -= cost.gold;
    user.gems -= cost.gems;
    user.pets[petId].unlocked = true;
    user.equipped_pet = petId; // Tự động trang bị linh thú mới mở

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    if (typeof GamificationQuests !== 'undefined') {
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

    if (!user.pets[petId]?.unlocked) {
      alert('Bạn chưa mở khóa Linh thú này!');
      return;
    }

    user.equipped_pet = petId;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playCoin === 'function') RetroAudio.playCoin();

    const petData = this.PETS_DATA[petId];
    if (typeof GamificationQuests !== 'undefined') {
      GamificationQuests.showToastNotification(`🐾 [${petData.name}] đã xuất trận đồng hành cùng Hiệp Sĩ!`, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // Nâng cấp cấp độ Linh thú bằng Bụi Ma Pháp & Vàng
  upgradePet: function(petId) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const petState = user.pets[petId];
    if (!petState || !petState.unlocked) return;

    if (petState.level >= 10) {
      alert('Linh thú này đã đạt cấp độ tối đa (Level 10)!');
      return;
    }

    const goldCost = 50 + petState.level * 30;
    const dustCost = 20 + petState.level * 15;

    if ((user.gold || 0) < goldCost || (user.magic_dust || 0) < dustCost) {
      alert(`Không đủ nguyên liệu nâng cấp! Cần ${goldCost} 🪙 và ${dustCost} 🔮.`);
      return;
    }

    user.gold -= goldCost;
    user.magic_dust -= dustCost;
    petState.level += 1;

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    if (typeof RetroAudio !== 'undefined' && typeof RetroAudio.playFanfare === 'function') RetroAudio.playFanfare();

    const petData = this.PETS_DATA[petId];
    if (typeof GamificationQuests !== 'undefined') {
      GamificationQuests.showToastNotification(`⭐ [${petData.name}] thăng cấp lên Level ${petState.level}!`, petData.color);
    }

    this.renderSanctuaryModal();
    if (typeof renderLobbyView === 'function') renderLobbyView();
  },

  // ==================== VẼ LINH THÚ TRÊN CANVAS CHIẾN ĐẤU ====================
  drawPetOnCanvas: function(ctx, heroX, heroY, animTimer) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    if (!user) return;
    this.ensureInitialized(user);

    const petId = user.equipped_pet || 'wise_owl';
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
      // 1. Cú Bác Học (Wise Owl)
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
      // 2. Tiểu Hỏa Long (Baby Drake)
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
    } else if (petId === 'fortune_cat') {
      // 3. Mèo Chiêu Tài (Fortune Cat)
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath(); ctx.ellipse(0, 2, 13, 13, 0, 0, Math.PI * 2); ctx.fill();
      // Tai mèo với đốm cam
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(-5, -18); ctx.lineTo(-1, -8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9, -8); ctx.lineTo(5, -18); ctx.lineTo(1, -8); ctx.fill();
      // Đồng xu vàng Koban trước ngực
      ctx.fillStyle = '#EAB308';
      ctx.beginPath(); ctx.ellipse(0, 3, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      // Mắt híp cười đáng yêu
      ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(-5, -3, 3, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, -3, 3, Math.PI, 0); ctx.stroke();
    } else if (petId === 'frost_kitsune') {
      // 4. Hồ Ly Băng (Frost Kitsune)
      ctx.fillStyle = '#C084FC';
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 12, 0, 0, Math.PI * 2); ctx.fill();
      // Tai hồ ly nhọn thanh thoát
      ctx.fillStyle = '#7C3AED';
      ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-5, -18); ctx.lineTo(-1, -6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(5, -18); ctx.lineTo(1, -6); ctx.fill();
      // 3 đuôi tuyết lượn sóng sau lưng
      ctx.strokeStyle = '#E9D5FF'; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        const tw = Math.sin(animTimer * 3 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(i * 4, 8);
        ctx.quadraticCurveTo(-15 + i * 8, 12 + tw, -22 + i * 10, 0 + tw);
        ctx.stroke();
      }
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

    const equippedId = user.equipped_pet || 'wise_owl';
    const petsList = Object.values(this.PETS_DATA);

    modal.innerHTML = `
      <div class="neo-box bg-[#0B0D17] text-[#F8FAFC] max-w-2xl w-full p-4 sm:p-5 space-y-3 border-3 border-[#111] shadow-[6px_6px_0px_#FFE787] flex flex-col justify-between max-h-[90vh]">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🐾</span>
            <div>
              <h3 class="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                TRẠI LINH THÚ: BẠN ĐỒNG HÀNH TRỢ CHIẾN
              </h3>
              <div class="text-[11px] text-slate-400">Linh thú sẽ bay/chạy bên cạnh bạn trên đấu trường và tung hiệu ứng buff đặc thù</div>
            </div>
          </div>
          <button onclick="GamificationPets.closeModal()" class="neo-btn w-8 h-8 bg-white text-[#111] font-bold flex items-center justify-center text-sm hover:bg-red-500 hover:text-white">✕</button>
        </div>

        <!-- Danh sách 4 Linh thú -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          ${petsList.map(pet => {
            const petState = user.pets[pet.id] || { unlocked: false, level: 1 };
            const isEquipped = (equippedId === pet.id);
            const isUnlocked = petState.unlocked;
            const lvl = petState.level || 1;
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
                        <span class="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-mono-code font-extrabold">ĐANG ĐỒNG HÀNH</span>
                      ` : ''}
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-300 my-2 leading-relaxed">${pet.desc}</p>
                  
                  <div class="bg-[#121422] border border-slate-800 p-1.5 rounded text-[11px] font-mono-code font-bold text-amber-300 flex items-center gap-1.5">
                    <span>✨ Hiệu ứng:</span> <span>${pet.bonusLabel}</span>
                  </div>
                </div>

                <!-- Footer Nút Bấm Thao Tác -->
                <div class="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  ${isUnlocked ? `
                    ${isEquipped ? `
                      <span class="text-xs font-mono-code text-slate-400 font-bold">Đang mang</span>
                    ` : `
                      <button onclick="GamificationPets.equipPet('${pet.id}')" class="neo-btn px-3 py-1 bg-[#10B981] hover:bg-emerald-600 text-white font-display font-extrabold text-xs uppercase">
                        Đồng Hành ➔
                      </button>
                    `}
                    ${lvl < 10 ? `
                      <button onclick="GamificationPets.upgradePet('${pet.id}')" class="neo-btn px-2.5 py-1 bg-[#3B82F6] hover:bg-blue-600 text-white font-mono-code font-bold text-[10px] flex items-center gap-1" title="Cần ${upgradeGold} Vàng & ${upgradeDust} Bụi">
                        <span>⭐ Lên Cấp</span> <span class="text-amber-200">(${upgradeGold}🪙)</span>
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
          <span class="font-mono-code font-bold">Tài sản hiện có: <b class="text-yellow-400">${user?.gold || 0}🪙</b> • <b class="text-blue-400">${user?.gems || 0}💎</b> • <b class="text-purple-400">${user?.magic_dust || 0}🔮</b></span>
          <button onclick="GamificationPets.closeModal()" class="neo-btn px-4 py-1.5 bg-white text-[#111] font-extrabold">ĐÓNG</button>
        </div>
      </div>
    `;
  }
};

// Xuất global cho toàn bộ trang
if (typeof window !== 'undefined') {
  window.GamificationPets = GamificationPets;
}
