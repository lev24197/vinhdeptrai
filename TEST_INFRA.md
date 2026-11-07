# Programmatic Verification & QA Test Infrastructure

## Overview
This document details the automated testing architecture, test suites, execution commands, and verification benchmarks designed for **The Anki Dictionary Studio - Gamification Ecosystem Overhaul**.

The test infrastructure provides automated, reproducible verification across all gamification systems (Turn-Based Combat, Dungeons, Tower of Babel, Paperdoll, Economy, Forge, Classes, Pets, Quests, and Profile Persistence) fulfilling requirement **R3** and acceptance criteria with **100% test pass rate** and **zero uncaught browser console exceptions**.

---

## 1. Test Architecture & Files

```
c:\Users\vinh\Downloads\vinhdeptrai-main\vinhdeptrai-main\
├── tests/
│   ├── gamification_test_suite.js    # Comprehensive test definitions & assertions
│   └── run_verification.html         # Standalone browser test harness with Neo-brutalist UI
├── run_verification.ps1              # Headless Chromium test runner script (PowerShell)
└── TEST_INFRA.md                     # Infrastructure architecture and audit documentation
```

### Key Components

1. **`tests/gamification_test_suite.js`**:
   - Custom self-contained test runner framework (`TestRunner`) with isolated state, execution timers, assertion library (`assertEqual`, `assertInRange`, `assertTrue`, `assertFalse`, `assertThrows`, `assertDeepEqual`), and detailed error reporting.
   - 9 categorized test suites containing **37 automated test cases**.
   - Dual-mode execution support: runs inside modern browser DOM (`tests/run_verification.html`) and headless Chromium sessions.
   - Exposes global test summaries in `window.__TEST_RESULTS__` and DOM scrape hooks (`#test-output-json`, `#test-summary-data`, `#verification-complete`).

2. **`tests/run_verification.html`**:
   - Fully standalone HTML test harness rendered with Neo-brutalist Tailwind styling matching the project aesthetics.
   - Loads all project engine scripts (`data.js`, `auth.js`, `equipment_data.js`, `inventory.js`, `shop.js`, `dungeon_data_100.js`, `gamification_quests.js`, `gamification_skills.js`, `gamification_pets.js`, `gamification_tower.js`, `battle.js`, `quiz.js`).
   - Embeds live iframe error audit traps for `battle.html` and `index.html`.
   - Real-time progress bar, KPI badges (Total, Passed, Failed, Duration), and expandable test cards.

3. **`run_verification.ps1`**:
   - PowerShell runner automating headless browser execution using Chrome or Microsoft Edge.
   - Automatically detects installed browser at standard x64 / x86 / LocalAppData paths.
   - Creates an isolated temporary browser profile (`--user-data-dir`) to prevent Chromium ProcessSingleton lock collisions when standard browser windows are open.
   - Executes with `--headless=new --disable-web-security --allow-file-access-from-files --dump-dom`.
   - Parses DOM dump to extract JSON test results, logs colorful test results per suite, performs browser console zero-exception audit, and exits with code `0` on success or `1` on failure.

---

## 2. Test Coverage Matrix

The test harness exercises all 9 core verification domains:

| Suite # | Domain | Test Count | Key Invariants Tested |
|---|---|:---:|---|
| **1** | Combat Formulas & Elemental Matrix | 5 | Player damage mitigation formula `(atk * mult + [0..11]) - floor(def/3)`, min damage floor (15), crit multiplier (1.8x), 8-element weakness matrix (1.5x / 0.75x / 1.0x), stat caps (Crit ≤ 75%, Dodge ≤ 60%), monster damage formula, Tier 4 boss survivability sanity, Warrior reflect shield (80% mitigation / 100% reflect), Assassin absolute dodge (0 damage). |
| **2** | 100 Dungeons & 100 Bosses Data Validation | 5 | Exactly 100 dungeons (keys "1".."100"), 25 dungeons per Tier (Tiers 1-4), schema completeness (cleanEn, cleanVi, topicName, biome, background colors, 3 minions each, boss object with roars), monotonic scaling (Tier 4 > 3 > 2 > 1 for Boss HP, ATK, DEF), elemental theme mappings. |
| **3** | Tower of Babel & Boss Rush | 5 | Boons pool integrity (8+ unique boons with distinct IDs/icons/descriptions), user tower records schema (`max_floor`, `best_streak`, `boss_rush_wins`), floor scaling formula `floorMult = 1 + (floor - 1) * 0.12`, elite boss floors on every 5th floor (`floor % 5 === 0`), floor clear gold/exp rewards, boon application (+40 max HP). |
| **4** | Inventory, Paperdoll, Sets & Forge | 5 | 6-slot storage paperdoll (`weapon`, `helmet`, `armor`, `gloves`, `boots`, `accessory`), 5 visual sprite layers, class starter gear initialization, class restriction enforcement, 5 equipment sets (`oxford`, `dragon`, `chrono`, `shadow`, `anki_god`) 2-piece and 4-piece threshold activations, forge gold (`lvl * 75`) and stone (`ceil(lvl/3)`) curves, +15% stat boost per level (+150% at +10). |
| **5** | Gacha Mystery Chests & Pity Counter | 4 | Wood (100g), Silver (350g), Gold (5 gems) costs, currency deduction validation, guaranteed Legendary at 10-pull pity across all chests, pity reset to 0 on legendary drop, 100-pull simulation verifying pity never exceeds 10, 102-item equipment catalog tier completeness (`common`, `uncommon`, `rare`, `epic`, `legendary`). |
| **6** | Economy Balance Simulation | 2 | Faucet vs sink equilibrium (dungeon run rewards 35-50g vs shop consumable prices: 40g health potion, 50g mana potion), 20-run player progression simulation tracking gold, potion consumption, forge attempts, and positive net wealth. |
| **7** | Classes & Companion Pets | 4 | 4 character classes (Warrior, Mage, Ranger, Assassin) with 2 active and 2 passive skills, MP costs, skill point (SP) accrual (`level - 1`), unlock and reset refunds, 4 companion pets (`wise_owl`, `baby_drake`, `fortune_cat`, `frost_kitsune`), pet leveling (1-10) with gold and dust sinks. |
| **8** | Quests Triggers & Profile Persistence | 4 | Daily quest event tracking (`dungeon_clear`, `combo_streak`, `c1_c2_word`, `slay_boss`, `forge_enhance`, `open_chest`, `use_potion`), daily date reset, achievement progress & reward claiming, localStorage profile serialization & deserialization, Supabase cloud JSONB inventory packaging integrity (`dust`, `enhance_stones`, `gacha_pity`, `daily_quests`, `achievements`, `skill_points`, `skills_unlocked`, `pets`, `tower_records`). |
| **9** | Zero Console Exception & Module Integrity | 3 | Global module namespace assertions (`DUNGEON_DATA_100`, `GamificationSkills`, `GamificationPets`, `GamificationTower`, `GamificationQuests`, `BattleEngine`), test harness runtime zero-exception assertion, live headless frame audit asserting 0 uncaught exceptions on `battle.html` and `index.html`. |
| **Total** | | **37** | **100.0% Pass Rate** |

---

## 3. How to Run the Tests

### Option A: Headless Execution via PowerShell (Recommended for CI / Verification)

Run the verification script from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_verification.ps1
```

**Parameters**:
- `-BrowserPath <path>`: Explicitly specify path to `chrome.exe` or `msedge.exe` (optional, auto-detected by default).
- `-TimeoutSeconds <int>`: Timeout per page evaluation (default: `12` seconds).

**Expected Output**:
```text
================================================================================
   ANKI RPG GAMIFICATION - PROGRAMMATIC VERIFICATION RUNNER (HEADLESS AUDIT)     
================================================================================

 Using Chromium Browser: C:\Program Files\Google\Chrome\Application\chrome.exe

🚀 Executing Programmatic Verification Test Suite in Headless Chromium...

--------------------------------------------------------------------------------
 TEST EXECUTION SUMMARY
--------------------------------------------------------------------------------
 Total Tests:  37
 Passed Tests: 37
 Failed Tests: 0
 Pass Rate:    100.0%
 Duration:     952 ms
--------------------------------------------------------------------------------

 [PASS] 1. Combat Formulas & Elemental Matrix (5/5 passed)
     + T1.1: Player Damage vs Monster DEF Mitigation & Minimum Floor (1ms)
     + T1.2: Elemental Advantage Matrix Multipliers & Weakness Relationships (0ms)
     + T1.3: Stat Hard Caps (Crit capped at 75%, Dodge capped at 60%) (0ms)
     + T1.4: Monster Damage Math & Tier 4 Boss Scaling Survivability Sanity (0ms)
     + T1.5: Active Tactical Skill Effects: Warrior Reflect & Assassin Absolute Dodge (0ms)
 [PASS] 2. 100 Dungeons & 100 Bosses Data Validation (5/5 passed)
     ...
 [PASS] 9. Zero Console Exception & Module Integrity (3/3 passed)
     + T9.1: Module Global Namespaces & Integrity Assertions (5ms)
     + T9.2: Test Harness Browser Zero-Uncaught-Exception Assertion (3ms)
     + T9.3: Asynchronous Headless Frame Integrity Check for Battle & Index Pages (0ms)

🚀 Browser Console Zero-Exception Audit Status...
   • [battle.html]: 0 uncaught exceptions [PASS]
   • [index.html]:  0 uncaught exceptions [PASS]

================================================================================
  ALL VERIFICATION TESTS AND AUDITS PASSED WITH ZERO FAILURES! (EXIT 0)         
================================================================================
```

### Option B: Interactive Browser Execution

Open `tests/run_verification.html` in any modern web browser:
```text
file:///c:/Users/vinh/Downloads/vinhdeptrai-main/vinhdeptrai-main/tests/run_verification.html
```
- Tests run automatically on load.
- Click **"CHẠY LẠI TEST SUITE"** to re-execute on demand.
- Inspect detailed test status cards and JSON output in DevTools via `window.__TEST_RESULTS__`.

---

## 4. Benchmark & Quality Metrics

- **Total Test Cases**: 37
- **Total Passing**: 37 (100.0%)
- **Total Failing**: 0
- **Execution Speed**: ~850–950 ms total execution time
- **Browser Compatibility**: Google Chrome (v110+), Microsoft Edge (v110+)
- **Console Errors Audit**:
  - `battle.html`: **0 uncaught exceptions**
  - `index.html`: **0 uncaught exceptions**
  - `run_verification.html`: **0 uncaught exceptions**
