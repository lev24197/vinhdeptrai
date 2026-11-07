/**
 * ==============================================================================
 * ADVERSARIAL STRESS TEST SUITE — MILESTONE 4
 * File: tests/stress_m4_challenger.js
 * Author: challenger_m4_2 (Empirical Challenger)
 * ==============================================================================
 * Empirical stress tests:
 * 1. Monte Carlo Gacha Pity: 2000+ pulls asserting pity ceiling <= 9 non-legendaries,
 *    and natural legendaries properly reset pity to 0.
 * 2. Forge Currency Sinks: Math, underflows, negative balances, and NaN resilience.
 * 3. Consumable state mutations: double_xp expiration, stacking, and integration with addXP.
 * 4. Paperdoll canvas rendering resilience: missing canvas, null getContext, corrupted users.
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class ChallengerTestRunner {
    constructor() {
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.results = [];
      this.currentSuite = 'General';
      this.startTime = Date.now();
      this.findings = [];
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
        const msg = err.message || String(err);
        this.results.push({ suite: this.currentSuite, desc, status: 'FAIL', error: msg });
        this.findings.push({ suite: this.currentSuite, desc, error: msg });
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
        results: this.results,
        findings: this.findings
      };
    }
  }

  function runChallengerStressTests() {
    const r = new ChallengerTestRunner();
    const oldAlert = global.alert;
    const oldConfirm = global.confirm;
    global.alert = () => {};
    global.confirm = () => true;

    try {

      // ============================================================================
      // SUITE 1: Monte Carlo Gacha Pity & RNG Distribution (2000+ Pulls)
      // ============================================================================
      r.suite('1. Monte Carlo Gacha Pity Simulation');

      r.test('1.1 Wood Chest 2500-pull Monte Carlo: no sequence exceeds 9 non-legendary pulls', () => {
        let pity = 0;
        let consecutiveNonLegendary = 0;
        let maxNonLegendaryStreak = 0;
        let totalLegendaries = 0;
        let naturalLegendaries = 0;
        let pityLegendaries = 0;
        const PULL_COUNT = 2500;

        for (let i = 0; i < PULL_COUNT; i++) {
          pity++;
          const isGuaranteed = (pity >= 10);
          const item = global.rollGachaItem('wood', isGuaranteed);

          r.assert(item && item.tier, `Pull ${i}: returned item must have a tier`);

          if (item.tier === 'legendary') {
            totalLegendaries++;
            if (isGuaranteed) {
              pityLegendaries++;
              r.assertEqual(pity, 10, `Pity drop occurred exactly at pity count 10 (got ${pity})`);
            } else {
              naturalLegendaries++;
              r.assert(pity < 10, `Natural legendary must drop before pull 10 (dropped at ${pity})`);
            }
            pity = 0; // Reset pity counter on any legendary
            consecutiveNonLegendary = 0;
          } else {
            consecutiveNonLegendary++;
            if (consecutiveNonLegendary > maxNonLegendaryStreak) {
              maxNonLegendaryStreak = consecutiveNonLegendary;
            }
            r.assert(pity <= 9, `Non-legendary pull must have pity <= 9, but pity reached ${pity}`);
            r.assert(consecutiveNonLegendary <= 9, `Streak of non-legendaries must never exceed 9 (got ${consecutiveNonLegendary})`);
          }
        }

        r.assert(maxNonLegendaryStreak <= 9, `Max non-legendary streak must be <= 9, was ${maxNonLegendaryStreak}`);
        r.assert(totalLegendaries >= Math.floor(PULL_COUNT / 10), `Total legendaries (${totalLegendaries}) must be >= ${Math.floor(PULL_COUNT / 10)}`);
        r.assert(naturalLegendaries > 0, `Expected at least some natural legendaries from 3% rate in 2500 pulls (got ${naturalLegendaries})`);
      });

      r.test('1.2 Silver Chest 1500-pull Monte Carlo: higher rate (12%) preserves pity reset and <=9 ceiling', () => {
        let pity = 0;
        let consecutiveNonLegendary = 0;
        let maxStreak = 0;
        let totalLegendaries = 0;
        let naturalLegendaries = 0;
        const PULL_COUNT = 1500;

        for (let i = 0; i < PULL_COUNT; i++) {
          pity++;
          const isGuaranteed = (pity >= 10);
          const item = global.rollGachaItem('silver', isGuaranteed);

          if (item.tier === 'legendary') {
            totalLegendaries++;
            if (!isGuaranteed) naturalLegendaries++;
            pity = 0;
            consecutiveNonLegendary = 0;
          } else {
            consecutiveNonLegendary++;
            if (consecutiveNonLegendary > maxStreak) maxStreak = consecutiveNonLegendary;
            r.assert(pity <= 9, `Silver non-legendary pull had pity ${pity} > 9`);
          }
        }

        r.assert(maxStreak <= 9, `Silver chest max non-legendary streak was ${maxStreak} (must be <= 9)`);
        r.assert(naturalLegendaries > 50, `Silver 12% natural drop rate produced ${naturalLegendaries} natural legendaries`);
      });

      r.test('1.3 Gold Chest 1000-pull Monte Carlo: 35% legendary rate frequent pity resets', () => {
        let pity = 0;
        let maxStreak = 0;
        let currentStreak = 0;
        let naturalLegendaries = 0;
        const PULL_COUNT = 1000;

        for (let i = 0; i < PULL_COUNT; i++) {
          pity++;
          const isGuaranteed = (pity >= 10);
          const item = global.rollGachaItem('gold', isGuaranteed);

          if (item.tier === 'legendary') {
            if (!isGuaranteed) naturalLegendaries++;
            pity = 0;
            currentStreak = 0;
          } else {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
            r.assert(pity <= 9, `Gold chest non-legendary pull reached pity ${pity}`);
          }
        }

        r.assert(maxStreak <= 9, `Gold chest max non-legendary streak was ${maxStreak} <= 9`);
        r.assert(naturalLegendaries >= 200, `Gold chest 35% natural rate produced ${naturalLegendaries} natural legendaries`);
      });

      r.test('1.4 Full openMysteryChest loop: verifies real user state mutations & pity counter bounds', () => {
        const testUser = {
          gold: 5000000,
          gems: 50000,
          equipped: { weapon: 'wp_w_wood' },
          equipment_inventory: [],
          gacha_pity: 0
        };
        const oldUser = global.currentRpgUser;
        global.currentRpgUser = testUser;

        const chestTypes = ['wood', 'bronze', 'silver', 'gold'];
        let maxObservedPity = 0;
        let consecutiveNonLegendary = 0;
        let maxStreak = 0;

        for (let i = 0; i < 500; i++) {
          // Reset modal block flag if set
          if (typeof global.isGachaOpening !== 'undefined') global.isGachaOpening = false;

          const chest = chestTypes[i % chestTypes.length];
          const prevInventoryLength = testUser.equipment_inventory.length;

          global.openMysteryChest(chest);

          r.assertEqual(testUser.equipment_inventory.length, prevInventoryLength + 1, `Pull ${i}: 1 item added to inventory`);
          const droppedId = testUser.equipment_inventory[testUser.equipment_inventory.length - 1];
          const item = global.getRpgEquipmentById(droppedId);
          r.assert(Boolean(item), `Dropped item [${droppedId}] must exist in catalog`);

          if (item.tier === 'legendary') {
            r.assertEqual(testUser.gacha_pity, 0, `Pull ${i}: Legendary drop must reset user.gacha_pity to 0`);
            consecutiveNonLegendary = 0;
          } else {
            consecutiveNonLegendary++;
            if (consecutiveNonLegendary > maxStreak) maxStreak = consecutiveNonLegendary;
            r.assert(testUser.gacha_pity <= 9, `Non-legendary drop must leave user.gacha_pity <= 9 (got ${testUser.gacha_pity})`);
          }

          if (testUser.gacha_pity > maxObservedPity) {
            maxObservedPity = testUser.gacha_pity;
          }
        }

        r.assert(maxStreak <= 9, `openMysteryChest max non-legendary streak was ${maxStreak} <= 9`);
        r.assert(maxObservedPity <= 9, `user.gacha_pity at end of pull was never >= 10 (max: ${maxObservedPity})`);
        global.currentRpgUser = oldUser;
      });

      r.test('1.5 Boundary test: user starts with pity=9 triggers guaranteed legendary on next pull', () => {
        const testUser = {
          gold: 1000,
          gems: 10,
          equipped: { weapon: 'wp_w_wood' },
          equipment_inventory: [],
          gacha_pity: 9
        };
        const oldUser = global.currentRpgUser;
        global.currentRpgUser = testUser;
        if (typeof global.isGachaOpening !== 'undefined') global.isGachaOpening = false;

        // Pull 10 should guarantee legendary even on 3% wood chest
        global.openMysteryChest('wood');

        const droppedId = testUser.equipment_inventory[0];
        const item = global.getRpgEquipmentById(droppedId);
        r.assertEqual(item.tier, 'legendary', '10th pull on Wood chest with initial pity=9 must drop Legendary');
        r.assertEqual(testUser.gacha_pity, 0, 'Pity counter must be reset to 0 after guaranteed legendary');

        global.currentRpgUser = oldUser;
      });

      // ============================================================================
      // SUITE 2: Forge Currency Sinks & Non-Negative / Underflow Math
      // ============================================================================
      r.suite('2. Forge Currency Sinks Math & Underflow');

      r.test('2.1 Zero and insufficient currency attempts: balances untouched', () => {
        const user = {
          gold: 74, // Needs 75
          enhance_stones: 1,
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 0 }
        };
        global.currentRpgUser = user;

        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 74, 'Gold must remain 74');
        r.assertEqual(user.enhance_stones, 1, 'Stones must remain 1');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Enhance level remains 0');

        // Missing stones
        user.gold = 500;
        user.enhance_stones = 0;
        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 500, 'Gold untouched when stones missing');
        r.assertEqual(user.enhance_stones, 0, 'Stones remain 0');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Enhance level remains 0');
      });

      r.test('2.2 Exact balance enhancement: drains to exactly 0 without negative underflow', () => {
        const user = {
          gold: 75,
          enhance_stones: 1,
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 0 }
        };
        global.currentRpgUser = user;

        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, 0, 'Gold should drain to exactly 0');
        r.assertEqual(user.enhance_stones, 0, 'Stones should drain to exactly 0');
        r.assert(!isNaN(user.gold), 'Gold is not NaN');
        r.assert(!isNaN(user.enhance_stones), 'Stones is not NaN');
        r.assert(user.gold >= 0, 'Gold is non-negative');
        r.assert(user.enhance_stones >= 0, 'Stones is non-negative');
      });

      r.test('2.3 Negative, NaN, and corrupted currency inputs do not produce invalid state', () => {
        const user = {
          gold: -100,
          enhance_stones: -5,
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 0 }
        };
        global.currentRpgUser = user;

        global.performItemEnhance('weapon');
        r.assertEqual(user.gold, -100, 'Negative gold balance was rejected');
        r.assertEqual(user.enhance_stones, -5, 'Negative stones balance was rejected');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'Level was not enhanced');

        // NaN currency
        user.gold = NaN;
        user.enhance_stones = 10;
        global.performItemEnhance('weapon');
        r.assertEqual(user.equipment_enhances.weapon, 0, 'NaN gold rejected');
      });

      r.test('2.4 Level 10 Enhancement Cap: rejects further enhance without deducting currency', () => {
        const user = {
          gold: 10000,
          enhance_stones: 100,
          equipped: { weapon: 'wp_w_wood' },
          equipment_enhances: { weapon: 10 }
        };
        global.currentRpgUser = user;

        global.performItemEnhance('weapon');
        r.assertEqual(user.equipment_enhances.weapon, 10, 'Level remains capped at 10');
        r.assertEqual(user.gold, 10000, 'No gold deducted at max level');
        r.assertEqual(user.enhance_stones, 100, 'No stones deducted at max level');
      });

      r.test('2.5 Continuous 200-iteration Forge stress: monotonic balance deduction, no negative or NaN', () => {
        const user = {
          gold: 50000,
          enhance_stones: 500,
          equipped: {
            weapon: 'wp_w_wood',
            helmet: 'hm_iron',
            armor: 'ar_w_leather',
            gloves: 'gl_leather',
            boots: 'bt_leather',
            accessory: 'ac_ring_bronze'
          },
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
        const slots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];

        for (let i = 0; i < 200; i++) {
          const slot = slots[i % slots.length];
          const prevGold = user.gold;
          const prevStones = user.enhance_stones;

          global.performItemEnhance(slot);

          r.assert(user.gold <= prevGold, `Iteration ${i}: Gold must not increase on enhance`);
          r.assert(user.enhance_stones <= prevStones, `Iteration ${i}: Stones must not increase`);
          r.assert(user.gold >= 0, `Iteration ${i}: Gold must never be negative (got ${user.gold})`);
          r.assert(user.enhance_stones >= 0, `Iteration ${i}: Stones must never be negative (got ${user.enhance_stones})`);
          r.assert(!isNaN(user.gold), `Iteration ${i}: Gold must not be NaN`);
          r.assert(!isNaN(user.enhance_stones), `Iteration ${i}: Stones must not be NaN`);

          const lvl = user.equipment_enhances[slot];
          r.assert(lvl >= 0 && lvl <= 10, `Enhance level must be in 0..10 (got ${lvl})`);
        }
      });

      r.test('2.6 Salvage Economy Sink: handles undefined and zero currencies safely', () => {
        const user = {
          dust: 0,
          gold: 0,
          equipped: {},
          equipment_inventory: ['wp_w_iron', 'ar_w_leather']
        };
        global.currentRpgUser = user;

        global.salvageRpgItem('wp_w_iron');
        r.assert(user.dust > 0, `Dust increased to ${user.dust}`);
        r.assert(user.gold > 0, `Gold increased to ${user.gold}`);
        r.assert(!isNaN(user.dust), 'Dust is not NaN');
        r.assert(!isNaN(user.gold), 'Gold is not NaN');
        r.assertEqual(user.equipment_inventory.length, 1, 'Item removed from inventory');
      });

      // ============================================================================
      // SUITE 3: Consumable State Mutations, double_xp Expiration & Integration
      // ============================================================================
      r.suite('3. Consumable State Mutations & double_xp Buff');

      r.test('3.1 Overheal protection: health_potion rejected when HP is full', () => {
        const user = {
          hp: 100,
          max_hp: 100,
          inventory: { health_potion: 3 }
        };

        const res = global.useConsumableItem('health_potion', user);
        r.assertEqual(res.success, false, 'Potion use rejected at 100% HP');
        r.assertEqual(res.reason, 'already_full', 'Reason is already_full');
        r.assertEqual(user.inventory.health_potion, 3, 'Inventory potion count untouched');
        r.assertEqual(user.hp, 100, 'HP remains 100');
      });

      r.test('3.2 Health clamp: restores to exact max_hp without exceeding ceiling', () => {
        const user = {
          hp: 85,
          max_hp: 100,
          inventory: { health_potion: 1 }
        };

        const res = global.useConsumableItem('health_potion', user);
        r.assertEqual(res.success, true, 'Potion use succeeded');
        r.assertEqual(user.hp, 100, 'HP capped at 100, not 135');
        r.assert(!user.inventory.health_potion, 'Potion removed from inventory when count reaches 0');
      });

      r.test('3.3 Out of stock resilience: 0 or undefined quantity handled safely', () => {
        const user = {
          hp: 50,
          max_hp: 100,
          inventory: { health_potion: 0 }
        };

        const res = global.useConsumableItem('health_potion', user);
        r.assertEqual(res.success, false, 'Fails on 0 count');
        r.assertEqual(res.reason, 'out_of_stock', 'Reason is out_of_stock');
        r.assertEqual(user.hp, 50, 'HP unchanged');
      });

      r.test('3.4 double_xp buff sets expiration in future and state flag', () => {
        const user = {
          inventory: { double_xp: 2 }
        };

        const beforeTime = Date.now();
        const res = global.useConsumableItem('double_xp', user);
        const afterTime = Date.now();

        r.assertEqual(res.success, true, 'double_xp consumed successfully');
        r.assertEqual(user.double_xp_active, true, 'double_xp_active is true');
        r.assert(user.double_xp_expires >= beforeTime + 30 * 60 * 1000, 'Expires at least 30m in future');
        r.assert(user.double_xp_expires <= afterTime + 30 * 60 * 1000 + 500, 'Expires at most 30m + 500ms in future');
        r.assertEqual(user.inventory.double_xp, 1, '1 bottle remaining in inventory');
      });

      r.test('3.5 [EMPIRICAL CHALLENGE] double_xp integration with addXP in auth.js', () => {
        // Setup user with double_xp item at level 10 to avoid level-up reset
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          gold: 500,
          gems: 10,
          rpg_class: 'warrior',
          inventory: { double_xp: 1 }
        };
        global.currentRpgUser = user;

        // Consume double_xp via inventory.js
        const res = global.useConsumableItem('double_xp', user);
        r.assertEqual(res.success, true, 'Consumable was used');

        // Now test if addXP recognizes the buff
        if (typeof global.addXP === 'function') {
          // Verify currency/buff contract: double_xp_until must be set for addXP
          if (!user.double_xp_until || user.double_xp_until <= Date.now()) {
            throw new Error(`[DISCONNECTED CONTRACT] useConsumableItem sets user.double_xp_expires (${user.double_xp_expires}), but does NOT set user.double_xp_until. auth.js addXP only checks double_xp_until, so 2x EXP is never triggered! (earnedXp was ${global.addXP(100)})`);
          }
          const earnedXp = global.addXP(100);
          r.assert(earnedXp >= 200, `Player must gain at least 200 XP under double_xp buff, got ${earnedXp}`);
        }
      });

      r.test('3.6 [EMPIRICAL CHALLENGE] double_xp consecutive consumption stacking behavior', () => {
        const user = {
          inventory: { double_xp: 2 }
        };

        const now = Date.now();
        global.useConsumableItem('double_xp', user);
        const exp1 = user.double_xp_expires;

        // Simulate 10 minutes passing
        user.double_xp_expires = now + 20 * 60 * 1000;

        // Drink second bottle
        global.useConsumableItem('double_xp', user);
        const exp2 = user.double_xp_expires;

        // Does it stack (+30 mins from current expiration = 50 mins from now)?
        // Or does it reset to 30 mins from now (wasting 20 minutes)?
        const remainingMinutes = (exp2 - now) / (60 * 1000);
        if (remainingMinutes < 45) {
          // Document non-stacking behavior
          // This is a game design caveat: drinking a second bottle resets to 30m rather than adding 30m.
          r.assert(false, `[SUB-OPTIMAL STACKING] Drinking second double_xp reset expiration to ${remainingMinutes.toFixed(1)} mins instead of stacking to 50 mins.`);
        } else {
          r.assert(remainingMinutes >= 45, 'Expiration stacked cleanly');
        }
      });

      // ============================================================================
      // SUITE 4: renderHeroPaperdollPreview Canvas Resilience & Edge Cases
      // ============================================================================
      r.suite('4. renderHeroPaperdollPreview Canvas Resilience');

      r.test('4.1 Missing canvas elements & null/undefined arguments handled safely', () => {
        r.assert(typeof global.renderHeroPaperdollPreview === 'function', 'renderHeroPaperdollPreview exists');

        // null canvas
        global.renderHeroPaperdollPreview(null);

        // undefined canvas
        global.renderHeroPaperdollPreview(undefined);

        // non-existent ID string
        global.renderHeroPaperdollPreview('totally_fake_canvas_id_99999');

        // non-canvas object
        global.renderHeroPaperdollPreview({ foo: 'bar' });

        // object with non-function getContext
        global.renderHeroPaperdollPreview({ getContext: 'not_fn' });
      });

      r.test('4.2 Empty or null user object does not crash preview renderer', () => {
        const mockCanvas = {
          width: 200,
          height: 200,
          getContext: () => ({
            clearRect: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            ellipse: () => {},
            stroke: () => {},
            save: () => {},
            translate: () => {},
            scale: () => {},
            fillRect: () => {},
            restore: () => {},
            imageSmoothingEnabled: false
          })
        };

        // null user
        global.renderHeroPaperdollPreview(mockCanvas, null);

        // empty user
        global.renderHeroPaperdollPreview(mockCanvas, {});

        // user with empty equipped
        global.renderHeroPaperdollPreview(mockCanvas, { equipped: {} });

        // user with all slots null
        global.renderHeroPaperdollPreview(mockCanvas, {
          equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null }
        });
      });

      r.test('4.3 Invalid or unknown item IDs in equipment slots fall back gracefully', () => {
        const mockCanvas = {
          width: 200,
          height: 200,
          getContext: () => ({
            clearRect: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            ellipse: () => {},
            stroke: () => {},
            save: () => {},
            translate: () => {},
            scale: () => {},
            fillRect: () => {},
            restore: () => {},
            imageSmoothingEnabled: false
          })
        };

        const corruptedUser = {
          rpg_class: 'warrior',
          equipped: {
            weapon: 'fake_nonexistent_wp',
            helmet: 'fake_nonexistent_hm',
            armor: 'fake_nonexistent_ar',
            gloves: 'fake_nonexistent_gl',
            boots: 'fake_nonexistent_bt',
            accessory: 'fake_nonexistent_ac'
          }
        };

        global.renderHeroPaperdollPreview(mockCanvas, corruptedUser);
      });

      r.test('4.4 Real DOM canvas element preview render across all 4 classes', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        document.body.appendChild(canvas);

        try {
          const classes = ['warrior', 'mage', 'ranger', 'assassin'];
          classes.forEach(cls => {
            const user = { rpg_class: cls };
            global.ensureUserEquipmentInitialized(user);
            global.renderHeroPaperdollPreview(canvas, user);
          });
        } finally {
          canvas.remove();
        }
      });

      r.test('4.5 [EDGE CASE] Canvas element where getContext("2d") returns null', () => {
        const nullContextCanvas = {
          width: 200,
          height: 200,
          getContext: (type) => null
        };
        // Should not throw unhandled exception if properly guarded
        global.renderHeroPaperdollPreview(nullContextCanvas, {});
      });

    } finally {
      global.alert = oldAlert;
      global.confirm = oldConfirm;
    }

    return r.getSummary();
  }

  global.runChallengerStressTests = runChallengerStressTests;
})(typeof window !== 'undefined' ? window : this);
