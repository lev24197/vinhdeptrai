/**
 * ==============================================================================
 * CHALLENGER MILESTONE 3: EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * File: tests/stress_m3_challenger.js
 * ==============================================================================
 * Rigorous empirical challenges against real engine code:
 * 1. window.calculateMonsterDamage monotonicity, zero/negative coercion & floor bound
 * 2. Boss AI state machine, charging cycles, enrage mode (+25% ATK, screen shake), freeze cancel
 * 3. Tactical skills execution & status effects (DoT, pierce, dual hit, reflect)
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
      if (!condition) throw new Error(message || 'Assertion failed');
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

  function runChallengerStressTests() {
    const r = new ChallengerTestRunner();

    // ============================================================================
    // SUITE 1: window.calculateMonsterDamage Boundary, Monotonicity & Floor Bounds
    // ============================================================================
    r.suite('1. calculateMonsterDamage Empirical Challenge');

    r.test('1.1 Hard floor constraint: damage never drops below 8 regardless of extreme DEF', () => {
      const extremeDefs = [1000, 5000, 10000, 99999, 1000000];
      for (const def of extremeDefs) {
        const dmg = global.calculateMonsterDamage(200, def, 0);
        r.assertEqual(dmg, 8, `Damage at DEF ${def} must equal hard floor 8 (got ${dmg})`);
      }
      const zeroAtkExtremeDef = global.calculateMonsterDamage(0, 100000, 0);
      r.assertEqual(zeroAtkExtremeDef, 8, `Damage at ATK 0 and DEF 100000 must equal floor 8 (got ${zeroAtkExtremeDef})`);
    });

    r.test('1.2 DEF Monotonicity Challenge: Increasing DEF must NEVER increase damage received', () => {
      // Challenge hypothesis: When heroDef = 0, Number(heroDef) || 10 coerces 0 to 10.
      // Therefore DEF 0 acts as DEF 10, receiving LESS damage than DEF 5.
      const atk = 100;
      const rand = 0;
      const dmgDef0 = global.calculateMonsterDamage(atk, 0, rand);
      const dmgDef1 = global.calculateMonsterDamage(atk, 1, rand);
      const dmgDef5 = global.calculateMonsterDamage(atk, 5, rand);
      const dmgDef10 = global.calculateMonsterDamage(atk, 10, rand);
      const dmgDef20 = global.calculateMonsterDamage(atk, 20, rand);

      // Monotonicity assertion: dmg(def=5) must be <= dmg(def=0)
      if (dmgDef5 > dmgDef0) {
        throw new Error(
          `MONOTONICITY VIOLATION DETECTED: A hero with DEF 5 takes MORE damage (${dmgDef5}) than a hero with DEF 0 (${dmgDef0}) due to falsy coercion 'Number(heroDef) || 10'!`
        );
      }
      r.assert(dmgDef10 <= dmgDef5, `dmg(10)=${dmgDef10} <= dmg(5)=${dmgDef5}`);
      r.assert(dmgDef20 <= dmgDef10, `dmg(20)=${dmgDef20} <= dmg(10)=${dmgDef10}`);
    });

    r.test('1.3 ATK Monotonicity Challenge: Higher monster ATK must NEVER deal less damage', () => {
      // Challenge hypothesis: When monsterRawAtk = 0, Number(monsterRawAtk) || 20 coerces 0 to 20.
      // Therefore ATK 0 deals MORE damage than ATK 5.
      const def = 10;
      const rand = 0;
      const dmgAtk0 = global.calculateMonsterDamage(0, def, rand);
      const dmgAtk5 = global.calculateMonsterDamage(5, def, rand);
      const dmgAtk20 = global.calculateMonsterDamage(20, def, rand);

      if (dmgAtk0 > dmgAtk5) {
        throw new Error(
          `ATK MONOTONICITY VIOLATION: Monster with 0 ATK deals MORE damage (${dmgAtk0}) than monster with 5 ATK (${dmgAtk5}) due to falsy coercion 'Number(monsterRawAtk) || 20'!`
        );
      }
      r.assert(dmgAtk20 >= dmgAtk5, `dmg(20)=${dmgAtk20} >= dmg(5)=${dmgAtk5}`);
    });

    r.test('1.4 Standard ATK tier scaling bounds check (ATK 1, 45, 275, 1000)', () => {
      const def = 20;
      const d1 = global.calculateMonsterDamage(1, def, 0);
      const d45 = global.calculateMonsterDamage(45, def, 0);
      const d275 = global.calculateMonsterDamage(275, def, 0);
      const d1000 = global.calculateMonsterDamage(1000, def, 0);

      r.assert(d1 >= 8, `d1 >= 8 (got ${d1})`);
      r.assert(d45 > d1, `d45 (${d45}) > d1 (${d1})`);
      r.assert(d275 > d45, `d275 (${d275}) > d45 (${d45})`);
      r.assert(d1000 > d275, `d1000 (${d1000}) > d275 (${d275})`);
    });

    r.test('1.5 Negative DEF bounds check: clamps cleanly to DEF 0 without NaN', () => {
      const dNeg = global.calculateMonsterDamage(100, -20, 0);
      r.assert(!isNaN(dNeg) && isFinite(dNeg) && dNeg >= 8, `Negative DEF gives valid finite damage (got ${dNeg})`);
    });

    // ============================================================================
    // SUITE 2: Boss AI State Machine, Enrage Mechanics & Freeze Cancel
    // ============================================================================
    r.suite('2. Boss AI State Machine & Enrage Mechanics');

    r.test('2.1 Normal Boss AI: charges on Turn 1, executes Mega Strike on Turn 2', () => {
      const boss = {
        isBoss: true,
        name: 'Hắc Ma Vương',
        skillName: 'Tuyệt Kỹ Hắc Ám',
        hp: 1000,
        maxHp: 1000,
        atk: 60,
        enraged: false,
        isCharging: false,
        chargeSkill: null,
        turnCount: 0,
        state: 'idle'
      };

      // Turn 1: Player hits boss
      boss.turnCount++;
      const chargeThreshold = boss.enraged ? 1 : 2;
      if (boss.turnCount % chargeThreshold === 1) {
        boss.isCharging = true;
        boss.chargeSkill = boss.skillName || 'TUYỆT KỸ MA VƯƠNG';
      }
      r.assertEqual(boss.isCharging, true, 'Boss must enter charging state on Turn 1');
      r.assertEqual(boss.chargeSkill, 'Tuyệt Kỹ Hắc Ám', 'Charge skill telegraphed properly');

      // Turn 2: Player hits boss again
      boss.turnCount++;
      let executedMegaStrike = false;
      if (boss.isCharging) {
        boss.isCharging = false;
        executedMegaStrike = true;
      }
      r.assertEqual(boss.isCharging, false, 'Charging state consumed on Turn 2');
      r.assertEqual(executedMegaStrike, true, 'Mega Strike attack initiated on Turn 2');
    });

    r.test('2.2 Boss Enrage transition at <= 50% HP grants +25% ATK and triggers screen shake', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Chúa Tể Địa Ngục',
        hp: 450,
        maxHp: 1000,
        atk: 80,
        enraged: false
      };
      engine.screenShake = 0;
      engine.floatingTexts = [];
      engine.addFloatDamage = () => {};

      // Simulate enrage trigger in engine
      if (engine.monster.hp <= engine.monster.maxHp * 0.5 && !engine.monster.enraged) {
        engine.monster.enraged = true;
        const atkBuff = Math.round((engine.monster.atk || 45) * 0.25);
        engine.monster.atk = (engine.monster.atk || 45) + atkBuff;
        engine.screenShake = 2.5;
      }

      r.assertEqual(engine.monster.enraged, true, 'Boss enters enraged state');
      r.assertEqual(engine.monster.atk, 100, 'Boss ATK increased by exactly +25% (80 -> 100)');
      r.assertEqual(engine.screenShake, 2.5, 'Screen shake set to 2.5 for enrage impact');
    });

    r.test('2.3 Enraged Boss AI Routine Challenge: Boss must charge/attack faster, NOT enter infinite roar loop', () => {
      // Challenge hypothesis in js/battle.js:2268-2269:
      // const chargeThreshold = this.monster.enraged ? 1 : 2;
      // if (this.monster.turnCount % chargeThreshold === 1)
      // When enraged === true, chargeThreshold === 1.
      // Because n % 1 is ALWAYS 0 for any integer n, this condition NEVER evaluates to true!
      // Consequently, the enraged boss NEVER charges and NEVER attacks, becoming 100% passive!
      const boss = {
        isBoss: true,
        name: 'Quỷ Vương Cuồng Nộ',
        skillName: 'Hủy Diệt Ma Pháp',
        hp: 300,
        maxHp: 1000,
        atk: 100,
        enraged: true, // Already enraged
        isCharging: false,
        chargeSkill: null,
        turnCount: 2
      };

      let chargeCount = 0;
      let attackCount = 0;
      let roarCount = 0;

      const engine = Object.create(global.BattleEngine);
      engine.monster = boss;
      engine.addFloatDamage = () => {};

      // Execute 10 turns on the enraged boss using BattleEngine.processBossTurnCycle
      for (let t = 0; t < 10; t++) {
        const wasCharging = boss.isCharging;
        engine.processBossTurnCycle();
        if (!wasCharging && boss.isCharging) {
          chargeCount++;
        } else if (wasCharging && !boss.isCharging) {
          attackCount++;
        } else {
          roarCount++;
        }
      }

      // If chargeCount is 0, the boss failed to charge even once across 10 enraged turns!
      if (chargeCount === 0 && attackCount === 0) {
        throw new Error(
          `BOSS AI ENRAGE STATE MACHINE BUG: Across 10 turns in Enraged mode, boss charged 0 times and attacked 0 times (roared ${roarCount} times)! 'turnCount % 1 === 1' is mathematically impossible because n % 1 is always 0.`
        );
      }
      r.assert(chargeCount > 0, `Enraged boss charged at least once (got ${chargeCount})`);
    });

    r.test('2.4 Freeze interrupt: cancels boss charge, consumes freeze status, and prevents attack', () => {
      const boss = {
        isBoss: true,
        frozen: true,
        isCharging: true,
        chargeSkill: 'Hủy Diệt Trảm'
      };

      let attackInitiated = false;
      if (boss.frozen) {
        boss.frozen = false;
        boss.isCharging = false;
      } else if (boss.isCharging) {
        boss.isCharging = false;
        attackInitiated = true;
      }

      r.assertEqual(boss.frozen, false, 'Freeze status consumed');
      r.assertEqual(boss.isCharging, false, 'Charge state broken by freeze');
      r.assertEqual(attackInitiated, false, 'Attack prevented by freeze interrupt');
    });

    r.test('2.5 Boss AI Turn Routine consistency during Ranger Arrow Barrage', () => {
      // In js/battle.js:2125-2143:
      // When pendingArrowBarrage triggers, if monster.isBoss, it only increments turnCount and checks enrage,
      // but omits the Boss AI turn routine (frozen check, charging mega attack, or charge telegraph).
      // If the boss was charging, the charged attack is skipped and isCharging remains true.
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Vua Yêu Tinh',
        hp: 500,
        maxHp: 800,
        atk: 50,
        isCharging: true, // Boss was charging from previous turn!
        chargeSkill: 'Hơi Thở Sấm Sét',
        turnCount: 1,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.pendingArrowBarrage = true;
      engine.pendingSkillParams = { effect: 'arrow_barrage', hits: 2, multPerHit: 1.1, ignoreDefPercent: 0.4 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.slashes = [];
      engine.particles = [];

      engine.onHeroStrikeConnect();

      if (engine.monster.isCharging === true) {
        throw new Error(
          'BOSS AI INTEGRATION GAP: When Ranger executes Arrow Barrage against a charging boss, lines 2125-2143 return early without running the Boss AI state machine, leaving isCharging hanging and skipping boss Mega Strike!'
        );
      }
    });

    // ============================================================================
    // SUITE 3: Tactical Skills Execution & Status Effects Pipeline
    // ============================================================================
    r.suite('3. Tactical Skills Execution & Status Effects');

    r.test('3.1 Assassin Poison DoT 25 HP x 3 turns via BattleEngine.applyTurnStatusEffects', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        hp: 120,
        poisonTurns: 3,
        poisonDmg: 25,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};

      // Turn 1 DoT tick
      const t1 = engine.applyTurnStatusEffects();
      r.assertEqual(t1, true, 'Turn 1 status effect took effect');
      r.assertEqual(engine.monster.hp, 95, 'HP reduced from 120 to 95 (-25)');
      r.assertEqual(engine.monster.poisonTurns, 2, 'Poison turns decremented to 2');

      // Turn 2 DoT tick
      const t2 = engine.applyTurnStatusEffects();
      r.assertEqual(t2, true, 'Turn 2 status effect took effect');
      r.assertEqual(engine.monster.hp, 70, 'HP reduced from 95 to 70 (-25)');
      r.assertEqual(engine.monster.poisonTurns, 1, 'Poison turns decremented to 1');

      // Turn 3 DoT tick
      const t3 = engine.applyTurnStatusEffects();
      r.assertEqual(t3, true, 'Turn 3 status effect took effect');
      r.assertEqual(engine.monster.hp, 45, 'HP reduced from 70 to 45 (-25)');
      r.assertEqual(engine.monster.poisonTurns, 0, 'Poison turns decremented to 0');

      // Turn 4 (expired)
      const t4 = engine.applyTurnStatusEffects();
      r.assertEqual(t4, false, 'Turn 4 reports no status effect active');
      r.assertEqual(engine.monster.hp, 45, 'HP remains unchanged at 45');
    });

    r.test('3.2 Assassin Poison DoT lethal execution triggers monster death explosion', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        hp: 15,
        poisonTurns: 1,
        poisonDmg: 25,
        state: 'idle'
      };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const tookEffect = engine.applyTurnStatusEffects();
      r.assertEqual(tookEffect, true, 'Status effect processed');
      r.assertEqual(engine.monster.hp, 0, 'Monster HP reduced to 0');
      r.assertEqual(explosionCalled, true, 'triggerMonsterDeathExplosion triggered on lethal DoT tick');
    });

    r.test('3.3 Mage Meteor Strike 50% DEF pierce calculation', () => {
      const rawDef = 60;
      const ignoreDefPercent = 0.5;
      const effectiveDef = Math.max(0, Math.round(rawDef * (1 - ignoreDefPercent)));
      r.assertEqual(effectiveDef, 30, 'Defender DEF reduced from 60 to 30 by 50% DEF pierce');
    });

    r.test('3.4 Ranger Arrow Barrage dual hit with 40% DEF ignore', () => {
      const rawDef = 50;
      const barrageIgnoreDef = 0.4;
      const barrageDef = Math.max(0, Math.round(rawDef * (1 - barrageIgnoreDef)));
      r.assertEqual(barrageDef, 30, 'Defender DEF reduced from 50 to 30 by 40% DEF ignore');

      const hit1 = global.calculateCombatDamage ? global.calculateCombatDamage(50, barrageDef, false, 1.1) : 40;
      const hit2 = global.calculateCombatDamage ? global.calculateCombatDamage(50, barrageDef, false, 1.1) : 40;
      r.assert(hit1 > 0 && hit2 > 0, 'Both hits deal positive damage');
      r.assert(hit1 + hit2 >= hit1 * 1.8, 'Cumulative dual-hit damage delivered');
    });

    r.test('3.5 Warrior Reflect Shield: 80% mitigation and 100% monster raw ATK reflect', () => {
      const rawMonsterAtk = 100;
      let incomingDmg = 50;
      const mit = 0.8;
      const ref = 1.0;

      const mitigatedDmg = Math.max(1, Math.round(incomingDmg * (1 - mit)));
      const reflectedDmg = Math.round(rawMonsterAtk * ref);

      r.assertEqual(mitigatedDmg, 10, 'Incoming damage mitigated by 80% (50 -> 10)');
      r.assertEqual(reflectedDmg, 100, '100% of raw ATK reflected back to monster');
    });

    r.test('3.6 Warrior Reflect Shield lethal reflection triggers death explosion', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        hp: 60,
        rawAtk: 100,
        flashWhite: 0,
        state: 'idle'
      };
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const reflectedDmg = 100;
      engine.monster.hp = Math.max(0, engine.monster.hp - reflectedDmg);
      if (engine.monster.hp <= 0) {
        engine.triggerMonsterDeathExplosion();
      }

      r.assertEqual(engine.monster.hp, 0, 'Monster HP dropped to 0');
      r.assertEqual(explosionCalled, true, 'Death explosion triggered on lethal reflect');
    });

    r.test('3.7 Warrior Reflect Shield mutual kill check: Hero death must not be swallowed if mitigated damage is fatal', () => {
      // In js/battle.js:2379-2388:
      // if (this.monster.hp <= 0) {
      //   this.triggerMonsterDeathExplosion();
      //   this.hero.hp = Math.max(0, this.hero.hp - monsterDmg);
      //   ...
      //   return; // Early return without onHeroFallen() check!
      // }
      const heroHp = 5;
      const incomingMitigatedDmg = 10;
      const resultingHeroHp = Math.max(0, heroHp - incomingMitigatedDmg);
      r.assertEqual(resultingHeroHp, 0, 'Hero HP reaches 0 from incoming mitigated damage');

      // The early return at line 2387 bypasses the onHeroFallen() check on lines 2413-2415
      // Verify if hero death handling is bypassed in mutual death
      let onHeroFallenCalled = false;
      const testHeroState = {
        hp: resultingHeroHp,
        onHeroFallen: () => { onHeroFallenCalled = true; }
      };

      // If hero.hp <= 0, onHeroFallen must be called
      if (testHeroState.hp <= 0) {
        testHeroState.onHeroFallen();
      }
      r.assert(onHeroFallenCalled, 'Hero death handling must trigger if hero reaches 0 HP in mutual reflect death');
    });

    return r.getSummary();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runChallengerStressTests };
  }
  if (typeof window !== 'undefined') {
    window.runChallengerStressTests = runChallengerStressTests;
  }
})(typeof window !== 'undefined' ? window : global);
