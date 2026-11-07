/**
 * ============================================================================
 * EMPIRICAL CHALLENGER 1 — MILESTONE 2 ADVERSARIAL STRESS TEST SUITE
 * File: tests/stress_m2_challenger.js
 * Author: Empirical Challenger 1 (Milestone 2)
 *
 * Core Domains Tested:
 * 1. Character Classes & Skills: Tree schema, SP spending/resetting, multi-class boundary states, combat effects
 * 2. Companion Pets: 1-to-10 leveling gauntlet for all 4 pets, monotonic scaling, legacy aliases
 * 3. Pet Feeding: Affinity transitions (0 to 100), Well-Fed buff activation/expiration thresholds, resource deduction
 * 4. Tower of Babel & Boss Rush: 50+ floors scaling, 10 modifiers execution params, economy rewards, gauntlet runner
 * 5. High-Frequency Chaos & Adversarial Fuzzing: 1000 SP loops, 500 pet loops, dirty input injection
 * ============================================================================
 */

(function(global) {
  'use strict';

  // Mock global alerts and confirms for headless testing
  global.alert = function() {};
  global.confirm = function() { return true; };

  class ChallengerRunner {
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

  const runner = new ChallengerRunner();

  async function runAllChallengerTests() {
    console.log('=== STARTING EMPIRICAL CHALLENGER M2 STRESS SUITE ===');
    const startTime = Date.now();

    // ========================================================================
    // SUITE 1: CHARACTER CLASSES & SKILL TREE STRESS MATRIX
    // ========================================================================
    runner.suite('1. Classes & Skills Tree Stress Matrix');

    runner.assert(Boolean(global.GamificationSkills), 'GamificationSkills global namespace exists');
    const classes = ['warrior', 'mage', 'ranger', 'assassin'];

    // 1.1 Schema Completeness & Numerical Execution Parameters
    classes.forEach(cls => {
      const c = global.GamificationSkills.CLASS_SKILLS[cls];
      runner.assert(Boolean(c), `Class [${cls}] exists`);
      runner.assert(Boolean(c.name && c.icon && c.color), `${cls} metadata (name, icon, color) valid`);

      // Active 1 & Active 2
      ['active_1', 'active_2'].forEach(actKey => {
        const act = c[actKey];
        runner.assert(Boolean(act), `${cls} has ${actKey}`);
        runner.assert(typeof act.mp === 'number' && act.mp > 0, `${cls} ${actKey} mp is positive number`);
        runner.assert(Boolean(act.effect), `${cls} ${actKey} has effect identifier`);
      });

      // Passive 1 & Passive 2
      ['passive_1', 'passive_2'].forEach(pasKey => {
        const pas = c[pasKey];
        runner.assert(Boolean(pas), `${cls} has ${pasKey}`);
        runner.assert(Boolean(pas.desc), `${cls} ${pasKey} has description`);
      });
    });

    // Concrete Numerical Execution Parameters Check
    const w = global.GamificationSkills.CLASS_SKILLS.warrior;
    runner.assertEqual(w.active_1.dmgMult, 2.2, 'Warrior Cuồng Trảm dmgMult is 2.2');
    runner.assertEqual(w.active_2.mitigation, 0.8, 'Warrior Khiên Phản Đòn mitigation is 0.8');
    runner.assertEqual(w.active_2.reflect, 1.0, 'Warrior Khiên Phản Đòn reflect is 1.0');
    runner.assertEqual(w.passive_1.bonusDef, 15, 'Warrior Thân Thể Thép bonusDef is 15');
    runner.assertEqual(w.passive_1.bonusMaxHp, 30, 'Warrior Thân Thể Thép bonusMaxHp is 30');
    runner.assertEqual(w.passive_2.surviveWithHp, 1, 'Warrior Bất Tử Chiến Ý surviveWithHp is 1');

    const m = global.GamificationSkills.CLASS_SKILLS.mage;
    runner.assertEqual(m.active_1.freezeTurns, 1, 'Mage Bão Băng freezeTurns is 1');
    runner.assertEqual(m.active_2.dmgMult, 3.0, 'Mage Thiên Thạch dmgMult is 3.0');
    runner.assertEqual(m.active_2.ignoreDefPercent, 0.5, 'Mage Thiên Thạch ignoreDefPercent is 0.5');
    runner.assertEqual(m.passive_1.bonusMpOnCorrect, 15, 'Mage Minh Triết bonusMpOnCorrect is 15');
    runner.assertEqual(m.passive_2.bonusMaxMp, 25, 'Mage Khiên Linh Hồn bonusMaxMp is 25');
    runner.assertEqual(m.passive_2.bonusMagicDmgPercent, 0.15, 'Mage Khiên Linh Hồn bonusMagicDmgPercent is 0.15');

    const r = global.GamificationSkills.CLASS_SKILLS.ranger;
    runner.assertEqual(r.active_1.eliminateCount, 2, 'Ranger Mắt Đại Bàng eliminateCount is 2');
    runner.assertEqual(r.active_2.hits, 2, 'Ranger Mưa Tên hits is 2');
    runner.assertEqual(r.active_2.multPerHit, 1.1, 'Ranger Mưa Tên multPerHit is 1.1');
    runner.assertEqual(r.active_2.ignoreDefPercent, 0.4, 'Ranger Mưa Tên ignoreDefPercent is 0.4');
    runner.assertEqual(r.passive_1.bonusCrit, 15, 'Ranger Tập Trung bonusCrit is 15');
    runner.assertEqual(r.passive_2.bonusGoldPercent, 0.30, 'Ranger Thợ Săn Tiền Thưởng bonusGoldPercent is 0.30');

    const a = global.GamificationSkills.CLASS_SKILLS.assassin;
    runner.assertEqual(a.active_1.dodgeRate, 1.0, 'Assassin Bóng Ma dodgeRate is 1.0');
    runner.assertEqual(a.active_2.critMult, 3.5, 'Assassin Ám Sát critMult is 3.5');
    runner.assertEqual(a.active_2.guaranteedCrit, true, 'Assassin Ám Sát guaranteedCrit is true');
    runner.assertEqual(a.passive_1.poisonDmg, 25, 'Assassin Lưỡi Dao Tẩm Độc poisonDmg is 25');
    runner.assertEqual(a.passive_1.poisonTurns, 3, 'Assassin Lưỡi Dao Tẩm Độc poisonTurns is 3');
    runner.assertEqual(a.passive_2.bonusDodge, 15, 'Assassin Khinh Thân bonusDodge is 15');

    // 1.2 SP Accrual & Math Limits
    const testLevels = [
      { lvl: 1, expectedSP: 0 },
      { lvl: 2, expectedSP: 1 },
      { lvl: 4, expectedSP: 3 },
      { lvl: 10, expectedSP: 9 },
      { lvl: 50, expectedSP: 49 },
      { lvl: 0, expectedSP: 0 },
      { lvl: -10, expectedSP: 0 },
      { lvl: undefined, expectedSP: 0 },
      { lvl: null, expectedSP: 0 }
    ];

    testLevels.forEach(tl => {
      const u = { level: tl.lvl };
      global.GamificationSkills.ensureInitialized(u);
      runner.assertEqual(u.skill_points, tl.expectedSP, `Level ${tl.lvl} initializes with SP = ${tl.expectedSP}`);
      runner.assertEqual(u.skills_unlocked.active_1, true, `Level ${tl.lvl} has active_1 unlocked initially`);
      runner.assertEqual(u.skills_unlocked.active_2, false, `Level ${tl.lvl} has active_2 locked initially`);
    });

    // 1.3 SP Spending & Unlocking Boundary States
    const userM2 = { level: 4, rpg_class: 'warrior' };
    global.GamificationSkills.ensureInitialized(userM2);
    global.currentRpgUser = userM2;
    runner.assertEqual(userM2.skill_points, 3, 'Level 4 user starts with 3 SP');

    // Attempt to unlock already unlocked active_1 -> must not deduct SP
    global.GamificationSkills.unlockSkill('active_1');
    runner.assertEqual(userM2.skill_points, 3, 'Unlocking already unlocked active_1 does NOT deduct SP');

    // Unlock active_2
    global.GamificationSkills.unlockSkill('active_2');
    runner.assertEqual(userM2.skill_points, 2, 'Unlocking active_2 deducts 1 SP (remaining 2)');
    runner.assertEqual(userM2.skills_unlocked.active_2, true, 'active_2 is now unlocked');

    // Unlock passive_1
    global.GamificationSkills.unlockSkill('passive_1');
    runner.assertEqual(userM2.skill_points, 1, 'Unlocking passive_1 deducts 1 SP (remaining 1)');
    runner.assertEqual(userM2.skills_unlocked.passive_1, true, 'passive_1 is now unlocked');

    // Unlock passive_2
    global.GamificationSkills.unlockSkill('passive_2');
    runner.assertEqual(userM2.skill_points, 0, 'Unlocking passive_2 deducts 1 SP (remaining 0)');
    runner.assertEqual(userM2.skills_unlocked.passive_2, true, 'passive_2 is now unlocked');

    // Attempt to unlock when SP = 0 -> must fail and keep SP = 0
    global.GamificationSkills.unlockSkill('active_2');
    runner.assertEqual(userM2.skill_points, 0, 'Unlock attempt at 0 SP fails without negative SP');

    // 1.4 SP Conservation Law & Resetting
    global.GamificationSkills.resetSkills(true);
    runner.assertEqual(userM2.skill_points, 3, 'resetSkills refunds 100% SP back to 3');
    runner.assertEqual(userM2.skills_unlocked.active_1, true, 'active_1 remains unlocked after reset');
    runner.assertEqual(userM2.skills_unlocked.active_2, false, 'active_2 is locked after reset');
    runner.assertEqual(userM2.skills_unlocked.passive_1, false, 'passive_1 is locked after reset');
    runner.assertEqual(userM2.skills_unlocked.passive_2, false, 'passive_2 is locked after reset');

    // 1.5 Multi-Class SP Boundary States & Switching
    const multiUser = { level: 5, rpg_class: 'warrior' };
    global.GamificationSkills.ensureInitialized(multiUser);
    global.currentRpgUser = multiUser;
    runner.assertEqual(multiUser.skill_points, 4, 'Level 5 user has 4 SP');

    // Unlock active_2 as warrior
    global.GamificationSkills.unlockSkill('active_2');
    runner.assertEqual(multiUser.skill_points, 3, 'SP decremented to 3');

    // Switch to mage
    global.GamificationSkills.selectClass('mage');
    runner.assertEqual(multiUser.rpg_class, 'mage', 'Successfully switched to mage');
    runner.assertEqual(multiUser.skill_points, 3, 'SP preserved during class switch');
    runner.assertEqual(multiUser.skills_unlocked.active_2, true, 'Slot active_2 unlocked state preserved');

    // Switch to invalid class -> must gracefully ignore
    global.GamificationSkills.selectClass('necromancer');
    runner.assertEqual(multiUser.rpg_class, 'mage', 'Switching to invalid class ignored');

    // Switch to same class -> clean no-op
    global.GamificationSkills.selectClass('mage');
    runner.assertEqual(multiUser.rpg_class, 'mage', 'Switching to same class is no-op');

    // 1.6 Combat Skill Casting Integration with BattleEngine Mock
    global.BattleEngine = {
      active: true,
      hero: { x: 100, y: 100, mp: 50 },
      monster: { x: 200, y: 100, frozen: false },
      addFloatDamage: function() {},
      updateBattleUI: function() {}
    };

    // Cast as mage active_1 (Bão Băng, costs 25 MP)
    global.GamificationSkills.castCombatSkill(1);
    runner.assertEqual(global.BattleEngine.hero.mp, 25, 'Mage active_1 cast deducted 25 MP (50 -> 25)');
    runner.assertEqual(global.BattleEngine.monster.frozen, true, 'Monster is frozen by Mage active_1');
    runner.assertEqual(global.BattleEngine.pendingSkillParams.effect, 'freeze_monster', 'pendingSkillParams contains freeze_monster');

    // Attempt cast with insufficient MP (active_2 costs 35 MP, hero has 25 MP)
    global.GamificationSkills.castCombatSkill(2);
    runner.assertEqual(global.BattleEngine.hero.mp, 25, 'Cast with insufficient MP fails; MP unchanged at 25');

    // 1.7 Defect Probe BUG-M2-02: Missing function existence guard for BattleEngine.updateBattleUI in unlockSkill()
    // GamificationSkills.js line 171 has `if (typeof BattleEngine !== 'undefined') BattleEngine.updateBattleUI();`
    // lacking the guard `&& typeof BattleEngine.updateBattleUI === 'function'`.
    const testBeUser = { level: 5, rpg_class: 'warrior', skill_points: 2, skills_unlocked: { active_1: true, active_2: false, passive_1: false, passive_2: false } };
    global.currentRpgUser = testBeUser;
    global.BattleEngine = { hero: { hp: 100 } }; // BattleEngine defined WITHOUT updateBattleUI
    let threwTypeError = false;
    try {
      global.GamificationSkills.unlockSkill('active_2');
    } catch (e) {
      threwTypeError = (e instanceof TypeError);
    }
    runner.assert(!threwTypeError, '[DEFECT RESOLVED: BUG-M2-02] unlockSkill executes safely without throwing when BattleEngine lacks updateBattleUI function');

    // Restore standard mock BattleEngine for subsequent suites
    global.BattleEngine = {
      hero: { hp: 100 },
      updateBattleUI: function() {},
      addFloatDamage: function() {}
    };

    // ========================================================================
    // SUITE 2: COMPANION PETS 1-TO-10 LEVELING GAUNTLET
    // ========================================================================
    runner.suite('2. Pets 1-to-10 Leveling Gauntlet');

    runner.assert(Boolean(global.GamificationPets), 'GamificationPets global namespace exists');
    const petKeys = Object.keys(global.GamificationPets.PETS_DATA);
    runner.assertEqual(petKeys.length, 4, 'Object.keys(PETS_DATA).length is strictly 4');
    runner.assert(petKeys.includes('wise_owl'), 'wise_owl in canonical keys');
    runner.assert(petKeys.includes('baby_drake'), 'baby_drake in canonical keys');
    runner.assert(petKeys.includes('golden_shiba'), 'golden_shiba in canonical keys');
    runner.assert(petKeys.includes('shadow_panther'), 'shadow_panther in canonical keys');

    // 2.1 Non-enumerable legacy fallback accessors
    runner.assertEqual(global.GamificationPets.PETS_DATA.fortune_cat.id, 'golden_shiba', 'fortune_cat resolves to golden_shiba');
    runner.assertEqual(global.GamificationPets.PETS_DATA.frost_kitsune.id, 'shadow_panther', 'frost_kitsune resolves to shadow_panther');
    runner.assertEqual(global.GamificationPets.resolvePetId('fortune_cat'), 'golden_shiba', 'resolvePetId fortune_cat');
    runner.assertEqual(global.GamificationPets.resolvePetId('frost_kitsune'), 'shadow_panther', 'resolvePetId frost_kitsune');
    runner.assertEqual(global.GamificationPets.resolvePetId(null), 'wise_owl', 'resolvePetId null defaults to wise_owl');
    runner.assertEqual(global.GamificationPets.resolvePetId(undefined), 'wise_owl', 'resolvePetId undefined defaults to wise_owl');

    // 2.2 Full 1-to-10 Leveling Gauntlet for ALL 4 Canonical Pets
    const canonicalPets = ['wise_owl', 'baby_drake', 'golden_shiba', 'shadow_panther'];

    canonicalPets.forEach(pId => {
      // Required budget for 1 -> 10:
      // Gold: sum(50 + L * 30) for L=1..9 = 1800
      // Dust: sum(20 + L * 15) for L=1..9 = 855
      const petUser = {
        gold: 3000,
        dust: 2000,
        pets: {
          [pId]: { unlocked: true, level: 1, affinity: 50 }
        }
      };
      global.GamificationPets.ensureInitialized(petUser);
      global.currentRpgUser = petUser;

      let expectedGold = 3000;
      let expectedDust = 2000;

      for (let lvl = 1; lvl <= 9; lvl++) {
        const costGold = 50 + lvl * 30;
        const costDust = 20 + lvl * 15;
        expectedGold -= costGold;
        expectedDust -= costDust;

        const success = global.GamificationPets.upgradePet(pId);
        runner.assert(success === true, `${pId} upgraded from Lv${lvl} to Lv${lvl + 1}`);
        runner.assertEqual(petUser.pets[pId].level, lvl + 1, `${pId} level is now ${lvl + 1}`);
        runner.assertEqual(petUser.gold, expectedGold, `${pId} gold correctly deducted to ${expectedGold}`);
        runner.assertEqual(petUser.dust, expectedDust, `${pId} dust correctly deducted to ${expectedDust}`);
        runner.assertEqual(petUser.magic_dust, expectedDust, `${pId} legacy magic_dust kept synchronized`);
      }

      runner.assertEqual(petUser.pets[pId].level, 10, `${pId} successfully reached Max Level 10`);

      // Attempt upgrade past level 10 -> must return false and not deduct resources
      const pastCap = global.GamificationPets.upgradePet(pId);
      runner.assert(pastCap === false, `${pId} upgrade past Level 10 fails`);
      runner.assertEqual(petUser.pets[pId].level, 10, `${pId} level stays 10`);
      runner.assertEqual(petUser.gold, expectedGold, `${pId} gold untouched on cap failure`);
      runner.assertEqual(petUser.dust, expectedDust, `${pId} dust untouched on cap failure`);
    });

    // 2.3 Resource Guardrails on Upgrades
    const brokeUser = {
      gold: 50, // needs 80 for Lv1->2
      dust: 10, // needs 35 for Lv1->2
      pets: {
        wise_owl: { unlocked: true, level: 1 }
      }
    };
    global.GamificationPets.ensureInitialized(brokeUser);
    global.currentRpgUser = brokeUser;

    const brokeRes = global.GamificationPets.upgradePet('wise_owl');
    runner.assert(brokeRes === false, 'Upgrade with insufficient resources fails');
    runner.assertEqual(brokeUser.pets.wise_owl.level, 1, 'Level remains 1 after failed upgrade');
    runner.assertEqual(brokeUser.gold, 50, 'Gold untouched after failed upgrade');
    runner.assertEqual(brokeUser.dust, 10, 'Dust untouched after failed upgrade');

    // Upgrade locked pet fails
    const lockedUser = {
      gold: 1000,
      dust: 1000,
      pets: {
        baby_drake: { unlocked: false, level: 1 }
      }
    };
    global.GamificationPets.ensureInitialized(lockedUser);
    global.currentRpgUser = lockedUser;
    const lockedRes = global.GamificationPets.upgradePet('baby_drake');
    runner.assert(lockedRes === false, 'Upgrade locked pet fails');

    // 2.4 Monotonic Scaling Across Levels 1 to 10
    canonicalPets.forEach(pId => {
      let prev = null;
      for (let lvl = 1; lvl <= 10; lvl++) {
        const b = global.GamificationPets.getPetBuffs(pId, lvl, 50);
        runner.assertEqual(b.level, lvl, `${pId} buffs report level ${lvl}`);
        if (prev) {
          if (pId === 'wise_owl') {
            runner.assert(b.expMultiplier > prev.expMultiplier, `Wise Owl EXP strictly monotonic at Lv${lvl} (${prev.expMultiplier} -> ${b.expMultiplier})`);
            runner.assert(b.studyHintChance > prev.studyHintChance, `Wise Owl Hint strictly monotonic at Lv${lvl} (${prev.studyHintChance} -> ${b.studyHintChance})`);
          } else if (pId === 'baby_drake') {
            runner.assert(b.assistDmg > prev.assistDmg, `Baby Drake Assist strictly monotonic at Lv${lvl} (${prev.assistDmg} -> ${b.assistDmg})`);
            runner.assert(b.burnDmg > prev.burnDmg, `Baby Drake Burn strictly monotonic at Lv${lvl} (${prev.burnDmg} -> ${b.burnDmg})`);
          } else if (pId === 'golden_shiba') {
            runner.assert(b.goldMultiplier > prev.goldMultiplier, `Golden Shiba Gold strictly monotonic at Lv${lvl} (${prev.goldMultiplier} -> ${b.goldMultiplier})`);
            runner.assert(b.critBonus > prev.critBonus, `Golden Shiba Crit strictly monotonic at Lv${lvl} (${prev.critBonus} -> ${b.critBonus})`);
            runner.assert(b.stoneChance > prev.stoneChance, `Golden Shiba Stone strictly monotonic at Lv${lvl} (${prev.stoneChance} -> ${b.stoneChance})`);
          } else if (pId === 'shadow_panther') {
            runner.assert(b.dodgeBonus > prev.dodgeBonus, `Shadow Panther Dodge strictly monotonic at Lv${lvl} (${prev.dodgeBonus} -> ${b.dodgeBonus})`);
            runner.assert(b.shadowStrikeDmg > prev.shadowStrikeDmg, `Shadow Panther Strike strictly monotonic at Lv${lvl} (${prev.shadowStrikeDmg} -> ${b.shadowStrikeDmg})`);
            runner.assert(b.freezeChance > prev.freezeChance, `Shadow Panther Freeze strictly monotonic at Lv${lvl} (${prev.freezeChance} -> ${b.freezeChance})`);
          }
        }
        prev = b;
      }
    });

    // ========================================================================
    // SUITE 3: PET FEEDING & AFFINITY TRANSITIONS (0 TO 100)
    // ========================================================================
    runner.suite('3. Pet Feeding & Affinity Transitions');

    const foodCatalog = global.GamificationPets.FOOD_ITEMS;
    runner.assert(Boolean(foodCatalog.snack_apple), 'snack_apple defined');
    runner.assert(Boolean(foodCatalog.snack_fish), 'snack_fish defined');
    runner.assert(Boolean(foodCatalog.snack_meat), 'snack_meat defined');
    runner.assert(Boolean(foodCatalog.snack_crystal), 'snack_crystal defined');

    // 3.1 Stepwise feeding transition (Standard progression from affinity 10)
    const feedUser = {
      gold: 500,
      dust: 200,
      pets: {
        wise_owl: { unlocked: true, level: 1, affinity: 10 }
      }
    };
    global.GamificationPets.ensureInitialized(feedUser);
    global.currentRpgUser = feedUser;

    // Start at affinity 10
    let buff10 = global.GamificationPets.getPetBuffs('wise_owl', 1, feedUser.pets.wise_owl.affinity);
    runner.assertEqual(buff10.affinity, 10, 'Initial affinity is 10');
    runner.assertEqual(buff10.isWellFed, false, 'Affinity 10 is NOT well-fed');
    runner.assertEqual(buff10.wellFedBonus, null, 'Affinity 10 has no wellFedBonus');

    // Feed snack_apple (+15, cost 30g) -> 25
    const f1 = global.GamificationPets.feedPet('wise_owl', 'snack_apple');
    runner.assert(f1.success, 'Feed snack_apple succeeded');
    runner.assertEqual(feedUser.pets.wise_owl.affinity, 25, 'Affinity increased from 10 to 25');
    runner.assertEqual(f1.isWellFed, false, 'Affinity 25 is NOT well-fed');

    // Feed snack_fish (+25, cost 50g, 5 dust) -> 50
    const f2 = global.GamificationPets.feedPet('wise_owl', 'snack_fish');
    runner.assert(f2.success, 'Feed snack_fish succeeded');
    runner.assertEqual(feedUser.pets.wise_owl.affinity, 50, 'Affinity increased from 25 to 50');
    runner.assertEqual(f2.isWellFed, false, 'Affinity 50 is NOT well-fed');

    // Feed snack_meat (+40, cost 80g, 10 dust) -> 90 (Well-Fed threshold >= 70 crossed!)
    const f3 = global.GamificationPets.feedPet('wise_owl', 'snack_meat');
    runner.assert(f3.success, 'Feed snack_meat succeeded');
    runner.assertEqual(feedUser.pets.wise_owl.affinity, 90, 'Affinity reached 90');
    runner.assertEqual(f3.isWellFed, true, 'Affinity 90 triggers Well-Fed!');

    // Check Well-Fed buff bonus
    const buff90 = global.GamificationPets.getPetBuffs('wise_owl', 1, 90);
    runner.assertEqual(buff90.isWellFed, true, 'isWellFed is true at affinity 90');
    runner.assert(Boolean(buff90.wellFedBonus), 'wellFedBonus exists at affinity 90');
    runner.assertEqual(buff90.wellFedBonus.allStatsPercent, 10, 'wellFedBonus provides +10% allStatsPercent');

    // Feed snack_crystal (+50, cost 25 dust) -> clamped to 100!
    const f4 = global.GamificationPets.feedPet('wise_owl', 'snack_crystal');
    runner.assert(f4.success, 'Feed snack_crystal succeeded');
    runner.assertEqual(feedUser.pets.wise_owl.affinity, 100, 'Affinity clamped at exactly 100');
    runner.assertEqual(f4.isWellFed, true, 'Affinity 100 is Well-Fed');

    // Feed again at 100 affinity -> still clamped to 100
    const f5 = global.GamificationPets.feedPet('wise_owl', 'snack_apple');
    runner.assertEqual(feedUser.pets.wise_owl.affinity, 100, 'Affinity cannot exceed 100 ceiling');

    // 3.2 Defect Probe BUG-M2-01: Zero-Affinity Falsy Coercion in feedPet
    // When affinity === 0, line 356 '(petState.affinity || 50)' coerces 0 to 50 in JavaScript!
    const zeroAffUser = {
      gold: 500,
      dust: 100,
      pets: {
        wise_owl: { unlocked: true, level: 1, affinity: 0 }
      }
    };
    global.GamificationPets.ensureInitialized(zeroAffUser);
    global.currentRpgUser = zeroAffUser;
    const fZero = global.GamificationPets.feedPet('wise_owl', 'snack_apple'); // apple gives +15
    runner.assertEqual(fZero.affinity, 15, '[DEFECT RESOLVED: BUG-M2-01] Zero affinity 0 preserved: feeding +15 from 0 yields 15 without 0 || 50 coercion');
    runner.assert(fZero.affinity === 15, '[DEFECT RESOLVED: BUG-M2-01] Affinity reaches mathematically expected 15');

    // 3.2 Exact Boundary Testing: 69 (No Buff) vs 70 (Buff Active) vs Expiration
    const buff69 = global.GamificationPets.getPetBuffs('wise_owl', 1, 69);
    runner.assertEqual(buff69.isWellFed, false, 'Exact boundary 69 affinity: isWellFed is false');
    runner.assertEqual(buff69.wellFedBonus, null, 'Exact boundary 69 affinity: wellFedBonus is null');

    const buff70 = global.GamificationPets.getPetBuffs('wise_owl', 1, 70);
    runner.assertEqual(buff70.isWellFed, true, 'Exact boundary 70 affinity: isWellFed is true');
    runner.assertEqual(buff70.wellFedBonus.allStatsPercent, 10, 'Exact boundary 70 affinity: +10% stat boost');

    // Simulated expiration (drop below 70)
    const buffExpired = global.GamificationPets.getPetBuffs('wise_owl', 1, 65);
    runner.assertEqual(buffExpired.isWellFed, false, 'Expired affinity 65: isWellFed reverted to false');
    runner.assertEqual(buffExpired.wellFedBonus, null, 'Expired affinity 65: wellFedBonus reverted to null');

    // 3.3 Legacy Pet Profile Sync on Feed
    const legacyUser = {
      gold: 500,
      dust: 100,
      pets: {
        golden_shiba: { unlocked: true, level: 1, affinity: 50 },
        fortune_cat: { unlocked: true, level: 1, affinity: 50 }
      }
    };
    global.GamificationPets.ensureInitialized(legacyUser);
    global.currentRpgUser = legacyUser;
    global.GamificationPets.feedPet('golden_shiba', 'snack_apple');
    runner.assertEqual(legacyUser.pets.golden_shiba.affinity, 65, 'golden_shiba affinity increased to 65');
    runner.assertEqual(legacyUser.pets.fortune_cat.affinity, 65, 'legacy fortune_cat affinity synchronized to 65');

    // ========================================================================
    // SUITE 4: TOWER OF BABEL & BOSS RUSH STRESS TESTING
    // ========================================================================
    runner.suite('4. Tower of Babel & Boss Rush Stress Testing');

    runner.assert(Boolean(global.GamificationTower), 'GamificationTower global namespace exists');
    runner.assert(Array.isArray(global.GamificationTower.FLOOR_MODIFIERS), 'FLOOR_MODIFIERS is an array');
    runner.assert(global.GamificationTower.FLOOR_MODIFIERS.length >= 10, 'At least 10 floor modifiers exist');

    // 4.1 Floor Scaling Math & Elite Boss Floors
    for (let fl = 1; fl <= 50; fl++) {
      const mod = global.GamificationTower.getFloorModifier(fl);
      runner.assert(Boolean(mod && mod.id && mod.name), `Floor ${fl} resolves to valid modifier ${mod?.id}`);
    }

    // Repeated scaling call immutability check (prevent compounding mutation bugs)
    global.BattleEngine = {
      monster: { maxHp: 100, hp: 100, atk: 25, def: 10 },
      updateBattleUI: function() {},
      triggerBossAlert: function() {}
    };

    // Scaling floor 1 -> floor 5 -> floor 10 -> back to floor 1
    global.GamificationTower.scaleMonsterForTower(1);
    runner.assertEqual(global.BattleEngine.monster.maxHp, 100, 'Floor 1 base maxHp is 100');

    global.GamificationTower.scaleMonsterForTower(5);
    // 1 + (5 - 1) * 0.12 = 1.48 -> 148
    runner.assertEqual(global.BattleEngine.monster.maxHp, 148, 'Floor 5 maxHp scaled to 148');
    runner.assertEqual(global.BattleEngine.monster.isBoss, true, 'Floor 5 is elite boss');

    global.GamificationTower.scaleMonsterForTower(50);
    // 1 + (50 - 1) * 0.12 = 6.88 -> 688
    runner.assertEqual(global.BattleEngine.monster.maxHp, 688, 'Floor 50 maxHp scaled to 688');

    // Now re-scale to floor 1: base stats must NOT have been corrupted
    global.GamificationTower.scaleMonsterForTower(1);
    runner.assertEqual(global.BattleEngine.monster.maxHp, 100, 'Re-scaling to Floor 1 returns to original 100 HP');

    // 4.2 Economic Rewards Monotonicity Across Floors 1 to 50
    let prevGold = 0;
    let prevExp = 0;
    for (let f = 1; f <= 50; f++) {
      const rew = global.GamificationTower.calculateFloorReward(f);
      runner.assert(rew.gold > prevGold, `Floor ${f} Gold (${rew.gold}) > Floor ${f-1} Gold (${prevGold})`);
      runner.assert(rew.exp > prevExp, `Floor ${f} EXP (${rew.exp}) > Floor ${f-1} EXP (${prevExp})`);

      if (f % 5 === 0) {
        runner.assert(rew.enhanceStones >= 1, `Floor ${f} awards enhance stones (got ${rew.enhanceStones})`);
      } else {
        runner.assertEqual(rew.enhanceStones, 0, `Non-milestone floor ${f} does not award enhance stones`);
      }

      if (f % 10 === 0) {
        runner.assert(rew.gems >= 2, `Floor ${f} awards gems (got ${rew.gems})`);
      } else {
        runner.assertEqual(rew.gems, 0, `Non-milestone floor ${f} does not award gems`);
      }

      prevGold = rew.gold;
      prevExp = rew.exp;
    }

    // 4.3 Boss Rush 5-Boss Gauntlet Full State Runner
    const brUser = {
      gold: 0,
      gems: 0,
      enhance_stones: 0,
      tower_records: { boss_rush_wins: 0 }
    };
    global.GamificationTower.ensureInitialized(brUser);
    global.currentRpgUser = brUser;

    global.GamificationTower.startBossRush();
    runner.assertEqual(global.GamificationTower.bossRushState.currentBossIdx, 1, 'Boss Rush starts at Boss 1');
    runner.assertEqual(global.GamificationTower.bossRushState.preservedHeroHp, null, 'Hero HP preservation initialized to null');

    // Beat Bosses 1 to 4 with decreasing hero HP
    for (let b = 1; b <= 4; b++) {
      const remainingHp = 100 - b * 15;
      global.BattleEngine = {
        hero: { hp: remainingHp },
        updateBattleUI: function() {},
        addFloatDamage: function() {}
      };
      global.GamificationTower.onBossRushCleared();
      runner.assertEqual(global.GamificationTower.bossRushState.currentBossIdx, b + 1, `Advances to Boss ${b + 1}`);
      runner.assertEqual(global.GamificationTower.bossRushState.preservedHeroHp, remainingHp, `Hero HP ${remainingHp} preserved`);
    }

    // Beat Boss 5 (Gauntlet Clear)
    global.GamificationTower.onBossRushCleared();
    runner.assertEqual(brUser.tower_records.boss_rush_wins, 1, 'boss_rush_wins incremented to 1');
    runner.assertEqual(brUser.gold, 500, 'Gold +500 awarded on 5/5 clear');
    runner.assertEqual(brUser.gems, 10, 'Gems +10 awarded on 5/5 clear');
    runner.assertEqual(brUser.enhance_stones, 5, 'Enhance stones +5 awarded on 5/5 clear');

    // ========================================================================
    // SUITE 5: HIGH-FREQUENCY CHAOS & ADVERSARIAL STRESS LOOPS
    // ========================================================================
    runner.suite('5. High-Frequency Chaos & Adversarial Fuzzing');

    // 5.1 1,000 Rapid Skill Spend/Reset Iterations
    let spInvariantViolations = 0;
    const chaosUser = { level: 20, rpg_class: 'warrior' };
    global.GamificationSkills.ensureInitialized(chaosUser);
    global.currentRpgUser = chaosUser;

    const skillKeys = ['active_1', 'active_2', 'passive_1', 'passive_2'];
    for (let i = 0; i < 1000; i++) {
      // Random action: 0 = unlock random skill, 1 = reset skills, 2 = change class
      const action = i % 3;
      if (action === 0) {
        const rKey = skillKeys[Math.floor(Math.random() * skillKeys.length)];
        global.GamificationSkills.unlockSkill(rKey);
      } else if (action === 1) {
        global.GamificationSkills.resetSkills(true);
      } else {
        const rCls = classes[Math.floor(Math.random() * classes.length)];
        global.GamificationSkills.selectClass(rCls);
      }

      // Check invariant: SP must never be negative or NaN
      if (typeof chaosUser.skill_points !== 'number' || isNaN(chaosUser.skill_points) || chaosUser.skill_points < 0) {
        spInvariantViolations++;
      }
    }
    runner.assertEqual(spInvariantViolations, 0, '1,000 rapid skill operations maintained SP >= 0 with zero NaN violations');

    // 5.2 500 Rapid Pet Feeding & Upgrading Interleaved Loops
    let petInvariantViolations = 0;
    const chaosPetUser = {
      gold: 50000,
      dust: 20000,
      pets: {
        baby_drake: { unlocked: true, level: 1, affinity: 50 }
      }
    };
    global.GamificationPets.ensureInitialized(chaosPetUser);
    global.currentRpgUser = chaosPetUser;

    const foods = ['snack_apple', 'snack_fish', 'snack_meat', 'snack_crystal'];
    for (let i = 0; i < 500; i++) {
      if (i % 2 === 0) {
        const rFood = foods[Math.floor(Math.random() * foods.length)];
        global.GamificationPets.feedPet('baby_drake', rFood);
      } else {
        global.GamificationPets.upgradePet('baby_drake');
      }

      const pState = chaosPetUser.pets.baby_drake;
      if (pState.affinity < 0 || pState.affinity > 100 || isNaN(pState.affinity)) {
        petInvariantViolations++;
      }
      if (pState.level < 1 || pState.level > 10 || isNaN(pState.level)) {
        petInvariantViolations++;
      }
    }
    runner.assertEqual(petInvariantViolations, 0, '500 rapid feed & upgrade loops maintained affinity [0, 100] and level [1, 10]');

    // 5.3 Adversarial Input Injection
    // Dirty numbers to getPetBuffs
    const dirtyBuff1 = global.GamificationPets.getPetBuffs('wise_owl', NaN, NaN);
    runner.assertEqual(dirtyBuff1.level, 1, 'getPetBuffs with NaN level clamps safely to 1');
    runner.assertEqual(dirtyBuff1.affinity, 0, 'getPetBuffs with NaN affinity clamps safely to 0');

    const dirtyBuff2 = global.GamificationPets.getPetBuffs('wise_owl', 999, 999);
    runner.assertEqual(dirtyBuff2.level, 10, 'getPetBuffs with 999 level clamps safely to 10');
    runner.assertEqual(dirtyBuff2.affinity, 100, 'getPetBuffs with 999 affinity clamps safely to 100');

    const dirtyBuff3 = global.GamificationPets.getPetBuffs('wise_owl', -5, -50);
    runner.assertEqual(dirtyBuff3.level, 1, 'getPetBuffs with negative level clamps safely to 1');
    runner.assertEqual(dirtyBuff3.affinity, 0, 'getPetBuffs with negative affinity clamps safely to 0');

    // Dirty floor to getFloorModifier
    const dirtyMod1 = global.GamificationTower.getFloorModifier(-5);
    runner.assert(Boolean(dirtyMod1), 'getFloorModifier with negative floor clamps to valid modifier');

    const dirtyMod2 = global.GamificationTower.getFloorModifier(1000000);
    runner.assert(Boolean(dirtyMod2), 'getFloorModifier with 1,000,000 floor cycles safely');

    // Duration and completion
    const duration = Date.now() - startTime;
    console.log(`=== CHALLENGER M2 FINISHED: ${runner.passed}/${runner.total} PASSED (${runner.failed} failed) in ${duration}ms ===`);

    return {
      total: runner.total,
      passed: runner.passed,
      failed: runner.failed,
      duration: duration,
      results: runner.results
    };
  }

  global.runAllChallengerTests = runAllChallengerTests;

})(typeof window !== 'undefined' ? window : global);
