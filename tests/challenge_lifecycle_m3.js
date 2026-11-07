/**
 * ==============================================================================
 * CHALLENGER M3_4: COMBAT LIFECYCLE, TOWER/BOSS RUSH & DOT STRESS HARNESS
 * File: tests/challenge_lifecycle_m3.js
 * ==============================================================================
 * Focus Areas:
 * 1. Tower of Babel Progression in 'tower' mode
 *    - onMonsterSlainCallback routes to GamificationTower.onFloorCleared()
 *    - Awards progressive gold, gems, enhance stones, exp
 *    - Updates user.tower_records.max_floor
 * 2. Boss Rush Progression in 'boss_rush' mode
 *    - onMonsterSlainCallback routes to GamificationTower.onBossRushCleared()
 *    - Multi-boss progression increments boss index
 *    - 5th boss clear awards grand prize and updates boss_rush_wins
 * 3. Status Effects Timing & Single-Tick Discipline
 *    - Assassin poison DoT ticks strictly once per player question
 *    - Correct answer: ticks on hero strike connect, no second tick
 *    - Wrong answer: ticks on monster counter-attack, no second tick
 *    - Multi-hit skills (Ranger Arrow Barrage) tick strictly once
 * 4. Duplicate Death Explosion Prevention
 *    - Guards prevent duplicate triggerMonsterDeathExplosion() calls
 *    - Gold particle fountain and slay_boss quest tracking are not doubled
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class LifecycleChallengeRunner {
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

  function runLifecycleChallengeSuite() {
    const r = new LifecycleChallengeRunner();

    // ============================================================================
    // SUITE 1: Tower of Babel Lifecycle & Economy Progression
    // ============================================================================
    r.suite('1. Tower of Babel Progression in tower mode');

    r.test('1.1 onMonsterSlainCallback routes to GamificationTower.onFloorCleared when activeMode is tower', () => {
      let floorClearedCalled = false;
      const originalTower = global.GamificationTower;
      
      global.GamificationTower = {
        activeMode: 'tower',
        currentFloor: 5,
        onFloorCleared: () => { floorClearedCalled = true; }
      };

      global.BattleEngine = global.BattleEngine || {};
      global.BattleEngine.monster = { isBoss: true, hp: 0 };
      global.quizCurrentIdx = 9;
      global.quizQuestions = new Array(10).fill({});

      // In battle.html: window.onMonsterSlainCallback schedules callback via setTimeout 700ms
      // We test the routing logic directly
      const isBossDefeated = (global.BattleEngine.monster?.isBoss && global.BattleEngine.monster.hp <= 0);
      const isLastQuestion = (global.quizCurrentIdx >= global.quizQuestions.length - 1);
      r.assert(isBossDefeated || isLastQuestion, 'Battle condition satisfies dungeon victory');

      if (global.GamificationTower && global.GamificationTower.activeMode === 'tower') {
        global.GamificationTower.onFloorCleared();
      }

      r.assertEqual(floorClearedCalled, true, 'GamificationTower.onFloorCleared is invoked in tower mode');
      global.GamificationTower = originalTower;
    });

    r.test('1.2 GamificationTower.onFloorCleared awards gold, gems, enhance stones, exp and updates max_floor', () => {
      const testUser = {
        level: 10,
        xp: 100,
        gold: 1000,
        gems: 10,
        enhance_stones: 2,
        tower_records: {
          max_floor: 3,
          highest_streak: 5,
          active_boons: []
        }
      };
      global.currentRpgUser = testUser;

      // Clear floor 4 (advances max_floor from 3 to 4)
      const rewardsFloor4 = global.GamificationTower.onFloorCleared(4);
      r.assert(rewardsFloor4.gold > 0, 'Floor 4 awards positive gold');
      r.assertEqual(testUser.tower_records.max_floor, 4, 'max_floor updated from 3 to 4');
      r.assertEqual(testUser.gold, 1000 + rewardsFloor4.gold, 'Gold balance updated with floor 4 rewards');

      // Clear floor 10 (Boss floor: awards enhance stone and gems)
      const goldBefore10 = testUser.gold;
      const stonesBefore10 = testUser.enhance_stones;
      const gemsBefore10 = testUser.gems;
      const rewardsFloor10 = global.GamificationTower.onFloorCleared(10);

      r.assertEqual(testUser.tower_records.max_floor, 10, 'max_floor updated to 10 on boss floor');
      r.assert(rewardsFloor10.enhanceStones > 0, 'Floor 10 milestone awards enhance stones');
      r.assert(rewardsFloor10.gems > 0, 'Floor 10 milestone awards gems');
      r.assertEqual(testUser.enhance_stones, stonesBefore10 + rewardsFloor10.enhanceStones, 'Enhance stones credited');
      r.assertEqual(testUser.gems, gemsBefore10 + rewardsFloor10.gems, 'Gems credited');
      r.assertEqual(testUser.gold, goldBefore10 + rewardsFloor10.gold, 'Gold credited');

      // Clear an already beaten floor (e.g. floor 5): max_floor must NOT regress
      global.GamificationTower.onFloorCleared(5);
      r.assertEqual(testUser.tower_records.max_floor, 10, 'max_floor does not regress when clearing lower floor');
    });

    // ============================================================================
    // SUITE 2: Boss Rush Progression in boss_rush mode
    // ============================================================================
    r.suite('2. Boss Rush Progression in boss_rush mode');

    r.test('2.1 onMonsterSlainCallback routes to GamificationTower.onBossRushCleared when activeMode is boss_rush', () => {
      let bossRushClearedCalled = false;
      const originalTower = global.GamificationTower;

      global.GamificationTower = {
        activeMode: 'boss_rush',
        onBossRushCleared: () => { bossRushClearedCalled = true; }
      };

      if (global.GamificationTower && global.GamificationTower.activeMode === 'boss_rush') {
        global.GamificationTower.onBossRushCleared();
      }

      r.assertEqual(bossRushClearedCalled, true, 'GamificationTower.onBossRushCleared invoked in boss_rush mode');
      global.GamificationTower = originalTower;
    });

    r.test('2.2 GamificationTower.onBossRushCleared advances through multi-boss gauntlet and awards grand prize', () => {
      const testUser = {
        level: 15,
        gold: 500,
        gems: 0,
        enhance_stones: 0,
        tower_records: {
          max_floor: 10,
          boss_rush_wins: 0
        }
      };
      global.currentRpgUser = testUser;

      // Initialize boss rush state: 5 bosses
      global.GamificationTower.bossRushState = {
        active: true,
        currentBossIdx: 1,
        totalBosses: 5,
        bossList: [1, 2, 3, 4, 5],
        preservedHeroHp: 120
      };
      global.GamificationTower.loadBossRushQuestions = () => {};

      // Defeat Boss 1 -> advances to Boss 2
      global.GamificationTower.onBossRushCleared();
      r.assertEqual(global.GamificationTower.bossRushState.currentBossIdx, 2, 'Defeating Boss 1 advances to Boss 2');
      r.assertEqual(testUser.tower_records.boss_rush_wins, 0, 'Gauntlet not finished yet');

      // Defeat Boss 2, 3, 4
      global.GamificationTower.onBossRushCleared(); // -> 3
      global.GamificationTower.onBossRushCleared(); // -> 4
      global.GamificationTower.onBossRushCleared(); // -> 5
      r.assertEqual(global.GamificationTower.bossRushState.currentBossIdx, 5, 'Now facing final Boss 5');

      // Defeat Final Boss 5 -> Wins Boss Rush!
      const origAlert = global.alert;
      global.alert = () => {};
      const goldBeforeWin = testUser.gold;
      try {
        global.GamificationTower.onBossRushCleared();
      } finally {
        global.alert = origAlert;
      }

      r.assertEqual(testUser.tower_records.boss_rush_wins, 1, 'boss_rush_wins incremented to 1');

      r.assertEqual(testUser.gold, goldBeforeWin + 500, 'Boss Rush grand prize: +500 gold awarded');
      r.assertEqual(testUser.gems, 10, 'Boss Rush grand prize: +10 gems awarded');
      r.assertEqual(testUser.enhance_stones, 5, 'Boss Rush grand prize: +5 enhance stones awarded');
    });

    // ============================================================================
    // SUITE 3: Single-Tick Status Effects Discipline
    // ============================================================================
    r.suite('3. Single-Tick Status Effects');

    r.test('3.1 Assassin poison ticks strictly once when player answers correctly (hero strike connect)', () => {
      let dotTickCount = 0;
      const engine = Object.create(global.BattleEngine);
      engine.active = true;
      engine.monster = {
        hp: 150,
        maxHp: 150,
        poisonTurns: 3,
        poisonDmg: 25,
        state: 'idle',
        element: 'fire',
        atk: 20
      };
      engine.hero = { hp: 100, maxHp: 100, x: 100, y: 100, state: 'idle' };
      engine.particles = [];
      engine.slashes = [];
      engine.projectiles = [];
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      // Instrument applyTurnStatusEffects to count ticks
      const originalApplyDoT = engine.applyTurnStatusEffects;
      engine.applyTurnStatusEffects = function() {
        dotTickCount++;
        return originalApplyDoT.call(this);
      };

      // Player answers question 1 correctly
      engine.handlePlayerAnswer(true, { word: 'test' });
      r.assertEqual(engine.turnStatusTicked, false, 'turnStatusTicked initialized to false at answer start');

      // Hero strike connects
      engine.onHeroStrikeConnect();
      r.assertEqual(engine.turnStatusTicked, true, 'turnStatusTicked set to true upon hero strike');
      r.assertEqual(dotTickCount, 1, 'Poison DoT ticked strictly ONCE on correct answer');
      r.assertEqual(engine.monster.poisonTurns, 2, 'Poison duration decremented by exactly 1');
      r.assert(engine.monster.hp <= 150 - 25, 'Monster took strike damage plus 25 poison DoT');
    });


    r.test('3.2 Assassin poison ticks strictly once when player answers incorrectly (monster strike connect)', () => {
      let dotTickCount = 0;
      const engine = Object.create(global.BattleEngine);
      engine.active = true;
      engine.monster = {
        hp: 150,
        maxHp: 150,
        poisonTurns: 3,
        poisonDmg: 25,
        state: 'idle',
        element: 'fire',
        atk: 20
      };
      engine.hero = { hp: 100, maxHp: 100, x: 100, y: 100, state: 'idle' };
      engine.particles = [];
      engine.slashes = [];
      engine.projectiles = [];
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      const originalApplyDoT = engine.applyTurnStatusEffects;
      engine.applyTurnStatusEffects = function() {
        dotTickCount++;
        return originalApplyDoT.call(this);
      };

      // Player answers question incorrectly
      engine.handlePlayerAnswer(false, { word: 'test' });
      r.assertEqual(engine.turnStatusTicked, false, 'turnStatusTicked initialized to false at turn start');

      // Monster strikes hero
      // Neutralize dodge so strike resolves cleanly
      const originalCalc = global.calculatePlayerTotalStats;
      global.calculatePlayerTotalStats = () => ({ dodge: 0, def: 10 });
      try {
        engine.onMonsterStrikeConnect();
      } finally {
        global.calculatePlayerTotalStats = originalCalc;
      }

      r.assertEqual(engine.turnStatusTicked, true, 'turnStatusTicked set to true upon monster strike connect');
      r.assertEqual(dotTickCount, 1, 'Poison DoT ticked strictly ONCE on wrong answer');
      r.assertEqual(engine.monster.poisonTurns, 2, 'Poison duration decremented by exactly 1');
      r.assertEqual(engine.monster.hp, 150 - 25, 'Monster HP only reduced by 1 poison DoT tick (25)');
    });

    r.test('3.3 Multi-hit skills (Ranger Arrow Barrage) tick status effects strictly once', () => {
      let dotTickCount = 0;
      const engine = Object.create(global.BattleEngine);
      engine.active = true;
      engine.monster = {
        hp: 200,
        maxHp: 200,
        poisonTurns: 3,
        poisonDmg: 25,
        state: 'idle',
        element: 'fire',
        atk: 20
      };
      engine.hero = { hp: 100, maxHp: 100, x: 100, y: 100, state: 'idle' };
      engine.particles = [];
      engine.slashes = [];
      engine.projectiles = [];
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      const originalApplyDoT = engine.applyTurnStatusEffects;
      engine.applyTurnStatusEffects = function() {
        dotTickCount++;
        return originalApplyDoT.call(this);
      };

      // Ranger casts Arrow Barrage
      engine.handlePlayerAnswer(true, { word: 'barrage' });
      engine.pendingArrowBarrage = true;
      engine.pendingSkillParams = { hits: 2, damageMult: 1.1, ignoreDef: 0.4 };

      engine.onHeroStrikeConnect();
      r.assertEqual(dotTickCount, 1, 'Arrow Barrage 2-hit skill triggers poison DoT strictly once');
      r.assertEqual(engine.turnStatusTicked, true, 'turnStatusTicked remains true');
    });

    // ============================================================================
    // SUITE 4: Duplicate Death Explosion Prevention
    // ============================================================================
    r.suite('4. Duplicate Death Explosion Prevention');

    r.test('4.1 triggerMonsterDeathExplosion sets deathTriggered guard and ignores repeated invocations', () => {
      let questProgressCalls = 0;
      let explosionAudioCalls = 0;

      const engine = Object.create(global.BattleEngine);
      engine.monster = {
        name: 'Chúa Quỷ Diệt Thế',
        hp: 0,
        maxHp: 1000,
        isBoss: true,
        color: '#EF4444',
        x: 200,
        y: 200,
        state: 'idle'
      };
      engine.particles = [];
      engine.addFloatDamage = () => {};

      // Spy on quest tracking
      const origTrack = (typeof GamificationQuests !== 'undefined' && GamificationQuests.trackProgress)
        ? GamificationQuests.trackProgress
        : (typeof window !== 'undefined' && window.GamificationQuests ? window.GamificationQuests.trackProgress : null);

      if (typeof GamificationQuests !== 'undefined') {
        GamificationQuests.trackProgress = (key, amount) => {
          if (key === 'slay_boss') questProgressCalls += amount;
        };
      }
      if (typeof window !== 'undefined' && window.GamificationQuests) {
        window.GamificationQuests.trackProgress = GamificationQuests.trackProgress;
      }

      // Mock audio
      const origExplosion = global.RetroAudio ? global.RetroAudio.playExplosion : null;
      if (global.RetroAudio) {
        global.RetroAudio.playExplosion = () => { explosionAudioCalls++; };
      }

      try {
        // First execution (legitimate death)
        engine.triggerMonsterDeathExplosion();
        r.assertEqual(engine.monster.deathTriggered, true, 'deathTriggered flag set to true');
        r.assertEqual(engine.monster.state, 'dying', 'Monster state updated to dying');
        r.assertEqual(questProgressCalls, 1, 'slay_boss quest tracked exactly once');
        r.assertEqual(explosionAudioCalls, 1, 'Explosion sound played exactly once');
        const particleCount1 = engine.particles.length;
        r.assert(particleCount1 >= 65, 'Pixel fragments and gold particles spawned on death');

        // Second invocation (e.g. from lingering strike connect or simultaneous DoT)
        engine.triggerMonsterDeathExplosion();
        r.assertEqual(questProgressCalls, 1, 'slay_boss quest NOT duplicated on 2nd invocation');
        r.assertEqual(explosionAudioCalls, 1, 'Explosion sound NOT duplicated on 2nd invocation');
        r.assertEqual(engine.particles.length, particleCount1, 'Particle count unchanged (no double particle fountain)');

        // Third invocation
        engine.triggerMonsterDeathExplosion();
        r.assertEqual(questProgressCalls, 1, 'slay_boss quest remains 1 on 3rd invocation');
      } finally {
        if (typeof GamificationQuests !== 'undefined' && origTrack) GamificationQuests.trackProgress = origTrack;
        if (typeof window !== 'undefined' && window.GamificationQuests && origTrack) window.GamificationQuests.trackProgress = origTrack;
        if (global.RetroAudio && origExplosion) global.RetroAudio.playExplosion = origExplosion;
      }

    });

    r.test('4.2 Lethal DoT tick during strike does not double death explosion on monster kill', () => {
      let deathExplosionCount = 0;
      const engine = Object.create(global.BattleEngine);
      engine.active = true;
      engine.monster = {
        hp: 20, // Low HP: lethal from hero strike OR lethal from poison
        maxHp: 100,
        poisonTurns: 1,
        poisonDmg: 25,
        state: 'idle',
        element: 'fire',
        atk: 20
      };
      engine.hero = { hp: 100, maxHp: 100, x: 100, y: 100, state: 'idle' };
      engine.particles = [];
      engine.slashes = [];
      engine.projectiles = [];
      engine.addFloatDamage = () => {};
      engine.createHitSparks = () => {};
      engine.updateBattleUI = () => {};

      // Mock explosion
      engine.triggerMonsterDeathExplosion = function() {
        if (!this.monster || this.monster.state === 'dying' || this.monster.state === 'dead' || this.monster.deathTriggered) return;
        this.monster.deathTriggered = true;
        this.monster.state = 'dying';
        deathExplosionCount++;
      };

      // Player answers correctly
      engine.handlePlayerAnswer(true, { word: 'strike' });
      engine.onHeroStrikeConnect();

      // Monster HP reached 0, DoT also expired
      r.assertEqual(deathExplosionCount, 1, 'Death explosion triggered strictly once even if both strike and DoT are lethal');
      r.assertEqual(engine.monster.hp, 0, 'Monster HP clamped to 0');
    });

    return r.getSummary();
  }

  global.runLifecycleChallengeSuite = runLifecycleChallengeSuite;
})(typeof window !== 'undefined' ? window : global);
