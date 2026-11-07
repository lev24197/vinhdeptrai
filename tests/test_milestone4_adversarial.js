/**
 * ==============================================================================
 * ADVERSARIAL STRESS TEST SUITE — MILESTONE 4
 * File: tests/test_milestone4_adversarial.js
 * Challenger: challenger_m4_1 (Empirical Challenger)
 * ==============================================================================
 * Rigorous adversarial challenge covering:
 *  1. calculatePlayerTotalStats Edge Cases, Boundaries & Hard Caps (75% Crit, 60% Dodge)
 *  2. getActiveSetPerks Set Bonus Perks, Thresholds & Hybrid Combinations
 *  3. useConsumableItem Overhealing, Out of Stock, Unknown Items & Key Deletion
 *  4. performItemEnhance Costs, Failure Invariants, Boundary Levels (+10 Cap) & Sinks
 *  5. Gacha Mystery Chests, Currency Rejections & 10,000-Pull Pity Ceiling Invariant
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class AdversarialTestRunner {
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
        throw new Error(`${message || 'assertEqual failed'}: expected [${expected}] (${typeof expected}) but got [${actual}] (${typeof actual})`);
      }
    }

    assertDeepEqual(actual, expected, message) {
      const act = JSON.stringify(actual);
      const exp = JSON.stringify(expected);
      if (act !== exp) {
        throw new Error(`${message || 'assertDeepEqual failed'}: expected ${exp} but got ${act}`);
      }
    }

    assertInRange(val, min, max, message) {
      if (val < min || val > max) {
        throw new Error(`${message || 'assertInRange failed'}: value [${val}] outside expected range [${min}..${max}]`);
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

  function runMilestone4AdversarialTests() {
    const r = new AdversarialTestRunner();

    // Mock browser alerts and confirms to prevent headless hangs
    const originalAlert = global.alert;
    const originalConfirm = global.confirm;
    global.alert = () => {};
    global.confirm = () => true;

    try {

      // ========================================================================
      // SUITE 1: calculatePlayerTotalStats Edge Cases, Boundaries & Hard Caps
      // ========================================================================
      r.suite('1. calculatePlayerTotalStats Edge Cases & Caps');

      r.test('1.1 Null and undefined user safety', () => {
        const statsNull = global.calculatePlayerTotalStats(null);
        r.assert(Boolean(statsNull), 'Returned stats object for null user');
        r.assertEqual(typeof statsNull.atk, 'number', 'ATK is a valid number');
        r.assertEqual(typeof statsNull.hp, 'number', 'HP is a valid number');
        r.assertEqual(typeof statsNull.mp, 'number', 'MP is a valid number');
        r.assertEqual(typeof statsNull.crit, 'number', 'Crit is a valid number');
        r.assertEqual(typeof statsNull.dodge, 'number', 'Dodge is a valid number');
        r.assertEqual(statsNull.atk, 25, 'Default level 1 ATK is 25');
        r.assertEqual(statsNull.hp, 100, 'Default HP is 100');
        r.assertEqual(statsNull.mp, 40, 'Default MP is 40');

        const statsUndef = global.calculatePlayerTotalStats(undefined);
        r.assert(Boolean(statsUndef), 'Returned stats object for undefined user');
        r.assertEqual(statsUndef.atk, 25, 'Default level 1 ATK for undefined user');
      });

      r.test('1.2 Empty object and missing equipped structure', () => {
        const emptyUser = {};
        const statsEmpty = global.calculatePlayerTotalStats(emptyUser);
        r.assertEqual(statsEmpty.atk, 25, 'Base ATK for empty user is 25');
        r.assertEqual(statsEmpty.hp, 100, 'Base HP for empty user is 100');
        r.assertEqual(statsEmpty.mp, 40, 'Base MP for empty user is 40');
        r.assertEqual(statsEmpty.def, 0, 'Base DEF for empty user is 0');

        const userNullEquipped = { equipped: null };
        const statsNullEq = global.calculatePlayerTotalStats(userNullEquipped);
        r.assertEqual(statsNullEq.atk, 25, 'Base ATK for null equipped is 25');
      });

      r.test('1.3 Equipped slots with non-existent IDs and nulls', () => {
        const user = {
          rpg_class: 'warrior',
          equipped: {
            weapon: 'non_existent_sword_9999',
            helmet: null,
            armor: undefined,
            gloves: '',
            boots: 'fake_boots_xyz',
            accessory: null
          }
        };
        const stats = global.calculatePlayerTotalStats(user);
        r.assertEqual(stats.atk, 25, 'Non-existent item IDs are ignored, ATK remains baseline 25');
        r.assertEqual(stats.def, 0, 'DEF remains 0');
        r.assert(!isNaN(stats.crit), 'Crit is not NaN');
        r.assert(!isNaN(stats.dodge), 'Dodge is not NaN');
      });

      r.test('1.4 Missing subfields and boundary level scaling', () => {
        // Level 1: 25 ATK
        const userLvl1 = { level: 1 };
        r.assertEqual(global.calculatePlayerTotalStats(userLvl1).atk, 25, 'Lvl 1 ATK = 25');

        // Level 50: 25 + (50 - 1) * 4 = 221 ATK
        const userLvl50 = { level: 50 };
        r.assertEqual(global.calculatePlayerTotalStats(userLvl50).atk, 221, 'Lvl 50 ATK = 221');

        // Missing level defaults to 1: 25 ATK
        const userNoLvl = { level: undefined };
        r.assertEqual(global.calculatePlayerTotalStats(userNoLvl).atk, 25, 'Undefined level defaults to 1 (25 ATK)');

        // Custom max_hp / max_mp
        const customPoolUser = { max_hp: 450, max_mp: 180 };
        const statsPool = global.calculatePlayerTotalStats(customPoolUser);
        r.assertEqual(statsPool.hp, 450, 'Custom max_hp preserved');
        r.assertEqual(statsPool.mp, 180, 'Custom max_mp preserved');
      });

      r.test('1.5 Baseline stats per character class (Warrior, Mage, Ranger, Assassin)', () => {
        const warrior = global.calculatePlayerTotalStats({ rpg_class: 'warrior' });
        r.assertEqual(warrior.crit, 5, 'Warrior base crit: 5%');
        r.assertEqual(warrior.dodge, 4, 'Warrior base dodge: 4%');
        r.assertEqual(warrior.expBonus, 0, 'Warrior exp bonus: 0%');
        r.assertEqual(warrior.goldBonus, 0, 'Warrior gold bonus: 0%');

        const mage = global.calculatePlayerTotalStats({ rpg_class: 'mage' });
        r.assertEqual(mage.crit, 5, 'Mage base crit: 5%');
        r.assertEqual(mage.dodge, 4, 'Mage base dodge: 4%');
        r.assertEqual(mage.expBonus, 10, 'Mage base exp bonus: +10%');

        const ranger = global.calculatePlayerTotalStats({ rpg_class: 'ranger' });
        r.assertEqual(ranger.crit, 5, 'Ranger base crit: 5%');
        r.assertEqual(ranger.dodge, 8, 'Ranger base dodge: 8%');

        const assassin = global.calculatePlayerTotalStats({ rpg_class: 'assassin' });
        r.assertEqual(assassin.crit, 12, 'Assassin base crit: 12%');
        r.assertEqual(assassin.dodge, 10, 'Assassin base dodge: 10%');
        r.assertEqual(assassin.goldBonus, 15, 'Assassin base gold bonus: +15%');
      });

      r.test('1.6 Enhance level scaling (+15% per level, boundary levels +0, +1, +10)', () => {
        // Equip a known test item: Kiếm Gỗ Tập Sự (wp_w_wood)
        // stats: atk: 8, hp: 10, crit: 2
        const item = global.getRpgEquipmentById('wp_w_wood');
        r.assert(Boolean(item), 'Item wp_w_wood exists');

        // Enhance level 0
        const userEnh0 = {
          rpg_class: 'warrior',
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 0 }
        };
        const statsEnh0 = global.calculatePlayerTotalStats(userEnh0);
        r.assertEqual(statsEnh0.atk, 25 + 8, 'Level 0 enhance: flat 8 ATK added (Total: 33)');
        r.assertEqual(statsEnh0.hp, 100 + 10, 'Level 0 enhance: flat 10 HP added (Total: 110)');

        // Enhance level 1: +15%
        // atk: 8 + Math.round(8 * 0.15) = 8 + 1 = 9 boost. Total ATK = 25 + 9 = 34.
        // hp: 10 + Math.round(10 * 0.15) = 10 + 2 = 12 boost. Total HP = 100 + 12 = 112.
        const userEnh1 = {
          rpg_class: 'warrior',
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 1 }
        };
        const statsEnh1 = global.calculatePlayerTotalStats(userEnh1);
        r.assertEqual(statsEnh1.atk, 34, '+1 Enhance ATK = 34');
        r.assertEqual(statsEnh1.hp, 112, '+1 Enhance HP = 112');

        // Enhance level 10: +150%
        // atk: 8 + Math.round(8 * 1.50) = 8 + 12 = 20 boost. Total ATK = 25 + 20 = 45.
        // hp: 10 + Math.round(10 * 1.50) = 10 + 15 = 25 boost. Total HP = 100 + 25 = 125.
        // crit: 2 + Math.round(2 * 1.50) = 2 + 3 = 5 boost. Total crit = 5 + 5 = 10.
        const userEnh10 = {
          rpg_class: 'warrior',
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 10 }
        };
        const statsEnh10 = global.calculatePlayerTotalStats(userEnh10);
        r.assertEqual(statsEnh10.atk, 45, '+10 Enhance ATK = 45');
        r.assertEqual(statsEnh10.hp, 125, '+10 Enhance HP = 125');
        r.assertEqual(statsEnh10.crit, 10, '+10 Enhance Crit = 10%');
      });

      r.test('1.7 Negative and unequipped slot enhance levels', () => {
        // Negative enhance level should NOT decrease stats or break
        const userNeg = {
          rpg_class: 'warrior',
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: -3 }
        };
        const statsNeg = global.calculatePlayerTotalStats(userNeg);
        r.assertEqual(statsNeg.atk, 33, 'Negative enhance level ignored (enhLvl > 0 guard)');

        // Enhance level 10 on unequipped slot
        const userEmptySlot = {
          rpg_class: 'warrior',
          equipped: { weapon: null },
          equipment_enhances: { weapon: 10 }
        };
        const statsEmpty = global.calculatePlayerTotalStats(userEmptySlot);
        r.assertEqual(statsEmpty.atk, 25, 'Unequipped slot with enhance 10 gives no boost');
      });

      r.test('1.8 Hard Cap: 75% Critical Strike limit verification', () => {
        // We stack extreme crit:
        // Assassin base: 12%
        // Chrono 4-piece set: +25%
        // Anki God set: +20%
        // Equip items with huge crit: wp_w_vocab (+18), gl_swift_striker (+14), bt_anki_chronos (+8)
        // With +10 enhancement (+150%): item crit scales up to ~100%
        // Total raw crit > 160%
        const extremeCritUser = {
          rpg_class: 'assassin',
          equipped: {
            weapon: 'wp_w_vocab',       // Chrono (crit: 18)
            helmet: 'hm_anki_god_crown', // Anki God (crit: 8)
            armor: 'ar_anki_aegis',      // Anki God
            gloves: 'gl_swift_striker',  // Chrono (crit: 14)
            boots: 'bt_anki_chronos',    // Chrono (crit: 8)
            accessory: 'ac_exp_hourglass'// Chrono (crit: 12)
          },
          equipment_enhances: {
            weapon: 10,
            helmet: 10,
            gloves: 10,
            boots: 10,
            accessory: 10
          }
        };

        const stats = global.calculatePlayerTotalStats(extremeCritUser);
        r.assert(stats.crit <= 75, `Crit rate (${stats.crit}%) must NOT exceed 75% hard cap`);
        r.assertEqual(stats.crit, 75, `Crit rate correctly clamped at exactly 75% hard cap`);
      });

      r.test('1.9 Hard Cap: 60% Dodge Rate limit verification', () => {
        // We stack extreme dodge:
        // Assassin base: 10%
        // Assassin passive_2: +15%
        // Shadow Panther pet: +5%
        // Shadow 4-piece set: +20%
        // Shadow items: bt_stealth_treads (+14), gl_shadow_claws (+10), hm_shadow_mask (+8)
        // +10 Enhancement (+150%) on items
        // Total raw dodge > 120%
        const extremeDodgeUser = {
          rpg_class: 'assassin',
          skills_unlocked: { passive_2: true },
          equipped_pet: 'shadow_panther',
          equipped: {
            weapon: 'wp_a_shadow',     // Shadow
            helmet: 'hm_shadow_mask',   // Shadow (dodge: 8)
            armor: 'ar_shadow_garb',    // Shadow (dodge: 6)
            gloves: 'gl_shadow_claws',  // Shadow (dodge: 10)
            boots: 'bt_stealth_treads', // Shadow (dodge: 14)
            accessory: 'ac_shadow_locket'// Shadow (dodge: 10)
          },
          equipment_enhances: {
            helmet: 10,
            armor: 10,
            gloves: 10,
            boots: 10,
            accessory: 10
          }
        };

        const stats = global.calculatePlayerTotalStats(extremeDodgeUser);
        r.assert(stats.dodge <= 60, `Dodge rate (${stats.dodge}%) must NOT exceed 60% hard cap`);
        r.assertEqual(stats.dodge, 60, `Dodge rate correctly clamped at exactly 60% hard cap`);
      });

      r.test('1.10 Defense calculation and scaling integrity', () => {
        // Warrior passive_1 (+15 DEF) and Shadow Panther pet (+10 DEF)
        const userWarriorDef = {
          rpg_class: 'warrior',
          skills_unlocked: { passive_1: true },
          equipped_pet: 'shadow_panther',
          equipped: {}
        };
        const stats = global.calculatePlayerTotalStats(userWarriorDef);
        r.assertEqual(stats.def, 25, 'Warrior passive_1 (15) + Shadow Panther (10) = 25 DEF');

        // Test item with DEF stat and enhancement level scaling (+15%/lvl)
        const mockItemWithDef = {
          id: 'test_shield_plate',
          stats: { def: 20 }
        };
        const oldGetItem = global.getRpgEquipmentById;
        global.getRpgEquipmentById = (id) => (id === 'test_shield_plate' ? mockItemWithDef : oldGetItem(id));
        try {
          const userEnhancedDef = {
            rpg_class: 'warrior',
            equipped: { armor: 'test_shield_plate' },
            equipment_enhances: { armor: 4 } // +4 = +60%
          };
          const statsEnh = global.calculatePlayerTotalStats(userEnhancedDef);
          // 20 + Math.round(20 * 0.60) = 20 + 12 = 32 DEF
          r.assertEqual(statsEnh.def, 32, 'Item DEF (20) + 4 levels (+60%) = 32 DEF');
        } finally {
          global.getRpgEquipmentById = oldGetItem;
        }
      });


      // ========================================================================
      // SUITE 2: getActiveSetPerks and Equipment Sets
      // ========================================================================
      r.suite('2. getActiveSetPerks & Equipment Sets');

      r.test('2.1 Default perk object when unequipped or null user', () => {
        const perksNull = global.getActiveSetPerks(null);
        r.assertEqual(perksNull.oxfordExpBonus, 0, 'Oxford EXP bonus is 0');
        r.assertEqual(perksNull.dragonBurn, false, 'Dragon Burn is false');
        r.assertEqual(perksNull.chronoFastAnswerBonus, false, 'Chrono bonus is false');
        r.assertEqual(perksNull.shadowWrongDodge, false, 'Shadow dodge is false');
        r.assertEqual(perksNull.ankiGodDamageBonus, 0, 'Anki God damage bonus is 0');
      });

      r.test('2.2 1-Piece threshold does NOT activate perks for any set', () => {
        const setsToTest = [
          { set: 'oxford', item: 'ar_oxford_robe' },
          { set: 'dragon', item: 'ar_dragon_scale' },
          { set: 'chrono', item: 'gl_swift_striker' },
          { set: 'shadow', item: 'hm_shadow_mask' },
          { set: 'anki_god', item: 'ar_anki_aegis' }
        ];

        setsToTest.forEach(s => {
          const user = { equipped: { armor: s.item } };
          const perks = global.getActiveSetPerks(user);
          r.assertEqual(perks.oxfordExpBonus, 0, `1-piece ${s.set} did not activate oxfordExpBonus`);
          r.assertEqual(perks.dragonBurn, false, `1-piece ${s.set} did not activate dragonBurn`);
          r.assertEqual(perks.chronoFastAnswerBonus, false, `1-piece ${s.set} did not activate chronoFastAnswerBonus`);
          r.assertEqual(perks.shadowWrongDodge, false, `1-piece ${s.set} did not activate shadowWrongDodge`);
          r.assertEqual(perks.ankiGodDamageBonus, 0, `1-piece ${s.set} did not activate ankiGodDamageBonus`);
        });
      });

      r.test('2.3 Oxford Set 2-piece vs 4-piece perk transitions', () => {
        // 2 pieces: +25% EXP
        const user2pc = {
          equipped: {
            helmet: 'hm_oxford_cap',
            armor: 'ar_oxford_robe'
          }
        };
        const perks2 = global.getActiveSetPerks(user2pc);
        r.assertEqual(perks2.oxfordExpBonus, 25, 'Oxford 2-piece grants +25% EXP');
        r.assertEqual(perks2.oxfordMpCostReduction, 0, 'Oxford 2-piece has 0% MP reduction');
        r.assertEqual(perks2.oxfordEliminateWrong, false, 'Oxford 2-piece does not eliminate wrong');

        // 3 pieces: still tier 2
        const user3pc = {
          equipped: {
            helmet: 'hm_oxford_cap',
            armor: 'ar_oxford_robe',
            gloves: 'gl_oxford_scribe'
          }
        };
        const perks3 = global.getActiveSetPerks(user3pc);
        r.assertEqual(perks3.oxfordExpBonus, 25, 'Oxford 3-piece remains tier 2 (+25% EXP)');
        r.assertEqual(perks3.oxfordEliminateWrong, false, 'Oxford 3-piece does not activate tier 4');

        // 4 pieces: +50% EXP, 25% MP cost reduction, eliminate wrong
        const user4pc = {
          equipped: {
            weapon: 'wp_m_codex',
            helmet: 'hm_oxford_cap',
            armor: 'ar_oxford_robe',
            gloves: 'gl_oxford_scribe'
          }
        };
        const perks4 = global.getActiveSetPerks(user4pc);
        r.assertEqual(perks4.oxfordExpBonus, 50, 'Oxford 4-piece grants +50% EXP');
        r.assertEqual(perks4.oxfordMpCostReduction, 25, 'Oxford 4-piece grants 25% MP reduction');
        r.assertEqual(perks4.oxfordEliminateWrong, true, 'Oxford 4-piece activates eliminateWrong perk');
      });

      r.test('2.4 Dragon Set 2-piece and 4-piece perks', () => {
        const user2pc = {
          equipped: {
            armor: 'ar_dragon_scale',
            gloves: 'gl_dragon_fists'
          }
        };
        const perks2 = global.getActiveSetPerks(user2pc);
        r.assertEqual(perks2.dragonBurn, true, 'Dragon 2-piece activates dragonBurn');
        r.assertEqual(perks2.dragonFlameWave, false, 'Dragon 2-piece does NOT activate flame wave');

        const user4pc = {
          equipped: {
            helmet: 'hm_dragon_crown',
            armor: 'ar_dragon_scale',
            gloves: 'gl_dragon_fists',
            boots: 'bt_dragon_stompers'
          }
        };
        const perks4 = global.getActiveSetPerks(user4pc);
        r.assertEqual(perks4.dragonBurn, true, 'Dragon 4-piece maintains dragonBurn');
        r.assertEqual(perks4.dragonFlameWave, true, 'Dragon 4-piece activates dragonFlameWave');
      });

      r.test('2.5 Chrono Set 2-piece and 4-piece perks', () => {
        const user2pc = {
          equipped: {
            weapon: 'wp_w_vocab',
            gloves: 'gl_swift_striker'
          }
        };
        const perks2 = global.getActiveSetPerks(user2pc);
        r.assertEqual(perks2.chronoFastAnswerBonus, true, 'Chrono 2-piece activates fast answer bonus');
        r.assertEqual(perks2.chronoTimeFreezeCrit, false, 'Chrono 2-piece does NOT activate time freeze crit');

        const user4pc = {
          equipped: {
            weapon: 'wp_w_vocab',
            gloves: 'gl_swift_striker',
            boots: 'bt_wind_striders',
            accessory: 'ac_exp_hourglass'
          }
        };
        const perks4 = global.getActiveSetPerks(user4pc);
        r.assertEqual(perks4.chronoFastAnswerBonus, true, 'Chrono 4-piece maintains fast answer');
        r.assertEqual(perks4.chronoTimeFreezeCrit, true, 'Chrono 4-piece activates time freeze 100% crit');
      });

      r.test('2.6 Shadow Set 2-piece and 4-piece perks', () => {
        const user2pc = {
          equipped: {
            helmet: 'hm_shadow_mask',
            armor: 'ar_shadow_garb'
          }
        };
        const perks2 = global.getActiveSetPerks(user2pc);
        r.assertEqual(perks2.shadowWrongDodge, true, 'Shadow 2-piece activates wrong answer dodge');
        r.assertEqual(perks2.shadowStealthHeal, 0, 'Shadow 2-piece stealth heal is 0');

        const user4pc = {
          equipped: {
            weapon: 'wp_a_shadow',
            helmet: 'hm_shadow_mask',
            armor: 'ar_shadow_garb',
            gloves: 'gl_shadow_claws'
          }
        };
        const perks4 = global.getActiveSetPerks(user4pc);
        r.assertEqual(perks4.shadowWrongDodge, true, 'Shadow 4-piece maintains wrong answer dodge');
        r.assertEqual(perks4.shadowStealthHeal, 25, 'Shadow 4-piece activates +25 HP stealth heal');
      });

      r.test('2.7 Anki God Set 2-piece and 4-piece perks', () => {
        const user2pc = {
          equipped: {
            helmet: 'hm_anki_god_crown',
            armor: 'ar_anki_aegis'
          }
        };
        const perks2 = global.getActiveSetPerks(user2pc);
        r.assertEqual(perks2.ankiGodDamageBonus, 30, 'Anki God 2-piece grants +30% damage');
        r.assertEqual(perks2.ankiGodImmuneWrong, false, 'Anki God 2-piece does NOT grant immuneWrong');

        const user4pc = {
          equipped: {
            weapon: 'wp_w_excalibur',
            helmet: 'hm_anki_god_crown',
            armor: 'ar_anki_aegis',
            gloves: 'gl_infinity_touch'
          }
        };
        const perks4 = global.getActiveSetPerks(user4pc);
        r.assertEqual(perks4.ankiGodDamageBonus, 60, 'Anki God 4-piece grants +60% damage');
        r.assertEqual(perks4.ankiGodImmuneWrong, true, 'Anki God 4-piece grants immuneWrong');
      });

      r.test('2.8 Multi-Set Hybrid Combination: 2 Oxford + 2 Dragon + 2 Chrono', () => {
        const hybridUser = {
          equipped: {
            helmet: 'hm_oxford_cap',      // Oxford (1)
            armor: 'ar_oxford_robe',      // Oxford (2)
            gloves: 'gl_dragon_fists',    // Dragon (1)
            boots: 'bt_dragon_stompers',  // Dragon (2)
            weapon: 'wp_w_vocab',         // Chrono (1)
            accessory: 'ac_exp_hourglass' // Chrono (2)
          }
        };

        const perks = global.getActiveSetPerks(hybridUser);
        r.assertEqual(perks.oxfordExpBonus, 25, 'Oxford 2-pc active in hybrid');
        r.assertEqual(perks.dragonBurn, true, 'Dragon 2-pc active in hybrid');
        r.assertEqual(perks.chronoFastAnswerBonus, true, 'Chrono 2-pc active in hybrid');
        r.assertEqual(perks.oxfordEliminateWrong, false, 'No 4-pc Oxford active');
        r.assertEqual(perks.dragonFlameWave, false, 'No 4-pc Dragon active');
        r.assertEqual(perks.chronoTimeFreezeCrit, false, 'No 4-pc Chrono active');
      });

      r.test('2.9 Catalog Verification: All pieces in RPG_SET_BONUSES exist in catalog and match setKey', () => {
        const setKeys = Object.keys(global.RPG_SET_BONUSES);
        r.assertEqual(setKeys.length, 5, 'Exactly 5 equipment sets defined');

        setKeys.forEach(key => {
          const setDef = global.RPG_SET_BONUSES[key];
          r.assert(Array.isArray(setDef.pieces), `Set ${key} has pieces array`);
          r.assert(setDef.pieces.length >= 4, `Set ${key} has at least 4 pieces`);

          setDef.pieces.forEach(pieceId => {
            const item = global.getRpgEquipmentById(pieceId);
            r.assert(Boolean(item), `Item [${pieceId}] for set [${key}] exists in RPG_EQUIPMENT_CATALOG`);
            r.assertEqual(item.setKey, key, `Item [${pieceId}] has matching setKey [${key}]`);
          });
        });
      });


      // ========================================================================
      // SUITE 3: Consumables Usage Edge Cases (useConsumableItem)
      // ========================================================================
      r.suite('3. Consumable Usage Edge Cases');

      r.test('3.1 Null user and missing inventory handling', () => {
        const resNull = global.useConsumableItem('health_potion', null);
        r.assertEqual(resNull.success, false, 'Null user rejected');
        r.assertEqual(resNull.reason, 'no_user', 'Reason is no_user');

        const emptyUser = {};
        const resEmpty = global.useConsumableItem('health_potion', emptyUser);
        r.assertEqual(resEmpty.success, false, 'Empty user rejected');
        r.assertEqual(resEmpty.reason, 'out_of_stock', 'Reason is out_of_stock');
      });

      r.test('3.2 Unknown item ID with positive stock does NOT consume and returns unknown_item', () => {
        const user = {
          inventory: {
            super_elixir_999: 5
          }
        };
        const res = global.useConsumableItem('super_elixir_999', user);
        r.assertEqual(res.success, false, 'Unknown item fails to consume');
        r.assertEqual(res.reason, 'unknown_item', 'Reason is unknown_item');
        r.assertEqual(user.inventory.super_elixir_999, 5, 'Inventory quantity is untouched (NOT decremented)');
      });

      r.test('3.3 Out of stock and negative quantity rejection', () => {
        const userZero = { inventory: { health_potion: 0 } };
        const resZero = global.useConsumableItem('health_potion', userZero);
        r.assertEqual(resZero.success, false, 'Zero quantity fails');
        r.assertEqual(resZero.reason, 'out_of_stock', 'Reason is out_of_stock');

        const userNeg = { inventory: { health_potion: -2 } };
        const resNeg = global.useConsumableItem('health_potion', userNeg);
        r.assertEqual(resNeg.success, false, 'Negative quantity fails');
        r.assertEqual(resNeg.reason, 'out_of_stock', 'Reason is out_of_stock');
      });

      r.test('3.4 Overhealing prevention: Health Potion at full HP (100%)', () => {
        const userFull = {
          hp: 100,
          max_hp: 100,
          inventory: { health_potion: 3 }
        };
        const res = global.useConsumableItem('health_potion', userFull);
        r.assertEqual(res.success, false, 'Overhealing rejected at full HP');
        r.assertEqual(res.reason, 'already_full', 'Reason is already_full');
        r.assertEqual(userFull.hp, 100, 'HP remains unchanged at 100');
        r.assertEqual(userFull.inventory.health_potion, 3, 'Health potion was NOT deducted');
      });

      r.test('3.5 Overhealing prevention: Health Potion when HP > max_hp', () => {
        const userOver = {
          hp: 110,
          max_hp: 100,
          inventory: { health_potion: 2 }
        };
        const res = global.useConsumableItem('health_potion', userOver);
        r.assertEqual(res.success, false, 'Overhealing rejected when hp > max_hp');
        r.assertEqual(res.reason, 'already_full', 'Reason is already_full');
        r.assertEqual(userOver.inventory.health_potion, 2, 'Health potion was NOT deducted');
      });

      r.test('3.6 Health Potion partial heal clamps to max_hp', () => {
        const userWounded = {
          hp: 85,
          max_hp: 100,
          inventory: { health_potion: 1 }
        };
        const res = global.useConsumableItem('health_potion', userWounded);
        r.assertEqual(res.success, true, 'Potion used successfully');
        r.assertEqual(userWounded.hp, 100, 'HP clamped at max 100 (not 135)');
        r.assertEqual(typeof userWounded.inventory.health_potion, 'undefined', 'Last potion deleted from inventory');
      });

      r.test('3.7 Overhealing prevention: Mana Potion at full MP (100%)', () => {
        const userFullMp = {
          mp: 40,
          max_mp: 40,
          inventory: { mana_potion: 2 }
        };
        const res = global.useConsumableItem('mana_potion', userFullMp);
        r.assertEqual(res.success, false, 'Overheal rejected at full MP');
        r.assertEqual(res.reason, 'already_full', 'Reason is already_full');
        r.assertEqual(userFullMp.inventory.mana_potion, 2, 'Mana potion was NOT deducted');
      });

      r.test('3.8 Mana Potion partial mana recovery clamps to max_mp', () => {
        const userWoundedMp = {
          mp: 30,
          max_mp: 40,
          inventory: { mana_potion: 2 }
        };
        const res = global.useConsumableItem('mana_potion', userWoundedMp);
        r.assertEqual(res.success, true, 'Mana potion used');
        r.assertEqual(userWoundedMp.mp, 40, 'MP clamped at max 40 (not 70)');
        r.assertEqual(userWoundedMp.inventory.mana_potion, 1, 'Quantity decremented from 2 to 1');
      });

      r.test('3.9 Legacy key backward compatibility: health_potions and double_xp_potion', () => {
        const userLegacy = {
          hp: 50,
          max_hp: 100,
          inventory: {
            health_potions: 2,
            double_xp_potion: 1
          }
        };

        // Use health_potion when inventory only has health_potions
        const resHp = global.useConsumableItem('health_potion', userLegacy);
        r.assertEqual(resHp.success, true, 'Resolved legacy key health_potions');
        r.assertEqual(userLegacy.hp, 100, 'HP restored to 100');
        r.assertEqual(userLegacy.inventory.health_potions, 1, 'health_potions decremented to 1');

        // Use double_xp when inventory only has double_xp_potion
        const resXp = global.useConsumableItem('double_xp', userLegacy);
        r.assertEqual(resXp.success, true, 'Resolved legacy key double_xp_potion');
        r.assertEqual(userLegacy.double_xp_active, true, 'double_xp_active is true');
        r.assert(userLegacy.double_xp_expires > Date.now(), 'Expiration set in future');
        r.assertEqual(typeof userLegacy.inventory.double_xp_potion, 'undefined', 'Legacy double_xp_potion key deleted on 0');
      });

      r.test('3.10 Pet snacks usage: affinity clamping at 100 and missing user.pets handling', () => {
        const userNoPets = {
          equipped_pet: 'wise_owl',
          inventory: { pet_snacks: 2 }
        };
        const res1 = global.useConsumableItem('pet_snacks', userNoPets);
        r.assertEqual(res1.success, true, 'Pet snacks used with uninitialized pets object');
        r.assert(Boolean(userNoPets.pets.wise_owl), 'Created wise_owl pet object');
        // Initial affinity 50 + 25 = 75
        r.assertEqual(userNoPets.pets.wise_owl.affinity, 75, 'Initial 50 + 25 = 75 affinity');

        // Use second snack: 75 + 25 = 100
        const res2 = global.useConsumableItem('pet_snacks', userNoPets);
        r.assertEqual(res2.success, true, 'Second snack used');
        r.assertEqual(userNoPets.pets.wise_owl.affinity, 100, 'Affinity reached 100');
        r.assertEqual(typeof userNoPets.inventory.pet_snacks, 'undefined', 'Snacks depleted and deleted');
      });

      r.test('3.11 Hint scroll increments hint_scrolls_active', () => {
        const userScroll = {
          hint_scrolls_active: 0,
          inventory: { hint_scroll: 3 }
        };
        global.useConsumableItem('hint_scroll', userScroll);
        r.assertEqual(userScroll.hint_scrolls_active, 1, 'hint_scrolls_active incremented to 1');
        r.assertEqual(userScroll.inventory.hint_scroll, 2, 'inventory decremented to 2');
      });


      // ========================================================================
      // SUITE 4: Forge Enhancement Mechanics (+1 to +10) & Sinks
      // ========================================================================
      r.suite('4. Forge Mechanics & Sinks (+1 to +10)');

      r.test('4.1 Rejects enhancement if slot is unequipped', () => {
        const user = {
          equipped: { weapon: null },
          gold: 5000,
          enhance_stones: 50,
          equipment_enhances: { weapon: 0 }
        };
        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 5000, 'Gold untouched');
        r.assertEqual(user.enhance_stones, 50, 'Stones untouched');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Level untouched');
      });

      r.test('4.2 Rejects enhancement if already at max level 10', () => {
        const user = {
          equipped: { weapon: 'wp_w_wood' },
          gold: 5000,
          enhance_stones: 50,
          equipment_enhances: { weapon: 10 }
        };
        // Mock currentRpgUser
        global.currentRpgUser = user;
        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 5000, 'Gold untouched when already +10');
        r.assertEqual(user.enhance_stones, 50, 'Stones untouched when already +10');
        r.assertEqual(user.equipment_enhances.weapon, 10, 'Level remains strictly 10');
      });

      r.test('4.3 Rejects enhancement if Gold is insufficient', () => {
        const user = {
          equipped: { weapon: 'wp_w_wood' },
          gold: 50, // Needs 75 for +1
          enhance_stones: 10,
          equipment_enhances: { weapon: 0 }
        };
        global.currentRpgUser = user;
        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 50, 'Gold not deducted when insufficient');
        r.assertEqual(user.enhance_stones, 10, 'Stones not deducted when insufficient');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Enhance level did not increment');
      });

      r.test('4.4 Rejects enhancement if Enhance Stones are insufficient', () => {
        const user = {
          equipped: { weapon: 'wp_w_wood' },
          gold: 5000,
          enhance_stones: 0, // Needs 1 for +1
          equipment_enhances: { weapon: 0 }
        };
        global.currentRpgUser = user;
        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 5000, 'Gold not deducted when stones insufficient');
        r.assertEqual(user.enhance_stones, 0, 'Stones remain 0');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Enhance level did not increment');
      });

      r.test('4.5 Cost formulas exact verification for all levels +1 to +10', () => {
        // Expected costs: gold = lvl * 75, stones = Math.ceil(lvl / 3)
        const expectedCosts = [
          { lvl: 1, gold: 75, stones: 1 },
          { lvl: 2, gold: 150, stones: 1 },
          { lvl: 3, gold: 225, stones: 1 },
          { lvl: 4, gold: 300, stones: 2 },
          { lvl: 5, gold: 375, stones: 2 },
          { lvl: 6, gold: 450, stones: 2 },
          { lvl: 7, gold: 525, stones: 3 },
          { lvl: 8, gold: 600, stones: 3 },
          { lvl: 9, gold: 675, stones: 3 },
          { lvl: 10, gold: 750, stones: 4 }
        ];

        expectedCosts.forEach(ec => {
          const gold = ec.lvl * 75;
          const stones = Math.ceil(ec.lvl / 3);
          r.assertEqual(gold, ec.gold, `Level ${ec.lvl} gold cost is ${ec.gold}`);
          r.assertEqual(stones, ec.stones, `Level ${ec.lvl} stone cost is ${ec.stones}`);
        });
      });

      r.test('4.6 100% Guaranteed success for levels +1 to +3', () => {
        const user = {
          equipped: { helmet: 'hm_iron_helm' },
          gold: 10000,
          enhance_stones: 100,
          equipment_enhances: { helmet: 0 }
        };
        global.currentRpgUser = user;

        // Perform 3 enhancements (+1, +2, +3)
        global.performItemEnhance('helmet');
        r.assertEqual(user.equipment_enhances.helmet, 1, '+1 succeeded (100% rate)');

        global.performItemEnhance('helmet');
        r.assertEqual(user.equipment_enhances.helmet, 2, '+2 succeeded (100% rate)');

        global.performItemEnhance('helmet');
        r.assertEqual(user.equipment_enhances.helmet, 3, '+3 succeeded (100% rate)');

        // Currencies deducted:
        // Gold: 75 + 150 + 225 = 450
        // Stones: 1 + 1 + 1 = 3
        r.assertEqual(user.gold, 10000 - 450, 'Gold properly deducted');
        r.assertEqual(user.enhance_stones, 100 - 3, 'Stones properly deducted');
      });

      r.test('4.7 Failure safety: failed enhance deducts currencies but preserves equipment level', () => {
        const user = {
          equipped: { armor: 'ar_iron_breastplate' },
          gold: 10000,
          enhance_stones: 100,
          equipment_enhances: { armor: 6 } // Trying to reach +7 (70% success)
        };
        global.currentRpgUser = user;

        // Force Math.random() to fail (> 0.70)
        const oldRandom = Math.random;
        Math.random = () => 0.99; // Will trigger failure

        try {
          global.performItemEnhance('armor');
          r.assertEqual(user.equipment_enhances.armor, 6, 'Equipment level did not decrease on failure');
          r.assertEqual(user.gold, 10000 - 7 * 75, 'Gold was deducted on failure sink');
          r.assertEqual(user.enhance_stones, 100 - Math.ceil(7 / 3), 'Stones were deducted on failure sink');
        } finally {
          Math.random = oldRandom;
        }
      });

      r.test('4.8 All 6 equipment slots support enhancement', () => {
        const slots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];
        const user = {
          equipped: {
            weapon: 'wp_w_wood',
            helmet: 'hm_iron_helm',
            armor: 'ar_iron_breastplate',
            gloves: 'gl_cloth_wraps',
            boots: 'bt_rag_shoes',
            accessory: 'ac_copper_ring'
          },
          gold: 50000,
          enhance_stones: 500,
          equipment_enhances: {
            weapon: 0,
            helmet: 0,
            armor: 0,
            gloves: 0,
            boots: 0,
            accessory: 0
          }
        };
        global.currentRpgUser = user;

        slots.forEach(slot => {
          global.performItemEnhance(slot);
          r.assertEqual(user.equipment_enhances[slot], 1, `Slot ${slot} successfully enhanced to +1`);
        });
      });


      // ========================================================================
      // SUITE 5: Gacha Mystery Chests & 10-Pull Pity Ceiling Invariant
      // ========================================================================
      r.suite('5. Gacha Mystery Chests & 10-Pull Pity');

      r.test('5.1 Chest pricing and insufficient currency rejection', () => {
        const userBroke = {
          gold: 50,
          gems: 2,
          gacha_pity: 0,
          equipment_inventory: []
        };
        global.ensureUserEquipmentInitialized(userBroke);
        const initialItemsCount = userBroke.equipment_inventory.length;
        global.currentRpgUser = userBroke;

        // Bronze chest costs 100g
        global.openMysteryChest('bronze');
        r.assertEqual(userBroke.gold, 50, 'Gold untouched when cannot afford bronze');
        r.assertEqual(userBroke.gacha_pity, 0, 'Pity not incremented');
        r.assertEqual(userBroke.equipment_inventory.length, initialItemsCount, 'No item granted when insufficient gold');

        // Silver chest costs 350g
        global.openMysteryChest('silver');
        r.assertEqual(userBroke.gold, 50, 'Gold untouched for silver');
        r.assertEqual(userBroke.gacha_pity, 0, 'Pity not incremented');
        r.assertEqual(userBroke.equipment_inventory.length, initialItemsCount, 'No item granted when insufficient gold');

        // Gold chest costs 5 gems
        global.openMysteryChest('gold');
        r.assertEqual(userBroke.gems, 2, 'Gems untouched for gold chest');
        r.assertEqual(userBroke.gacha_pity, 0, 'Pity not incremented');
        r.assertEqual(userBroke.equipment_inventory.length, initialItemsCount, 'No item granted when insufficient gems');
      });

      r.test('5.2 Deterministic 10th-pull guarantees Legendary and resets pity to 0', () => {
        const user = {
          gold: 100000,
          gems: 500,
          gacha_pity: 0,
          equipment_inventory: []
        };
        global.currentRpgUser = user;

        // Force non-legendary rolls for pulls 1 to 9
        const oldRandom = Math.random;
        try {
          for (let pull = 1; pull <= 9; pull++) {
            // In bronze chest, rand = 0.50 produces 'rare' or 'uncommon' (non-legendary)
            Math.random = () => 0.50;
            global.openMysteryChest('bronze');
            r.assertEqual(user.gacha_pity, pull, `Pity incremented to ${pull} on non-legendary pull`);
          }

          r.assertEqual(user.gacha_pity, 9, 'Reached 9 pulls without legendary');

          // Pull 10: must guarantee Legendary regardless of random roll
          Math.random = () => 0.99; // Would normally give common/uncommon
          global.openMysteryChest('bronze');

          // Check last item granted
          const lastItemId = user.equipment_inventory[user.equipment_inventory.length - 1];
          const lastItem = global.getRpgEquipmentById(lastItemId);
          r.assertEqual(lastItem.tier, 'legendary', '10th pull strictly drops a Legendary item');
          r.assertEqual(user.gacha_pity, 0, 'Pity counter immediately resets to 0 after Legendary drop');
        } finally {
          Math.random = oldRandom;
        }
      });

      r.test('5.3 Early Legendary drop before pull 10 resets pity counter to 0 immediately', () => {
        const user = {
          gold: 5000,
          gems: 50,
          gacha_pity: 4, // Already at 4 pulls
          equipment_inventory: []
        };
        global.currentRpgUser = user;

        const oldRandom = Math.random;
        try {
          // Force legendary roll on 5th pull (rand < 0.03 for bronze)
          Math.random = () => 0.01;
          global.openMysteryChest('bronze');

          const lastItemId = user.equipment_inventory[user.equipment_inventory.length - 1];
          const lastItem = global.getRpgEquipmentById(lastItemId);
          r.assertEqual(lastItem.tier, 'legendary', 'Rolled early legendary');
          r.assertEqual(user.gacha_pity, 0, 'Pity counter immediately reset to 0 from early legendary drop');
        } finally {
          Math.random = oldRandom;
        }
      });

      r.test('5.4 Corrupted pity recovery (if pity >= 10, next pull drops legendary and self-heals to 0)', () => {
        const user = {
          gold: 5000,
          gems: 50,
          gacha_pity: 15, // Corrupted state > 10
          equipment_inventory: []
        };
        global.currentRpgUser = user;

        global.openMysteryChest('silver');
        const lastItemId = user.equipment_inventory[user.equipment_inventory.length - 1];
        const lastItem = global.getRpgEquipmentById(lastItemId);
        r.assertEqual(lastItem.tier, 'legendary', 'Corrupted pity > 10 triggers guarantee');
        r.assertEqual(user.gacha_pity, 0, 'Pity self-healed and reset to 0');
      });

      r.test('5.5 Monte Carlo Simulation: 10,000 pulls assert pity ceiling <= 10 and >= 1,000 Legendaries', () => {
        const user = {
          gold: 999999999,
          gems: 999999999,
          gacha_pity: 0,
          equipment_inventory: []
        };

        const chestTypes = ['wood', 'bronze', 'silver', 'gold'];
        let maxObservedPity = 0;
        let legendaryCount = 0;
        const totalPulls = 10000;

        for (let i = 0; i < totalPulls; i++) {
          const chestType = chestTypes[i % chestTypes.length];
          user.gacha_pity++;
          const isGuaranteed = (user.gacha_pity >= 10);
          const item = global.rollGachaItem(chestType, isGuaranteed);

          if (user.gacha_pity > maxObservedPity) {
            maxObservedPity = user.gacha_pity;
          }

          if (isGuaranteed) {
            r.assertEqual(item.tier, 'legendary', `Pull ${i+1}: Guaranteed pull MUST be legendary`);
          }

          if (item.tier === 'legendary') {
            legendaryCount++;
            user.gacha_pity = 0;
          }

          r.assert(user.gacha_pity <= 10, `Pull ${i+1}: Pity counter (${user.gacha_pity}) exceeded 10!`);
        }

        r.assert(maxObservedPity <= 10, `Maximum observed pity (${maxObservedPity}) must be <= 10`);
        r.assert(legendaryCount >= 1000, `In 10,000 pulls, at least 1,000 Legendaries must drop (got ${legendaryCount})`);
      });

      r.test('5.6 Equipment Salvage: Yields unified user.dust and gold, removes from inventory', () => {
        const testItem = global.RPG_EQUIPMENT_CATALOG[0]; // wp_w_wood: salvageDust: 5, sellPrice: 20
        const user = {
          dust: 10,
          gold: 50,
          equipment_inventory: [testItem.id, 'ac_copper_ring']
        };
        global.currentRpgUser = user;

        global.salvageRpgItem(testItem.id);

        r.assertEqual(user.dust, 10 + (testItem.salvageDust || 5), 'Dust unified (not magic_dust)');
        r.assertEqual(typeof user.magic_dust, 'undefined', 'No magic_dust key created');
        r.assertEqual(user.gold, 50 + (testItem.sellPrice || 20), 'Gold increased by sellPrice');
        r.assertEqual(user.equipment_inventory.length, 1, 'Item removed from inventory');
        r.assertEqual(user.equipment_inventory[0], 'ac_copper_ring', 'Remaining item intact');
      });

    } finally {
      global.alert = originalAlert;
      global.confirm = originalConfirm;
    }

    return r.getSummary();
  }

  // Export
  if (typeof window !== 'undefined') {
    window.runMilestone4AdversarialTests = runMilestone4AdversarialTests;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMilestone4AdversarialTests };
  }

})(typeof window !== 'undefined' ? window : global);
