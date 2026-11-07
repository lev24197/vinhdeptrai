/**
 * Empirical Adversarial Test Harness for Milestone 5 - Challenger M5_2
 * Focus:
 * 1. Biome mapping completeness across all 100 dungeons
 * 2. Canvas sprite resilience across all 31 unique boss archetypes
 * 3. Cross-module event tracking in full game loops (battle -> quiz -> quests -> achievements)
 */

(function(global) {
  'use strict';

  class AdversarialM5TestRunner {
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

    info(desc) {
      this.results.push({ suite: this.currentSuite, desc, status: 'INFO' });
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

  function getDungeons() {
    if (Array.isArray(global.DUNGEON_DATA_100)) return global.DUNGEON_DATA_100;
    if (global.DUNGEON_DATA_100 && typeof global.DUNGEON_DATA_100 === 'object') {
      return Object.values(global.DUNGEON_DATA_100);
    }
    return [];
  }

  async function runAdversarialM5Tests() {
    const runner = new AdversarialM5TestRunner();

    // =========================================================================
    // SUITE 1: BIOME ICON & THEMED LABEL COMPLETENESS (ALL 100 DUNGEONS)
    // =========================================================================
    runner.suite('1. Biome Mapping & Themed Label Completeness (100 Dungeons)');

    await runner.test('1.1 DUNGEON_DATA_100 contains exactly 100 dungeons with valid biome keys', () => {
      const dungeons = getDungeons();
      runner.assertEqual(dungeons.length, 100, `Expected 100 dungeons, found ${dungeons.length}`);
      dungeons.forEach((d, idx) => {
        runner.assert(d.biome && typeof d.biome === 'string' && d.biome.trim().length > 0,
          `Dungeon #${idx + 1} (${d.cleanEn || d.name}) has empty or invalid biome: [${d.biome}]`);
      });
    });

    await runner.test('1.2 Looking up biomeIcons[dungeon.biome] yields non-fallback themed label and emoji for all 100 dungeons', () => {
      const dungeons = getDungeons();
      const icons = global.biomeIcons || global.BIOME_ICONS || (global.BattleEngine && global.BattleEngine.biomeIcons);
      runner.assert(Boolean(icons), 'biomeIcons dictionary is accessible');

      // Emoji regex matching Unicode emoji, surrogate pairs, and pictographs
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

      const failures = [];
      dungeons.forEach((d, idx) => {
        const biome = d.biome;
        const iconLabel = icons[biome];

        if (!iconLabel || typeof iconLabel !== 'string') {
          failures.push(`Dungeon #${idx + 1} (${d.cleanEn}): biome [${biome}] is missing from biomeIcons`);
          return;
        }

        // Must not fall back to generic 'Hầm Ngục' unless canonical ancient_ruins
        if (iconLabel === '🏛️ Hầm Ngục' && biome !== 'ancient_ruins') {
          failures.push(`Dungeon #${idx + 1} (${d.cleanEn}): biome [${biome}] returned generic fallback label`);
        }

        // Must have emoji
        if (!emojiRegex.test(iconLabel)) {
          failures.push(`Dungeon #${idx + 1} (${d.cleanEn}): biome [${biome}] icon [${iconLabel}] lacks an emoji`);
        }

        // Must have non-trivial label (at least 3 characters of text besides emoji)
        const textOnly = iconLabel.replace(emojiRegex, '').trim();
        if (textOnly.length < 3) {
          failures.push(`Dungeon #${idx + 1} (${d.cleanEn}): biome [${biome}] icon [${iconLabel}] lacks a descriptive text label`);
        }
      });

      runner.assertEqual(failures.length, 0, `All 100 dungeons must have valid themed icons. Failures:\n${failures.slice(0, 10).join('\n')}`);
    });

    await runner.test('1.3 Biome lookup is resilient to string and numeric index keys', () => {
      const dict = global.DUNGEON_DATA_100;
      const icons = global.biomeIcons || global.BIOME_ICONS || (global.BattleEngine && global.BattleEngine.biomeIcons);
      for (let i = 1; i <= 100; i++) {
        const dungeon = dict[i] || dict[String(i)];
        runner.assert(Boolean(dungeon), `Dungeon at key ${i} exists`);
        runner.assert(Boolean(icons[dungeon.biome]), `Dungeon ${i} biome [${dungeon.biome}] has icon`);
      }
    });

    await runner.test('1.4 Legacy and alternate biome aliases resolve correctly without fallback', () => {
      const icons = global.biomeIcons || global.BIOME_ICONS || (global.BattleEngine && global.BattleEngine.biomeIcons);
      const aliases = [
        'fashion_catwalk',
        'clockwork_foundry',
        'concert_symphony',
        'cyber_arcade',
        'celestial_cosmos',
        'quantum_supercomputer',
        'treasury_vault'
      ];
      aliases.forEach(alias => {
        runner.assert(Boolean(icons[alias]), `Alias [${alias}] must be mapped`);
        runner.assert(icons[alias] !== '🏛️ Hầm Ngục', `Alias [${alias}] must not be fallback`);
      });
    });

    // =========================================================================
    // SUITE 2: CANVAS SPRITE RESILIENCE ACROSS ALL 31 BOSS ARCHETYPES
    // =========================================================================
    runner.suite('2. Canvas Sprite Resilience (31 Boss Archetypes)');

    const expectedArchetypes = [
      'fashion_queen', 'barista_dragon', 'hotpot_behemoth',
      'anatomical_titan', 'plague_titan', 'living_wardrobe',
      'cyber_overlord', 'quantum_agi_god', 'abyssal_kraken',
      'cosmic_destroyer', 'midas_gold_dragon', 'omni_carrier_titan',
      'ancient_dryad', 'ancient_golem', 'apex_beast_king',
      'avalanche_behemoth', 'broadcast_overlord', 'calamity_dragon',
      'cathedral_archon', 'chaos_jester', 'ego_shadow',
      'foundry_juggernaut', 'geode_colossus', 'gladiator_champion',
      'iron_judge', 'mutagen_horror', 'patriarch_phantom',
      'scholar_lich', 'skyline_zephyr_behemoth', 'turbo_highway_wyrm',
      'virtuoso_maestro'
    ];

    await runner.test('2.1 Exactly 31 unique archetypes exist in DUNGEON_DATA_100 and match expected archetypes', () => {
      const dungeons = getDungeons();
      const archetypes = [...new Set(dungeons.map(d => d.boss.archetype))].sort();
      runner.assertEqual(archetypes.length, 31, `Expected 31 archetypes, found ${archetypes.length}`);
      expectedArchetypes.forEach(arch => {
        runner.assert(archetypes.includes(arch), `Expected archetype [${arch}] to be present in DUNGEON_DATA_100`);
      });
    });

    // Create a real offscreen HTML5 canvas for rendering tests
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const realCtx = canvas.getContext('2d');

    await runner.test('2.2 Real canvas renders all 31 archetypes under standard baseline conditions', () => {
      expectedArchetypes.forEach(arch => {
        global.BattleEngine.monster = {
          name: `Boss ${arch}`,
          archetype: arch,
          element: 'fire',
          isBoss: true,
          hp: 1500,
          maxHp: 1500,
          ghostHp: 1500,
          scale: 1,
          state: 'idle',
          animTimer: 1.5,
          x: 650,
          y: 150,
          baseY: 150,
          lungeX: 0,
          flashWhite: 0,
          color: '#E11D48',
          wave: 3,
          totalWaves: 3,
          enraged: false
        };
        try {
          global.BattleEngine.drawMonster(realCtx);
        } catch (err) {
          throw new Error(`Standard draw failed for archetype [${arch}]: ${err.message}`);
        }
      });
    });

    await runner.test('2.3 Boss rendering resilience under unexpected scaling factors (0, negative, extreme, NaN, Infinity)', () => {
      const stressScales = [0, -1, -0.5, 0.0001, 100, 99999, NaN, Infinity, -Infinity];

      expectedArchetypes.forEach(arch => {
        stressScales.forEach(scale => {
          global.BattleEngine.monster = {
            name: `Boss ${arch}`,
            archetype: arch,
            element: 'nature',
            isBoss: true,
            hp: 2000,
            maxHp: 2000,
            ghostHp: 2000,
            scale: scale,
            state: 'idle',
            animTimer: 0.5,
            x: 650,
            y: 150,
            baseY: 150,
            lungeX: 0,
            flashWhite: 0,
            color: '#10B981',
            wave: 2,
            totalWaves: 3,
            enraged: false
          };

          try {
            global.BattleEngine.drawMonster(realCtx);
          } catch (err) {
            throw new Error(`Scale [${scale}] failed on archetype [${arch}]: ${err.message}`);
          }
        });
      });
    });

    await runner.test('2.4 Boss rendering resilience under unexpected dimensions & coordinates (extreme negative, giant, NaN)', () => {
      const stressCoords = [
        { x: -9999, baseY: -9999, lungeX: -50 },
        { x: 99999, baseY: 99999, lungeX: 500 },
        { x: 0, baseY: 0, lungeX: 0 },
        { x: NaN, baseY: NaN, lungeX: NaN },
        { x: Infinity, baseY: -Infinity, lungeX: 0 }
      ];

      expectedArchetypes.forEach(arch => {
        stressCoords.forEach(coord => {
          global.BattleEngine.monster = {
            name: `Boss ${arch}`,
            archetype: arch,
            element: 'cyber',
            isBoss: true,
            hp: 500,
            maxHp: 2500,
            ghostHp: 800,
            scale: 1.2,
            state: 'idle',
            animTimer: 2.0,
            x: coord.x,
            y: coord.baseY,
            baseY: coord.baseY,
            lungeX: coord.lungeX,
            flashWhite: 0,
            color: '#38BDF8',
            wave: 1,
            totalWaves: 1,
            enraged: true
          };

          try {
            global.BattleEngine.drawMonster(realCtx);
          } catch (err) {
            throw new Error(`Coords [${coord.x}, ${coord.baseY}] failed on archetype [${arch}]: ${err.message}`);
          }
        });
      });
    });

    await runner.test('2.5 Boss rendering resilience under missing, null, or corrupted monster properties', () => {
      expectedArchetypes.forEach(arch => {
        // Highly degraded monster object with missing optional/non-optional properties
        global.BattleEngine.monster = {
          archetype: arch,
          isBoss: true,
          hp: 0,
          maxHp: 0
        };

        try {
          global.BattleEngine.drawMonster(realCtx);
        } catch (err) {
          throw new Error(`Degraded monster properties failed on archetype [${arch}]: ${err.message}`);
        }
      });
    });

    await runner.test('2.6 Canvas sprite rendering when fed null or undefined ctx', () => {
      let threwOnNull = false;
      let errorMsg = '';
      try {
        global.BattleEngine.monster = {
          archetype: 'fashion_queen',
          isBoss: true,
          scale: 1,
          animTimer: 0,
          baseY: 150,
          lungeX: 0
        };
        global.BattleEngine.drawMonster(null);
      } catch (err) {
        threwOnNull = true;
        errorMsg = err.message;
      }

      runner.assert(threwOnNull, `drawMonster(null) should throw TypeError or be guarded. Result: threw=${threwOnNull} msg=${errorMsg}`);
      runner.info(`drawMonster(null) threw expected runtime exception: [${errorMsg}] because ctx lacks null guard (requires valid CanvasRenderingContext2D).`);
    });

    // =========================================================================
    // SUITE 3: CROSS-MODULE EVENT TRACKING IN FULL GAME LOOPS (ZERO DROPPED STATE)
    // =========================================================================
    runner.suite('3. Cross-Module Event Tracking in Full Game Loops');

    await runner.test('3.1 Full game loop: Battle -> Quiz -> Quests -> Achievements pipeline integration', async () => {
      // Set up a clean mock user profile
      const user = {
        id: 'test_loop_hero',
        display_name: 'Loop Auditor',
        level: 4,
        xp: 120,
        gold: 0,
        gems: 10,
        dust: 50,
        magic_dust: 50,
        enhance_stones: 2,
        daily_quests: {
          date: new Date().toISOString().slice(0, 10),
          tasks: [
            { id: 'dungeon_clear', current: 0, target: 1, completed: false, claimed: false },
            { id: 'combo_streak_5', current: 0, target: 5, completed: false, claimed: false },
            { id: 'c1_c2_words_8', current: 0, target: 8, completed: false, claimed: false },
            { id: 'slay_boss_1', current: 0, target: 1, completed: false, claimed: false }
          ],
          claimed_chest: false
        },
        quests: {
          daily: null,
          weekly: {
            last_reset: Date.now(),
            claimed_chest: false,
            tasks: [
              { id: 'clear_dungeons_10', current: 0, target: 10, completed: false, claimed: false },
              { id: 'defeat_bosses_5', current: 0, target: 5, completed: false, claimed: false },
              { id: 'c1_c2_words_50', current: 0, target: 50, completed: false, claimed: false },
              { id: 'combo_streak_10', current: 0, target: 10, completed: false, claimed: false },
              { id: 'word_correct_100', current: 0, target: 100, completed: false, claimed: false },
              { id: 'earn_gold_1000', current: 0, target: 1000, completed: false, claimed: false }
            ]
          }
        },
        achievements: {
          progress: {},
          unlocked_ids: [],
          claimed_ids: [],
          equipped_title: ''
        }
      };
      user.quests.daily = user.daily_quests;
      user.weekly_quests = user.quests.weekly;

      // Set as active user
      global.currentRpgUser = user;
      global.currentUser = user;
      if (typeof window !== 'undefined') {
        window.currentRpgUser = user;
        window.currentUser = user;
      }

      // Step A: Simulate Quiz Phase (5 consecutive correct C1-C2 answers)
      for (let q = 1; q <= 5; q++) {
        // Emit word_correct and c1_c2_word and combo_streak
        global.GamificationQuests.trackProgress('word_correct', 1);
        global.GamificationQuests.trackProgress('c1_c2_word', 1);
        global.GamificationQuests.trackProgress('combo_streak', q);
      }

      // Verify intermediate quiz progress
      const dailyCombo = user.daily_quests.tasks.find(t => t.id === 'combo_streak_5');
      const dailyC1C2 = user.daily_quests.tasks.find(t => t.id === 'c1_c2_words_8');
      const weeklyC1C2 = user.quests.weekly.tasks.find(t => t.id === 'c1_c2_words_50');
      const weeklyWords = user.quests.weekly.tasks.find(t => t.id === 'word_correct_100');

      runner.assertEqual(dailyCombo.completed, true, 'Daily Combo 5 quest completed on 5th consecutive correct answer');
      runner.assertEqual(dailyC1C2.current, 5, 'Daily C1-C2 words tracked 5/8');
      runner.assertEqual(weeklyC1C2.current, 5, 'Weekly C1-C2 words tracked 5/50');
      runner.assertEqual(weeklyWords.current, 5, 'Weekly word_correct tracked 5/100');
      runner.assertEqual(user.achievements.progress['ach_first_blood'], 1, 'ach_first_blood progress tracked');
      runner.assert(user.achievements.unlocked_ids.includes('ach_first_blood'), 'ach_first_blood unlocked');

      // Step B: Simulate Battle Phase (Single Boss Defeat + Single Dungeon Clear)
      global.GamificationQuests.trackProgress('boss_slain', 1);
      global.GamificationQuests.trackProgress('dungeon_clear', 1);

      // Verify battle quest progress
      const dailyBoss = user.daily_quests.tasks.find(t => t.id === 'slay_boss_1');
      const dailyDungeon = user.daily_quests.tasks.find(t => t.id === 'dungeon_clear');
      const weeklyBoss = user.quests.weekly.tasks.find(t => t.id === 'defeat_bosses_5');
      const weeklyDungeon = user.quests.weekly.tasks.find(t => t.id === 'clear_dungeons_10');

      runner.assertEqual(dailyBoss.completed, true, 'Daily slay_boss completed');
      runner.assertEqual(dailyDungeon.completed, true, 'Daily dungeon_clear completed');
      runner.assertEqual(weeklyBoss.current, 1, 'Weekly defeat_bosses tracked exactly 1/5');
      runner.assertEqual(weeklyDungeon.current, 1, 'Weekly clear_dungeons tracked exactly 1/10');
      runner.assert(user.achievements.unlocked_ids.includes('ach_boss_1'), 'ach_boss_1 unlocked');

      // Step C: Simulate Gold Rewards & Level Up in Auth
      user.gold += 350;
      global.GamificationQuests.trackProgress('gold_earned', 350);
      global.GamificationQuests.trackProgress('gold_balance', user.gold);

      const weeklyGold = user.quests.weekly.tasks.find(t => t.id === 'earn_gold_1000');
      runner.assertEqual(weeklyGold.current, 350, 'Weekly earn_gold tracked 350/1000');

      // Step D: Claim Daily Quest Reward & Verify Inventory/Currency Update
      const oldGold = user.gold;
      const oldXp = user.xp;
      global.GamificationQuests.claimDailyQuest('dungeon_clear');
      runner.assertEqual(dailyDungeon.claimed, true, 'Daily dungeon_clear marked claimed');
      runner.assert(user.gold > oldGold, `Gold increased from ${oldGold} to ${user.gold}`);
      runner.assert(user.xp > oldXp, `XP increased from ${oldXp} to ${user.xp}`);

      // Step E: Claim Achievement & Verify Title and Rewards
      global.GamificationQuests.claimAchievement('ach_first_blood');
      runner.assert(user.achievements.claimed_ids.includes('ach_first_blood'), 'ach_first_blood marked claimed');
      runner.assertEqual(user.achievements.equipped_title, 'Tân Binh Hầm Ngục', 'Title auto-equipped on claim');
    });

    await runner.test('3.2 Dual-alias emission audit: detecting double-counting when callers emit both aliases', () => {
      // Test investigating what happens when callers emit both 'slay_boss' AND 'boss_slain' in succession
      const testUser = {
        id: 'test_alias_audit',
        level: 1,
        daily_quests: {
          date: new Date().toISOString().slice(0, 10),
          tasks: [{ id: 'slay_boss_1', current: 0, target: 1, completed: false, claimed: false }]
        },
        quests: {
          weekly: {
            last_reset: Date.now(),
            tasks: [{ id: 'defeat_bosses_5', current: 0, target: 5, completed: false, claimed: false }]
          }
        },
        achievements: { progress: {}, unlocked_ids: [], claimed_ids: [] }
      };
      testUser.weekly_quests = testUser.quests.weekly;
      global.currentRpgUser = testUser;

      // When callers emit both aliases for one boss kill:
      global.GamificationQuests.trackProgress('slay_boss', 1);
      global.GamificationQuests.trackProgress('boss_slain', 1);

      const weeklyDefeat = testUser.quests.weekly.tasks[0];
      runner.info(`Adversarial finding: Emitting both 'slay_boss' and 'boss_slain' increments defeat_bosses_5 to ${weeklyDefeat.current} (double-counting). Recommend emitting only one canonical event key.`);
      runner.assertEqual(weeklyDefeat.current, 2, 'Verified double increment occurs when dual aliases are fired');
    });

    await runner.test('3.3 Concurrent / interleaved multi-system event stream preserves exact progress without dropping state', () => {
      const user = {
        id: 'test_concurrency_hero',
        level: 1,
        xp: 0,
        gold: 0,
        gems: 0,
        dust: 0,
        daily_quests: {
          date: new Date().toISOString().slice(0, 10),
          tasks: [
            { id: 'dungeon_clear', current: 0, target: 1, completed: false, claimed: false },
            { id: 'open_chest_1', current: 0, target: 1, completed: false, claimed: false },
            { id: 'forge_enhance_1', current: 0, target: 1, completed: false, claimed: false }
          ]
        },
        quests: {
          daily: null,
          weekly: {
            last_reset: Date.now(),
            tasks: [
              { id: 'clear_dungeons_10', current: 0, target: 10, completed: false, claimed: false },
              { id: 'open_chests_5', current: 0, target: 5, completed: false, claimed: false },
              { id: 'forge_enhance_5', current: 0, target: 5, completed: false, claimed: false }
            ]
          }
        },
        achievements: { progress: {}, unlocked_ids: [], claimed_ids: [] }
      };
      user.quests.daily = user.daily_quests;
      user.weekly_quests = user.quests.weekly;
      global.currentRpgUser = user;

      // Interleave 10 events of each type in round-robin sequence
      for (let i = 0; i < 10; i++) {
        global.GamificationQuests.trackProgress('dungeon_clear', 1);
        global.GamificationQuests.trackProgress('open_chest', 1);
        global.GamificationQuests.trackProgress('forge_enhance', 1);
      }

      // Daily targets are 1 -> should be 1
      user.daily_quests.tasks.forEach(t => {
        runner.assertEqual(t.current, 1, `Daily task ${t.id} current capped at target 1`);
        runner.assertEqual(t.completed, true, `Daily task ${t.id} marked completed`);
      });

      // Weekly targets: clear_dungeons (target 10, got 10 -> 10), open_chests (target 5, got 10 -> 5), forge_enhance (target 5, got 10 -> 5)
      const wDungeon = user.quests.weekly.tasks.find(t => t.id === 'clear_dungeons_10');
      const wChest = user.quests.weekly.tasks.find(t => t.id === 'open_chests_5');
      const wForge = user.quests.weekly.tasks.find(t => t.id === 'forge_enhance_5');

      runner.assertEqual(wDungeon.current, 10, 'Weekly dungeons tracked exactly 10');
      runner.assertEqual(wChest.current, 5, 'Weekly chests capped exactly at 5');
      runner.assertEqual(wForge.current, 5, 'Weekly forge capped exactly at 5');
    });

    return runner.getSummary();
  }

  global.AdversarialM5TestRunner = AdversarialM5TestRunner;
  global.runAdversarialM5Tests = runAdversarialM5Tests;

})(typeof window !== 'undefined' ? window : global);
