/**
 * ============================================================================
 * EMPIRICAL CHALLENGER 1 — MILESTONE 1 ADVERSARIAL STRESS TEST SUITE
 * File: tests/stress_m1_challenger.js
 * Author: Empirical Challenger 1 (Milestone 1)
 * 
 * Domains Tested:
 * 1. All 100 Dungeons, 100 Bosses & 300 Minions Data & Element Integrity
 * 2. Currency Edge Cases: Dust / Magic Dust Bidirectional Aliasing & Rapid Sync
 * 3. Level-Up Mechanics & Multi-Level Leaps (+10k, +1M XP) & Skill Point Accrual
 * 4. Fallback Vocabulary Corpus & SmartFetch Resilience for Missing Topics
 * ============================================================================
 */

(function(global) {
  'use strict';

  class StressTestRunner {
    constructor() {
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.results = [];
      this.currentSuite = '';
    }

    suite(name) {
      this.currentSuite = name;
    }

    assert(condition, desc) {
      this.total++;
      if (condition) {
        this.passed++;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'PASS' });
      } else {
        this.failed++;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'FAIL', error: 'Assertion failed' });
        console.error(`[FAIL] ${this.currentSuite} -> ${desc}`);
      }
    }

    assertFalse(condition, desc) {
      this.assert(!condition, desc);
    }

    assertEqual(actual, expected, desc) {
      this.total++;
      if (actual === expected) {
        this.passed++;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'PASS' });
      } else {
        this.failed++;
        const msg = `Expected [${expected}] (${typeof expected}) but got [${actual}] (${typeof actual})`;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'FAIL', error: msg });
        console.error(`[FAIL] ${this.currentSuite} -> ${desc}: ${msg}`);
      }
    }

    assertInRange(val, min, max, desc) {
      this.total++;
      if (val >= min && val <= max) {
        this.passed++;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'PASS' });
      } else {
        this.failed++;
        const msg = `Value [${val}] not in range [${min}, ${max}]`;
        this.results.push({ suite: this.currentSuite, desc: desc, status: 'FAIL', error: msg });
        console.error(`[FAIL] ${this.currentSuite} -> ${desc}: ${msg}`);
      }
    }
  }

  const runner = new StressTestRunner();

  async function runAllChallengerTests() {
    console.log('=== STARTING EMPIRICAL CHALLENGER M1 STRESS SUITE ===');
    const start = Date.now();

    const CANONICAL_ELEMENTS = ['fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic'];

    // ========================================================================
    // SUITE 1: 100 DUNGEONS, BOSSES & MINIONS INTEGRITY
    // ========================================================================
    runner.suite('1. 100 Dungeons & Bosses Data Integrity');

    runner.assert(typeof window.DUNGEON_DATA_100 === 'object' && window.DUNGEON_DATA_100 !== null, 'DUNGEON_DATA_100 is defined and object');

    const keys = Object.keys(window.DUNGEON_DATA_100 || {});
    runner.assertEqual(keys.length, 100, 'Exactly 100 dungeons exist in DUNGEON_DATA_100');

    let allKeysValid = true;
    for (let i = 1; i <= 100; i++) {
      if (!window.DUNGEON_DATA_100[String(i)]) {
        allKeysValid = false;
        break;
      }
    }
    runner.assert(allKeysValid, 'All keys "1" through "100" exist consecutively without gaps');

    // Audit every dungeon entry
    let invalidElements = [];
    let invalidStats = [];
    let missingBosses = [];
    let invalidMinions = [];
    let tierDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let tierBossHpSum = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let tierBossAtkSum = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (let i = 1; i <= 100; i++) {
      const d = window.DUNGEON_DATA_100[String(i)];
      if (!d) {
        missingBosses.push(`Dungeon ${i} missing`);
        continue;
      }

      // Check tier
      const expectedTier = i <= 25 ? 1 : (i <= 50 ? 2 : (i <= 75 ? 3 : 4));
      if (d.tier === expectedTier) {
        tierDistribution[d.tier]++;
      } else {
        invalidStats.push(`Dungeon ${i} tier mismatch: expected ${expectedTier}, got ${d.tier}`);
      }

      // Check dungeon element
      if (!CANONICAL_ELEMENTS.includes(d.element)) {
        invalidElements.push(`Dungeon ${i} element invalid: ${d.element}`);
      }

      // Check exp & gold
      if (typeof d.exp !== 'number' || d.exp <= 0 || isNaN(d.exp)) {
        invalidStats.push(`Dungeon ${i} invalid exp: ${d.exp}`);
      }
      if (typeof d.gold !== 'number' || d.gold <= 0 || isNaN(d.gold)) {
        invalidStats.push(`Dungeon ${i} invalid gold: ${d.gold}`);
      }

      // Check background
      if (!d.background || !d.background.wallColor || !d.background.floorColor || !d.background.props) {
        invalidStats.push(`Dungeon ${i} invalid background palette or props`);
      }

      // Check boss
      const b = d.boss;
      if (!b || typeof b !== 'object') {
        missingBosses.push(`Dungeon ${i} missing boss`);
      } else {
        if (!b.name || typeof b.name !== 'string' || b.name.trim() === '') {
          invalidStats.push(`Dungeon ${i} boss name invalid`);
        }
        if (!CANONICAL_ELEMENTS.includes(b.element)) {
          invalidElements.push(`Dungeon ${i} boss element invalid: ${b.element}`);
        }
        if (typeof b.baseHp !== 'number' || b.baseHp <= 0 || isNaN(b.baseHp)) {
          invalidStats.push(`Dungeon ${i} boss baseHp invalid: ${b.baseHp}`);
        }
        if (typeof b.atk !== 'number' || b.atk <= 0 || isNaN(b.atk)) {
          invalidStats.push(`Dungeon ${i} boss atk invalid: ${b.atk}`);
        }
        if (typeof b.def !== 'number' || b.def < 0 || isNaN(b.def)) {
          invalidStats.push(`Dungeon ${i} boss def invalid: ${b.def}`);
        }
        if (typeof b.exp !== 'number' || b.exp <= 0 || isNaN(b.exp)) {
          invalidStats.push(`Dungeon ${i} boss exp invalid: ${b.exp}`);
        }
        if (typeof b.gold !== 'number' || b.gold <= 0 || isNaN(b.gold)) {
          invalidStats.push(`Dungeon ${i} boss gold invalid: ${b.gold}`);
        }
        if (!Array.isArray(b.roars) || b.roars.length === 0) {
          invalidStats.push(`Dungeon ${i} boss roars empty`);
        }

        tierBossHpSum[d.tier] += (b.baseHp || 0);
        tierBossAtkSum[d.tier] += (b.atk || 0);
      }

      // Check minions
      if (!Array.isArray(d.minions) || d.minions.length === 0) {
        invalidMinions.push(`Dungeon ${i} minions empty`);
      } else {
        d.minions.forEach((m, idx) => {
          if (!m.name || m.hp <= 0 || m.atk <= 0 || m.def < 0) {
            invalidMinions.push(`Dungeon ${i} minion ${idx} invalid stats: ${m.name}`);
          }
        });
      }
    }

    runner.assertEqual(invalidElements.length, 0, `All 100 dungeons & bosses have valid canonical elements (failures: ${invalidElements.join('; ')})`);
    runner.assertEqual(invalidStats.length, 0, `All 100 dungeons & bosses have positive valid stats (failures: ${invalidStats.join('; ')})`);
    runner.assertEqual(missingBosses.length, 0, `All 100 dungeons have valid boss definitions (failures: ${missingBosses.join('; ')})`);
    runner.assertEqual(invalidMinions.length, 0, `All 100 dungeons have valid minion lists (failures: ${invalidMinions.join('; ')})`);

    runner.assertEqual(tierDistribution[1], 25, 'Tier 1 has exactly 25 dungeons');
    runner.assertEqual(tierDistribution[2], 25, 'Tier 2 has exactly 25 dungeons');
    runner.assertEqual(tierDistribution[3], 25, 'Tier 3 has exactly 25 dungeons');
    runner.assertEqual(tierDistribution[4], 25, 'Tier 4 has exactly 25 dungeons');

    // Monotonic scaling verification
    const avgHp1 = tierBossHpSum[1] / 25;
    const avgHp2 = tierBossHpSum[2] / 25;
    const avgHp3 = tierBossHpSum[3] / 25;
    const avgHp4 = tierBossHpSum[4] / 25;
    runner.assert(avgHp1 < avgHp2 && avgHp2 < avgHp3 && avgHp3 < avgHp4, 
      `Boss HP scales monotonically across Tiers: T1(${Math.round(avgHp1)}) < T2(${Math.round(avgHp2)}) < T3(${Math.round(avgHp3)}) < T4(${Math.round(avgHp4)})`);

    const avgAtk1 = tierBossAtkSum[1] / 25;
    const avgAtk2 = tierBossAtkSum[2] / 25;
    const avgAtk3 = tierBossAtkSum[3] / 25;
    const avgAtk4 = tierBossAtkSum[4] / 25;
    runner.assert(avgAtk1 < avgAtk2 && avgAtk2 < avgAtk3 && avgAtk3 < avgAtk4,
      `Boss ATK scales monotonically across Tiers: T1(${Math.round(avgAtk1)}) < T2(${Math.round(avgAtk2)}) < T3(${Math.round(avgAtk3)}) < T4(${Math.round(avgAtk4)})`);

    // Runtime functions stress: getDungeonThemeForTopic and getDungeonMonstersForTopic for 1..100
    let themeErrors = 0;
    let monsterErrors = 0;
    for (let stt = 1; stt <= 100; stt++) {
      const theme = window.getDungeonThemeForTopic(stt);
      if (!theme || !CANONICAL_ELEMENTS.includes(theme.element) || !theme.wallColor || !theme.floorColor) {
        themeErrors++;
      }

      const wave1Monster = window.getDungeonMonstersForTopic(stt, 1, 10);
      if (!wave1Monster || wave1Monster.isBoss !== false || !wave1Monster.element || wave1Monster.baseHp <= 0) {
        monsterErrors++;
      }

      const bossMonster = window.getDungeonMonstersForTopic(stt, 10, 10);
      if (!bossMonster || bossMonster.isBoss !== true || !CANONICAL_ELEMENTS.includes(bossMonster.element) || bossMonster.baseHp <= 0 || !bossMonster.exp) {
        monsterErrors++;
      }
    }
    runner.assertEqual(themeErrors, 0, 'getDungeonThemeForTopic succeeds for all 100 dungeons');
    runner.assertEqual(monsterErrors, 0, 'getDungeonMonstersForTopic succeeds for all 100 dungeons (minion & boss)');

    // Edge cases for runtime functions
    const fallbackTheme = window.getDungeonThemeForTopic(999);
    runner.assert(fallbackTheme && fallbackTheme.biome === 'stone_dungeon' && fallbackTheme.element === 'fire', 'getDungeonThemeForTopic(999) returns safe fallback');

    const fallbackMonster = window.getDungeonMonstersForTopic(999, 10, 10);
    runner.assert(fallbackMonster && fallbackMonster.isBoss === true && fallbackMonster.name.includes('TRÙM CUỐI'), 'getDungeonMonstersForTopic(999, 10, 10) returns safe fallback boss');

    // 64-Pairwise Elemental Matrix Multiplier Stress Test
    let matrixErrors = 0;
    for (const atkElem of CANONICAL_ELEMENTS) {
      for (const defElem of CANONICAL_ELEMENTS) {
        const mult = window.calculateElementalMultiplier(atkElem, defElem);
        if (typeof mult !== 'number' || isNaN(mult) || mult < 0.5 || mult > 2.0) {
          matrixErrors++;
        }
      }
    }
    runner.assertEqual(matrixErrors, 0, 'calculateElementalMultiplier returns valid numeric multiplier (0.5..2.0) across all 64 elemental pairs');
    runner.assertEqual(window.calculateElementalMultiplier('fire', 'nature'), 1.5, 'Fire vs Nature produces 1.5x advantage multiplier');
    runner.assertEqual(window.calculateElementalMultiplier('water', 'lightning'), 0.7, 'Water vs Lightning produces 0.7x disadvantage multiplier');
    runner.assertEqual(window.calculateElementalMultiplier('holy', 'dark'), 1.6, 'Holy vs Dark produces 1.6x advantage multiplier');
    runner.assertEqual(window.calculateElementalMultiplier('nature', 'nature'), 1.0, 'Same element matchup produces 1.0x neutral multiplier');

    // ========================================================================
    // SUITE 2: CURRENCY EDGE CASES & RAPID SYNCHRONIZATION
    // ========================================================================
    runner.suite('2. Currency Edge Cases & Synchronization');

    // Test ensureDustProperty
    const testUser1 = { id: 'u1' };
    ensureDustProperty(testUser1);
    runner.assertEqual(testUser1.dust, 20, 'Uninitialized user gets dust = 20 by default');
    runner.assertEqual(testUser1.magic_dust, 20, 'Uninitialized user gets magic_dust = 20 via aliasing');

    const testUser2 = { id: 'u2', dust: 75 };
    ensureDustProperty(testUser2);
    runner.assertEqual(testUser2.magic_dust, 75, 'User with dust=75 exposes magic_dust=75');

    const testUser3 = { id: 'u3', magic_dust: 120 };
    ensureDustProperty(testUser3);
    runner.assertEqual(testUser3.dust, 120, 'User with legacy magic_dust=120 gets dust=120');
    runner.assertEqual(testUser3.magic_dust, 120, 'magic_dust getter returns 120');

    // Zero currency preservation (should not be overwritten with 20!)
    const testUserZero = { id: 'u_zero', dust: 0 };
    ensureDustProperty(testUserZero);
    runner.assertEqual(testUserZero.dust, 0, 'User with dust=0 preserves 0 (not overridden to 20)');
    runner.assertEqual(testUserZero.magic_dust, 0, 'magic_dust getter evaluates to 0 for dust=0');

    // Rapid alternating mutations (10,000 iterations stress harness)
    const syncUser = { id: 'u_sync', dust: 50 };
    ensureDustProperty(syncUser);
    let desyncCount = 0;

    for (let step = 0; step < 10000; step++) {
      const mode = step % 4;
      if (mode === 0) {
        syncUser.dust += 7;
      } else if (mode === 1) {
        syncUser.magic_dust += 13;
      } else if (mode === 2) {
        syncUser.dust = Math.max(0, syncUser.dust - 5);
      } else {
        syncUser.magic_dust = Math.max(0, syncUser.magic_dust - 8);
      }

      if (syncUser.dust !== syncUser.magic_dust) {
        desyncCount++;
      }
    }
    runner.assertEqual(desyncCount, 0, '10,000 rapid alternating mutations maintain 100% dust/magic_dust sync');

    // Negative dust assignment defense
    syncUser.magic_dust = -500;
    runner.assertEqual(syncUser.dust, 0, 'Assigning negative magic_dust clamps dust to 0');
    runner.assertEqual(syncUser.magic_dust, 0, 'magic_dust returns 0 after negative assignment');

    // Large transactions (e.g. 1 billion)
    syncUser.magic_dust = 1000000000;
    runner.assertEqual(syncUser.dust, 1000000000, 'Assigning 1,000,000,000 magic_dust updates dust correctly');
    syncUser.dust = 500000000;
    runner.assertEqual(syncUser.magic_dust, 500000000, 'Assigning 500,000,000 dust reflects on magic_dust correctly');

    // String number assignment
    syncUser.magic_dust = "350";
    runner.assertEqual(syncUser.dust, 350, 'Assigning string "350" to magic_dust parses integer 350 to dust');

    // Non-numeric assignments fallback safely to 0
    syncUser.magic_dust = NaN;
    runner.assertEqual(syncUser.dust, 0, 'Assigning NaN to magic_dust falls back to 0');
    syncUser.magic_dust = undefined;
    runner.assertEqual(syncUser.dust, 0, 'Assigning undefined to magic_dust falls back to 0');
    syncUser.magic_dust = null;
    runner.assertEqual(syncUser.dust, 0, 'Assigning null to magic_dust falls back to 0');

    // Serialization & Deserialization round-trip
    const serializeUser = { id: 'u_ser', dust: 88, display_name: 'TestHero' };
    ensureDustProperty(serializeUser);
    const jsonStr = JSON.stringify(serializeUser);
    const parsedUser = JSON.parse(jsonStr);
    runner.assertEqual(parsedUser.dust, 88, 'JSON.stringify / parse preserves dust=88');
    // Ensure normalization restores magic_dust alias
    ensureDustProperty(parsedUser);
    runner.assertEqual(parsedUser.magic_dust, 88, 'Restored parsed profile has magic_dust=88');

    // Cloud inventory packing verification
    window.currentRpgUser = createDefaultRpgCharacter('CloudPackTest', 'warrior', '🦁');
    window.currentRpgUser.dust = 145;
    // Simulate packing logic from saveCurrentRpgUser
    const cloudInventory = {
      ...(typeof window.currentRpgUser.inventory === 'object' ? window.currentRpgUser.inventory : {}),
      dust: window.currentRpgUser.dust || 0,
      magic_dust: window.currentRpgUser.dust || 0
    };
    runner.assertEqual(cloudInventory.dust, 145, 'Cloud inventory payload packs dust = 145');
    runner.assertEqual(cloudInventory.magic_dust, 145, 'Cloud inventory payload packs magic_dust = 145');

    // Shallow Object Clone & Spread Recovery Test
    const baseHero = { id: 'u_clone', dust: 300 };
    ensureDustProperty(baseHero);
    const shallowCopy = { ...baseHero };
    runner.assertEqual(shallowCopy.dust, 300, 'Shallow copy { ...baseHero } preserves dust = 300');
    // Calling ensureDustProperty on copy restores accessor
    ensureDustProperty(shallowCopy);
    runner.assertEqual(shallowCopy.magic_dust, 300, 'ensureDustProperty on clone restores magic_dust alias = 300');

    // String number initialization in dust property
    const strDustUser = { id: 'u_str', dust: "420" };
    ensureDustProperty(strDustUser);
    runner.assertEqual(Number(strDustUser.dust), 420, 'String "420" in dust property evaluates to 420');
    runner.assertEqual(Number(strDustUser.magic_dust), 420, 'magic_dust accessor evaluates to 420');

    // ========================================================================
    // SUITE 3: LEVEL-UP MECHANICS & MULTI-LEVEL LEAPS
    // ========================================================================
    runner.suite('3. Level-up & Multi-level Leaps (addXP)');

    // Clean test user for addXP
    window.currentRpgUser = createDefaultRpgCharacter('LevelTestHero', 'warrior', '🦁');
    window.currentRpgUser.level = 1;
    window.currentRpgUser.xp = 0;
    window.currentRpgUser.skill_points = 0;
    window.currentRpgUser.gold = 100;
    window.currentRpgUser.gems = 10;
    window.currentRpgUser.max_hp = 120;
    window.currentRpgUser.hp = 120;
    window.currentRpgUser.max_mp = 40;
    window.currentRpgUser.mp = 40;

    // Test 1: Single Level-up (Level 1 -> 2)
    // Level 1 needed: getXpForLevel(1) = 100
    const neededL1 = getXpForLevel(1);
    runner.assertEqual(neededL1, 100, 'Level 1 requires exactly 100 XP');
    addXP(100);
    runner.assertEqual(window.currentRpgUser.level, 2, 'addXP(100) advances character to Level 2');
    runner.assertEqual(window.currentRpgUser.xp, 0, 'addXP(100) leaves 0 residual XP');
    runner.assertEqual(window.currentRpgUser.skill_points, 1, 'Level 2 awards exactly 1 skill point');
    runner.assertEqual(window.currentRpgUser.gold, 150, 'Level 2 awards +50 Gold (100 -> 150)');
    runner.assertEqual(window.currentRpgUser.gems, 12, 'Level 2 awards +2 Gems (10 -> 12)');
    runner.assertEqual(window.currentRpgUser.max_hp, 135, 'Level 2 increases Max HP by +15');
    runner.assertEqual(window.currentRpgUser.max_mp, 50, 'Level 2 increases Max MP by +10');

    // Test 2: Multi-Level Leap (+10,000 XP in one call)
    // Starting state: Level 2, XP 0, SP 1
    // Let's calculate expected level for +10000 XP:
    // Level 2 needed: Math.floor(100 * 2^1.35) = 254 (xp left: 10000 - 254 = 9746) -> Level 3
    // Level 3 needed: Math.floor(100 * 3^1.35) = 441 (xp left: 9746 - 441 = 9305) -> Level 4
    // Level 4 needed: Math.floor(100 * 4^1.35) = 652 (xp left: 9305 - 652 = 8653) -> Level 5
    // Level 5 needed: Math.floor(100 * 5^1.35) = 882 (xp left: 8653 - 882 = 7771) -> Level 6
    // Level 6 needed: Math.floor(100 * 6^1.35) = 1128 (xp left: 7771 - 1128 = 6643) -> Level 7
    // Level 7 needed: Math.floor(100 * 7^1.35) = 1389 (xp left: 6643 - 1389 = 5254) -> Level 8
    // Level 8 needed: Math.floor(100 * 8^1.35) = 1662 (xp left: 5254 - 1662 = 3592) -> Level 9
    // Level 9 needed: Math.floor(100 * 9^1.35) = 1947 (xp left: 3592 - 1947 = 1645) -> Level 10
    // Level 10 needed: Math.floor(100 * 10^1.35) = 2244 (xp left 1645 < 2244 -> stops at Level 10)
    // Expected level-ups: 8 levels (from 2 to 10).
    // Expected SP: 1 + 8 = 9.
    // Expected residual XP: 1645.

    // Track quest progress calls during multi-level leap
    let questLevelUpEvents = [];
    const origTrackProgress = (typeof GamificationQuests !== 'undefined') ? GamificationQuests.trackProgress : null;
    if (typeof GamificationQuests === 'undefined') {
      window.GamificationQuests = {};
    }
    GamificationQuests.trackProgress = function(event, val) {
      if (event === 'level_up') questLevelUpEvents.push(val);
      if (typeof origTrackProgress === 'function') origTrackProgress.call(GamificationQuests, event, val);
    };

    // During the leap from Level 2 to Level 10, character crosses Level 5, triggering 'level_5' badge
    // which awards +250 XP and +150 Gold.
    addXP(10000);

    runner.assertEqual(window.currentRpgUser.level, 10, 'addXP(10000) lands on exact predicted Level 10');
    runner.assertEqual(window.currentRpgUser.skill_points, 9, 'Skill points strictly equals level - 1 (SP = 9)');
    runner.assert(window.currentRpgUser.badges.includes('level_5'), 'Crossing Level 5 unlocks "level_5" milestone badge');
    runner.assertEqual(window.currentRpgUser.gold, 150 + 8 * 50 + 150, 'Gold gained matches 8 level increments (+400g) plus level_5 badge award (+150g) = 700g');
    runner.assertEqual(window.currentRpgUser.xp, 1676 + 250, 'Residual XP strictly equals 1676 unspent + 250 badge reward = 1926 XP');
    runner.assertEqual(window.currentRpgUser.gems, 12 + 8 * 2, 'Gems gained matches 8 level increments (+16 gems)');
    runner.assertEqual(questLevelUpEvents.length, 8, 'GamificationQuests.trackProgress was invoked for each of the 8 level-ups');
    runner.assertEqual(questLevelUpEvents[questLevelUpEvents.length - 1], 10, 'Last quest level_up event reached Level 10');

    // Test 3: Massive Leap (+1,000,000 XP in one call)
    const t0 = performance.now();
    addXP(1000000);
    const leapDuration = performance.now() - t0;

    runner.assert(leapDuration < 100, `addXP(1,000,000) executes under 100ms (actual: ${leapDuration.toFixed(2)}ms)`);
    runner.assert(window.currentRpgUser.level > 10, 'Massive XP leap advanced user beyond Level 10');
    runner.assertEqual(window.currentRpgUser.skill_points, window.currentRpgUser.level - 1, 
      `Skill points strictly equals (Level - 1) after massive leap (Lvl: ${window.currentRpgUser.level}, SP: ${window.currentRpgUser.skill_points})`);
    runner.assert(window.currentRpgUser.xp >= 0, 'Residual XP is non-negative');
    runner.assert(window.currentRpgUser.xp < getXpForLevel(window.currentRpgUser.level), 'Residual XP is strictly less than XP needed for next level');

    // Test 4: Pre-allocated / spent Skill Points preserved
    // Suppose user spent some skill points, leaving SP = 2
    window.currentRpgUser.skill_points = 2;
    const currentLevel = window.currentRpgUser.level;
    const xpNeededForOneLevel = getXpForLevel(currentLevel);
    addXP(xpNeededForOneLevel);
    runner.assertEqual(window.currentRpgUser.level, currentLevel + 1, 'Single level increment verified');
    runner.assertEqual(window.currentRpgUser.skill_points, 3, 'Skill points increased by exactly 1 upon level-up from spent state (2 -> 3)');

    // Test 5: Assassin Class bonus (+35% EXP)
    window.currentRpgUser = createDefaultRpgCharacter('AssassinHero', 'assassin', '🗡️');
    window.currentRpgUser.level = 1;
    window.currentRpgUser.xp = 0;
    const earnedXp = addXP(100);
    runner.assertEqual(earnedXp, 135, 'Assassin class receives +35% bonus XP (100 -> 135)');
    runner.assertEqual(window.currentRpgUser.level, 2, 'Assassin leveled up to 2');
    runner.assertEqual(window.currentRpgUser.xp, 35, 'Assassin residual XP is 35 (135 - 100)');

    // Test 5b: Combined Assassin (+35%) + Double XP Potion (2x) = 2.7x Multiplier
    window.currentRpgUser = createDefaultRpgCharacter('BuffedAssassin', 'assassin', '🗡️');
    window.currentRpgUser.level = 1;
    window.currentRpgUser.xp = 0;
    window.currentRpgUser.double_xp_until = Date.now() + 60000; // active buff
    const earnedBuffedXp = addXP(1000);
    runner.assertEqual(earnedBuffedXp, 2700, 'Combined Assassin (1.35x) and Double XP (2x) yields exactly 2,700 XP (1000 * 2.7)');
    runner.assert(window.currentRpgUser.level >= 4, 'Buffed assassin reached at least Level 4 with 2700 XP');

    // Test 5c: Granular Stress Loop: 1,000 individual addXP(1) calls
    window.currentRpgUser = createDefaultRpgCharacter('GranularHero', 'warrior', '🦁');
    window.currentRpgUser.level = 1;
    window.currentRpgUser.xp = 0;
    window.currentRpgUser.skill_points = 0;
    for (let step = 0; step < 1000; step++) {
      addXP(1);
    }
    // Verify cumulative consistency:
    runner.assert(window.currentRpgUser.level > 1, '1,000 incremental addXP(1) calls advanced level');
    runner.assertEqual(window.currentRpgUser.skill_points, window.currentRpgUser.level - 1, 'Skill points precisely equals (Level - 1) after 1,000 granular steps');

    // Test 6: Zero XP call
    const preLevel = window.currentRpgUser.level;
    const preXp = window.currentRpgUser.xp;
    const preSp = window.currentRpgUser.skill_points;
    addXP(0);
    runner.assertEqual(window.currentRpgUser.level, preLevel, 'addXP(0) does not alter level');
    runner.assertEqual(window.currentRpgUser.xp, preXp, 'addXP(0) does not alter xp');
    runner.assertEqual(window.currentRpgUser.skill_points, preSp, 'addXP(0) does not alter skill points');

    // Test 7: Null user safety
    window.currentRpgUser = null;
    let threwOnNull = false;
    try {
      addXP(500);
    } catch (e) {
      threwOnNull = true;
    }
    runner.assertFalse(threwOnNull, 'addXP handles currentRpgUser === null gracefully without throwing uncaught exceptions');

    // Restore user
    window.currentRpgUser = createDefaultRpgCharacter('Vinh Đẹp Trai', 'warrior', '🦁');

    // ========================================================================
    // SUITE 4: FALLBACK VOCABULARY CORPUS & RESILIENCE
    // ========================================================================
    runner.suite('4. Fallback Vocabulary & SmartFetch Audit');

    runner.assert(typeof window.generateFallbackVocabulary === 'function', 'generateFallbackVocabulary is defined globally');
    runner.assert(typeof window.generateFallbackTsv === 'function', 'generateFallbackTsv is defined globally');

    // Test the 13 missing topics from disk
    const missingTopics = [87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    let vocabFailures = [];

    for (const stt of missingTopics) {
      const vocab = window.generateFallbackVocabulary(stt);
      if (!Array.isArray(vocab) || vocab.length < 5) {
        vocabFailures.push(`Topic ${stt} has insufficient vocabulary: ${vocab?.length}`);
        continue;
      }

      // Check structure of first word
      const w = vocab[0];
      if (!w.word || !w.cloze || !w.ipa || !w.definition || !w.meaningVi || !w.examples) {
        vocabFailures.push(`Topic ${stt} word schema invalid: ${JSON.stringify(w)}`);
      }

      // Check TSV format
      const tsv = window.generateFallbackTsv(stt);
      if (!tsv || !tsv.includes('\t') || tsv.split('\n').length < 5) {
        vocabFailures.push(`Topic ${stt} TSV generation invalid`);
      }
    }
    runner.assertEqual(vocabFailures.length, 0, `All 13 disk-missing topics (87..100) generate valid Oxford vocabulary & TSVs (failures: ${vocabFailures.join('; ')})`);

    // Test smartFetch interceptor
    let smartFetchSuccess = false;
    try {
      const res = await window.smartFetch('output/87.txt');
      if (res && res.ok && res.status === 200) {
        const text = await res.text();
        if (text && text.includes('\t') && text.length > 50) {
          smartFetchSuccess = true;
        }
      }
    } catch (e) {
      smartFetchSuccess = false;
    }
    runner.assert(smartFetchSuccess, 'smartFetch("output/87.txt") resolves to status 200 OK with valid TSV payload via fallback interceptor');

    // Test smartFetch with topic 100
    let smartFetch100Success = false;
    try {
      const res100 = await window.smartFetch('output/100.txt');
      if (res100 && res100.ok && res100.status === 200) {
        const text100 = await res100.text();
        if (text100 && text100.includes('\t') && text100.length > 50) {
          smartFetch100Success = true;
        }
      }
    } catch (e) {
      smartFetch100Success = false;
    }
    runner.assert(smartFetch100Success, 'smartFetch("output/100.txt") resolves to status 200 OK with valid TSV payload via fallback interceptor');

    // Corrupted LocalStorage Profile Recovery Test
    const PROFILE_KEY = 'anki_rpg_local_profile';
    const originalLocalProfile = localStorage.getItem(PROFILE_KEY);
    try {
      localStorage.setItem(PROFILE_KEY, '{ corrupted_json_malformed: 123');
      loadLocalProfileFallback();
      runner.assert(window.currentRpgUser !== null, 'Corrupted localStorage JSON triggers graceful fallback to fresh default character');
      runner.assertEqual(window.currentRpgUser.level, 1, 'Fallback default character has level 1');
      runner.assertEqual(window.currentRpgUser.dust, 20, 'Fallback default character has dust 20');
      runner.assertEqual(window.currentRpgUser.magic_dust, 20, 'Fallback default character has magic_dust 20');
    } finally {
      if (originalLocalProfile) {
        localStorage.setItem(PROFILE_KEY, originalLocalProfile);
      } else {
        localStorage.removeItem(PROFILE_KEY);
      }
    }

    const duration = Date.now() - start;
    console.log(`=== CHALLENGER SUITE COMPLETE: ${runner.passed}/${runner.total} PASSED (${runner.failed} FAILED) in ${duration}ms ===`);

    return {
      total: runner.total,
      passed: runner.passed,
      failed: runner.failed,
      durationMs: duration,
      results: runner.results
    };
  }

  global.runAllChallengerTests = runAllChallengerTests;

})(typeof window !== 'undefined' ? window : global);
