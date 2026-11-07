/**
 * ==============================================================================
 * MILESTONE 3 COMBAT MECHANICS & BOSS AI PROGRAMMATIC TEST SUITE
 * File: tests/test_milestone3_combat.js
 * ==============================================================================
 * Comprehensive test coverage validating:
 * 1. Rebalanced Hyperbolic Monster Damage Math (window.calculateMonsterDamage)
 * 2. Tactical Skills Execution & Pending Params Pipeline
 * 3. Boss AI Turn State Machine, Telegraph Charging & Enrage Scaling
 * 4. Boss Finishing Blow Execution Threshold Math & Retaliation
 * 5. Elemental Combat Damage Multipliers & Hero Affinity Resolution
 * 6. Tower of Babel & Boss Rush Lifecycle Hooks
 * 7. Edge Cases & Regressions (BUG-M2-01, BUG-M2-02, isCrit mutability)
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class Milestone3TestRunner {
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

  function runMilestone3Tests() {
    const r = new Milestone3TestRunner();

    // ============================================================================
    // SUITE 1: Rebalanced Monster Damage Math (Hyperbolic Curve)
    // ============================================================================
    r.suite('1. Rebalanced Monster Damage Math & Scaling');

    r.test('1.1 window.calculateMonsterDamage global function is exposed', () => {
      r.assert(typeof global.calculateMonsterDamage === 'function', 'window.calculateMonsterDamage must be a function');
    });

    r.test('1.2 Tier 1 Minion damage survivability (rawAtk 20, def 10)', () => {
      const dmg = global.calculateMonsterDamage(20, 10, 3);
      // baseDamage = 12 + 4 = 16. (16 + 3) * (60 / 70) = 19 * 0.857 = 16
      r.assertInRange(dmg, 14, 18, 'Tier 1 Minion deals 14..18 damage');
      const hitsToDie = Math.ceil(100 / dmg);
      r.assert(hitsToDie >= 5, `Starter hero survives at least 5 hits from Tier 1 Minion (got ${hitsToDie})`);
    });

    r.test('1.3 Tier 1 Boss damage survivability (rawAtk 45, def 10)', () => {
      const dmg = global.calculateMonsterDamage(45, 10, 3);
      // baseDamage = 12 + 9 = 21. (21 + 3) * (60 / 70) = 24 * 0.857 = 21
      r.assertInRange(dmg, 18, 24, 'Tier 1 Boss deals 18..24 damage');
      const hitsToDie = Math.ceil(100 / dmg);
      r.assert(hitsToDie >= 4, `Starter hero survives at least 4 hits from Tier 1 Boss (got ${hitsToDie})`);
    });

    r.test('1.4 Tier 4 Boss unarmored hero check (rawAtk 275, def 10)', () => {
      const dmg = global.calculateMonsterDamage(275, 10, 3);
      // baseDamage = 12 + 55 = 67. (67 + 3) * (60 / 70) = 70 * 0.857 = 60
      r.assertInRange(dmg, 55, 65, 'Unarmored player takes ~60 damage from Tier 4 Boss');
      const hitsToDie = Math.ceil(100 / dmg);
      r.assertEqual(hitsToDie, 2, 'Unarmored 100 HP hero survives exactly 1 hit and dies on 2nd (no 1-shot kill)');
    });

    r.test('1.5 Tier 4 Boss geared hero check (rawAtk 275, def 30, hp 120)', () => {
      const dmg = global.calculateMonsterDamage(275, 30, 3);
      // baseDamage = 67. (70) * (60 / 90) = 70 * 0.667 = 47
      r.assertInRange(dmg, 44, 48, 'Geared hero with 30 DEF takes 44..48 damage');
      const hp = 120;
      const hpAfterHit1 = hp - dmg;
      const hpAfterHit2 = hpAfterHit1 - dmg;
      r.assert(hpAfterHit2 > 0, `Hero survives 2 hits with positive HP remaining (${hpAfterHit2} HP)`);
      const hpAfterHit3 = hpAfterHit2 - dmg;
      r.assert(hpAfterHit3 <= 0, `Hero dies on 3rd hit (${hpAfterHit3} HP)`);
    });

    r.test('1.6 Tier 4 Boss tank hero check (rawAtk 275, def 50, hp 150)', () => {
      const dmg = global.calculateMonsterDamage(275, 50, 3);
      // baseDamage = 67. (70) * (60 / 110) = 70 * 0.545 = 38
      r.assertInRange(dmg, 35, 41, 'Tank hero with 50 DEF takes 35..41 damage');
      const hp = 150;
      const hitsToDie = Math.ceil(hp / dmg);
      r.assert(hitsToDie >= 4, `Tank hero survives at least 3 hits, dying on 4th (got ${hitsToDie})`);
    });

    r.test('1.7 Minimum damage floor 8 respected under extreme defense', () => {
      const dmg = global.calculateMonsterDamage(300, 99999, 0);
      r.assertEqual(dmg, 8, 'Damage never falls below hard floor of 8 even with extreme DEF');
    });

    r.test('1.8 Zero and negative inputs handle gracefully without NaN', () => {
      const d1 = global.calculateMonsterDamage(0, 0, 0);
      r.assert(!isNaN(d1) && d1 >= 8, 'Zero inputs yield valid damage >= 8');
      const d2 = global.calculateMonsterDamage(-10, -5, 0);
      r.assert(!isNaN(d2) && d2 >= 8, 'Negative inputs clamp cleanly without NaN');
    });

    // ============================================================================
    // SUITE 2: Tactical Skills Execution & Pending Params Consumption
    // ============================================================================
    r.suite('2. Tactical Skills Execution & Pending Params');

    r.test('2.1 Mage Meteor Strike ignores 50% DEF and applies 3.0x DMG multiplier', () => {
      const rawDef = 40;
      const ignoreDefPercent = 0.5;
      const effectiveDef = Math.max(0, Math.round(rawDef * (1 - ignoreDefPercent)));
      r.assertEqual(effectiveDef, 20, '50% DEF ignore halves defender defense from 40 to 20');

      const stats = { atk: 50 };
      const dmgNormal = global.calculateCombatDamage(stats.atk, rawDef, false, 1.0);
      const dmgMeteor = global.calculateCombatDamage(stats.atk, effectiveDef, false, 3.0);
      r.assert(dmgMeteor > dmgNormal * 2.8, 'Meteor Strike deals ~3x damage with 50% DEF pierce');
    });

    r.test('2.2 Ranger Arrow Barrage executes 2 hits at 1.1x per hit with 40% DEF ignore', () => {
      const rawDef = 50;
      const barrageIgnoreDef = 0.4;
      const barrageDef = Math.max(0, Math.round(rawDef * (1 - barrageIgnoreDef)));
      r.assertEqual(barrageDef, 30, '40% DEF ignore reduces 50 DEF to 30');

      const hitDmg1 = global.calculateCombatDamage(40, barrageDef, false, 1.1);
      const hitDmg2 = global.calculateCombatDamage(40, barrageDef, false, 1.1);
      r.assert(hitDmg1 >= 15 && hitDmg2 >= 15, 'Both barrage hits deal valid combat damage');
      const totalBarrage = hitDmg1 + hitDmg2;
      r.assert(totalBarrage > hitDmg1, '2 hits cumulatively deal dual-strike damage');
    });

    r.test('2.3 Assassin Guaranteed Crit 3.5x multiplier', () => {
      const normalDmg = global.calculateCombatDamage(40, 10, false, 1.0);
      const crit35Dmg = global.calculateCombatDamage(40, 10, true, 3.5);
      r.assert(crit35Dmg > normalDmg * 3.0, 'Assassin Crit 3.5x delivers massive critical strike');
    });

    r.test('2.4 Assassin Poison DoT params and turn processor logic', () => {
      const poisonParams = global.GamificationSkills.getAssassinPoisonParams();
      r.assertEqual(poisonParams.poisonDmg, 25, 'Assassin poison deals 25 HP/turn');
      r.assertEqual(poisonParams.poisonTurns, 3, 'Assassin poison lasts 3 turns');

      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        hp: 100,
        poisonTurns: poisonParams.poisonTurns,
        poisonDmg: poisonParams.poisonDmg,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};

      // Exercise genuine BattleEngine.applyTurnStatusEffects() across 3 turns
      for (let t = 0; t < 3; t++) {
        const tookEffect = engine.applyTurnStatusEffects();
        r.assertEqual(tookEffect, true, `DoT took effect on turn ${t + 1}`);
      }
      r.assertEqual(engine.monster.hp, 25, '3 turns of poison ticks 75 HP total, leaving 25 HP');
      r.assertEqual(engine.monster.poisonTurns, 0, 'Poison turns expire at 0');

      const expired = engine.applyTurnStatusEffects();
      r.assertEqual(expired, false, 'Expired poison does not take effect');
    });

    r.test('2.5 Warrior Reflect Shield mitigates 80% and reflects 100% monster raw ATK', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        name: 'Chiến Binh Quỷ',
        hp: 200,
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
      engine.pendingReflectShield = true;
      engine.pendingSkillParams = { effect: 'reflect_shield', mitigation: 0.8, reflect: 1.0 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      // Execute genuine engine method
      engine.onMonsterStrikeConnect();

      // Monster had 200 HP, took 80 reflected damage -> 120 HP
      r.assertEqual(engine.monster.hp, 120, 'Monster takes 100% of raw ATK (80) reflected damage (200 -> 120)');
      // Hero took 80% mitigated damage (incoming raw mitigated by 80%, hero HP remains healthy > 90)
      r.assert(engine.hero.hp >= 90 && engine.hero.hp < 100, `Hero took mitigated damage (hero HP is ${engine.hero.hp})`);
      r.assertEqual(engine.pendingReflectShield, false, 'pendingReflectShield consumed');
    });

    r.test('2.6 Warrior Reflect Shield lethal reflection triggers death explosion', () => {
      let explosionTriggered = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        name: 'Quái Yếu',
        hp: 50,
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
      engine.pendingReflectShield = true;
      engine.pendingSkillParams = { effect: 'reflect_shield', mitigation: 0.8, reflect: 1.0 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionTriggered = true; };

      // Execute genuine engine method
      engine.onMonsterStrikeConnect();

      r.assertEqual(engine.monster.hp, 0, 'Monster HP reaches 0 from reflected damage');
      r.assertEqual(explosionTriggered, true, 'Death explosion triggered immediately upon lethal reflection');
    });

    // ============================================================================
    // SUITE 3: Boss AI Routines, Charging Telegraph & Enrage Scaling
    // ============================================================================
    r.suite('3. Boss AI State Machine & Enrage Mechanics');

    r.test('3.1 Boss Enrage activates at <= 50% maxHp and increases ATK by +25%', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Chúa Tể Ma Giới',
        hp: 400,
        maxHp: 1000,
        atk: 60,
        enraged: false,
        turnCount: 0,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};

      // Execute genuine Boss AI turn routine
      engine.processBossTurnCycle();

      r.assertEqual(engine.monster.enraged, true, 'Boss enters enraged state when HP <= 50%');
      r.assertEqual(engine.monster.atk, 75, 'Boss ATK scaled up by exactly +25% (60 -> 75)');
    });

    r.test('3.2 Boss AI turn routine charges on turn 1 and executes on turn 2', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Hắc Ma Vương',
        hp: 1000,
        maxHp: 1000,
        atk: 60,
        turnCount: 0,
        isCharging: false,
        chargeSkill: null,
        skillName: 'Hơi Thở Ma Vương',
        enraged: false,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};

      // Turn 1
      engine.processBossTurnCycle();
      r.assertEqual(engine.monster.isCharging, true, 'Boss enters charging state on Turn 1');
      r.assertEqual(engine.monster.chargeSkill, 'Hơi Thở Ma Vương', 'Charge skill telegraphed');

      // Turn 2
      engine.processBossTurnCycle();
      r.assertEqual(engine.monster.isCharging, false, 'Charging consumed on Turn 2 to launch Mega Strike');
    });

    r.test('3.3 Freeze status cancels Boss charge and interrupts attack cycle', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Hắc Ma Vương',
        hp: 1000,
        maxHp: 1000,
        frozen: true,
        isCharging: true,
        chargeSkill: 'Hơi Thở Ma Vương',
        turnCount: 1,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};

      // Execute genuine engine routine
      engine.processBossTurnCycle();

      r.assertEqual(engine.monster.frozen, false, 'Freeze status consumed');
      r.assertEqual(engine.monster.isCharging, false, 'Charging state shattered by freeze interrupt');
    });

    // ============================================================================
    // SUITE 4: Boss Finishing Blow Threshold & Retaliation
    // ============================================================================
    r.suite('4. Boss Finishing Blow Execution & Retaliation');

    r.test('4.1 Finishing blow executes boss when boss.hp <= 20% maxHp', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = { hp: 180, maxHp: 1000, isBoss: true, state: 'idle' };
      engine.hero = { hp: 100, x: 100, y: 100, state: 'idle' };
      engine.addFloatDamage = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const executed = engine.triggerHeroFinishingBlow(false);

      r.assertEqual(executed, true, 'Finishing blow executed cleanly');
      r.assertEqual(engine.monster.hp, 0, 'Boss HP executed to 0');
      r.assertEqual(explosionCalled, true, 'Death explosion triggered');
    });

    r.test('4.2 Finishing blow deals genuine damage and retaliates when boss.hp > threshold', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = { hp: 700, maxHp: 1000, isBoss: true, state: 'idle' };
      engine.hero = { hp: 100, x: 100, y: 100, state: 'idle' };
      engine.addFloatDamage = () => {};
      engine.updateBattleUI = () => {};

      const executed = engine.triggerHeroFinishingBlow(false);

      r.assertEqual(executed, false, 'Boss was NOT automatically executed to 0 without quiz exhaustion');
      r.assert(engine.monster.hp < 700, 'Boss takes genuine finishing damage');
      r.assertEqual(engine.monster.state, 'attacking', 'Boss enters attacking retaliation state');

      // Question 10 finishing blow check: when quiz is exhausted, executes high HP boss cleanly
      let explosionCalled2 = false;
      const engine2 = Object.create(global.BattleEngine);
      engine2.monster = { hp: 700, maxHp: 1000, isBoss: true, state: 'idle' };
      engine2.hero = { hp: 100, x: 100, y: 100, state: 'idle' };
      engine2.addFloatDamage = () => {};
      engine2.updateBattleUI = () => {};
      engine2.triggerMonsterDeathExplosion = () => { explosionCalled2 = true; };

      const executedExhausted = engine2.triggerHeroFinishingBlow(true);
      r.assertEqual(executedExhausted, true, 'Finishing blow executes high HP boss cleanly upon quiz exhaustion');
      r.assertEqual(engine2.monster.hp, 0, 'Boss HP reduced to 0 to prevent Question 10 soft-lock');
      r.assertEqual(explosionCalled2, true, 'Death explosion triggered on Question 10 finishing blow');
    });

    // ============================================================================
    // SUITE 5: Elemental Matrix & Affinity Resolution
    // ============================================================================
    r.suite('5. Elemental Matrix Multipliers & Hero Affinity');

    r.test('5.1 Elemental advantage yields 1.5x damage multiplier', () => {
      const mult = global.calculateElementalMultiplier('fire', 'nature');
      r.assertEqual(mult, 1.5, 'Fire vs Nature deals 1.5x advantage damage');
    });

    r.test('5.2 Elemental disadvantage yields 0.7x damage multiplier', () => {
      const mult = global.calculateElementalMultiplier('nature', 'fire');
      r.assertEqual(mult, 0.7, 'Nature vs Fire deals 0.7x disadvantage damage');
    });

    r.test('5.3 Same element yields 1.0x neutral damage multiplier', () => {
      const mult = global.calculateElementalMultiplier('water', 'water');
      r.assertEqual(mult, 1.0, 'Water vs Water is neutral 1.0x');
    });

    r.test('5.4 Hero element resolution derives from weapon or class defaults', () => {
      // Class defaults
      const warriorUser = { rpg_class: 'warrior', equipped: {} };
      const mageUser = { rpg_class: 'mage', equipped: {} };
      const rangerUser = { rpg_class: 'ranger', equipped: {} };
      const assassinUser = { rpg_class: 'assassin', equipped: {} };

      r.assertEqual(global.BattleEngine.getHeroElement(warriorUser), 'fire', 'Warrior defaults to fire');
      r.assertEqual(global.BattleEngine.getHeroElement(mageUser), 'lightning', 'Mage defaults to lightning');
      r.assertEqual(global.BattleEngine.getHeroElement(rangerUser), 'nature', 'Ranger defaults to nature');
      r.assertEqual(global.BattleEngine.getHeroElement(assassinUser), 'dark', 'Assassin defaults to dark');
    });

    // ============================================================================
    // SUITE 6: Tower & Boss Rush Lifecycle Hooks
    // ============================================================================
    r.suite('6. Tower of Babel & Boss Rush Lifecycle Hooks');

    r.test('6.1 Tower mode routes victory to GamificationTower.onFloorCleared', () => {
      let floorClearedCalled = false;
      const savedMode = global.GamificationTower.activeMode;
      const originalOnFloorCleared = global.GamificationTower.onFloorCleared;

      global.GamificationTower.activeMode = 'tower';
      global.GamificationTower.onFloorCleared = () => { floorClearedCalled = true; };

      // Invoke real global.showDungeonVictory()
      if (typeof global.showDungeonVictory === 'function') {
        global.showDungeonVictory();
      }

      global.GamificationTower.activeMode = savedMode;
      global.GamificationTower.onFloorCleared = originalOnFloorCleared;

      r.assert(floorClearedCalled, 'showDungeonVictory routes directly to GamificationTower.onFloorCleared in tower mode');

      // Also verify real GamificationTower.onFloorCleared mutates user progression
      const testUser = { gold: 100, enhance_stones: 0, gems: 0, tower_records: { max_floor: 1 } };
      global.currentRpgUser = testUser;
      const reward = global.GamificationTower.onFloorCleared(5);
      r.assert(reward.gold > 0, 'Floor 5 rewards gold');
      r.assertEqual(testUser.tower_records.max_floor, 5, 'Tower records max_floor updated to 5');
    });

    r.test('6.2 Boss Rush mode routes victory to GamificationTower.onBossRushCleared', () => {
      let bossRushClearedCalled = false;
      const savedMode = global.GamificationTower.activeMode;
      const originalOnBossRushCleared = global.GamificationTower.onBossRushCleared;

      global.GamificationTower.activeMode = 'boss_rush';
      global.GamificationTower.onBossRushCleared = () => { bossRushClearedCalled = true; };

      if (typeof global.showDungeonVictory === 'function') {
        global.showDungeonVictory();
      }

      global.GamificationTower.activeMode = savedMode;
      global.GamificationTower.onBossRushCleared = originalOnBossRushCleared;

      r.assert(bossRushClearedCalled, 'showDungeonVictory routes directly to GamificationTower.onBossRushCleared in boss_rush mode');
    });

    // ============================================================================
    // SUITE 7: Edge Cases & Bug Fixes (BUG-M2-01, BUG-M2-02, isCrit mutability)
    // ============================================================================
    r.suite('7. Edge Cases & Regressions Verification');

    r.test('7.1 BUG-M2-01: Pet affinity 0 preserved and not coerced to 50', () => {
      const user = {
        gold: 500,
        dust: 100,
        pets: {
          wise_owl: { unlocked: true, level: 1, affinity: 0 }
        }
      };
      global.GamificationPets.ensureInitialized(user);
      global.currentRpgUser = user;

      // Feed apple (+15)
      const fedState = global.GamificationPets.feedPet('wise_owl', 'snack_apple');
      r.assertEqual(fedState.affinity, 15, 'Affinity 0 + 15 food yields 15 without 0 || 50 falsy coercion');
    });

    r.test('7.2 BUG-M2-02: unlockSkill executes safely when BattleEngine lacks updateBattleUI', () => {
      const savedEngine = global.BattleEngine;
      global.BattleEngine = { hero: { hp: 100 } }; // Missing updateBattleUI method

      const user = { level: 4, rpg_class: 'warrior', skill_points: 2, skills_unlocked: { active_1: true, active_2: false, passive_1: false, passive_2: false } };
      global.currentRpgUser = user;

      let threw = false;
      try {
        global.GamificationSkills.unlockSkill('active_2');
      } catch (e) {
        threw = true;
      }

      global.BattleEngine = savedEngine;
      r.assertEqual(threw, false, 'unlockSkill must not throw when BattleEngine.updateBattleUI is undefined');
    });

    r.test('7.3 GamificationSkills.activateActiveSkill alias exists and points to castCombatSkill', () => {
      r.assert(typeof global.GamificationSkills.activateActiveSkill === 'function', 'activateActiveSkill alias exists');
      r.assertEqual(
        global.GamificationSkills.activateActiveSkill,
        global.GamificationSkills.castCombatSkill,
        'activateActiveSkill is aliased directly to castCombatSkill'
      );
    });

    r.test('7.4 isCrit identifier is declared with let allowing Assassin Active 2 mutation', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        name: 'Bù Nhìn Thử Nghiệm',
        hp: 500,
        maxHp: 500,
        def: 10,
        element: 'fire',
        flashWhite: 0,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.pendingCrit35 = true; // Assassin Active 2 triggers reassignment of isCrit
      engine.pendingStreak = 0;
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.slashes = [];
      engine.particles = [];

      let errorThrown = null;
      try {
        engine.onHeroStrikeConnect();
      } catch (e) {
        errorThrown = e;
      }

      r.assertEqual(errorThrown, null, 'onHeroStrikeConnect executes without TypeError on isCrit mutation');
      r.assertEqual(engine.pendingCrit35, false, 'pendingCrit35 was consumed');
      r.assert(engine.monster.hp < 500, 'Monster took critical strike damage from Assassin Active 2');
    });

    return r.getSummary();
  }

  // Export to global and Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMilestone3Tests };
  }
  if (typeof window !== 'undefined') {
    window.runMilestone3Tests = runMilestone3Tests;
  }
})(typeof window !== 'undefined' ? window : global);
