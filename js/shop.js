// ==================== HỆ THỐNG CỬA HÀNG, GACHA RƯƠNG BÁU & LÒ RÈN (SHOP & FORGE) ====================

const RPG_SHOP_GOODS = [
  { id: 'health_potion', name: 'Bình Máu Siêu Cấp', icon: '🧪', cost: 25, type: 'gold', desc: 'Hồi phục +50 HP ngay lập tức trong hoặc ngoài trận đấu.' },
  { id: 'mana_potion', name: 'Bình Năng Lượng MP', icon: '🔮', cost: 20, type: 'gold', desc: 'Hồi phục +40 MP để thoải mái tung kỹ năng chiến đấu.' },
  { id: 'hint_scroll', name: 'Cuộn Giấy Gợi Ý', icon: '📜', cost: 30, type: 'gold', desc: 'Loại bỏ ngay 2 đáp án sai trong câu hỏi trắc nghiệm.' },
  { id: 'shield_charm', name: 'Bùa Hộ Mệnh Miễn Nhiễm', icon: '🛡️', cost: 50, type: 'gold', desc: 'Chặn 1 lần trả lời sai không bị quái vật phản đòn trừ máu.' },
  { id: 'enhance_stone', name: 'Đá Cường Hóa Ma Lực', icon: '💎', cost: 60, type: 'gold', desc: 'Dùng trong Lò Rèn để đập đồ nâng cấp trang bị lên +1 đến +10.' },
  { id: 'double_xp_potion', name: 'Thần Dược Nhân Đôi EXP', icon: '⚗️', cost: 90, type: 'gold', desc: 'Nhân đôi toàn bộ điểm EXP nhận được trong vòng 30 phút.' }
];

let currentShopTab = 'goods'; // 'goods', 'gacha', 'forge'
let isGachaOpening = false;

// Bật / Tắt Modal Cửa Hàng
function openShopModal(defaultTab = 'goods') {
  const modal = document.getElementById('rpgShopModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  switchShopTab(defaultTab);
}

function closeShopModal() {
  const modal = document.getElementById('rpgShopModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function switchShopTab(tab) {
  currentShopTab = tab;
  ['goods', 'gacha', 'forge'].forEach(t => {
    const sec = document.getElementById('shopSection-' + t);
    if (sec) sec.classList.toggle('hidden', t !== tab);
    const btn = document.getElementById('shopTabBtn-' + t);
    if (btn) {
      btn.className = (t === tab)
        ? 'px-4 py-2 bg-[#111] text-white font-display font-extrabold text-xs uppercase border-2 border-[#111]'
        : 'px-4 py-2 bg-white text-[#111] font-display font-extrabold text-xs uppercase border-2 border-[#111] hover:bg-slate-100';
    }
  });

  renderShopTopCurrencies();

  if (tab === 'goods') renderShopGoodsList();
  else if (tab === 'gacha') renderGachaChestsView();
  else if (tab === 'forge') renderForgeView();
}

function renderShopTopCurrencies() {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;
  const goldEl = document.getElementById('shopUserGold');
  if (goldEl) goldEl.innerText = user.gold || 0;
  const gemsEl = document.getElementById('shopUserGems');
  if (gemsEl) gemsEl.innerText = user.gems || 0;
  const stonesEl = document.getElementById('shopUserStones');
  if (stonesEl) stonesEl.innerText = user.enhance_stones || 0;
}

// 1. ==================== QUẦY HÀNG TIÊU HAO ====================
function renderShopGoodsList() {
  const container = document.getElementById('shopGoodsContainer');
  if (!container) return;

  container.innerHTML = RPG_SHOP_GOODS.map(item => `
    <div class="neo-box bg-white p-3.5 flex flex-col justify-between border-2 border-[#111] shadow-[3px_3px_0px_#111]">
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-2xl">${item.icon}</span>
          <span class="font-display font-extrabold text-xs text-yellow-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            ${item.cost} 🪙 Vàng
          </span>
        </div>
        <h4 class="font-display font-extrabold text-xs text-[#111] pt-1">${item.name}</h4>
        <p class="text-[11px] text-slate-500 leading-snug">${item.desc}</p>
      </div>
      <button type="button" onclick="buyShopGoodItem('${item.id}', ${item.cost})" class="neo-btn mt-3 w-full py-1.5 bg-[#141414] hover:bg-slate-800 text-white font-display font-extrabold text-xs uppercase flex items-center justify-center gap-1">
        <span>Mua Ngay</span> ➔
      </button>
    </div>
  `).join('');
}

function buyShopGoodItem(itemId, cost) {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;

  if ((user.gold || 0) < cost) {
    alert(`Không đủ Vàng! Bạn có ${user.gold || 0} 🪙, món này giá ${cost} 🪙. Hãy vượt thêm hầm ngục để kiếm thêm vàng nhé!`);
    return;
  }

  user.gold -= cost;

  if (itemId === 'enhance_stone') {
    user.enhance_stones = (user.enhance_stones || 0) + 1;
  } else {
    if (!user.inventory) user.inventory = {};
    user.inventory[itemId] = (user.inventory[itemId] || 0) + 1;
  }

  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  playShopBuySound();
  renderShopTopCurrencies();
  if (typeof updateTopHud === 'function') updateTopHud();

  if (typeof showToastAlert === 'function') {
    showToastAlert(`🎉 Đã mua thành công 1 ${itemId === 'enhance_stone' ? 'Đá Cường Hóa' : itemId}!`);
  }
}

// 2. ==================== GACHA RƯƠNG BÁU MAY MẮN ====================
function renderGachaChestsView() {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  const pityCount = user?.gacha_pity || 0;
  const pityBadge = document.getElementById('gachaPityBadge');
  if (pityBadge) pityBadge.innerText = `${pityCount}/10 (Lần 10 chắc chắn 100% nổ Thần Binh Huyền Thoại!)`;
}

function openMysteryChest(chestType) {
  if (isGachaOpening) return;
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;
  if (typeof ensureUserEquipmentInitialized === 'function') ensureUserEquipmentInitialized(user);

  let costType = 'gold';
  let cost = 100;
  let chestTitle = 'Rương Gỗ Rừng Sâu';

  if (chestType === 'silver') {
    cost = 350;
    chestTitle = 'Rương Bạc Hầm Ngục';
  } else if (chestType === 'gold') {
    costType = 'gems';
    cost = 5;
    chestTitle = 'Rương Hoàng Kim Hắc Long';
  }

  if (costType === 'gold' && (user.gold || 0) < cost) {
    alert(`Không đủ Vàng! Mở ${chestTitle} cần ${cost} 🪙 Vàng.`);
    return;
  }
  if (costType === 'gems' && (user.gems || 0) < cost) {
    alert(`Không đủ Kim Cương! Mở ${chestTitle} cần ${cost} 💎 Kim Cương. Hãy đánh bại Trùm Cuối hoặc duy trì Streak để nhận Kim Cương nhé!`);
    return;
  }

  // Khấu trừ chi phí
  if (costType === 'gold') user.gold -= cost;
  else user.gems -= cost;

  user.gacha_pity = (user.gacha_pity || 0) + 1;

  // Thuật toán quay thưởng theo Pool trang bị
  const rolledItem = rollGachaItem(chestType, user.gacha_pity >= 10);
  if (rolledItem.tier === 'legendary') {
    user.gacha_pity = 0; // Reset bảo hiểm
  }

  // Thêm vào kho trang bị
  user.equipment_inventory.push(rolledItem.id);
  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  renderShopTopCurrencies();
  renderGachaChestsView();
  if (typeof updateTopHud === 'function') updateTopHud();

  // Hiệu ứng mở rương kịch tính
  triggerGachaRevealModal(rolledItem, chestTitle);
}

function rollGachaItem(chestType, isGuaranteedLegendary) {
  if (isGuaranteedLegendary) {
    const legendaries = RPG_EQUIPMENT_CATALOG.filter(i => i.tier === 'legendary');
    return legendaries[Math.floor(Math.random() * legendaries.length)];
  }

  const rand = Math.random() * 100;
  let targetTier = 'common';

  if (chestType === 'gold') {
    // Rương Hoàng Kim: 65% Sử Thi, 35% Huyền Thoại
    targetTier = rand < 35 ? 'legendary' : 'epic';
  } else if (chestType === 'silver') {
    // Rương Bạc: 12% Huyền Thoại, 45% Sử Thi, 43% Quý Hiếm
    if (rand < 12) targetTier = 'legendary';
    else if (rand < 57) targetTier = 'epic';
    else targetTier = 'rare';
  } else {
    // Rương Gỗ: 3% Huyền Thoại, 12% Sử Thi, 35% Quý Hiếm, 50% Tinh Luyện/Thường
    if (rand < 3) targetTier = 'legendary';
    else if (rand < 15) targetTier = 'epic';
    else if (rand < 50) targetTier = 'rare';
    else targetTier = rand < 80 ? 'uncommon' : 'common';
  }

  const candidates = RPG_EQUIPMENT_CATALOG.filter(i => i.tier === targetTier);
  return candidates[Math.floor(Math.random() * candidates.length)] || RPG_EQUIPMENT_CATALOG[0];
}

function triggerGachaRevealModal(item, chestTitle) {
  isGachaOpening = true;
  playGachaFanfareSound(item.tier);

  const modal = document.getElementById('gachaRevealModal');
  if (!modal) {
    alert(`🎉 Chúc mừng bạn đã mở được: [${item.name}] (${item.tier.toUpperCase()})!`);
    isGachaOpening = false;
    return;
  }

  const tierDef = RPG_TIERS[item.tier] || RPG_TIERS.common;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  const card = document.getElementById('gachaRevealCard');
  if (card) {
    card.style.backgroundColor = tierDef.bg;
    card.style.borderColor = tierDef.border;
    card.innerHTML = `
      <div class="text-5xl animate-bounce mb-2">
        ${item.slot === 'weapon' ? '🗡️' : item.slot === 'helmet' ? '🪖' : item.slot === 'armor' ? '🛡️' : item.slot === 'gloves' ? '🧤' : item.slot === 'boots' ? '👢' : '💍'}
      </div>
      <span class="text-xs font-mono-code font-bold uppercase px-2 py-0.5 rounded shadow-sm" style="color: white; background: ${tierDef.color}">
        ${tierDef.name} • ${item.slot.toUpperCase()}
      </span>
      <h3 class="font-display font-extrabold text-xl text-[#111] mt-2 mb-1" style="color: ${tierDef.color}">
        ${item.name}
      </h3>
      <p class="text-xs text-slate-600 italic max-w-sm mx-auto mb-3">${item.desc}</p>
      
      <div class="bg-white/80 p-2.5 border border-[#111] text-xs font-mono-code font-bold inline-block mb-3">
        ${item.stats.atk ? `⚔️ +${item.stats.atk} ATK ` : ''}
        ${item.stats.hp ? `❤️ +${item.stats.hp} HP ` : ''}
        ${item.stats.mp ? `🔮 +${item.stats.mp} MP ` : ''}
        ${item.stats.crit ? `💥 +${item.stats.crit}% Crit ` : ''}
        ${item.stats.dodge ? `💨 +${item.stats.dodge}% Né ` : ''}
      </div>

      <div class="flex gap-2 justify-center">
        <button type="button" onclick="closeGachaRevealModal(); if (typeof equipRpgItem === 'function') equipRpgItem('${item.id}');" class="neo-btn px-4 py-2 bg-[#141414] text-white font-display font-extrabold text-xs uppercase hover:bg-slate-800">
          ⚔️ Mặc Ngay Vào Người
        </button>
        <button type="button" onclick="closeGachaRevealModal()" class="neo-btn px-4 py-2 bg-white text-[#111] font-display font-extrabold text-xs uppercase">
          Cất Vào Túi Đồ
        </button>
      </div>
    `;
  }
}

function closeGachaRevealModal() {
  const modal = document.getElementById('gachaRevealModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  isGachaOpening = false;
}

// 3. ==================== LÒ RÈN CƯỜNG HÓA (+1 ĐẾN +10) ====================
let selectedForgeSlot = 'weapon';

function renderForgeView() {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user || !user.equipped) return;

  const slotSelect = document.getElementById('forgeSlotSelect');
  if (slotSelect) selectedForgeSlot = slotSelect.value;

  const currentItemId = user.equipped[selectedForgeSlot];
  const item = currentItemId ? getRpgEquipmentById(currentItemId) : null;
  const container = document.getElementById('forgeItemContainer');
  if (!container) return;

  if (!item) {
    container.innerHTML = `
      <div class="p-8 text-center text-xs font-bold text-slate-400">
        Bạn chưa trang bị món đồ nào ở ô này. Hãy vào 🎒 Túi Đồ để mặc trang bị trước khi cường hóa!
      </div>
    `;
    return;
  }

  if (!user.equipment_enhances) user.equipment_enhances = {};
  const currentEnhanceLevel = user.equipment_enhances[selectedForgeSlot] || 0;
  const isMax = currentEnhanceLevel >= 10;
  const nextLevel = currentEnhanceLevel + 1;
  const costGold = (nextLevel) * 75;
  const costStones = Math.ceil(nextLevel / 3);

  container.innerHTML = `
    <div class="p-4 bg-white border-2 border-[#111] shadow-[3px_3px_0px_#111] space-y-3">
      <div class="flex items-center justify-between border-b pb-2 border-slate-200">
        <div>
          <span class="text-xs font-mono-code font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            CẤP HIỆN TẠI: +${currentEnhanceLevel}
          </span>
          <h4 class="font-display font-extrabold text-base text-[#111] mt-1">${item.name} (+${currentEnhanceLevel})</h4>
        </div>
        <div class="text-3xl">${selectedForgeSlot === 'weapon' ? '🗡️' : selectedForgeSlot === 'helmet' ? '🪖' : '🛡️'}</div>
      </div>

      <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 border border-slate-200 text-xs font-mono-code">
        <div>Chỉ số cơ bản: <b>+${item.stats.atk || 0} ATK, +${item.stats.hp || 0} HP</b></div>
        <div>Tăng thêm từ Lò Rèn: <b class="text-emerald-600">+${currentEnhanceLevel * 15}% Chỉ số</b></div>
      </div>

      ${!isMax ? `
        <div class="bg-amber-50 p-2.5 border border-amber-300 text-xs font-bold flex items-center justify-between">
          <span>Chi phí lên +${nextLevel}:</span>
          <span class="text-yellow-700">${costGold} 🪙 Vàng + ${costStones} 💎 Đá Cường Hóa</span>
        </div>
        <button type="button" onclick="performItemEnhance('${selectedForgeSlot}')" class="neo-btn w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#111]">
          <span>🔨 ĐẬP ĐỒ LÊN +${nextLevel}</span>
        </button>
      ` : `
        <div class="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold text-center rounded border border-emerald-400">
          👑 MÓN ĐỒ ĐÃ ĐẠT CẤP ĐỘ CƯỜNG HÓA TỐI THƯỢNG (+10) HOÀNG KIM!
        </div>
      `}
    </div>
  `;
}

function performItemEnhance(slot) {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user || !user.equipped || !user.equipped[slot]) return;

  if (!user.equipment_enhances) user.equipment_enhances = {};
  const currentLvl = user.equipment_enhances[slot] || 0;
  if (currentLvl >= 10) return;

  const nextLvl = currentLvl + 1;
  const costGold = nextLvl * 75;
  const costStones = Math.ceil(nextLvl / 3);

  if ((user.gold || 0) < costGold) {
    alert(`Không đủ Vàng! Cần ${costGold} 🪙 Vàng.`);
    return;
  }
  if ((user.enhance_stones || 0) < costStones) {
    alert(`Không đủ Đá Cường Hóa! Cần ${costStones} 💎 Đá Cường Hóa.`);
    return;
  }

  user.gold -= costGold;
  user.enhance_stones -= costStones;

  // Tỉ lệ thành công: 100% cho 1-3, 85% cho 4-6, 70% cho 7-9, 50% cho 10
  const rate = nextLvl <= 3 ? 1.0 : (nextLvl <= 6 ? 0.85 : (nextLvl <= 8 ? 0.70 : 0.50));
  const isSuccess = Math.random() < rate;

  playAnvilHammerSound();

  if (isSuccess) {
    user.equipment_enhances[slot] = nextLvl;
    if (typeof showToastAlert === 'function') {
      showToastAlert(`🔥 CHÚC MỪNG! Đập đồ thành công rực rỡ lên +${nextLvl}!`);
    }
  } else {
    if (typeof showToastAlert === 'function') {
      showToastAlert(`💥 Đập đồ thất bại! Rất may trang bị không bị vỡ.`);
    }
  }

  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  renderShopTopCurrencies();
  renderForgeView();
  if (typeof updateTopHud === 'function') updateTopHud();
}

// ==================== TỔNG HỢP ÂM THANH GACHA & SHOP ====================
function playShopBuySound() {
  try {
    if (typeof getAudioCtx === 'function') {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {}
}

function playAnvilHammerSound() {
  try {
    if (typeof getAudioCtx === 'function') {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

function playGachaFanfareSound(tier) {
  try {
    if (typeof getAudioCtx === 'function') {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const notes = tier === 'legendary' ? [523.25, 659.25, 783.99, 1046.50, 1318.51] : [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    }
  } catch (e) {}
}
