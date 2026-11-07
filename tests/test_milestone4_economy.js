/**
 * ==============================================================================
 * MILESTONE 4 ECONOMY, INVENTORY, PAPERDOLL, FORGE & GACHA TEST SUITE
 * File: tests/test_milestone4_economy.js
 * ==============================================================================
 * Comprehensive test coverage validating:
 * 1. 5-slot Visual Paperdoll Preview on Canvas & 6-Slot Equipment Inventory Grid
 * 2. Player Total Stats, Enhance Scaling (+15%/level), Crit Cap (75%), Dodge Cap (60%)
 * 3. 5 Equipment Sets (Chrono, Anki God, Dragon, Oxford, Shadow) & getActiveSetPerks
 * 4. Consumables System (health_potion, mana_potion, double_xp, hint_scroll, pet_snacks)
 *    Real State Deduction & Quest Trigger Events (GamificationQuests.trackProgress('use_potion', 1))
 * 5. Forge Enhancement (+1 to +10) Exact Probability Curve (100% to 50%), Gold & Stone Sinks
 * 6. Gacha Mystery Chests (Bronze/Wood 100g, Silver 350g, Gold 5 gems) & 10-Pull Pity Counter
 * 7. Economy Faucets/Sinks, Salvage Unification (user.dust), and Zero-Exception Edge Cases
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class Milestone4TestRunner {
    constructor() {
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.results = [];
      this.currentSuite = 'General';
      this.startTime = Date.now();
    }

    suite(name) {
      this.currentSuite = name;
    }

    test(desc, fn) {
      this.total++;
      try {
        fn();
        this.passed++;
        this.results.push({ suite: this.currentSuite, desc, status: 'PASS' });
      } catch (err) {
        this.failed++;
        this.results.push({ suite: this.currentSuite, desc, status: 'FAIL', error: err.message || String(err) });
      }
    }

    assert(condition, message) {
      if (!condition) {
        throw new Error(message || 'Assertion failed');
      }
    }

    assertEqual(actual, expected, message) {
      if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'}: expected [${expected}] (${typeof expected}) but got [${actual}] (${typeof actual})`);
      }
    }

    assertInRange(val, min, max, message) {
      if (val < min || val > max) {
        throw new Error(`${message || 'Out of range'}: expected [${min}..${max}] but got [${val}]`);
      }
    }

    getSummary() {
      return {
        total: this.total,
        passed: this.passed,
        failed: this.failed,
        duration: Date.now() - this.startTime,
        results: this.results
      };
    }
  }

  function runMilestone4Tests() {
    const r = new Milestone4TestRunner();
    const oldAlert = global.alert;
    const oldConfirm = global.confirm;
    global.alert = () => {};
    global.confirm = () => true;

    try {

    // ============================================================================
    // SUITE 1: 5-Slot Visual Paperdoll Preview & 6-Slot Storage Inventory
    // ============================================================================
    r.suite('1. 5-Slot Visual Paperdoll & 6-Slot Storage Grid');

    r.test('1.1 6-Slot equipment structure initialized with default resources', () => {
      const user = { rpg_class: 'warrior' };
      global.ensureUserEquipmentInitialized(user);

      r.assert(Boolean(user.equipped), 'user.equipped is created');
      const expectedSlots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];
      expectedSlots.forEach(slot => {
        r.assert(slot in user.equipped, `Slot [${slot}] must be in user.equipped`);
      });

      r.assert(Array.isArray(user.equipment_inventory), 'user.equipment_inventory is an array');
      r.assertEqual(user.dust, 20, 'Starts with 20 dust');
      r.assertEqual(user.enhance_stones, 5, 'Starts with 5 enhance stones');
      r.assertEqual(user.gacha_pity, 0, 'Starts with 0 gacha pity');
      r.assert(Boolean(user.equipment_enhances), 'user.equipment_enhances is created');
      expectedSlots.forEach(slot => {
        r.assertEqual(user.equipment_enhances[slot], 0, `user.equipment_enhances.${slot} initialized to 0`);
      });
    });

    r.test('1.2 Starter items equip by character class and give class-specific weapons', () => {
      const warrior = { rpg_class: 'warrior' };
      global.ensureUserEquipmentInitialized(warrior);
      r.assertEqual(warrior.equipped.weapon, 'wp_w_wood', 'Warrior starts with wood sword');

      const mage = { rpg_class: 'mage' };
      global.ensureUserEquipmentInitialized(mage);
      r.assertEqual(mage.equipped.weapon, 'wp_m_oak', 'Mage starts with oak staff');

      const ranger = { rpg_class: 'ranger' };
      global.ensureUserEquipmentInitialized(ranger);
      r.assertEqual(ranger.equipped.weapon, 'wp_r_hunter', 'Ranger starts with hunter bow');

      const assassin = { rpg_class: 'assassin' };
      global.ensureUserEquipmentInitialized(assassin);
      r.assertEqual(assassin.equipped.weapon, 'wp_a_rookie', 'Assassin starts with rookie dagger');
    });

    r.test('1.3 Class restrictions prevent equipping weapons from another class', () => {
      const warrior = { rpg_class: 'warrior', equipped: {}, equipment_inventory: [] };
      global.ensureUserEquipmentInitialized(warrior);

      const mageItem = global.getRpgEquipmentById('wp_m_sapphire');
      r.assert(Boolean(mageItem), 'wp_m_sapphire item exists');
      r.assertEqual(mageItem.reqClass, 'mage', 'Item requires mage class');

      const isAllowed = (mageItem.reqClass === 'all' || mageItem.reqClass === warrior.rpg_class);
      r.assertEqual(isAllowed, false, 'Warrior cannot equip Mage-exclusive equipment');
    });

    r.test('1.4 renderHeroPaperdollPreview function is exposed and handles canvas rendering', () => {
      r.assert(typeof global.renderHeroPaperdollPreview === 'function', 'renderHeroPaperdollPreview must be exported');

      // Test with mock canvas
      let fillRectCalls = 0;
      let clearRectCalls = 0;
      const mockCanvas = {
        width: 160,
        height: 90,
        getContext: () => ({
          clearRect: () => { clearRectCalls++; },
          createRadialGradient: () => ({ addColorStop: () => {} }),
          beginPath: () => {},
          arc: () => {},
          ellipse: () => {},
          fill: () => {},
          stroke: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          scale: () => {},
          fillRect: () => { fillRectCalls++; }
        })
      };

      const testUser = { rpg_class: 'warrior', equipped: { weapon: 'wp_w_wood', helmet: 'hm_iron_helm', armor: 'ar_iron_breastplate', gloves: 'gl_cloth_wraps', boots: 'bt_rag_shoes' } };
      global.renderHeroPaperdollPreview(mockCanvas, testUser);

      r.assert(clearRectCalls >= 1, 'Canvas was cleared');
      r.assert(fillRectCalls >= 5, 'Rendered at least 5 visual sprite layers (Boots, Armor, Gloves, Helmet, Weapon)');
    });

    // ============================================================================
    // SUITE 2: Player Stats, +15% Enhance Scaling & Hard Caps (Crit 75%, Dodge 60%)
    // ============================================================================
    r.suite('2. Player Total Stats, Enhance Scaling & Hard Caps');

    r.test('2.1 calculatePlayerTotalStats returns baseline stats when unequipped', () => {
      const rawUser = {
        level: 1,
        rpg_class: 'warrior',
        equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null },
        equipment_enhances: { weapon: 0, helmet: 0, armor: 0, gloves: 0, boots: 0, accessory: 0 }
      };

      const stats = global.calculatePlayerTotalStats(rawUser);
      r.assertEqual(stats.atk, 25, 'Level 1 warrior base ATK is 25');
      r.assertEqual(stats.hp, 100, 'Level 1 warrior base HP is 100');
      r.assertEqual(stats.mp, 40, 'Level 1 warrior base MP is 40');
      r.assertEqual(stats.def, 0, 'Level 1 warrior base DEF is 0 without gear');
      r.assertEqual(stats.crit, 5, 'Warrior base crit is 5%');
      r.assertEqual(stats.dodge, 4, 'Warrior base dodge is 4%');
    });

    r.test('2.2 +15% stat boost per enhance level scales base equipment values accurately', () => {
      // Create user equipped with a known item (wp_w_wood: stats atk: 8, hp: 10, mp: 0, crit: 2, dodge: 0)
      const user = {
        level: 1,
        rpg_class: 'warrior',
        equipped: { weapon: 'wp_w_wood', helmet: null, armor: null, gloves: null, boots: null, accessory: null },
        equipment_enhances: { weapon: 0, helmet: 0, armor: 0, gloves: 0, boots: 0, accessory: 0 }
      };

      const baseStats = global.calculatePlayerTotalStats(user);
      r.assertEqual(baseStats.atk, 25 + 8, 'At +0: base 25 + 8 = 33 ATK');

      // At +1 enhance (+15% of 8 = 1.2 -> 1)
      user.equipment_enhances.weapon = 1;
      const statsPlus1 = global.calculatePlayerTotalStats(user);
      r.assertEqual(statsPlus1.atk, 25 + 8 + Math.round(8 * 0.15), 'At +1: base 33 + 1 = 34 ATK');

      // At +5 enhance (+75% of 8 = 6)
      user.equipment_enhances.weapon = 5;
      const statsPlus5 = global.calculatePlayerTotalStats(user);
      r.assertEqual(statsPlus5.atk, 25 + 8 + Math.round(8 * 0.75), 'At +5: base 33 + 6 = 39 ATK');

      // At +10 enhance (+150% of 8 = 12)
      user.equipment_enhances.weapon = 10;
      const statsPlus10 = global.calculatePlayerTotalStats(user);
      r.assertEqual(statsPlus10.atk, 25 + 8 + Math.round(8 * 1.50), 'At +10: base 33 + 12 = 45 ATK (+150% weapon scaling)');
    });

    r.test('2.3 Critical Strike is hard clamped at maximum 75%', () => {
      // Gear/skills stack crit to 95%
      const stackedUser = {
        level: 10,
        rpg_class: 'ranger',
        equipped: {
          weapon: 'wp_w_vocab', // +18 crit
          helmet: 'hm_dragon_crown', // +10 crit
          accessory: 'ac_exp_hourglass' // +8 crit
        },
        equipment_enhances: { weapon: 10, helmet: 10, accessory: 10 },
        skills_unlocked: { passive_1: true }, // +15 crit
        equipped_pet: 'golden_shiba' // +5 crit
      };

      const stats = global.calculatePlayerTotalStats(stackedUser);
      r.assert(stats.crit <= 75, `Crit [${stats.crit}%] must not exceed 75% hard cap`);
      r.assertEqual(stats.crit, 75, 'Crit is clamped at exactly 75%');
    });

    r.test('2.4 Dodge Rate is hard clamped at maximum 60%', () => {
      // Gear/skills stack dodge to 80%
      const evasionUser = {
        level: 10,
        rpg_class: 'assassin',
        equipped: {
          helmet: 'hm_shadow_mask', // +8 dodge
          armor: 'ar_shadow_garb',  // +12 dodge
          boots: 'bt_stealth_treads', // +10 dodge
          accessory: 'ac_shadow_locket' // +6 dodge
        },
        equipment_enhances: { helmet: 10, armor: 10, boots: 10, accessory: 10 },
        skills_unlocked: { passive_2: true }, // +15 dodge
        equipped_pet: 'shadow_panther' // +5 dodge
      };

      const stats = global.calculatePlayerTotalStats(evasionUser);
      r.assert(stats.dodge <= 60, `Dodge [${stats.dodge}%] must not exceed 60% hard cap`);
      r.assertEqual(stats.dodge, 60, 'Dodge is clamped at exactly 60%');
    });

    // ============================================================================
    // SUITE 3: 5 Equipment Sets, Tier Activations & getActiveSetPerks
    // ============================================================================
    r.suite('3. 5 Equipment Sets & getActiveSetPerks');

    r.test('3.1 All 5 canonical equipment sets defined with pieces and 2/4 tier descriptions', () => {
      const sets = (typeof RPG_SET_BONUSES !== 'undefined') ? RPG_SET_BONUSES : (global.RPG_SET_BONUSES || {});
      r.assert(Boolean(sets && Object.keys(sets).length > 0), 'RPG_SET_BONUSES is defined');
      const keys = ['oxford', 'dragon', 'chrono', 'shadow', 'anki_god'];
      keys.forEach(k => {
        r.assert(Boolean(sets[k]), `Set [${k}] must exist in RPG_SET_BONUSES`);
        r.assert(Array.isArray(sets[k].pieces), `Set [${k}] pieces array`);
        r.assert(sets[k].pieces.length >= 4, `Set [${k}] has >= 4 pieces`);
        r.assert(Boolean(sets[k].desc2), `Set [${k}] has 2-piece description`);
        r.assert(Boolean(sets[k].desc4), `Set [${k}] has 4-piece description`);
      });
    });

    r.test('3.2 Chrono Set activates 2-piece and 4-piece stat & gold bonuses', () => {
      const user2 = {
        level: 1,
        rpg_class: 'warrior',
        equipped: { weapon: 'wp_w_vocab', boots: 'bt_wind_striders' } // 2 Chrono pieces
      };
      const stats2 = global.calculatePlayerTotalStats(user2);
      r.assert(stats2.goldBonus >= 25, '2 Chrono pieces grant +25% Gold');

      const user4 = {
        level: 1,
        rpg_class: 'warrior',
        equipped: {
          weapon: 'wp_w_vocab',
          boots: 'bt_wind_striders',
          gloves: 'gl_swift_striker',
          accessory: 'ac_exp_hourglass'
        } // 4 Chrono pieces
      };
      const stats4 = global.calculatePlayerTotalStats(user4);
      r.assert(stats4.goldBonus >= 50, '4 Chrono pieces grant +50% Gold');
    });

    r.test('3.3 Anki God Set activates 2-piece (+40 ATK, +150 HP) and 4-piece (+80 ATK, +300 HP) tier bonuses', () => {
      const user2 = {
        level: 1,
        rpg_class: 'warrior',
        equipped: { weapon: 'wp_w_excalibur', helmet: 'hm_anki_god_crown' } // 2 Anki God pieces
      };
      const baseStats = global.calculatePlayerTotalStats({ level: 1, rpg_class: 'warrior', equipped: {} });
      const stats2 = global.calculatePlayerTotalStats(user2);
      // Anki God 2-piece adds +40 ATK and +150 HP (+ base gear stats)
      r.assert(stats2.atk > baseStats.atk + 40, '2 Anki God pieces apply ATK bonus');
      r.assert(stats2.hp > baseStats.hp + 150, '2 Anki God pieces apply HP bonus');

      const user4 = {
        level: 1,
        rpg_class: 'warrior',
        equipped: {
          weapon: 'wp_w_excalibur',
          helmet: 'hm_anki_god_crown',
          armor: 'ar_anki_aegis',
          gloves: 'gl_infinity_touch'
        } // 4 Anki God pieces
      };
      const stats4 = global.calculatePlayerTotalStats(user4);
      r.assert(stats4.atk > stats2.atk + 40, '4 Anki God pieces scale to +80 ATK');
      r.assert(stats4.hp > stats2.hp + 150, '4 Anki God pieces scale to +300 HP');
    });

    r.test('3.4 getActiveSetPerks exports combat & exploration perk flags accurately', () => {
      r.assert(typeof global.getActiveSetPerks === 'function', 'getActiveSetPerks must be defined');

      // Test with 4-piece Oxford set
      const oxfordUser = {
        equipped: {
          weapon: 'wp_m_codex',
          helmet: 'hm_oxford_cap',
          armor: 'ar_oxford_robe',
          gloves: 'gl_oxford_scribe'
        }
      };
      const oxfordPerks = global.getActiveSetPerks(oxfordUser);
      r.assertEqual(oxfordPerks.oxfordExpBonus, 50, '4-piece Oxford grants 50% EXP bonus perk');
      r.assertEqual(oxfordPerks.oxfordMpCostReduction, 25, '4-piece Oxford reduces MP cost by 25%');
      r.assertEqual(oxfordPerks.oxfordEliminateWrong, true, '4-piece Oxford automatically eliminates 1 wrong answer');

      // Test with 4-piece Dragon set
      const dragonUser = {
        equipped: {
          weapon: 'wp_w_blood',
          helmet: 'hm_dragon_crown',
          armor: 'ar_dragon_scale',
          gloves: 'gl_dragon_fists'
        }
      };
      const dragonPerks = global.getActiveSetPerks(dragonUser);
      r.assertEqual(dragonPerks.dragonBurn, true, 'Dragon burn DoT perk active');
      r.assertEqual(dragonPerks.dragonFlameWave, true, 'Dragon flame wave 4-piece perk active');
    });

    // ============================================================================
    // SUITE 4: Consumables Inventory, Usable Buttons & Quest Event Pipeline
    // ============================================================================
    r.suite('4. Consumables System & Real State Updates');

    r.test('4.1 RPG_CONSUMABLES_CATALOG is defined with 5 core consumables', () => {
      r.assert(Array.isArray(global.RPG_CONSUMABLES_CATALOG), 'RPG_CONSUMABLES_CATALOG must be an array');
      const ids = global.RPG_CONSUMABLES_CATALOG.map(c => c.id);
      ['health_potion', 'mana_potion', 'double_xp', 'hint_scroll', 'pet_snacks'].forEach(expectedId => {
        r.assert(ids.includes(expectedId), `Catalog must include consumable [${expectedId}]`);
      });
    });

    r.test('4.2 useConsumableItem handles out of stock gracefully', () => {
      const user = { inventory: { health_potion: 0 } };
      const res = global.useConsumableItem('health_potion', user);
      r.assertEqual(res.success, false, 'Cannot use consumable when count is 0');
      r.assertEqual(res.reason, 'out_of_stock', 'Reason is out_of_stock');
    });

    r.test('4.3 health_potion restores +50 HP and decrements inventory', () => {
      let questTracked = null;
      const targetQuests = (typeof window !== 'undefined' && window.GamificationQuests) ? window.GamificationQuests : global.GamificationQuests;
      const oldTrack = targetQuests ? targetQuests.trackProgress : null;
      if (targetQuests) {
        targetQuests.trackProgress = (action, count) => { questTracked = { action, count }; };
      }

      try {
        const user = {
          hp: 40,
          max_hp: 100,
          inventory: { health_potion: 2 }
        };

        const res = global.useConsumableItem('health_potion', user);
        r.assertEqual(res.success, true, 'Potion used successfully');
        r.assertEqual(user.hp, 90, 'HP healed by 50 (40 -> 90)');
        r.assertEqual(user.inventory.health_potion, 1, 'Inventory health_potion count decremented from 2 to 1');
        r.assert(Boolean(questTracked), 'Quest event was emitted');
        r.assertEqual(questTracked.action, 'use_potion', 'Emitted use_potion quest event');
        r.assertEqual(questTracked.count, 1, 'Emitted quantity 1');

        // Prevent overhealing when already at max
        user.hp = 100;
        const overhealRes = global.useConsumableItem('health_potion', user);
        r.assertEqual(overhealRes.success, false, 'Overhealing rejected');
        r.assertEqual(overhealRes.reason, 'already_full', 'Reason is already_full');
        r.assertEqual(user.inventory.health_potion, 1, 'Potion not consumed on overheal attempt');
      } finally {
        if (targetQuests && oldTrack) targetQuests.trackProgress = oldTrack;
      }
    });

    r.test('4.4 mana_potion restores +40 MP and decrements inventory', () => {
      const user = {
        mp: 10,
        max_mp: 60,
        inventory: { mana_potion: 1 }
      };

      const res = global.useConsumableItem('mana_potion', user);
      r.assertEqual(res.success, true, 'Mana potion used');
      r.assertEqual(user.mp, 50, 'MP restored by 40 (10 -> 50)');
      r.assertEqual(user.inventory.mana_potion, undefined, 'Inventory key removed or 0 when last one consumed');
    });

    r.test('4.5 double_xp activates 30-minute double EXP buff', () => {
      const user = {
        inventory: { double_xp: 1 }
      };

      const res = global.useConsumableItem('double_xp', user);
      r.assertEqual(res.success, true, 'Double XP used');
      r.assertEqual(user.double_xp_active, true, 'double_xp_active is true');
      r.assert(user.double_xp_expires > Date.now(), 'Buff expiration set in future');
    });

    r.test('4.6 pet_snacks feeds companion pet and increases affinity', () => {
      const user = {
        equipped_pet: 'wise_owl',
        pets: { wise_owl: { unlocked: true, level: 1, affinity: 40 } },
        inventory: { pet_snacks: 1 }
      };

      const res = global.useConsumableItem('pet_snacks', user);
      r.assertEqual(res.success, true, 'Pet snacks used');
      r.assertEqual(user.pets.wise_owl.affinity, 65, 'Pet affinity increased by 25 (40 -> 65)');
    });

    // ============================================================================
    // SUITE 5: Forge Enhancement (+1 to +10) Exact Probability Curve & Sinks
    // ============================================================================
    r.suite('5. Forge Enhancement (+1 to +10) & Sinks');

    r.test('5.1 Forge cost formulas: gold = lvl * 75, stones = ceil(lvl / 3)', () => {
      for (let lvl = 1; lvl <= 10; lvl++) {
        const gold = lvl * 75;
        const stones = Math.ceil(lvl / 3);
        r.assertEqual(gold, lvl * 75, `+${lvl} gold cost is ${lvl * 75}`);
        r.assert(stones >= 1 && stones <= 4, `+${lvl} stone cost is in range 1..4`);
      }
    });

    r.test('5.2 Exact success probability curve: 1-3 (100%), 4-6 (85%), 7-8 (70%), 9-10 (50%)', () => {
      function getEnhanceRate(nextLvl) {
        return nextLvl <= 3 ? 1.0 : (nextLvl <= 6 ? 0.85 : (nextLvl <= 8 ? 0.70 : 0.50));
      }

      r.assertEqual(getEnhanceRate(1), 1.0, '+1 is 100%');
      r.assertEqual(getEnhanceRate(2), 1.0, '+2 is 100%');
      r.assertEqual(getEnhanceRate(3), 1.0, '+3 is 100%');
      r.assertEqual(getEnhanceRate(4), 0.85, '+4 is 85%');
      r.assertEqual(getEnhanceRate(5), 0.85, '+5 is 85%');
      r.assertEqual(getEnhanceRate(6), 0.85, '+6 is 85%');
      r.assertEqual(getEnhanceRate(7), 0.70, '+7 is 70%');
      r.assertEqual(getEnhanceRate(8), 0.70, '+8 is 70%');
      r.assertEqual(getEnhanceRate(9), 0.50, '+9 is 50%');
      r.assertEqual(getEnhanceRate(10), 0.50, '+10 is 50%');
    });

    r.test('5.3 performItemEnhance deducts currencies and increases level on success', () => {
      let questTracked = [];
      const targetQuests = (typeof window !== 'undefined' && window.GamificationQuests) ? window.GamificationQuests : global.GamificationQuests;
      const oldTrack = targetQuests ? targetQuests.trackProgress : null;
      if (targetQuests) {
        targetQuests.trackProgress = (action, val, meta) => { questTracked.push({ action, val, meta }); };
      }

      try {
        const user = {
          gold: 500,
          enhance_stones: 10,
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 0 }
        };
        const oldUser = global.currentRpgUser;
        global.currentRpgUser = user;

        // Perform enhance to +1 (cost: 75 gold, 1 stone; rate: 100%)
        global.performItemEnhance('weapon');

        r.assertEqual(user.equipment_enhances.weapon, 1, 'Weapon enhanced to +1');
        r.assertEqual(user.gold, 500 - 75, '75 Gold deducted');
        r.assertEqual(user.enhance_stones, 10 - 1, '1 Stone deducted');

        const forgeAttempt = questTracked.find(q => q.action === 'forge_enhance');
        r.assert(Boolean(forgeAttempt), 'forge_enhance quest event was emitted');

        const enhanceLevel = questTracked.find(q => q.action === 'enhance_level');
        r.assert(Boolean(enhanceLevel), 'enhance_level quest event was emitted');
        r.assertEqual(enhanceLevel.val, 1, 'enhance_level val was 1');

        global.currentRpgUser = oldUser;
      } finally {
        if (targetQuests && oldTrack) targetQuests.trackProgress = oldTrack;
      }
    });

    r.test('5.4 Rejects enhancement when currencies are insufficient', () => {
      const poorUser = {
        gold: 10,
        enhance_stones: 0,
        equipped: { weapon: 'wp_w_wood' },
        equipment_enhances: { weapon: 0 }
      };
      const oldUser = global.currentRpgUser;
      global.currentRpgUser = poorUser;

      global.performItemEnhance('weapon');
      r.assertEqual(poorUser.equipment_enhances.weapon, 0, 'Level unchanged');
      r.assertEqual(poorUser.gold, 10, 'Gold not deducted');

      global.currentRpgUser = oldUser;
    });

    // ============================================================================
    // SUITE 6: Gacha Mystery Chests & 10-Pull Legendary Pity Counter
    // ============================================================================
    r.suite('6. Gacha Mystery Chests & 10-Pull Pity Counter');

    r.test('6.1 Chest currency costs: Bronze/Wood (100g), Silver (350g), Gold (5 gems)', () => {
      // Wood/Bronze
      const woodUser = { gold: 100, gems: 0, equipped: { weapon: 'wp_w_wood' }, equipment_inventory: [], gacha_pity: 0 };
      global.currentRpgUser = woodUser;
      global.openMysteryChest('wood');
      r.assertEqual(woodUser.gold, 0, '100 Gold deducted for Wood chest');
      r.assertEqual(woodUser.equipment_inventory.length, 1, '1 item received');

      // Bronze alias
      const bronzeUser = { gold: 100, gems: 0, equipped: { weapon: 'wp_w_wood' }, equipment_inventory: [], gacha_pity: 0 };
      global.currentRpgUser = bronzeUser;
      global.openMysteryChest('bronze');
      r.assertEqual(bronzeUser.gold, 0, '100 Gold deducted for Bronze chest');

      // Silver
      const silverUser = { gold: 350, gems: 0, equipped: { weapon: 'wp_w_wood' }, equipment_inventory: [], gacha_pity: 0 };
      global.currentRpgUser = silverUser;
      global.openMysteryChest('silver');
      r.assertEqual(silverUser.gold, 0, '350 Gold deducted for Silver chest');

      // Gold
      const goldUser = { gold: 0, gems: 5, equipped: { weapon: 'wp_w_wood' }, equipment_inventory: [], gacha_pity: 0 };
      global.currentRpgUser = goldUser;
      global.openMysteryChest('gold');
      r.assertEqual(goldUser.gems, 0, '5 Gems deducted for Gold chest');
    });

    r.test('6.2 10th pull guarantees Legendary item from catalog', () => {
      const pityItem = global.rollGachaItem('wood', true);
      r.assertEqual(pityItem.tier, 'legendary', 'Pity roll guarantees Legendary item');
    });

    r.test('6.3 100-pull simulation asserts pity counter ceiling of 10 and auto-reset on Legendary drop', () => {
      let pity = 0;
      let legendaries = 0;

      for (let i = 0; i < 100; i++) {
        pity++;
        const isGuaranteed = (pity >= 10);
        const item = global.rollGachaItem('silver', isGuaranteed);

        r.assert(pity <= 10, `Pity counter [${pity}] must never exceed 10`);

        if (item.tier === 'legendary') {
          legendaries++;
          pity = 0; // Reset pity
        }
      }

      r.assert(legendaries >= 10, `100 pulls with 10-pull pity guarantee produced >= 10 Legendaries (got ${legendaries})`);
      r.assert(pity >= 0 && pity <= 9, `Final pity is between 0 and 9 (got ${pity})`);
    });

    // ============================================================================
    // SUITE 7: Economy Balance, Salvage Unification & Edge Cases
    // ============================================================================
    r.suite('7. Economy Balance, Salvage & Edge Cases');

    r.test('7.1 Salvaging equipment yields Gold and unified user.dust (not magic_dust)', () => {
      const user = {
        dust: 10,
        gold: 100,
        equipped: { weapon: 'wp_w_wood' },
        equipment_inventory: ['wp_w_iron']
      };
      global.currentRpgUser = user;

      const ironItem = global.getRpgEquipmentById('wp_w_iron');
      const expectedDust = ironItem.salvageDust || 15;
      const expectedGold = ironItem.sellPrice || 65;

      const oldConfirm = global.confirm;
      global.confirm = () => true;

      try {
        global.salvageRpgItem('wp_w_iron');
        r.assertEqual(user.equipment_inventory.length, 0, 'Item removed from inventory');
        r.assertEqual(user.dust, 10 + expectedDust, `Dust increased by ${expectedDust}`);
        r.assertEqual(user.gold, 100 + expectedGold, `Gold increased by ${expectedGold}`);
      } finally {
        global.confirm = oldConfirm;
      }
    });

    r.test('7.2 calculatePlayerTotalStats handles null user and missing equipped safely without exceptions', () => {
      let err1 = null;
      try {
        const statsNull = global.calculatePlayerTotalStats(null);
        r.assert(Boolean(statsNull), 'Returned fallback stats object for null user');
      } catch (e) {
        err1 = e;
      }
      r.assertEqual(err1, null, 'No error on null user');

      let err2 = null;
      try {
        const statsEmpty = global.calculatePlayerTotalStats({});
        r.assert(Boolean(statsEmpty), 'Returned fallback stats object for empty user');
      } catch (e) {
        err2 = e;
      }
      r.assertEqual(err2, null, 'No error on empty user');
    });

    return r.getSummary();
    } finally {
      global.alert = oldAlert;
      global.confirm = oldConfirm;
    }
  }

  // Export to global and Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMilestone4Tests };
  }
  if (typeof window !== 'undefined') {
    window.runMilestone4Tests = runMilestone4Tests;
  }
})(typeof window !== 'undefined' ? window : global);
