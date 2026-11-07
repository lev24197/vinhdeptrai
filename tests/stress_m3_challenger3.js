/**
 * ==============================================================================
 * CHALLENGER 3 MILESTONE 3: EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * File: tests/stress_m3_challenger3.js
 * ==============================================================================
 * Deep empirical verification of:
 * 1. DEF & ATK Monotonicity & Coercion across exhaustive parameter sweeps
 * 2. Enraged Boss State Machine & Charging Cycle across multi-turn simulations
 * 3. Ranger Arrow Barrage Boss AI Turn Routine Integration
 * 4. Warrior Reflect Shield Mutual Kill & Last Stand Resolution
 * 5. Question 10 Finishing Blow & Soft-Lock Prevention
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class ChallengerRunner {
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

    assert(cond, msg) {
      if (!cond) throw new Error(msg || 'Assertion failed');
    }

    assertEqual(actual, expected, msg) {
      if (actual !== expected) {
        throw new Error(`${msg || 'Assertion failed'}: expected [${expected}] (${typeof expected}) but got [${actual}] (${typeof actual})`);
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

  function runChallenger3StressTests() {
    const r = new ChallengerRunner();

    // ============================================================================
    // SUITE 1: Exhaustive DEF & ATK Monotonicity & Coercion
    // ============================================================================
    r.suite('1. Exhaustive DEF & ATK Monotonicity & Coercion');

    r.test('1.1 Exhaustive DEF Monotonicity sweep [0..500] across multiple ATK levels', () => {
      const atkLevels = [0, 5, 20, 50, 100, 275, 500];
      for (const atk of atkLevels) {
        let prevDmg = global.calculateMonsterDamage(atk, 0, 0);
        for (let def = 1; def <= 500; def++) {
          const dmg = global.calculateMonsterDamage(atk, def, 0);
          if (dmg > prevDmg) {
            throw new Error(`DEF Monotonicity violation at ATK ${atk}, DEF ${def}: dmg(${def})=${dmg} > dmg(${def-1})=${prevDmg}`);
          }
          prevDmg = dmg;
        }
      }
    });

    r.test('1.2 Exhaustive ATK Monotonicity sweep [0..500] across multiple DEF levels', () => {
      const defLevels = [0, 5, 10, 30, 60, 150];
      for (const def of defLevels) {
        let prevDmg = global.calculateMonsterDamage(0, def, 0);
        for (let atk = 1; atk <= 500; atk++) {
          const dmg = global.calculateMonsterDamage(atk, def, 0);
          if (dmg < prevDmg) {
            throw new Error(`ATK Monotonicity violation at DEF ${def}, ATK ${atk}: dmg(${atk})=${dmg} < dmg(${atk-1})=${prevDmg}`);
          }
          prevDmg = dmg;
        }
      }
    });

    r.test('1.3 Zero value preservation vs falsy coercion', () => {
      const dmgDef0 = global.calculateMonsterDamage(100, 0, 0);
      const dmgDef5 = global.calculateMonsterDamage(100, 5, 0);
      const dmgDef10 = global.calculateMonsterDamage(100, 10, 0);
      r.assert(dmgDef0 >= dmgDef5, `DEF 0 takes at least as much damage as DEF 5 (def0=${dmgDef0}, def5=${dmgDef5})`);
      r.assert(dmgDef5 >= dmgDef10, `DEF 5 takes at least as much damage as DEF 10 (def5=${dmgDef5}, def10=${dmgDef10})`);

      const dmgAtk0 = global.calculateMonsterDamage(0, 10, 0);
      const dmgAtk5 = global.calculateMonsterDamage(5, 10, 0);
      const dmgAtk20 = global.calculateMonsterDamage(20, 10, 0);
      r.assert(dmgAtk0 <= dmgAtk5, `ATK 0 deals at most as much damage as ATK 5 (atk0=${dmgAtk0}, atk5=${dmgAtk5})`);
      r.assert(dmgAtk5 <= dmgAtk20, `ATK 5 deals at most as much damage as ATK 20 (atk5=${dmgAtk5}, atk20=${dmgAtk20})`);
    });

    r.test('1.4 Edge-case and dirty input coercion resilience', () => {
      const dirtyInputs = [
        [null, null],
        [undefined, undefined],
        [NaN, NaN],
        ['', ''],
        ['abc', 'xyz'],
        [{}, []],
        [-100, -50],
        ['0', '0'],
        ['100', '25']
      ];
      for (const [rawAtk, heroDef] of dirtyInputs) {
        const dmg = global.calculateMonsterDamage(rawAtk, heroDef, 0);
        r.assert(typeof dmg === 'number' && !isNaN(dmg) && isFinite(dmg), `Result must be finite number for input (${rawAtk}, ${heroDef})`);
        r.assert(dmg >= 8, `Damage must respect floor 8, got ${dmg} for (${rawAtk}, ${heroDef})`);
      }
    });

    // ============================================================================
    // SUITE 2: Enraged Boss State Machine & Charging Cycle
    // ============================================================================
    r.suite('2. Enraged Boss State Machine & Charging Cycle');

    r.test('2.1 Normal Boss 100-turn charging cycle simulation', () => {
      const boss = {
        isBoss: true,
        name: 'Trùm Thường',
        hp: 1000,
        maxHp: 1000,
        atk: 50,
        enraged: false,
        isCharging: false,
        turnCount: 0
      };
      const engine = Object.create(global.BattleEngine);
      engine.monster = boss;
      engine.addFloatDamage = () => {};

      let totalCharges = 0;
      let totalStrikes = 0;

      for (let t = 1; t <= 100; t++) {
        const wasCharging = boss.isCharging;
        engine.processBossTurnCycle();
        if (!wasCharging && boss.isCharging) {
          totalCharges++;
          r.assertEqual(t % 2, 1, `Normal boss should charge on odd turn ${t}`);
        } else if (wasCharging && !boss.isCharging) {
          totalStrikes++;
          r.assertEqual(t % 2, 0, `Normal boss should strike on even turn ${t}`);
        }
      }
      r.assertEqual(totalCharges, 50, 'Normal boss charges exactly 50 times over 100 turns');
      r.assertEqual(totalStrikes, 50, 'Normal boss strikes exactly 50 times over 100 turns');
    });

    r.test('2.2 Enraged Boss 100-turn charging cycle simulation', () => {
      const boss = {
        isBoss: true,
        name: 'Trùm Cuồng Nộ',
        hp: 400,
        maxHp: 1000,
        atk: 80,
        enraged: true,
        isCharging: false,
        turnCount: 1 // Suppose starting after turn 1
      };
      const engine = Object.create(global.BattleEngine);
      engine.monster = boss;
      engine.addFloatDamage = () => {};

      let totalCharges = 0;
      let totalStrikes = 0;

      for (let t = 1; t <= 100; t++) {
        const wasCharging = boss.isCharging;
        engine.processBossTurnCycle();
        if (!wasCharging && boss.isCharging) {
          totalCharges++;
        } else if (wasCharging && !boss.isCharging) {
          totalStrikes++;
        }
      }
      r.assert(totalCharges >= 45, `Enraged boss must charge frequently (got ${totalCharges})`);
      r.assert(totalStrikes >= 45, `Enraged boss must strike frequently (got ${totalStrikes})`);
      r.assert(totalCharges + totalStrikes === 100, `Every turn must be either a charge or a strike, got ${totalCharges + totalStrikes}`);
    });

    r.test('2.3 Mid-battle Enrage Transition during charging', () => {
      const boss = {
        isBoss: true,
        name: 'Trùm Biến Chuyển',
        hp: 600,
        maxHp: 1000,
        atk: 50,
        enraged: false,
        isCharging: false,
        turnCount: 0
      };
      const engine = Object.create(global.BattleEngine);
      engine.monster = boss;
      engine.addFloatDamage = () => {};

      // Turn 1: Normal boss charges
      engine.processBossTurnCycle();
      r.assertEqual(boss.isCharging, true, 'Turn 1: boss begins charge');
      r.assertEqual(boss.enraged, false, 'Turn 1: boss not enraged');

      // Mid-turn: Player damages boss down to 40% HP
      boss.hp = 400;

      // Turn 2: Boss processes turn cycle with low HP
      engine.processBossTurnCycle();
      r.assertEqual(boss.enraged, true, 'Turn 2: enrage triggered');
      r.assertEqual(boss.atk, Math.round(50 * 1.25), 'Turn 2: ATK boosted by +25%');
      r.assertEqual(boss.isCharging, false, 'Turn 2: charge successfully unleashed despite enrage transition');
    });

    r.test('2.4 Freeze interrupt properly resets charging and consumes freeze status', () => {
      const boss = {
        isBoss: true,
        name: 'Trùm Đóng Băng',
        hp: 400,
        maxHp: 1000,
        atk: 60,
        enraged: true,
        isCharging: true,
        frozen: true,
        turnCount: 2
      };
      const engine = Object.create(global.BattleEngine);
      engine.monster = boss;
      engine.addFloatDamage = () => {};

      engine.processBossTurnCycle();
      r.assertEqual(boss.frozen, false, 'Freeze status consumed');
      r.assertEqual(boss.isCharging, false, 'Charging cancelled by freeze');
    });

    // ============================================================================
    // SUITE 3: Ranger Arrow Barrage Boss AI Integration
    // ============================================================================
    r.suite('3. Ranger Arrow Barrage Boss AI Integration');

    r.test('3.1 Arrow Barrage triggers Boss Mega Strike when boss is charging', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Ma Vương Viễn Xạ',
        hp: 800,
        maxHp: 1000,
        atk: 60,
        isCharging: true,
        turnCount: 1,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.pendingArrowBarrage = true;
      engine.pendingSkillParams = { hits: 2, multPerHit: 1.1, ignoreDefPercent: 0.4 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.slashes = [];

      engine.onHeroStrikeConnect();

      r.assertEqual(engine.monster.isCharging, false, 'Boss charging state consumed by Arrow Barrage AI cycle');
      r.assertEqual(engine.monster.turnCount, 2, 'Turn count incremented');
    });

    r.test('3.2 Arrow Barrage triggers Boss Charge when boss is ready to charge', () => {
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Ma Vương Viễn Xạ',
        hp: 800,
        maxHp: 1000,
        atk: 60,
        isCharging: false,
        turnCount: 0,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.pendingArrowBarrage = true;
      engine.pendingSkillParams = { hits: 2, multPerHit: 1.1, ignoreDefPercent: 0.4 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.slashes = [];

      engine.onHeroStrikeConnect();

      r.assertEqual(engine.monster.turnCount, 1, 'Turn count incremented to 1');
      r.assertEqual(engine.monster.isCharging, true, 'Boss initiates charging on Turn 1 under Arrow Barrage');
    });

    r.test('3.3 Arrow Barrage lethal execution triggers death explosion and skips Boss AI', () => {
      let deathExplosionTriggered = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Ma Vương Tàn Máu',
        hp: 5, // Very low HP
        maxHp: 1000,
        atk: 60,
        def: 0,
        isCharging: true,
        turnCount: 1,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.pendingArrowBarrage = true;
      engine.pendingSkillParams = { hits: 2, multPerHit: 1.1, ignoreDefPercent: 0.4 };
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.slashes = [];
      engine.triggerMonsterDeathExplosion = () => { deathExplosionTriggered = true; };

      engine.onHeroStrikeConnect();

      r.assertEqual(engine.monster.hp, 0, 'Monster HP reduced to 0');
      r.assertEqual(deathExplosionTriggered, true, 'Death explosion triggered on lethal Arrow Barrage');
    });

    // ============================================================================
    // SUITE 4: Warrior Reflect Shield Mutual Kill & Last Stand Resolution
    // ============================================================================
    r.suite('4. Warrior Reflect Shield Mutual Kill & Last Stand');

    r.test('4.1 Mutual Kill with Warrior Last Stand available: hero survives at 1 HP', () => {
      let fallenCalled = false;
      let explosionCalled = false;

      global.currentRpgUser = {
        rpg_class: 'warrior',
        skills_unlocked: { passive_2: true },
        inventory: {},
        hp: 5
      };

      const engine = Object.create(global.BattleEngine);
      engine.hero = { hp: 5, x: 100, y: 100 };
      engine.monster = { hp: 50, atk: 100, isBoss: false, x: 200, y: 100, element: 'fire' };
      engine.pendingReflectShield = true;
      engine.pendingSkillParams = { effect: 'reflect_shield', mitigation: 0.8, reflect: 1.0 };
      engine.lastStandUsed = false;
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };
      engine.onHeroFallen = () => { fallenCalled = true; };

      const origRandom = Math.random;
      Math.random = () => 0.5; // Ensure no random dodge
      try {
        engine.onMonsterStrikeConnect();
      } finally {
        Math.random = origRandom;
      }

      r.assertEqual(explosionCalled, true, 'Monster death explosion triggered by reflected damage');
      r.assertEqual(engine.lastStandUsed, true, 'Warrior Last Stand consumed');
      r.assertEqual(engine.hero.hp, 1, 'Hero HP retained at 1 via Last Stand');
      r.assertEqual(fallenCalled, false, 'onHeroFallen must NOT be called when Last Stand triggers');
    });

    r.test('4.2 Mutual Kill with Last Stand already used: hero falls', () => {
      let fallenCalled = false;
      let explosionCalled = false;

      global.currentRpgUser = {
        rpg_class: 'warrior',
        skills_unlocked: { passive_2: true },
        inventory: {},
        hp: 5
      };

      const engine = Object.create(global.BattleEngine);
      engine.hero = { hp: 5, x: 100, y: 100 };
      engine.monster = { hp: 50, atk: 100, isBoss: false, x: 200, y: 100, element: 'fire' };
      engine.pendingReflectShield = true;
      engine.pendingSkillParams = { effect: 'reflect_shield', mitigation: 0.8, reflect: 1.0 };
      engine.lastStandUsed = true; // Already consumed
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };
      engine.onHeroFallen = () => { fallenCalled = true; };

      const origRandom = Math.random;
      Math.random = () => 0.5;
      try {
        engine.onMonsterStrikeConnect();
      } finally {
        Math.random = origRandom;
      }

      r.assertEqual(explosionCalled, true, 'Monster death explosion triggered');
      r.assertEqual(engine.hero.hp, 0, 'Hero HP drops to 0');
      r.assertEqual(fallenCalled, true, 'onHeroFallen MUST be called when hero dies in mutual kill without Last Stand');
    });

    r.test('4.3 Mutual Kill as Non-Warrior (e.g. Mage): hero falls cleanly', () => {
      let fallenCalled = false;
      let explosionCalled = false;

      global.currentRpgUser = {
        rpg_class: 'mage',
        skills_unlocked: {},
        inventory: {},
        hp: 5
      };

      const engine = Object.create(global.BattleEngine);
      engine.hero = { hp: 5, x: 100, y: 100 };
      engine.monster = { hp: 50, atk: 100, isBoss: false, x: 200, y: 100, element: 'fire' };
      engine.pendingReflectShield = true;
      engine.pendingSkillParams = { effect: 'reflect_shield', mitigation: 0.8, reflect: 1.0 };
      engine.lastStandUsed = false;
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };
      engine.onHeroFallen = () => { fallenCalled = true; };

      const origRandom = Math.random;
      Math.random = () => 0.5;
      try {
        engine.onMonsterStrikeConnect();
      } finally {
        Math.random = origRandom;
      }

      r.assertEqual(explosionCalled, true, 'Monster death explosion triggered');
      r.assertEqual(engine.hero.hp, 0, 'Mage hero HP drops to 0');
      r.assertEqual(fallenCalled, true, 'onHeroFallen called for non-warrior class');
    });

    // ============================================================================
    // SUITE 5: Question 10 Finishing Blow & Soft-Lock Prevention
    // ============================================================================
    r.suite('5. Question 10 Finishing Blow & Soft-Lock Prevention');

    r.test('5.1 Finishing blow with quiz exhausted executes boss to 0 regardless of boss HP', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Trùm Vĩ Đại',
        hp: 3500, // Full 3500 HP
        maxHp: 3500
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.addFloatDamage = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const executed = engine.triggerHeroFinishingBlow(true); // isQuizExhausted = true

      r.assertEqual(executed, true, 'Finishing blow returns true on quiz exhausted');
      r.assertEqual(engine.monster.hp, 0, 'Boss HP executed to 0');
      r.assertEqual(explosionCalled, true, 'Monster death explosion called');
    });

    r.test('5.2 Finishing blow with boss HP <= 20% executes boss even if quiz NOT exhausted', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Trùm Yếu',
        hp: 150, // <= 20% of 1000
        maxHp: 1000
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.addFloatDamage = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const executed = engine.triggerHeroFinishingBlow(false); // isQuizExhausted = false

      r.assertEqual(executed, true, 'Finishing blow executes on low boss HP');
      r.assertEqual(engine.monster.hp, 0, 'Boss HP executed to 0');
      r.assertEqual(explosionCalled, true, 'Monster death explosion called');
    });

    r.test('5.3 Finishing blow with boss HP > 20% and quiz NOT exhausted deals damage & retaliates', () => {
      let explosionCalled = false;
      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        isBoss: true,
        name: 'Trùm Khỏe',
        hp: 800, // > 20% of 1000
        maxHp: 1000,
        state: 'idle'
      };
      engine.hero = { state: 'idle', x: 100, y: 100 };
      engine.addFloatDamage = () => {};
      engine.updateBattleUI = () => {};
      engine.triggerMonsterDeathExplosion = () => { explosionCalled = true; };

      const executed = engine.triggerHeroFinishingBlow(false);

      r.assertEqual(executed, false, 'Finishing blow returns false when boss is healthy');
      r.assert(engine.monster.hp > 0, `Boss survives with ${engine.monster.hp} HP`);
      r.assertEqual(engine.monster.state, 'attacking', 'Boss retaliates');
      r.assertEqual(explosionCalled, false, 'Death explosion NOT called');
    });

    return r.getSummary();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runChallenger3StressTests };
  }
  if (typeof window !== 'undefined') {
    window.runChallenger3StressTests = runChallenger3StressTests;
  }
})(typeof window !== 'undefined' ? window : global);
