// ==================== ĐỘNG CƠ ĐẤU THEO LƯỢT PIXEL RPG NÂNG CẤP (ADVANCED PIXEL BATTLE ENGINE) ====================
// Thiết kế chuyên biệt cho battle.html: Đồ họa Canvas Pixel Art mượt mà,
// Hoạt ảnh vung kiếm/bắn tên/phóng phép, Vết chém xé gió, Quái vật nổ tung khi chết,
// Thanh máu trễ (Ghost Bar) chuẩn game đối kháng, và Âm thanh 8-bit bùng nổ.

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

  spawnMonster: function(waveNum, totalWaves) {
    const bossPhaseTurns = Math.min(4, Math.max(3, Math.floor(totalWaves * 0.3))); // Ví dụ: 3 lượt cho 10 câu, 4 lượt cho 15 câu
    const bossStartWave = Math.max(2, totalWaves - bossPhaseTurns + 1); // Bắt đầu chạm trán Boss từ wave này
    const isBossPhase = waveNum >= bossStartWave;

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

      // Lần đầu triệu hồi Trùm Cuối Hắc Long!
      const template = this.MONSTER_ROSTER[this.MONSTER_ROSTER.length - 1];
      this.triggerBossAlert();

      // Cân bằng máu Trùm Cuối: Tính toán dựa trên lực chiến thực tế của Hiệp Sĩ
      const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
      const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 40 };
      const playerAtk = Math.max(35, stats.atk || 40);
      const expectedHit = playerAtk * 1.15;
      
      // Máu Boss đủ dày để cần 3-4 cú đánh chuẩn xác liên tiếp, KHÔNG BAO GIỜ BỊ 1-SHOT!
      const calculatedHp = Math.round(expectedHit * (bossPhaseTurns * 1.15) + (waveNum * 30));

      this.monster = {
        x: 650,
        y: 150,
        baseY: 150,
        hp: calculatedHp,
        maxHp: calculatedHp,
        ghostHp: calculatedHp,
        name: template.name,
        type: 'dragon',
        color: template.color,
        isBoss: true,
        state: 'spawn',
        animTimer: 0,
        lungeX: 0,
        flashWhite: 0.8,
        wave: waveNum,
        totalWaves: totalWaves,
        deathTimer: 0,
        scale: 1.45,
        enraged: false
      };

      // Hiệu ứng triệu hồi rồng ma quái chấn động
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: this.monster.x + (Math.random() - 0.5) * 60,
          y: this.monster.y + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 140,
          vy: -80 - Math.random() * 90,
          size: 4,
          color: i % 2 === 0 ? '#EF4444' : '#F59E0B',
          life: 0.8
        });
      }

      setTimeout(() => {
        if (this.monster.state === 'spawn') this.monster.state = 'idle';
      }, 500);

      this.updateBattleUI();
      return;
    }

    // 2. CÁC ẢI QUÁI THƯỜNG TRƯỚC TRÙM CUỐI (WAVE 1 ĐẾN WAVE N-3)
    const idx = Math.min(this.MONSTER_ROSTER.length - 2, Math.floor(((waveNum - 1) / Math.max(1, bossStartWave - 1)) * (this.MONSTER_ROSTER.length - 2)));
    const template = this.MONSTER_ROSTER[idx];

    // Quái thường được cân bằng để chết gọn trong 1 đòn đánh chính xác, tạo nhịp độ càn quét đã tay!
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
      name: template.name,
      type: template.type,
      color: template.color,
      isBoss: false,
      state: 'spawn',
      animTimer: 0,
      lungeX: 0,
      flashWhite: 0.5,
      wave: waveNum,
      totalWaves: totalWaves,
      deathTimer: 0,
      scale: 1.0,
      enraged: false
    };

    // Hiệu ứng hạt xuất hiện quái vật
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.monster.x + (Math.random() - 0.5) * 40,
        y: this.monster.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 80,
        vy: -40 - Math.random() * 60,
        size: 3,
        color: template.color,
        life: 0.6
      });
    }

    setTimeout(() => {
      if (this.monster.state === 'spawn') this.monster.state = 'idle';
    }, 400);

    this.updateBattleUI();
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
    this.monster.animTimer += dt * 5;
    if (this.monster.flashWhite > 0) this.monster.flashWhite -= dt * 4;

    if (this.monster.state === 'attacking') {
      this.monster.lungeX -= 1100 * dt;
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

  // ==================== BỐI CẢNH DUNGEON SỐNG ĐỘNG ====================
  drawEpicDungeon: function(ctx) {
    // Tường vòm đá tối
    ctx.fillStyle = '#0B0D17';
    ctx.fillRect(0, 0, this.width, this.height);

    // Hàng gạch rêu phong
    ctx.fillStyle = '#16192B';
    for (let y = 0; y < 140; y += 22) {
      const offset = (y / 22) % 2 === 0 ? 0 : 28;
      for (let x = -offset; x < this.width; x += 56) {
        ctx.fillRect(x + 2, y + 2, 52, 18);
        ctx.fillStyle = '#22263D';
        ctx.fillRect(x + 2, y + 2, 52, 2); // Viền gạch trên
        ctx.fillStyle = '#16192B';
      }
    }

    // Cột trụ đá hai bên đấu trường
    this.drawStonePillar(ctx, 30);
    this.drawStonePillar(ctx, 740);

    // 2 Ngọn đuốc rực sáng bập bùng
    this.drawTorch(ctx, 130, 48);
    this.drawTorch(ctx, 670, 48);

    // Biểu tượng Dungeon ngục tối ở giữa
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.arc(this.width / 2, 70, 36, 0, Math.PI * 2);
    ctx.fill();

    // Sàn đá ngục tối với hiệu ứng bóng gương
    ctx.fillStyle = '#121422';
    ctx.fillRect(0, 140, this.width, this.height - 140);
    ctx.fillStyle = '#FF9F1C'; // Chỉ kẻ vàng ranh giới đấu trường
    ctx.fillRect(0, 140, this.width, 3);

    // Lưới phối cảnh sàn đấu
    ctx.fillStyle = '#1B1E33';
    for (let x = 0; x < this.width; x += 40) {
      ctx.fillRect(x, 143, 2, this.height - 143);
    }
    for (let y = 143; y < this.height; y += 24) {
      ctx.fillRect(0, y, this.width, 2);
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
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    if (m.type === 'dragon') {
      this.drawDragonBoss(ctx);
    } else if (m.type === 'golem') {
      this.drawGolemSprite(ctx);
    } else if (m.type === 'skeleton') {
      this.drawSkeletonSprite(ctx);
    } else if (m.type === 'bat') {
      this.drawBatSprite(ctx);
    } else {
      this.drawSlimeSprite(ctx, m.color);
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

      setTimeout(() => {
        this.monster.state = 'attacking';
        RetroAudio.playMonsterAttack();
      }, 400);
    }
  },

  onHeroStrikeConnect: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { atk: 35, crit: 5 };

    const isCrit = (this.pendingStreak >= 3) || (Math.random() * 100 < (stats.crit || 5));
    let baseDmg = (stats.atk || 35) + Math.floor(Math.random() * 15);

    const userClass = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.rpg_class) ? currentRpgUser.rpg_class : 'warrior';
    if (userClass === 'mage' && this.pendingWord?.level === 'advanced') {
      baseDmg = Math.round(baseDmg * 1.8);
      this.addFloatDamage(this.monster.x, this.monster.y - 35, '⚡ MA PHÁP C1-C2 x1.8!', '#8C43F6', true);
    }

    const finalDmg = isCrit ? Math.round(baseDmg * 1.8) : baseDmg;
    this.monster.hp = Math.max(0, this.monster.hp - finalDmg);
    this.monster.flashWhite = 0.4;
    this.screenShake = isCrit ? 1.5 : 0.7;

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

    // KIỂM TRA NẾU QUÁI HẾT MÁU -> NỔ TUNG PIXEL SHATTER!
    if (this.monster.isBoss) {
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
      } else {
        // Trùm còn máu -> Kích hoạt phản ứng Boss
        if (this.monster.hp <= this.monster.maxHp * 0.5 && !this.monster.enraged) {
          this.monster.enraged = true;
          this.addFloatDamage(this.monster.x, this.monster.y - 35, '🔥 HẮC LONG CUỒNG NỘ (ENRAGED)!', '#EF4444', true);
          this.screenShake = 2.0;
        } else {
          this.addFloatDamage(this.monster.x, this.monster.y - 35, '🐉 RỒNG GẦM RÚ TÁC CHIẾN!', '#F59E0B', false);
        }
        if (typeof window.onBossTurnComplete === 'function') {
          window.onBossTurnComplete();
        }
      }
    } else {
      if (this.monster.hp <= 0) {
        this.triggerMonsterDeathExplosion();
      }
    }

    this.updateBattleUI();
  },

  onMonsterStrikeConnect: function() {
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : null;
    const stats = (typeof calculatePlayerTotalStats === 'function') ? calculatePlayerTotalStats(user) : { dodge: 5 };

    // 1. Kiểm tra Né Đòn (Dodge)
    if (Math.random() * 100 < (stats.dodge || 5)) {
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '💨 NÉ ĐÒN THẦN SẦU (DODGE)!', '#38BDF8', true);
      this.hero.state = 'idle';
      this.updateBattleUI();
      return;
    }

    // 2. Kiểm tra Bùa Khiên Hộ Mệnh (Shield Charm)
    if (user?.inventory?.shield_charm > 0) {
      user.inventory.shield_charm--;
      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '🛡️ KHIÊN HỘ MỆNH CHẶN ĐÒN!', '#F59E0B', true);
      RetroAudio.playHit();
      this.hero.state = 'idle';
      this.updateBattleUI();
      return;
    }

    const monsterDmg = this.monster.isBoss ? (32 + Math.floor(Math.random() * 12)) : (15 + Math.floor(Math.random() * 10));
    this.hero.hp = Math.max(0, this.hero.hp - monsterDmg);
    this.hero.flashWhite = 0.4;
    this.screenShake = this.monster.isBoss ? 2.0 : 1.2;

    RetroAudio.playHeroHurt();
    this.createHitSparks(this.hero.x, this.hero.y, this.monster.isBoss);
    const hitLabel = this.monster.isBoss ? `🔥 HẮC LONG PHUN LỬA! -${monsterDmg} HP` : `PHẢN ĐÒN! -${monsterDmg} HP`;
    this.addFloatDamage(this.hero.x, this.hero.y - 20, hitLabel, '#EF4444', true);

    if (typeof currentRpgUser !== 'undefined' && currentRpgUser) {
      currentRpgUser.hp = this.hero.hp;
      if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
    }

    if (this.hero.hp <= 0) {
      this.onHeroFallen();
    }

    this.updateBattleUI();
  },

  // ==================== QUÁI VẬT BỊ TIÊU DIỆT: NỔ TUNG PIXEL ====================
  triggerMonsterDeathExplosion: function() {
    this.monster.state = 'dying';
    this.monster.deathTimer = 0;
    this.screenShake = 1.8;
    RetroAudio.playExplosion();

    this.addFloatDamage(this.monster.x, this.monster.y - 45, '🏆 QUÁI VẬT BỊ TIÊU DIỆT!', '#10B981', true);

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
    if (btnSkill) btnSkill.onclick = () => this.useClassSkillInBattle();

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

    const skillLabel = document.getElementById('battleSkillLabel');
    if (skillLabel && user) {
      const cls = user.rpg_class || 'warrior';
      if (cls === 'mage') skillLabel.innerText = '✨ Hỏa Cầu (25 MP)';
      else if (cls === 'ranger') skillLabel.innerText = '🏹 Mắt Đại Bàng (15 MP)';
      else if (cls === 'assassin') skillLabel.innerText = '🥷 Đoạt Mệnh (20 MP)';
      else skillLabel.innerText = '⚔️ Cuồng Trảm (20 MP)';
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
