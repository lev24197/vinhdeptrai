/**
 * ==============================================================================
 * EMPIRICAL ADVERSARIAL CHALLENGER SUITE — MILESTONE 6 ITERATION 2
 * File: tests/challenger_m6_2_empirical.js
 * Challenger: challenger_m6_2 (Empirical Challenger: Formula Boundaries & Production Coverage)
 * ==============================================================================
 * Empirical challenges against core production gamification functions:
 *   1. window.calculateElementalMultiplier (Edge cases, invalid inputs, 8x8 canonical matrix)
 *   2. window.calculatePlayerTotalStats (Extreme gear values, 75% Crit & 60% Dodge hard caps)
 *   3. window.calculateMonsterDamage (0 DEF, extreme DEF, negative inputs, boundaries & floor of 8)
 *   4. Holistic Formula Invariants & Stress Fuzzing
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class ChallengerEmpiricalRunner {
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

    assertCloseTo(actual, expected, delta = 0.001, message) {
      if (Math.abs(actual - expected) > delta) {
        throw new Error(`${message || 'assertCloseTo failed'}: expected [${expected}] ±${delta} but got [${actual}]`);
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

  function runChallengerM62Tests() {
    const r = new ChallengerEmpiricalRunner();

    // ========================================================================
    // SUITE 1: window.calculateElementalMultiplier Boundaries & 8x8 Canonical Matrix
    // ========================================================================
    r.suite('1. calculateElementalMultiplier Boundaries & Matrix');

    r.test('1.1 Global availability & elemental matchups dictionary integrity', () => {
      const calcElem = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      const matchups = global.ELEMENTAL_MATCHUPS || window.ELEMENTAL_MATCHUPS;
      r.assert(typeof calcElem === 'function', 'window.calculateElementalMultiplier must be exposed globally as a function');
      r.assert(typeof matchups === 'object' && matchups !== null, 'window.ELEMENTAL_MATCHUPS must be a valid object');

      const expectedElements = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];
      expectedElements.forEach(elem => {
        r.assert(elem in matchups, `Element [${elem}] must exist in window.ELEMENTAL_MATCHUPS`);
      });
    });

    r.test('1.2 Undefined, null, empty and falsy input resilience', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      r.assertEqual(calc(undefined, undefined), 1.0, 'undefined vs undefined returns 1.0');
      r.assertEqual(calc(null, null), 1.0, 'null vs null returns 1.0');
      r.assertEqual(calc(null, 'fire'), 1.0, 'null attacker returns 1.0');
      r.assertEqual(calc('fire', null), 1.0, 'null defender returns 1.0');
      r.assertEqual(calc(undefined, 'water'), 1.0, 'undefined attacker returns 1.0');
      r.assertEqual(calc('water', undefined), 1.0, 'undefined defender returns 1.0');
      r.assertEqual(calc('', ''), 1.0, 'empty string vs empty string returns 1.0');
      r.assertEqual(calc('', 'nature'), 1.0, 'empty string attacker returns 1.0');
      r.assertEqual(calc('nature', ''), 1.0, 'empty string defender returns 1.0');
      r.assertEqual(calc(0, 0), 1.0, '0 vs 0 returns 1.0');
      r.assertEqual(calc(0, 'holy'), 1.0, '0 attacker returns 1.0');
      r.assertEqual(calc('holy', 0), 1.0, '0 defender returns 1.0');
      r.assertEqual(calc(false, false), 1.0, 'false vs false returns 1.0');
      r.assertEqual(calc(NaN, 'fire'), 1.0, 'NaN attacker returns 1.0');
    });

    r.test('1.3 Invalid types, objects, arrays and non-elemental string resilience', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      r.assertEqual(calc('unknown_element', 'nature'), 1.0, 'unknown string attacker returns 1.0');
      r.assertEqual(calc('fire', 'unknown_element'), 1.0, 'unknown string defender returns 1.0');
      r.assertEqual(calc('xyz123', 'abc456'), 1.0, 'two unknown strings return 1.0');
      r.assertEqual(calc({}, {}), 1.0, 'objects return 1.0 without throwing');
      r.assertEqual(calc([], []), 1.0, 'arrays return 1.0 without throwing');
      r.assertEqual(calc(12345, 67890), 1.0, 'numbers return 1.0 without throwing');
      r.assertEqual(calc(true, false), 1.0, 'booleans return 1.0 without throwing');
    });

    r.test('1.4 Case insensitivity across canonical elements', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      r.assertEqual(calc('FIRE', 'nature'), 1.5, 'FIRE (upper) vs nature (lower) = 1.5');
      r.assertEqual(calc('nature', 'FIRE'), 0.7, 'nature (lower) vs FIRE (upper) = 0.7');
      r.assertEqual(calc('WATER', 'FIRE'), 1.5, 'WATER vs FIRE = 1.5');
      r.assertEqual(calc('fire', 'WATER'), 0.7, 'fire vs WATER = 0.7');
      r.assertEqual(calc('NATURE', 'WATER'), 1.5, 'NATURE vs WATER = 1.5');
      r.assertEqual(calc('water', 'NATURE'), 0.8, 'water vs NATURE = 0.8');
      r.assertEqual(calc('LIGHTNING', 'water'), 1.5, 'LIGHTNING vs water = 1.5');
      r.assertEqual(calc('water', 'LIGHTNING'), 0.7, 'water vs LIGHTNING = 0.7');
      r.assertEqual(calc('HOLY', 'dark'), 1.6, 'HOLY vs dark = 1.6');
      r.assertEqual(calc('dark', 'HOLY'), 1.2, 'dark vs HOLY = 1.2');
      r.assertEqual(calc('CYBER', 'dark'), 1.3, 'CYBER vs dark = 1.3');
      r.assertEqual(calc('COSMIC', 'dark'), 1.4, 'COSMIC vs dark = 1.4');
      r.assertEqual(calc('FiRe', 'nAtUrE'), 1.5, 'FiRe mixed vs nAtUrE mixed = 1.5');
      r.assertEqual(calc('dArK', 'hOlY'), 1.2, 'dArK mixed vs hOlY mixed = 1.2');
    });

    r.test('1.5 Complete 8x8 canonical matrix (64 pairs) correctness & neutrality bounds', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      const matchups = global.ELEMENTAL_MATCHUPS || window.ELEMENTAL_MATCHUPS;
      const elements = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];

      let evaluatedPairs = 0;
      elements.forEach(atk => {
        elements.forEach(def => {
          evaluatedPairs++;
          const mult = calc(atk, def);

          r.assert(typeof mult === 'number' && !isNaN(mult) && isFinite(mult), `Multiplier for ${atk}->${def} must be finite number`);
          r.assert(mult >= 0.5 && mult <= 2.0, `Multiplier for ${atk}->${def} [${mult}] must be within [0.5, 2.0]`);

          if (atk === def) {
            r.assertEqual(mult, 1.0, `Self-matchup ${atk}->${def} must be strictly 1.0`);
          } else {
            const expectedFromDict = matchups[atk]?.[def] || 1.0;
            r.assertEqual(mult, expectedFromDict, `Matchup ${atk}->${def} must equal dictionary value [${expectedFromDict}]`);
          }
        });
      });

      r.assertEqual(evaluatedPairs, 64, 'Exactly 64 elemental pairs evaluated');
    });

    r.test('1.6 Asymmetric and omni-pressure design properties', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;

      // Asymmetric holy <-> dark advantage: both deal bonus damage to each other
      const holyVsDark = calc('holy', 'dark');
      const darkVsHoly = calc('dark', 'holy');
      r.assertEqual(holyVsDark, 1.6, 'Holy deals 1.6x to Dark');
      r.assertEqual(darkVsHoly, 1.2, 'Dark deals 1.2x to Holy');
      r.assert(holyVsDark > 1.0 && darkVsHoly > 1.0, 'Holy and Dark mutually exploit each other with asymmetric advantage');

      // Primary Trinity cyclic dominance: Fire > Nature > Water > Fire
      r.assert(calc('fire', 'nature') > 1.0, 'Fire beats Nature');
      r.assert(calc('nature', 'fire') < 1.0, 'Nature resists Fire');
      r.assert(calc('water', 'fire') > 1.0, 'Water beats Fire');
      r.assert(calc('fire', 'water') < 1.0, 'Fire resists Water');
      r.assert(calc('nature', 'water') > 1.0, 'Nature beats Water');
      r.assert(calc('water', 'nature') < 1.0, 'Water resists Nature');

      // Cosmic omni-pressure
      const cosmicTargets = ['dark', 'holy', 'cyber', 'fire', 'water'];
      cosmicTargets.forEach(target => {
        r.assert(calc('cosmic', target) > 1.0, `Cosmic maintains offensive bonus against ${target}`);
      });
    });

    r.test('1.7 High-volume randomized element fuzzing (5,000 iterations)', () => {
      const calc = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      const elements = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];
      const noise = [null, undefined, '', 'chaos', 'void', 42, {}, [], NaN, true, 'FIRE', 'wAtEr'];

      for (let i = 0; i < 5000; i++) {
        const poolA = (i % 2 === 0) ? elements : noise;
        const poolB = (i % 3 === 0) ? noise : elements;
        const a = poolA[Math.floor(Math.random() * poolA.length)];
        const b = poolB[Math.floor(Math.random() * poolB.length)];

        const result = calc(a, b);
        r.assert(typeof result === 'number' && !isNaN(result) && isFinite(result) && result > 0, `Fuzz iteration ${i} produced invalid multiplier: ${result}`);
      }
    });

    // ========================================================================
    // SUITE 2: window.calculatePlayerTotalStats Gear Overload & Caps (75% Crit, 60% Dodge)
    // ========================================================================
    r.suite('2. calculatePlayerTotalStats Gear Overload & Caps');

    r.test('2.1 Defensive baseline stats on null, undefined and empty user profiles', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;
      r.assert(typeof calcStats === 'function', 'calculatePlayerTotalStats must be exposed globally');

      const nullStats = calcStats(null);
      r.assert(nullStats && typeof nullStats === 'object', 'null user produces valid baseline stats object');
      r.assertEqual(nullStats.atk, 25, 'Baseline ATK is 25');
      r.assertEqual(nullStats.hp, 100, 'Baseline HP is 100');
      r.assertEqual(nullStats.mp, 40, 'Baseline MP is 40');
      r.assertEqual(nullStats.def, 0, 'Baseline DEF is 0');
      r.assertEqual(nullStats.crit, 5, 'Baseline Crit is 5%');
      r.assertEqual(nullStats.dodge, 4, 'Baseline Dodge is 4%');

      const undefStats = calcStats(undefined);
      r.assertEqual(undefStats.atk, 25, 'undefined user produces baseline ATK 25');

      const emptyStats = calcStats({});
      r.assertEqual(emptyStats.atk, 25, 'empty user produces baseline ATK 25');
    });

    r.test('2.2 Baseline progression and class-specific initial stats', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      // Level scaling: 25 + (level - 1) * 4
      r.assertEqual(calcStats({ level: 1 }).atk, 25, 'Level 1 ATK = 25');
      r.assertEqual(calcStats({ level: 10 }).atk, 61, 'Level 10 ATK = 25 + 9*4 = 61');
      r.assertEqual(calcStats({ level: 50 }).atk, 221, 'Level 50 ATK = 25 + 49*4 = 221');

      // 4 Classes baseline
      const warrior = calcStats({ rpg_class: 'warrior' });
      r.assertEqual(warrior.crit, 5, 'Warrior base crit = 5');
      r.assertEqual(warrior.dodge, 4, 'Warrior base dodge = 4');

      const mage = calcStats({ rpg_class: 'mage' });
      r.assertEqual(mage.crit, 5, 'Mage base crit = 5');
      r.assertEqual(mage.dodge, 4, 'Mage base dodge = 4');
      r.assertEqual(mage.expBonus, 10, 'Mage base expBonus = 10%');

      const ranger = calcStats({ rpg_class: 'ranger' });
      r.assertEqual(ranger.crit, 5, 'Ranger base crit = 5');
      r.assertEqual(ranger.dodge, 8, 'Ranger base dodge = 8%');

      const assassin = calcStats({ rpg_class: 'assassin' });
      r.assertEqual(assassin.crit, 12, 'Assassin base crit = 12%');
      r.assertEqual(assassin.dodge, 10, 'Assassin base dodge = 10%');
      r.assertEqual(assassin.goldBonus, 15, 'Assassin base goldBonus = 15%');
    });

    r.test('2.3 Passive skills stat additions across classes and equipped structure contract', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      // Contract test: When user.equipped is missing, line 102 early returns baseline without evaluating passives
      const warriorNoEquipped = calcStats({ rpg_class: 'warrior', skills_unlocked: { passive_1: true } });
      r.assertEqual(warriorNoEquipped.hp, 100, 'Missing equipped property short-circuits to base 100 HP per line 102 guard');
      r.assertEqual(warriorNoEquipped.def, 0, 'Missing equipped property short-circuits to base 0 DEF');

      // When equipped: {} is provided, passives evaluate completely
      const warriorWithPassive = calcStats({ rpg_class: 'warrior', skills_unlocked: { passive_1: true }, equipped: {} });
      r.assertEqual(warriorWithPassive.hp, 130, 'Warrior passive_1 adds +30 HP (100 -> 130)');
      r.assertEqual(warriorWithPassive.def, 15, 'Warrior passive_1 adds +15 DEF (0 -> 15)');

      const mageWithPassive = calcStats({ rpg_class: 'mage', skills_unlocked: { passive_2: true }, equipped: {} });
      r.assertEqual(mageWithPassive.mp, 65, 'Mage passive_2 adds +25 MP (40 -> 65)');
      r.assertEqual(mageWithPassive.atk, 40, 'Mage passive_2 adds +15 ATK (25 -> 40)');

      const rangerWithPassive = calcStats({ rpg_class: 'ranger', skills_unlocked: { passive_1: true, passive_2: true }, equipped: {} });
      r.assertEqual(rangerWithPassive.crit, 20, 'Ranger passive_1 adds +15% Crit (5 -> 20)');
      r.assertEqual(rangerWithPassive.goldBonus, 30, 'Ranger passive_2 adds +30% Gold Bonus (0 -> 30)');

      const assassinWithPassive = calcStats({ rpg_class: 'assassin', skills_unlocked: { passive_2: true }, equipped: {} });
      r.assertEqual(assassinWithPassive.dodge, 25, 'Assassin passive_2 adds +15% Dodge (10 -> 25)');
    });

    r.test('2.4 Critical Strike Hard Cap (75% Cap) Boundary Tests', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      // Temporary inject custom items into catalog to test exact crit boundaries
      const catalog = global.RPG_EQUIPMENT_CATALOG;
      const testItemSubCap = { id: 'test_crit_sub', slot: 'weapon', stats: { crit: 69 } }; // 5 base + 69 = 74%
      const testItemExactCap = { id: 'test_crit_exact', slot: 'weapon', stats: { crit: 70 } }; // 5 base + 70 = 75%
      const testItemOverCap = { id: 'test_crit_over', slot: 'weapon', stats: { crit: 71 } }; // 5 base + 71 = 76% -> 75%
      const testItemMegaOver = { id: 'test_crit_mega', slot: 'weapon', stats: { crit: 9999 } };
      const testItemNegative = { id: 'test_crit_neg', slot: 'weapon', stats: { crit: -100 } };

      catalog.push(testItemSubCap, testItemExactCap, testItemOverCap, testItemMegaOver, testItemNegative);

      try {
        // Exact 74% (sub-cap)
        const stats74 = calcStats({ equipped: { weapon: 'test_crit_sub' } });
        r.assertEqual(stats74.crit, 74, 'Crit at 74% stays 74%');

        // Exact 75% (cap)
        const stats75 = calcStats({ equipped: { weapon: 'test_crit_exact' } });
        r.assertEqual(stats75.crit, 75, 'Crit at 75% stays 75%');

        // Exact 76% (over-cap)
        const stats76 = calcStats({ equipped: { weapon: 'test_crit_over' } });
        r.assertEqual(stats76.crit, 75, 'Crit at 76% clamps strictly to 75%');

        // Extreme 10,000% crit overload
        const statsMega = calcStats({ equipped: { weapon: 'test_crit_mega' } });
        r.assertEqual(statsMega.crit, 75, 'Crit at 9999% clamps strictly to 75%');

        // Negative crit underflow
        const statsNeg = calcStats({ equipped: { weapon: 'test_crit_neg' } });
        r.assertEqual(statsNeg.crit, 0, 'Negative crit clamps strictly to 0% floor');
      } finally {
        catalog.splice(catalog.indexOf(testItemSubCap), 1);
        catalog.splice(catalog.indexOf(testItemExactCap), 1);
        catalog.splice(catalog.indexOf(testItemOverCap), 1);
        catalog.splice(catalog.indexOf(testItemMegaOver), 1);
        catalog.splice(catalog.indexOf(testItemNegative), 1);
      }
    });

    r.test('2.5 Dodge Rate Hard Cap (60% Cap) Boundary Tests', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      const catalog = global.RPG_EQUIPMENT_CATALOG;
      const testItemSubCap = { id: 'test_dodge_sub', slot: 'armor', stats: { dodge: 55 } }; // 4 base + 55 = 59%
      const testItemExactCap = { id: 'test_dodge_exact', slot: 'armor', stats: { dodge: 56 } }; // 4 base + 56 = 60%
      const testItemOverCap = { id: 'test_dodge_over', slot: 'armor', stats: { dodge: 57 } }; // 4 base + 57 = 61% -> 60%
      const testItemMegaOver = { id: 'test_dodge_mega', slot: 'armor', stats: { dodge: 9999 } };
      const testItemNegative = { id: 'test_dodge_neg', slot: 'armor', stats: { dodge: -100 } };

      catalog.push(testItemSubCap, testItemExactCap, testItemOverCap, testItemMegaOver, testItemNegative);

      try {
        // Exact 59% (sub-cap)
        const stats59 = calcStats({ equipped: { armor: 'test_dodge_sub' } });
        r.assertEqual(stats59.dodge, 59, 'Dodge at 59% stays 59%');

        // Exact 60% (cap)
        const stats60 = calcStats({ equipped: { armor: 'test_dodge_exact' } });
        r.assertEqual(stats60.dodge, 60, 'Dodge at 60% stays 60%');

        // Exact 61% (over-cap)
        const stats61 = calcStats({ equipped: { armor: 'test_dodge_over' } });
        r.assertEqual(stats61.dodge, 60, 'Dodge at 61% clamps strictly to 60%');

        // Extreme 10,000% dodge overload
        const statsMega = calcStats({ equipped: { armor: 'test_dodge_mega' } });
        r.assertEqual(statsMega.dodge, 60, 'Dodge at 9999% clamps strictly to 60%');

        // Negative dodge underflow
        const statsNeg = calcStats({ equipped: { armor: 'test_dodge_neg' } });
        r.assertEqual(statsNeg.dodge, 0, 'Negative dodge clamps strictly to 0% floor');
      } finally {
        catalog.splice(catalog.indexOf(testItemSubCap), 1);
        catalog.splice(catalog.indexOf(testItemExactCap), 1);
        catalog.splice(catalog.indexOf(testItemOverCap), 1);
        catalog.splice(catalog.indexOf(testItemMegaOver), 1);
        catalog.splice(catalog.indexOf(testItemNegative), 1);
      }
    });

    r.test('2.6 Extreme gear stats scaling (ATK, HP, DEF, MP) resilience', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      const catalog = global.RPG_EQUIPMENT_CATALOG;
      const colossalGear = {
        id: 'colossal_titan_plate',
        slot: 'armor',
        stats: { atk: 1000000, hp: 5000000, def: 250000, mp: 50000 }
      };
      catalog.push(colossalGear);

      try {
        const stats = calcStats({
          level: 10,
          equipped: { armor: 'colossal_titan_plate' }
        });

        r.assertEqual(stats.atk, 1000061, 'ATK aggregates colossal value + base level 10 (61)');
        r.assertEqual(stats.hp, 5000100, 'HP aggregates colossal value + base 100');
        r.assertEqual(stats.def, 250000, 'DEF aggregates colossal value');
        r.assertEqual(stats.mp, 50040, 'MP aggregates colossal value + base 40');
        r.assert(!isNaN(stats.atk) && isFinite(stats.atk), 'ATK remains finite');
      } finally {
        catalog.splice(catalog.indexOf(colossalGear), 1);
      }
    });

    r.test('2.7 Forge enhance level multiplier math (+0 to +10, negative and missing levels)', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      const catalog = global.RPG_EQUIPMENT_CATALOG;
      const baseItem = {
        id: 'test_forge_sword',
        slot: 'weapon',
        stats: { atk: 100, def: 40 }
      };
      catalog.push(baseItem);

      try {
        // Level 0 enhancement: 0% bonus -> atk = 25 + 100 = 125, def = 40
        const stats0 = calcStats({ equipped: { weapon: 'test_forge_sword' }, equipment_enhances: { weapon: 0 } });
        r.assertEqual(stats0.atk, 125, '+0 enhancement gives exact baseline');
        r.assertEqual(stats0.def, 40, '+0 enhancement gives exact baseline DEF');

        // Level 1 enhancement: +15% -> atk = 25 + 100 + round(100 * 0.15) = 140, def = 40 + round(40*0.15) = 46
        const stats1 = calcStats({ equipped: { weapon: 'test_forge_sword' }, equipment_enhances: { weapon: 1 } });
        r.assertEqual(stats1.atk, 140, '+1 enhancement adds exactly 15%');
        r.assertEqual(stats1.def, 46, '+1 enhancement adds exactly 15% to DEF');

        // Level 10 enhancement: +150% -> atk = 25 + 100 + round(100 * 1.5) = 275, def = 40 + round(40*1.5) = 100
        const stats10 = calcStats({ equipped: { weapon: 'test_forge_sword' }, equipment_enhances: { weapon: 10 } });
        r.assertEqual(stats10.atk, 275, '+10 enhancement adds exactly 150% (2.5x base)');
        r.assertEqual(stats10.def, 100, '+10 enhancement adds exactly 150% to DEF');

        // Negative enhancement level: must NOT reduce stats
        const statsNeg = calcStats({ equipped: { weapon: 'test_forge_sword' }, equipment_enhances: { weapon: -5 } });
        r.assertEqual(statsNeg.atk, 125, 'Negative enhance level is safely ignored and does not decrease stats');
      } finally {
        catalog.splice(catalog.indexOf(baseItem), 1);
      }
    });

    r.test('2.8 Corrupted equipment references and malformed slots safety', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;

      const userCorrupt = {
        level: 5,
        equipped: {
          weapon: 'non_existent_item_id_xyz',
          helmet: null,
          armor: undefined,
          boots: 12345,
          accessory: {}
        },
        equipment_enhances: {
          weapon: 10,
          boots: 'invalid'
        }
      };

      const stats = calcStats(userCorrupt);
      r.assert(stats && typeof stats === 'object', 'Corrupted equipment references return valid stats object');
      r.assertEqual(stats.atk, 41, 'Valid level 5 ATK calculated despite missing equipment');
      r.assertEqual(stats.crit, 5, 'Crit defaults to 5%');
      r.assertEqual(stats.dodge, 4, 'Dodge defaults to 4%');
    });

    // ========================================================================
    // SUITE 3: window.calculateMonsterDamage DEF & ATK Boundaries & Floor Clamp
    // ========================================================================
    r.suite('3. calculateMonsterDamage Boundaries & Floor Clamp');

    r.test('3.1 Global exposure and functional signature', () => {
      const calcMonsterDmg = global.calculateMonsterDamage || window.calculateMonsterDamage;
      r.assert(typeof calcMonsterDmg === 'function', 'window.calculateMonsterDamage must be exposed globally as a function');
    });

    r.test('3.2 Zero DEF behavior: 100% unmitigated base damage scaling', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // When heroDef = 0, defReduction = 60 / (60 + 0) = 1.0.
      // damage = Math.max(8, Math.round((12 + atk*0.20 + rand) * 1.0))
      r.assertEqual(calc(100, 0, 0), 32, 'ATK 100 vs DEF 0 (rand 0) = 12 + 20 = 32');
      r.assertEqual(calc(200, 0, 0), 52, 'ATK 200 vs DEF 0 (rand 0) = 12 + 40 = 52');
      r.assertEqual(calc(20, 0, 0), 16, 'ATK 20 vs DEF 0 (rand 0) = 12 + 4 = 16');
      r.assertEqual(calc(0, 0, 0), 12, 'ATK 0 vs DEF 0 (rand 0) = 12 + 0 = 12');
    });

    r.test('3.3 Extreme defense values & absolute minimum floor clamp of 8', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // With huge DEF, damage must asymptotically approach 0, but clamp strictly to 8
      r.assertEqual(calc(100, 500, 0), 8, 'ATK 100 vs DEF 500 clamps to minimum floor 8');
      r.assertEqual(calc(275, 5000, 0), 8, 'ATK 275 vs DEF 5000 clamps to minimum floor 8');
      r.assertEqual(calc(500, 100000, 0), 8, 'ATK 500 vs DEF 100,000 clamps to minimum floor 8');
      r.assertEqual(calc(1000, 10000000, 0), 8, 'ATK 1000 vs DEF 10,000,000 clamps to minimum floor 8');
      r.assertEqual(calc(1000, Number.MAX_SAFE_INTEGER, 0), 8, 'ATK 1000 vs DEF MAX_SAFE_INTEGER clamps to 8');
      r.assertEqual(calc(1000, Infinity, 0), 8, 'ATK 1000 vs DEF Infinity clamps to 8 without throwing');
    });

    r.test('3.4 Negative DEF coercion and zero-division critical protection', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // If def < 0, it must clamp to 0 (Math.max(0, def)).
      // Critical check: def = -60 would cause 60 / (60 + (-60)) = 60/0 = Infinity if unclamped!
      const dmgNeg10 = calc(100, -10, 0);
      const dmgDef0 = calc(100, 0, 0);
      r.assertEqual(dmgNeg10, dmgDef0, 'DEF -10 clamps to 0 DEF (32 dmg)');

      const dmgNeg50 = calc(100, -50, 0);
      r.assertEqual(dmgNeg50, 32, 'DEF -50 clamps to 0 DEF (32 dmg)');

      const dmgNeg60 = calc(100, -60, 0);
      r.assertEqual(dmgNeg60, 32, 'DEF -60 clamps to 0 DEF and avoids divide-by-zero Infinity singularity');

      const dmgNeg100 = calc(100, -100, 0);
      r.assertEqual(dmgNeg100, 32, 'DEF -100 clamps to 0 DEF and avoids negative reduction multiplier');
    });

    r.test('3.5 Negative ATK and negative rand offset coercion', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // Negative ATK clamps to 0 (atk = Math.max(0, rawAtk))
      const dmgNegAtk = calc(-50, 10, 0);
      const dmgZeroAtk = calc(0, 10, 0);
      r.assertEqual(dmgNegAtk, dmgZeroAtk, 'Negative ATK -50 clamps to 0 ATK');
      r.assertEqual(dmgNegAtk, 10, '0 ATK vs 10 DEF (rand 0) = round(12 * 60/70) = 10');

      // Negative randOffset clamps to minimum floor 8
      const dmgNegRand = calc(10, 50, -100);
      r.assertEqual(dmgNegRand, 8, 'Heavy negative randOffset cannot violate minimum floor 8');
    });

    r.test('3.6 Non-numeric, null, undefined and corrupted argument fallbacks', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // Defaults: atk defaults to 20, def defaults to 10
      // Expected default dmg with rand 0: (12 + 20*0.2) * (60/70) = 16 * 0.8571 = 13.71 -> 14
      r.assertEqual(calc(undefined, 10, 0), 14, 'undefined atk defaults to 20 (dmg 14)');
      r.assertEqual(calc(null, 10, 0), 14, 'null atk defaults to 20 (dmg 14)');
      r.assertEqual(calc(NaN, 10, 0), 14, 'NaN atk defaults to 20 (dmg 14)');
      r.assertEqual(calc('invalid', 10, 0), 14, 'string atk defaults to 20 (dmg 14)');

      r.assertEqual(calc(20, undefined, 0), 14, 'undefined def defaults to 10 (dmg 14)');
      r.assertEqual(calc(20, null, 0), 14, 'null def defaults to 10 (dmg 14)');
      r.assertEqual(calc(20, NaN, 0), 14, 'NaN def defaults to 10 (dmg 14)');
      r.assertEqual(calc(20, 'invalid', 0), 14, 'string def defaults to 10 (dmg 14)');

      r.assertEqual(calc(undefined, undefined, 0), 14, 'undefined both defaults to atk 20, def 10 (dmg 14)');
    });

    r.test('3.7 Mathematical Monotonicity Invariants wrt DEF and ATK', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // Invariant 1: For any fixed ATK, damage monotonically non-increases as DEF increases
      const testAtks = [20, 50, 100, 275, 500];
      testAtks.forEach(atk => {
        let prevDmg = Infinity;
        for (let def = 0; def <= 200; def += 5) {
          const dmg = calc(atk, def, 0);
          r.assert(dmg <= prevDmg, `Monotonicity violation wrt DEF: ATK ${atk}, DEF ${def} gave ${dmg} > prev ${prevDmg}`);
          r.assert(dmg >= 8, `Floor violation: ATK ${atk}, DEF ${def} gave ${dmg} < 8`);
          prevDmg = dmg;
        }
      });

      // Invariant 2: For any fixed DEF, damage monotonically non-decreases as ATK increases
      const testDefs = [0, 10, 30, 60, 100];
      testDefs.forEach(def => {
        let prevDmg = -Infinity;
        for (let atk = 0; atk <= 300; atk += 5) {
          const dmg = calc(atk, def, 0);
          r.assert(dmg >= prevDmg, `Monotonicity violation wrt ATK: DEF ${def}, ATK ${atk} gave ${dmg} < prev ${prevDmg}`);
          r.assert(dmg >= 8, `Floor violation: DEF ${def}, ATK ${atk} gave ${dmg} < 8`);
          prevDmg = dmg;
        }
      });
    });

    r.test('3.8 High-volume randomized damage calculation fuzzing (5,000 iterations)', () => {
      const calc = global.calculateMonsterDamage || window.calculateMonsterDamage;
      const fuzzInputs = [-1000, -60, -1, 0, 1, 10, 45, 100, 275, 1000, 999999, undefined, null, NaN, 'text', {}, []];

      for (let i = 0; i < 5000; i++) {
        const atk = fuzzInputs[Math.floor(Math.random() * fuzzInputs.length)];
        const def = fuzzInputs[Math.floor(Math.random() * fuzzInputs.length)];
        const rand = (i % 2 === 0) ? (Math.random() * 6) : null;

        const dmg = calc(atk, def, rand);
        r.assert(typeof dmg === 'number', `Fuzz iteration ${i} must return number`);
        r.assert(!isNaN(dmg), `Fuzz iteration ${i} must not return NaN`);
        r.assert(isFinite(dmg), `Fuzz iteration ${i} must return finite value`);
        r.assert(dmg >= 8, `Fuzz iteration ${i} must never be less than floor 8 (got ${dmg})`);
        r.assertEqual(dmg, Math.floor(dmg), `Fuzz iteration ${i} must return integer`);
      }
    });

    // ========================================================================
    // SUITE 4: Cross-Formula Holistic Combat Integration & Invariants
    // ========================================================================
    r.suite('4. Cross-Formula Holistic Combat Integration');

    r.test('4.1 Complete end-to-end combat damage flow under extreme gear & affinities', () => {
      const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;
      const calcElem = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
      const calcMonsterDmg = global.calculateMonsterDamage || window.calculateMonsterDamage;

      // Register high-defense item into catalog for test
      const catalog = global.RPG_EQUIPMENT_CATALOG;
      const tankShield = {
        id: 'tank_aegis_shield',
        slot: 'weapon',
        stats: { atk: 10, def: 25, hp: 100 }
      };
      catalog.push(tankShield);

      try {
        // Maxed out high-tier tank hero
        const tankHero = {
          level: 50,
          rpg_class: 'warrior',
          skills_unlocked: { passive_1: true }, // +15 DEF
          equipped_pet: 'shadow_panther',        // +10 DEF
          equipped: {
            weapon: 'tank_aegis_shield',        // 25 DEF (+10 enhance -> +38 DEF = 63 DEF)
            armor: 'ar_dragon_scale',
            helmet: 'hm_dragon_crown',
            boots: 'bt_dragon_stompers',
            accessory: 'ac_dragon_heart'
          },
          equipment_enhances: { weapon: 10, armor: 10, helmet: 10, boots: 10, accessory: 10 }
        };

        const heroStats = calcStats(tankHero);
        // Total DEF: 25 (item) + 38 (enhance) + 15 (passive) + 10 (pet) = 88 DEF
        r.assert(heroStats.def > 50, `High-tier tank has substantial DEF (>50, got ${heroStats.def})`);
        r.assert(heroStats.hp >= 100, 'High-tier tank has substantial HP');

        // Boss strike calculation: Fire boss vs Water hero
        const elemMult = calcElem('fire', 'water');
        r.assertEqual(elemMult, 0.7, 'Fire boss against Water hero suffers 0.7x disadvantage');

        const rawBossAtk = 275 * elemMult; // 192.5
        const incomingDmg = calcMonsterDmg(rawBossAtk, heroStats.def, 3);
        r.assert(incomingDmg >= 8, 'Tank hero takes at least 8 damage');
        r.assert(incomingDmg < 30, `Tank hero with ${heroStats.def} DEF effectively mitigates boss damage (took ${incomingDmg})`);
      } finally {
        catalog.splice(catalog.indexOf(tankShield), 1);
      }
    });

    return r.getSummary();
  }

  // Export to global scope
  global.runChallengerM62Tests = runChallengerM62Tests;

})(typeof window !== 'undefined' ? window : global);
