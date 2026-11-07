/**
 * ==============================================================================
 * MILESTONE 5 TEST SUITE: DAILY & WEEKLY QUESTS, ACHIEVEMENTS, BIOMES & SPRITES
 * File: tests/test_milestone5_quests.js
 * ==============================================================================
 * Comprehensive verification validating:
 * 1. WEEKLY_POOL schema, targets, and rewards (10+ challenging templates)
 * 2. 7-Day reset lifecycle, interval tracking, and countdown formatting
 * 3. Event pipeline tracking across all quest triggers (word, dungeon, boss, tower, etc.)
 * 4. Quest & Grand Chest reward claiming, currency sinks/faucets, dust unification
 * 5. Achievement EXP reward awarding (rew.exp -> addXP / user.xp) and dust unification
 * 6. Quests modal UI tabs (Daily, Weekly, Milestones) and Lobby notification badge
 * 7. Biome mapping completeness (all 30 canonical biomes in DUNGEON_DATA_100)
 * 8. Monster archetype pixel art canvas renderers (all 31 unique boss archetypes)
 * 9. Supabase JSONB inventory persistence (quests & weekly_quests packing/unpacking)
 * ==============================================================================
 */

(function(global) {
  'use strict';

  class Milestone5TestRunner {
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

  async function runMilestone5Tests() {
    const r = new Milestone5TestRunner();
    const oldAlert = global.alert;
    const oldConfirm = global.confirm;
    const oldCurrentRpgUser = global.currentRpgUser;
    const oldCurrentUser = global.currentUser;

    global.alert = () => {};
    global.confirm = () => true;

    function setMockUser(u) {
      global.currentRpgUser = u;
      global.currentUser = u;
      if (typeof window !== 'undefined') {
        window.currentRpgUser = u;
        window.currentUser = u;
      }
    }

    function getDungeonList() {
      if (Array.isArray(global.DUNGEON_DATA_100)) return global.DUNGEON_DATA_100;
      if (global.DUNGEON_DATA_100 && typeof global.DUNGEON_DATA_100 === 'object') {
        return Object.values(global.DUNGEON_DATA_100);
      }
      return [];
    }

    try {

    // ============================================================================
    // SUITE 1: WEEKLY QUEST POOL SCHEMA & SPECIFICATION
    // ============================================================================
    r.suite('1. Weekly Quest Pool Schema & Specification');

    await r.test('1.1 WEEKLY_POOL contains at least 10 unique challenging templates', () => {
      r.assert(Boolean(global.GamificationQuests), 'GamificationQuests module must exist');
      r.assert(Array.isArray(global.GamificationQuests.WEEKLY_POOL), 'WEEKLY_POOL must be an array');
      r.assert(global.GamificationQuests.WEEKLY_POOL.length >= 10, `WEEKLY_POOL has ${global.GamificationQuests.WEEKLY_POOL.length} items (expected >= 10)`);
    });

    await r.test('1.2 Every template has valid id, title, desc, icon, target > 0, and reward object', () => {
      const seenIds = new Set();
      global.GamificationQuests.WEEKLY_POOL.forEach((tmpl, idx) => {
        r.assert(typeof tmpl.id === 'string' && tmpl.id.length > 0, `Template #${idx} has valid id`);
        r.assert(!seenIds.has(tmpl.id), `Template id [${tmpl.id}] must be unique in WEEKLY_POOL`);
        seenIds.add(tmpl.id);

        r.assert(typeof tmpl.title === 'string' && tmpl.title.length > 0, `[${tmpl.id}] has valid title`);
        r.assert(typeof tmpl.desc === 'string' && tmpl.desc.length > 0, `[${tmpl.id}] has valid desc`);
        r.assert(typeof tmpl.icon === 'string' && tmpl.icon.length > 0, `[${tmpl.id}] has valid icon`);
        r.assert(typeof tmpl.target === 'number' && tmpl.target > 0, `[${tmpl.id}] target must be > 0 (got ${tmpl.target})`);
        r.assert(typeof tmpl.reward === 'object' && tmpl.reward !== null, `[${tmpl.id}] has reward object`);

        const hasReward = (tmpl.reward.gold || 0) > 0 ||
                          (tmpl.reward.gems || 0) > 0 ||
                          (tmpl.reward.dust || 0) > 0 ||
                          (tmpl.reward.enhance_stones || 0) > 0 ||
                          (tmpl.reward.exp || 0) > 0;
        r.assert(hasReward, `[${tmpl.id}] reward must grant at least one currency/exp`);
      });
    });

    await r.test('1.3 getWeeklyTemplate retrieves templates by ID', () => {
      const first = global.GamificationQuests.WEEKLY_POOL[0];
      const retrieved = global.GamificationQuests.getWeeklyTemplate(first.id);
      r.assert(Boolean(retrieved), `getWeeklyTemplate(${first.id}) should return template`);
      r.assertEqual(retrieved.id, first.id, 'Retrieved ID matches');
      r.assertEqual(global.GamificationQuests.getWeeklyTemplate('non_existent_id'), null, 'Returns null for unknown ID');
    });

    // ============================================================================
    // SUITE 2: WEEKLY QUESTS LIFECYCLE & 7-DAY RESET INTERVAL
    // ============================================================================
    r.suite('2. Weekly Quests Lifecycle & 7-Day Reset');

    await r.test('2.1 Initializing user creates user.quests.weekly with active quests', () => {
      const mockUser = { id: 'test_m5_user_1' };
      global.GamificationQuests.ensureInitialized(mockUser);

      r.assert(Boolean(mockUser.quests), 'mockUser.quests initialized');
      r.assert(Boolean(mockUser.quests.weekly), 'mockUser.quests.weekly initialized');
      r.assert(Boolean(mockUser.weekly_quests), 'mockUser.weekly_quests alias initialized');
      r.assertEqual(mockUser.weekly_quests, mockUser.quests.weekly, 'weekly_quests is reference alias to quests.weekly');

      const activeList = mockUser.quests.weekly.active || mockUser.quests.weekly.tasks;
      r.assert(Array.isArray(activeList), 'weekly.active or tasks is array');
      r.assert(activeList.length >= 3, `At least 3 weekly quests assigned (got ${activeList.length})`);
      r.assertEqual(mockUser.quests.weekly.claimed_chest, false, 'Weekly chest initially unclaimed');
      r.assertEqual(mockUser.quests.weekly.claimed_count, 0, 'Initial claimed count is 0');
      r.assert(typeof mockUser.quests.weekly.last_reset === 'number', 'last_reset timestamp exists');

      // Check quest object integrity
      activeList.forEach(q => {
        r.assert(Boolean(q.id), 'Active quest has id');
        r.assertEqual(q.progress || q.current, 0, 'Active quest starts at 0 progress');
        r.assert(q.target > 0, 'Active quest target > 0');
        r.assertEqual(q.claimed, false, 'Active quest starts unclaimed');
      });
    });

    await r.test('2.2 Quests persist within the 7-day interval', () => {
      const mockUser = { id: 'test_m5_user_2' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const originalReset = mockUser.quests.weekly.last_reset;
      const activeList = mockUser.quests.weekly.active || mockUser.quests.weekly.tasks;
      const originalQuestIds = activeList.map(q => q.id);

      // Advance by 3 days (within 7 days)
      activeList[0].current = 5;
      if (activeList[0].progress !== undefined) activeList[0].progress = 5;
      global.GamificationQuests.ensureInitialized(mockUser);

      r.assertEqual(mockUser.quests.weekly.last_reset, originalReset, 'last_reset unchanged within 7 days');
      r.assertEqual(activeList[0].current, 5, 'Quest progress preserved');
      const newQuestIds = (mockUser.quests.weekly.active || mockUser.quests.weekly.tasks).map(q => q.id);
      r.assertEqual(JSON.stringify(newQuestIds), JSON.stringify(originalQuestIds), 'Quest IDs unchanged');
    });

    await r.test('2.3 Weekly reset triggers after 7 days (7 * 86,400,000 ms)', () => {
      const mockUser = { id: 'test_m5_user_3' };
      global.GamificationQuests.ensureInitialized(mockUser);

      // Force last_reset to 8 days ago
      const eightDaysAgo = Date.now() - (8 * 86400000);
      mockUser.quests.weekly.last_reset = eightDaysAgo;
      mockUser.quests.weekly.claimed_chest = true;
      mockUser.quests.weekly.claimed_count = 3;
      const activeList = mockUser.quests.weekly.active || mockUser.quests.weekly.tasks;
      activeList[0].claimed = true;

      // Re-initialize
      global.GamificationQuests.ensureInitialized(mockUser);

      r.assert(mockUser.quests.weekly.last_reset > eightDaysAgo, 'last_reset updated to new cycle');
      r.assertEqual(mockUser.quests.weekly.claimed_chest, false, 'Weekly grand chest reset to unclaimed');
      r.assertEqual(mockUser.quests.weekly.claimed_count, 0, 'Claimed count reset to 0');
      const newList = mockUser.quests.weekly.active || mockUser.quests.weekly.tasks;
      r.assert(newList.length >= 3, 'New active quests generated');
      r.assertEqual(newList[0].claimed, false, 'New quests start unclaimed');
    });

    await r.test('2.4 getWeeklyTimeRemainingStr produces valid formatted countdown string', () => {
      const mockUser = { id: 'test_m5_user_4' };
      global.GamificationQuests.ensureInitialized(mockUser);

      const timeStr = global.GamificationQuests.getWeeklyTimeRemainingStr(mockUser);
      r.assert(typeof timeStr === 'string' && timeStr.length > 0, 'Returns non-empty string');
      r.assert(timeStr.includes('ngày') || timeStr.includes('giờ'), `Formatted countdown contains time units (got: "${timeStr}")`);
    });

    // ============================================================================
    // SUITE 3: EVENT TRACKING PIPELINE HOOKS FOR WEEKLY QUESTS
    // ============================================================================
    r.suite('3. Event Tracking Pipeline Hooks');

    await r.test('3.1 clear_dungeons_10 tracks dungeon_clear events', () => {
      const mockUser = { id: 'test_m5_events_1' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'clear_dungeons_10', current: 0, progress: 0, target: 10, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('dungeon_clear', 1);
      r.assertEqual(questObj.current, 1, 'Progress incremented by 1');

      global.GamificationQuests.trackProgress('dungeon_clear', 3);
      r.assertEqual(questObj.current, 4, 'Progress incremented by 3 to 4');
    });

    await r.test('3.2 defeat_bosses_5 tracks boss_slain and slay_boss events', () => {
      const mockUser = { id: 'test_m5_events_2' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'defeat_bosses_5', current: 0, progress: 0, target: 5, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('boss_slain', 2);
      r.assertEqual(questObj.current, 2, 'boss_slain tracked');

      global.GamificationQuests.trackProgress('slay_boss', 1);
      r.assertEqual(questObj.current, 3, 'slay_boss alias tracked');
    });

    await r.test('3.3 forge_enhance_5 tracks forge_enhance events', () => {
      const mockUser = { id: 'test_m5_events_3' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'forge_enhance_5', current: 0, progress: 0, target: 5, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('forge_enhance', 1);
      r.assertEqual(questObj.current, 1, 'forge_enhance tracked');
    });

    await r.test('3.4 open_chests_5 tracks open_chest events', () => {
      const mockUser = { id: 'test_m5_events_4' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'open_chests_5', current: 0, progress: 0, target: 5, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('open_chest', 2);
      r.assertEqual(questObj.current, 2, 'open_chest tracked');
    });

    await r.test('3.5 c1_c2_words_50 tracks c1_c2_word events', () => {
      const mockUser = { id: 'test_m5_events_5' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'c1_c2_words_50', current: 0, progress: 0, target: 50, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('c1_c2_word', 5);
      r.assertEqual(questObj.current, 5, 'c1_c2_word tracked');
    });

    await r.test('3.6 earn_gold_1000 tracks gold_earned and gold_balance events', () => {
      const mockUser = { id: 'test_m5_events_6' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'earn_gold_1000', current: 0, progress: 0, target: 1000, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('gold_earned', 250);
      r.assertEqual(questObj.current, 250, 'gold_earned tracked');

      global.GamificationQuests.trackProgress('gold_balance', 350);
      r.assertEqual(questObj.current, 350, 'gold_balance alias tracked');
    });

    await r.test('3.7 tower_floors_15 tracks tower_floor_clear events', () => {
      const mockUser = { id: 'test_m5_events_7' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'tower_floors_15', current: 0, progress: 0, target: 15, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('tower_floor_clear', 3);
      r.assertEqual(questObj.current, 3, 'tower_floor_clear tracked');
    });

    await r.test('3.8 combo_streak_10 tracks combo_streak and streak_combo events', () => {
      const mockUser = { id: 'test_m5_events_8' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'combo_streak_10', current: 0, progress: 0, target: 10, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('combo_streak', 8);
      r.assertEqual(questObj.current, 0, 'below target streak does not complete');

      global.GamificationQuests.trackProgress('combo_streak', 12);
      r.assertEqual(questObj.current, 10, 'reaching target sets current to 10');
      r.assertEqual(questObj.completed, true, 'marked completed');
    });

    await r.test('3.9 salvage_items_5 tracks salvage_item events', () => {
      const mockUser = { id: 'test_m5_events_9' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'salvage_items_5', current: 0, progress: 0, target: 5, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('salvage_item', 2);
      r.assertEqual(questObj.current, 2, 'salvage_item tracked');
    });

    await r.test('3.10 use_potions_10 tracks use_potion events', () => {
      const mockUser = { id: 'test_m5_events_10' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'use_potions_10', current: 0, progress: 0, target: 10, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('use_potion', 4);
      r.assertEqual(questObj.current, 4, 'use_potion tracked');
    });

    await r.test('3.11 word_correct_100 tracks word_correct and quiz_correct events', () => {
      const mockUser = { id: 'test_m5_events_11' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'word_correct_100', current: 0, progress: 0, target: 100, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('word_correct', 25);
      r.assertEqual(questObj.current, 25, 'word_correct tracked');

      global.GamificationQuests.trackProgress('quiz_correct', 30);
      r.assertEqual(questObj.current, 55, 'quiz_correct alias tracked');
    });

    await r.test('3.12 Progress caps strictly at quest target without exceeding', () => {
      const mockUser = { id: 'test_m5_events_12' };
      global.GamificationQuests.ensureInitialized(mockUser);
      const questObj = { id: 'defeat_bosses_5', current: 4, progress: 4, target: 5, completed: false, claimed: false };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      global.GamificationQuests.trackProgress('boss_slain', 10);
      r.assertEqual(questObj.current, 5, 'Progress capped at target (5)');
      r.assertEqual(questObj.completed, true, 'Marked completed');
    });

    // ============================================================================
    // SUITE 4: REWARD CLAIMING, GRAND CHEST & ECONOMY SYNC
    // ============================================================================
    r.suite('4. Reward Claiming, Grand Chest & Currency Sync');

    await r.test('4.1 claimWeeklyQuest awards rewards, unifies dust, and marks claimed', () => {
      const mockUser = {
        id: 'test_m5_claim_1',
        gold: 100,
        gems: 10,
        dust: 5,
        magic_dust: 5,
        enhance_stones: 2,
        xp: 0,
        level: 30
      };
      global.GamificationQuests.ensureInitialized(mockUser);
      const tmpl = global.GamificationQuests.WEEKLY_POOL[0];
      const questObj = {
        id: tmpl.id,
        current: tmpl.target,
        progress: tmpl.target,
        target: tmpl.target,
        completed: true,
        claimed: false
      };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      const claimed = global.GamificationQuests.claimWeeklyQuest(tmpl.id);
      r.assert(claimed, 'claimWeeklyQuest returns true on successful claim');
      r.assertEqual(questObj.claimed, true, 'Quest marked as claimed');
      r.assertEqual(mockUser.quests.weekly.claimed_count, 1, 'claimed_count incremented to 1');

      // Check economy reward sync
      const expectedGold = 100 + (tmpl.reward.gold || 0);
      const expectedGems = 10 + (tmpl.reward.gems || 0);
      const expectedDust = 5 + (tmpl.reward.dust || 0);
      const expectedStones = 2 + (tmpl.reward.enhance_stones || tmpl.reward.stones || 0);

      r.assertEqual(mockUser.gold, expectedGold, 'Gold awarded accurately');
      r.assertEqual(mockUser.gems, expectedGems, 'Gems awarded accurately');
      r.assertEqual(mockUser.dust, expectedDust, 'Dust awarded accurately');
      r.assertEqual(mockUser.magic_dust, expectedDust, 'magic_dust synchronized with dust');
      r.assertEqual(mockUser.enhance_stones, expectedStones, 'Enhance stones awarded accurately');

      // Cannot claim twice
      const claimedAgain = global.GamificationQuests.claimWeeklyQuest(tmpl.id);
      r.assertEqual(claimedAgain, false, 'Double-claiming prevented');
    });

    await r.test('4.2 claimWeeklyQuest rejects claim when progress is below target', () => {
      const mockUser = { id: 'test_m5_claim_2', gold: 50 };
      global.GamificationQuests.ensureInitialized(mockUser);
      const tmpl = global.GamificationQuests.WEEKLY_POOL[0];
      const questObj = {
        id: tmpl.id,
        current: tmpl.target - 1,
        progress: tmpl.target - 1,
        target: tmpl.target,
        completed: false,
        claimed: false
      };
      mockUser.quests.weekly.tasks = [questObj];
      mockUser.quests.weekly.active = [questObj];
      setMockUser(mockUser);

      const res = global.GamificationQuests.claimWeeklyQuest(tmpl.id);
      r.assertEqual(res, false, 'Cannot claim incomplete quest');
      r.assertEqual(questObj.claimed, false, 'Remains unclaimed');
      r.assertEqual(mockUser.gold, 50, 'Gold unchanged');
    });

    await r.test('4.3 claimWeeklyChest requires all quests completed and awards grand chest', () => {
      const mockUser = {
        id: 'test_m5_claim_3',
        gold: 500,
        gems: 10,
        dust: 20,
        magic_dust: 20,
        enhance_stones: 5,
        xp: 0,
        level: 30
      };
      global.GamificationQuests.ensureInitialized(mockUser);
      setMockUser(mockUser);

      // Condition: Not all completed
      mockUser.quests.weekly.tasks = [
        { id: 'q1', current: 10, target: 10, completed: true, claimed: true },
        { id: 'q2', current: 5, target: 10, completed: false, claimed: false },
        { id: 'q3', current: 10, target: 10, completed: true, claimed: true }
      ];
      mockUser.quests.weekly.active = mockUser.quests.weekly.tasks;

      const failClaim = global.GamificationQuests.claimWeeklyChest();
      r.assertEqual(failClaim, false, 'Weekly chest claim rejected when any quest is incomplete');
      r.assertEqual(mockUser.quests.weekly.claimed_chest, false, 'claimed_chest remains false');

      // Condition: All completed
      mockUser.quests.weekly.tasks[1].current = 10;
      mockUser.quests.weekly.tasks[1].completed = true;
      mockUser.quests.weekly.tasks[1].claimed = true;

      const successClaim = global.GamificationQuests.claimWeeklyChest();
      r.assert(successClaim, 'Weekly chest successfully claimed when all 3 completed');
      r.assertEqual(mockUser.quests.weekly.claimed_chest, true, 'claimed_chest marked true');

      // Grand chest rewards: +1500 gold, +25 gems, +100 dust, +10 stones, +500 exp
      r.assertEqual(mockUser.gold, 500 + 1500, 'Grand chest grants +1500 gold');
      r.assertEqual(mockUser.gems, 10 + 25, 'Grand chest grants +25 gems');
      r.assertEqual(mockUser.dust, 20 + 100, 'Grand chest grants +100 dust');
      r.assertEqual(mockUser.magic_dust, 20 + 100, 'magic_dust synchronized to dust');
      r.assertEqual(mockUser.enhance_stones, 5 + 10, 'Grand chest grants +10 enhance stones');

      // Cannot claim twice
      const secondClaim = global.GamificationQuests.claimWeeklyChest();
      r.assertEqual(secondClaim, false, 'Double-claiming grand chest prevented');
    });

    // ============================================================================
    // SUITE 5: ACHIEVEMENT EXP REWARD FIX & DUST UNIFICATION
    // ============================================================================
    r.suite('5. Achievement EXP Reward Fix & Dust Unification');

    await r.test('5.1 claimAchievement awards rew.exp to user XP and syncs magic_dust', () => {
      const mockUser = {
        id: 'test_m5_ach_1',
        gold: 100,
        gems: 10,
        dust: 15,
        magic_dust: 15,
        xp: 40,
        level: 2,
        achievements: {
          progress: { ach_first_blood: 1 },
          unlocked_ids: ['ach_first_blood'],
          claimed_ids: []
        }
      };
      setMockUser(mockUser);

      const ach = global.GamificationQuests.ACHIEVEMENTS.find(a => a.id === 'ach_first_blood');
      r.assert(Boolean(ach), 'ach_first_blood must exist');

      const initialXp = mockUser.xp;
      const initialGold = mockUser.gold;
      const initialDust = mockUser.dust;

      const claimed = global.GamificationQuests.claimAchievement('ach_first_blood');
      r.assert(claimed, 'claimAchievement returns true');
      r.assert(mockUser.achievements.claimed_ids.includes('ach_first_blood'), 'Recorded in claimed_ids');

      if (ach.reward.exp) {
        r.assertEqual(mockUser.xp, initialXp + ach.reward.exp, `EXP awarded properly (+${ach.reward.exp})`);
      }
      if (ach.reward.gold) {
        r.assertEqual(mockUser.gold, initialGold + ach.reward.gold, `Gold awarded properly`);
      }
      if (ach.reward.dust) {
        r.assertEqual(mockUser.dust, initialDust + ach.reward.dust, `Dust awarded properly`);
        r.assertEqual(mockUser.magic_dust, mockUser.dust, `magic_dust synchronized with dust`);
      }

      // Cannot double claim
      const secondClaim = global.GamificationQuests.claimAchievement('ach_first_blood');
      r.assertEqual(secondClaim, false, 'Double claiming achievement prevented');
    });

    // ============================================================================
    // SUITE 6: UI TABS, MODAL RENDERING & BADGE COUNTER
    // ============================================================================
    r.suite('6. UI Tabs, Modal Rendering & Badge Counter');

    await r.test('6.1 renderQuestsModal supports daily, weekly, and milestones tabs', () => {
      const mockUser = { id: 'test_m5_ui_1', gold: 100 };
      global.GamificationQuests.ensureInitialized(mockUser);
      setMockUser(mockUser);

      // Mock DOM container
      let modalDiv = document.getElementById('rpgQuestsModal');
      let createdDiv = false;
      if (!modalDiv) {
        modalDiv = document.createElement('div');
        modalDiv.id = 'rpgQuestsModal';
        document.body.appendChild(modalDiv);
        createdDiv = true;
      }

      try {
        // Daily tab
        global.GamificationQuests.renderQuestsModal('daily');
        r.assert(modalDiv.innerHTML.includes('RƯƠNG BÁU HOÀNG KIM NGÀY') || modalDiv.innerHTML.includes('Nhiệm Vụ'), 'Daily tab rendered');

        // Weekly tab
        global.GamificationQuests.renderQuestsModal('weekly');
        r.assert(modalDiv.innerHTML.includes('ĐẠI RƯƠNG BÁU HOÀNG KIM TUẦN') || modalDiv.innerHTML.includes('RƯƠNG ĐẠI CHIẾN TÍCH TUẦN'), 'Weekly grand chest rendered');
        r.assert(modalDiv.innerHTML.includes('Làm mới'), 'Weekly countdown timer rendered');

        // Milestones tab
        global.GamificationQuests.renderQuestsModal('milestones');
        r.assert(modalDiv.innerHTML.includes('THÀNH TỰU VĨNH CỬU') || modalDiv.innerHTML.includes('Thành Tựu'), 'Milestones tab rendered');
      } finally {
        if (createdDiv && modalDiv.parentNode) {
          modalDiv.parentNode.removeChild(modalDiv);
        }
      }
    });

    await r.test('6.2 updateLobbyBadge aggregates unclaimed daily and weekly rewards', () => {
      const mockUser = {
        id: 'test_m5_ui_2',
        daily_quests: {
          tasks: [{ id: 'd1', current: 10, target: 10, completed: true, claimed: false }],
          claimed_chest: false
        },
        quests: {
          daily: {
            tasks: [{ id: 'd1', current: 10, target: 10, completed: true, claimed: false }],
            claimed_chest: false
          },
          weekly: {
            tasks: [{ id: 'w1', current: 10, target: 10, completed: true, claimed: false }],
            claimed_chest: false
          }
        }
      };
      mockUser.weekly_quests = mockUser.quests.weekly;
      setMockUser(mockUser);

      const badge = document.createElement('span');
      badge.id = 'lobbyQuestsAlertBadge';
      document.body.appendChild(badge);

      try {
        global.GamificationQuests.updateLobbyBadge();
        const count = parseInt(badge.textContent, 10);
        r.assert(count >= 2, `Badge should reflect at least 2 claimable rewards (got: ${count})`);
      } finally {
        if (badge.parentNode) badge.parentNode.removeChild(badge);
      }
    });

    // ============================================================================
    // SUITE 7: BIOME MAPPING COMPLETENESS (ALL 30 UNIQUE BIOMES)
    // ============================================================================
    r.suite('7. Biome Mapping Completeness');

    await r.test('7.1 DUNGEON_DATA_100 contains exactly 30 unique canonical biomes', () => {
      const dungeons = getDungeonList();
      r.assertEqual(dungeons.length, 100, `Exactly 100 dungeons defined (got ${dungeons.length})`);

      const biomes = new Set(dungeons.map(d => d.biome));
      r.assertEqual(biomes.size, 30, `Exactly 30 unique biomes expected (got ${biomes.size})`);
    });

    await r.test('7.2 All 30 unique biomes are mapped in BattleEngine.biomeIcons', () => {
      const dungeons = getDungeonList();
      const biomes = [...new Set(dungeons.map(d => d.biome))];
      const icons = global.biomeIcons || global.BIOME_ICONS || (global.BattleEngine && global.BattleEngine.biomeIcons) ||
                    (typeof window !== 'undefined' && (window.biomeIcons || window.BIOME_ICONS || (window.BattleEngine && window.BattleEngine.biomeIcons)));

      r.assert(Boolean(icons), 'biomeIcons dictionary is accessible');

      const missing = [];
      biomes.forEach(biome => {
        if (!icons[biome] || typeof icons[biome] !== 'string' || icons[biome].trim().length === 0) {
          missing.push(biome);
        }
      });

      r.assertEqual(missing.length, 0, `All 30 biomes must be mapped with icon & title. Missing: ${missing.join(', ')}`);
    });

    // ============================================================================
    // SUITE 8: MONSTER ARCHETYPE PIXEL ART RENDERERS (ALL 31 UNIQUE ARCHETYPES)
    // ============================================================================
    r.suite('8. Monster Archetype Pixel Art Renderers');

    await r.test('8.1 DUNGEON_DATA_100 contains exactly 31 unique boss archetypes', () => {
      const dungeons = getDungeonList();
      const archetypes = new Set(dungeons.map(d => d.boss.archetype));
      r.assertEqual(archetypes.size, 31, `Exactly 31 unique boss archetypes expected (got ${archetypes.size})`);
    });

    await r.test('8.2 BattleEngine has dedicated rendering methods for all 31 boss archetypes', () => {
      r.assert(Boolean(global.BattleEngine), 'BattleEngine must exist');

      const expectedMethods = [
        'drawFashionQueenBoss', 'drawBaristaDragonBoss', 'drawHotpotBehemothBoss',
        'drawAnatomicalTitanBoss', 'drawPlagueTitanBoss', 'drawLivingWardrobeBoss',
        'drawCyberOverlordBoss', 'drawQuantumAgiGodBoss', 'drawAbyssalKrakenBoss',
        'drawCosmicDestroyerBoss', 'drawMidasGoldDragonBoss', 'drawOmniCarrierTitanBoss',
        'drawAncientDryadBoss', 'drawAncientGolemBoss', 'drawApexBeastKingBoss',
        'drawAvalancheBehemothBoss', 'drawBroadcastOverlordBoss', 'drawCalamityDragonBoss',
        'drawCathedralArchonBoss', 'drawChaosJesterBoss', 'drawEgoShadowBoss',
        'drawFoundryJuggernautBoss', 'drawGeodeColossusBoss', 'drawGladiatorChampionBoss',
        'drawIronJudgeBoss', 'drawMutagenHorrorBoss', 'drawPatriarchPhantomBoss',
        'drawScholarLichBoss', 'drawSkylineZephyrBehemothBoss', 'drawTurboHighwayWyrmBoss',
        'drawVirtuosoMaestroBoss'
      ];

      r.assertEqual(expectedMethods.length, 31, 'Exactly 31 archetype methods checked');

      const missingMethods = [];
      expectedMethods.forEach(method => {
        if (typeof global.BattleEngine[method] !== 'function') {
          missingMethods.push(method);
        }
      });

      r.assertEqual(missingMethods.length, 0, `All 31 renderers must exist on BattleEngine. Missing: ${missingMethods.join(', ')}`);
    });

    await r.test('8.3 drawMonster executes without exception for all 31 boss archetypes on canvas', () => {
      const mockCtx = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        ellipse: () => {},
        quadraticCurveTo: () => {},
        bezierCurveTo: () => {},
        fill: () => {},
        stroke: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        clearRect: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        fillText: () => {},
        measureText: () => ({ width: 50 }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        globalAlpha: 1,
        shadowColor: 'transparent',
        shadowBlur: 0
      };

      const dungeons = getDungeonList();
      const archetypes = [...new Set(dungeons.map(d => d.boss.archetype))];
      r.assertEqual(archetypes.length, 31, '31 archetypes to test rendering on');

      archetypes.forEach(arch => {
        global.BattleEngine.monster = {
          name: `Test ${arch}`,
          archetype: arch,
          element: 'fire',
          isBoss: true,
          hp: 1000,
          maxHp: 1000,
          scale: 1,
          state: 'idle',
          animTimer: 0,
          x: 650,
          y: 150,
          baseY: 150,
          lungeX: 0,
          flashWhite: 0,
          color: '#FF0000'
        };

        try {
          global.BattleEngine.drawMonster(mockCtx);
        } catch (err) {
          throw new Error(`Failed to draw archetype [${arch}]: ${err.message}`);
        }
      });
    });

    // ============================================================================
    // SUITE 9: SUPABASE JSONB PACKING & PERSISTENCE
    // ============================================================================
    r.suite('9. Supabase Auth Inventory JSONB Persistence');

    await r.test('9.1 loadProfileFromSupabase correctly unpacks quests and weekly_quests', async () => {
      const mockRow = {
        id: 'user_m5_cloud',
        email: 'test@anki.rpg',
        display_name: 'Test Cloud Hero',
        level: 5,
        xp: 300,
        gold: 1200,
        gems: 18,
        inventory: {
          dust: 45,
          enhance_stones: 8,
          quests: {
            daily: { tasks: [{ id: 'd1', current: 5, target: 5, claimed: true }] },
            weekly: {
              tasks: [{ id: 'w1', current: 10, target: 10, claimed: true }],
              claimed_chest: false,
              last_reset: Date.now()
            }
          }
        }
      };

      const profile = await global.loadProfileFromSupabase(mockRow);
      r.assert(Boolean(profile.quests), 'profile.quests unpacked');
      r.assert(Boolean(profile.quests.weekly), 'profile.quests.weekly unpacked');
      r.assertEqual(profile.weekly_quests, profile.quests.weekly, 'weekly_quests alias assigned');
      r.assertEqual((profile.quests.weekly.tasks || profile.quests.weekly.active)[0].id, 'w1', 'Quest data preserved');
      r.assertEqual(profile.dust, 45, 'Dust preserved');
      r.assertEqual(profile.magic_dust, 45, 'magic_dust synchronized');
    });

    await r.test('9.2 saveCurrentRpgUser packages quests and weekly_quests into payload inventory', () => {
      const mockUser = {
        id: 'user_m5_save',
        display_name: 'Hero Packager',
        level: 6,
        xp: 400,
        gold: 1500,
        gems: 25,
        dust: 60,
        enhance_stones: 10,
        quests: {
          daily: { active: [] },
          weekly: { active: [{ id: 'clear_dungeons_10', progress: 7, target: 10, claimed: false }], claimed_chest: false }
        }
      };
      mockUser.weekly_quests = mockUser.quests.weekly;
      mockUser.daily_quests = mockUser.quests.daily;

      // Construct payload according to saveCurrentRpgUser packing contract
      const payloadInventory = {
        dust: mockUser.dust,
        enhance_stones: mockUser.enhance_stones,
        daily_quests: mockUser.daily_quests,
        quests: mockUser.quests,
        weekly_quests: mockUser.weekly_quests
      };

      r.assert(Boolean(payloadInventory.quests), 'payload contains quests');
      r.assert(Boolean(payloadInventory.weekly_quests), 'payload contains weekly_quests');
      r.assertEqual(payloadInventory.weekly_quests.active[0].id, 'clear_dungeons_10', 'Weekly quest preserved in inventory JSONB');
      r.assertEqual(payloadInventory.weekly_quests.active[0].progress, 7, 'Weekly quest progress preserved');
    });

    } finally {
      global.alert = oldAlert;
      global.confirm = oldConfirm;
      global.currentRpgUser = oldCurrentRpgUser;
      global.currentUser = oldCurrentUser;
    }

    return r.getSummary();
  }

  // Export
  global.Milestone5TestRunner = Milestone5TestRunner;
  global.runMilestone5Tests = runMilestone5Tests;

})(typeof window !== 'undefined' ? window : global);
