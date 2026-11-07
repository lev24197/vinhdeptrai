/**
 * Milestone 1 Stress Test Suite & Empirical Bug Reproduction Harness
 * Executed via Headless Chrome
 */

window.__M1_STRESS_RESULTS__ = {
  suites: [],
  total: 0,
  passed: 0,
  failed: 0,
  bugsFound: []
};

const suiteRegistrations = [];

function describe(suiteName, fn) {
  suiteRegistrations.push({ name: suiteName, fn });
}

window.runMilestone1StressSuites = async function() {
  for (const reg of suiteRegistrations) {
    const currentSuite = {
      name: reg.name,
      tests: [],
      passed: 0,
      failed: 0
    };
    window.__M1_STRESS_RESULTS__.suites.push(currentSuite);

    const queuedTests = [];
    reg.fn({
      test(name, fn) { queuedTests.push({ name, fn, isAsync: false }); },
      asyncTest(name, fn) { queuedTests.push({ name, fn, isAsync: true }); }
    });

    for (const t of queuedTests) {
      window.__M1_STRESS_RESULTS__.total++;
      const resultItem = { name: t.name, passed: false, error: null, duration: 0 };
      const t0 = performance.now();
      try {
        if (t.isAsync) {
          await t.fn();
        } else {
          t.fn();
        }
        resultItem.passed = true;
        currentSuite.passed++;
        window.__M1_STRESS_RESULTS__.passed++;
      } catch (err) {
        resultItem.passed = false;
        resultItem.error = err.message || String(err);
        currentSuite.failed++;
        window.__M1_STRESS_RESULTS__.failed++;
      } finally {
        resultItem.duration = Math.round(performance.now() - t0);
        currentSuite.tests.push(resultItem);
      }
    }
  }
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected [${expected}], got [${actual}]`);
  }
}

// =========================================================================
// SUITE 1: VOCABULARY FALLBACK GENERATOR BOUNDARY & STRESS TESTS
// =========================================================================
describe('Suite 1: Vocabulary Fallback Generator Stress & Boundaries', ({ test, asyncTest }) => {

  test('T1.1: Every topic 1 to 100 generates valid schema of >= 8 items', () => {
    for (let stt = 1; stt <= 100; stt++) {
      const words = window.generateFallbackVocabulary(stt);
      assert(Array.isArray(words), `Topic ${stt} fallback vocabulary is not an array`);
      assert(words.length >= 8, `Topic ${stt} fallback vocabulary has only ${words.length} items (expected >= 8)`);
      for (let i = 0; i < words.length; i++) {
        const item = words[i];
        assert(item.word && typeof item.word === 'string', `Topic ${stt} word[${i}] has empty word`);
        assert(item.cloze && typeof item.cloze === 'string', `Topic ${stt} word[${i}] has empty cloze`);
        assert(item.ipa && typeof item.ipa === 'string', `Topic ${stt} word[${i}] has empty ipa`);
        assert(item.sound && item.sound.startsWith('[sound:'), `Topic ${stt} word[${i}] sound malformed: ${item.sound}`);
        assert(item.definition && typeof item.definition === 'string', `Topic ${stt} word[${i}] has empty definition`);
        assert(item.meaningVi && typeof item.meaningVi === 'string', `Topic ${stt} word[${i}] has empty meaningVi`);
        assert(item.plural && typeof item.plural === 'string', `Topic ${stt} word[${i}] has empty plural`);
        assert(item.examples && typeof item.examples === 'string', `Topic ${stt} word[${i}] has empty examples`);
      }
    }
  });

  test('T1.2: Corpus topics 87-100 specifically load rich Oxford/CEFR words with cloze and IPA', () => {
    const corpusTopics = [87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    for (const stt of corpusTopics) {
      assert(window.FALLBACK_VOCABULARY_CORPUS[stt], `FALLBACK_VOCABULARY_CORPUS missing topic ${stt}`);
      const words = window.generateFallbackVocabulary(stt);
      assert(words.length >= 12, `Topic ${stt} has ${words.length} words in corpus (expected >= 12)`);
      for (const w of words) {
        assert(w.ipa.startsWith('/'), `Topic ${stt} word ${w.word} has invalid IPA ${w.ipa}`);
        assert(w.cloze.includes('_'), `Topic ${stt} word ${w.word} cloze does not contain blanks: ${w.cloze}`);
        assert(w.meaningVi.length > 2, `Topic ${stt} word ${w.word} Vietnamese translation too short`);
      }
    }
  });

  test('T1.3: Boundary & extreme topic numbers (0, 101, 9999, -1, NaN, null, undefined, empty string)', () => {
    const edgeCases = [
      0, 101, 9999, -1, NaN, null, undefined, '', 'abc', '999', 3.14, -Infinity, Infinity, {}, []
    ];
    for (const stt of edgeCases) {
      const words = window.generateFallbackVocabulary(stt);
      assert(Array.isArray(words), `Edge case [${stt}] did not return an array`);
      assert(words.length === 8, `Edge case [${stt}] should return 8 generic fallback words, got ${words.length}`);
      assert(words[0].word === 'concept', `Edge case [${stt}] first generic word should be 'concept'`);
      assert(words[0].definition.length > 0, `Edge case [${stt}] definition is empty`);
    }
  });

  test('T1.4: generateFallbackTsv formatting across boundaries (0, 87, 100, 101, NaN, -1)', () => {
    const testCases = [0, 87, 90, 99, 100, 101, NaN, -1];
    for (const stt of testCases) {
      const tsv = window.generateFallbackTsv(stt);
      assert(typeof tsv === 'string' && tsv.length > 0, `TSV for [${stt}] is empty`);
      const lines = tsv.split('\n').filter(l => l.trim());
      assert(lines.length >= 8, `TSV for [${stt}] has fewer than 8 lines: ${lines.length}`);
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        assert(cols.length === 9, `TSV for [${stt}] line ${i} has ${cols.length} columns, expected 9 (tab-separated)`);
        assert(cols[0].length > 0, `TSV col 0 (word) empty`);
        assert(cols[1].length > 0, `TSV col 1 (cloze) empty`);
        assert(cols[2].startsWith('/'), `TSV col 2 (ipa) invalid`);
        assert(cols[3].startsWith('[sound:'), `TSV col 3 (sound) invalid`);
        assert(cols[4].length > 0, `TSV col 4 (def) empty`);
        assert(cols[5].length > 0, `TSV col 5 (vi) empty`);
        assert(cols[7].length > 0, `TSV col 7 (plural) empty`);
        assert(cols[8].length > 0, `TSV col 8 (ex) empty`);
      }
    }
  });

  asyncTest('T1.5: smartFetch interception for missing files vs existing files vs invalid paths', async () => {
    // 1. Missing file: output/87.txt
    const res87 = await window.smartFetch('output/87.txt');
    assert(res87.ok, 'smartFetch output/87.txt should return ok=true');
    const text87 = await res87.text();
    assert(text87.includes('hotel\th___l'), 'smartFetch output/87.txt should contain fallback hotel');

    // 2. Existing file: output/90.txt (or another existing output)
    const res90 = await window.smartFetch('output/90.txt');
    assert(res90.ok, 'smartFetch output/90.txt should return ok=true');
    const text90 = await res90.text();
    assert(text90.length > 0, 'smartFetch output/90.txt should have content');

    // 3. Boundary file: output/0.txt
    const res0 = await window.smartFetch('output/0.txt');
    assert(res0.ok, 'smartFetch output/0.txt should return ok=true');
    const text0 = await res0.text();
    assert(text0.includes('concept\tc_____t'), 'smartFetch output/0.txt should return generic concept');

    // 4. Boundary file: output/101.txt
    const res101 = await window.smartFetch('output/101.txt');
    assert(res101.ok, 'smartFetch output/101.txt should return ok=true');

    // 5. Invalid path: output/non_numeric.txt should throw
    let errThrown = false;
    try {
      await window.smartFetch('output/non_numeric.txt');
    } catch (e) {
      errThrown = true;
    }
    assert(errThrown, 'smartFetch output/non_numeric.txt should throw an error');
  });

  test('T1.6: ensureTopicVocabularyFallback populates quizWordsCache and protects quiz sessions', () => {
    if (!window.quizWordsCache) window.quizWordsCache = {};
    delete window.quizWordsCache[88];
    const generated = window.ensureTopicVocabularyFallback(88);
    assert(Array.isArray(generated) && generated.length >= 12, 'ensureTopicVocabularyFallback did not return array');
    assert(window.quizWordsCache[88] && window.quizWordsCache[88].length >= 12, 'quizWordsCache[88] not populated');

    // Test invalid topic 9999 into quizWordsCache
    delete window.quizWordsCache[9999];
    window.ensureTopicVocabularyFallback(9999);
    assert(window.quizWordsCache[9999] && window.quizWordsCache[9999].length === 8, 'quizWordsCache[9999] not populated with generic words');
  });

});

// =========================================================================
// SUITE 2: SUPABASE GUEST PROGRESS MERGE EDGE CASES & LIMITATIONS
// =========================================================================
describe('Suite 2: Supabase Guest Merge Edge Cases & State Persistence', ({ test, asyncTest }) => {

  asyncTest('T2.1: Advanced Guest merges into Fresh Cloud Account (level, currencies, stats, dungeons)', async () => {
    // Mock Supabase environment
    const originalClient = window.supabaseClient;
    const originalUser = window.currentRpgUser;
    const originalSession = window.currentSession;

    try {
      // Setup Guest with advanced progress
      window.currentRpgUser = {
        id: 'local_guest_123',
        is_cloud: false,
        display_name: 'Khách Đại Hiệp',
        avatar: '🦁',
        rpg_class: 'warrior',
        level: 10,
        xp: 450,
        hp: 255,
        max_hp: 255,
        mp: 140,
        max_mp: 140,
        gold: 5000,
        gems: 150,
        dust: 60,
        enhance_stones: 15,
        skill_points: 8,
        streak: 7,
        unlocked_dungeons: [1, 2, 3, 4, 5],
        badges: ['first_login', 'boss_slayer'],
        unlocked_titles: ['Tân Binh Anki', 'Dũng Sĩ Diệt Boss'],
        equipped_title: 'Dũng Sĩ Diệt Boss',
        stats: {
          monsters_slain: 50,
          bosses_slain: 5,
          dungeons_cleared: 5
        },
        equipment_inventory: ['iron_sword_p3', 'iron_armor_p2'],
        equipped: { weapon: 'iron_sword_p3', armor: 'iron_armor_p2' },
        equipment_enhances: { weapon: 3, armor: 2 },
        inventory: {
          health_potion: 8,
          mana_potion: 5,
          double_xp: 3
        }
      };
      ensureDustProperty(window.currentRpgUser);

      // Setup brand new cloud profile data
      const cloudProfile = {
        id: 'cloud_user_new',
        email: 'newuser@anki.vn',
        display_name: 'Hiệp Sĩ Mới',
        avatar: '🦁',
        rpg_class: 'warrior',
        level: 1,
        xp: 0,
        hp: 120,
        max_hp: 120,
        mp: 50,
        max_mp: 50,
        gold: 100,
        gems: 10,
        streak: 1,
        inventory: {
          health_potion: 3,
          mana_potion: 2,
          streak_freeze: 1,
          double_xp: 0,
          hint_scroll: 2,
          dust: 20,
          enhance_stones: 5,
          gacha_pity: 0
        },
        unlocked_dungeons: [1],
        badges: ['first_login'],
        stats: { monsters_slain: 0, bosses_slain: 0 }
      };

      let updatedCloudPayload = null;
      window.supabaseClient = {
        from: (table) => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: JSON.parse(JSON.stringify(cloudProfile)), error: null })
            })
          }),
          update: (payload) => ({
            eq: async (col, val) => {
              updatedCloudPayload = payload;
              return { data: null, error: null };
            }
          })
        })
      };
      window.currentSession = { user: { id: 'cloud_user_new', email: 'newuser@anki.vn' } };

      // Execute loadProfileFromSupabase
      await window.loadProfileFromSupabase('cloud_user_new');

      // Verify merged values
      assertEquals(window.currentRpgUser.level, 10, 'Merged level should be 10');
      assertEquals(window.currentRpgUser.xp, 450, 'Merged XP should be 450');
      assertEquals(window.currentRpgUser.gold, 5000, 'Merged gold should be 5000');
      assertEquals(window.currentRpgUser.gems, 150, 'Merged gems should be 150');
      assertEquals(window.currentRpgUser.dust, 60, 'Merged dust should be 60');
      assertEquals(window.currentRpgUser.enhance_stones, 15, 'Merged enhance_stones should be 15');
      assertEquals(window.currentRpgUser.skill_points, 8, 'Merged skill_points should be 8');
      assertEquals(window.currentRpgUser.streak, 7, 'Merged streak should be 7');
      assert(window.currentRpgUser.unlocked_dungeons.length === 5, 'Merged unlocked_dungeons should have 5 items');
      assert(window.currentRpgUser.badges.includes('boss_slayer'), 'Merged badges should contain boss_slayer');
      assert(window.currentRpgUser.unlocked_titles.includes('Dũng Sĩ Diệt Boss'), 'Merged titles should contain Dũng Sĩ Diệt Boss');
      assertEquals(window.currentRpgUser.stats.monsters_slain, 50, 'Merged stats.monsters_slain should be 50');
      assertEquals(window.currentRpgUser.stats.bosses_slain, 5, 'Merged stats.bosses_slain should be 5');
      assert(Array.isArray(window.currentRpgUser.equipment_inventory) && window.currentRpgUser.equipment_inventory.length === 2, 'Equipment inventory merged');

    } finally {
      window.supabaseClient = originalClient;
      window.currentRpgUser = originalUser;
      window.currentSession = originalSession;
    }
  });

  asyncTest('T2.2: Existing Cloud Account is NOT overwritten by Fresh Guest', async () => {
    const originalClient = window.supabaseClient;
    const originalUser = window.currentRpgUser;
    const originalSession = window.currentSession;

    try {
      // Guest with default level 1
      window.currentRpgUser = {
        id: 'local_guest_fresh',
        is_cloud: false,
        level: 1,
        xp: 10,
        gold: 150,
        stats: { monsters_slain: 1 }
      };

      // Existing advanced cloud profile
      const existingCloud = {
        id: 'cloud_veteran',
        level: 25,
        xp: 3200,
        gold: 25000,
        gems: 800,
        inventory: { dust: 150, enhance_stones: 40, health_potion: 20 },
        stats: { monsters_slain: 300, bosses_slain: 18 }
      };

      window.supabaseClient = {
        from: (table) => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: JSON.parse(JSON.stringify(existingCloud)), error: null })
            })
          }),
          update: (payload) => ({
            eq: async () => ({ data: null, error: null })
          })
        })
      };
      window.currentSession = { user: { id: 'cloud_veteran' } };

      await window.loadProfileFromSupabase('cloud_veteran');

      // Verify cloud progress is preserved without guest overwrite
      assertEquals(window.currentRpgUser.level, 25, 'Cloud level should remain 25');
      assertEquals(window.currentRpgUser.gold, 25000, 'Cloud gold should remain 25000');
      assertEquals(window.currentRpgUser.stats.monsters_slain, 300, 'Cloud monsters_slain should remain 300');

    } finally {
      window.supabaseClient = originalClient;
      window.currentRpgUser = originalUser;
      window.currentSession = originalSession;
    }
  });

  asyncTest('T2.3: Switching between two cloud accounts does not merge data', async () => {
    const originalClient = window.supabaseClient;
    const originalUser = window.currentRpgUser;
    const originalSession = window.currentSession;

    try {
      // Account A already cloud-authenticated
      window.currentRpgUser = {
        id: 'cloud_user_A',
        is_cloud: true,
        level: 12,
        gold: 9000,
        stats: { monsters_slain: 99 }
      };

      // Account B is a new cloud profile (level 1)
      const cloudB = {
        id: 'cloud_user_B',
        level: 1,
        xp: 0,
        gold: 100,
        stats: { monsters_slain: 0 }
      };

      window.supabaseClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: JSON.parse(JSON.stringify(cloudB)), error: null })
            })
          }),
          update: () => ({ eq: async () => ({}) })
        })
      };
      window.currentSession = { user: { id: 'cloud_user_B' } };

      await window.loadProfileFromSupabase('cloud_user_B');

      // Account B should remain level 1, NOT merged with Account A
      assertEquals(window.currentRpgUser.level, 1, 'Account B must not merge Account A');
      assertEquals(window.currentRpgUser.gold, 100, 'Account B gold must remain 100');

    } finally {
      window.supabaseClient = originalClient;
      window.currentRpgUser = originalUser;
      window.currentSession = originalSession;
    }
  });

  asyncTest('T2.4: [EMPIRICAL FINDING] Guest Max HP/MP Scaling Discrepancy on Merge', async () => {
    // When a guest reaches Level 10, guest max_hp is 255.
    // However, when merged into brand new cloud, max_hp remains at cloud default 120!
    const originalClient = window.supabaseClient;
    const originalUser = window.currentRpgUser;
    const originalSession = window.currentSession;

    try {
      window.currentRpgUser = {
        id: 'local_guest_hp',
        is_cloud: false,
        level: 10,
        xp: 50,
        hp: 255,
        max_hp: 255,
        mp: 140,
        max_mp: 140,
        stats: { monsters_slain: 10 }
      };

      const cloudNew = {
        id: 'cloud_hp_new',
        level: 1,
        xp: 0,
        hp: 120,
        max_hp: 120,
        mp: 50,
        max_mp: 50,
        stats: { monsters_slain: 0 }
      };

      window.supabaseClient = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: JSON.parse(JSON.stringify(cloudNew)), error: null }) })
          }),
          update: () => ({ eq: async () => ({}) })
        })
      };
      window.currentSession = { user: { id: 'cloud_hp_new' } };

      await window.loadProfileFromSupabase('cloud_hp_new');

      // Observation: currentRpgUser.level is 10, but max_hp is still 120!
      const levelIs10 = (window.currentRpgUser.level === 10);
      const hpIsUnscaled = (window.currentRpgUser.max_hp === 120);

      if (levelIs10 && hpIsUnscaled) {
        window.__M1_STRESS_RESULTS__.bugsFound.push({
          id: 'BUG_GUEST_MERGE_HP_UNSCALED',
          severity: 'MEDIUM',
          description: `Guest Level was merged to ${window.currentRpgUser.level}, but max_hp remained at Level 1 base (${window.currentRpgUser.max_hp} instead of expected 255 HP). Player enters dungeons with Level 1 HP despite Level 10.`,
          empiricalProof: `currentRpgUser.level = ${window.currentRpgUser.level}, currentRpgUser.max_hp = ${window.currentRpgUser.max_hp} (expected 255)`
        });
      }

      assert(levelIs10, 'Level should be 10');
    } finally {
      window.supabaseClient = originalClient;
      window.currentRpgUser = originalUser;
      window.currentSession = originalSession;
    }
  });

  asyncTest('T2.5: [EMPIRICAL FINDING] Guest Consumable Inventory Loss on Brand New Cloud Merge', async () => {
    // When a guest has 15 health_potions and 6 double_xp potions,
    // merging into a brand new cloud account discards them and adopts the cloud default (3 health potions, 0 double XP)!
    const originalClient = window.supabaseClient;
    const originalUser = window.currentRpgUser;
    const originalSession = window.currentSession;

    try {
      window.currentRpgUser = {
        id: 'local_guest_potions',
        is_cloud: false,
        level: 5,
        xp: 0,
        inventory: {
          health_potion: 15,
          mana_potion: 10,
          double_xp: 6,
          streak_freeze: 4
        },
        stats: { monsters_slain: 10 }
      };

      const cloudNew = {
        id: 'cloud_potions_new',
        level: 1,
        xp: 0,
        inventory: {
          health_potion: 3,
          mana_potion: 2,
          streak_freeze: 1,
          double_xp: 0,
          hint_scroll: 2
        },
        stats: { monsters_slain: 0 }
      };

      window.supabaseClient = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: JSON.parse(JSON.stringify(cloudNew)), error: null }) })
          }),
          update: () => ({ eq: async () => ({}) })
        })
      };
      window.currentSession = { user: { id: 'cloud_potions_new' } };

      await window.loadProfileFromSupabase('cloud_potions_new');

      const hpPotionsActual = window.currentRpgUser.inventory.health_potion;
      const doubleXpActual = window.currentRpgUser.inventory.double_xp;

      if (hpPotionsActual < 15 || doubleXpActual < 6) {
        window.__M1_STRESS_RESULTS__.bugsFound.push({
          id: 'BUG_GUEST_CONSUMABLES_LOST_ON_MERGE',
          severity: 'HIGH',
          description: `Guest consumable inventory was overwritten by cloud defaults: health_potion was 15 -> dropped to ${hpPotionsActual}; double_xp was 6 -> dropped to ${doubleXpActual}.`,
          empiricalProof: `health_potion: ${hpPotionsActual} (expected 15), double_xp: ${doubleXpActual} (expected 6)`
        });
      }

      assert(true, 'Empirical recording complete');
    } finally {
      window.supabaseClient = originalClient;
      window.currentRpgUser = originalUser;
      window.currentSession = originalSession;
    }
  });

});

// =========================================================================
// SUITE 3: CONSUMABLE KEY FALLBACKS & INFINITE DUPLICATION TESTING
// =========================================================================
describe('Suite 3: Consumable Key Fallbacks & Duplication Testing', ({ test }) => {

  test('T3.1: Plural health_potions is normalized to health_potion in loadLocalProfileFallback', () => {
    const rawProfile = {
      id: 'local_test_plural',
      display_name: 'Tester',
      level: 1,
      inventory: {
        health_potions: 7,
        mana_potion: 2
      }
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(rawProfile));
    loadLocalProfileFallback();

    assertEquals(window.currentRpgUser.inventory.health_potion, 7, 'health_potions should be migrated to health_potion = 7');
    assertEquals(window.currentRpgUser.inventory.health_potions, undefined, 'health_potions plural key should be deleted');
  });

  test('T3.2: Plural health_potions adds to existing singular health_potion', () => {
    const rawProfile = {
      id: 'local_test_additive',
      display_name: 'Tester',
      level: 1,
      inventory: {
        health_potion: 3,
        health_potions: 4
      }
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(rawProfile));
    loadLocalProfileFallback();

    assertEquals(window.currentRpgUser.inventory.health_potion, 7, 'health_potion should sum 3 + 4 = 7');
    assertEquals(window.currentRpgUser.inventory.health_potions, undefined, 'health_potions plural key should be deleted');
  });

  test('T3.3: [EMPIRICAL BUG REPRODUCTION] useShopItem("health_potions") fails and refuses to heal', () => {
    // Setup user with inventory { health_potions: 5 }
    window.currentRpgUser = {
      id: 'test_use_plural',
      hp: 40,
      max_hp: 100,
      inventory: {
        health_potions: 5
      }
    };

    let alertMsg = null;
    const origAlert = window.alert;
    window.alert = (msg) => { alertMsg = msg; };

    try {
      window.useShopItem('health_potions');

      // Check what happened:
      // In useShopItem:
      // Line 901-902 moves health_potions -> health_potion and DELETES health_potions.
      // But effectiveKey remains 'health_potions'.
      // Then count = inventory['health_potions'] which is undefined (0).
      // It triggers alert("Bạn chưa sở hữu vật phẩm này!") and exits WITHOUT healing!
      const healed = (window.currentRpgUser.hp === 90);
      const failedWithAlert = (alertMsg === 'Bạn chưa sở hữu vật phẩm này!');
      const potionWasDeleted = (window.currentRpgUser.inventory.health_potions === undefined);

      if (failedWithAlert && !healed) {
        window.__M1_STRESS_RESULTS__.bugsFound.push({
          id: 'BUG_USE_SHOP_ITEM_PLURAL_FAILS',
          severity: 'HIGH',
          description: `Calling useShopItem('health_potions') deletes user's health_potions property, fails to set effectiveKey to 'health_potion', triggers alert('Bạn chưa sở hữu vật phẩm này!') and refuses to heal player HP.`,
          empiricalProof: `alert: "${alertMsg}", hp: ${window.currentRpgUser.hp}/100 (healed=${healed}), inventory: ${JSON.stringify(window.currentRpgUser.inventory)}`
        });
      }

      assert(failedWithAlert, 'Demonstrated bug: useShopItem("health_potions") triggered false "not owned" alert');
    } finally {
      window.alert = origAlert;
    }
  });

  test('T3.4: useShopItem("double_xp_potion") vs useShopItem("double_xp") alias works correctly', () => {
    window.currentRpgUser = {
      id: 'test_double_xp_alias',
      inventory: {
        double_xp_potion: 2,
        double_xp: 0
      },
      double_xp_until: 0
    };

    // Use with double_xp_potion key
    window.useShopItem('double_xp_potion');
    assertEquals(window.currentRpgUser.inventory.double_xp_potion, 1, 'double_xp_potion should decrement to 1');
    assert(window.currentRpgUser.double_xp_until > Date.now(), 'double_xp_until should be activated');

    // Use with double_xp key while inventory still has double_xp_potion
    window.useShopItem('double_xp');
    assertEquals(window.currentRpgUser.inventory.double_xp_potion, 0, 'double_xp_potion should decrement to 0');
    assert(window.currentRpgUser.double_xp_until > Date.now(), 'double_xp_until should be extended');
  });

  test('T3.5: [EMPIRICAL BUG REPRODUCTION] Infinite Duplication Bug on double_xp_potion reloads', () => {
    // In loadLocalProfileFallback:
    // currentRpgUser.inventory.double_xp = (currentRpgUser.inventory.double_xp || 0) + (currentRpgUser.inventory.double_xp_potion || 0);
    // Notice that double_xp_potion is NEVER deleted!
    // Therefore, every time loadLocalProfileFallback runs, double_xp increases indefinitely!
    const initialProfile = {
      id: 'test_dup_user',
      display_name: 'Duplicator',
      level: 1,
      inventory: {
        double_xp_potion: 3,
        double_xp: 1
      }
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(initialProfile));

    const cycleCounts = [];

    // Cycle 1
    loadLocalProfileFallback();
    cycleCounts.push(window.currentRpgUser.inventory.double_xp);
    saveLocalProfileCache();

    // Cycle 2
    loadLocalProfileFallback();
    cycleCounts.push(window.currentRpgUser.inventory.double_xp);
    saveLocalProfileCache();

    // Cycle 3
    loadLocalProfileFallback();
    cycleCounts.push(window.currentRpgUser.inventory.double_xp);
    saveLocalProfileCache();

    // Cycle 4
    loadLocalProfileFallback();
    cycleCounts.push(window.currentRpgUser.inventory.double_xp);
    saveLocalProfileCache();

    // Verify duplication
    const duplicated = (cycleCounts[0] === 4 && cycleCounts[1] === 7 && cycleCounts[2] === 10 && cycleCounts[3] === 13);
    if (duplicated) {
      window.__M1_STRESS_RESULTS__.bugsFound.push({
        id: 'BUG_INFINITE_POTION_DUPLICATION',
        severity: 'CRITICAL',
        description: `Infinite potion duplication glitch: loadLocalProfileFallback() accumulates inventory.double_xp_potion into inventory.double_xp without deleting inventory.double_xp_potion. Every browser reload or cache refresh compounds double_xp potions endlessly (1 -> 4 -> 7 -> 10 -> 13...).`,
        empiricalProof: `Reload cycles double_xp counts: [${cycleCounts.join(' -> ')}]`
      });
    }

    assert(duplicated, `Demonstrated bug: cycle counts compounded: ${cycleCounts.join(', ')}`);
  });

  test('T3.6: Bidirectional dust <-> magic_dust accessor integrity', () => {
    const testUser = { dust: 20 };
    ensureDustProperty(testUser);

    assertEquals(testUser.magic_dust, 20, 'Initial magic_dust should match dust');

    testUser.dust = 45;
    assertEquals(testUser.magic_dust, 45, 'magic_dust should reflect changes to dust');

    testUser.magic_dust = 80;
    assertEquals(testUser.dust, 80, 'dust should reflect changes to magic_dust');

    // Clamp negative values to 0
    testUser.magic_dust = -25;
    assertEquals(testUser.dust, 0, 'dust should clamp to 0 on negative magic_dust');

    // Serialization check
    const serialized = JSON.stringify(testUser);
    const parsed = JSON.parse(serialized);
    assertEquals(parsed.dust, 0, 'dust is serializable');
  });

});
