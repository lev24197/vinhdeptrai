// ==================== HỆ THỐNG TÚI ĐỒ & TRANG BỊ PAPERDOLL (INVENTORY SYSTEM) ====================

let currentInventoryFilter = 'all';
let selectedInventoryItem = null;

// Khởi tạo trang bị mặc định ban đầu nếu tài khoản mới chưa có
function ensureUserEquipmentInitialized(user) {
  if (!user) user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;

  if (!user.equipped) {
    user.equipped = {
      weapon: null,
      helmet: null,
      armor: null,
      gloves: null,
      boots: null,
      accessory: null
    };
  }

  if (!user.equipment_inventory) {
    user.equipment_inventory = [];
  }

  if (typeof user.dust === 'undefined') user.dust = 20;
  if (typeof user.enhance_stones === 'undefined') user.enhance_stones = 5;
  if (typeof user.gacha_pity === 'undefined') user.gacha_pity = 0;

  // Nếu người chơi chưa có bất kỳ trang bị nào, tặng ngay bộ đồ khởi đầu theo hệ phái
  const hasAnyGear = Object.values(user.equipped).some(Boolean) || user.equipment_inventory.length > 0;
  if (!hasAnyGear) {
    const cls = user.rpg_class || 'warrior';
    if (cls === 'mage') {
      user.equipped.weapon = 'wp_m_oak';
      user.equipped.helmet = 'hm_apprentice_hood';
      user.equipped.armor = 'ar_apprentice_robe';
      user.equipped.gloves = 'gl_silk_mitts';
      user.equipped.boots = 'bt_apprentice_slippers';
      user.equipped.accessory = 'ac_scholar_pendant';
      user.equipment_inventory.push('wp_m_sapphire', 'ar_cloth_tunic', 'ac_copper_ring');
    } else if (cls === 'ranger') {
      user.equipped.weapon = 'wp_r_hunter';
      user.equipped.helmet = 'hm_hunter_beret';
      user.equipped.armor = 'ar_ranger_tunic';
      user.equipped.gloves = 'gl_hunter_grips';
      user.equipped.boots = 'bt_leather_boots';
      user.equipped.accessory = 'ac_silver_band';
      user.equipment_inventory.push('wp_r_iron', 'ar_cloth_tunic', 'ac_copper_ring');
    } else if (cls === 'assassin') {
      user.equipped.weapon = 'wp_a_rookie';
      user.equipped.helmet = 'hm_shadow_mask';
      user.equipped.armor = 'ar_shadow_garb';
      user.equipped.gloves = 'gl_thief_fingerless';
      user.equipped.boots = 'bt_stealth_treads';
      user.equipped.accessory = 'ac_shadow_locket';
      user.equipment_inventory.push('wp_a_shadow', 'ar_cloth_tunic', 'ac_copper_ring');
    } else {
      user.equipped.weapon = 'wp_w_wood';
      user.equipped.helmet = 'hm_iron_helm';
      user.equipped.armor = 'ar_iron_breastplate';
      user.equipped.gloves = 'gl_cloth_wraps';
      user.equipped.boots = 'bt_rag_shoes';
      user.equipped.accessory = 'ac_copper_ring';
      user.equipment_inventory.push('wp_w_iron', 'ar_leather_vest', 'ac_silver_band');
    }

    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
  }
}

// Tính toán tổng chỉ số hiệp sĩ (Base + All Equipment + Set Bonuses)
function calculatePlayerTotalStats(user) {
  if (!user) user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  const base = {
    atk: 25 + ((user?.level || 1) - 1) * 4,
    hp: (user?.max_hp || 100),
    mp: (user?.max_mp || 40),
    crit: (user?.rpg_class === 'assassin' ? 12 : 5),
    dodge: (user?.rpg_class === 'assassin' ? 10 : (user?.rpg_class === 'ranger' ? 8 : 4)),
    expBonus: (user?.rpg_class === 'mage' ? 10 : 0),
    goldBonus: (user?.rpg_class === 'assassin' ? 15 : 0),
    reflexBonus: 0
  };

  if (!user || !user.equipped) return base;

  const eq = user.equipped;
  const equippedIds = Object.values(eq).filter(Boolean);

  equippedIds.forEach(id => {
    const item = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(id) : null;
    if (item && item.stats) {
      if (item.stats.atk) base.atk += item.stats.atk;
      if (item.stats.hp) base.hp += item.stats.hp;
      if (item.stats.mp) base.mp += item.stats.mp;
      if (item.stats.crit) base.crit += item.stats.crit;
      if (item.stats.dodge) base.dodge += item.stats.dodge;
      if (item.stats.expBonus) base.expBonus += item.stats.expBonus;
      if (item.stats.goldBonus) base.goldBonus += item.stats.goldBonus;
    }
  });

  // Cộng thêm hiệu ứng Set đồ nếu kích hoạt
  if (typeof calculateActiveSetBonuses === 'function') {
    const activeSets = calculateActiveSetBonuses(equippedIds);
    activeSets.forEach(s => {
      if (s.setKey === 'oxford') base.expBonus += (s.tier >= 4 ? 50 : 25);
      if (s.setKey === 'dragon') base.atk += (s.tier >= 4 ? 35 : 15);
      if (s.setKey === 'chrono') { base.crit += 10; base.goldBonus += 25; }
      if (s.setKey === 'shadow') base.dodge += (s.tier >= 4 ? 20 : 10);
      if (s.setKey === 'anki_god') { base.atk += 50; base.hp += 180; base.crit += 15; }
    });
  }

  // Cá»™ng thÃªm chá»‰ sá»‘ CÆ°á»ng HÃ³a tá»« LÃ² RÃ¨n (+15% stats má»—i cáº¥p cÆ°á»ng hÃ³a)
  if (user.equipment_enhances) {
    Object.keys(eq).forEach(slot => {
      const enhLvl = user.equipment_enhances[slot] || 0;
      if (enhLvl > 0 && eq[slot]) {
        const item = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(eq[slot]) : null;
        if (item && item.stats) {
          const mult = enhLvl * 0.15;
          if (item.stats.atk) base.atk += Math.round(item.stats.atk * mult);
          if (item.stats.hp) base.hp += Math.round(item.stats.hp * mult);
          if (item.stats.mp) base.mp += Math.round(item.stats.mp * mult);
          if (item.stats.crit) base.crit += Math.round(item.stats.crit * mult);
          if (item.stats.dodge) base.dodge += Math.round(item.stats.dodge * mult);
        }
      }
    });
  }

  // Cá»™ng thÃªm ThiÃªn phÃº Bá»‹ Äá»™ng tá»« Báº£ng Ká»¹ NÄƒng Há»‡ PhÃ¡i (GamificationSkills)
  const skills = user.skills_unlocked || {};
  const uClass = user.rpg_class || 'warrior';
  if (uClass === 'warrior') {
    if (skills.passive_1) {
      base.hp += 30; // +30 Max HP
      base.def = (base.def || 0) + 15; // +15 GiÃ¡p phÃ²ng thá»§
    }
  } else if (uClass === 'mage') {
    if (skills.passive_2) {
      base.mp += 25; // +25 Max MP
      base.atk += 15; // +15 ATK phÃ©p
    }
  } else if (uClass === 'ranger') {
    if (skills.passive_1) {
      base.crit += 15; // +15% Báº¡o kÃ­ch
    }
    if (skills.passive_2) {
      base.goldBonus += 30; // +30% VÃ ng rÆ¡i
    }
  } else if (uClass === 'assassin') {
    if (skills.passive_2) {
      base.dodge += 15; // +15% NÃ© Ä‘Ã²n
    }
  }

  // Cá»™ng thÃªm Buff tá»« Báº¡n Äá»“ng HÃ nh Linh ThÃº (GamificationPets)
  const petId = user.equipped_pet || (user.pets ? 'wise_owl' : null);
  if (petId) {
    if (petId === 'wise_owl') {
      base.expBonus += 25; // +25% EXP há»c tá»« vá»±ng
    } else if (petId === 'baby_drake') {
      base.atk += 10; // +10 ATK trá»±c tiáº¿p
    } else if (petId === 'fortune_cat') {
      base.goldBonus += 35; // +35% VÃ ng rÆ¡i
    } else if (petId === 'frost_kitsune') {
      base.dodge += 5; // +5% NÃ© Ä‘Ã²n ma thuáº­t
      base.def = (base.def || 0) + 10;
    }
  }

  return base;
}

// Thao tác Trang Bị một món đồ vào người
function equipRpgItem(itemId) {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;
  ensureUserEquipmentInitialized(user);

  const item = getRpgEquipmentById(itemId);
  if (!item) return;

  // Kiểm tra yêu cầu hệ phái
  if (item.reqClass !== 'all' && item.reqClass !== user.rpg_class) {
    alert(`Món đồ này chỉ dành riêng cho hệ phái [${item.reqClass.toUpperCase()}]! Bạn là [${user.rpg_class.toUpperCase()}].`);
    return;
  }

  const slot = item.slot;
  const currentEquippedId = user.equipped[slot];

  // Bỏ món đồ mới ra khỏi túi
  const idx = user.equipment_inventory.indexOf(itemId);
  if (idx !== -1) {
    user.equipment_inventory.splice(idx, 1);
  }

  // Nếu trước đó đang mặc đồ cũ, cất đồ cũ vào túi
  if (currentEquippedId) {
    user.equipment_inventory.push(currentEquippedId);
  }

  // Gắn món mới vào slot
  user.equipped[slot] = itemId;

  // Đồng bộ cả biến legacy cho tương thích ngược
  if (slot === 'weapon') user.equipped_weapon = item.name;
  if (slot === 'armor') user.equipped_armor = item.name;

  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  playInventoryEquipSound();
  if (typeof showToastAlert === 'function') {
    showToastAlert(`⚔️ Đã trang bị thành công: ${item.name}!`);
  }

  // Cập nhật lại giao diện
  renderInventoryModal();
  if (typeof updateTopHud === 'function') updateTopHud();
  if (typeof BattleEngine !== 'undefined' && BattleEngine.active) {
    BattleEngine.updateBattleUI();
  }
}

// Tháo trang bị trên người cất vào túi
function unequipRpgSlot(slot) {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user || !user.equipped || !user.equipped[slot]) return;

  const itemId = user.equipped[slot];
  const item = getRpgEquipmentById(itemId);

  user.equipped[slot] = null;
  user.equipment_inventory.push(itemId);

  if (slot === 'weapon') user.equipped_weapon = 'Tay Không';
  if (slot === 'armor') user.equipped_armor = 'Áo Thường';

  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  playInventoryEquipSound();
  if (typeof showToastAlert === 'function') {
    showToastAlert(`📦 Đã tháo ${item ? item.name : slot} cất vào túi đồ!`);
  }

  renderInventoryModal();
  if (typeof updateTopHud === 'function') updateTopHud();
  if (typeof BattleEngine !== 'undefined' && BattleEngine.active) {
    BattleEngine.updateBattleUI();
  }
}

// Rã trang bị cũ để nhận lại Vàng và Bụi Ma Pháp (Salvage / Dismantle)
function salvageRpgItem(itemId) {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user || !user.equipment_inventory) return;

  const item = getRpgEquipmentById(itemId);
  if (!item) return;

  if (!confirm(`Bạn có chắc muốn RÃ món [${item.name}] thành ${item.salvageDust || 10} 🔮 Bụi Ma Pháp và ${item.sellPrice || 20} 🪙 Vàng không?`)) {
    return;
  }

  const idx = user.equipment_inventory.indexOf(itemId);
  if (idx !== -1) {
    user.equipment_inventory.splice(idx, 1);
  }

  user.dust = (user.dust || 0) + (item.salvageDust || 10);
  user.gold = (user.gold || 0) + (item.sellPrice || 20);

  if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

  selectedInventoryItem = null;
  if (typeof showToastAlert === 'function') {
    showToastAlert(`✨ Đã rã [${item.name}]: +${item.salvageDust || 10} Bụi 🔮 & +${item.sellPrice || 20} Vàng 🪙!`);
  }

  renderInventoryModal();
  if (typeof updateTopHud === 'function') updateTopHud();
}

// Bật / Tắt Modal Túi Đồ
function openInventoryModal() {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  ensureUserEquipmentInitialized(user);

  const modal = document.getElementById('rpgInventoryModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderInventoryModal();
}

function closeInventoryModal() {
  const modal = document.getElementById('rpgInventoryModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function setInventoryFilter(filter) {
  currentInventoryFilter = filter;
  document.querySelectorAll('.inv-filter-btn').forEach(btn => {
    btn.className = 'inv-filter-btn px-2.5 py-1 text-xs font-bold border border-[#111] bg-white text-[#111] hover:bg-slate-100';
  });
  const activeBtn = document.getElementById('invFilterBtn-' + filter);
  if (activeBtn) {
    activeBtn.className = 'inv-filter-btn px-2.5 py-1 text-xs font-bold border border-[#111] bg-[#111] text-white';
  }
  renderInventoryGrid();
}

// Render toàn bộ giao diện Modal Túi Đồ
function renderInventoryModal() {
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  if (!user) return;
  ensureUserEquipmentInitialized(user);

  // 1. Cập nhật Tài nguyên trên đỉnh Modal
  const goldEl = document.getElementById('invUserGold');
  if (goldEl) goldEl.innerText = user.gold || 0;
  const gemsEl = document.getElementById('invUserGems');
  if (gemsEl) gemsEl.innerText = user.gems || 0;
  const dustEl = document.getElementById('invUserDust');
  if (dustEl) dustEl.innerText = user.dust || 0;
  const stonesEl = document.getElementById('invUserStones');
  if (stonesEl) stonesEl.innerText = user.enhance_stones || 0;

  // 2. Render 6 Ô Paperdoll Trang Bị
  renderPaperdollSlots(user);

  // 3. Render Tổng Bảng Chỉ Số Thực Chiến
  renderTotalStatsSummary(user);

  // 4. Render Kho Lưới Vật Phẩm
  renderInventoryGrid();

  // 5. Render Thẻ So Sánh / Chi Tiết Món Đang Chọn
  renderItemComparisonCard(selectedInventoryItem);
}

function renderPaperdollSlots(user) {
  const slots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];
  const slotLabels = {
    weapon: '⚔️ Vũ Khí',
    helmet: '🪖 Mũ / Nón',
    armor: '🥋 Áo Giáp',
    gloves: '🧤 Găng Tay',
    boots: '👢 Ủng Giày',
    accessory: '💍 Phụ Kiện'
  };

  slots.forEach(slot => {
    const el = document.getElementById('paperdollSlot-' + slot);
    if (!el) return;

    const itemId = user.equipped?.[slot];
    const item = itemId ? getRpgEquipmentById(itemId) : null;

    if (item) {
      const tierDef = RPG_TIERS[item.tier] || RPG_TIERS.common;
      el.className = `neo-btn p-2 text-left flex items-center justify-between gap-2 border-2 border-[#111] transition group cursor-pointer`;
      el.style.backgroundColor = tierDef.bg;
      el.style.borderColor = tierDef.border;
      el.innerHTML = `
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="text-lg">${slot === 'weapon' ? '🗡️' : slot === 'helmet' ? '🪖' : slot === 'armor' ? '🛡️' : slot === 'gloves' ? '🧤' : slot === 'boots' ? '👢' : '💍'}</span>
          <div class="truncate">
            <div class="text-[10px] uppercase font-bold text-slate-500">${slotLabels[slot]}</div>
            <div class="font-display font-extrabold text-xs text-[#111] truncate" style="color: ${tierDef.color}">${item.name}</div>
          </div>
        </div>
        <button type="button" onclick="event.stopPropagation(); unequipRpgSlot('${slot}')" class="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600" title="Tháo cất vào túi">Tháo</button>
      `;
      el.onclick = () => {
        selectedInventoryItem = item;
        renderItemComparisonCard(item);
      };
    } else {
      el.className = `p-2 text-left flex items-center justify-between gap-2 border-2 border-dashed border-slate-400 bg-slate-50 text-slate-400`;
      el.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-base opacity-40">➕</span>
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-400">${slotLabels[slot]}</div>
            <div class="text-xs font-semibold italic text-slate-400">Chưa trang bị</div>
          </div>
        </div>
      `;
      el.onclick = null;
    }
  });

  // Hiển thị Set Bonus nếu kích hoạt
  const setBonusContainer = document.getElementById('invActiveSetBonuses');
  if (setBonusContainer) {
    const equippedIds = Object.values(user.equipped || {}).filter(Boolean);
    const activeSets = (typeof calculateActiveSetBonuses === 'function') ? calculateActiveSetBonuses(equippedIds) : [];
    if (activeSets.length > 0) {
      setBonusContainer.innerHTML = activeSets.map(s => `
        <div class="p-1.5 bg-emerald-50 border border-emerald-500 text-emerald-800 text-[11px] font-bold rounded flex items-center gap-1.5">
          <span>${s.setDef.icon}</span>
          <span><b>${s.setDef.name}</b> (${s.count} món kích hoạt): ${s.tier >= 4 ? s.setDef.desc4 : s.setDef.desc2}</span>
        </div>
      `).join('');
      setBonusContainer.classList.remove('hidden');
    } else {
      setBonusContainer.classList.add('hidden');
    }
  }
}

function renderTotalStatsSummary(user) {
  const stats = calculatePlayerTotalStats(user);
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setVal('statValAtk', `${stats.atk} ⚔️`);
  setVal('statValHp', `${stats.hp} ❤️`);
  setVal('statValMp', `${stats.mp} 🔮`);
  setVal('statValCrit', `${stats.crit}% 💥`);
  setVal('statValDodge', `${stats.dodge}% 💨`);
  setVal('statValExpBonus', `+${stats.expBonus}% 🎓`);
  setVal('statValGoldBonus', `+${stats.goldBonus}% 🪙`);
}

function renderInventoryGrid() {
  const container = document.getElementById('invItemsGridContainer');
  if (!container) return;

  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  const inv = user?.equipment_inventory || [];

  let items = inv.map(id => getRpgEquipmentById(id)).filter(Boolean);

  if (currentInventoryFilter !== 'all') {
    if (currentInventoryFilter === 'consumable') {
      // Các vật phẩm tiêu hao (Máu, MP, Gợi ý)
      items = [];
    } else {
      items = items.filter(item => item.slot === currentInventoryFilter);
    }
  }

  const countBadge = document.getElementById('invItemsCountLabel');
  if (countBadge) countBadge.innerText = `${items.length} / 40 ô`;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs font-bold text-slate-400">
        Không có món đồ nào trong danh mục này. Hãy ghé 🛍️ Cửa Hàng hoặc mở 🎁 Rương Báu để săn đồ nhé!
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const tierDef = RPG_TIERS[item.tier] || RPG_TIERS.common;
    const isSelected = selectedInventoryItem && selectedInventoryItem.id === item.id;
    return `
      <button type="button" onclick="selectItemToInspect('${item.id}')" class="neo-btn p-2 text-left flex flex-col justify-between border-2 transition group relative cursor-pointer ${isSelected ? '!border-[#111] shadow-[3px_3px_0px_#111] scale-102' : 'border-slate-300'}" style="background-color: ${tierDef.bg}">
        <div class="flex items-center justify-between gap-1 w-full">
          <span class="text-sm">${item.slot === 'weapon' ? '🗡️' : item.slot === 'helmet' ? '🪖' : item.slot === 'armor' ? '🛡️' : item.slot === 'gloves' ? '🧤' : item.slot === 'boots' ? '👢' : '💍'}</span>
          <span class="text-[9px] font-mono-code font-bold uppercase px-1 rounded" style="color: ${tierDef.color}; background: rgba(0,0,0,0.06)">${tierDef.name}</span>
        </div>
        <div class="font-display font-extrabold text-[11px] text-[#111] truncate mt-1" style="color: ${tierDef.color}">
          ${item.name}
        </div>
        <div class="text-[10px] font-mono-code text-slate-600 font-bold mt-0.5">
          ${item.stats.atk ? `+${item.stats.atk} ATK ` : ''}${item.stats.hp ? `+${item.stats.hp} HP ` : ''}${item.stats.mp ? `+${item.stats.mp} MP` : ''}
        </div>
      </button>
    `;
  }).join('');
}

function selectItemToInspect(itemId) {
  const item = getRpgEquipmentById(itemId);
  selectedInventoryItem = item;
  renderItemComparisonCard(item);
  renderInventoryGrid();
}

function renderItemComparisonCard(item) {
  const box = document.getElementById('invItemInspectCard');
  if (!box) return;

  if (!item) {
    box.innerHTML = `
      <div class="p-4 text-center text-xs font-semibold text-slate-400 italic">
        👈 Nhấp vào bất kỳ món đồ nào trong kho để xem so sánh chỉ số & trang bị
      </div>
    `;
    return;
  }

  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
  const currentEquippedId = user?.equipped?.[item.slot];
  const currentEquipped = currentEquippedId ? getRpgEquipmentById(currentEquippedId) : null;
  const isCurrentlyEquipped = (currentEquippedId === item.id);
  const tierDef = RPG_TIERS[item.tier] || RPG_TIERS.common;

  // Tính độ chênh lệch chỉ số so với đồ đang mặc
  const calcDiff = (statKey) => {
    const currentVal = currentEquipped?.stats?.[statKey] || 0;
    const newVal = item.stats?.[statKey] || 0;
    const diff = newVal - currentVal;
    if (diff > 0) return `<span class="text-emerald-600 font-bold ml-1">(+${diff} ▲)</span>`;
    if (diff < 0) return `<span class="text-red-500 font-bold ml-1">(${diff} ▼)</span>`;
    return `<span class="text-slate-400 ml-1">(=)</span>`;
  };

  box.innerHTML = `
    <div class="p-3 bg-white border-2 border-[#111] shadow-[2px_2px_0px_#111] space-y-2.5">
      <div class="flex items-center justify-between border-b pb-1.5 border-slate-200">
        <div>
          <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase" style="color: ${tierDef.color}; background: ${tierDef.bg}">
            ${tierDef.name} • ${item.slot.toUpperCase()}
          </span>
          <h4 class="font-display font-extrabold text-sm text-[#111] mt-0.5">${item.name}</h4>
        </div>
        <div class="text-right">
          <span class="text-xs font-mono-code font-bold text-amber-700">${item.reqClass === 'all' ? 'Tất cả hệ phái' : `Hệ ${item.reqClass.toUpperCase()}`}</span>
        </div>
      </div>

      <p class="text-[11px] text-slate-600 italic leading-snug">${item.desc}</p>

      <!-- Chỉ số so sánh -->
      <div class="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 border border-slate-200 text-xs font-mono-code">
        <div>Công (ATK): <b>+${item.stats.atk || 0}</b> ${calcDiff('atk')}</div>
        <div>Máu (HP): <b>+${item.stats.hp || 0}</b> ${calcDiff('hp')}</div>
        <div>Năng lượng (MP): <b>+${item.stats.mp || 0}</b> ${calcDiff('mp')}</div>
        <div>Bạo kích: <b>+${item.stats.crit || 0}%</b> ${calcDiff('crit')}</div>
        <div>Né đòn: <b>+${item.stats.dodge || 0}%</b> ${calcDiff('dodge')}</div>
        <div>Kinh nghiệm: <b>+${item.stats.expBonus || 0}%</b> ${calcDiff('expBonus')}</div>
      </div>

      ${item.passive ? `
        <div class="p-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold rounded">
          ⚡ Nội Tại: ${item.passive.label}
        </div>
      ` : ''}

      <!-- Nút thao tác -->
      <div class="flex items-center justify-between pt-1 gap-2">
        <div class="text-[11px] font-bold text-slate-500">
          Giá bán: <span class="text-yellow-600 font-extrabold">${item.sellPrice} 🪙</span>
        </div>
        <div class="flex items-center gap-1.5">
          ${isCurrentlyEquipped ? `
            <button type="button" onclick="unequipRpgSlot('${item.slot}')" class="neo-btn px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-xs uppercase">
              Tháo Ra
            </button>
          ` : `
            <button type="button" onclick="salvageRpgItem('${item.id}')" class="neo-btn px-2.5 py-1 bg-white hover:bg-slate-100 text-[#111] font-bold text-xs" title="Rã nhận Bụi ma pháp">
              🔮 Rã Đồ
            </button>
            <button type="button" onclick="equipRpgItem('${item.id}')" class="neo-btn px-4 py-1 bg-[#141414] hover:bg-slate-800 text-white font-display font-extrabold text-xs uppercase">
              ⚔️ Trang Bị
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// Âm thanh Web Audio khi mặc trang bị
function playInventoryEquipSound() {
  try {
    if (typeof audioCtx === 'undefined' || !audioCtx) {
      if (typeof getAudioCtx === 'function') getAudioCtx();
      else return;
    }
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {}
}
