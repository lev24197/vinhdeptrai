/**
 * Challenger M4_3 Empirical Adversarial Test Harness
 * Exhaustive independent verification for:
 * 1. addXP 2x EXP multiplier under inventory-consumed double_xp buff
 * 2. Buff duration stacking across consecutive & time-elapsed consumption
 * 3. Graceful return on null canvas context (canvas.getContext('2d') => null)
 *    in both BattleEngine.renderHeroPreview and renderHeroPaperdollPreview (including fallback)
 * 4. Cross-module interop between auth.js and inventory.js
 */

(function (global) {
  'use strict';

  class TestRunner {
    constructor() {
      this.results = [];
      this.currentSuite = 'Default Suite';
      this.startTime = Date.now();
    }

    suite(name) {
      this.currentSuite = name;
    }

    test(desc, fn) {
      const entry = { suite: this.currentSuite, desc, status: 'RUNNING', error: null, duration: 0 };
      const t0 = performance.now();
      try {
        fn();
        entry.status = 'PASS';
      } catch (err) {
        entry.status = 'FAIL';
        entry.error = err.message || String(err);
      } finally {
        entry.duration = Math.round(performance.now() - t0);
        this.results.push(entry);
      }
    }

    assertEqual(actual, expected, msg) {
      if (actual !== expected) {
        throw new Error(`${msg ? msg + ': ' : ''}Expected [${expected}] (${typeof expected}), but got [${actual}] (${typeof actual})`);
      }
    }

    assert(condition, msg) {
      if (!condition) {
        throw new Error(msg || 'Assertion failed');
      }
    }

    assertClose(actual, expected, tolerance, msg) {
      if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`${msg ? msg + ': ' : ''}Expected ${actual} to be within ${tolerance} of ${expected}`);
      }
    }

    getSummary() {
      const total = this.results.length;
      const passed = this.results.filter(r => r.status === 'PASS').length;
      const failed = this.results.filter(r => r.status === 'FAIL').length;
      const duration = Date.now() - this.startTime;
      return { total, passed, failed, duration, results: this.results };
    }
  }

  function runChallengerM43Tests() {
    const r = new TestRunner();
    const oldAlert = global.alert;
    const oldConfirm = global.confirm;
    global.alert = () => {};
    global.confirm = () => true;

    try {
      // ============================================================================
      // SUITE 1: addXP 2x EXP Multiplier from Inventory Consumable
      // ============================================================================
      r.suite('1. Empirical addXP & double_xp Multiplier Verification');

      r.test('1.1 Pure unequipped Warrior: addXP(100) awards exactly 100 XP with no active buff', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null },
          equipment_inventory: ['custom_item'],
          inventory: {}
        };
        global.currentRpgUser = user;
        const initialXp = user.xp;
        global.addXP(100);
        const gained = user.xp - initialXp;
        r.assertEqual(gained, 100, 'Pure unequipped warrior with no buff must gain 100 XP');
      });

      r.test('1.2 Inventory Consumption: useConsumableItem sets state contracts correctly', () => {
        const now = Date.now();
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          inventory: { double_xp: 3 }
        };
        global.currentRpgUser = user;

        const res = global.useConsumableItem('double_xp', user);
        r.assertEqual(res.success, true, 'useConsumableItem must succeed');
        r.assertEqual(user.double_xp_active, true, 'user.double_xp_active must be true');
        r.assert(typeof user.double_xp_until === 'number', 'user.double_xp_until must be set');
        r.assert(typeof user.double_xp_expires === 'number', 'user.double_xp_expires must be set');
        r.assertEqual(user.double_xp_until, user.double_xp_expires, 'until and expires must match');
        r.assertClose(user.double_xp_until, now + 30 * 60 * 1000, 1000, 'Buff duration must be 30 minutes in future');
        r.assertEqual(user.inventory.double_xp, 2, 'Inventory stock must decrement to 2');
      });

      r.test('1.3 Pure unequipped Warrior: addXP(100) awards exactly 200 XP under double_xp (2.0x)', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null },
          equipment_inventory: ['custom_item'],
          inventory: { double_xp: 1 }
        };
        global.currentRpgUser = user;

        global.useConsumableItem('double_xp', user);
        const xpBefore = user.xp;
        global.addXP(100);
        const gained = user.xp - xpBefore;
        r.assertEqual(gained, 200, 'Pure warrior under double_xp must gain exactly 200 XP (2x)');
      });

      r.test('1.4 Real-game user with starter gear: double_xp grants exactly 2x of baseline (102 -> 204)', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          inventory: { double_xp: 1 }
        };
        global.ensureUserEquipmentInitialized(user);
        global.currentRpgUser = user;

        // Baseline with starter gear (ac_copper_ring gives +2% expBonus => 102 XP)
        const baseGained = global.addXP(100);
        r.assertEqual(baseGained, 102, 'Baseline with starter gear must be 102 XP');
        user.xp = 0;

        // Consume double_xp from inventory
        const res = global.useConsumableItem('double_xp', user);
        r.assertEqual(res.success, true, 'double_xp consumed');

        // Gained with buff: 102 * 2 = 204 XP
        const buffGained = global.addXP(100);
        r.assertEqual(buffGained, baseGained * 2, `Buff gained (${buffGained}) must be exactly 2x baseline (${baseGained})`);
        r.assertEqual(buffGained, 204, 'Buff gained is exactly 204 XP');
      });

      r.test('1.5 Assassin Class Stacking: +35% class bonus multiplies with double_xp (exact 2x baseline)', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'assassin',
          inventory: { double_xp: 1 }
        };
        global.ensureUserEquipmentInitialized(user);
        global.currentRpgUser = user;

        // Baseline assassin without buff
        const baseGained = global.addXP(100);
        user.xp = 0;

        // Now activate double_xp
        global.useConsumableItem('double_xp', user);
        user.xp = 0;
        const buffGained = global.addXP(100);

        r.assertEqual(buffGained, baseGained * 2, `Assassin buff gained (${buffGained}) must be exactly 2x baseline (${baseGained})`);
        r.assertEqual(buffGained, 354, 'Assassin with starter gear under double_xp earns 354 XP (177 * 2)');
      });

      r.test('1.6 Equipment Stat Stacking: custom expBonus stat stacks multiplicatively with double_xp', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null },
          equipment_inventory: ['custom_item'],
          inventory: { double_xp: 1 }
        };
        global.currentRpgUser = user;

        // Mock calculatePlayerTotalStats to return expBonus: 20 (+20% exp)
        const originalStats = global.calculatePlayerTotalStats;
        global.calculatePlayerTotalStats = () => ({ expBonus: 20 });

        try {
          global.useConsumableItem('double_xp', user);
          user.xp = 0;
          global.addXP(100);
          // Multiplier = 2 * (1 + 20/100) = 2.4 => Math.round(100 * 2.4) = 240
          r.assertEqual(user.xp, 240, 'Warrior with +20% expBonus under double_xp must gain 240 XP');
        } finally {
          global.calculatePlayerTotalStats = originalStats;
        }
      });

      r.test('1.7 Legacy inventory key: double_xp_potion consumed via double_xp ID gives 2x EXP', () => {
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          inventory: { double_xp_potion: 1 }
        };
        global.ensureUserEquipmentInitialized(user);
        global.currentRpgUser = user;

        const baseGained = global.addXP(100);
        user.xp = 0;

        const res = global.useConsumableItem('double_xp', user);
        r.assertEqual(res.success, true, 'Legacy double_xp_potion must be consumed');
        r.assert(!user.inventory.double_xp_potion, 'Stock decremented to 0 and removed');

        user.xp = 0;
        const buffGained = global.addXP(100);
        r.assertEqual(buffGained, baseGained * 2, 'Legacy potion consumption must trigger exact 2x EXP');
      });

      // ============================================================================
      // SUITE 2: Duration Stacking & Buff Lifecycle Under Stress
      // ============================================================================
      r.suite('2. Duration Stacking & Buff Lifecycle Stress Testing');

      r.test('2.1 Multi-Drink Immediate Stacking: 4 drinks add 120 minutes (2 hours)', () => {
        const now = Date.now();
        const user = {
          inventory: { double_xp: 4 }
        };

        for (let i = 1; i <= 4; i++) {
          const res = global.useConsumableItem('double_xp', user);
          r.assertEqual(res.success, true, `Drink ${i} must succeed`);
          const expectedExpiry = now + (i * 30 * 60 * 1000);
          r.assertClose(user.double_xp_until, expectedExpiry, 1500, `Drink ${i} must extend expiry to +${i * 30} mins`);
          r.assertEqual(user.double_xp_expires, user.double_xp_until, `expires and until must match on drink ${i}`);
        }
        r.assertEqual(user.inventory.double_xp, undefined, 'All 4 bottles consumed');
      });

      r.test('2.2 Time-Elapsed Stacking: 1st drink + 15m elapsed + 2nd drink => 45m remaining (60m total)', () => {
        const now = Date.now();
        const user = {
          inventory: { double_xp: 2 }
        };

        // Drink 1
        global.useConsumableItem('double_xp', user);
        r.assertClose(user.double_xp_until, now + 30 * 60 * 1000, 1000, 'Drink 1 gives 30m');

        // Simulate 15 minutes passing (15 minutes remaining)
        const simulatedNow = now + 15 * 60 * 1000;
        user.double_xp_until = simulatedNow + 15 * 60 * 1000;
        user.double_xp_expires = user.double_xp_until;

        // Drink 2
        global.useConsumableItem('double_xp', user);
        // Expiry should now be simulatedNow + 15m + 30m = simulatedNow + 45m
        const remainingMinutes = (user.double_xp_until - simulatedNow) / (60 * 1000);
        r.assertClose(remainingMinutes, 45, 0.5, 'Remaining duration after second drink must be ~45 minutes');
      });

      r.test('2.3 Expired Buff Recovery: Drinking after buff expires sets fresh 30m from now', () => {
        const now = Date.now();
        const user = {
          double_xp_until: now - 3600 * 1000, // Expired 1 hour ago
          double_xp_expires: now - 3600 * 1000,
          double_xp_active: false,
          inventory: { double_xp: 1 }
        };

        global.useConsumableItem('double_xp', user);
        // Should NOT be now - 1hr + 30m = now - 30m! Must be now + 30m!
        r.assert(user.double_xp_until > now + 29 * 60 * 1000, 'Fresh drink after expiration must be at least 29m in future');
        r.assertClose(user.double_xp_until, now + 30 * 60 * 1000, 1000, 'Fresh drink expires ~30m from current time');
      });

      r.test('2.4 isDoubleXpActive helper returns accurate state & auto-syncs double_xp_active', () => {
        r.assert(typeof global.isDoubleXpActive === 'function', 'isDoubleXpActive must be exposed');

        const now = Date.now();
        const activeUser = { double_xp_until: now + 10 * 60 * 1000, double_xp_active: false };
        const isActive = global.isDoubleXpActive(activeUser);
        r.assertEqual(isActive, true, 'isDoubleXpActive must be true when until > now');
        r.assertEqual(activeUser.double_xp_active, true, 'isDoubleXpActive must sync user.double_xp_active to true');

        const expiredUser = { double_xp_until: now - 1000, double_xp_active: true };
        const isExpired = global.isDoubleXpActive(expiredUser);
        r.assertEqual(isExpired, false, 'isDoubleXpActive must be false when until <= now');
        r.assertEqual(expiredUser.double_xp_active, false, 'isDoubleXpActive must sync user.double_xp_active to false');

        // Test with currentRpgUser null
        const savedCurrent = global.currentRpgUser;
        try {
          global.currentRpgUser = null;
          r.assertEqual(global.isDoubleXpActive(null), false, 'isDoubleXpActive(null) with no currentRpgUser must return false');
          r.assertEqual(global.isDoubleXpActive({}), false, 'isDoubleXpActive({}) with empty user must return false');
        } finally {
          global.currentRpgUser = savedCurrent;
        }
      });

      r.test('2.5 Expired addXP Regression: addXP grants 1x EXP after buff expiration', () => {
        const now = Date.now();
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          equipped: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, accessory: null },
          equipment_inventory: ['custom_item'],
          double_xp_until: now - 5000, // Expired 5 seconds ago
          double_xp_expires: now - 5000,
          double_xp_active: false,
          inventory: {}
        };
        global.currentRpgUser = user;

        user.xp = 0;
        const gained = global.addXP(100);
        r.assertEqual(gained, 100, 'Expired buff must not grant 2x EXP, exactly 100 XP gained');
      });

      r.test('2.6 Cross-Module Interop: auth.js useShopItem + inventory.js useConsumableItem stack cleanly', () => {
        const now = Date.now();
        const user = {
          xp: 0,
          level: 10,
          max_hp: 200,
          hp: 200,
          max_mp: 100,
          mp: 100,
          rpg_class: 'warrior',
          inventory: { double_xp: 2 }
        };
        global.ensureUserEquipmentInitialized(user);
        global.currentRpgUser = user;

        // Baseline before buff
        const baseGained = global.addXP(100);
        user.xp = 0;

        // First use via auth.js useShopItem
        if (typeof global.useShopItem === 'function') {
          global.useShopItem('double_xp');
          r.assertClose(user.double_xp_until, now + 30 * 60 * 1000, 1000, 'useShopItem sets double_xp_until');

          // Second use via inventory.js useConsumableItem
          global.useConsumableItem('double_xp', user);
          r.assertClose(user.double_xp_until, now + 60 * 60 * 1000, 1500, 'useConsumableItem stacks on top of useShopItem to 60m');
          r.assertEqual(user.double_xp_expires, user.double_xp_until, 'expires matches until');

          // Check addXP
          user.xp = 0;
          const buffGained = global.addXP(100);
          r.assertEqual(buffGained, baseGained * 2, 'addXP yields 2x EXP after cross-module consumption');
        }
      });

      // ============================================================================
      // SUITE 3: Canvas Context Null Guard Resilience
      // ============================================================================
      r.suite('3. Canvas Context Null Guard Resilience');

      r.test('3.1 BattleEngine.renderHeroPreview with getContext("2d") => null returns gracefully', () => {
        r.assert(typeof global.BattleEngine !== 'undefined', 'BattleEngine exists');
        r.assert(typeof global.BattleEngine.renderHeroPreview === 'function', 'renderHeroPreview exists');

        const nullCanvas = {
          width: 200,
          height: 200,
          getContext: (type) => null
        };

        // Should NOT throw TypeError: Cannot set properties of null (setting 'imageSmoothingEnabled')
        global.BattleEngine.renderHeroPreview(nullCanvas);
      });

      r.test('3.2 BattleEngine.renderHeroPreview handles null, undefined, fake ID, non-canvas safely', () => {
        global.BattleEngine.renderHeroPreview(null);
        global.BattleEngine.renderHeroPreview(undefined);
        global.BattleEngine.renderHeroPreview('completely_fake_id_xyz');
        global.BattleEngine.renderHeroPreview({});
        global.BattleEngine.renderHeroPreview({ getContext: 123 });
      });

      r.test('3.3 renderHeroPaperdollPreview (BattleEngine delegation) with null context returns gracefully', () => {
        r.assert(typeof global.renderHeroPaperdollPreview === 'function', 'renderHeroPaperdollPreview exists');

        const nullCanvas = {
          width: 200,
          height: 200,
          getContext: () => null
        };

        // Delegating path: BattleEngine is present
        global.renderHeroPaperdollPreview(nullCanvas, { rpg_class: 'warrior' });
      });

      r.test('3.4 renderHeroPaperdollPreview fallback path (BattleEngine disabled) with null context', () => {
        const nullCanvas = {
          width: 200,
          height: 200,
          getContext: () => null
        };

        // Temporarily hide BattleEngine.renderHeroPreview to force fallback path execution
        const savedEngine = global.BattleEngine;
        try {
          global.BattleEngine = undefined;
          // Should NOT throw TypeError: Cannot read properties of null (reading 'clearRect')
          global.renderHeroPaperdollPreview(nullCanvas, { rpg_class: 'warrior' });
        } finally {
          global.BattleEngine = savedEngine;
        }
      });

      r.test('3.5 Real DOM HTMLCanvasElement with mocked null getContext returns gracefully in both functions', () => {
        const domCanvas = document.createElement('canvas');
        domCanvas.width = 150;
        domCanvas.height = 150;
        domCanvas.id = 'temp_null_canvas_test';
        document.body.appendChild(domCanvas);

        // Mock getContext to return null
        const originalGetContext = domCanvas.getContext;
        domCanvas.getContext = () => null;

        try {
          // Test BattleEngine.renderHeroPreview by reference
          global.BattleEngine.renderHeroPreview(domCanvas);

          // Test BattleEngine.renderHeroPreview by string ID
          global.BattleEngine.renderHeroPreview('temp_null_canvas_test');

          // Test renderHeroPaperdollPreview by reference
          global.renderHeroPaperdollPreview(domCanvas, { rpg_class: 'mage' });

          // Test renderHeroPaperdollPreview by string ID
          global.renderHeroPaperdollPreview('temp_null_canvas_test', { rpg_class: 'ranger' });

          // Test renderHeroPaperdollPreview fallback by string ID
          const savedEngine = global.BattleEngine;
          try {
            global.BattleEngine = undefined;
            global.renderHeroPaperdollPreview('temp_null_canvas_test', { rpg_class: 'assassin' });
          } finally {
            global.BattleEngine = savedEngine;
          }
        } finally {
          domCanvas.remove();
        }
      });

      r.test('3.6 Canvas with 0x0 dimensions and null context returns gracefully', () => {
        const zeroCanvas = {
          width: 0,
          height: 0,
          getContext: () => null
        };

        global.BattleEngine.renderHeroPreview(zeroCanvas);
        global.renderHeroPaperdollPreview(zeroCanvas, {});

        const savedEngine = global.BattleEngine;
        try {
          global.BattleEngine = undefined;
          global.renderHeroPaperdollPreview(zeroCanvas, {});
        } finally {
          global.BattleEngine = savedEngine;
        }
      });

      // ============================================================================
      // SUITE 4: Verification of stress_m4_challenger Suite
      // ============================================================================
      r.suite('4. Challenger M4 22-Test Suite Regression Check');

      r.test('4.1 All 22 tests in runChallengerStressTests pass with 0 failures', () => {
        if (typeof global.runChallengerStressTests === 'function') {
          const summary = global.runChallengerStressTests();
          r.assertEqual(summary.failed, 0, `Expected 0 failures in stress_m4_challenger, got ${summary.failed}`);
          r.assertEqual(summary.total, 22, `Expected 22 total tests in stress_m4_challenger, got ${summary.total}`);
          r.assertEqual(summary.passed, 22, `Expected 22 passed tests in stress_m4_challenger, got ${summary.passed}`);
        } else {
          r.assert(false, 'runChallengerStressTests function not loaded');
        }
      });

    } finally {
      global.alert = oldAlert;
      global.confirm = oldConfirm;
    }

    return r.getSummary();
  }

  global.runChallengerM43Tests = runChallengerM43Tests;
})(typeof window !== 'undefined' ? window : this);
