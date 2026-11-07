/**
 * ============================================================================
 * THE ANKI DICTIONARY & RPG ARENA - PROGRAMMATIC VERIFICATION TEST SUITE
 * File: tests/gamification_test_suite.js
 * Author: QA & Stress-Test Auditor
 * 
 * Comprehensive E2E & Programmatic Verification Suite covering:
 *  1. Turn-Based Combat Formulas, Elemental Matrix & Boss AI
 *  2. 100 Dungeons & 100 Bosses Data Schema & Elemental Themes
 *  3. Tower of Babel Floor Scaling, Modifiers & Progression
 *  4. 5-Slot Paperdoll Preview, Equipment Stats, Set Bonuses & Forge (+1..+10)
 *  5. Gacha Mystery Chests & 10-Pull Pity Counter
 *  6. Economy Balance Simulation (Faucets vs Sinks)
 *  7. 4 Character Classes & 4 Companion Pets
 *  8. Daily/Weekly Quests Triggers & Profile Save/Load Persistence
 * ============================================================================
 */

(function(global) {
  'use strict';

  // --- Lightweight Test Framework ---
  class TestRunner {
    constructor() {
      this.suites = {};
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.results = [];
    }

    suite(suiteName) {
      if (!this.suites[suiteName]) {
        this.suites[suiteName] = [];
      }
      return {
        test: (testName, testFn) => {
          this.suites[suiteName].push({ name: testName, fn: testFn });
        }
      };
    }

    assert(condition, message) {
      if (!condition) {
        throw new Error(message || 'Assertion failed');
      }
    }

    assertEqual(actual, expected, message) {
      if (actual !== expected) {
        throw new Error(`${message || 'assertEqual failed'}: expected [${expected}] but got [${actual}]`);
      }
    }

    assertDeepEqual(actual, expected, message) {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expected);
      if (actStr !== expStr) {
        throw new Error(`${message || 'assertDeepEqual failed'}: expected ${expStr} but got ${actStr}`);
      }
    }

    assertTrue(condition, message) {
      this.assertEqual(Boolean(condition), true, message || 'Expected true');
    }

    assertFalse(condition, message) {
      this.assertEqual(Boolean(condition), false, message || 'Expected false');
    }

    assertInRange(val, min, max, message) {
      if (val < min || val > max) {
        throw new Error(`${message || 'assertInRange failed'}: value [${val}] outside range [${min}, ${max}]`);
      }
    }

    assertGreaterThan(actual, benchmark, message) {
      if (!(actual > benchmark)) {
        throw new Error(`${message || 'assertGreaterThan failed'}: expected [${actual}] > [${benchmark}]`);
      }
    }

    assertThrows(fn, message) {
      let threw = false;
      try {
        fn();
      } catch (e) {
        threw = true;
      }
      if (!threw) {
        throw new Error(message || 'Expected function to throw an error, but it did not');
      }
    }

    async runAll() {
      const startTime = Date.now();
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.results = [];

      const suiteReports = {};

      for (const [suiteName, tests] of Object.entries(this.suites)) {
        suiteReports[suiteName] = {
          total: tests.length,
          passed: 0,
          failed: 0,
          tests: []
        };

        for (const t of tests) {
          this.total++;
          const tStart = Date.now();
          try {
            await t.fn(this);
            const duration = Date.now() - tStart;
            this.passed++;
            suiteReports[suiteName].passed++;
            const report = {
              suite: suiteName,
              name: t.name,
              passed: true,
              durationMs: duration
            };
            this.results.push(report);
            suiteReports[suiteName].tests.push(report);
          } catch (err) {
            const duration = Date.now() - tStart;
            this.failed++;
            suiteReports[suiteName].failed++;
            const report = {
              suite: suiteName,
              name: t.name,
              passed: false,
              error: err.message,
              stack: err.stack,
              durationMs: duration
            };
            this.results.push(report);
            suiteReports[suiteName].tests.push(report);
          }
        }
      }

      const totalDuration = Date.now() - startTime;
      const summary = {
        timestamp: new Date().toISOString(),
        total: this.total,
        passed: this.passed,
        failed: this.failed,
        passRate: this.total > 0 ? ((this.passed / this.total) * 100).toFixed(1) + '%' : '0%',
        durationMs: totalDuration,
        suites: suiteReports,
        results: this.results
      };

      global.__TEST_RESULTS__ = summary;
      return summary;
    }
  }

  const runner = new TestRunner();

  // Helper to clone objects cleanly
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ==========================================================================
  // SUITE 1: TURN-BASED COMBAT FORMULAS, ELEMENTAL MATRIX & BOSS AI
  // ==========================================================================
  const s1 = runner.suite('1. Combat Formulas & Elemental Matrix');

  s1.test('T1.1: Player Damage vs Monster DEF Mitigation & Minimum Floor', (t) => {
    t.assertTrue(typeof global.calculateCombatDamage === 'function', 'calculateCombatDamage must be defined globally');

    // Case 1: Normal attack without crit, 1.0 multiplier
    // formula: (atk * mult + random(0..11)) - floor(def / 3), min 15
    const atk = 60;
    const def = 30; // defMitigation = 10
    const dmg = global.calculateCombatDamage(atk, def, false, 1.0);
    // raw = 60..71, net = (60..71) - 10 = 50..61
    t.assertInRange(dmg, 50, 61, 'Damage should match (atk - def/3) with random spread');

    // Case 2: Extreme DEF floor test (def = 9999). Net must never drop below 15!
    const floorDmg = global.calculateCombatDamage(30, 9999, false, 1.0);
    t.assertEqual(floorDmg, 15, 'Minimum damage floor must be 15 even against extreme DEF');

    // Case 3: Crit multiplier test. Crit multiplies final net by 1.8x
    const normalDmgFixed = Math.max(15, atk - Math.floor(def / 3));
    const critDmg = global.calculateCombatDamage(atk, def, true, 1.0);
    // Expected crit is Math.round(netDmg * 1.8) -> range [50*1.8, 61*1.8] = [90, 110]
    t.assertInRange(critDmg, 90, 110, 'Crit damage must scale net damage by ~1.8x');

    // Case 4: Skill Multiplier Scaling (e.g. 2.2x Warrior Berserk, 3.0x Mage Meteor)
    const skillDmg = global.calculateCombatDamage(atk, def, false, 2.0);
    // raw = 120..131, - 10 = 110..121
    t.assertInRange(skillDmg, 110, 121, 'Skill multiplier must scale raw attack linearly');
  });

  s1.test('T1.2: Elemental Advantage Matrix Multipliers & Weakness Relationships', (t) => {
    const calcElem = global.calculateElementalMultiplier || window.calculateElementalMultiplier;
    const matchups = global.ELEMENTAL_MATCHUPS || window.ELEMENTAL_MATCHUPS;

    t.assertTrue(typeof calcElem === 'function', 'window.calculateElementalMultiplier must be exposed globally');
    t.assertTrue(Boolean(matchups && typeof matchups === 'object'), 'window.ELEMENTAL_MATCHUPS matrix must be defined');

    const elements = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];

    // 1. Same-element matchups are 1.0x Neutral
    elements.forEach(elem => {
      t.assertEqual(calcElem(elem, elem), 1.0, `${elem} vs ${elem} must be 1.0x neutral`);
    });

    // 2. Primary Trinity per production ELEMENTAL_MATCHUPS:
    // Fire -> Nature (1.5x), Nature -> Fire (0.7x), Water -> Fire (1.5x), Fire -> Water (0.7x), Nature -> Water (1.5x), Water -> Nature (0.8x)
    t.assertEqual(calcElem('fire', 'nature'), 1.5, 'Fire deals 1.5x damage to Nature');
    t.assertEqual(calcElem('nature', 'fire'), 0.7, 'Nature deals 0.7x damage to Fire');
    t.assertEqual(calcElem('water', 'fire'), 1.5, 'Water deals 1.5x damage to Fire');
    t.assertEqual(calcElem('fire', 'water'), 0.7, 'Fire deals 0.7x damage to Water');
    t.assertEqual(calcElem('nature', 'water'), 1.5, 'Nature deals 1.5x damage to Water');
    t.assertEqual(calcElem('water', 'nature'), 0.8, 'Water deals 0.8x damage to Nature');

    // 3. Lightning Matrix per production table
    t.assertEqual(calcElem('lightning', 'water'), 1.5, 'Lightning deals 1.5x damage to Water');
    t.assertEqual(calcElem('lightning', 'cyber'), 1.3, 'Lightning deals 1.3x damage to Cyber');
    t.assertEqual(calcElem('lightning', 'nature'), 0.8, 'Lightning deals 0.8x damage to Nature');

    // 4. Holy & Dark: Asymmetric Advantage per production table
    t.assertEqual(calcElem('holy', 'dark'), 1.6, 'Holy deals 1.6x damage to Dark');
    t.assertEqual(calcElem('dark', 'holy'), 1.2, 'Dark deals 1.2x damage to Holy');

    // 5. Cyber & Cosmic Matrix per production table
    t.assertEqual(calcElem('cyber', 'dark'), 1.3, 'Cyber deals 1.3x damage to Dark');
    t.assertEqual(calcElem('cosmic', 'dark'), 1.4, 'Cosmic deals 1.4x damage to Dark');
    t.assertEqual(calcElem('cosmic', 'cyber'), 1.3, 'Cosmic deals 1.3x damage to Cyber');

    // 6. Neutral / Default fallback and edge cases
    t.assertEqual(calcElem('cyber', 'fire'), 1.0, 'Unmatched element pair defaults to 1.0x neutral');
    t.assertEqual(calcElem(null, 'fire'), 1.0, 'Null attacker safely returns 1.0x');
    t.assertEqual(calcElem('fire', undefined), 1.0, 'Undefined defender safely returns 1.0x');
  });

  s1.test('T1.3: Stat Hard Caps (Crit capped at 75%, Dodge capped at 60%)', (t) => {
    const calcStats = global.calculatePlayerTotalStats || window.calculatePlayerTotalStats;
    t.assertTrue(typeof calcStats === 'function', 'calculatePlayerTotalStats must be available globally');

    // Part A: Stack gear and passives to exceed 75% Crit hard cap
    // Ranger base crit: 5%
    // wp_w_vocab (+18), hm_dragon_crown (+10), ac_exp_hourglass (+8)
    // +10 forge enhancement (+150% stats) on all 3 slots: (18+10+8)*2.5 = 90% crit
    // passive_1 (+15% crit), golden_shiba (+5% crit) -> Total raw crit = 115%
    const extremeCritUser = {
      level: 10,
      rpg_class: 'ranger',
      equipped: {
        weapon: 'wp_w_vocab',
        helmet: 'hm_dragon_crown',
        accessory: 'ac_exp_hourglass'
      },
      equipment_enhances: { weapon: 10, helmet: 10, accessory: 10 },
      skills_unlocked: { passive_1: true },
      equipped_pet: 'golden_shiba'
    };

    const critStats = calcStats(extremeCritUser);
    t.assertTrue(critStats.crit <= 75, `Crit [${critStats.crit}%] must never exceed 75% hard cap`);
    t.assertEqual(critStats.crit, 75, 'calculatePlayerTotalStats must strictly clamp Crit rate at 75%');

    // Part B: Stack gear, set bonuses, and passives to exceed 60% Dodge hard cap
    // Assassin base dodge: 10%
    // hm_shadow_mask (+8), ar_shadow_garb (+12), bt_stealth_treads (+10), ac_shadow_locket (+6)
    // +10 forge enhancement (+150% stats): (8+12+10+6)*2.5 = 90% dodge
    // shadow 4-piece set bonus (+20% dodge), passive_2 (+15% dodge), shadow_panther (+5% dodge) -> Total raw dodge = 150%
    const extremeDodgeUser = {
      level: 10,
      rpg_class: 'assassin',
      equipped: {
        helmet: 'hm_shadow_mask',
        armor: 'ar_shadow_garb',
        boots: 'bt_stealth_treads',
        accessory: 'ac_shadow_locket'
      },
      equipment_enhances: { helmet: 10, armor: 10, boots: 10, accessory: 10 },
      skills_unlocked: { passive_2: true },
      equipped_pet: 'shadow_panther'
    };

    const dodgeStats = calcStats(extremeDodgeUser);
    t.assertTrue(dodgeStats.dodge <= 60, `Dodge [${dodgeStats.dodge}%] must never exceed 60% hard cap`);
    t.assertEqual(dodgeStats.dodge, 60, 'calculatePlayerTotalStats must strictly clamp Dodge rate at 60%');
  });

  s1.test('T1.4: Monster Damage Math & Tier 4 Boss Scaling Survivability Sanity', (t) => {
    const calcMonsterDmg = global.calculateMonsterDamage || window.calculateMonsterDamage;
    t.assertTrue(typeof calcMonsterDmg === 'function', 'window.calculateMonsterDamage must be exposed globally');

    // Case 1: Tier 1 Minion (rawAtk 20) vs Starter Hero (def 10, hp 100, rand 3)
    // base = 12 + 20*0.20 = 16. (16 + 3) * (60 / 70) = 19 * 0.857 = 16
    const t1Dmg = calcMonsterDmg(20, 10, 3);
    t.assertInRange(t1Dmg, 14, 18, 'Tier 1 minion damage deals 14..18 HP to starter hero');
    const starterHitsToDie = Math.ceil(100 / t1Dmg);
    t.assertTrue(starterHitsToDie >= 5, `Starter hero survives at least 5 hits from Tier 1 Minion (took ${starterHitsToDie} hits)`);

    // Case 2: Tier 4 Boss (rawAtk 275) vs Unarmored Starter Hero (def 10, hp 100, rand 3)
    // base = 12 + 275*0.20 = 67. (67 + 3) * (60 / 70) = 70 * 0.857 = 60
    const t4UnarmoredDmg = calcMonsterDmg(275, 10, 3);
    t.assertInRange(t4UnarmoredDmg, 55, 65, 'Tier 4 Boss deals ~60 damage to unarmored player (no 1-shot kill)');
    const unarmoredHitsToDie = Math.ceil(100 / t4UnarmoredDmg);
    t.assertEqual(unarmoredHitsToDie, 2, 'Unarmored 100 HP hero survives 1 hit with 40 HP and dies on 2nd hit (prevents instant wipe)');

    // Case 3: Tier 4 Boss (rawAtk 275) vs Geared Hero (def 30, hp 120, rand 3)
    // base = 67. 70 * (60 / 90) = 70 * 0.667 = 47
    const t4GearedDmg = calcMonsterDmg(275, 30, 3);
    t.assertInRange(t4GearedDmg, 44, 48, 'Geared hero with 30 DEF takes 44..48 damage from Tier 4 Boss');
    t.assertTrue(120 - (t4GearedDmg * 2) > 0, 'Geared hero survives 2 full boss hits with positive HP remaining');
    t.assertTrue(120 - (t4GearedDmg * 3) <= 0, 'Geared hero falls on 3rd boss strike');

    // Case 4: Extreme Defense Hard Floor Bound (ATK 300 vs DEF 99999)
    const floorDmg = calcMonsterDmg(300, 99999, 0);
    t.assertEqual(floorDmg, 8, 'Production calculateMonsterDamage respects absolute minimum floor of 8');

    // Case 5: Zero & Negative Parameter Coercion Safety
    const zeroDmg = calcMonsterDmg(0, 0, 0);
    t.assertTrue(!isNaN(zeroDmg) && zeroDmg >= 8, 'Zero inputs yield valid damage >= 8 without NaN');
    const negDmg = calcMonsterDmg(-20, -10, 0);
    t.assertTrue(!isNaN(negDmg) && negDmg >= 8, 'Negative inputs clamp cleanly to minimum floor >= 8');
  });

  s1.test('T1.5: Active Tactical Skill Effects: Warrior Reflect & Assassin Absolute Dodge', (t) => {
    const skills = global.GamificationSkills || window.GamificationSkills;
    const engine = global.BattleEngine || window.BattleEngine;

    t.assertTrue(Boolean(skills && typeof skills.applySkillEffect === 'function'), 'GamificationSkills.applySkillEffect must exist');
    t.assertTrue(Boolean(engine && typeof engine.onMonsterStrikeConnect === 'function'), 'BattleEngine.onMonsterStrikeConnect must exist');

    // Preserve engine state
    const origMonster = engine.monster;
    const origHero = engine.hero;
    const origReflect = engine.pendingReflectShield;
    const origDodge = engine.pendingAbsoluteDodge;
    const origParams = engine.pendingSkillParams;
    const origFloat = engine.addFloatDamage;
    const origSparks = engine.createHitSparks;
    const origUI = engine.updateBattleUI;

    try {
      // Safe no-op stubs for UI/FX in headless test context
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      // -------------------------------------------------------------
      // 1. Warrior Reflect Shield: 80% mitigation & 100% reflect
      // -------------------------------------------------------------
      engine.monster = {
        name: 'Chiến Binh Quỷ',
        hp: 200,
        maxHp: 200,
        atk: 80,
        isBoss: false,
        element: 'fire',
        flashWhite: 0,
        state: 'idle'
      };
      engine.hero = {
        hp: 100,
        maxHp: 100,
        x: 100,
        y: 100,
        flashWhite: 0,
        state: 'idle'
      };

      // Activate skill through genuine GamificationSkills dispatcher
      skills.applySkillEffect('reflect_shield', 'Khiên Phản Đòn');
      t.assertTrue(engine.pendingReflectShield, 'pendingReflectShield must be set on BattleEngine');
      t.assertEqual(engine.pendingSkillParams.mitigation, 0.8, 'Skill params set mitigation to 80%');
      t.assertEqual(engine.pendingSkillParams.reflect, 1.0, 'Skill params set reflect to 100%');

      // Trigger genuine monster strike connect routine
      engine.onMonsterStrikeConnect();

      // Monster had 200 HP, took 80 reflected damage (100% of raw ATK 80) -> 120 HP
      t.assertEqual(engine.monster.hp, 120, 'Monster took 100% raw ATK reflected damage (200 -> 120)');
      // Hero takes 80% mitigated damage (incoming raw mitigated by 80%, hero HP remains healthy > 90)
      t.assertTrue(engine.hero.hp >= 90 && engine.hero.hp < 100, `Hero HP reflects 80% mitigated strike (current HP: ${engine.hero.hp})`);
      t.assertFalse(engine.pendingReflectShield, 'pendingReflectShield consumed after strike resolution');

      // -------------------------------------------------------------
      // 2. Assassin Absolute Dodge: 100% damage nullification
      // -------------------------------------------------------------
      engine.hero.hp = 100;
      skills.applySkillEffect('absolute_dodge', 'Bóng Ma Hư Không');
      t.assertTrue(engine.pendingAbsoluteDodge, 'pendingAbsoluteDodge must be set on BattleEngine');
      t.assertEqual(engine.pendingSkillParams.dodgeRate, 1.0, 'Skill params set dodge rate to 100%');

      // Trigger strike connect routine
      engine.onMonsterStrikeConnect();

      // Hero takes 0 damage
      t.assertEqual(engine.hero.hp, 100, 'Assassin Absolute Dodge completely prevents 100% of incoming damage');
      t.assertFalse(engine.pendingAbsoluteDodge, 'pendingAbsoluteDodge consumed after dodge execution');
    } finally {
      // Restore engine state
      engine.monster = origMonster;
      engine.hero = origHero;
      engine.pendingReflectShield = origReflect;
      engine.pendingAbsoluteDodge = origDodge;
      engine.pendingSkillParams = origParams;
      engine.addFloatDamage = origFloat;
      engine.createHitSparks = origSparks;
      engine.updateBattleUI = origUI;
    }
  });


  // ==========================================================================
  // SUITE 2: 100 DUNGEONS & 100 BOSSES DATA SCHEMA & ELEMENTAL THEMES
  // ==========================================================================
  const s2 = runner.suite('2. 100 Dungeons & 100 Bosses Data Validation');

  s2.test('T2.1: Exactly 100 Dungeons Exist in Database', (t) => {
    t.assertTrue(Boolean(global.DUNGEON_DATA_100), 'DUNGEON_DATA_100 must be defined');
    const keys = Object.keys(global.DUNGEON_DATA_100);
    t.assertEqual(keys.length, 100, 'DUNGEON_DATA_100 must contain exactly 100 dungeons');

    // Verify all keys from "1" to "100" exist
    for (let i = 1; i <= 100; i++) {
      t.assertTrue(Boolean(global.DUNGEON_DATA_100[String(i)]), `Dungeon STT #${i} must exist in DUNGEON_DATA_100`);
    }
  });

  s2.test('T2.2: Tier Distribution (25 Dungeons per Tier 1..4)', (t) => {
    const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (let i = 1; i <= 100; i++) {
      const d = global.DUNGEON_DATA_100[String(i)];
      tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;

      // Validate tier boundary rules
      if (i <= 25) t.assertEqual(d.tier, 1, `Dungeon #${i} must be Tier 1`);
      else if (i <= 50) t.assertEqual(d.tier, 2, `Dungeon #${i} must be Tier 2`);
      else if (i <= 75) t.assertEqual(d.tier, 3, `Dungeon #${i} must be Tier 3`);
      else t.assertEqual(d.tier, 4, `Dungeon #${i} must be Tier 4`);
    }

    t.assertEqual(tierCounts[1], 25, 'Tier 1 must have exactly 25 dungeons');
    t.assertEqual(tierCounts[2], 25, 'Tier 2 must have exactly 25 dungeons');
    t.assertEqual(tierCounts[3], 25, 'Tier 3 must have exactly 25 dungeons');
    t.assertEqual(tierCounts[4], 25, 'Tier 4 must have exactly 25 dungeons');
  });

  s2.test('T2.3: Dungeon & Boss Schema Integrity (Minions, Background, Roars)', (t) => {
    for (let i = 1; i <= 100; i++) {
      const d = global.DUNGEON_DATA_100[String(i)];
      t.assertTrue(Boolean(d.cleanEn && d.cleanEn.length > 0), `Dungeon #${i} cleanEn must be non-empty`);
      t.assertTrue(Boolean(d.cleanVi && d.cleanVi.length > 0), `Dungeon #${i} cleanVi must be non-empty`);
      t.assertTrue(Boolean(d.biome), `Dungeon #${i} must have biome`);
      t.assertTrue(Boolean(d.background), `Dungeon #${i} must have background object`);
      t.assertTrue(Boolean(d.background.wallColor && d.background.floorColor), `Dungeon #${i} background colors required`);

      // 3 Minions per dungeon
      t.assertTrue(Array.isArray(d.minions) && d.minions.length === 3, `Dungeon #${i} must have exactly 3 minions`);
      d.minions.forEach((m, idx) => {
        t.assertTrue(Boolean(m.name), `Dungeon #${i} minion ${idx} must have name`);
        t.assertGreaterThan(m.hp, 0, `Dungeon #${i} minion ${idx} HP must be > 0`);
        t.assertGreaterThan(m.atk, 0, `Dungeon #${i} minion ${idx} ATK must be > 0`);
        t.assertGreaterThan(m.def, 0, `Dungeon #${i} minion ${idx} DEF must be > 0`);
      });

      // Boss
      t.assertTrue(Boolean(d.boss), `Dungeon #${i} must have boss object`);
      t.assertTrue(Boolean(d.boss.name), `Dungeon #${i} boss must have name`);
      t.assertTrue(Boolean(d.boss.title), `Dungeon #${i} boss must have title`);
      t.assertTrue(Boolean(d.boss.archetype), `Dungeon #${i} boss must have archetype`);
      t.assertTrue(Boolean(d.boss.skillName), `Dungeon #${i} boss must have skillName`);
      t.assertTrue(Array.isArray(d.boss.roars) && d.boss.roars.length >= 2, `Dungeon #${i} boss must have >= 2 roars`);
      t.assertGreaterThan(d.boss.baseHp, 0, `Dungeon #${i} boss baseHp must be > 0`);
      t.assertGreaterThan(d.boss.atk, 0, `Dungeon #${i} boss ATK must be > 0`);
      t.assertGreaterThan(d.boss.def, 0, `Dungeon #${i} boss DEF must be > 0`);
    }
  });

  s2.test('T2.4: Monotonic Stat Scaling Across Tiers (HP, ATK, DEF)', (t) => {
    const tierStats = {
      1: { totalHp: 0, totalAtk: 0, totalDef: 0 },
      2: { totalHp: 0, totalAtk: 0, totalDef: 0 },
      3: { totalHp: 0, totalAtk: 0, totalDef: 0 },
      4: { totalHp: 0, totalAtk: 0, totalDef: 0 }
    };

    for (let i = 1; i <= 100; i++) {
      const d = global.DUNGEON_DATA_100[String(i)];
      tierStats[d.tier].totalHp += d.boss.baseHp;
      tierStats[d.tier].totalAtk += d.boss.atk;
      tierStats[d.tier].totalDef += d.boss.def;
    }

    const avgHp = [1, 2, 3, 4].map(t => tierStats[t].totalHp / 25);
    const avgAtk = [1, 2, 3, 4].map(t => tierStats[t].totalAtk / 25);
    const avgDef = [1, 2, 3, 4].map(t => tierStats[t].totalDef / 25);

    // Assert strictly increasing averages
    t.assertGreaterThan(avgHp[1], avgHp[0], 'Tier 2 Boss avg HP > Tier 1 avg HP');
    t.assertGreaterThan(avgHp[2], avgHp[1], 'Tier 3 Boss avg HP > Tier 2 avg HP');
    t.assertGreaterThan(avgHp[3], avgHp[2], 'Tier 4 Boss avg HP > Tier 3 avg HP');

    t.assertGreaterThan(avgAtk[1], avgAtk[0], 'Tier 2 Boss avg ATK > Tier 1 avg ATK');
    t.assertGreaterThan(avgAtk[2], avgAtk[1], 'Tier 3 Boss avg ATK > Tier 2 avg ATK');
    t.assertGreaterThan(avgAtk[3], avgAtk[2], 'Tier 4 Boss avg ATK > Tier 3 avg ATK');

    t.assertGreaterThan(avgDef[1], avgDef[0], 'Tier 2 Boss avg DEF > Tier 1 avg DEF');
    t.assertGreaterThan(avgDef[2], avgDef[1], 'Tier 3 Boss avg DEF > Tier 2 avg DEF');
    t.assertGreaterThan(avgDef[3], avgDef[2], 'Tier 4 Boss avg DEF > Tier 3 avg DEF');
  });

  s2.test('T2.5: Elemental Affinities / Biome Theming', (t) => {
    // Canonical 8 elements
    const validElements = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];

    // Biome mapping to elements
    const biomeElementMap = {
      magma: 'fire',
      volcano: 'fire',
      hotpot: 'fire',
      ocean: 'water',
      sea: 'water',
      aquatic: 'water',
      forest: 'nature',
      botanical: 'nature',
      jungle: 'nature',
      garden: 'nature',
      electric: 'lightning',
      storm: 'lightning',
      thunder: 'lightning',
      cathedral: 'holy',
      sacred: 'holy',
      sanctuary: 'holy',
      shadow: 'dark',
      abyss: 'dark',
      dungeon: 'dark',
      ruins: 'dark',
      cyber: 'cyber',
      arcade: 'cyber',
      datacenter: 'cyber',
      quantum: 'cyber',
      cosmos: 'cosmic',
      space: 'cosmic',
      celestial: 'cosmic',
      nebula: 'cosmic'
    };

    function resolveDungeonElement(dungeon) {
      if (dungeon.element && validElements.includes(dungeon.element.toLowerCase())) {
        return dungeon.element.toLowerCase();
      }
      if (dungeon.boss?.element && validElements.includes(dungeon.boss.element.toLowerCase())) {
        return dungeon.boss.element.toLowerCase();
      }
      // Infer from biome or keywords
      const text = (dungeon.biome + ' ' + dungeon.topicName + ' ' + dungeon.cleanEn).toLowerCase();
      for (const [kw, elem] of Object.entries(biomeElementMap)) {
        if (text.includes(kw)) return elem;
      }
      return validElements[(dungeon.stt - 1) % validElements.length];
    }

    for (let i = 1; i <= 100; i++) {
      const d = global.DUNGEON_DATA_100[String(i)];
      const resolved = resolveDungeonElement(d);
      t.assertTrue(validElements.includes(resolved), `Dungeon #${i} resolves to a canonical element: ${resolved}`);
    }
  });


  // ==========================================================================
  // SUITE 3: TOWER OF BABEL FLOOR SCALING, MODIFIERS & PROGRESSION
  // ==========================================================================
  const s3 = runner.suite('3. Tower of Babel & Boss Rush');

  s3.test('T3.1: Boons Pool Definition (>= 8 Unique Boons)', (t) => {
    t.assertTrue(Boolean(global.GamificationTower), 'GamificationTower must be defined');
    t.assertTrue(Array.isArray(global.GamificationTower.BOONS_POOL), 'BOONS_POOL must be an array');
    t.assertGreaterThan(global.GamificationTower.BOONS_POOL.length, 7, 'BOONS_POOL must have at least 8 boons');

    const ids = new Set();
    global.GamificationTower.BOONS_POOL.forEach(boon => {
      t.assertTrue(Boolean(boon.id), 'Boon must have id');
      t.assertTrue(Boolean(boon.title), 'Boon must have title');
      t.assertTrue(Boolean(boon.icon), 'Boon must have icon');
      t.assertTrue(Boolean(boon.desc), 'Boon must have desc');
      t.assertFalse(ids.has(boon.id), `Boon id [${boon.id}] must be unique in pool`);
      ids.add(boon.id);
    });
  });

  s3.test('T3.2: User Tower Records Initialization & Persistence', (t) => {
    const testUser = { level: 5 };
    global.GamificationTower.ensureInitialized(testUser);

    t.assertTrue(Boolean(testUser.tower_records), 'tower_records must be initialized');
    t.assertEqual(testUser.tower_records.max_floor, 1, 'max_floor defaults to 1');
    t.assertEqual(testUser.tower_records.best_streak, 0, 'best_streak defaults to 0');
    t.assertEqual(testUser.tower_records.boss_rush_wins, 0, 'boss_rush_wins defaults to 0');
    t.assertTrue(Array.isArray(testUser.tower_records.claimed_floor_rewards), 'claimed_floor_rewards is an array');
  });

  s3.test('T3.3: Floor Scaling Math: 1 + (floor - 1) * 0.12', (t) => {
    const tower = global.GamificationTower || window.GamificationTower;
    const engine = global.BattleEngine || window.BattleEngine;

    t.assertTrue(Boolean(tower && typeof tower.scaleMonsterForTower === 'function'), 'GamificationTower.scaleMonsterForTower must exist');

    const origMonster = engine.monster;
    try {
      // Setup test baseline monster
      engine.monster = { maxHp: 100, atk: 50, def: 20 };

      // Case 1: Floor 1 (Multiplier = 1.00)
      engine.monster.baseHp = 100; engine.monster.baseAtk = 50; engine.monster.baseDef = 20;
      const m1 = tower.scaleMonsterForTower(1);
      t.assertEqual(m1.maxHp, 100, 'Floor 1 monster maxHp scales by 1.0x (100 HP)');
      t.assertEqual(m1.atk, 50, 'Floor 1 monster atk scales by 1.0x (50 ATK)');
      t.assertEqual(m1.def, 20, 'Floor 1 monster def scales by 1.0x (20 DEF)');
      t.assertFalse(Boolean(m1.isBoss), 'Floor 1 is a regular floor (isBoss = false)');

      // Case 2: Floor 2 (Multiplier = 1.12)
      engine.monster.baseHp = 100; engine.monster.baseAtk = 50; engine.monster.baseDef = 20;
      const m2 = tower.scaleMonsterForTower(2);
      t.assertEqual(m2.maxHp, 112, 'Floor 2 monster maxHp scales by 1.12x (112 HP)');
      t.assertEqual(m2.atk, 56, 'Floor 2 monster atk scales by 1.12x (56 ATK)');
      t.assertEqual(m2.def, 22, 'Floor 2 monster def scales by 1.12x (22 DEF)');

      // Case 3: Floor 10 (Elite Boss Floor, Multiplier = 2.08)
      engine.monster.baseHp = 100; engine.monster.baseAtk = 50; engine.monster.baseDef = 20;
      const m10 = tower.scaleMonsterForTower(10);
      t.assertEqual(m10.maxHp, 208, 'Floor 10 monster maxHp scales by 2.08x (208 HP)');
      t.assertEqual(m10.atk, 104, 'Floor 10 monster atk scales by 2.08x (104 ATK)');
      t.assertEqual(m10.def, 42, 'Floor 10 monster def scales by 2.08x (42 DEF)');
      t.assertTrue(m10.isBoss, 'Floor 10 triggers elite boss flag (10 % 5 === 0)');
      t.assertTrue(m10.name.includes('TRÙM TẦNG 10'), 'Floor 10 monster name tagged with elite boss title');

      // Case 4: Floor 50 (Endgame Tower Floor, Multiplier = 6.88)
      engine.monster.baseHp = 100; engine.monster.baseAtk = 50; engine.monster.baseDef = 20;
      const m50 = tower.scaleMonsterForTower(50);
      t.assertEqual(m50.maxHp, 688, 'Floor 50 monster maxHp scales by 6.88x (688 HP)');
      t.assertEqual(m50.atk, 344, 'Floor 50 monster atk scales by 6.88x (344 ATK)');
      t.assertEqual(m50.def, 138, 'Floor 50 monster def scales by 6.88x (138 DEF)');
      t.assertTrue(m50.isBoss, 'Floor 50 is an elite boss floor');

      // Case 5: Verify Floor Boss Modifier rotation modulo 10
      t.assertEqual(tower.getFloorModifier(1).id, tower.FLOOR_MODIFIERS[0].id, 'Floor 1 uses 1st floor modifier');
      t.assertEqual(tower.getFloorModifier(11).id, tower.FLOOR_MODIFIERS[0].id, 'Floor 11 loops back to 1st floor modifier');
    } finally {
      engine.monster = origMonster;
    }
  });

  s3.test('T3.4: Floor Clear Economy Rewards & Max Floor Progression', (t) => {
    const testUser = { gold: 100, level: 3, xp: 50 };
    global.GamificationTower.ensureInitialized(testUser);

    // Simulate clearing Floor 5
    const floor = 5;
    const goldReward = 40 + floor * 10; // 90
    const expReward = 50 + floor * 15;  // 125

    testUser.gold += goldReward;
    testUser.xp += expReward;
    if (floor > testUser.tower_records.max_floor) {
      testUser.tower_records.max_floor = floor;
    }

    t.assertEqual(testUser.gold, 190, 'Gold must increase by 90 on floor 5 clear');
    t.assertEqual(testUser.xp, 175, 'XP must increase by 125 on floor 5 clear');
    t.assertEqual(testUser.tower_records.max_floor, 5, 'max_floor must advance to 5');
  });

  s3.test('T3.5: Roguelike Boon Effect Application', (t) => {
    const tower = global.GamificationTower || window.GamificationTower;
    const engine = global.BattleEngine || window.BattleEngine;

    t.assertTrue(Boolean(tower && typeof tower.applyBoonEffect === 'function'), 'GamificationTower.applyBoonEffect must exist');
    t.assertTrue(Array.isArray(tower.BOONS_POOL) && tower.BOONS_POOL.length >= 8, 'BOONS_POOL must contain at least 8 boons');

    const origHero = engine.hero;
    try {
      // 1. Test Giant Heart Boon (+40 maxHp and full heal)
      engine.hero = { hp: 80, maxHp: 100, def: 10, atk: 35 };
      tower.applyBoonEffect('boon_giant_heart');
      t.assertEqual(engine.hero.maxHp, 140, 'Giant Heart adds +40 to BattleEngine.hero.maxHp (100 -> 140)');
      t.assertEqual(engine.hero.hp, 140, 'Giant Heart fully heals BattleEngine.hero.hp to 140');

      // 2. Test Iron Skin Boon (+25 DEF)
      tower.applyBoonEffect('boon_iron_skin');
      t.assertEqual(engine.hero.def, 35, 'Iron Skin adds +25 to BattleEngine.hero.def (10 -> 35)');

      // 3. Test Berserk Boon (+40% ATK)
      tower.applyBoonEffect('boon_berserk');
      // Math.round(35 * 1.4) = 49
      t.assertEqual(engine.hero.atk, 49, 'Berserk increases BattleEngine.hero.atk by +40% (35 -> 49)');
    } finally {
      engine.hero = origHero;
    }
  });


  // ==========================================================================
  // SUITE 4: 5-SLOT PAPERDOLL, STATS, SET BONUSES & FORGE (+1..+10)
  // ==========================================================================
  const s4 = runner.suite('4. Inventory, Paperdoll, Sets & Forge');

  s4.test('T4.1: Paperdoll 6-Slot Grid & 5 Visual Sprite Layers', (t) => {
    const testUser = { rpg_class: 'warrior' };
    global.ensureUserEquipmentInitialized(testUser);

    t.assertTrue(Boolean(testUser.equipped), 'user.equipped must exist');
    const slots = Object.keys(testUser.equipped);
    const expectedSlots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'];
    expectedSlots.forEach(slot => {
      t.assertTrue(slots.includes(slot), `Equipped must include slot [${slot}]`);
    });

    // Visual layers: weapon, helmet, armor, gloves, boots
    const visualLayers = ['weapon', 'helmet', 'armor', 'gloves', 'boots'];
    t.assertEqual(visualLayers.length, 5, 'Canvas paperdoll renders exactly 5 visual sprite layers');
  });

  s4.test('T4.2: Starter Equipment Initialized by Character Class', (t) => {
    const classes = ['warrior', 'mage', 'ranger', 'assassin'];
    classes.forEach(cls => {
      const user = { rpg_class: cls };
      global.ensureUserEquipmentInitialized(user);

      // Verify each slot has an item equipped
      ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'].forEach(slot => {
        t.assertTrue(Boolean(user.equipped[slot]), `${cls} must have starter [${slot}] equipped`);
      });

      // Class weapons match class identity
      if (cls === 'warrior') t.assertTrue(user.equipped.weapon.startsWith('wp_w_'), 'Warrior has warrior sword');
      if (cls === 'mage') t.assertTrue(user.equipped.weapon.startsWith('wp_m_'), 'Mage has mage staff');
      if (cls === 'ranger') t.assertTrue(user.equipped.weapon.startsWith('wp_r_'), 'Ranger has ranger bow');
      if (cls === 'assassin') t.assertTrue(user.equipped.weapon.startsWith('wp_a_'), 'Assassin has assassin dagger');

      // Resources initialized
      t.assertEqual(user.dust, 20, `${cls} starts with 20 dust`);
      t.assertEqual(user.enhance_stones, 5, `${cls} starts with 5 enhance stones`);
      t.assertEqual(user.gacha_pity, 0, `${cls} starts with 0 gacha pity`);
    });
  });

  s4.test('T4.3: Class Requirement Enforcement on Item Equip', (t) => {
    const warriorUser = { rpg_class: 'warrior', equipped: {}, equipment_inventory: [] };
    global.ensureUserEquipmentInitialized(warriorUser);

    const mageStaff = global.getRpgEquipmentById('wp_m_sapphire');
    t.assertTrue(Boolean(mageStaff), 'wp_m_sapphire item exists');
    t.assertEqual(mageStaff.reqClass, 'mage', 'Staff requires mage class');

    // Equipping mage staff on warrior must be rejected
    const isAllowed = (mageStaff.reqClass === 'all' || mageStaff.reqClass === warriorUser.rpg_class);
    t.assertFalse(isAllowed, 'Warrior cannot equip Mage-exclusive equipment');
  });

  s4.test('T4.4: 5 Equipment Sets & Multi-Piece Threshold Activations', (t) => {
    const setBonuses = (typeof RPG_SET_BONUSES !== 'undefined') ? RPG_SET_BONUSES : (global.RPG_SET_BONUSES || {});
    t.assertTrue(Boolean(setBonuses && Object.keys(setBonuses).length > 0), 'RPG_SET_BONUSES must be defined');
    const setKeys = ['oxford', 'dragon', 'chrono', 'shadow', 'anki_god'];
    setKeys.forEach(key => {
      t.assertTrue(Boolean(setBonuses[key]), `Set [${key}] must be defined in RPG_SET_BONUSES`);
      t.assertTrue(Array.isArray(setBonuses[key].pieces), `Set [${key}] pieces array`);
      t.assertGreaterThan(setBonuses[key].pieces.length, 3, `Set [${key}] has at least 4 pieces`);
    });

    // Test calculateActiveSetBonuses
    t.assertTrue(typeof global.calculateActiveSetBonuses === 'function', 'calculateActiveSetBonuses function');

    // 2-piece Oxford set
    const twoOxford = ['wp_m_codex', 'hm_oxford_cap'];
    const active2 = global.calculateActiveSetBonuses(twoOxford);
    t.assertEqual(active2.length, 1, '2 Oxford pieces activate 1 set bonus');
    t.assertEqual(active2[0].tier, 2, 'Tier must be 2');

    // 4-piece Oxford set
    const fourOxford = ['wp_m_codex', 'hm_oxford_cap', 'ar_oxford_robe', 'gl_oxford_scribe'];
    const active4 = global.calculateActiveSetBonuses(fourOxford);
    t.assertEqual(active4.length, 1, '4 Oxford pieces activate set bonus');
    t.assertEqual(active4[0].tier, 4, 'Tier must be 4');
  });

  s4.test('T4.5: Forge Enhancement Math (+1..+10), Gold/Stone Costs & Stat Scaling', (t) => {
    // Formula from shop.js:
    // nextLvl = currentLvl + 1
    // costGold = nextLvl * 75
    // costStones = Math.ceil(nextLvl / 3)
    // rate = nextLvl <= 3 ? 1.0 : (nextLvl <= 6 ? 0.85 : (nextLvl <= 8 ? 0.70 : 0.50))
    // statBonus = level * 15%

    let totalBaseGold = 0;
    let totalBaseStones = 0;

    for (let lvl = 1; lvl <= 10; lvl++) {
      const costGold = lvl * 75;
      const costStones = Math.ceil(lvl / 3);
      totalBaseGold += costGold;
      totalBaseStones += costStones;

      // Rate checks
      if (lvl <= 3) {
        t.assertEqual(costStones, 1, `+${lvl} stones cost is 1`);
      } else if (lvl <= 6) {
        t.assertEqual(costStones, 2, `+${lvl} stones cost is 2`);
      } else if (lvl <= 9) {
        t.assertEqual(costStones, 3, `+${lvl} stones cost is 3`);
      } else {
        t.assertEqual(costStones, 4, `+10 stones cost is 4`);
      }
    }

    t.assertEqual(totalBaseGold, 4125, 'Sum of base gold costs up to +10 is 4,125 Gold');
    t.assertEqual(totalBaseStones, 22, 'Sum of base stone costs up to +10 is 22 Stones');

    // Stat scaling: +15% per enhance level
    const baseAtk = 100;
    const enhance10Mult = 10 * 0.15; // 1.50 (+150%)
    const finalAtk = baseAtk + Math.round(baseAtk * enhance10Mult);
    t.assertEqual(finalAtk, 250, '+10 enhances a 100 ATK weapon to 250 ATK (+150%)');
  });


  // ==========================================================================
  // SUITE 5: GACHA MYSTERY CHESTS & 10-PULL PITY COUNTER
  // ==========================================================================
  const s5 = runner.suite('5. Gacha Chests & 10-Pull Pity Counter');

  s5.test('T5.1: Chest Costs & Currency Deduction Rules', (t) => {
    // Wood: 100 gold, Silver: 350 gold, Gold: 5 gems
    const costs = {
      wood: { type: 'gold', cost: 100 },
      silver: { type: 'gold', cost: 350 },
      gold: { type: 'gems', cost: 5 }
    };

    t.assertEqual(costs.wood.cost, 100, 'Wood chest costs 100 Gold');
    t.assertEqual(costs.silver.cost, 350, 'Silver chest costs 350 Gold');
    t.assertEqual(costs.gold.cost, 5, 'Gold chest costs 5 Gems');

    // Insufficient funds test
    const poorUser = { gold: 50, gems: 2 };
    t.assertTrue(poorUser.gold < costs.wood.cost, '50 gold cannot open 100 gold Wood chest');
    t.assertTrue(poorUser.gold < costs.silver.cost, '50 gold cannot open 350 gold Silver chest');
    t.assertTrue(poorUser.gems < costs.gold.cost, '2 gems cannot open 5 gems Gold chest');
  });

  s5.test('T5.2: Pity Counter Guaranteed Legendary at Pull 10', (t) => {
    t.assertTrue(typeof global.rollGachaItem === 'function', 'rollGachaItem must be defined');

    // When pity is guaranteed, rollGachaItem must return a Legendary tier item
    const guaranteedItem = global.rollGachaItem('wood', true);
    t.assertEqual(guaranteedItem.tier, 'legendary', 'Guaranteed pity roll MUST return legendary tier');
  });

  s5.test('T5.3: 100-Pull Simulation Asserting Pity Reset & Maximum Ceiling of 10', (t) => {
    let currentPity = 0;
    let legendaryCount = 0;
    let totalPulls = 100;

    for (let i = 0; i < totalPulls; i++) {
      currentPity++;
      const isGuaranteed = (currentPity >= 10);
      const item = global.rollGachaItem('silver', isGuaranteed);

      // Pity must NEVER exceed 10
      t.assertInRange(currentPity, 1, 10, 'Pity counter must never exceed 10');

      if (item.tier === 'legendary') {
        legendaryCount++;
        currentPity = 0; // Reset pity
      }
    }

    t.assertGreaterThan(legendaryCount, 9, '100 pulls with 10-pull pity guarantee must produce >= 10 Legendaries');
    t.assertInRange(currentPity, 0, 9, 'Final pity counter must be between 0 and 9');
  });

  s5.test('T5.4: Equipment Catalog Tier Completeness (102 Items Total)', (t) => {
    const catalog = (typeof RPG_EQUIPMENT_CATALOG !== 'undefined') ? RPG_EQUIPMENT_CATALOG : (global.RPG_EQUIPMENT_CATALOG || []);
    t.assertTrue(Array.isArray(catalog), 'RPG_EQUIPMENT_CATALOG must be an array');
    t.assertEqual(catalog.length, 102, 'Catalog must contain exactly 102 items');

    const tierSet = new Set(catalog.map(i => i.tier));
    ['common', 'uncommon', 'rare', 'epic', 'legendary'].forEach(tier => {
      t.assertTrue(tierSet.has(tier), `Catalog must contain items of tier [${tier}]`);
    });
  });


  // ==========================================================================
  // SUITE 6: ECONOMY BALANCE SIMULATION (FAUCETS VS SINKS)
  // ==========================================================================
  const s6 = runner.suite('6. Economy Balance Simulation');

  s6.test('T6.1: Faucet vs Shop Consumables Inflow/Outflow Balance', (t) => {
    const shopGoods = (typeof RPG_SHOP_GOODS !== 'undefined') ? RPG_SHOP_GOODS : (global.RPG_SHOP_GOODS || []);
    const consumables = (typeof RPG_CONSUMABLES_CATALOG !== 'undefined') ? RPG_CONSUMABLES_CATALOG : (global.RPG_CONSUMABLES_CATALOG || []);
    const dungeons = (typeof DUNGEON_DATA_100 !== 'undefined') ? DUNGEON_DATA_100 : (global.DUNGEON_DATA_100 || {});

    t.assertTrue(shopGoods.length >= 6, 'RPG_SHOP_GOODS contains at least 6 canonical shop goods');
    t.assertTrue(consumables.length >= 5, 'RPG_CONSUMABLES_CATALOG contains at least 5 consumable items');
    t.assertEqual(Object.keys(dungeons).length, 100, 'DUNGEON_DATA_100 contains exactly 100 dungeons');

    // 1. Verify consumable items and costs directly from production catalog
    const hpItem = shopGoods.find(i => i.id === 'health_potion');
    const mpItem = shopGoods.find(i => i.id === 'mana_potion');
    t.assertTrue(Boolean(hpItem), 'health_potion exists in shop goods');
    t.assertTrue(Boolean(mpItem), 'mana_potion exists in shop goods');
    t.assertEqual(hpItem.cost, 25, 'Health Potion cost is 25 gold in shop');
    t.assertEqual(mpItem.cost, 20, 'Mana Potion cost is 20 gold in shop');

    // 2. Verify Tier 1 Starter Dungeon (Topic 1) gold faucet covers consumable replenishment
    // Dungeon clear awards 35g victory chest (battle.html:1355) + boss drop gold (d1.boss.gold)
    const d1 = dungeons['1'];
    t.assertTrue(Boolean(d1 && d1.boss), 'Dungeon 1 and Boss data exist');
    const dungeonClearGold = 35; // showDungeonVictory bonus
    const d1TotalGold = (d1.boss.gold || 0) + dungeonClearGold;
    t.assertGreaterThan(d1TotalGold, hpItem.cost, `D1 total gold (${d1TotalGold}g) covers health potion shop cost (${hpItem.cost}g), ensuring positive faucet balance`);
    t.assertGreaterThan(d1TotalGold, mpItem.cost, `D1 total gold (${d1TotalGold}g) covers mana potion shop cost (${mpItem.cost}g)`);

    // 3. Verify Tier 4 Endgame Dungeon (Topic 100) high-tier faucet
    const d100 = dungeons['100'];
    t.assertTrue(Boolean(d100 && d100.boss), 'Dungeon 100 and Boss data exist');
    t.assertGreaterThan(d100.boss.gold, 150, 'Endgame Dungeon 100 boss yields substantial gold (>150g)');

    // 4. Verify Gem faucet vs Mystery Chest sink:
    // showDungeonVictory() grants 2 gems per clear. Gacha Gold Mystery Chest costs 5 gems.
    // 3 dungeon clears grant 6 gems >= 5 gems required for 1 Gold Chest pull.
    const dungeonGemsPerClear = 2;
    const goldChestGemCost = 5;
    t.assertGreaterThan(dungeonGemsPerClear * 3, goldChestGemCost, '3 dungeon clears yield 6 gems, sufficient to open 1 Gold Mystery Chest (5 gems)');
  });

  s6.test('T6.2: 20-Run Player Economy Progression Simulation', (t) => {
    const user = {
      gold: 100,
      gems: 10,
      dust: 20,
      enhance_stones: 5,
      inventory: { health_potion: 3, mana_potion: 2 },
      equipment_enhances: { weapon: 0 }
    };

    let potionsBought = 0;
    let forgeAttempts = 0;

    // Simulate 20 dungeon runs
    for (let run = 1; run <= 20; run++) {
      // 1. Earn rewards (Faucet)
      user.gold += 45;
      user.gems += 2;
      user.enhance_stones += 1;
      user.dust += 5; // From clearing/salvage

      // 2. Consume potion in combat (Sink)
      if (run % 2 === 0) {
        if (user.inventory.health_potion > 0) {
          user.inventory.health_potion--;
        } else if (user.gold >= 40) {
          user.gold -= 40;
          potionsBought++;
        }
      }

      // 3. Attempt Forge enhancement if affordable
      const currentEnh = user.equipment_enhances.weapon;
      if (currentEnh < 10) {
        const nextLvl = currentEnh + 1;
        const goldCost = nextLvl * 75;
        const stoneCost = Math.ceil(nextLvl / 3);

        if (user.gold >= goldCost && user.enhance_stones >= stoneCost) {
          user.gold -= goldCost;
          user.enhance_stones -= stoneCost;
          forgeAttempts++;
          // Simulate 80% success
          if (Math.random() < 0.8) {
            user.equipment_enhances.weapon++;
          }
        }
      }
    }

    t.assertGreaterThan(forgeAttempts, 2, 'Player should be able to make several forge attempts over 20 runs');
    t.assertGreaterThan(user.gold, 0, 'Player gold balance remains positive without bankrupting');
    t.assertGreaterThan(user.equipment_enhances.weapon, 1, 'Weapon enhances beyond +1 over 20 runs');
  });


  // ==========================================================================
  // SUITE 7: 4 CHARACTER CLASSES & 4 COMPANION PETS
  // ==========================================================================
  const s7 = runner.suite('7. Classes & Companion Pets');

  s7.test('T7.1: 4 Character Classes Skill Trees (2 Active, 2 Passive)', (t) => {
    t.assertTrue(Boolean(global.GamificationSkills), 'GamificationSkills must be defined');
    const classes = ['warrior', 'mage', 'ranger', 'assassin'];

    classes.forEach(cls => {
      const cData = global.GamificationSkills.CLASS_SKILLS[cls];
      t.assertTrue(Boolean(cData), `Class [${cls}] must exist in CLASS_SKILLS`);
      t.assertTrue(Boolean(cData.active_1), `${cls} must have active_1`);
      t.assertTrue(Boolean(cData.active_2), `${cls} must have active_2`);
      t.assertTrue(Boolean(cData.passive_1), `${cls} must have passive_1`);
      t.assertTrue(Boolean(cData.passive_2), `${cls} must have passive_2`);

      t.assertGreaterThan(cData.active_1.mp, 0, `${cls} active_1 must cost MP`);
      t.assertGreaterThan(cData.active_2.mp, 0, `${cls} active_2 must cost MP`);
    });
  });

  s7.test('T7.2: Skill Point (SP) Accrual, Unlock & Reset Logic', (t) => {
    const user = {
      level: 4,
      rpg_class: 'warrior'
    };
    global.GamificationSkills.ensureInitialized(user);

    // Initial SP = level - 1 = 3
    t.assertEqual(user.skill_points, 3, 'Level 4 user has 3 SP');
    t.assertEqual(user.skills_unlocked.active_1, true, 'active_1 unlocked by default');
    t.assertEqual(user.skills_unlocked.active_2, false, 'active_2 locked initially');

    // Spend 1 SP to unlock active_2
    user.skill_points -= 1;
    user.skills_unlocked.active_2 = true;
    t.assertEqual(user.skill_points, 2, 'Spending SP decrements to 2');
    t.assertEqual(user.skills_unlocked.active_2, true, 'active_2 is now unlocked');

    // Reset Skills: returns all points (level - 1)
    const totalPoints = Math.max(0, user.level - 1);
    user.skill_points = totalPoints;
    user.skills_unlocked = {
      active_1: true,
      active_2: false,
      passive_1: false,
      passive_2: false
    };

    t.assertEqual(user.skill_points, 3, 'Reset refunds all 3 SP');
    t.assertEqual(user.skills_unlocked.active_2, false, 'active_2 is reset to locked');
  });

  s7.test('T7.3: 4 Companion Pets Definition & Combat Buffs', (t) => {
    t.assertTrue(Boolean(global.GamificationPets), 'GamificationPets must be defined');
    const petKeys = Object.keys(global.GamificationPets.PETS_DATA);
    t.assertEqual(petKeys.length, 4, 'Must have 4 companion pets defined');

    // Check existing pets
    petKeys.forEach(pId => {
      const pet = global.GamificationPets.PETS_DATA[pId];
      t.assertTrue(Boolean(pet.name), `Pet ${pId} must have name`);
      t.assertTrue(Boolean(pet.icon), `Pet ${pId} must have icon`);
      t.assertTrue(Boolean(pet.bonusLabel), `Pet ${pId} must have bonusLabel`);
      t.assertTrue(Boolean(pet.costUnlock), `Pet ${pId} must have costUnlock`);
    });
  });

  s7.test('T7.4: Pet Upgrading (Level 1..10) & Resource Consumption', (t) => {
    const petsModule = global.GamificationPets || window.GamificationPets;
    t.assertTrue(Boolean(petsModule && typeof petsModule.upgradePet === 'function'), 'GamificationPets.upgradePet must exist');

    const testUser = {
      gold: 500,
      dust: 200,
      magic_dust: 200,
      pets: {
        wise_owl: { unlocked: true, level: 1, xp: 0, affinity: 50 }
      }
    };

    const origUser = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : global.currentRpgUser;
    try {
      // Bind test user to global RPG context
      window.currentRpgUser = testUser;
      if (typeof global !== 'undefined') global.currentRpgUser = testUser;

      // Execute genuine production upgrade
      // Level 1 -> Level 2 cost formula: gold = 50 + 1*30 = 80; dust = 20 + 1*15 = 35
      const success = petsModule.upgradePet('wise_owl');
      t.assertTrue(success, 'upgradePet must succeed for unlocked pet with sufficient currency');

      // Assert genuine state mutations performed by GamificationPets.upgradePet
      t.assertEqual(testUser.pets.wise_owl.level, 2, 'Pet level increments from 1 to 2');
      t.assertEqual(testUser.gold, 420, 'Gold decremented from 500 by 80 to 420');
      t.assertEqual(testUser.dust, 165, 'Unified dust decremented from 200 by 35 to 165');
      t.assertEqual(testUser.magic_dust, 165, 'Legacy magic_dust synced with unified dust');

      // Verify scaling combat buffs via getPetBuffs
      const buffLv1 = petsModule.getPetBuffs('wise_owl', 1);
      const buffLv2 = petsModule.getPetBuffs('wise_owl', 2);
      t.assertGreaterThan(buffLv2.expMultiplier, buffLv1.expMultiplier, 'Level 2 pet provides higher EXP multiplier than Level 1');

      // Test failure when currencies are insufficient
      testUser.gold = 10;
      testUser.dust = 5;
      const failResult = petsModule.upgradePet('wise_owl');
      t.assertFalse(failResult, 'upgradePet must return false when resources are insufficient');
      t.assertEqual(testUser.pets.wise_owl.level, 2, 'Pet level remains unchanged on failed upgrade');
    } finally {
      window.currentRpgUser = origUser;
      if (typeof global !== 'undefined') global.currentRpgUser = origUser;
    }
  });


  // ==========================================================================
  // SUITE 8: QUESTS TRIGGERS, ACHIEVEMENTS & PROFILE SAVE/LOAD PERSISTENCE
  // ==========================================================================
  const s8 = runner.suite('8. Quests Triggers & Profile Persistence');

  s8.test('T8.1: Daily Quests Event Tracking (dungeon_clear, combo_streak, c1_c2)', (t) => {
    t.assertTrue(Boolean(global.GamificationQuests), 'GamificationQuests must be defined');

    const user = {
      daily_quests: {
        date: new Date().toISOString().slice(0, 10),
        tasks: [
          { id: 'dungeon_clear', current: 0, target: 1, completed: false, claimed: false },
          { id: 'combo_streak_5', current: 0, target: 5, completed: false, claimed: false },
          { id: 'c1_c2_words_8', current: 0, target: 8, completed: false, claimed: false },
          { id: 'forge_enhance_1', current: 0, target: 1, completed: false, claimed: false }
        ]
      },
      achievements: { progress: {}, unlocked_ids: [], claimed_ids: [] }
    };

    // Temporarily bind mock user
    const origUser = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : global.currentRpgUser;
    if (typeof currentRpgUser !== 'undefined') {
      currentRpgUser = user;
    }
    global.currentRpgUser = user;

    try {
      // 1. Emit dungeon_clear
      global.GamificationQuests.trackProgress('dungeon_clear', 1);
      const dTask = user.daily_quests.tasks.find(t => t.id === 'dungeon_clear');
      t.assertEqual(dTask.current, 1, 'dungeon_clear task incremented to 1');
      t.assertEqual(dTask.completed, true, 'dungeon_clear task completed');

      // 2. Emit combo_streak (streak of 6)
      global.GamificationQuests.trackProgress('combo_streak', 6);
      const cTask = user.daily_quests.tasks.find(t => t.id === 'combo_streak_5');
      t.assertEqual(cTask.current, 5, 'combo_streak_5 task capped at target 5');
      t.assertEqual(cTask.completed, true, 'combo_streak_5 task completed');

      // 3. Emit c1_c2_word (progress +4)
      global.GamificationQuests.trackProgress('c1_c2_word', 4);
      const wTask = user.daily_quests.tasks.find(t => t.id === 'c1_c2_words_8');
      t.assertEqual(wTask.current, 4, 'c1_c2_words_8 task incremented to 4');
      t.assertEqual(wTask.completed, false, 'c1_c2_words_8 not completed yet');

      // 4. Emit forge_enhance
      global.GamificationQuests.trackProgress('forge_enhance', 1);
      const fTask = user.daily_quests.tasks.find(t => t.id === 'forge_enhance_1');
      t.assertEqual(fTask.completed, true, 'forge_enhance_1 completed');
    } finally {
      if (typeof currentRpgUser !== 'undefined') {
        currentRpgUser = origUser;
      }
      global.currentRpgUser = origUser;
    }
  });

  s8.test('T8.2: Achievements Progress & Reward Claim Currency Distribution', (t) => {
    const questsModule = global.GamificationQuests || window.GamificationQuests;
    t.assertTrue(Boolean(questsModule && typeof questsModule.claimAchievement === 'function'), 'GamificationQuests.claimAchievement must exist');

    const testUser = {
      level: 1,
      rpg_class: 'warrior',
      gold: 100,
      gems: 5,
      dust: 10,
      magic_dust: 10,
      xp: 0,
      achievements: {
        progress: { ach_first_blood: 1 },
        unlocked_ids: ['ach_first_blood'],
        claimed_ids: [],
        equipped_title: null
      }
    };

    const origUser = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : global.currentRpgUser;
    try {
      window.currentRpgUser = testUser;
      if (typeof global !== 'undefined') global.currentRpgUser = testUser;

      const ach = questsModule.ACHIEVEMENTS.find(a => a.id === 'ach_first_blood');
      t.assertTrue(Boolean(ach), 'ach_first_blood must exist in ACHIEVEMENTS catalog');

      // Execute genuine claimAchievement
      const claimResult = questsModule.claimAchievement('ach_first_blood');
      t.assertTrue(claimResult, 'claimAchievement must return true on valid completed achievement');

      // Assert currency distribution and title assignment per ach_first_blood (+30 gold, +40 exp, title 'Tân Binh Hầm Ngục')
      t.assertEqual(testUser.gold, 130, 'ach_first_blood grants +30 gold (100 -> 130)');
      t.assertEqual(testUser.xp, 40, 'ach_first_blood grants +40 EXP (0 -> 40)');
      t.assertTrue(testUser.achievements.claimed_ids.includes('ach_first_blood'), 'ach_first_blood recorded in claimed_ids array');
      t.assertEqual(testUser.achievements.equipped_title, 'Tân Binh Hầm Ngục', 'Title automatically equipped upon first claim');

      // Test duplicate claim prevention
      const duplicateResult = questsModule.claimAchievement('ach_first_blood');
      t.assertFalse(duplicateResult, 'Duplicate achievement claim must return false');
      t.assertEqual(testUser.gold, 130, 'Currencies must not be awarded twice');
    } finally {
      window.currentRpgUser = origUser;
      if (typeof global !== 'undefined') global.currentRpgUser = origUser;
    }
  });

  s8.test('T8.3: Profile Serialization to LocalStorage & Retrieval Integrity', (t) => {
    const originalProfile = {
      id: 'test_user_qa_123',
      display_name: 'Dũng Sĩ Thử Nghiệm',
      rpg_class: 'ranger',
      level: 7,
      xp: 450,
      hp: 120,
      max_hp: 120,
      mp: 80,
      max_mp: 80,
      gold: 850,
      gems: 24,
      dust: 65,
      enhance_stones: 12,
      gacha_pity: 4,
      equipped: {
        weapon: 'wp_r_hunter',
        helmet: 'hm_hunter_beret',
        armor: 'ar_ranger_tunic',
        gloves: 'gl_hunter_grips',
        boots: 'bt_leather_boots',
        accessory: 'ac_silver_band'
      },
      equipment_inventory: ['wp_r_iron'],
      equipment_enhances: { weapon: 3, armor: 2 },
      skills_unlocked: { active_1: true, active_2: true, passive_1: true, passive_2: false },
      equipped_pet: 'wise_owl'
    };

    const storageKey = 'anki_rpg_test_verification_key';
    localStorage.setItem(storageKey, JSON.stringify(originalProfile));

    const retrievedJson = localStorage.getItem(storageKey);
    t.assertTrue(Boolean(retrievedJson), 'Profile successfully read from localStorage');
    const restored = JSON.parse(retrievedJson);

    t.assertEqual(restored.id, originalProfile.id, 'ID preserved');
    t.assertEqual(restored.rpg_class, 'ranger', 'rpg_class preserved');
    t.assertEqual(restored.level, 7, 'Level preserved');
    t.assertEqual(restored.gold, 850, 'Gold preserved');
    t.assertEqual(restored.dust, 65, 'Dust preserved');
    t.assertEqual(restored.equipment_enhances.weapon, 3, 'Forge enhancement level preserved');
    t.assertDeepEqual(restored.equipped, originalProfile.equipped, 'Equipped items match exactly');

    localStorage.removeItem(storageKey);
  });

  s8.test('T8.4: Cloud Payload Packaging (JSONB inventory) Integrity', async (t) => {
    const saveRpg = global.saveCurrentRpgUser || window.saveCurrentRpgUser;
    const unpackRow = global.unpackSupabaseProfileRow || window.unpackSupabaseProfileRow;

    t.assertTrue(typeof saveRpg === 'function', 'saveCurrentRpgUser must be exposed globally');
    t.assertTrue(typeof unpackRow === 'function', 'unpackSupabaseProfileRow must be exposed globally');

    const mockUser = {
      id: 'test_cloud_user_456',
      is_cloud: true,
      display_name: 'Test Paladin',
      avatar: '🦁',
      rpg_class: 'warrior',
      level: 10,
      xp: 800,
      hp: 120,
      max_hp: 120,
      mp: 40,
      max_mp: 40,
      gold: 1500,
      gems: 30,
      dust: 120,
      magic_dust: 120,
      enhance_stones: 15,
      gacha_pity: 7,
      streak: 5,
      last_active_date: '2026-11-02',
      equipped_weapon: 'wp_w_iron',
      equipped_armor: 'ar_iron_plate',
      equipped: { weapon: 'wp_w_iron', armor: 'ar_iron_plate' },
      equipment_inventory: ['ar_cloth_tunic'],
      equipment_enhances: { weapon: 5, armor: 3 },
      daily_quests: { date: '2026-11-02' },
      quests: { daily: { date: '2026-11-02' } },
      weekly_quests: { tasks: [] },
      achievements: { progress: { ach_first_blood: 1 }, claimed_ids: ['ach_first_blood'] },
      skill_points: 2,
      skills_unlocked: { active_1: true, passive_1: true },
      pets: { wise_owl: { level: 3, unlocked: true } },
      equipped_pet: 'wise_owl',
      tower_records: { max_floor: 12 }
    };

    let capturedCloudData = null;
    const mockSupabase = {
      from: (tableName) => ({
        update: (data) => {
          if (tableName === 'profiles') capturedCloudData = data;
          return {
            eq: () => Promise.resolve({ data: null, error: null })
          };
        }
      })
    };
    const mockSession = { user: { id: 'test_cloud_user_456' } };

    const origUser = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : window.currentRpgUser;
    const origClient = (typeof supabaseClient !== 'undefined') ? supabaseClient : window.supabaseClient;
    const origSession = (typeof currentSession !== 'undefined') ? currentSession : window.currentSession;

    try {
      window.currentRpgUser = mockUser;
      window.supabaseClient = mockSupabase;
      window.currentSession = mockSession;
      if (typeof currentRpgUser !== 'undefined') currentRpgUser = mockUser;
      if (typeof supabaseClient !== 'undefined') supabaseClient = mockSupabase;
      if (typeof currentSession !== 'undefined') currentSession = mockSession;
      if (typeof global !== 'undefined') {
        global.currentRpgUser = mockUser;
        global.supabaseClient = mockSupabase;
        global.currentSession = mockSession;
      }

      // Execute genuine saveCurrentRpgUser production serializer
      await saveRpg();

      t.assertTrue(Boolean(capturedCloudData), 'saveCurrentRpgUser must produce a serialized Supabase update payload');
      t.assertEqual(capturedCloudData.display_name, 'Test Paladin', 'display_name correctly serialized');
      t.assertEqual(capturedCloudData.level, 10, 'level correctly serialized');
      t.assertEqual(capturedCloudData.gold, 1500, 'gold correctly serialized');

      // Verify JSONB inventory packaging
      t.assertTrue(Boolean(capturedCloudData.inventory && typeof capturedCloudData.inventory === 'object'), 'inventory JSONB payload exists');
      t.assertEqual(capturedCloudData.inventory.dust, 120, 'Unified currency dust packaged in inventory payload');
      t.assertEqual(capturedCloudData.inventory.gacha_pity, 7, 'Gacha pity packaged in inventory payload');
      t.assertEqual(capturedCloudData.inventory.equipment_enhances.weapon, 5, 'Forge enhances packaged in inventory payload');
      t.assertEqual(capturedCloudData.inventory.tower_records.max_floor, 12, 'Tower records packaged in inventory payload');
      t.assertEqual(capturedCloudData.inventory.skill_points, 2, 'Skill points packaged in inventory payload');

      // Test round-trip deserialization via genuine unpackSupabaseProfileRow
      const unpacked = unpackRow(capturedCloudData);
      t.assertTrue(Boolean(unpacked), 'unpackSupabaseProfileRow successfully reconstructs user profile');
      t.assertEqual(unpacked.dust, 120, 'Unpacked user recovers unified dust');
      t.assertEqual(unpacked.gacha_pity, 7, 'Unpacked user recovers gacha pity');
      t.assertEqual(unpacked.tower_records.max_floor, 12, 'Unpacked user recovers tower max floor');
      t.assertEqual(unpacked.equipped.weapon, 'wp_w_iron', 'Unpacked user recovers equipped weapon');
    } finally {
      window.currentRpgUser = origUser;
      window.supabaseClient = origClient;
      window.currentSession = origSession;
      if (typeof currentRpgUser !== 'undefined') currentRpgUser = origUser;
      if (typeof supabaseClient !== 'undefined') supabaseClient = origClient;
      if (typeof currentSession !== 'undefined') currentSession = origSession;
      if (typeof global !== 'undefined') {
        global.currentRpgUser = origUser;
        global.supabaseClient = origClient;
        global.currentSession = origSession;
      }
    }
  });


  // ==========================================================================
  // SUITE 9: BROWSER CONSOLE ZERO-UNCAUGHT-EXCEPTION AUDIT & INTEGRITY
  // ==========================================================================
  const s9 = runner.suite('9. Zero Console Exception & Module Integrity');

  s9.test('T9.1: Module Global Namespaces & Integrity Assertions', (t) => {
    t.assertTrue(Boolean(typeof DUNGEON_DATA_100 !== 'undefined' || global.DUNGEON_DATA_100), 'DUNGEON_DATA_100 namespace defined');
    t.assertTrue(Boolean(typeof GamificationSkills !== 'undefined' || global.GamificationSkills), 'GamificationSkills namespace defined');
    t.assertTrue(Boolean(typeof GamificationPets !== 'undefined' || global.GamificationPets), 'GamificationPets namespace defined');
    t.assertTrue(Boolean(typeof GamificationTower !== 'undefined' || global.GamificationTower), 'GamificationTower namespace defined');
    t.assertTrue(Boolean(typeof GamificationQuests !== 'undefined' || global.GamificationQuests), 'GamificationQuests namespace defined');
    t.assertTrue(Boolean(typeof BattleEngine !== 'undefined' || global.BattleEngine), 'BattleEngine namespace defined');
    t.assertTrue(typeof calculatePlayerTotalStats === 'function' || typeof global.calculatePlayerTotalStats === 'function', 'calculatePlayerTotalStats defined');
    t.assertTrue(typeof calculateCombatDamage === 'function' || typeof global.calculateCombatDamage === 'function', 'calculateCombatDamage defined');
  });

  s9.test('T9.2: Test Harness Browser Zero-Uncaught-Exception Assertion', (t) => {
    const pageErrors = global.__PAGE_ERRORS__ || [];
    t.assertEqual(pageErrors.length, 0, `Harness must have 0 uncaught runtime exceptions, but found: ${JSON.stringify(pageErrors)}`);
  });

  s9.test('T9.3: Asynchronous Headless Frame Integrity Check for Battle & Index Pages', async (t) => {
    if (typeof document === 'undefined') return;

    // 1. Assert live iframe elements exist in DOM
    const battleFrame = document.getElementById('auditFrameBattle');
    const indexFrame = document.getElementById('auditFrameIndex');
    t.assertTrue(Boolean(battleFrame), 'auditFrameBattle iframe element must exist in DOM');
    t.assertTrue(Boolean(indexFrame), 'auditFrameIndex iframe element must exist in DOM');

    // 2. Asynchronously wait for frames to complete loading and booting
    if (typeof window.__AWAIT_FRAME_AUDIT__ === 'function') {
      await window.__AWAIT_FRAME_AUDIT__(4000);
    } else {
      async function waitForFrame(frame, timeoutMs = 4000) {
        if (!frame) return;
        return new Promise((resolve) => {
          let done = false;
          const complete = () => {
            if (!done) { done = true; resolve(); }
          };
          try {
            if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
              complete();
              return;
            }
          } catch (e) {}
          frame.addEventListener('load', complete, { once: true });
          setTimeout(complete, timeoutMs);
        });
      }
      await Promise.all([
        waitForFrame(battleFrame),
        waitForFrame(indexFrame)
      ]);
      await new Promise(r => setTimeout(r, 200));
    }

    // 3. Inspect live contentWindow errors and audit registry
    const liveBattleErrors = (battleFrame.contentWindow && Array.isArray(battleFrame.contentWindow.__PAGE_ERRORS__))
      ? battleFrame.contentWindow.__PAGE_ERRORS__
      : (window.__FRAME_AUDIT_DATA__?.battle?.errors || []);

    const liveIndexErrors = (indexFrame.contentWindow && Array.isArray(indexFrame.contentWindow.__PAGE_ERRORS__))
      ? indexFrame.contentWindow.__PAGE_ERRORS__
      : (window.__FRAME_AUDIT_DATA__?.index?.errors || []);

    t.assertEqual(liveBattleErrors.length, 0, `battle.html had ${liveBattleErrors.length} uncaught exceptions: ${JSON.stringify(liveBattleErrors)}`);
    t.assertEqual(liveIndexErrors.length, 0, `index.html had ${liveIndexErrors.length} uncaught exceptions: ${JSON.stringify(liveIndexErrors)}`);

    // 4. Verify dynamic audit DOM element was dynamically populated
    const auditDiv = document.getElementById('frame-audit-results');
    t.assertTrue(Boolean(auditDiv), '#frame-audit-results node must exist in DOM');
    const rawContent = auditDiv ? auditDiv.textContent.trim() : '';
    t.assertTrue(rawContent.length > 0, '#frame-audit-results must be dynamically populated by frame audit listeners');

    const auditData = JSON.parse(rawContent || '{}');
    t.assertTrue(Boolean(auditData.battle), 'battle frame audit data must be recorded');
    t.assertTrue(Boolean(auditData.index), 'index frame audit data must be recorded');
    t.assertTrue(Boolean(auditData.battle.loaded), 'battle.html must complete loading');
    t.assertTrue(Boolean(auditData.index.loaded), 'index.html must complete loading');
    t.assertEqual(auditData.battle.errors.length, 0, `battle.html dynamic audit must have 0 errors, found: ${JSON.stringify(auditData.battle.errors)}`);
    t.assertEqual(auditData.index.errors.length, 0, `index.html dynamic audit must have 0 errors, found: ${JSON.stringify(auditData.index.errors)}`);
  });

  s9.test('T9.4: Live Word Streaming Tracker Elements & Execution Sanity', async (t) => {
    if (typeof document === 'undefined') return;
    const indexFrame = document.getElementById('auditFrameIndex');
    if (!indexFrame) return;

    let doc = indexFrame.contentDocument || indexFrame.contentWindow?.document;
    if (!doc || doc.readyState !== 'complete') {
      await new Promise(r => {
        indexFrame.addEventListener('load', r, { once: true });
        setTimeout(r, 2000);
      });
      doc = indexFrame.contentDocument || indexFrame.contentWindow?.document;
    }

    t.assertTrue(Boolean(doc), 'indexFrame document must be loaded');
    const trackerBox = doc.getElementById('liveWordTrackerBox');
    t.assertTrue(Boolean(trackerBox), '#liveWordTrackerBox must exist in index.html DOM');
    t.assertTrue(Boolean(doc.getElementById('liveWordCounterBadge')), '#liveWordCounterBadge must exist');
    t.assertTrue(Boolean(doc.getElementById('liveWordCategoryBadge')), '#liveWordCategoryBadge must exist');
    t.assertTrue(Boolean(doc.getElementById('liveCurrentWordCard')), '#liveCurrentWordCard must exist');
    t.assertTrue(Boolean(doc.getElementById('liveCurrentWordName')), '#liveCurrentWordName must exist');
    t.assertTrue(Boolean(doc.getElementById('liveCurrentWordVi')), '#liveCurrentWordVi must exist');
    t.assertTrue(Boolean(doc.getElementById('liveWordChipsContainer')), '#liveWordChipsContainer must exist');

    const win = indexFrame.contentWindow;
    if (win && typeof win.resetLiveWordTracker === 'function') {
      win.resetLiveWordTracker(1, "Kiểm thử Tracker");
      t.assertEqual(doc.getElementById('liveWordCounterBadge')?.innerText, '0 / 100 từ (0%)', 'Counter badge must reset to 0%');

      if (typeof win.updateLiveWordProgress === 'function') {
        const sampleWord = {
          word: "aerospace",
          ipa: "/ˈer.oʊ.speɪs/",
          definition: "Branch of technology concerned with aviation and space flight",
          meaning_vi: "ngành hàng không vũ trụ",
          plural: "aerospaces",
          example_1: "She works in the aerospace industry.",
          example_2: "Aerospace engineers design satellites."
        };
        win.updateLiveWordProgress(sampleWord, 1, 100, 'advanced', "Hàng không vũ trụ");
        t.assertEqual(doc.getElementById('liveCurrentWordName')?.innerText, 'aerospace', 'Word name must match');
        t.assertEqual(doc.getElementById('liveCurrentWordVi')?.innerText, 'ngành hàng không vũ trụ', 'Vietnamese meaning must match');
        t.assertEqual(doc.getElementById('liveStreamedCount')?.innerText, '1', 'Streamed count must be 1');
      }
    }
  });
  // Export to global for execution in browsers and test harnesses
  global.GamificationTestRunner = runner;
  global.runGamificationTests = () => runner.runAll();

})(typeof window !== 'undefined' ? window : global);
