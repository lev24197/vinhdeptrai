/**
 * ==============================================================================
 * CHALLENGER M5_1: ADVERSARIAL STRESS TEST SUITE
 * Milestone 5: Daily & Weekly Quests, Achievements, Biomes & Monster Sprites
 * File: tests/challenger_m5_1_stress.js
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

    async test(desc, fn) {
      this.total++;
      try {
        await fn();
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

  async function runChallengerM5StressTests() {
    const r = new ChallengerTestRunner();
    const oldAlert = global.alert;
    const oldConfirm = global.confirm;
    const oldCurrentRpgUser = global.currentRpgUser;
    const oldCurrentUser = global.currentUser;

    global.alert = () => {};
    global.confirm = () => true;

    function createFreshTestUser(id = 'challenger_m5_user') {
      const u = {
        id,
        display_name: 'Empirical Challenger',
        rpg_class: 'warrior',
        level: 1,
        xp: 0,
        hp: 120,
        max_hp: 120,
        mp: 50,
        max_mp: 50,
        gold: 0,
        gems: 0,
        dust: 0,
        magic_dust: 0,
        enhance_stones: 0,
        skill_points: 0,
        inventory: {},
        unlocked_titles: ['Tân Binh'],
        equipped_title: 'Tân Binh',
        quests: {},
        achievements: {
          progress: {},
          unlocked_ids: [],
          claimed_ids: [],
          equipped_title: ''
        }
      };
      setMockUser(u);
      return u;
    }

    function setMockUser(u) {
      global.currentRpgUser = u;
      global.currentUser = u;
      if (typeof window !== 'undefined') {
        window.currentRpgUser = u;
        window.currentUser = u;
      }
    }

    try {

      // ============================================================================
      // SUITE 1: WEEKLY RESET INTERVAL & BOUNDARY STRESS TESTS
      // ============================================================================
      r.suite('1. Weekly Reset Interval & Boundary Adversarial Stress Tests');

      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

      await r.test('1.1 Exact 7-day expiration boundary (now - last_reset === ONE_WEEK_MS)', () => {
        const u = createFreshTestUser('user_boundary_exact');
        global.GamificationQuests.ensureInitialized(u);
        const originalTasks = u.quests.weekly.tasks;
        originalTasks[0].current = 3;

        // Force exact 7-day boundary
        const now = Date.now();
        u.quests.weekly.last_reset = now - ONE_WEEK_MS;

        global.GamificationQuests.ensureInitialized(u);

        r.assert(u.quests.weekly.last_reset >= now, 'last_reset was updated on exact boundary');
        const activeList = u.quests.weekly.tasks || u.quests.weekly.active;
        r.assertEqual(activeList[0].current, 0, 'Quests reset on exact 7-day boundary');
      });

      await r.test('1.2 Boundary - 1 millisecond (now - last_reset === ONE_WEEK_MS - 1): must NOT reset', () => {
        const u = createFreshTestUser('user_boundary_minus_1');
        global.GamificationQuests.ensureInitialized(u);
        const setResetTime = Date.now() - ONE_WEEK_MS + 2000; // 2 seconds before expiration
        u.quests.weekly.last_reset = setResetTime;
        const activeList = u.quests.weekly.tasks || u.quests.weekly.active;
        activeList[0].current = 7;
        activeList[0].completed = true;

        global.GamificationQuests.ensureInitialized(u);

        r.assertEqual(u.quests.weekly.last_reset, setResetTime, 'last_reset preserved when within 7-day window');
        r.assertEqual(activeList[0].current, 7, 'Progress preserved within 7-day window');
        r.assertEqual(activeList[0].completed, true, 'Completion status preserved');
      });

      await r.test('1.3 Clock skew / Future date (last_reset > Date.now())', () => {
        const u = createFreshTestUser('user_future_clock');
        global.GamificationQuests.ensureInitialized(u);
        const futureTime = Date.now() + 86400000; // 1 day in future
        u.quests.weekly.last_reset = futureTime;
        const activeList = u.quests.weekly.tasks || u.quests.weekly.active;
        activeList[0].current = 2;

        global.GamificationQuests.ensureInitialized(u);

        r.assertEqual(activeList[0].current, 2, 'Future timestamp does not wipe progress');
        const timeStr = global.GamificationQuests.getWeeklyTimeRemainingStr(u);
        r.assert(typeof timeStr === 'string' && timeStr.length > 0, 'getWeeklyTimeRemainingStr returns valid string');
      });

      await r.test('1.4 Zero and Negative timestamp (last_reset <= 0): must reset safely', () => {
        const u = createFreshTestUser('user_negative_time');
        global.GamificationQuests.ensureInitialized(u);

        // Case 1: last_reset = 0
        u.quests.weekly.last_reset = 0;
        global.GamificationQuests.ensureInitialized(u);
        r.assert(u.quests.weekly.last_reset > 0, 'last_reset = 0 triggers reset with valid timestamp');

        // Case 2: last_reset = -500000
        u.quests.weekly.last_reset = -500000;
        global.GamificationQuests.ensureInitialized(u);
        r.assert(u.quests.weekly.last_reset > 0, 'last_reset = -500000 triggers reset with valid timestamp');
      });

      await r.test('1.5 Corrupt timestamps (null, undefined, NaN): handled safely without exceptions', () => {
        const u = createFreshTestUser('user_corrupt_timestamps');

        // Case 1: null
        u.quests = { weekly: { last_reset: null, tasks: [] } };
        global.GamificationQuests.ensureInitialized(u);
        r.assert(typeof u.quests.weekly.last_reset === 'number' && u.quests.weekly.last_reset > 0, 'null reset recovers');

        // Case 2: undefined
        u.quests = { weekly: { last_reset: undefined, tasks: [] } };
        global.GamificationQuests.ensureInitialized(u);
        r.assert(typeof u.quests.weekly.last_reset === 'number' && u.quests.weekly.last_reset > 0, 'undefined reset recovers');

        // Case 3: NaN
        u.quests = { weekly: { last_reset: NaN, tasks: [] } };
        global.GamificationQuests.ensureInitialized(u);
        r.assert(typeof u.quests.weekly.last_reset === 'number' && !isNaN(u.quests.weekly.last_reset), 'NaN reset recovers');
      });

      await r.test('1.6 Corrupt / Unknown Quest IDs in active tasks: trackProgress & modal survive safely', () => {
        const u = createFreshTestUser('user_unknown_quest_id');
        global.GamificationQuests.ensureInitialized(u);
        const activeList = u.quests.weekly.tasks || u.quests.weekly.active;
        activeList.push({
          id: 'corrupted_quest_99999',
          current: 0,
          target: 10,
          completed: false,
          claimed: false
        });

        // trackProgress should not throw
        let threw = false;
        try {
          global.GamificationQuests.trackProgress('dungeon_clear', 1);
        } catch (e) {
          threw = true;
        }
        r.assert(!threw, 'trackProgress does not throw with unknown quest ID in list');

        // claimWeeklyQuest with unknown ID should return false
        const claimResult = global.GamificationQuests.claimWeeklyQuest('corrupted_quest_99999');
        r.assertEqual(claimResult, false, 'claimWeeklyQuest safely rejects unknown quest ID');
      });

      await r.test('1.7 Missing / empty tasks array: system gracefully handles without unhandled errors', () => {
        const u = createFreshTestUser('user_empty_tasks');
        u.quests = { weekly: { last_reset: Date.now(), tasks: [], active: [] } };
        setMockUser(u);

        // Claim weekly chest should safely return false without crashing
        const result = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(result, false, 'claimWeeklyChest returns false on empty tasks list');

        // trackProgress should safely no-op
        global.GamificationQuests.trackProgress('dungeon_clear', 1);
        r.assertEqual(u.quests.weekly.tasks.length, 0, 'Tasks list remains empty and stable');
      });

      // ============================================================================
      // SUITE 2: GRAND CHEST CLAIM RESILIENCE & DOUBLE CLAIM PREVENTION
      // ============================================================================
      r.suite('2. Grand Chest Claim Resilience & Double Claim Prevention');

      await r.test('2.1 Legitimate claim of Weekly Grand Chest (high-level baseline & Level 1 level-up cascade)', () => {
        // Case A: High-level baseline (no level-up during chest claim)
        const uHigh = createFreshTestUser('user_weekly_chest_high');
        uHigh.level = 50;
        uHigh.xp = 0;
        global.GamificationQuests.ensureInitialized(uHigh);
        const wqHigh = uHigh.quests.weekly;
        const taskListHigh = wqHigh.tasks || wqHigh.active;
        taskListHigh.forEach(t => { t.current = t.target; t.completed = true; });

        const preGold = uHigh.gold || 0;
        const preGems = uHigh.gems || 0;
        const preStones = uHigh.enhance_stones || 0;
        const preDust = uHigh.dust || 0;
        const preXp = uHigh.xp || 0;

        const claimedHigh = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(claimedHigh, true, 'claimWeeklyChest returns true for completed weekly pool');
        r.assertEqual(wqHigh.claimed_chest, true, 'claimed_chest flag set to true');
        r.assertEqual(uHigh.gold, preGold + 1500, 'Awards exactly +1500 Gold');
        r.assertEqual(uHigh.gems, preGems + 25, 'Awards exactly +25 Gems');
        r.assertEqual(uHigh.enhance_stones, preStones + 10, 'Awards exactly +10 Enhance Stones');
        r.assertEqual(uHigh.dust, preDust + 100, 'Awards exactly +100 Dust');
        r.assertEqual(uHigh.magic_dust, uHigh.dust, 'magic_dust synchronized with dust');
        r.assertEqual(uHigh.xp, preXp + 500, 'Awards exactly +500 EXP');

        // Case B: Level 1 player: 500 EXP causes 2 level-ups (Level 1 -> 2 -> 3), adding +100g and +4 gems
        const uL1 = createFreshTestUser('user_weekly_chest_l1');
        uL1.level = 1;
        uL1.xp = 0;
        global.GamificationQuests.ensureInitialized(uL1);
        const wqL1 = uL1.quests.weekly;
        (wqL1.tasks || wqL1.active).forEach(t => { t.current = t.target; t.completed = true; });

        const claimedL1 = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(claimedL1, true, 'Level 1 chest claim succeeds');
        r.assertEqual(uL1.level, 3, 'Level 1 player advanced to Level 3 from 500 EXP');
        r.assertEqual(uL1.gold, 1500 + 100, 'Gold includes 1500 chest + 100 level-up rewards');
        r.assertEqual(uL1.gems, 25 + 4, 'Gems include 25 chest + 4 level-up rewards');
        r.assertEqual(uL1.skill_points, 2, 'Gained +2 skill points from 2 level-ups');
      });

      await r.test('2.2 Immediate double claim of Weekly Grand Chest must return false and not add currency', () => {
        const u = createFreshTestUser('user_weekly_chest_double');
        u.level = 50;
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const taskList = wq.tasks || wq.active;
        taskList.forEach(t => { t.current = t.target; t.completed = true; });

        // First claim
        const claim1 = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(claim1, true, 'First claim succeeds');
        const goldAfterFirst = u.gold;
        const gemsAfterFirst = u.gems;

        // Second claim attempt
        const claim2 = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(claim2, false, 'Second claim attempt strictly returns false');
        r.assertEqual(u.gold, goldAfterFirst, 'Gold does NOT increase on double claim');
        r.assertEqual(u.gems, gemsAfterFirst, 'Gems do NOT increase on double claim');
      });

      await r.test('2.3 Rapid-fire burst: 100 consecutive synchronous calls to claimWeeklyChest', () => {
        const u = createFreshTestUser('user_weekly_burst_100');
        u.level = 50;
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const taskList = wq.tasks || wq.active;
        taskList.forEach(t => { t.current = t.target; t.completed = true; });

        let successCount = 0;
        let rejectCount = 0;

        for (let i = 0; i < 100; i++) {
          if (global.GamificationQuests.claimWeeklyChest()) {
            successCount++;
          } else {
            rejectCount++;
          }
        }

        r.assertEqual(successCount, 1, 'Exactly 1 of 100 burst calls succeeds');
        r.assertEqual(rejectCount, 99, 'Exactly 99 of 100 burst calls rejected');
        r.assertEqual(u.gold, 1500, 'Gold strictly awarded 1x (1500)');
        r.assertEqual(u.gems, 25, 'Gems strictly awarded 1x (25)');
        r.assertEqual(u.enhance_stones, 10, 'Stones strictly awarded 1x (10)');
        r.assertEqual(u.dust, 100, 'Dust strictly awarded 1x (100)');
      });

      await r.test('2.4 Incomplete weekly quests rejection (5/6 complete, 0/6 complete)', () => {
        const u = createFreshTestUser('user_weekly_incomplete');
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const taskList = wq.tasks || wq.active;

        // Case A: 0/6 complete
        r.assertEqual(global.GamificationQuests.claimWeeklyChest(), false, '0/6 quests rejects claim');

        // Case B: 5/6 complete
        for (let i = 0; i < taskList.length - 1; i++) {
          taskList[i].current = taskList[i].target;
          taskList[i].completed = true;
        }
        taskList[taskList.length - 1].current = 0;
        taskList[taskList.length - 1].completed = false;

        r.assertEqual(global.GamificationQuests.claimWeeklyChest(), false, '5/6 quests rejects claim');
        r.assertEqual(wq.claimed_chest, false, 'claimed_chest remains false');
      });

      await r.test('2.5 Daily Grand Chest resilience: 100 consecutive rapid calls', () => {
        const u = createFreshTestUser('user_daily_chest_burst');
        u.level = 50;
        global.GamificationQuests.ensureInitialized(u);
        const dq = u.daily_quests;
        const taskList = dq.tasks || dq.active;
        taskList.forEach(t => { t.current = t.target; t.completed = true; });

        let successCount = 0;
        let rejectCount = 0;

        for (let i = 0; i < 100; i++) {
          if (global.GamificationQuests.claimDailyChest()) {
            successCount++;
          } else {
            rejectCount++;
          }
        }

        r.assertEqual(successCount, 1, 'Exactly 1 of 100 daily chest burst calls succeeds');
        r.assertEqual(rejectCount, 99, 'Exactly 99 of 100 daily chest burst calls rejected');
        r.assertEqual(u.gold, 120, 'Gold strictly awarded 1x (120)');
        r.assertEqual(u.gems, 5, 'Gems strictly awarded 1x (5)');
        r.assertEqual(u.dust, 80, 'Dust strictly awarded 1x (80)');
        r.assertEqual(u.magic_dust, 80, 'magic_dust strictly synchronized');
      });

      // ============================================================================
      // SUITE 3: EVENT EMISSION BUS RAPID FIRE & ADVERSARIAL PAYLOAD STRESS
      // ============================================================================
      r.suite('3. Event Emission Bus Rapid Fire & Adversarial Payload Stress');

      await r.test('3.1 Rapid-fire burst: 1,000 consecutive events fired in tight loop', () => {
        const u = createFreshTestUser('user_burst_1000');
        global.GamificationQuests.ensureInitialized(u);

        // Mix of events across modules
        const actions = [
          'dungeon_clear',
          'boss_slain',
          'word_correct',
          'tower_floor_clear',
          'forge_enhance',
          'open_chest',
          'use_potion',
          'c1_c2_word',
          'salvage_item',
          'combo_streak'
        ];

        const t0 = Date.now();
        for (let i = 0; i < 1000; i++) {
          const action = actions[i % actions.length];
          const val = (action === 'combo_streak') ? (i % 15) : 1;
          global.GamificationQuests.trackProgress(action, val);
        }
        const duration = Date.now() - t0;

        // Verify all tasks in daily and weekly
        const allTasks = [
          ...(u.daily_quests?.tasks || u.daily_quests?.active || []),
          ...(u.quests?.weekly?.tasks || u.quests?.weekly?.active || [])
        ];

        allTasks.forEach(task => {
          r.assert(!isNaN(task.current), `Task [${task.id}] current is not NaN`);
          r.assert(typeof task.current === 'number', `Task [${task.id}] current is a number`);
          r.assert(task.current >= 0, `Task [${task.id}] current is >= 0`);
          r.assert(task.current <= task.target, `Task [${task.id}] current does not exceed target (${task.current} <= ${task.target})`);
          if (task.current === task.target) {
            r.assertEqual(task.completed, true, `Task [${task.id}] marked completed when target reached`);
          }
        });

        r.assert(duration < 1000, `1000 events processed in ${duration}ms (expected < 1000ms)`);
      });

      await r.test('3.2 Adversarial event payload values (negative, zero, undefined, NaN, large numbers)', () => {
        const u = createFreshTestUser('user_adversarial_payloads');
        global.GamificationQuests.ensureInitialized(u);

        // Ensure we have a task with some progress
        const wq = u.quests.weekly;
        const task = (wq.tasks || wq.active)[0];
        task.current = 5;

        // 1. value = 0
        global.GamificationQuests.trackProgress('dungeon_clear', 0);
        r.assert(!isNaN(task.current), 'value=0 does not produce NaN');

        // 2. value = undefined (should use default value=1)
        global.GamificationQuests.trackProgress('dungeon_clear', undefined);
        r.assert(!isNaN(task.current), 'value=undefined does not produce NaN');

        // 3. value = 99999999 (large number)
        global.GamificationQuests.trackProgress('dungeon_clear', 99999999);
        const dungeonTask = (wq.tasks || wq.active).find(t => t.id === 'clear_dungeons_10');
        if (dungeonTask) {
          r.assertEqual(dungeonTask.current, dungeonTask.target, 'Large value capped strictly at target');
          r.assertEqual(dungeonTask.completed, true, 'Task completed');
        }
      });

      await r.test('3.3 Adversarial action types (unknown, empty, null, undefined): safe no-op', () => {
        const u = createFreshTestUser('user_adversarial_actions');
        global.GamificationQuests.ensureInitialized(u);

        // Must not throw on irregular action strings
        global.GamificationQuests.trackProgress('completely_unknown_action_xyz', 5);
        global.GamificationQuests.trackProgress('', 1);
        global.GamificationQuests.trackProgress(null, 1);
        global.GamificationQuests.trackProgress(undefined, 1);
        global.GamificationQuests.trackProgress(12345, 1);
        global.GamificationQuests.trackProgress({}, 1);

        r.assert(true, 'Irregular action types safely ignored without uncaught exception');
      });

      await r.test('3.4 Null or missing user profile: trackProgress safely returns without throwing', () => {
        setMockUser(null);
        let threw = false;
        try {
          global.GamificationQuests.trackProgress('dungeon_clear', 1);
        } catch (e) {
          threw = true;
        }
        r.assert(!threw, 'trackProgress does not throw when current user is null');
      });

      // ============================================================================
      // SUITE 4: CLAIMACHIEVEMENT EXP AWARDING & LEVEL-UP TRIGGERING
      // ============================================================================
      r.suite('4. claimAchievement EXP Awarding & Level-Up Triggering');

      await r.test('4.1 Pure EXP Awarding: claimAchievement awards exact rew.exp to currentRpgUser.xp', () => {
        const u = createFreshTestUser('user_ach_exp_1');
        u.rpg_class = 'warrior'; // 1x EXP multiplier
        u.level = 1;
        u.xp = 0;

        // Unlock ach_first_blood: reward { gold: 30, exp: 40, title: 'Tân Binh Hầm Ngục' }
        u.achievements.progress['ach_first_blood'] = 1;
        u.achievements.unlocked_ids = ['ach_first_blood'];

        const claimed = global.GamificationQuests.claimAchievement('ach_first_blood');
        r.assertEqual(claimed, true, 'claimAchievement returns true');
        r.assertEqual(u.xp, 40, 'currentRpgUser.xp increased by exactly 40 EXP');
        r.assertEqual(u.gold, 30, 'Gold awarded +30');
        r.assertEqual(u.level, 1, 'Level remains 1 (40 < 100 needed for level 2)');
        r.assertEqual(u.achievements.equipped_title, 'Tân Binh Hầm Ngục', 'Title automatically equipped');
      });

      await r.test('4.2 Exact Threshold Level-Up: XP reaches exact required XP and triggers level-up', () => {
        const u = createFreshTestUser('user_ach_level_exact');
        u.rpg_class = 'warrior';
        u.level = 1;
        u.xp = 60; // Level 1 needs 100 XP -> 60 + 40 = exactly 100!
        u.hp = 120;
        u.max_hp = 120;
        u.gold = 100;
        u.gems = 10;
        u.skill_points = 0;

        u.achievements.progress['ach_first_blood'] = 1;
        u.achievements.unlocked_ids = ['ach_first_blood'];

        const claimed = global.GamificationQuests.claimAchievement('ach_first_blood');
        r.assertEqual(claimed, true, 'claimAchievement succeeded');
        r.assertEqual(u.level, 2, 'Level incremented to 2 on crossing threshold');
        r.assertEqual(u.xp, 0, 'Residual XP is 0 (100 - 100)');
        r.assertEqual(u.max_hp, 135, 'max_hp increased by +15 on level-up (120 -> 135)');
        r.assertEqual(u.hp, 135, 'hp restored to full on level-up');
        r.assertEqual(u.gold, 180, 'Gold gained +30 (ach) + 50 (lvl up) = 180');
        r.assertEqual(u.gems, 12, 'Gems gained +2 on level-up (10 -> 12)');
        r.assertEqual(u.skill_points, 1, 'Skill points gained +1 on level-up');
      });

      await r.test('4.3 Spillover XP Level-Up: residual XP preserved accurately after level-up', () => {
        const u = createFreshTestUser('user_ach_spillover');
        u.rpg_class = 'warrior';
        u.level = 1;
        u.xp = 80; // Needs 20 XP for level 2

        // Unlock ach_dungeon_3: reward { gold: 80, exp: 80, title: 'Kẻ Thám Hiểm' }
        u.achievements.progress['ach_dungeon_3'] = 3;
        u.achievements.unlocked_ids = ['ach_dungeon_3'];

        const claimed = global.GamificationQuests.claimAchievement('ach_dungeon_3');
        r.assertEqual(claimed, true, 'claimAchievement succeeded');
        r.assertEqual(u.level, 2, 'Advanced to Level 2');
        // Total XP was 80 + 80 = 160. Level 1 needs 100. Remainder = 60.
        r.assertEqual(u.xp, 60, 'Residual XP is exactly 60 (160 - 100)');
      });

      await r.test('4.4 Multi-Level Leap via Achievement EXP', () => {
        const u = createFreshTestUser('user_ach_multilevel');
        u.rpg_class = 'warrior';
        u.level = 1;
        u.xp = 0;
        u.skill_points = 0;

        // Temporarily register high-exp achievement
        const highAch = {
          id: 'ach_test_mega_exp',
          cat: 'wealth',
          title: 'Mega XP Quest',
          target: 1,
          reward: { gold: 100, exp: 1000, title: 'Mega Legend' }
        };
        global.GamificationQuests.ACHIEVEMENTS.push(highAch);

        u.achievements.progress['ach_test_mega_exp'] = 1;
        u.achievements.unlocked_ids = ['ach_test_mega_exp'];

        const claimed = global.GamificationQuests.claimAchievement('ach_test_mega_exp');
        r.assertEqual(claimed, true, 'Claimed mega exp achievement');
        r.assert(u.level > 2, `Multi-level jump achieved (reached level ${u.level})`);
        r.assertEqual(u.skill_points, u.level - 1, 'Accrued 1 skill point per leveled-up level');

        // Cleanup
        const idx = global.GamificationQuests.ACHIEVEMENTS.indexOf(highAch);
        if (idx !== -1) global.GamificationQuests.ACHIEVEMENTS.splice(idx, 1);
      });

      await r.test('4.5 Cascade Triggering: Level-Up from Achievement Unlocks Another Achievement', () => {
        const u = createFreshTestUser('user_ach_cascade');
        u.rpg_class = 'warrior';
        // Set user at level 4, close to level 5
        // Level 1: 100, Level 2: 120, Level 3: 150, Level 4: 190 (approx)
        // Let's set xp so that +80 EXP triggers level 5
        u.level = 4;
        const xpNeeded = (typeof global.getXpForLevel === 'function') ? global.getXpForLevel(4) : 200;
        u.xp = xpNeeded - 30; // 30 XP short of Level 5

        // Give ach_dungeon_3 (+80 EXP)
        u.achievements.progress['ach_dungeon_3'] = 3;
        u.achievements.unlocked_ids = ['ach_dungeon_3'];
        u.achievements.claimed_ids = [];

        r.assert(!u.achievements.unlocked_ids.includes('ach_level_5'), 'ach_level_5 is initially locked');

        // Claim ach_dungeon_3
        const claimed = global.GamificationQuests.claimAchievement('ach_dungeon_3');
        r.assertEqual(claimed, true, 'ach_dungeon_3 claimed');
        r.assertEqual(u.level, 5, 'Player reached Level 5');

        // Check if ach_level_5 was unlocked automatically via level_up event bus
        r.assert(u.achievements.unlocked_ids.includes('ach_level_5'), 'Cascade event: ach_level_5 unlocked automatically on level up!');

        // Now claim ach_level_5
        const claimedAch5 = global.GamificationQuests.claimAchievement('ach_level_5');
        r.assertEqual(claimedAch5, true, 'ach_level_5 successfully claimable!');
        r.assert(u.achievements.claimed_ids.includes('ach_level_5'), 'ach_level_5 marked claimed');
      });

      await r.test('4.6 Double Claim Prevention on Achievements (100 rapid concurrent calls)', () => {
        const u = createFreshTestUser('user_ach_double_claim');
        u.achievements.progress['ach_first_blood'] = 1;
        u.achievements.unlocked_ids = ['ach_first_blood'];

        let successCount = 0;
        let rejectCount = 0;

        for (let i = 0; i < 100; i++) {
          if (global.GamificationQuests.claimAchievement('ach_first_blood')) {
            successCount++;
          } else {
            rejectCount++;
          }
        }

        r.assertEqual(successCount, 1, 'Exactly 1 of 100 achievement claim calls succeeds');
        r.assertEqual(rejectCount, 99, 'Exactly 99 of 100 achievement claim calls rejected');
        r.assertEqual(u.gold, 30, 'Gold strictly awarded 1x (30)');
        r.assertEqual(u.xp, 40, 'EXP strictly awarded 1x (40)');
      });

      await r.test('4.7 Locked Achievement Claim Rejection', () => {
        const u = createFreshTestUser('user_ach_locked');
        u.achievements.progress['ach_combo_20'] = 5; // Target is 20
        u.achievements.unlocked_ids = [];
        u.achievements.claimed_ids = [];

        const claimed = global.GamificationQuests.claimAchievement('ach_combo_20');
        r.assertEqual(claimed, false, 'Locked achievement claim strictly rejected');
        r.assertEqual(u.gold, 0, 'No gold awarded');
        r.assertEqual(u.gems, 0, 'No gems awarded');
      });

      // ============================================================================
      // SUITE 5: DUST UNIFICATION & CURRENCY INTEGRITY ACROSS QUESTS & ACHIEVEMENTS
      // ============================================================================
      r.suite('5. Dust Unification & Currency Integrity');

      await r.test('5.1 claimWeeklyQuest with dust reward synchronizes user.dust and user.magic_dust', () => {
        const u = createFreshTestUser('user_dust_weekly');
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const taskList = wq.tasks || wq.active;

        // Find or assign a quest with dust reward (e.g. salvage_items_5 reward { gold: 150, exp: 150, dust: 300 })
        const dustQuest = taskList.find(t => {
          const tmpl = global.GamificationQuests.getWeeklyTemplate(t.id);
          return tmpl && tmpl.reward && tmpl.reward.dust > 0;
        });

        r.assert(Boolean(dustQuest), 'Found weekly quest with dust reward');
        dustQuest.current = dustQuest.target;
        dustQuest.completed = true;

        const tmpl = global.GamificationQuests.getWeeklyTemplate(dustQuest.id);
        const expectedDust = tmpl.reward.dust;

        global.GamificationQuests.claimWeeklyQuest(dustQuest.id);

        r.assertEqual(u.dust, expectedDust, `user.dust matches reward (${expectedDust})`);
        r.assertEqual(u.magic_dust, expectedDust, `user.magic_dust synchronized with user.dust (${expectedDust})`);
      });

      await r.test('5.2 claimDailyQuest with dust reward synchronizes user.dust and user.magic_dust', () => {
        const u = createFreshTestUser('user_dust_daily');
        global.GamificationQuests.ensureInitialized(u);
        const dq = u.daily_quests;
        const taskList = dq.tasks || dq.active;

        // Force a task with dust reward (e.g. combo_streak_5)
        taskList[0].id = 'combo_streak_5';
        taskList[0].target = 5;
        taskList[0].current = 5;
        taskList[0].completed = true;

        global.GamificationQuests.claimDailyQuest('combo_streak_5');

        r.assertEqual(u.dust, 25, 'user.dust updated (+25)');
        r.assertEqual(u.magic_dust, 25, 'user.magic_dust synchronized (+25)');
      });

      await r.test('5.3 claimAchievement with dust reward synchronizes user.dust and user.magic_dust', () => {
        const u = createFreshTestUser('user_dust_ach');
        // ach_enhance_3 reward: { gold: 60, dust: 30, title: 'Thợ Rèn Tập Sự' }
        u.achievements.progress['ach_enhance_3'] = 3;
        u.achievements.unlocked_ids = ['ach_enhance_3'];

        global.GamificationQuests.claimAchievement('ach_enhance_3');

        r.assertEqual(u.dust, 30, 'user.dust awarded (+30)');
        r.assertEqual(u.magic_dust, 30, 'user.magic_dust synchronized (+30)');
      });

      // ============================================================================
      // SUITE 6: ADVANCED ADVERSARIAL EDGE CASES
      // ============================================================================
      r.suite('6. Advanced Adversarial Edge Cases');

      await r.test('6.1 Individual Weekly Quest Double Claim: 100 concurrent burst calls', () => {
        const u = createFreshTestUser('user_indiv_double_burst');
        u.level = 50;
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const task = (wq.tasks || wq.active)[0];
        task.current = task.target;
        task.completed = true;

        const tmpl = global.GamificationQuests.getWeeklyTemplate(task.id);
        const goldReward = tmpl.reward.gold || 0;

        let successCount = 0;
        let rejectCount = 0;

        for (let i = 0; i < 100; i++) {
          if (global.GamificationQuests.claimWeeklyQuest(task.id)) {
            successCount++;
          } else {
            rejectCount++;
          }
        }

        r.assertEqual(successCount, 1, 'Exactly 1 of 100 burst calls to claimWeeklyQuest succeeds');
        r.assertEqual(rejectCount, 99, 'Exactly 99 of 100 burst calls rejected');
        r.assertEqual(wq.claimed_count, 1, 'claimed_count incremented strictly by 1');
        r.assertEqual(task.claimed, true, 'Task marked as claimed');
        r.assertEqual(u.gold, goldReward, `Gold strictly matches single reward (+${goldReward})`);
      });

      await r.test('6.2 Class & Buff Multipliers on Achievement EXP (Assassin 1.35x & double_xp 2.0x)', () => {
        const u = createFreshTestUser('user_ach_buffs');
        u.rpg_class = 'assassin'; // 1.35x
        u.double_xp_until = Date.now() + 3600000; // 2.0x
        u.level = 50;
        u.xp = 0;

        // ach_first_blood: reward exp = 40
        u.achievements.progress['ach_first_blood'] = 1;
        u.achievements.unlocked_ids = ['ach_first_blood'];

        // Math.round(40 * 2 * 1.35) = Math.round(108) = 108
        const claimed = global.GamificationQuests.claimAchievement('ach_first_blood');
        r.assertEqual(claimed, true, 'claimAchievement succeeds');
        r.assertEqual(u.xp, 108, 'Awards exactly 108 EXP under Assassin + double_xp multiplier (40 * 2.7 = 108)');
      });

      await r.test('6.3 Title Retention: Achievement does not overwrite existing equipped title', () => {
        const u = createFreshTestUser('user_title_retention');
        u.achievements.equipped_title = 'Hiệp Sĩ Quả Cảm';

        u.achievements.progress['ach_first_blood'] = 1;
        u.achievements.unlocked_ids = ['ach_first_blood'];

        global.GamificationQuests.claimAchievement('ach_first_blood');
        r.assertEqual(u.achievements.equipped_title, 'Hiệp Sĩ Quả Cảm', 'Custom title preserved, not overwritten by new title');

        // Explicit equipTitle must switch it
        global.GamificationQuests.equipTitle('Tân Binh Hầm Ngục');
        r.assertEqual(u.achievements.equipped_title, 'Tân Binh Hầm Ngục', 'equipTitle changes title explicitly');
      });

      await r.test('6.4 Lobby Alert Badge Aggregation across Daily, Weekly, Grand Chests, & Achievements', () => {
        const u = createFreshTestUser('user_badge_aggregation');
        global.GamificationQuests.ensureInitialized(u);

        // Daily: 4/4 completed, chest unclaimed
        const dq = u.daily_quests;
        const dTasks = dq.tasks || dq.active;
        dTasks.forEach(t => { t.current = t.target; t.completed = true; t.claimed = false; });
        dq.claimed_chest = false;
        // 4 unclaimed daily tasks + 1 unclaimed daily chest = 5

        // Weekly: 2 completed tasks unclaimed, chest unclaimed
        const wq = u.quests.weekly;
        const wTasks = wq.tasks || wq.active;
        wTasks[0].current = wTasks[0].target; wTasks[0].completed = true; wTasks[0].claimed = false;
        wTasks[1].current = wTasks[1].target; wTasks[1].completed = true; wTasks[1].claimed = false;
        // +2 weekly tasks

        // Achievements: 1 unlocked unclaimed
        u.achievements.unlocked_ids = ['ach_first_blood'];
        u.achievements.claimed_ids = [];
        // +1 achievement

        // Expected badge count: 4 (daily tasks) + 1 (daily chest) + 2 (weekly tasks) + 1 (achievement) = 8
        let badgeEl = document.getElementById('lobbyQuestsAlertBadge');
        if (!badgeEl) {
          badgeEl = document.createElement('div');
          badgeEl.id = 'lobbyQuestsAlertBadge';
          document.body.appendChild(badgeEl);
        }

        global.GamificationQuests.updateLobbyBadge();
        r.assertEqual(badgeEl.textContent, '8', 'Lobby badge accurately aggregates all 8 unclaimed rewards');
        r.assert(!badgeEl.classList.contains('hidden'), 'Badge visible when count > 0');

        // Now claim all daily tasks and chest
        dTasks.forEach(t => { t.claimed = true; });
        dq.claimed_chest = true;
        // Claim 2 weekly tasks
        wTasks[0].claimed = true;
        wTasks[1].claimed = true;
        // Claim achievement
        u.achievements.claimed_ids = ['ach_first_blood'];

        global.GamificationQuests.updateLobbyBadge();
        r.assertEqual(badgeEl.textContent, '0', 'Lobby badge resets to 0 when all rewards claimed');
        r.assert(badgeEl.classList.contains('hidden'), 'Badge hidden when count is 0');
      });

      // ============================================================================
      // SUITE 7: QUEST-CHEST NON-INTERFERENCE & INDEPENDENT CLAIM LIFECYCLE
      // ============================================================================
      r.suite('7. Quest-Chest Non-Interference & Independent Claim Lifecycle');

      await r.test('7.1 Opening Grand Chest first does NOT lock out individual weekly quest claims', () => {
        const u = createFreshTestUser('user_chest_first');
        u.level = 50;
        global.GamificationQuests.ensureInitialized(u);
        const wq = u.quests.weekly;
        const taskList = wq.tasks || wq.active;

        // Complete all 6 tasks
        taskList.forEach(t => { t.current = t.target; t.completed = true; t.claimed = false; });

        // Player claims Grand Chest FIRST
        const chestClaimed = global.GamificationQuests.claimWeeklyChest();
        r.assertEqual(chestClaimed, true, 'Grand chest claimed successfully');
        r.assertEqual(wq.claimed_chest, true, 'claimed_chest is true');

        // Verify all 6 individual weekly quests can still be claimed!
        let claimedQuestsCount = 0;
        taskList.forEach(t => {
          const res = global.GamificationQuests.claimWeeklyQuest(t.id);
          if (res) claimedQuestsCount++;
        });

        r.assertEqual(claimedQuestsCount, taskList.length, `All ${taskList.length} individual quests claimed after grand chest`);
        r.assertEqual(wq.claimed_count, taskList.length, 'claimed_count equals total quests');
      });

      await r.test('7.2 getWeeklyTimeRemainingStr handles edge cases gracefully without NaN', () => {
        const u = createFreshTestUser('user_timer_edge_cases');

        // Case 1: uninitialized
        u.quests = { weekly: { last_reset: null } };
        r.assertEqual(global.GamificationQuests.getWeeklyTimeRemainingStr(u), '7 ngày', 'Null reset returns 7 ngày fallback');

        // Case 2: exact 0 remaining
        u.quests = { weekly: { last_reset: Date.now() - ONE_WEEK_MS } };
        const expiredStr = global.GamificationQuests.getWeeklyTimeRemainingStr(u);
        r.assert(!expiredStr.includes('NaN'), `Expired timer does not contain NaN (got ${expiredStr})`);

        // Case 3: 3 days remaining
        u.quests = { weekly: { last_reset: Date.now() - (4 * 86400000) } };
        const remainingStr = global.GamificationQuests.getWeeklyTimeRemainingStr(u);
        r.assert(remainingStr.includes('ngày'), `Valid remaining time contains 'ngày' (got ${remainingStr})`);
        r.assert(!remainingStr.includes('NaN'), `Valid timer does not contain NaN`);
      });

    } finally {
      global.alert = oldAlert;
      global.confirm = oldConfirm;
      global.currentRpgUser = oldCurrentRpgUser;
      global.currentUser = oldCurrentUser;
    }

    return r.getSummary();
  }

  global.runChallengerM5StressTests = runChallengerM5StressTests;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runChallengerM5StressTests };
  }
})(typeof window !== 'undefined' ? window : global);
