// ==================== ĐỘNG CƠ ĐẤU THEO LƯỢT PIXEL RPG NÂNG CẤP (ADVANCED PIXEL BATTLE ENGINE) ====================
// Thiết kế chuyên biệt cho battle.html: Đồ họa Canvas Pixel Art mượt mà,
// Hoạt ảnh vung kiếm/bắn tên/phóng phép, Vết chém xé gió, Quái vật nổ tung khi chết,
// Thanh máu trễ (Ghost Bar) chuẩn game đối kháng, và Âm thanh 8-bit bùng nổ.

// ==================== GLOBAL DAMAGE FORMULA: MONSTER -> HERO ====================
window.calculateMonsterDamage = function(monsterRawAtk, heroDef, randOffset = null) {
  const atk = (monsterRawAtk !== undefined && monsterRawAtk !== null && !isNaN(Number(monsterRawAtk)))
    ? Math.max(0, Number(monsterRawAtk))
    : 20;
  const def = (heroDef !== undefined && heroDef !== null && !isNaN(Number(heroDef)))
    ? Math.max(0, Number(heroDef))
    : 10;
  const rand = (randOffset !== null) ? randOffset : (Math.random() * 6);

  // Base scaling prevents Tier 4 275+ ATK from one-shotting 100-150 HP players
  const baseDamage = 12 + (atk * 0.20);

  // Battle-tested hyperbolic mitigation curve: 60 / (60 + DEF)
  // DEF 0 -> 100% dmg; DEF 10 -> 85.7% dmg; DEF 30 -> 66.7% dmg; DEF 60 -> 50% dmg
  const defReduction = 60 / (60 + def);

  return Math.max(8, Math.round((baseDamage + rand) * defReduction));
};

const BattleEngine = {
  canvas: null,
  ctx: null,
  animId: null,
  active: false,
  width: 800,
  height: 260,
  lastTime: 0,
  screenShake: 0,
  soundMuted: false,

  // Canonical Biome Icons & Labels mapping all 30 unique biomes in DUNGEON_DATA_100
  biomeIcons: {
    abyssal_ocean: '🌊 Đại Dương Sâu',
    alpine_peaks: '🏔️ Đỉnh Băng Giá',
    ancestral_manor: '🏰 Trang Viên Cổ Tộc',
    ancient_ruins: '🏛️ Cổ Thành Phế Tích',
    beast_savanna: '🦁 Thảo Nguyên Dã Thú',
    broadcast_studio: '📡 Phim Trường Truyền Hình',
    carnival_night: '🎪 Lễ Hội Đêm Bí Ẩn',
    catwalk_fashion: '👗 Sàn Diễn Catwalk',
    colosseum_arena: '⚔️ Đấu Trường La Mã',
    cozy_cafe: '☕ Quán Cà Phê Ấm Cúng',
    crystal_cavern: '💎 Hang Pha Lê Huyền Ảo',
    cyber_arcade_city: '👾 Thành Phố Cyber Hư Không',
    deep_cosmos: '🌌 Vũ Trụ Thâm Uyên',
    global_freight_terminal: '🚢 Cảng Logistics Toàn Cầu',
    gold_bullion_vault: '💰 Kho Vàng Hoàng Kim Midas',
    grand_symphony: '🎻 Nhà Hát Đại Giao Hưởng',
    haunted_mansion: '👻 Lâu Đài Ma Ám',
    high_tribunal: '⚖️ Tòa Án Tối Cao',
    infinite_library: '📚 Thư Viện Vô Tận',
    iron_foundry: '⚙️ Xưởng Đúc Cơ Giới Thép',
    magma_hotpot: '🍲 Núi Lửa Lẩu Nóng',
    medical_bio_lab: '🧬 Viện Sinh Học Phân Tử',
    metropolis_freeway: '🏎️ Xa Lộ Cao Tốc Đô Thị',
    mirror_psyche: '🪞 Cung Điện Gương Tâm Trí',
    primeval_forest: '🌲 Rừng Nguyên Sinh Cổ Đại',
    quantum_agi_datacenter: '🤖 Trung Tâm Dữ Liệu Quantum AGI',
    sacred_cathedral: '⛪ Thánh Đường Thần Thánh',
    skyport_terminal: '✈️ Sân Bay Trên Không',
    storm_caldera: '🌩️ Hõm Núi Lôi Bão',
    toxic_reactor: '☢️ Lò Phản Ứng Độc Tố',
    // Aliases
    fashion_catwalk: '👗 Sàn Diễn Catwalk',
    clockwork_foundry: '⚙️ Xưởng Đúc Cơ Giới Thép',
    concert_symphony: '🎻 Nhà Hát Đại Giao Hưởng',
    cyber_arcade: '👾 Thành Phố Cyber Hư Không',
    celestial_cosmos: '🌌 Vũ Trụ Thâm Uyên',
    quantum_supercomputer: '🤖 Trung Tâm Dữ Liệu Quantum AGI',
    treasury_vault: '💰 Kho Vàng Hoàng Kim Midas'
  },

  // Hiệp sĩ
  hero: {
    x: 130,
    y: 155,
    baseY: 155,
    hp: 100,
    maxHp: 100,
    ghostHp: 100, // Thanh máu trễ
    mp: 40,
    maxMp: 40,
    state: 'idle', // idle, dashing, slashing, hurt, dead, victory
    animTimer: 0,
    lungeX: 0,
    flashWhite: 0,
    ghostTrails: []
  },

  // Quái vật
  monster: {
    x: 650,
    y: 150,
    baseY: 150,
    hp: 100,
    maxHp: 100,
    ghostHp: 100,
    name: 'Slime Xanh',
    type: 'slime',
    color: '#22C55E',
    isBoss: false,
    state: 'idle', // idle, attacking, hurt, dying, dead
    animTimer: 0,
    lungeX: 0,
    flashWhite: 0,
    wave: 1,
    totalWaves: 10,
    deathTimer: 0,
    scale: 1
  },

  // Đạn đạo & Phép thuật đang bay (Projectiles)
  projectiles: [],
  // Vết chém kiếm sáng (Slash Arcs)
  slashes: [],
  // Hạt bụi, mảnh vỡ quái nổ tung (Shatter Particles)
  particles: [],
  // Chữ số sát thương nhảy nảy (Bouncing Floating Texts)
  floatingTexts: [],

  // Roster 10 quái vật tiến trình
  MONSTER_ROSTER: [
    { type: 'slime', name: 'Slime Xanh Quái Dị', baseHp: 40, color: '#22C55E', isBoss: false },
    { type: 'bat', name: 'Dơi Quỷ Hút Máu', baseHp: 50, color: '#9333EA', isBoss: false },
    { type: 'skeleton', name: 'Bộ Xương Kiếm Sĩ', baseHp: 65, color: '#CBD5E1', isBoss: false },
    { type: 'goblin', name: 'Yêu Tinh Ranh Mãnh', baseHp: 80, color: '#16A34A', isBoss: false },
    { type: 'wolf', name: 'Ma Sói Rừng Thẳm', baseHp: 95, color: '#64748B', isBoss: false },
    { type: 'golem', name: 'Người Đá Thạch Anh', baseHp: 115, color: '#D97706', isBoss: false },
    { type: 'dark_mage', name: 'Hắc Thuật Sư Sa Ngã', baseHp: 130, color: '#7C3AED', isBoss: false },
    { type: 'spider', name: 'Nhện Độc Khổng Lồ', baseHp: 145, color: '#DC2626', isBoss: false },
    { type: 'knight', name: 'Hắc Kỵ Sĩ Hầm Ngục', baseHp: 165, color: '#1E293B', isBoss: false },
    { type: 'dragon', name: 'TRÙM CUỐI: HẮC LONG MA VƯƠNG', baseHp: 240, color: '#EF4444', isBoss: true }
  ],

  init: function(canvasId = 'pixelBattleCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bindActionEvents();
  },

  startBattle: function(totalWaves = 10) {
    if (!this.canvas) this.init();
    if (!this.ctx) return;

    this.active = true;
    this.particles = [];
    this.projectiles = [];
    this.slashes = [];
    this.floatingTexts = [];

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : {
      hp: 120, max_hp: 120, mp: 50, max_mp: 50, rpg_class: 'warrior', display_name: 'Hiệp Sĩ Anki'
    };
    if (typeof ensureUserEquipmentInitialized === 'function') {
      ensureUserEquipmentInitialized(user);
    }
    const totalStats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { hp: 120, mp: 50 };

    this.hero.hp = totalStats.hp || user.hp || 100;
    this.hero.maxHp = totalStats.hp || user.max_hp || 100;
    this.hero.ghostHp = this.hero.hp;
    this.hero.mp = totalStats.mp || user.mp || 40;
    this.hero.maxMp = totalStats.mp || user.max_mp || 40;
    this.hero.state = 'idle';
    this.hero.lungeX = 0;
    this.hero.flashWhite = 0;
    this.hero.ghostTrails = [];

    this.spawnMonster(1, totalWaves);

    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);

    this.updateBattleUI();
  },

  stopBattle: function() {
    this.active = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  },

  getActiveTopicStt: function() {
    if (typeof activeDungeonStt !== 'undefined' && activeDungeonStt) return activeDungeonStt;
    if (typeof window.activeDungeonStt !== 'undefined' && window.activeDungeonStt) return window.activeDungeonStt;
    if (typeof currentQuizWord !== 'undefined' && currentQuizWord?.stt) return currentQuizWord.stt;
    if (typeof quizSelectedStts !== 'undefined' && quizSelectedStts?.size > 0) return Array.from(quizSelectedStts)[0];
    return 1;
  },

  spawnMonster: function(waveNum, totalWaves) {
    const bossPhaseTurns = Math.min(4, Math.max(3, Math.floor(totalWaves * 0.3))); // Ví dụ: 3 lượt cho 10 câu, 4 lượt cho 15 câu
    const bossStartWave = Math.max(2, totalWaves - bossPhaseTurns + 1); // Bắt đầu chạm trán Boss từ wave này
    const isBossPhase = waveNum >= bossStartWave;

    const currentStt = this.getActiveTopicStt();
    const monsterSpec = (typeof getDungeonMonstersForTopic === 'function') 
      ? getDungeonMonstersForTopic(currentStt, waveNum, totalWaves) 
      : null;

    // 1. NẾU ĐANG TRONG GIAI ĐOẠN ĐÁNH TRÙM CUỐI (MULTI-TURN BOSS BATTLE)
    if (isBossPhase) {
      // Nếu Boss đã được triệu hồi và chưa chết -> GIỮ NGUYÊN BOSS, TIẾP TỤC BÀO MÁU QUA NHIỀU CÂU HỎI!
      if (this.monster && this.monster.isBoss && this.monster.hp > 0 && this.monster.state !== 'dead') {
        this.monster.wave = waveNum;
        this.monster.totalWaves = totalWaves;
        this.addFloatDamage(this.monster.x, this.monster.y - 45, `👑 HIỆP TIẾP THEO: ${waveNum}/${totalWaves}!`, '#FDE047', false);
        
        // Hiệu ứng khói lửa quanh rồng khi bị thương
        if (this.monster.enraged) {
          for (let i = 0; i < 15; i++) {
            this.particles.push({
              x: this.monster.x + (Math.random() - 0.5) * 60,
              y: this.monster.y + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 90,
              vy: -60 - Math.random() * 70,
              size: 3,
              color: '#EF4444',
              life: 0.6
            });
          }
        }
        this.updateBattleUI();
        return;
      }

      // Lần đầu triệu hồi Trùm Cuối độc nhất của chủ đề!
      this.triggerBossAlert();

      // Cân bằng máu Trùm Cuối: Tính toán dựa trên Topic Tier và lực chiến thực tế của Hiệp Sĩ
      const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
      const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 40 };
      const playerAtk = Math.max(35, stats.atk || 40);
      const expectedHit = playerAtk * 1.25;
      
      // Máu Boss đủ dày kết hợp baseHp của Boss trong 100 chủ đề, cần 3-5 cú đánh chuẩn xác, KHÔNG BAO GIỜ BỊ 1-SHOT!
      const baseHpSpec = monsterSpec?.baseHp || 750;
      const calculatedHp = Math.max(baseHpSpec, Math.round(expectedHit * (bossPhaseTurns * 1.35) + (waveNum * 35)));

      this.monster = {
        x: 650,
        y: 150,
        baseY: 150,
        hp: calculatedHp,
        maxHp: calculatedHp,
        ghostHp: calculatedHp,
        name: monsterSpec?.name || "TRÙM CUỐI: HẮC LONG MA VƯƠNG",
        title: monsterSpec?.title || "Chúa Tể Hầm Ngục",
        type: monsterSpec?.type || 'dragon',
        color: monsterSpec?.color || '#EF4444',
        atk: monsterSpec?.atk || (45 + Math.round(waveNum * 1.5)),
        def: monsterSpec?.def || (25 + Math.round(waveNum * 1.0)),
        skillName: monsterSpec?.skillName || "Hơi Thở Hắc Long",
        roars: monsterSpec?.roars || ["Ngươi không thể vượt qua ta!"],
        isBoss: true,
        state: 'spawn',
        animTimer: 0,
        lungeX: 0,
        flashWhite: 0.8,
        wave: waveNum,
        totalWaves: totalWaves,
        deathTimer: 0,
        scale: 1.45,
        enraged: false,
        element: monsterSpec?.element || 'fire',
        elementIcon: monsterSpec?.elementIcon || '🔥',
        turnCount: 0,
        isCharging: false,
        chargeSkill: null,
        frozen: false,
        freezeTurns: 0,
        poisonTurns: 0,
        poisonDmg: 0,
        burnTurns: 0,
        burnDmg: 0
      };

      // Hiệu ứng triệu hồi rồng ma quái chấn động theo màu sắc của Boss
      const bColor = this.monster.color || '#EF4444';
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: this.monster.x + (Math.random() - 0.5) * 60,
          y: this.monster.y + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 140,
          vy: -80 - Math.random() * 90,
          size: 4,
          color: i % 2 === 0 ? bColor : '#F59E0B',
          life: 0.8
        });
      }

      setTimeout(() => {
        if (this.monster.state === 'spawn') this.monster.state = 'idle';
      }, 500);

      this.updateBattleUI();
      return;
    }

    // 2. CÁC ẢI QUÁI THƯỜNG TRƯỚC TRÙM CUỐI (THEMATIC MINIONS)
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 40 };
    const playerAtk = Math.max(35, stats.atk || 40);
    const calculatedHp = Math.max(25, Math.round(playerAtk * 0.95));

    this.monster = {
      x: 650,
      y: 150,
      baseY: 150,
      hp: calculatedHp,
      maxHp: calculatedHp,
      ghostHp: calculatedHp,
      name: monsterSpec?.name || "Quái Vật Hầm Ngục",
      type: monsterSpec?.type || 'minion',
      color: monsterSpec?.color || '#22C55E',
      atk: monsterSpec?.atk || 20,
      def: monsterSpec?.def || 10,
      isBoss: false,
      state: 'spawn',
      animTimer: 0,
      lungeX: 0,
      flashWhite: 0.5,
      wave: waveNum,
      totalWaves: totalWaves,
      deathTimer: 0,
      scale: 1.0,
      enraged: false,
      element: monsterSpec?.element || 'nature',
      elementIcon: monsterSpec?.elementIcon || '🌿',
      turnCount: 0,
      isCharging: false,
      chargeSkill: null,
      frozen: false,
      freezeTurns: 0,
      poisonTurns: 0,
      poisonDmg: 0,
      burnTurns: 0,
      burnDmg: 0
    };

    // Hiệu ứng hạt xuất hiện quái vật
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.monster.x + (Math.random() - 0.5) * 40,
        y: this.monster.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 80,
        vy: -40 - Math.random() * 60,
        size: 3,
        color: this.monster.color,
        life: 0.6
      });
    }

    setTimeout(() => {
      if (this.monster.state === 'spawn') this.monster.state = 'idle';
    }, 400);

    this.updateBattleUI();
  },

  // Phân giải hệ nguyên tố của Hiệp sĩ (Vũ khí hoặc mặc định class)
  getHeroElement: function(user) {
    if (!user) return 'fire';
    const eq = user.equipped || {};
    const weaponItem = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(eq.weapon) : null;
    if (weaponItem && weaponItem.element) {
      return weaponItem.element.toLowerCase();
    }
    const classElements = {
      warrior: 'fire',
      mage: 'lightning',
      ranger: 'nature',
      assassin: 'dark'
    };
    return classElements[user.rpg_class] || 'fire';
  },

  // Bộ xử lý hiệu ứng trạng thái theo lượt (DoT: Độc Sát Thủ & Thiêu Đốt Rồng Con)
  applyTurnStatusEffects: function() {
    if (!this.monster || this.monster.hp <= 0 || this.monster.state === 'dying' || this.monster.state === 'dead') return false;

    let tookEffect = false;

    // 1. Assassin Poison DoT (25 HP/lượt trong 3 lượt)
    if (this.monster.poisonTurns > 0) {
      const dot = this.monster.poisonDmg || 25;
      this.monster.hp = Math.max(0, this.monster.hp - dot);
      this.monster.poisonTurns--;
      tookEffect = true;

      this.addFloatDamage(
        this.monster.x,
        this.monster.y - 40,
        `🧪 ĐỘC RÚT! -${dot} HP (${this.monster.poisonTurns} lượt)`,
        '#A855F7',
        true
      );
      this.createHitSparks(this.monster.x, this.monster.y, false);
      RetroAudio.playHit();

      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
        return true;
      }
    }

    // 2. Baby Drake Burn DoT
    if (this.monster.burnTurns > 0) {
      const burn = this.monster.burnDmg || 5;
      this.monster.hp = Math.max(0, this.monster.hp - burn);
      this.monster.burnTurns--;
      tookEffect = true;

      this.addFloatDamage(
        this.monster.x,
        this.monster.y - 50,
        `🔥 THIÊU ĐỐT! -${burn} HP (${this.monster.burnTurns} lượt)`,
        '#EF4444',
        true
      );
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
        return true;
      }
    }

    return tookEffect;
  },

  loop: function(timestamp) {
    if (!this.active) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.loop);
  },

  update: function(dt) {
    // 1. Rung chấn màn hình
    if (this.screenShake > 0) {
      this.screenShake -= dt * 15;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // 2. Cập nhật thanh máu trễ (Ghost HP Bar smooth decay)
    if (this.hero.ghostHp > this.hero.hp) {
      this.hero.ghostHp -= dt * 40;
      if (this.hero.ghostHp < this.hero.hp) this.hero.ghostHp = this.hero.hp;
    } else if (this.hero.ghostHp < this.hero.hp) {
      this.hero.ghostHp = this.hero.hp;
    }

    if (this.monster.ghostHp > this.monster.hp) {
      this.monster.ghostHp -= dt * 60;
      if (this.monster.ghostHp < this.monster.hp) this.monster.ghostHp = this.monster.hp;
    } else if (this.monster.ghostHp < this.monster.hp) {
      this.monster.ghostHp = this.monster.hp;
    }

    // 3. Hoạt ảnh Hiệp sĩ
    this.hero.animTimer += dt * 6;
    if (this.hero.flashWhite > 0) this.hero.flashWhite -= dt * 4;

    if (this.hero.state === 'dashing') {
      this.hero.lungeX += 1200 * dt;
      // Tạo bóng mờ sau lưng khi lướt (Ghost Trails)
      if (Math.random() > 0.4) {
        this.hero.ghostTrails.push({ x: this.hero.x + this.hero.lungeX, y: this.hero.baseY, life: 0.2 });
      }
      if (this.hero.lungeX >= 360) {
        this.hero.state = 'slashing';
        this.onHeroStrikeConnect();
      }
    } else if (this.hero.state === 'retracting') {
      this.hero.lungeX -= 900 * dt;
      if (this.hero.lungeX <= 0) {
        this.hero.lungeX = 0;
        this.hero.state = 'idle';
      }
    }

    // Cập nhật bóng mờ của hero
    for (let i = this.hero.ghostTrails.length - 1; i >= 0; i--) {
      this.hero.ghostTrails[i].life -= dt;
      if (this.hero.ghostTrails[i].life <= 0) this.hero.ghostTrails.splice(i, 1);
    }

    // 4. Hoạt ảnh Quái vật
    this.monster.animTimer += dt * (this.monster.enraged ? 10 : 5);
    if (this.monster.flashWhite > 0) this.monster.flashWhite -= dt * 4;

    // Hiệu ứng tàn lửa khi Cuồng Nộ
    if (this.monster.enraged && Math.random() < 0.25) {
      this.particles.push({
        x: this.monster.x + (Math.random() - 0.5) * 40,
        y: this.monster.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 60,
        vy: -50 - Math.random() * 50,
        size: 3,
        color: '#EF4444',
        life: 0.4
      });
    }

    // Hiệu ứng hào quang tích tụ tuyệt kỹ (charging aura)
    if (this.monster.isCharging && Math.random() < 0.3) {
      this.particles.push({
        x: this.monster.x + (Math.random() - 0.5) * 50,
        y: this.monster.y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 40,
        vy: -40 - Math.random() * 40,
        size: 4,
        color: '#F59E0B',
        life: 0.5
      });
    }

    if (this.monster.state === 'attacking') {
      const lungeSpeed = this.monster.enraged ? 1400 : 1100;
      this.monster.lungeX -= lungeSpeed * dt;
      if (this.monster.lungeX <= -360) {
        this.onMonsterStrikeConnect();
        this.monster.state = 'retracting';
      }
    } else if (this.monster.state === 'retracting') {
      this.monster.lungeX += 800 * dt;
      if (this.monster.lungeX >= 0) {
        this.monster.lungeX = 0;
        this.monster.state = 'idle';
      }
    } else if (this.monster.state === 'dying') {
      this.monster.deathTimer += dt;
      // Trong lúc chết, quái giật liên tục và nhỏ dần
      this.monster.scale = Math.max(0, this.monster.scale - dt * 1.2);
      if (this.monster.deathTimer >= 0.8) {
        this.monster.state = 'dead';
        this.onMonsterDeathComplete();
      }
    }

    // 5. Cập nhật Đạn đạo (Projectiles)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      // Tạo hạt đuôi sáng
      if (Math.random() > 0.2) {
        this.particles.push({
          x: proj.x, y: proj.y,
          vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
          size: 2, color: proj.trailColor || '#FDE047', life: 0.25
        });
      }
      if (proj.x >= this.monster.x - 20) {
        this.projectiles.splice(i, 1);
        this.onHeroStrikeConnect();
      }
    }

    // 6. Cập nhật Vết chém (Slashes)
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.life -= dt;
      s.scale += dt * 3;
      if (s.life <= 0) this.slashes.splice(i, 1);
    }

    // 7. Cập nhật Hạt (Particles)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 150) * dt; // Trọng lực rơi
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 8. Cập nhật Chữ số sát thương nổi (Floating Text)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x += (ft.vx || 0) * dt;
      ft.y -= ft.speed * dt;
      ft.speed = Math.max(10, ft.speed - dt * 45); // Giảm tốc nảy nảy
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  },

  render: function() {
    const ctx = this.ctx;
    ctx.save();

    // Rung màn hình khi chém mạnh
    if (this.screenShake > 0) {
      const dx = (Math.random() - 0.5) * this.screenShake * 10;
      const dy = (Math.random() - 0.5) * this.screenShake * 10;
      ctx.translate(dx, dy);
    }

    // Bối cảnh Ngục Tối Cao Cấp
    this.drawEpicDungeon(ctx);

    // Bóng mờ của Hiệp sĩ khi lướt
    this.drawHeroGhostTrails(ctx);

    // Hiệp sĩ
    this.drawHero(ctx);

    // Linh thú đồng hành trợ chiến (Module 5)
    if (typeof GamificationPets !== 'undefined' && typeof GamificationPets.drawPetOnCanvas === 'function') {
      GamificationPets.drawPetOnCanvas(ctx, this.hero.x + (this.hero.lungeX || 0), this.hero.y, this.hero.animTimer);
    }

    // Quái vật
    if (this.monster.state !== 'dead') {
      this.drawMonster(ctx);
    }

    // Đạn ma pháp / Mũi tên đang bay
    this.drawProjectiles(ctx);

    // Vết chém xé gió hình lưỡi liềm (Slash Arc)
    this.drawSlashes(ctx);

    // Hạt nổ, mảnh vỡ quái nổ tung
    this.drawParticles(ctx);

    // Chữ số sát thương
    this.drawFloatingTexts(ctx);

    // Scanlines 16-bit
    this.drawScanlines(ctx);

    ctx.restore();
  },

  // ==================== BỐI CẢNH 100 HẦM NGỤC THEMATIC THEO CHỦ ĐỀ ====================
  drawEpicDungeon: function(ctx) {
    const stt = this.getActiveTopicStt();
    const theme = (typeof getDungeonThemeForTopic === 'function') ? getDungeonThemeForTopic(stt) : {
      wallColor: '#0B0D17', floorColor: '#121422', accentColor: '#FFE787', biome: 'stone_dungeon'
    };

    // 1. Tường hậu cảnh với dải màu Biome đặc thù
    ctx.fillStyle = theme.wallColor || '#0B0D17';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Kiến trúc & Họa tiết độc nhất theo từng Biome
    const biome = theme.biome || 'stone_dungeon';
    this.drawBiomeArchitecture(ctx, biome, theme);

    // 3. Sàn đấu trường Thematic
    ctx.fillStyle = theme.floorColor || '#121422';
    ctx.fillRect(0, 140, this.width, this.height - 140);
    ctx.fillStyle = theme.accentColor || '#FF9F1C';
    ctx.fillRect(0, 140, this.width, 3); // Kẻ chỉ ranh giới sàn

    // Lưới phối cảnh sàn đấu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < this.width; x += 40) {
      ctx.fillRect(x, 143, 2, this.height - 143);
    }
    for (let y = 143; y < this.height; y += 24) {
      ctx.fillRect(0, y, this.width, 1);
    }

    // 4. Hiệu ứng hạt môi trường riêng của từng chủ đề
    this.drawBiomeAmbientEffects(ctx, theme);
  },

  drawBiomeArchitecture: function(ctx, biome, theme) {
    const timer = this.hero ? this.hero.animTimer : 0;
    const accent = theme.accentColor || '#FFE787';

    if (biome === 'catwalk_fashion') {
      // Sàn diễn thời trang: Vệt sáng spotlight chiếu từ trên trần xuống
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.beginPath();
      ctx.moveTo(180, 0); ctx.lineTo(120, 140); ctx.lineTo(260, 140); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(620, 0); ctx.lineTo(540, 140); ctx.lineTo(700, 140); ctx.closePath();
      ctx.fill();
      // Ma-nơ-canh bóng mờ hai bên cánh gà
      ctx.fillStyle = '#261233';
      ctx.fillRect(50, 40, 16, 95); ctx.beginPath(); ctx.arc(58, 32, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(734, 40, 16, 95); ctx.beginPath(); ctx.arc(742, 32, 10, 0, Math.PI * 2); ctx.fill();
    } else if (biome === 'cozy_cafe') {
      // Quán cà phê: Kệ gỗ cổ điển & thùng chứa hạt cafe đồng
      ctx.fillStyle = '#1B0F09';
      ctx.fillRect(20, 30, 110, 8); ctx.fillRect(20, 65, 110, 8); ctx.fillRect(20, 100, 110, 8);
      ctx.fillRect(670, 30, 110, 8); ctx.fillRect(670, 65, 110, 8); ctx.fillRect(670, 100, 110, 8);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(40, 18, 14, 12); ctx.fillRect(80, 18, 18, 12);
      ctx.fillRect(690, 52, 22, 13); ctx.fillRect(740, 52, 16, 13);
    } else if (biome === 'magma_hotpot') {
      // Lò nung & vạc lẩu Tứ Xuyên: Khe nứt dung nham đỏ
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath(); ctx.arc(this.width / 2, 120, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(100, 20, 24, 30); ctx.fillRect(680, 20, 24, 30);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(108, 25, 8, 20); ctx.fillRect(688, 25, 8, 20);
    } else if (biome === 'medical_bio_lab') {
      // Phòng lab / Bệnh viện: Đường điện tim ECG phát sáng neon
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += 10) {
        let y = 65;
        const pulseX = (x + timer * 80) % 200;
        if (pulseX > 80 && pulseX < 120) {
          y += Math.sin((pulseX - 80) / 40 * Math.PI * 2) * 28;
        }
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(this.width / 2 - 8, 40, 16, 50);
      ctx.fillRect(this.width / 2 - 25, 57, 50, 16);
    } else if (biome === 'sacred_cathedral') {
      // Giáo đường: Cửa sổ hoa hồng kính màu (Stained Glass)
      const cx = this.width / 2, cy = 60;
      ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.stroke();
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
      for (let a = 0; a < 8; a++) {
        const rad = (a / 8) * Math.PI * 2;
        ctx.fillStyle = colors[a % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 38, rad, rad + (Math.PI / 4));
        ctx.closePath();
        ctx.fill();
      }
    } else if (biome === 'iron_foundry') {
      // Xưởng đúc sắt & bánh răng cơ khí quay
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 4;
      const angle = timer * 0.8;
      ctx.save();
      ctx.translate(110, 65); ctx.rotate(angle);
      ctx.strokeRect(-24, -24, 48, 48); ctx.strokeRect(-18, -18, 36, 36);
      ctx.restore();
      ctx.save();
      ctx.translate(690, 65); ctx.rotate(-angle);
      ctx.strokeRect(-28, -28, 56, 56);
      ctx.restore();
    } else if (biome === 'abyssal_ocean') {
      // Đáy đại dương xanh thẳm: Cột san hô phát sáng & bong bóng nổi
      ctx.fillStyle = '#0E3B5C';
      ctx.fillRect(40, 50, 24, 90); ctx.fillRect(736, 50, 24, 90);
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath(); ctx.arc(52, 45, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(748, 45, 18, 0, Math.PI * 2); ctx.fill();
    } else if (biome === 'grand_symphony') {
      // Nhà hát giao hưởng: Ống đàn đại dương cầm (Pipe Organ) bằng đồng
      for (let i = 0; i < 9; i++) {
        const pipeH = 35 + Math.abs(i - 4) * 12;
        ctx.fillStyle = '#B45309';
        ctx.fillRect(this.width / 2 - 70 + i * 16, 140 - pipeH, 12, pipeH);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(this.width / 2 - 70 + i * 16 + 2, 140 - pipeH, 4, pipeH);
      }
    } else if (biome === 'alpine_peaks') {
      // Đỉnh núi tuyết phủ dưới trăng
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.moveTo(80, 140); ctx.lineTo(190, 30); ctx.lineTo(300, 140); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(500, 140); ctx.lineTo(620, 20); ctx.lineTo(740, 140); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath(); ctx.arc(this.width / 2, 42, 22, 0, Math.PI * 2); ctx.fill();
    } else if (biome === 'cyber_arcade_city') {
      // Thành phố Synthwave 8-bit: Lưới neon phối cảnh & skyline tòa nhà
      ctx.fillStyle = '#161B22';
      ctx.fillRect(60, 40, 45, 100); ctx.fillRect(130, 20, 55, 120);
      ctx.fillRect(615, 25, 50, 115); ctx.fillRect(690, 45, 60, 95);
      ctx.fillStyle = '#38BDF8';
      for (let y = 30; y < 130; y += 18) {
        ctx.fillRect(145, y, 8, 8); ctx.fillRect(165, y, 8, 8);
        ctx.fillRect(630, y, 8, 8); ctx.fillRect(710, y, 8, 8);
      }
    } else if (biome === 'deep_cosmos') {
      // Không gian vũ trụ: Vòng xoáy Tinh vân & Hành tinh có vành đai
      const grad = ctx.createRadialGradient(240, 65, 5, 240, 65, 90);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(240, 65, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath(); ctx.arc(650, 50, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(650, 50, 48, 10, -0.25, 0, Math.PI * 2); ctx.stroke();
    } else if (biome === 'quantum_agi_datacenter') {
      // Trung tâm AGI Lượng Tử: Dãy máy chủ & dòng code Matrix xanh
      ctx.fillStyle = '#061822';
      ctx.fillRect(30, 20, 90, 120); ctx.fillRect(680, 20, 90, 120);
      ctx.fillStyle = '#06B6D4';
      for (let y = 30; y < 135; y += 14) {
        ctx.fillRect(45, y, 6, 6); ctx.fillRect(70, y, 6, 6); ctx.fillRect(95, y, 6, 6);
        ctx.fillRect(695, y, 6, 6); ctx.fillRect(720, y, 6, 6); ctx.fillRect(745, y, 6, 6);
      }
    } else if (biome === 'gold_bullion_vault') {
      // Hầm kho vàng: Cửa két khổng lồ & thỏi vàng
      ctx.fillStyle = '#3E2A0A';
      ctx.beginPath(); ctx.arc(this.width / 2, 70, 55, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(this.width / 2, 70, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(60, 115, 36, 12); ctx.fillRect(75, 103, 36, 12);
      ctx.fillRect(700, 115, 36, 12); ctx.fillRect(685, 103, 36, 12);
    } else {
      // Bối cảnh Ngục tối cổ (Mặc định cho các hầm ngục đá)
      this.drawStonePillar(ctx, 30);
      this.drawStonePillar(ctx, 740);
      this.drawTorch(ctx, 130, 48);
      this.drawTorch(ctx, 670, 48);
    }
  },

  drawBiomeAmbientEffects: function(ctx, theme) {
    const timer = this.hero ? this.hero.animTimer : 0;
    const effect = theme.effect || 'ambient_sparks';
    const pColor = theme.particleColor || '#F59E0B';

    if (effect === 'snowfall') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 25; i++) {
        const sx = ((i * 37) + timer * 20) % this.width;
        const sy = ((i * 29) + timer * 45) % 140;
        ctx.fillRect(sx, sy, 2.5, 2.5);
      }
    } else if (effect === 'ocean_bubbles') {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 18; i++) {
        const bx = (i * 48 + Math.sin(timer + i) * 15) % this.width;
        const by = 140 - ((timer * 35 + i * 20) % 130);
        ctx.beginPath(); ctx.arc(bx, by, 3 + (i % 4), 0, Math.PI * 2); ctx.stroke();
      }
    } else if (effect === 'shooting_stars') {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 30; i++) {
        const starX = (i * 31) % this.width;
        const starY = (i * 17) % 130;
        const twinkle = Math.abs(Math.sin(timer * 2 + i));
        ctx.globalAlpha = twinkle * 0.8;
        ctx.fillRect(starX, starY, 2, 2);
      }
      ctx.globalAlpha = 1.0;
    } else if (effect === 'music_notes') {
      ctx.fillStyle = pColor;
      ctx.font = 'bold 14px serif';
      const notes = ['♪', '♫', '♩', '♬'];
      for (let i = 0; i < 6; i++) {
        const nx = (180 + i * 85 + Math.sin(timer + i) * 20) % this.width;
        const ny = 120 - ((timer * 25 + i * 30) % 110);
        ctx.fillText(notes[i % notes.length], nx, ny);
      }
    } else if (effect === 'binary_rain') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.font = '10px monospace';
      for (let i = 0; i < 15; i++) {
        const cx = (i * 54) % this.width;
        const cy = ((timer * 40 + i * 25) % 120);
        ctx.fillText((i % 2 === 0 ? '1' : '0'), cx, cy + 10);
      }
    } else {
      ctx.fillStyle = pColor;
      for (let i = 0; i < 12; i++) {
        const px = (120 + i * 55 + Math.sin(timer * 2 + i) * 12) % this.width;
        const py = 120 - ((timer * 20 + i * 25) % 100);
        ctx.fillRect(px, py, 2, 2);
      }
    }
  },

  drawStonePillar: function(ctx, x) {
    ctx.fillStyle = '#1E2238';
    ctx.fillRect(x, 0, 30, 140);
    ctx.fillStyle = '#2D3252';
    ctx.fillRect(x - 4, 0, 38, 12);
    ctx.fillRect(x - 4, 128, 38, 12);
    ctx.fillStyle = '#111322';
    ctx.fillRect(x + 24, 12, 6, 116); // Bóng râm cột
  },

  drawTorch: function(ctx, x, y) {
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 3, y, 6, 26);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(x - 6, y - 4, 12, 6);

    const flicker = Math.sin(this.hero.animTimer * 2.5 + x) * 3;
    const size = 9 + Math.sin(this.hero.animTimer * 4) * 2;

    // Ngọn lửa nhiều lớp
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x, y - 8 + flicker, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x, y - 8 + flicker, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x, y - 8 + flicker, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Vùng ánh sáng lan tỏa
    const grad = ctx.createRadialGradient(x, y - 8, 2, x, y - 8, 55);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y - 8, 55, 0, Math.PI * 2);
    ctx.fill();
  },

  // ==================== VẼ HIỆP SĨ & HOẠT ẢNH CHIẾN ĐẤU ====================
  drawHeroGhostTrails: function(ctx) {
    for (const trail of this.hero.ghostTrails) {
      ctx.save();
      ctx.globalAlpha = trail.life * 2.5;
      ctx.translate(trail.x, trail.y);
      this.drawHeroSpriteOnly(ctx);
      ctx.restore();
    }
  },

  drawHero: function(ctx) {
    const h = this.hero;
    const bob = (h.state === 'idle') ? Math.sin(h.animTimer) * 3 : 0;
    const x = h.x + h.lungeX;
    const y = h.baseY + bob;

    ctx.save();
    ctx.translate(x, y);

    // Bóng đổ dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 32, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (h.flashWhite > 0) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    this.drawHeroSpriteOnly(ctx);
    ctx.restore();

    // Vẽ thanh máu HP & MP cao cấp có vạch trễ (Ghost Bar)
    this.drawHeroBars(ctx, x, y - 60);
  },

  // ==================== VẼ PREVIEW HIỆP SĨ TRONG SẢNH LOBBY ====================
  renderHeroPreview: function(canvasId = 'lobbyHeroPreviewCanvas') {
    const canvas = (typeof canvasId === 'string') ? document.getElementById(canvasId) : canvasId;
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 15;

    // Hào quang tỏa sáng dưới chân đài vinh danh
    const grad = ctx.createRadialGradient(cx, cy + 18, 5, cx, cy + 18, 55);
    grad.addColorStop(0, 'rgba(255, 231, 135, 0.4)');
    grad.addColorStop(1, 'rgba(255, 231, 135, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy + 18, 55, 0, Math.PI * 2);
    ctx.fill();

    // Bục đá vinh danh (Pedestal Podium)
    ctx.fillStyle = '#1E2238';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 26, 44, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFE787';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vẽ toàn bộ Paperdoll nhân vật với tỷ lệ phóng to 1.45x
    ctx.save();
    ctx.translate(cx, cy - 8);
    ctx.scale(1.45, 1.45);
    this.drawHeroSpriteOnly(ctx);
    ctx.restore();
  },

  drawHeroSpriteOnly: function(ctx) {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const userClass = user?.rpg_class || 'warrior';
    const isAttacking = (this.hero.state === 'slashing');

    // Nạp dữ liệu các trang bị đang mặc từ catalog
    const eq = user?.equipped || {};
    const weaponId = eq.weapon || user?.equipped_weapon;
    const helmetId = eq.helmet;
    const armorId = eq.armor || user?.equipped_armor;
    const bootsId = eq.boots;
    const glovesId = eq.gloves;

    const getItem = (id) => (typeof getRpgEquipmentById === 'function' ? getRpgEquipmentById(id) : null);
    const weapon = getItem(weaponId);
    const helmet = getItem(helmetId);
    const armor = getItem(armorId);
    const boots = getItem(bootsId);
    const gloves = getItem(glovesId);

    // 1. Vẽ Hào Quang Hộ Thể (Legendary / Epic Aura)
    this.drawHeroAura(ctx, weapon, armor, helmet);

    // 2. Vẽ Chân & Ủng (Boots)
    this.drawHeroBoots(ctx, boots, userClass);

    // 3. Vẽ Thân & Áo Giáp / Áo Choàng (Armor & Cape)
    this.drawHeroArmor(ctx, armor, userClass);

    // 4. Vẽ Đầu & Mũ / Nón / Vương Miện (Head & Helmet)
    this.drawHeroHead(ctx, helmet, userClass);

    // 5. Vẽ Tay & Vũ Khí (Weapon & Gauntlets)
    this.drawHeroWeapon(ctx, weapon, gloves, userClass, isAttacking);
  },

  drawHeroAura: function(ctx, weapon, armor, helmet) {
    const isLegendary = (weapon?.tier === 'legendary' || armor?.tier === 'legendary' || helmet?.tier === 'legendary');
    const particleType = weapon?.visual?.particle || armor?.visual?.particle || (isLegendary ? 'holy' : null);
    if (!particleType) return;

    ctx.save();
    const t = this.hero.animTimer;
    if (particleType === 'holy' || particleType === 'lightning') {
      // Vòng tròn ánh sáng / sét vàng xoay quanh
      ctx.strokeStyle = particleType === 'holy' ? 'rgba(250, 204, 21, 0.45)' : 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 10, 28 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Đốm sáng bay lên
      for (let i = 0; i < 3; i++) {
        const py = ((t * 40 + i * 25) % 65) - 35;
        const px = Math.sin(t * 2 + i) * 18;
        ctx.fillStyle = particleType === 'holy' ? '#FEF08A' : '#7DD3FC';
        ctx.fillRect(px, -py, 3, 3);
      }
    } else if (particleType === 'fire') {
      // Đốm lửa đỏ bay quanh
      for (let i = 0; i < 4; i++) {
        const py = ((t * 45 + i * 20) % 60) - 30;
        const px = Math.sin(t * 3 + i * 1.5) * 16;
        ctx.fillStyle = i % 2 === 0 ? '#EF4444' : '#F59E0B';
        ctx.fillRect(px, -py, 3, 3);
      }
    } else if (particleType === 'shadow') {
      // Khói tím hắc ám xoay dưới chân
      ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 20, 24 + Math.sin(t * 2) * 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (particleType === 'ice') {
      // Tinh thể tuyết lam xoay
      for (let i = 0; i < 3; i++) {
        const angle = t * 2 + (i * Math.PI * 2) / 3;
        const px = Math.cos(angle) * 22;
        const py = Math.sin(angle) * 12 + 10;
        ctx.fillStyle = '#BAE6FD';
        ctx.fillRect(px, py, 4, 4);
      }
    }
    ctx.restore();
  },

  drawHeroBoots: function(ctx, boots, userClass) {
    const bootColor = boots?.visual?.bootColor || (userClass === 'warrior' ? '#475569' : userClass === 'mage' ? '#1E3A8A' : userClass === 'ranger' ? '#854D0E' : '#334155');
    
    // Chân trái & Chân phải
    ctx.fillStyle = bootColor;
    ctx.fillRect(-10, 14, 8, 18);
    ctx.fillRect(2, 14, 8, 18);

    // Đế giày màu đậm hơn
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-11, 29, 9, 3);
    ctx.fillRect(2, 29, 9, 3);

    // Nếu là ủng có cánh Hermes
    if (boots?.id === 'bt_mercury_winged') {
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.moveTo(-12, 18);
      ctx.lineTo(-18, 14);
      ctx.lineTo(-12, 22);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, 18);
      ctx.lineTo(16, 14);
      ctx.lineTo(10, 22);
      ctx.closePath();
      ctx.fill();
    }
  },

  drawHeroArmor: function(ctx, armor, userClass) {
    const armorColor = armor?.visual?.armorColor || (userClass === 'warrior' ? '#CBD5E1' : userClass === 'mage' ? '#7C3AED' : userClass === 'ranger' ? '#15803D' : '#0F172A');
    const shoulderColor = armor?.visual?.shoulderColor || (userClass === 'warrior' ? '#94A3B8' : userClass === 'mage' ? '#5B21B6' : userClass === 'ranger' ? '#166534' : '#1E293B');
    const capeColor = armor?.visual?.capeColor || (userClass === 'mage' ? '#9333EA' : userClass === 'assassin' ? '#DC2626' : null);

    // 1. Áo choàng bay phía sau (nếu có)
    if (capeColor) {
      const wave = Math.sin(this.hero.animTimer * 3) * 3;
      ctx.fillStyle = capeColor;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-20 + wave, 28);
      ctx.lineTo(-6, 26);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Thân áo giáp / Áo choàng
    if (userClass === 'mage') {
      // Kiểu áo thụng pháp sư
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-15, 30);
      ctx.lineTo(15, 30);
      ctx.closePath();
      ctx.fill();
      // Đai lưng ma pháp
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-10, 8, 20, 4);
    } else {
      // Giáp ngực chuẩn
      ctx.fillStyle = armorColor;
      ctx.fillRect(-12, -12, 24, 26);

      // Chi tiết giáp ngực (viền nổi)
      ctx.fillStyle = shoulderColor;
      ctx.fillRect(-8, -8, 16, 6);
      ctx.fillRect(-10, 10, 20, 4); // Thắt lưng

      // Giáp vai (Shoulderpads)
      ctx.fillStyle = shoulderColor;
      ctx.fillRect(-15, -12, 5, 8);
      ctx.fillRect(10, -12, 5, 8);
    }
  },

  drawHeroHead: function(ctx, helmet, userClass) {
    const helmType = helmet?.visual?.helmType || (userClass === 'warrior' ? 'knight_helm' : userClass === 'mage' ? 'wizard_hat' : userClass === 'ranger' ? 'hunter_beret' : 'shadow_mask');
    const helmColor = helmet?.visual?.helmColor || (userClass === 'warrior' ? '#94A3B8' : userClass === 'mage' ? '#4338CA' : userClass === 'ranger' ? '#166534' : '#0F172A');
    const crestColor = helmet?.visual?.crestColor || (userClass === 'warrior' ? '#F59E0B' : userClass === 'mage' ? '#FBBF24' : '#EF4444');

    // 1. Khuôn mặt cơ bản
    ctx.fillStyle = '#FED7AA';
    ctx.fillRect(-9, -24, 18, 14);

    // Mắt
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, -18, 3, 3);
    ctx.fillRect(3, -18, 3, 3);

    // 2. Vẽ loại Mũ / Nón theo trang bị
    if (helmType === 'knight_helm') {
      // Mũ giáp sắt hiệp sĩ
      ctx.fillStyle = helmColor;
      ctx.fillRect(-11, -34, 22, 22);
      // Mào lông / Cánh mào
      ctx.fillStyle = crestColor;
      ctx.fillRect(-3, -42, 6, 9);
      // Khe nhìn mắt
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-7, -24, 14, 4);
      ctx.fillStyle = '#38BDF8'; // Ánh mắt le lói
      ctx.fillRect(-4, -23, 2, 2);
      ctx.fillRect(2, -23, 2, 2);
    } else if (helmType === 'wizard_hat') {
      // Nón chóp phù thủy
      ctx.fillStyle = helmColor;
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(-16, -18);
      ctx.lineTo(16, -18);
      ctx.closePath();
      ctx.fill();
      // Vành nón
      ctx.fillStyle = crestColor;
      ctx.fillRect(-18, -18, 36, 4);
      // Ngôi sao vàng trên nón
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-2, -32, 4, 4);
    } else if (helmType === 'crown') {
      // Vương miện hoàng gia lộng lẫy
      ctx.fillStyle = helmColor;
      ctx.beginPath();
      ctx.moveTo(-10, -26);
      ctx.lineTo(-10, -36);
      ctx.lineTo(-5, -30);
      ctx.lineTo(0, -38);
      ctx.lineTo(5, -30);
      ctx.lineTo(10, -36);
      ctx.lineTo(10, -26);
      ctx.closePath();
      ctx.fill();
      // Ngọc đính
      ctx.fillStyle = crestColor;
      ctx.fillRect(-2, -32, 4, 4);
    } else if (helmType === 'hood' || helmType === 'shadow_mask') {
      // Mũ trùm ninja / sát thủ che mặt
      ctx.fillStyle = helmColor;
      ctx.fillRect(-10, -32, 20, 20);
      // Khăn che mũi miệng
      ctx.fillStyle = crestColor;
      ctx.fillRect(-9, -15, 18, 6);
    } else {
      // Băng đô / Mũ da / Mũ nồi thợ săn
      ctx.fillStyle = helmColor;
      ctx.fillRect(-10, -30, 20, 8);
      if (crestColor) {
        ctx.fillStyle = crestColor;
        ctx.fillRect(-14, -38, 5, 12); // Lông vũ cắm bên mũ
      }
    }
  },

  drawHeroWeapon: function(ctx, weapon, gloves, userClass, isAttacking) {
    const weaponType = weapon?.visual?.weaponType || (userClass === 'mage' ? 'staff' : userClass === 'ranger' ? 'bow' : userClass === 'assassin' ? 'dagger' : 'sword');
    const bladeColor = weapon?.visual?.bladeColor || (weaponType === 'staff' ? '#0284C7' : weaponType === 'bow' ? '#92400E' : '#F8FAFC');
    const glowColor = weapon?.visual?.glowColor || null;
    const bladeLength = weapon?.visual?.bladeLength || 30;
    const gloveColor = gloves?.visual?.gloveColor || '#F59E0B';

    ctx.save();

    if (weaponType === 'sword') {
      // ==================== VẼ KIẾM CHIẾN BINH ====================
      if (isAttacking) {
        ctx.translate(14, -8);
        ctx.rotate(Math.PI / 4); // Chém gập xuống
      }
      // Hào quang vũ khí nếu có
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
      }
      // Lưỡi kiếm
      ctx.fillStyle = bladeColor;
      ctx.fillRect(14, -bladeLength, 5, bladeLength);
      // Chuôi kiếm & Khớp tay cầm
      ctx.fillStyle = gloveColor;
      ctx.fillRect(10, 0, 13, 5); // Thanh chắn
      ctx.fillStyle = '#78350F';
      ctx.fillRect(14, 5, 5, 7);  // Cán kiếm

    } else if (weaponType === 'staff') {
      // ==================== VẼ GẬY PHÁP SƯ ====================
      ctx.fillStyle = '#78350F';
      ctx.fillRect(15, -22, 5, bladeLength + 15);
      // Viên ngọc ma thuật đỉnh gậy
      const orbSize = isAttacking ? 12 : 8;
      if (glowColor || bladeColor) {
        ctx.shadowColor = glowColor || bladeColor;
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = bladeColor;
      ctx.beginPath();
      ctx.arc(17.5, -26, orbSize, 0, Math.PI * 2);
      ctx.fill();

    } else if (weaponType === 'bow') {
      // ==================== VẼ CUNG XẠ THỦ ====================
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
      }
      ctx.strokeStyle = bladeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(18, 2, 18, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Dây cung
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, -16);
      ctx.lineTo(18, 20);
      ctx.stroke();

      // Nếu đang giương cung bắn: hiện mũi tên ánh sáng
      if (isAttacking) {
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(6, 1, 24, 2);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(28, 0, 4, 4);
      }

    } else if (weaponType === 'dagger') {
      // ==================== VẼ SONG ĐAO SÁT THỦ ====================
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
      }
      // Dao tay phải
      ctx.fillStyle = bladeColor;
      ctx.fillRect(14, -6, bladeLength - 4, 4);
      ctx.fillStyle = gloveColor;
      ctx.fillRect(11, -7, 3, 6);

      // Dao tay trái
      ctx.fillStyle = bladeColor;
      ctx.fillRect(-24, 6, bladeLength - 6, 4);
      ctx.fillStyle = gloveColor;
      ctx.fillRect(-13, 5, 3, 6);
    }

    ctx.restore();

    // Khiên phụ bên tay trái (chỉ hiển thị với Kiếm Sĩ)
    if (userClass === 'warrior' && weaponType === 'sword') {
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(-22, -6, 10, 22);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-19, 2, 4, 6);
    }
  },

  drawHeroBars: function(ctx, x, y) {
    const h = this.hero;
    const hpPct = Math.max(0, Math.min(1, h.hp / h.maxHp));
    const ghostPct = Math.max(0, Math.min(1, h.ghostHp / h.maxHp));
    const mpPct = Math.max(0, Math.min(1, h.mp / h.maxMp));

    // Nền thanh máu
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 42, y, 84, 9);

    // Vạch trễ Ghost Bar (màu vàng trắng tụt từ từ phía sau)
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(x - 40, y + 1, 80 * ghostPct, 7);

    // Vạch máu thật (màu đỏ)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x - 40, y + 1, 80 * hpPct, 7);

    // Thanh MP xanh
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 42, y + 10, 84, 5);
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(x - 40, y + 11, 80 * mpPct, 3);

    // Chữ chỉ số HP
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`${h.hp}/${h.maxHp} HP`, x, y - 4);
  },

  // ==================== VẼ QUÁI VẬT & HIỆU ỨNG NỔ TUNG KHI CHẾT ====================
  drawMonster: function(ctx) {
    const m = this.monster;
    const floatBob = (m.state === 'idle') ? Math.sin(m.animTimer) * 4 : 0;
    const x = m.x + m.lungeX;
    const y = m.baseY + floatBob;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(m.scale, m.scale);

    // Bóng đổ quái vật
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    const shadowR = m.isBoss ? 48 : 28;
    ctx.ellipse(0, m.isBoss ? 50 : 32, shadowR, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.flashWhite > 0) {
      ctx.filter = 'brightness(3) contrast(1.5)';
    }

    const arch = m.archetype || m.type;

    if (arch === 'fashion_queen') {
      this.drawFashionQueenBoss(ctx, m.color);
    } else if (arch === 'barista_dragon') {
      this.drawBaristaDragonBoss(ctx, m.color);
    } else if (arch === 'hotpot_behemoth') {
      this.drawHotpotBehemothBoss(ctx, m.color);
    } else if (arch === 'anatomical_titan') {
      this.drawAnatomicalTitanBoss(ctx, m.color);
    } else if (arch === 'plague_titan') {
      this.drawPlagueTitanBoss(ctx, m.color);
    } else if (arch === 'living_wardrobe') {
      this.drawLivingWardrobeBoss(ctx, m.color);
    } else if (arch === 'cyber_overlord') {
      this.drawCyberOverlordBoss(ctx, m.color);
    } else if (arch === 'quantum_agi_god') {
      this.drawQuantumAgiGodBoss(ctx, m.color);
    } else if (arch === 'abyssal_kraken') {
      this.drawAbyssalKrakenBoss(ctx, m.color);
    } else if (arch === 'cosmic_destroyer') {
      this.drawCosmicDestroyerBoss(ctx, m.color);
    } else if (arch === 'midas_gold_dragon') {
      this.drawMidasGoldDragonBoss(ctx, m.color);
    } else if (arch === 'omni_carrier_titan') {
      this.drawOmniCarrierTitanBoss(ctx, m.color);
    } else if (arch === 'ancient_dryad') {
      this.drawAncientDryadBoss(ctx, m.color);
    } else if (arch === 'ancient_golem') {
      if (m.isBoss) this.drawAncientGolemBoss(ctx, m.color);
      else this.drawGolemSprite(ctx);
    } else if (arch === 'apex_beast_king') {
      this.drawApexBeastKingBoss(ctx, m.color);
    } else if (arch === 'avalanche_behemoth') {
      this.drawAvalancheBehemothBoss(ctx, m.color);
    } else if (arch === 'broadcast_overlord') {
      this.drawBroadcastOverlordBoss(ctx, m.color);
    } else if (arch === 'calamity_dragon') {
      this.drawCalamityDragonBoss(ctx, m.color);
    } else if (arch === 'cathedral_archon') {
      this.drawCathedralArchonBoss(ctx, m.color);
    } else if (arch === 'chaos_jester') {
      this.drawChaosJesterBoss(ctx, m.color);
    } else if (arch === 'ego_shadow') {
      this.drawEgoShadowBoss(ctx, m.color);
    } else if (arch === 'foundry_juggernaut') {
      this.drawFoundryJuggernautBoss(ctx, m.color);
    } else if (arch === 'geode_colossus') {
      this.drawGeodeColossusBoss(ctx, m.color);
    } else if (arch === 'gladiator_champion') {
      this.drawGladiatorChampionBoss(ctx, m.color);
    } else if (arch === 'iron_judge') {
      this.drawIronJudgeBoss(ctx, m.color);
    } else if (arch === 'mutagen_horror') {
      this.drawMutagenHorrorBoss(ctx, m.color);
    } else if (arch === 'patriarch_phantom') {
      this.drawPatriarchPhantomBoss(ctx, m.color);
    } else if (arch === 'scholar_lich') {
      this.drawScholarLichBoss(ctx, m.color);
    } else if (arch === 'skyline_zephyr_behemoth') {
      this.drawSkylineZephyrBehemothBoss(ctx, m.color);
    } else if (arch === 'turbo_highway_wyrm') {
      this.drawTurboHighwayWyrmBoss(ctx, m.color);
    } else if (arch === 'virtuoso_maestro') {
      this.drawVirtuosoMaestroBoss(ctx, m.color);
    } else if (m.isBoss) {
      this.drawDragonBoss(ctx);
    } else if (m.type === 'golem') {
      this.drawGolemSprite(ctx);
    } else if (m.type === 'skeleton') {
      this.drawSkeletonSprite(ctx);
    } else if (m.type === 'bat') {
      this.drawBatSprite(ctx);
    } else if (m.type === 'thread_wisp' || m.type === 'neural_wisp' || m.type === 'rage_wisp') {
      this.drawWispSprite(ctx, m.color);
    } else if (m.type === 'button_beetle' || m.type === 'chili_fiend' || m.type === 'bean_imp') {
      this.drawBeetleImpSprite(ctx, m.color);
    } else {
      this.drawThematicMinionSprite(ctx, m);
    }

    ctx.restore();

    // Thanh máu quái vật
    this.drawMonsterBar(ctx, x, y - (m.isBoss ? 80 : 60));
  },

  drawSlimeSprite: function(ctx, color) {
    ctx.fillStyle = color || '#22C55E';
    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mắt tròn xoe
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, 6, 6, 0, Math.PI * 2);
    ctx.arc(8, 6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-7, 6, 3, 0, Math.PI * 2);
    ctx.arc(7, 6, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBatSprite: function(ctx) {
    ctx.fillStyle = '#6B21A8';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    const wingAngle = Math.sin(this.monster.animTimer * 2.5) * 14;
    ctx.fillStyle = '#4C1D95';
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(-36, -20 + wingAngle);
    ctx.lineTo(-26, 14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(36, -20 + wingAngle);
    ctx.lineTo(26, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-6, -4, 4, 4);
    ctx.fillRect(2, -4, 4, 4);
  },

  drawSkeletonSprite: function(ctx) {
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-12, -28, 24, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-7, -20, 5, 6);
    ctx.fillRect(2, -20, 5, 6);
    ctx.fillRect(-4, -12, 8, 4);

    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-10, -8, 20, 22);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-8, -4, 16, 3);
    ctx.fillRect(-8, 4, 16, 3);

    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-8, 14, 5, 18);
    ctx.fillRect(3, 14, 5, 18);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-22, -14, 5, 30);
  },

  drawGolemSprite: function(ctx) {
    ctx.fillStyle = '#78716C';
    ctx.fillRect(-26, -18, 52, 48);
    ctx.fillStyle = '#44403C';
    ctx.fillRect(-18, 30, 14, 16);
    ctx.fillRect(4, 30, 14, 16);

    ctx.fillStyle = '#A8A29E';
    ctx.fillRect(-16, -38, 32, 20);

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-10, -30, 6, 5);
    ctx.fillRect(4, -30, 6, 5);
  },

  drawDragonBoss: function(ctx) {
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.ellipse(0, 4, 44, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    const wingFlap = Math.sin(this.monster.animTimer * 1.5) * 10;
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.moveTo(-18, -14);
    ctx.lineTo(-68, -56 + wingFlap);
    ctx.lineTo(-50, 14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, -14);
    ctx.lineTo(68, -56 + wingFlap);
    ctx.lineTo(50, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(-22, -48, 44, 34);
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(-30, -70, 8, 26);
    ctx.fillRect(22, -70, 8, 26);

    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-14, -38, 8, 5);
    ctx.fillRect(6, -38, 8, 5);

    // Lửa bập bùng ở miệng rồng
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(-26, -24, 7 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
  },

  // ==================== BỘ RENDERER QUÁI & BOSS THEMATIC 100 CHỦ ĐỀ ====================
  drawFashionQueenBoss: function(ctx, color) {
    // Váy dạ hội lộng lẫy màu đỏ mận / hồng cánh sen
    ctx.fillStyle = color || '#F43F5E';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-38, 42);
    ctx.lineTo(38, 42);
    ctx.closePath();
    ctx.fill();

    // Thắt lưng hoàng kim
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-18, -6, 36, 6);

    // Gương mặt thanh tú & vương miện lấp lánh
    ctx.fillStyle = '#FFF1F2';
    ctx.beginPath(); ctx.arc(0, -42, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E11D48'; // Môi son đỏ
    ctx.fillRect(-3, -35, 6, 3);
    ctx.fillStyle = '#111'; // Mắt sắc sảo
    ctx.fillRect(-6, -44, 3, 4); ctx.fillRect(3, -44, 3, 4);

    // Vương miện hoàng gia
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(-14, -54); ctx.lineTo(-14, -66); ctx.lineTo(-7, -58);
    ctx.lineTo(0, -70); ctx.lineTo(7, -58); ctx.lineTo(14, -66); ctx.lineTo(14, -54);
    ctx.closePath(); ctx.fill();

    // Quyền trượng kim khâu dài & dải ruy băng lụa xoắn quanh
    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(26, -65); ctx.lineTo(26, 40); ctx.stroke();
    ctx.fillStyle = '#E11D48';
    ctx.beginPath(); ctx.arc(26, -65, 6, 0, Math.PI * 2); ctx.fill();
  },

  drawBaristaDragonBoss: function(ctx, color) {
    // Rồng cà phê rang đậm (Dark Roast)
    ctx.fillStyle = '#451A03';
    ctx.beginPath(); ctx.ellipse(0, 4, 46, 34, 0, 0, Math.PI * 2); ctx.fill();

    // Sừng hạt cà phê xoắn cong
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(-16, -20); ctx.quadraticCurveTo(-45, -55, -25, -65); ctx.lineTo(-10, -30);
    ctx.moveTo(16, -20); ctx.quadraticCurveTo(45, -55, 25, -65); ctx.lineTo(10, -30);
    ctx.fill();

    // Hơi cà phê bốc khói ngun ngút từ mũi
    ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
    const steamY = Math.sin(this.monster.animTimer * 3) * 6;
    ctx.beginPath();
    ctx.arc(-26, -24 + steamY, 8, 0, Math.PI * 2);
    ctx.arc(-34, -36 + steamY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Mắt cà phê hổ phách
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-12, -32, 6, 5); ctx.fillRect(6, -32, 6, 5);
  },

  drawHotpotBehemothBoss: function(ctx, color) {
    // Nồi lẩu đồng khổng lồ
    ctx.fillStyle = '#9A3412';
    ctx.beginPath(); ctx.arc(0, 10, 44, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-48, 6, 96, 6);

    // Nước lẩu ớt đỏ sủi bọt cuồn cuộn
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-40, 2, 80, 8);
    // Bọt ớt sôi
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(-20, 2, 5 + Math.random() * 3, 0, Math.PI * 2);
    ctx.arc(15, 2, 6 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();

    // Mắt nham thạch & sừng ớt hiểm
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-16, -14, 8, 7); ctx.fillRect(8, -14, 8, 7);
    ctx.fillStyle = '#EF4444'; // Sừng ớt nhọn
    ctx.beginPath(); ctx.moveTo(-28, -8); ctx.lineTo(-40, -42); ctx.lineTo(-18, -15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(28, -8); ctx.lineTo(40, -42); ctx.lineTo(18, -15); ctx.fill();
  },

  drawAnatomicalTitanBoss: function(ctx, color) {
    // Khung xương Titan ngà voi cổ đại
    ctx.fillStyle = '#F1F5F9';
    // Hộp sọ khổng lồ
    ctx.fillRect(-20, -56, 40, 30);
    // Hốc mắt đen sâu hoắm
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-14, -46, 10, 11); ctx.fillRect(4, -46, 10, 11);
    ctx.fillStyle = '#EF4444'; // Đồng tử đỏ rực
    ctx.fillRect(-10, -42, 4, 5); ctx.fillRect(8, -42, 4, 5);

    // Khung xương sườn xếp lớp
    ctx.fillStyle = '#CBD5E1';
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(-32 + r * 2, -22 + r * 11, 64 - r * 4, 5);
    }
    // Trái tim ma pháp đỏ phát sáng bên trong lồng ngực
    ctx.fillStyle = '#DC2626';
    const beat = 1 + Math.sin(this.monster.animTimer * 4) * 0.2;
    ctx.beginPath(); ctx.arc(0, -6, 10 * beat, 0, Math.PI * 2); ctx.fill();
  },

  drawPlagueTitanBoss: function(ctx, color) {
    // Thân khí độc xanh lục bay lượn
    ctx.fillStyle = color || '#10B981';
    ctx.beginPath(); ctx.ellipse(0, 12, 38, 28, 0, 0, Math.PI * 2); ctx.fill();

    // Mặt nạ bác sĩ dịch hạch mỏ quạ (Plague Doctor Mask)
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-18, -36, 36, 26);
    // Chiếc mỏ quạ nhọn dài hướng sang trái
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(-16, -26); ctx.lineTo(-54, -14); ctx.lineTo(-16, -18);
    ctx.closePath(); ctx.fill();

    // Mắt kính bảo hộ đỏ tròn
    ctx.fillStyle = '#EF4444';
    ctx.beginPath(); ctx.arc(-4, -28, 6, 0, Math.PI * 2); ctx.fill();

    // Ống nghiệm hóa chất sau lưng
    ctx.fillStyle = '#34D399';
    ctx.fillRect(18, -35, 8, 30);
  },

  drawLivingWardrobeBoss: function(ctx, color) {
    // Tủ gỗ khổng lồ há miệng Mimic
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-34, -48, 68, 86);
    ctx.strokeStyle = '#451A03'; ctx.lineWidth = 3;
    ctx.strokeRect(-34, -48, 68, 86);

    // Cửa tủ mở toác để lộ miệng đầy răng nhọn
    ctx.fillStyle = '#18072B';
    ctx.fillRect(-22, -32, 44, 54);
    // Hàng răng nanh sắc lẹm
    ctx.fillStyle = '#F8FAFC';
    for (let t = 0; t < 6; t++) {
      ctx.beginPath(); ctx.moveTo(-22 + t * 7, -32); ctx.lineTo(-18 + t * 7, -22); ctx.lineTo(-15 + t * 7, -32); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-22 + t * 7, 22); ctx.lineTo(-18 + t * 7, 12); ctx.lineTo(-15 + t * 7, 22); ctx.fill();
    }
    // Mắt ác quỷ vàng trên đỉnh tủ
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath(); ctx.arc(0, -40, 7, 0, Math.PI * 2); ctx.fill();
  },

  drawCyberOverlordBoss: function(ctx, color) {
    // Đầu máy tính đa giác 8-bit lơ lửng
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-28, -38, 56, 52);
    ctx.strokeStyle = color || '#38BDF8'; ctx.lineWidth = 3;
    ctx.strokeRect(-28, -38, 56, 52);

    // Mắt kính Visor neon quét laser
    ctx.fillStyle = color || '#06B6D4';
    const laserX = Math.sin(this.monster.animTimer * 3) * 16;
    ctx.fillRect(-22, -26, 44, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-6 + laserX, -26, 12, 10);

    // Vành đai chip bán dẫn xoay quanh đầu
    ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -12, 48, 14, Math.sin(this.monster.animTimer) * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  },

  drawAbyssalKrakenBoss: function(ctx, color) {
    // Đầu quái vật bạch tuộc đại dương
    ctx.fillStyle = color || '#0891B2';
    ctx.beginPath(); ctx.ellipse(0, -20, 36, 40, 0, 0, Math.PI * 2); ctx.fill();

    // Mắt vàng đại dương phát sáng
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(-14, -18, 9, 0, Math.PI * 2); ctx.arc(14, -18, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-15, -20, 3, 6); ctx.fillRect(13, -20, 3, 6);

    // 6 xúc tu ngọ nguậy uốn lượn bên dưới
    ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) {
      const tentX = -30 + i * 12;
      const wave = Math.sin(this.monster.animTimer * 2 + i) * 12;
      ctx.beginPath();
      ctx.moveTo(tentX, 10);
      ctx.quadraticCurveTo(tentX + wave, 35, tentX + wave * 1.5, 55);
      ctx.stroke();
    }
  },

  drawCosmicDestroyerBoss: function(ctx, color) {
    // Quả cầu Hư Không Vũ Trụ (Black Hole Singularity)
    ctx.fillStyle = '#05030A';
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color || '#8B5CF6'; ctx.lineWidth = 4;
    ctx.stroke();

    // Vành đai bồi tụ thiên thạch phát sáng xoay tròn
    ctx.strokeStyle = '#C4B5FD'; ctx.lineWidth = 3;
    ctx.save();
    ctx.rotate(this.monster.animTimer * 0.6);
    ctx.beginPath(); ctx.ellipse(0, 0, 58, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // Mắt thần trung tâm phát sáng tím rực
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  },

  drawMidasGoldDragonBoss: function(ctx, color) {
    // Rồng Vàng Midas dát vàng nguyên khối 24K
    ctx.fillStyle = '#EAB308';
    ctx.beginPath(); ctx.ellipse(0, 4, 46, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FEF08A'; ctx.lineWidth = 2; ctx.stroke();

    // Cánh dát vàng lấp lánh
    const wingFlap = Math.sin(this.monster.animTimer * 2) * 12;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(-18, -14); ctx.lineTo(-65, -50 + wingFlap); ctx.lineTo(-46, 16); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, -14); ctx.lineTo(65, -50 + wingFlap); ctx.lineTo(46, 16); ctx.fill();

    // Mắt kim cương xanh lam
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-14, -36, 7, 6); ctx.fillRect(7, -36, 7, 6);
  },

  drawOmniCarrierTitanBoss: function(ctx, color) {
    // Rồng Siêu Trọng Container Cơ Giới
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-40, -28, 80, 56);
    // Các thùng container đỏ, xanh, vàng gắn trên mình
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-35, -24, 22, 18);
    ctx.fillStyle = '#2563EB'; ctx.fillRect(-10, -24, 22, 18);
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(15, -24, 22, 18);

    // Đầu cơ giới với mắt đèn pha xenon kép
    ctx.fillStyle = '#334155'; ctx.fillRect(-22, -52, 44, 26);
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(-10, -40, 6, 0, Math.PI * 2); ctx.arc(10, -40, 6, 0, Math.PI * 2); ctx.fill();
  },

  drawAncientDryadBoss: function(ctx, color) {
    ctx.fillStyle = color || '#15803D';
    ctx.beginPath();
    ctx.moveTo(-20, 42); ctx.lineTo(-14, -20); ctx.lineTo(14, -20); ctx.lineTo(20, 42);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#3E2723';
    ctx.fillRect(-12, -18, 24, 56);
    ctx.fillStyle = '#2E1C0C';
    ctx.fillRect(-8, -10, 5, 40); ctx.fillRect(4, -5, 5, 36);

    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -20); ctx.lineTo(-28, -50); ctx.lineTo(-42, -58);
    ctx.moveTo(-28, -50); ctx.lineTo(-22, -66);
    ctx.moveTo(10, -20); ctx.lineTo(28, -50); ctx.lineTo(42, -58);
    ctx.moveTo(28, -50); ctx.lineTo(22, -66);
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(-34, -54, 9, 0, Math.PI * 2);
    ctx.arc(34, -54, 9, 0, Math.PI * 2);
    ctx.arc(0, -36, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    const pulse = 1 + Math.sin(this.monster.animTimer * 3) * 0.25;
    ctx.beginPath(); ctx.arc(0, 5, 8 * pulse, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#A7F3D0';
    ctx.fillRect(-7, -26, 4, 4); ctx.fillRect(3, -26, 4, 4);
  },

  drawAncientGolemBoss: function(ctx, color) {
    ctx.fillStyle = color || '#78716C';
    ctx.fillRect(-38, -32, 76, 68);
    ctx.strokeStyle = '#44403C'; ctx.lineWidth = 4;
    ctx.strokeRect(-38, -32, 76, 68);

    ctx.fillStyle = '#A8A29E';
    ctx.fillRect(-48, -42, 24, 20);
    ctx.fillRect(24, -42, 24, 20);

    ctx.fillStyle = '#57534E';
    ctx.fillRect(-20, -56, 40, 26);

    ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, -14); ctx.lineTo(-10, 0); ctx.lineTo(-24, 14);
    ctx.moveTo(24, -14); ctx.lineTo(10, 0); ctx.lineTo(24, 14);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-8, -48, 16, 6);
  },

  drawApexBeastKingBoss: function(ctx, color) {
    ctx.fillStyle = '#D97706';
    ctx.beginPath(); ctx.arc(0, -18, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.arc(0, -18, 32, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = color || '#B45309';
    ctx.beginPath(); ctx.ellipse(0, 16, 36, 26, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#92400E';
    ctx.fillRect(-18, -28, 36, 26);
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(-12, -12, 24, 14);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-10, -6); ctx.lineTo(-14, 14); ctx.lineTo(-6, -6);
    ctx.moveTo(10, -6); ctx.lineTo(14, 14); ctx.lineTo(6, -6);
    ctx.fill();

    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-14, -22, 6, 6); ctx.fillRect(8, -22, 6, 6);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-12, -20, 3, 3); ctx.fillRect(10, -20, 3, 3);
  },

  drawAvalancheBehemothBoss: function(ctx, color) {
    ctx.fillStyle = color || '#0284C7';
    ctx.beginPath(); ctx.ellipse(0, 10, 42, 34, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(-34, -26, 68, 36);

    ctx.fillStyle = '#BAE6FD';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-42 + i * 8, -26); ctx.lineTo(-38 + i * 8, -52); ctx.lineTo(-34 + i * 8, -26);
      ctx.moveTo(22 + i * 8, -26); ctx.lineTo(26 + i * 8, -52); ctx.lineTo(30 + i * 8, -26);
      ctx.fill();
    }

    ctx.fillStyle = '#0369A1';
    ctx.fillRect(-18, -48, 36, 26);
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-6, -38, 5, 0, Math.PI * 2);
    ctx.arc(6, -38, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const snowWave = Math.sin(this.monster.animTimer * 3) * 10;
    ctx.fillRect(-28 + snowWave, -10, 4, 4);
    ctx.fillRect(20 - snowWave, 16, 3, 3);
  },

  drawBroadcastOverlordBoss: function(ctx, color) {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-36, -38, 72, 54);
    ctx.strokeStyle = color || '#EF4444'; ctx.lineWidth = 4;
    ctx.strokeRect(-36, -38, 72, 54);

    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(-30, -32, 60, 42);

    ctx.fillStyle = '#22C55E';
    for (let bar = 0; bar < 7; bar++) {
      const h = 8 + Math.abs(Math.sin(this.monster.animTimer * 4 + bar) * 22);
      ctx.fillRect(-26 + bar * 8, 4 - h, 5, h);
    }

    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -38); ctx.lineTo(0, -70);
    ctx.moveTo(-16, -56); ctx.lineTo(16, -56);
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    const blink = (Math.sin(this.monster.animTimer * 5) > 0);
    if (blink) {
      ctx.beginPath(); ctx.arc(0, -72, 6, 0, Math.PI * 2); ctx.fill();
    }
  },

  drawCalamityDragonBoss: function(ctx, color) {
    ctx.fillStyle = color || '#7F1D1D';
    ctx.beginPath(); ctx.ellipse(0, 4, 46, 34, 0, 0, Math.PI * 2); ctx.fill();

    const wingFlap = Math.sin(this.monster.animTimer * 1.8) * 12;
    ctx.fillStyle = '#450A0A';
    ctx.beginPath();
    ctx.moveTo(-18, -14); ctx.lineTo(-72, -60 + wingFlap); ctx.lineTo(-52, 16); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, -14); ctx.lineTo(72, -60 + wingFlap); ctx.lineTo(52, 16); ctx.fill();

    ctx.fillStyle = '#991B1B';
    ctx.fillRect(-24, -46, 48, 36);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(-10, -2, 20, 4);

    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.moveTo(-18, -44); ctx.lineTo(-34, -74); ctx.lineTo(-10, -48);
    ctx.moveTo(18, -44); ctx.lineTo(34, -74); ctx.lineTo(10, -48);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-16, -36, 8, 6); ctx.fillRect(8, -36, 8, 6);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-14, -34, 4, 4); ctx.fillRect(10, -34, 4, 4);
  },

  drawCathedralArchonBoss: function(ctx, color) {
    ctx.fillStyle = '#FEF08A';
    const wingWave = Math.sin(this.monster.animTimer * 1.5) * 8;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.moveTo(-16, -10 + w * 12); ctx.lineTo(-64, -40 + w * 18 + wingWave); ctx.lineTo(-30, 20 + w * 10);
      ctx.moveTo(16, -10 + w * 12); ctx.lineTo(64, -40 + w * 18 + wingWave); ctx.lineTo(30, 20 + w * 10);
      ctx.fill();
    }

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.ellipse(0, 10, 26, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-14, -18, 28, 36);

    ctx.fillStyle = '#38BDF8'; ctx.fillRect(-8, -8, 7, 10);
    ctx.fillStyle = '#F43F5E'; ctx.fillRect(1, -8, 7, 10);

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(0, -38, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, -56, 24, 7, 0, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-6, -40, 3, 5); ctx.fillRect(3, -40, 3, 5);
  },

  drawChaosJesterBoss: function(ctx, color) {
    ctx.fillStyle = color || '#7C3AED';
    ctx.fillRect(-22, -18, 22, 48);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(0, -18, 22, 48);

    ctx.fillStyle = '#F8FAFC';
    for (let c = 0; c < 5; c++) {
      ctx.beginPath();
      ctx.arc(-16 + c * 8, -18, 5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.arc(0, -36, 16, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -34, 10, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

    ctx.fillStyle = '#7C3AED';
    ctx.beginPath(); ctx.moveTo(-12, -48); ctx.quadraticCurveTo(-38, -60, -32, -40); ctx.lineTo(-4, -48); ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.moveTo(12, -48); ctx.quadraticCurveTo(38, -60, 32, -40); ctx.lineTo(4, -48); ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(-32, -40, 4, 0, Math.PI * 2); ctx.arc(32, -40, 4, 0, Math.PI * 2); ctx.fill();
  },

  drawEgoShadowBoss: function(ctx, color) {
    ctx.fillStyle = '#09090B';
    ctx.beginPath(); ctx.ellipse(0, 10, 32, 38, 0, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = color || '#A855F7'; ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#18181B';
    ctx.beginPath(); ctx.arc(0, -34, 18, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -48); ctx.lineTo(4, -36); ctx.lineTo(-5, -26); ctx.lineTo(2, -18);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-8, -36, 5, 5); ctx.fillRect(4, -36, 5, 5);

    ctx.fillStyle = '#7C3AED';
    const dropY = (this.monster.animTimer * 30) % 20;
    ctx.fillRect(-12, 40 + dropY, 3, 5);
    ctx.fillRect(10, 42 + dropY, 3, 5);
  },

  drawFoundryJuggernautBoss: function(ctx, color) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(-38, -28, 76, 68);
    ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 4;
    ctx.strokeRect(-38, -28, 76, 68);

    ctx.fillStyle = '#EA580C';
    ctx.fillRect(-20, 4, 40, 24);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-12, 10, 24, 12);

    ctx.fillStyle = '#475569';
    ctx.fillRect(-32, -54, 16, 26);
    ctx.fillRect(16, -54, 16, 26);

    ctx.fillStyle = '#F97316';
    const spark = Math.sin(this.monster.animTimer * 4) * 6;
    ctx.beginPath();
    ctx.arc(-24, -62 + spark, 6, 0, Math.PI * 2);
    ctx.arc(24, -62 - spark, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-16, -20, 8, 8); ctx.fillRect(8, -20, 8, 8);
  },

  drawGeodeColossusBoss: function(ctx, color) {
    ctx.fillStyle = '#44403C';
    ctx.beginPath(); ctx.ellipse(-16, 4, 28, 36, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, 4, 28, 36, 0.2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = color || '#A855F7';
    for (let c = 0; c < 6; c++) {
      ctx.beginPath();
      ctx.moveTo(-14 + c * 5, 20);
      ctx.lineTo(-12 + c * 5, -24 + (c % 2) * 8);
      ctx.lineTo(-9 + c * 5, 20);
      ctx.fill();
    }

    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.moveTo(-6, -20); ctx.lineTo(0, -48); ctx.lineTo(6, -20); ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-12, -10, 6, 6); ctx.fillRect(6, -10, 6, 6);
  },

  drawGladiatorChampionBoss: function(ctx, color) {
    ctx.fillStyle = color || '#B45309';
    ctx.fillRect(-22, -18, 44, 46);
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 3;
    ctx.strokeRect(-22, -18, 44, 46);

    ctx.fillStyle = '#D97706';
    ctx.beginPath(); ctx.arc(-34, 6, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.arc(-34, 6, 8, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(28, -26, 6, 48);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(24, 18, 14, 5);

    ctx.fillStyle = '#92400E';
    ctx.fillRect(-14, -48, 28, 30);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-4, -68, 8, 24);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-10, -36, 20, 6);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-6, -34, 4, 3); ctx.fillRect(2, -34, 4, 3);
  },

  drawIronJudgeBoss: function(ctx, color) {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-26, -20, 52, 60);
    ctx.strokeStyle = color || '#38BDF8'; ctx.lineWidth = 3;
    ctx.strokeRect(-26, -20, 52, 60);

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(-16, -42, 32, 10);

    ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-44, -14); ctx.lineTo(-24, -14);
    ctx.moveTo(-34, -24); ctx.lineTo(-34, -4);
    ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.arc(-44, -4, 6, 0, Math.PI); ctx.arc(-24, -4, 6, 0, Math.PI); ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.fillRect(32, -36, 16, 24);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(38, -12, 5, 34);
  },

  drawMutagenHorrorBoss: function(ctx, color) {
    ctx.fillStyle = color || '#16A34A';
    ctx.beginPath(); ctx.ellipse(0, 10, 42, 34, 0, 0, Math.PI * 2); ctx.fill();

    const eyes = [
      { x: -18, y: -8, r: 8 }, { x: 14, y: -14, r: 10 },
      { x: 0, y: 12, r: 7 }, { x: -22, y: 18, r: 6 }, { x: 24, y: 8, r: 7 }
    ];
    eyes.forEach(e => {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(e.x + 1, e.y, e.r * 0.45, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(-10, -38, 8, 22);
    ctx.fillRect(8, -34, 8, 18);
  },

  drawPatriarchPhantomBoss: function(ctx, color) {
    ctx.fillStyle = color || '#0F766E';
    ctx.beginPath();
    ctx.moveTo(-20, -20); ctx.lineTo(-30, 48); ctx.lineTo(30, 48); ctx.lineTo(20, -20);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#99F6E4';
    ctx.beginPath(); ctx.arc(0, -36, 14, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#115E59';
    ctx.fillRect(-18, -48, 36, 8);
    ctx.fillRect(-12, -62, 24, 16);

    ctx.strokeStyle = '#2DD4BF'; ctx.lineWidth = 2.5;
    ctx.strokeRect(-36, 4, 14, 20);
    ctx.fillStyle = '#5EEAD4';
    ctx.beginPath(); ctx.arc(-29, 14, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#042F2E';
    ctx.fillRect(-6, -38, 4, 5); ctx.fillRect(2, -38, 4, 5);
  },

  drawQuantumAgiGodBoss: function(ctx, color) {
    ctx.save();
    ctx.rotate(this.monster.animTimer * 0.5);
    ctx.strokeStyle = color || '#38BDF8'; ctx.lineWidth = 3;
    ctx.strokeRect(-24, -24, 48, 48);
    ctx.strokeStyle = '#818CF8';
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 46, 16, this.monster.animTimer * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#22D3EE'; ctx.lineWidth = 1.5;
    for (let l = 0; l < 4; l++) {
      const angle = (l * Math.PI / 2) + this.monster.animTimer;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 44, Math.sin(angle) * 44);
      ctx.stroke();
    }
  },

  drawScholarLichBoss: function(ctx, color) {
    ctx.fillStyle = color || '#312E81';
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-28, 48); ctx.lineTo(28, 48); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(-14, -46, 28, 22);

    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(-16, -46); ctx.lineTo(-24, -64); ctx.lineTo(-8, -48);
    ctx.moveTo(16, -46); ctx.lineTo(24, -64); ctx.lineTo(8, -48);
    ctx.fill();

    ctx.fillStyle = '#4338CA';
    ctx.fillRect(24, -14, 18, 26);
    ctx.fillStyle = '#A5B4FC';
    ctx.fillRect(26, -12, 14, 22);

    ctx.fillStyle = '#10B981';
    ctx.beginPath(); ctx.arc(-6, -38, 4, 0, Math.PI * 2); ctx.arc(6, -38, 4, 0, Math.PI * 2); ctx.fill();
  },

  drawSkylineZephyrBehemothBoss: function(ctx, color) {
    ctx.fillStyle = color || '#0284C7';
    ctx.beginPath(); ctx.ellipse(0, 6, 28, 38, 0, 0, Math.PI * 2); ctx.fill();

    const wingFlap = Math.sin(this.monster.animTimer * 2.5) * 14;
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(-14, -10); ctx.lineTo(-68, -48 + wingFlap); ctx.lineTo(-38, 24); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -10); ctx.lineTo(68, -48 + wingFlap); ctx.lineTo(38, 24); ctx.fill();

    ctx.fillStyle = '#0369A1';
    ctx.beginPath(); ctx.arc(0, -32, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(-28, -26); ctx.lineTo(-6, -22); ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(-2, -34, 4, 0, Math.PI * 2); ctx.fill();
  },

  drawTurboHighwayWyrmBoss: function(ctx, color) {
    ctx.fillStyle = color || '#1E293B';
    ctx.beginPath(); ctx.ellipse(0, 6, 44, 30, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-36, -14, 72, 10);
    ctx.fillRect(-30, 6, 60, 10);

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(-18, -8, 8, 0, Math.PI * 2); ctx.arc(18, -8, 8, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.fillRect(-44, -22, 10, 18); ctx.fillRect(34, -22, 10, 18);
    ctx.fillStyle = '#38BDF8';
    const flame = Math.sin(this.monster.animTimer * 5) * 6;
    ctx.beginPath();
    ctx.moveTo(-39, -22); ctx.lineTo(-44, -38 + flame); ctx.lineTo(-34, -22);
    ctx.moveTo(39, -22); ctx.lineTo(34, -38 + flame); ctx.lineTo(44, -22);
    ctx.fill();
  },

  drawVirtuosoMaestroBoss: function(ctx, color) {
    ctx.fillStyle = color || '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-18, -24); ctx.lineTo(-28, 46); ctx.lineTo(28, 46); ctx.lineTo(18, -24);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-8, -22, 16, 26);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-4, -18, 8, 4);

    ctx.fillStyle = '#EDE9FE';
    ctx.beginPath(); ctx.arc(0, -36, 14, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 3;
    const batonAngle = Math.sin(this.monster.animTimer * 2) * 0.4;
    ctx.save();
    ctx.translate(22, -10);
    ctx.rotate(batonAngle);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, -36); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#A78BFA';
    const noteY = Math.sin(this.monster.animTimer * 3) * 8;
    ctx.font = '16px monospace';
    ctx.fillText('♪', -32, -28 + noteY);
    ctx.fillText('♫', 32, -40 - noteY);
  },

  drawWispSprite: function(ctx, color) {
    // Quái đốm sáng linh hồn (Wisp)
    const bob = Math.sin(this.monster.animTimer * 3) * 4;
    ctx.fillStyle = color || '#A855F7';
    ctx.beginPath(); ctx.arc(0, bob, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(0, bob, 8, 0, Math.PI * 2); ctx.fill();
  },

  drawBeetleImpSprite: function(ctx, color) {
    // Quái bọ gai / tiểu quỷ
    ctx.fillStyle = color || '#DC2626';
    ctx.beginPath(); ctx.ellipse(0, 6, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-6, -12, 12, 10);
    // Càng nhọn
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(-14, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -12); ctx.lineTo(14, -20); ctx.stroke();
  },

  drawThematicMinionSprite: function(ctx, m) {
    // Minion Thematic đại diện với lõi nguyên tố xoay
    const col = m.color || '#10B981';
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-5, -4, 4, 0, Math.PI * 2); ctx.arc(5, -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, -5, 2, 3); ctx.fillRect(4, -5, 2, 3);
  },

  drawMonsterBar: function(ctx, x, y) {
    const m = this.monster;
    if (!m) return;
    const hpPct = Math.max(0, Math.min(1, m.hp / m.maxHp));
    const ghostPct = Math.max(0, Math.min(1, m.ghostHp / m.maxHp));

    // 1. NẾU LÀ TRÙM CUỐI (BOSS): VẼ THANH MÁU HOÀNG GIA ĐẲNG CẤP TRÊN ĐẦU MÀN HÌNH
    if (m.isBoss) {
      const topBarW = 380;
      const topBarH = 26;
      const topBarX = (this.width - topBarW) / 2;
      const topBarY = 10;

      // Nền khung bóng mờ & viền vàng hoàng kim
      ctx.fillStyle = 'rgba(11, 13, 23, 0.92)';
      ctx.fillRect(topBarX - 4, topBarY - 4, topBarW + 8, topBarH + 20);
      ctx.strokeStyle = m.enraged ? '#EF4444' : '#FFE787';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(topBarX - 4, topBarY - 4, topBarW + 8, topBarH + 20);

      // Nhãn tên Boss & Trạng thái Cuồng nộ
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = m.enraged ? '#EF4444' : '#FDE047';
      ctx.fillText(m.enraged ? `🔥 [CUỒNG BẠO] ${m.name}` : `👑 [TRÙM CUỐI] ${m.name}`, topBarX + 2, topBarY + 8);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`HIỆP ${m.wave}/${m.totalWaves}`, topBarX + topBarW - 2, topBarY + 8);

      // Khung chứa thanh máu
      const innerY = topBarY + 12;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(topBarX, innerY, topBarW, 14);

      // Thanh máu ma Ghost Bar (vàng cam mượt mà)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(topBarX, innerY, topBarW * ghostPct, 14);

      // Thanh máu chính (Đỏ rực / Đỏ bão lửa khi cuồng nộ)
      ctx.fillStyle = m.enraged ? '#DC2626' : '#EF4444';
      ctx.fillRect(topBarX, innerY, topBarW * hpPct, 14);

      // Chữ số máu chi tiết (Ví dụ: 850 / 1200 HP • 71%)
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(`${m.hp} / ${m.maxHp} HP (${Math.round(hpPct * 100)}%)`, topBarX + topBarW / 2, innerY + 11);

      // Thanh mini phụ trên đỉnh đầu rồng
      const miniW = 120;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x - (miniW / 2) - 2, y, miniW + 4, 7);
      ctx.fillStyle = m.enraged ? '#DC2626' : '#EF4444';
      ctx.fillRect(x - (miniW / 2), y + 1, miniW * hpPct, 5);
      return;
    }

    // 2. THANH MÁU QUÁI VẬT THƯỜNG
    const width = 90;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - (width / 2) - 2, y, width + 4, 9);

    ctx.fillStyle = '#FDE047';
    ctx.fillRect(x - (width / 2), y + 1, width * ghostPct, 7);

    ctx.fillStyle = '#EAB308';
    ctx.fillRect(x - (width / 2), y + 1, width * hpPct, 7);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#FEF08A';
    ctx.textAlign = 'center';
    ctx.fillText(`[ẢI ${m.wave}/${m.totalWaves}] ${m.name}`, x, y - 4);
  },

  // ==================== CÁC HIỆU ỨNG CHIẾN ĐẤU (SLASHES, PROJECTILES, PARTICLES) ====================
  drawProjectiles: function(ctx) {
    for (const proj of this.projectiles) {
      ctx.fillStyle = proj.color || '#F59E0B';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius || 8, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawSlashes: function(ctx) {
    for (const s of this.slashes) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.scale(s.scale, s.scale);

      // Vết chém hình lưỡi liềm phát sáng rực rỡ
      ctx.strokeStyle = s.color || '#F8FAFC';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 35, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 35, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();

      ctx.restore();
    }
  },

  drawParticles: function(ctx) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  },

  drawFloatingTexts: function(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.font = ft.font || 'bold 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';

      // Bóng đổ chữ màu đen
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 2, ft.y + 2);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
  },

  drawScanlines: function(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < this.height; y += 4) {
      ctx.fillRect(0, y, this.width, 2);
    }
  },

  // ==================== XỬ LÝ LƯỢT ĐẤU NÂNG CAO ====================
  handlePlayerAnswer: function(isCorrect, wordObj, comboStreak = 0) {
    if (!this.active) return;
    this.turnStatusTicked = false;
    const userClass = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.rpg_class) ? currentRpgUser.rpg_class : 'warrior';

    if (isCorrect) {
      // 1. HIỆP SĨ TẤN CÔNG
      if (userClass === 'mage') {
        // Pháp sư bắn Hỏa cầu ma pháp
        RetroAudio.playMagic();
        this.projectiles.push({
          x: this.hero.x + 25, y: this.hero.y - 20,
          vx: 900, vy: 0, radius: 9, color: '#38BDF8', trailColor: '#818CF8'
        });
      } else if (userClass === 'ranger') {
        // Xạ thủ bắn mũi tên ánh sáng
        RetroAudio.playSlash();
        this.projectiles.push({
          x: this.hero.x + 25, y: this.hero.y,
          vx: 1100, vy: 0, radius: 4, color: '#FEF08A', trailColor: '#F59E0B'
        });
      } else {
        // Chiến binh / Sát thủ lao nhanh về phía trước
        this.hero.state = 'dashing';
        RetroAudio.playSlash();
      }

      this.pendingWord = wordObj;
      this.pendingStreak = comboStreak;

    } else {
      // 2. CHỌN SAI: ĐÒN ĐÁNH BỊ HỤT (MISS), QUÁI PHẢN ĐÒN
      this.addFloatDamage(this.hero.x, this.hero.y - 25, 'MISS!', '#94A3B8', false);

      // Kiểm tra quái vật có đang bị Đóng Băng (Frozen) không
      if (this.monster && this.monster.frozen) {
        this.monster.frozen = false;
        this.monster.isCharging = false;
        this.addFloatDamage(this.monster.x, this.monster.y - 35, '❄️ BĂNG TAN! QUÁI MẤT LƯỢT', '#38BDF8', true);
        RetroAudio.playHit();
        return;
      }

      // Kiểm tra Báo Bóng Đêm / Hồ Ly Băng (Pet shadow_panther / frost_kitsune) đóng băng quái cứu nguy
      const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
      const equippedPet = user?.equipped_pet;
      const isPanther = (equippedPet === 'shadow_panther' || equippedPet === 'frost_kitsune');
      if (isPanther && Math.random() < 0.15) {
        this.addFloatDamage(this.monster.x, this.monster.y - 35, '🐆 BÁO BÓNG ĐÊM ĐÓNG BĂNG! CỨU NGUY', '#A855F7', true);
        RetroAudio.playHit();
        return;
      }

      setTimeout(() => {
        this.monster.state = 'attacking';
        RetroAudio.playMonsterAttack();
      }, 400);
    }
  },

  onHeroStrikeConnect: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 35, crit: 5 };

    let isCrit = (this.pendingStreak >= 3) || (Math.random() * 100 < (stats.crit || 5));
    let skillMultiplier = 1.0;
    let ignoreDefPercent = 0;
    const skillParams = this.pendingSkillParams || null;

    const userClass = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.rpg_class) ? currentRpgUser.rpg_class : 'warrior';
    if (userClass === 'mage' && this.pendingWord?.level === 'advanced') {
      skillMultiplier *= 1.8;
      this.addFloatDamage(this.monster.x, this.monster.y - 35, '⚡ MA PHÁP C1-C2 x1.8!', '#8C43F6', true);
    }

    // 1. Warrior Berserk (Cuồng Trảm: 2.2x DMG)
    if (this.pendingBerserk || (skillParams && skillParams.effect === 'dmg_mult_2.2')) {
      const bMult = (skillParams && typeof skillParams.dmgMult === 'number') ? skillParams.dmgMult : 2.2;
      skillMultiplier *= bMult;
      this.pendingBerserk = false;
      this.addFloatDamage(this.hero.x, this.hero.y - 30, '🔥 CUỒNG TRẢM X2.2!', '#EF4444', true);
    }

    // 2. Mage Meteor Strike (Thiên Thạch Hủy Diệt: 3.0x DMG, 50% DEF Pierce)
    if (this.pendingMeteorStrike || (skillParams && skillParams.effect === 'meteor_strike')) {
      const mMult = (skillParams && typeof skillParams.dmgMult === 'number') ? skillParams.dmgMult : 3.0;
      ignoreDefPercent = (skillParams && typeof skillParams.ignoreDefPercent === 'number') ? skillParams.ignoreDefPercent : 0.5;
      skillMultiplier *= mMult;
      this.pendingMeteorStrike = false;
      this.addFloatDamage(this.hero.x, this.hero.y - 30, '☄️ THIÊN THẠCH HỦY DIỆT x3.0 (XUYÊN 50% GIÁP)!', '#8B5CF6', true);
    }

    // 3. Assassin Guaranteed Crit 3.5 (Ám Sát Bạo Kích)
    if (this.pendingCrit35 || (skillParams && skillParams.effect === 'guaranteed_crit_3.5')) {
      isCrit = true;
      const cMult = (skillParams && typeof skillParams.critMult === 'number') ? skillParams.critMult : 3.5;
      skillMultiplier *= cMult;
      this.pendingCrit35 = false;
      this.addFloatDamage(this.hero.x, this.hero.y - 30, '🩸 ÁM SÁT BẠO KÍCH X3.5!', '#F59E0B', true);
    }

    // 4. Assassin Passive 1: Lưỡi Dao Tẩm Độc (25 HP/lượt trong 3 lượt)
    if (userClass === 'assassin' && user?.skills_unlocked?.passive_1) {
      const pParams = (typeof GamificationSkills !== 'undefined' && typeof GamificationSkills.getAssassinPoisonParams === 'function')
        ? GamificationSkills.getAssassinPoisonParams()
        : { poisonDmg: 25, poisonTurns: 3 };
      this.monster.poisonTurns = pParams.poisonTurns || 3;
      this.monster.poisonDmg = pParams.poisonDmg || 25;
      this.addFloatDamage(this.monster.x, this.monster.y - 45, '🧪 LƯỠI DAO TẨM ĐỘC (25 HP/LƯỢT, 3 LƯỢT)!', '#A855F7', true);
    }

    // 5. Ranger Arrow Barrage (Mưa Tên: 2 hits, 1.1x per hit, 40% DEF ignore)
    if (this.pendingArrowBarrage || (skillParams && skillParams.effect === 'arrow_barrage')) {
      this.pendingArrowBarrage = false;
      const hitsCount = (skillParams && skillParams.hits) ? skillParams.hits : 2;
      const multPerHit = (skillParams && typeof skillParams.multPerHit === 'number') ? skillParams.multPerHit : 1.1;
      const barrageIgnoreDef = (skillParams && typeof skillParams.ignoreDefPercent === 'number') ? skillParams.ignoreDefPercent : 0.4;
      this.pendingSkillParams = null;

      const rawDef = this.monster.def || 10;
      const barrageDef = Math.max(0, Math.round(rawDef * (1 - barrageIgnoreDef)));
      const heroElement = (this.getHeroElement) ? this.getHeroElement(user) : 'fire';
      const monsterElement = this.monster.element || 'fire';

      let totalBarrageDmg = 0;
      const hitDamages = [];
      for (let h = 0; h < hitsCount; h++) {
        let hDmg = 0;
        if (typeof calculateCombatDamage === 'function') {
          hDmg = calculateCombatDamage(stats.atk || 35, barrageDef, isCrit, multPerHit, heroElement, monsterElement);
        } else {
          const baseDmg = (stats.atk || 35) + Math.floor(Math.random() * 12);
          hDmg = Math.max(15, Math.round((isCrit ? baseDmg * 1.8 : baseDmg) * multPerHit) - Math.floor(barrageDef / 3));
        }
        hitDamages.push(hDmg);
        totalBarrageDmg += hDmg;
      }

      this.monster.hp = Math.max(0, this.monster.hp - totalBarrageDmg);
      this.monster.flashWhite = 0.5;
      this.screenShake = 1.4;

      // Hit 1 Float & Sparks
      this.addFloatDamage(this.monster.x - 12, this.monster.y - 25, `🎯 MƯA TÊN [1]: -${hitDamages[0]} HP`, '#10B981', isCrit);
      this.createHitSparks(this.monster.x - 10, this.monster.y, isCrit);

      // Hit 2 Float & Sparks (120ms offset)
      setTimeout(() => {
        if (this.active && this.monster) {
          this.addFloatDamage(this.monster.x + 15, this.monster.y - 50, `🎯 MƯA TÊN [2]: -${hitDamages[1]} HP (XUYÊN 40% GIÁP)`, '#34D399', isCrit);
          this.createHitSparks(this.monster.x + 10, this.monster.y, isCrit);
          RetroAudio.playCritical();
        }
      }, 120);

      this.slashes.push(
        { x: this.monster.x - 10, y: this.monster.y, angle: -0.3, scale: 1, life: 0.25, color: '#10B981' },
        { x: this.monster.x + 10, y: this.monster.y - 10, angle: 0.4, scale: 1, life: 0.3, color: '#34D399' }
      );
      RetroAudio.playSlash();

      if (typeof GamificationQuests !== 'undefined') {
        GamificationQuests.trackProgress('word_correct', 1);
        if (this.pendingStreak >= 5) GamificationQuests.trackProgress('combo_streak', this.pendingStreak);
      }

      // Check status effects strictly once per turn boundary
      this.turnStatusTicked = true;
      this.applyTurnStatusEffects();

      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
      } else if (this.monster.isBoss) {
        this.processBossTurnCycle();
      }

      this.hero.state = 'retracting';
      this.updateBattleUI();
      return;
    }

    // Dọn dẹp pendingSkillParams sau khi dùng xong
    this.pendingSkillParams = null;

    // Phân giải hệ nguyên tố và tính sát thương
    const heroElement = (this.getHeroElement) ? this.getHeroElement(user) : 'fire';
    const monsterElement = this.monster.element || 'fire';
    const elemMult = (typeof window.calculateElementalMultiplier === 'function')
      ? window.calculateElementalMultiplier(heroElement, monsterElement)
      : 1.0;

    const rawDef = this.monster.def || 10;
    const effectiveDef = Math.max(0, Math.round(rawDef * (1 - ignoreDefPercent)));

    let finalDmg = 0;
    if (typeof calculateCombatDamage === 'function') {
      finalDmg = calculateCombatDamage(stats.atk || 35, effectiveDef, isCrit, skillMultiplier, heroElement, monsterElement);
    } else {
      const baseDmg = (stats.atk || 35) + Math.floor(Math.random() * 15);
      const reduced = Math.max(15, Math.round((isCrit ? baseDmg * 1.8 : baseDmg) * skillMultiplier * elemMult) - Math.floor(effectiveDef / 3));
      finalDmg = reduced;
    }

    if (elemMult > 1.0) {
      this.addFloatDamage(this.monster.x, this.monster.y - 45, `⚡ KHẮC CHẾ HỆ: x${elemMult.toFixed(1)}!`, '#38BDF8', false);
    } else if (elemMult < 1.0) {
      this.addFloatDamage(this.monster.x, this.monster.y - 45, `🛡️ BỊ KHẮC CHẾ: x${elemMult.toFixed(2)}`, '#94A3B8', false);
    }

    this.monster.hp = Math.max(0, this.monster.hp - finalDmg);
    this.monster.flashWhite = 0.4;
    this.screenShake = isCrit ? 1.5 : 0.7;

    // Linh thú Tiểu Hỏa Long phụ chiến (Baby Drake Assist)
    if (user?.equipped_pet === 'baby_drake') {
      const assistDmg = 20;
      this.monster.hp = Math.max(0, this.monster.hp - assistDmg);
      this.addFloatDamage(this.monster.x, this.monster.y - 45, `🐲 RỒNG CON KHÈ LỬA! -${assistDmg} HP`, '#EF4444', false);
    }

    // Pháp Sư Passive 1 (Minh Triết Cổ Đại): hồi 12 MP khi đúng từ C1-C2
    if (user?.rpg_class === 'mage' && user?.skills_unlocked?.passive_1 && this.pendingWord?.level === 'advanced') {
      this.hero.mp = Math.min(this.hero.maxMp, this.hero.mp + 12);
      this.addFloatDamage(this.hero.x, this.hero.y - 25, '+12 MP MINH TRIẾT!', '#8B5CF6', false);
    }

    // Cập nhật tiến độ Nhiệm vụ & Thành tựu
    if (typeof GamificationQuests !== 'undefined') {
      GamificationQuests.trackProgress('word_correct', 1);
      if (this.pendingStreak >= 5) {
        GamificationQuests.trackProgress('combo_streak', this.pendingStreak);
      }
      if (this.pendingWord?.level === 'advanced') {
        GamificationQuests.trackProgress('c1_c2_word', 1);
      }
    }

    // Hiệu ứng Hút máu (Vampiric) nếu có
    const eq = user?.equipped || {};
    const weaponItem = (typeof getRpgEquipmentById === 'function') ? getRpgEquipmentById(eq.weapon) : null;
    if (weaponItem?.passive?.type === 'vampiric' && this.hero.hp < this.hero.maxHp) {
      const heal = Math.min(12, weaponItem.passive.val || 5);
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + heal);
      this.addFloatDamage(this.hero.x, this.hero.y - 20, `+${heal} HP HÚT MÁU!`, '#10B981', false);
    }

    // Thêm vết chém xé gió hình lưỡi liềm
    this.slashes.push({
      x: this.monster.x, y: this.monster.y,
      angle: (Math.random() - 0.5) * 1.2,
      scale: 1, life: 0.25,
      color: isCrit ? '#EF4444' : '#F59E0B'
    });

    // Hạt tia lửa tóe ra
    this.createHitSparks(this.monster.x, this.monster.y, isCrit);

    // Chữ số sát thương nảy nảy
    this.addFloatDamage(this.monster.x, this.monster.y - 15, (isCrit ? '💥 CRITICAL! -' : '-') + finalDmg, isCrit ? '#EF4444' : '#F59E0B', isCrit);

    if (isCrit) RetroAudio.playCritical();
    else RetroAudio.playHit();

    // Rút lui về vị trí ban đầu
    this.hero.state = 'retracting';

    // Xử lý hiệu ứng trạng thái (DoT)
    this.turnStatusTicked = true;
    this.applyTurnStatusEffects();

    // KIỂM TRA NẾU QUÁI HẾT MÁU -> NỔ TUNG PIXEL SHATTER!
    if (this.monster.isBoss) {
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
      } else {
        this.processBossTurnCycle();
      }
    } else {
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
      }
    }

    this.updateBattleUI();
  },

  // ==================== BOSS AI TURN CYCLE & TELEGRAPH ====================
  processBossTurnCycle: function() {
    if (!this.monster || !this.monster.isBoss || this.monster.hp <= 0) return;
    this.monster.turnCount = (this.monster.turnCount || 0) + 1;

    // 1. Kiểm tra kích hoạt Cuồng Nộ (Enraged) khi HP <= 50%
    if (this.monster.hp <= this.monster.maxHp * 0.5 && !this.monster.enraged) {
      this.monster.enraged = true;
      const atkBuff = Math.round((this.monster.atk || 45) * 0.25);
      this.monster.atk = (this.monster.atk || 45) + atkBuff;
      this.addFloatDamage(this.monster.x, this.monster.y - 35, `🔥 ${this.monster.name} CUỒNG NỘ! (+25% CÔNG)`, '#EF4444', true);
      this.screenShake = 2.5;
      RetroAudio.playBossAlert();
    }

    // 2. Boss AI Routine theo chu kỳ lượt
    if (this.monster.frozen) {
      this.monster.frozen = false;
      this.monster.isCharging = false;
      this.addFloatDamage(this.monster.x, this.monster.y - 35, '❄️ BĂNG TAN! BOSS BỊ PHÁ CHIÊU', '#38BDF8', true);
      RetroAudio.playHit();
    } else if (this.monster.isCharging) {
      // Boss hoàn tất tích tụ -> Phóng tuyệt kỹ Mega Strike!
      this.monster.isCharging = false;
      setTimeout(() => {
        if (this.monster && this.monster.hp > 0 && this.monster.state !== 'dead' && this.monster.state !== 'dying') {
          this.monster.state = 'attacking';
          RetroAudio.playMonsterAttack();
        }
      }, 400);
    } else {
      // Lượt bình thường: Quyết định Tích Tụ (Charge) hay Gầm Thét / Tấn công nhẹ
      // Cuồng nộ: tích tụ theo lượt chẵn (turnCount % 2 === 0); bình thường theo lượt lẻ (turnCount % 2 === 1)
      const shouldCharge = this.monster.enraged
        ? (this.monster.turnCount % 2 === 0)
        : (this.monster.turnCount % 2 === 1);

      if (shouldCharge) {
        // Khởi động Tích Tụ Tuyệt Kỹ (Telegraph Charge)
        this.monster.isCharging = true;
        this.monster.chargeSkill = this.monster.skillName || 'TUYỆT KỸ MA VƯƠNG';
        this.addFloatDamage(this.monster.x, this.monster.y - 35, `⚠️ TÍCH TỤ: ${this.monster.chargeSkill}!`, '#F59E0B', true);
        this.screenShake = 1.0;
        RetroAudio.playBossAlert();
      } else {
        // Gầm thét uy hiếp & chuẩn bị lượt tiếp theo
        const roar = (this.monster.roars && this.monster.roars.length > 0)
          ? this.monster.roars[Math.floor(Math.random() * this.monster.roars.length)]
          : `${this.monster.name} GẦM THÉT QUYẾT CHIẾN!`;
        this.addFloatDamage(this.monster.x, this.monster.y - 35, `💬 ${roar}`, '#F59E0B', false);
      }
    }

    if (typeof window.onBossTurnComplete === 'function') {
      window.onBossTurnComplete();
    }
  },

  processBossTurnRoutine: function() {
    return this.processBossTurnCycle();
  },

  // ==================== HERO FINISHING BLOW EXECUTION ====================
  triggerHeroFinishingBlow: function(isQuizExhausted = false) {
    if (!this.monster || !this.monster.isBoss || this.monster.hp <= 0) return false;

    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 35 };
    const boss = this.monster;

    // Ngưỡng kết liễu: Boss còn <= 20% HP tối đa HOẶC máu còn lại thấp hơn uy lực tất sát (ATK * 2.5)
    // HOẶC khi đã trả lời hết toàn bộ các câu hỏi trong hầm ngục (isQuizExhausted === true)
    const thresholdHp = Math.max(Math.round(boss.maxHp * 0.20), Math.round((stats.atk || 35) * 2.5));

    if (boss.hp <= thresholdHp || isQuizExhausted) {
      this.hero.state = 'dashing';
      this.addFloatDamage(this.hero.x, this.hero.y - 30, `⚡ TUYỆT KỸ KẾT LIỄU: TRẢM MA ĐẠI PHÁ! -${boss.hp} HP`, '#FFE787', true);
      boss.hp = 0;
      this.triggerMonsterDeathExplosion();
      return true;
    } else {
      const finishingDmg = Math.round((stats.atk || 35) * 1.8);
      boss.hp = Math.max(1, boss.hp - finishingDmg);
      boss.flashWhite = 0.4;
      this.screenShake = 1.5;
      boss.state = 'attacking';
      this.addFloatDamage(boss.x, boss.y - 30, `💥 TRẢM MA: -${finishingDmg} HP (CÒN ${boss.hp} HP)!`, '#EF4444', true);
      this.updateBattleUI();

      setTimeout(() => {
        this.addFloatDamage(boss.x, boss.y - 45, '🔥 BOSS NỔI ĐIÊN PHẢN CÔNG!', '#EF4444', true);
        if (typeof RetroAudio !== 'undefined') RetroAudio.playMonsterAttack();
      }, 800);
      return false;
    }
  },

  onMonsterStrikeConnect: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { dodge: 5, def: 10 };

    // 1. Kiểm tra Bóng Ma Hư Không (Assassin Active 1 - 100% Dodge)
    if (this.pendingAbsoluteDodge) {
      this.pendingAbsoluteDodge = false;
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '💨 BÓNG MA HƯ KHÔNG (100% NÉ)!', '#38BDF8', true);
      this.hero.state = 'idle';
      this.updateBattleUI();
      return;
    }

    // 2. Kiểm tra Né Đòn thông thường (Dodge)
    if (Math.random() * 100 < (stats.dodge || 5)) {
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '💨 NÉ ĐÒN THẦN SẦU (DODGE)!', '#38BDF8', true);
      this.hero.state = 'idle';
      this.updateBattleUI();
      return;
    }

    // 3. Kiểm tra Bùa Khiên Hộ Mệnh (Shield Charm)
    if (user?.inventory?.shield_charm > 0) {
      user.inventory.shield_charm--;
      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '🛡️ KHIÊN HỘ MỆNH CHẶN ĐÒN!', '#F59E0B', true);
      RetroAudio.playHit();
      this.hero.state = 'idle';
      this.updateBattleUI();
      return;
    }

    // 4. Tính toán hệ nguyên tố quái tấn công hiệp sĩ
    const heroElement = (this.getHeroElement) ? this.getHeroElement(user) : 'fire';
    const monsterElement = this.monster.element || 'fire';
    const monsterElemMult = (typeof window.calculateElementalMultiplier === 'function')
      ? window.calculateElementalMultiplier(monsterElement, heroElement)
      : 1.0;

    let skillMult = 1.0;
    let attackLabel = `💥 PHẢN ĐÒN!`;

    if (this.monster.isBoss) {
      if (this.monster.chargeSkill) {
        skillMult = 1.4; // 40% sát thương cộng thêm từ tuyệt kỹ đã tích tụ
        attackLabel = `🔥 [TUYỆT KỸ] ${this.monster.chargeSkill}!`;
        this.monster.chargeSkill = null;
      } else {
        attackLabel = `🔥 ${this.monster.skillName || 'CHIÊU THỨC BÁ ĐẠO'}!`;
      }
    }

    // 5. Quái vật / Boss xuất chiêu với ATK riêng, giảm trừ theo công thức hyperbolic DEF
    const monsterRawAtk = (this.monster.atk || (this.monster.isBoss ? 45 : 20)) * skillMult * monsterElemMult;
    const heroDef = stats.def || 10;
    let monsterDmg = (typeof window.calculateMonsterDamage === 'function')
      ? window.calculateMonsterDamage(monsterRawAtk, heroDef)
      : Math.max(8, Math.round((12 + (monsterRawAtk * 0.20) + (Math.random() * 6)) * (60 / (60 + heroDef))));

    // 6. Kiểm tra Khiên Phản Đòn (Warrior Active 2 - Reflect Shield)
    const pShield = this.pendingSkillParams;
    if (this.pendingReflectShield || (pShield && pShield.effect === 'reflect_shield')) {
      this.pendingReflectShield = false;
      const mit = (pShield && typeof pShield.mitigation === 'number') ? pShield.mitigation : 0.8;
      const ref = (pShield && typeof pShield.reflect === 'number') ? pShield.reflect : 1.0;
      this.pendingSkillParams = null;

      // Giảm 80% sát thương nhận vào
      monsterDmg = Math.max(1, Math.round(monsterDmg * (1 - mit)));

      // Phản đòn 100% sát thương của quái ngược lại
      const reflectedDmg = Math.round(monsterRawAtk * ref);
      this.monster.hp = Math.max(0, this.monster.hp - reflectedDmg);
      this.monster.flashWhite = 0.4;
      this.screenShake = 1.6;

      this.addFloatDamage(this.monster.x, this.monster.y - 30, `🛡️ PHẢN ĐÒN 100%! -${reflectedDmg} HP`, '#F59E0B', true);
      this.createHitSparks(this.monster.x, this.monster.y, true);
      RetroAudio.playHit();

      // Kiểm tra quái vật bị phản đòn hạ gục
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
        this.hero.hp = Math.max(0, this.hero.hp - monsterDmg);

        // Kiểm tra Bất Tử Chiến Ý (Warrior Passive 2 - Last Stand)
        if (this.hero.hp <= 0 && user?.rpg_class === 'warrior' && user?.skills_unlocked?.passive_2 && !this.lastStandUsed) {
          this.lastStandUsed = true;
          this.hero.hp = 1;
          this.addFloatDamage(this.hero.x, this.hero.y - 35, '❤️‍🔥 BẤT TỬ CHIẾN Ý! GIỮ LẠI 1 HP', '#EF4444', true);
        }

        if (typeof currentRpgUser !== 'undefined' && currentRpgUser) {
          currentRpgUser.hp = this.hero.hp;
          if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
        }

        if (this.hero.hp <= 0) {
          this.onHeroFallen();
        }

        this.updateBattleUI();
        return;
      }
    }

    this.hero.hp = Math.max(0, this.hero.hp - monsterDmg);
    this.hero.flashWhite = 0.4;
    this.screenShake = this.monster.isBoss ? 2.0 : 1.2;

    RetroAudio.playHeroHurt();
    this.createHitSparks(this.hero.x, this.hero.y, this.monster.isBoss);

    const hitLabel = `${attackLabel} -${monsterDmg} HP`;
    this.addFloatDamage(this.hero.x, this.hero.y - 20, hitLabel, '#EF4444', true);

    // 7. Kiểm tra Bất Tử Chiến Ý (Warrior Passive 2 - Last Stand)
    if (this.hero.hp <= 0 && user?.rpg_class === 'warrior' && user?.skills_unlocked?.passive_2 && !this.lastStandUsed) {
      this.lastStandUsed = true;
      this.hero.hp = 1;
      this.addFloatDamage(this.hero.x, this.hero.y - 35, '❤️‍🔥 BẤT TỬ CHIẾN Ý! GIỮ LẠI 1 HP', '#EF4444', true);
    }

    if (typeof currentRpgUser !== 'undefined' && currentRpgUser) {
      currentRpgUser.hp = this.hero.hp;
      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    }

    if (this.hero.hp <= 0) {
      this.onHeroFallen();
    } else {
      // Status effects tick strictly once per turn boundary
      if (!this.turnStatusTicked) {
        this.turnStatusTicked = true;
        this.applyTurnStatusEffects();
      }
    }

    this.updateBattleUI();
  },

  // ==================== QUÁI VẬT BỊ TIÊU DIỆT: NỔ TUNG PIXEL ====================
  triggerMonsterDeathExplosion: function() {
    if (!this.monster || this.monster.state === 'dying' || this.monster.state === 'dead' || this.monster.deathTriggered) return;
    this.monster.deathTriggered = true;
    this.monster.state = 'dying';
    this.monster.deathTimer = 0;
    this.screenShake = 1.8;
    RetroAudio.playExplosion();

    this.addFloatDamage(this.monster.x, this.monster.y - 45, '🏆 QUÁI VẬT BỊ TIÊU DIỆT!', '#10B981', true);

    // Ghi nhận tiến độ Diệt Boss cho Nhiệm Vụ & Thành Tựu
    if (this.monster.isBoss && typeof GamificationQuests !== 'undefined') {
      GamificationQuests.trackProgress('slay_boss', 1);
      GamificationQuests.trackProgress('boss_slain', 1);
    }

    // Nổ tung thành 60+ mảnh pixel quái vật bay tứ phía
    const colors = [this.monster.color, '#FFFFFF', '#F59E0B', '#EF4444'];
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 260;
      this.particles.push({
        x: this.monster.x + (Math.random() - 0.5) * 30,
        y: this.monster.y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 280,
        size: 3 + Math.floor(Math.random() * 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.8 + Math.random() * 0.4
      });
    }

    // Tiền vàng phun trào
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.monster.x,
        y: this.monster.y,
        vx: (Math.random() - 0.5) * 160,
        vy: -120 - Math.random() * 100,
        gravity: 220,
        size: 4,
        color: '#FACC15',
        life: 0.9
      });
    }

    if (typeof addCoins === 'function') addCoins(5, 'Thưởng diệt quái');
  },

  onMonsterDeathComplete: function() {
    RetroAudio.playVictory();
    // Báo cho giao diện biết quái đã chết để chuyển tiếp câu hỏi hoặc qua wave
    if (typeof window.onMonsterSlainCallback === 'function') {
      window.onMonsterSlainCallback();
    } else if (typeof onMonsterSlainCallback === 'function') {
      onMonsterSlainCallback();
    } else if (typeof nextQuizCard === 'function') {
      setTimeout(() => { nextQuizCard(); }, 600);
    }
  },

  onHeroFallen: function() {
    this.hero.state = 'dead';
    RetroAudio.playDefeat();
    this.addFloatDamage(this.hero.x, this.hero.y - 30, '💀 HIỆP SĨ ĐÃ GỤC NGÃ!', '#DC2626', true);

    setTimeout(() => {
      const canRevive = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.inventory?.health_potion > 0);
      if (canRevive && confirm('❤️ Hiệp sĩ đã hết máu! Bạn có muốn dùng 1 Bình Máu Siêu Cấp để hồi phục +50 HP và tiếp tục chiến đấu?')) {
        this.useHealthPotionInBattle();
      } else {
        alert('Trận chiến kết thúc! Hãy về Cửa Hàng mua thêm Bình Máu để tiếp tục chinh phục Hầm Ngục.');
      }
    }, 600);
  },

  createHitSparks: function(x, y, isCrit) {
    const count = isCrit ? 35 : 18;
    const colors = isCrit ? ['#EF4444', '#F59E0B', '#FEF08A', '#FFFFFF'] : ['#38BDF8', '#818CF8', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 180,
        size: isCrit ? 4 : 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.35 + Math.random() * 0.25
      });
    }
  },

  addFloatDamage: function(x, y, text, color = '#EF4444', isCrit = false) {
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y,
      text: text,
      color: color,
      speed: isCrit ? 70 : 45,
      life: 1.2,
      font: isCrit ? '800 18px "Space Grotesk", sans-serif' : 'bold 13px monospace'
    });
  },

  // ==================== KỸ NĂNG CLASS & VẬT PHẨM TRỰC TIẾP ====================
  useClassSkillInBattle: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : { rpg_class: 'warrior' };
    const cost = 20;

    if (this.hero.mp < cost) {
      alert(`Không đủ MP! Kỹ năng cần ${cost} MP, hiện bạn chỉ còn ${this.hero.mp} MP.`);
      return;
    }

    this.hero.mp -= cost;
    if (typeof currentRpgUser !== 'undefined' && currentRpgUser) currentRpgUser.mp = this.hero.mp;

    RetroAudio.playMagic();
    this.screenShake = 1.4;

    if (user.rpg_class === 'mage') {
      if (typeof useHintScrollInQuiz === 'function') useHintScrollInQuiz(true);
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '✨ HỎA CẦU DIỆT 2 ĐÁP ÁN SAI!', '#7C3AED', true);
    } else if (user.rpg_class === 'ranger') {
      this.highlightCorrectAnswer();
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '🏹 MẮT ĐẠI BÀNG CHỈ ĐIỂM!', '#16A34A', true);
    } else if (user.rpg_class === 'assassin') {
      const dmg = 45;
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      this.createHitSparks(this.monster.x, this.monster.y, true);
      if (typeof addCoins === 'function') addCoins(15, 'Kỹ năng trộm vàng');
      this.addFloatDamage(this.monster.x, this.monster.y, `🥷 ĐOẠT MỆNH! -${dmg} & +15 🪙`, '#EF4444', true);
      if (this.monster.hp <= 0) this.triggerMonsterDeathExplosion();
    } else {
      const dmg = 60;
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      this.createHitSparks(this.monster.x, this.monster.y, true);
      this.addFloatDamage(this.monster.x, this.monster.y, `⚔️ CUỒNG PHONG TRẢM! -${dmg}`, '#DC2626', true);
      if (this.monster.hp <= 0) this.triggerMonsterDeathExplosion();
    }

    this.updateBattleUI();
  },

  useHealthPotionInBattle: function() {
    const user = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : null;
    const count = user?.inventory?.health_potion || 0;
    if (count <= 0) {
      alert('Túi đồ đã hết Bình Máu! Hãy vào Cửa Hàng để mua thêm nhé.');
      return;
    }

    user.inventory.health_potion--;
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 50);
    if (typeof GamificationQuests !== 'undefined') GamificationQuests.trackProgress('use_potion', 1);
    user.hp = this.hero.hp;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

    RetroAudio.playPotion();
    this.addFloatDamage(this.hero.x, this.hero.y - 20, '+50 HP HỒI PHỤC! 🧪', '#10B981', true);
    this.updateBattleUI();
  },

  useManaPotionInBattle: function() {
    const user = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : null;
    const count = user?.inventory?.mana_potion || 0;
    if (count <= 0) {
      alert('Túi đồ đã hết Bình MP!');
      return;
    }

    user.inventory.mana_potion--;
    this.hero.mp = Math.min(this.hero.maxMp, this.hero.mp + 40);
    if (typeof GamificationQuests !== 'undefined') GamificationQuests.trackProgress('use_potion', 1);
    user.mp = this.hero.mp;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();

    RetroAudio.playPotion();
    this.addFloatDamage(this.hero.x, this.hero.y - 20, '+40 MP HỒI NĂNG LƯỢNG! 🔮', '#3B82F6', true);
    this.updateBattleUI();
  },

  highlightCorrectAnswer: function() {
    if (typeof quizQuestions !== 'undefined' && quizQuestions[quizCurrentIdx]) {
      const q = quizQuestions[quizCurrentIdx];
      q.options.forEach((opt, idx) => {
        if (opt.isCorrect) {
          const btn = document.getElementById('quizOptBtn-' + idx);
          if (btn) btn.classList.add('ring-4', 'ring-emerald-400', 'animate-pulse');
        }
      });
    }
  },

  triggerBossAlert: function() {
    RetroAudio.playBossAlert();
    this.screenShake = 2.0;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-1/4 left-1/2 -translate-x-1/2 z-50 bg-red-600 border-4 border-[#111] text-white px-6 py-4 font-display font-extrabold text-xl uppercase tracking-wider shadow-[6px_6px_0px_#111] animate-bounce';
    alertDiv.innerHTML = '⚠️ CẢNH BÁO: TRÙM CUỐI HẮC LONG XUẤT HIỆN! ⚠️';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 2500);
  },

  bindActionEvents: function() {
    const btnSkill = document.getElementById('battleBtnSkill');
    if (btnSkill) {
      btnSkill.onclick = () => {
        if (typeof GamificationSkills !== 'undefined') GamificationSkills.castCombatSkill(1);
        else this.useClassSkillInBattle();
      };
    }

    const btnSkill2 = document.getElementById('battleBtnSkill2');
    if (btnSkill2) {
      btnSkill2.onclick = () => {
        if (typeof GamificationSkills !== 'undefined') GamificationSkills.castCombatSkill(2);
      };
    }

    const btnHp = document.getElementById('battleBtnHpPotion');
    if (btnHp) btnHp.onclick = () => this.useHealthPotionInBattle();

    const btnMp = document.getElementById('battleBtnMpPotion');
    if (btnMp) btnMp.onclick = () => this.useManaPotionInBattle();
  },

  updateBattleUI: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const inv = user?.inventory || {};

    const hpCount = document.getElementById('battleHpPotionCount');
    if (hpCount) hpCount.innerText = inv.health_potion || 0;

    const mpCount = document.getElementById('battleMpPotionCount');
    if (mpCount) mpCount.innerText = inv.mana_potion || 0;

    // Cập nhật nhãn Skill 1 & Skill 2 từ GamificationSkills
    if (typeof GamificationSkills !== 'undefined' && user) {
      const cls = user.rpg_class || 'warrior';
      const cData = GamificationSkills.CLASS_SKILLS[cls] || GamificationSkills.CLASS_SKILLS.warrior;
      const s1 = cData.active_1;
      const s2 = cData.active_2;

      const skill1Label = document.getElementById('battleSkillLabel');
      if (skill1Label) {
        skill1Label.innerText = `${s1.icon} ${s1.name} (${s1.mp} MP) [1]`;
      }

      const skill2Label = document.getElementById('battleSkill2Label');
      if (skill2Label) {
        const isUnlocked2 = user.skills_unlocked?.active_2;
        skill2Label.innerText = isUnlocked2 
          ? `${s2.icon} ${s2.name} (${s2.mp} MP) [2]` 
          : `🔒 ${s2.name} [2]`;
      }
    } else {
      const skillLabel = document.getElementById('battleSkillLabel');
      if (skillLabel && user) {
        const cls = user.rpg_class || 'warrior';
        if (cls === 'mage') skillLabel.innerText = '✨ Hỏa Cầu (25 MP) [1]';
        else if (cls === 'ranger') skillLabel.innerText = '🏹 Mắt Đại Bàng (15 MP) [1]';
        else if (cls === 'assassin') skillLabel.innerText = '🥷 Đoạt Mệnh (20 MP) [1]';
        else skillLabel.innerText = '⚔️ Cuồng Trảm (20 MP) [1]';
      }
    }

    // Cập nhật thanh máu trên top bar nếu có
    const hudHp = document.getElementById('hudHeroHp');
    if (hudHp) hudHp.innerText = `${this.hero.hp}/${this.hero.maxHp}`;
    const hudMp = document.getElementById('hudHeroMp');
    if (hudMp) hudMp.innerText = `${this.hero.mp}/${this.hero.maxMp}`;
  }
};

// ==================== TỔNG HỢP ÂM THANH 8-BIT THUẦN TÚY (WEB AUDIO) ====================
const RetroAudio = {
  ctx: null,
  getCtx: function() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  playCoin: function() {
    try {
      const ctx = this.getCtx();
      [987.77, 1318.51].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch (e) {}
  },

  playFanfare: function() {
    try {
      const ctx = this.getCtx();
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (e) {}
  },

  playSlash: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  },

  playHit: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {}
  },

  playCritical: function() {
    try {
      const ctx = this.getCtx();
      [650, 950, 1300].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch (e) {}
  },

  playExplosion: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  },

  playMagic: function() {
    try {
      const ctx = this.getCtx();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (e) {}
  },

  playMonsterAttack: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  },

  playHeroHurt: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  },

  playPotion: function() {
    try {
      const ctx = this.getCtx();
      [320, 440, 580, 720].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      });
    } catch (e) {}
  },

  playBossAlert: function() {
    try {
      const ctx = this.getCtx();
      [200, 280, 200, 280].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch (e) {}
  },

  playVictory: function() {
    try {
      const ctx = this.getCtx();
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {}
  },

  playDefeat: function() {
    try {
      const ctx = this.getCtx();
      [360, 290, 220, 140].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch (e) {}
  }
};

function showDungeonVictory() {
  const tower = (typeof window !== 'undefined' && window.GamificationTower) || (typeof global !== 'undefined' && global.GamificationTower);
  if (tower && tower.activeMode === 'tower') {
    tower.onFloorCleared();
    return;
  }
  if (tower && tower.activeMode === 'boss_rush') {
    tower.onBossRushCleared();
    return;
  }
  if (typeof BattleEngine !== 'undefined' && BattleEngine.stopBattle) {
    BattleEngine.stopBattle();
  }
  if (typeof addXP === 'function') addXP(100, 'Chinh phục Dungeon');
  if (typeof addCoins === 'function') addCoins(35, 'Thưởng Rương Boss');
  const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : ((typeof global !== 'undefined' && global.currentRpgUser) ? global.currentRpgUser : null);
  if (user) {
    user.gems = (user.gems || 0) + 2;
    user.enhance_stones = (user.enhance_stones || 0) + 1;
    if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
  }
  const quests = (typeof window !== 'undefined' && window.GamificationQuests) || (typeof global !== 'undefined' && global.GamificationQuests) || (typeof GamificationQuests !== 'undefined' ? GamificationQuests : null);
  if (quests && typeof quests.trackProgress === 'function') {
    quests.trackProgress('dungeon_clear', 1);
  }
  const modal = (typeof document !== 'undefined') ? document.getElementById('battleVictoryModal') : null;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

if (typeof window !== 'undefined') {
  window.BattleEngine = BattleEngine;
  window.RetroAudio = RetroAudio;
  window.showDungeonVictory = showDungeonVictory;
  window.BIOME_ICONS = BattleEngine.biomeIcons;
  window.biomeIcons = BattleEngine.biomeIcons;
}
if (typeof global !== 'undefined') {
  global.BattleEngine = BattleEngine;
  global.RetroAudio = RetroAudio;
  global.showDungeonVictory = showDungeonVictory;
  global.BIOME_ICONS = BattleEngine.biomeIcons;
  global.biomeIcons = BattleEngine.biomeIcons;
}
