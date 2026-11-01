// ==================== ĐỘNG CƠ ĐẤU THEO LƯỢT PIXEL RPG (PIXEL BATTLE ARENA) ====================
// Module quản lý: Sân đấu HTML5 Canvas Pixel Art, Vẽ nhân vật & Quái vật thời gian thực,
// Hiệu ứng âm thanh 8-bit retro, Vòng lặp chiến đấu theo lượt, Tuyệt kỹ Class và Vật phẩm trợ chiến.

const BattleEngine = {
  canvas: null,
  ctx: null,
  animId: null,
  active: false,
  width: 800,
  height: 260,
  lastTime: 0,
  screenShake: 0,

  // Trạng thái nhân vật trong trận
  hero: {
    x: 120,
    y: 155,
    baseY: 155,
    hp: 100,
    maxHp: 100,
    mp: 40,
    maxMp: 40,
    state: 'idle', // idle, attacking, hurt, victory, dead
    animTimer: 0,
    lungeX: 0,
    flashRed: 0
  },

  // Trạng thái quái vật trong trận
  monster: {
    x: 640,
    y: 150,
    baseY: 150,
    hp: 100,
    maxHp: 100,
    name: 'Slime Xanh',
    type: 'slime',
    isBoss: false,
    state: 'idle', // idle, attacking, hurt, dying
    animTimer: 0,
    lungeX: 0,
    flashRed: 0,
    wave: 1,
    totalWaves: 10
  },

  // Hiệu ứng hạt (Particles) & Chữ số bay (Floating Texts)
  particles: [],
  floatingTexts: [],

  // Danh mục 10 quái vật theo tiến trình hầm ngục
  MONSTER_ROSTER: [
    { type: 'slime', name: 'Slime Nhầy Nhụa', baseHp: 40, color: '#38E54D', isBoss: false },
    { type: 'bat', name: 'Dơi Quỷ Hút Máu', baseHp: 50, color: '#8C43F6', isBoss: false },
    { type: 'skeleton', name: 'Bộ Xương Kiếm Sĩ', baseHp: 65, color: '#E2E8F0', isBoss: false },
    { type: 'goblin', name: 'Yêu Tinh Ranh Mãnh', baseHp: 80, color: '#169C64', isBoss: false },
    { type: 'wolf', name: 'Ma Sói Rừng Thẳm', baseHp: 95, color: '#64748B', isBoss: false },
    { type: 'golem', name: 'Người Đá Thạch Anh', baseHp: 115, color: '#D97706', isBoss: false },
    { type: 'dark_mage', name: 'Hắc Thuật Sư Sa Ngã', baseHp: 130, color: '#7C3AED', isBoss: false },
    { type: 'spider', name: 'Nhện Độc Khổng Lồ', baseHp: 145, color: '#DC2626', isBoss: false },
    { type: 'knight', name: 'Hắc Kỵ Sĩ Hầm Ngục', baseHp: 165, color: '#1E293B', isBoss: false },
    { type: 'dragon', name: 'TRÙM CUỐI: HẮC LONG MA VƯƠNG', baseHp: 240, color: '#EF4444', isBoss: true }
  ],

  // 1. KHỞI TẠO ĐẤU TRƯỜNG CANVAS
  init: function(canvasId = 'pixelBattleCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Tắt khử răng cưa để giữ nét Pixel sắc sảo

    // Thiết lập kích thước chuẩn HD Pixel
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bindActionEvents();
  },

  // Bắt đầu một trận đấu mới
  startBattle: function(totalWaves = 10) {
    if (!this.canvas) this.init();
    if (!this.ctx) return;

    this.active = true;
    this.particles = [];
    this.floatingTexts = [];

    // Lấy chỉ số từ hồ sơ người dùng
    const user = (typeof currentRpgUser !== 'undefined' && currentRpgUser) ? currentRpgUser : {
      hp: 120, max_hp: 120, mp: 50, max_mp: 50, rpg_class: 'warrior', display_name: 'Hiệp Sĩ Anki'
    };

    this.hero.hp = user.hp || 100;
    this.hero.maxHp = user.max_hp || 100;
    this.hero.mp = user.mp || 40;
    this.hero.maxMp = user.max_mp || 40;
    this.hero.state = 'idle';
    this.hero.lungeX = 0;
    this.hero.flashRed = 0;

    // Chuẩn bị quái vật đợt 1
    this.spawnMonster(1, totalWaves);

    // Bắt đầu vòng lặp vẽ 60 FPS
    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);

    this.updateBattleUI();
  },

  // Dừng đấu trường
  stopBattle: function() {
    this.active = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  },

  // Sinh quái vật theo đợt sóng (Wave)
  spawnMonster: function(waveNum, totalWaves) {
    const isFinalBoss = waveNum >= totalWaves;
    let template;

    if (isFinalBoss) {
      template = this.MONSTER_ROSTER[this.MONSTER_ROSTER.length - 1]; // Rồng Ma Vương
      this.triggerBossAlert();
    } else {
      const idx = Math.min(this.MONSTER_ROSTER.length - 2, Math.floor(((waveNum - 1) / (totalWaves - 1)) * (this.MONSTER_ROSTER.length - 1)));
      template = this.MONSTER_ROSTER[idx];
    }

    const scale = 1 + (waveNum * 0.08);
    const calculatedHp = Math.round(template.baseHp * scale);

    this.monster = {
      x: 640,
      y: 150,
      baseY: 150,
      hp: calculatedHp,
      maxHp: calculatedHp,
      name: template.name,
      type: template.type,
      color: template.color,
      isBoss: template.isBoss,
      state: 'idle',
      animTimer: 0,
      lungeX: 0,
      flashRed: 0,
      wave: waveNum,
      totalWaves: totalWaves
    };

    this.updateBattleUI();
  },

  // 2. VÒNG LẶP RENDER CHÍNH (60 FPS)
  loop: function(timestamp) {
    if (!this.active) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.loop);
  },

  update: function(dt) {
    // Rung màn hình khi có chém mạnh
    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Cập nhật hoạt ảnh Hiệp sĩ
    this.hero.animTimer += dt * 5;
    if (this.hero.flashRed > 0) this.hero.flashRed -= dt * 4;
    if (this.hero.state === 'attacking') {
      this.hero.lungeX += 600 * dt;
      if (this.hero.lungeX >= 160) {
        this.hero.state = 'retracting';
      }
    } else if (this.hero.state === 'retracting') {
      this.hero.lungeX -= 600 * dt;
      if (this.hero.lungeX <= 0) {
        this.hero.lungeX = 0;
        this.hero.state = 'idle';
      }
    }

    // Cập nhật hoạt ảnh Quái vật
    this.monster.animTimer += dt * 4;
    if (this.monster.flashRed > 0) this.monster.flashRed -= dt * 4;
    if (this.monster.state === 'attacking') {
      this.monster.lungeX -= 600 * dt;
      if (this.monster.lungeX <= -160) {
        this.monster.state = 'retracting';
      }
    } else if (this.monster.state === 'retracting') {
      this.monster.lungeX += 600 * dt;
      if (this.monster.lungeX >= 0) {
        this.monster.lungeX = 0;
        this.monster.state = 'idle';
      }
    }

    // Cập nhật hạt bụi, tia chém
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Cập nhật chữ số sát thương bay lên
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= ft.speed * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  },

  render: function() {
    const ctx = this.ctx;
    ctx.save();

    // Rung chấn màn hình
    if (this.screenShake > 0) {
      const dx = (Math.random() - 0.5) * this.screenShake * 8;
      const dy = (Math.random() - 0.5) * this.screenShake * 8;
      ctx.translate(dx, dy);
    }

    // 1. Vẽ bối cảnh Dungeon Retro (Tường đá, sàn lát gạch, đuốc lửa)
    this.drawDungeonBackground(ctx);

    // 2. Vẽ Hiệp sĩ
    this.drawHero(ctx);

    // 3. Vẽ Quái vật
    this.drawMonster(ctx);

    // 4. Vẽ hạt hiệu ứng (Sparks, Slashes, Gold)
    this.drawParticles(ctx);

    // 5. Vẽ Chữ số sát thương nổi
    this.drawFloatingTexts(ctx);

    // 6. Hiệu ứng quét dòng Scanlines Retro 16-bit
    this.drawScanlines(ctx);

    ctx.restore();
  },

  // 3. VẼ HÌNH HỌC PIXEL & BỐI CẢNH (PROCEDURAL PIXEL ART)
  drawDungeonBackground: function(ctx) {
    // Tường đá đen tím
    ctx.fillStyle = '#11131F';
    ctx.fillRect(0, 0, this.width, this.height);

    // Hàng gạch tường đá phía sau
    ctx.fillStyle = '#1D2136';
    for (let y = 0; y < 140; y += 20) {
      const offset = (y / 20) % 2 === 0 ? 0 : 25;
      for (let x = -offset; x < this.width; x += 50) {
        ctx.fillRect(x + 2, y + 2, 46, 16);
      }
    }

    // 2 Cây đuốc hai bên tường rực sáng
    this.drawTorch(ctx, 80, 50);
    this.drawTorch(ctx, 720, 50);

    // Sàn đá ngục tối
    ctx.fillStyle = '#171A29';
    ctx.fillRect(0, 140, this.width, this.height - 140);
    ctx.fillStyle = '#262A3F';
    ctx.fillRect(0, 140, this.width, 4);

    // Lưới gạch sàn có chiều sâu
    ctx.fillStyle = '#0F121C';
    for (let x = 0; x < this.width; x += 40) {
      ctx.fillRect(x, 144, 2, this.height - 144);
    }
    for (let y = 144; y < this.height; y += 24) {
      ctx.fillRect(0, y, this.width, 2);
    }
  },

  drawTorch: function(ctx, x, y) {
    // Giá đỡ đuốc gỗ
    ctx.fillStyle = '#854D0E';
    ctx.fillRect(x - 3, y, 6, 24);
    ctx.fillStyle = '#A16207';
    ctx.fillRect(x - 5, y - 4, 10, 6);

    // Ánh lửa nhảy múa
    const flicker = Math.sin(this.hero.animTimer * 2 + x) * 2;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x, y - 8 + flicker, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x, y - 8 + flicker, 4, 0, Math.PI * 2);
    ctx.fill();

    // Vùng sáng vàng lan tỏa
    const grad = ctx.createRadialGradient(x, y - 8, 2, x, y - 8, 45);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y - 8, 45, 0, Math.PI * 2);
    ctx.fill();
  },

  // 4. VẼ HIỆP SĨ (HERO PIXEL SPRITE)
  drawHero: function(ctx) {
    const h = this.hero;
    const userClass = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.rpg_class) ? currentRpgUser.rpg_class : 'warrior';
    const bob = Math.sin(h.animTimer) * 3;
    const x = h.x + h.lungeX;
    const y = h.baseY + (h.state === 'idle' ? bob : 0);

    ctx.save();
    ctx.translate(x, y);

    // Bóng đổ dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 32, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (h.flashRed > 0) {
      ctx.fillStyle = '#EF4444'; // Chớp đỏ khi bị quái đánh
    }

    // Vẽ theo hệ nhân vật riêng biệt
    if (userClass === 'mage') {
      this.drawMageSprite(ctx);
    } else if (userClass === 'ranger') {
      this.drawRangerSprite(ctx);
    } else if (userClass === 'assassin') {
      this.drawAssassinSprite(ctx);
    } else {
      this.drawWarriorSprite(ctx);
    }

    ctx.restore();

    // Vẽ thanh máu HP & MP trên đầu Hiệp sĩ
    this.drawHeroBars(ctx, x, y - 55);
  },

  drawWarriorSprite: function(ctx) {
    // Áo giáp & Khiên Hiệp Sĩ
    ctx.fillStyle = '#CBD5E1'; // Giáp bạc
    ctx.fillRect(-10, -10, 20, 24);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-8, 14, 7, 18); // Chân trái
    ctx.fillRect(1, 14, 7, 18);  // Chân phải

    // Mũ sắt hiệp sĩ
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-9, -28, 18, 18);
    ctx.fillStyle = '#F59E0B'; // Mào mũ hoàng kim
    ctx.fillRect(-3, -34, 6, 7);
    ctx.fillStyle = '#0F172A'; // Khe mắt
    ctx.fillRect(-5, -20, 10, 4);

    // Kiếm sáng chém quái
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(12, -26, 4, 30);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(10, -28, 8, 3);
    ctx.fillStyle = '#D97706'; // Chuôi kiếm
    ctx.fillRect(8, 4, 12, 4);

    // Khiên thép
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(-18, -4, 8, 18);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-16, 2, 4, 6);
  },

  drawMageSprite: function(ctx) {
    // Áo choàng Pháp sư tím
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-14, 32);
    ctx.lineTo(14, 32);
    ctx.closePath();
    ctx.fill();

    // Nón chóp phù thủy
    ctx.fillStyle = '#5B21B6';
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(-14, -14);
    ctx.lineTo(14, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-16, -14, 32, 4); // Vành nón

    // Khuôn mặt
    ctx.fillStyle = '#FED7AA';
    ctx.fillRect(-7, -12, 14, 10);
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(-4, -8, 3, 3);
    ctx.fillRect(2, -8, 3, 3);

    // Gậy ma thuật phát sáng
    ctx.fillStyle = '#854D0E';
    ctx.fillRect(14, -18, 4, 46);
    ctx.fillStyle = '#38BDF8'; // Quả cầu pha lê
    ctx.beginPath();
    ctx.arc(16, -22, 7, 0, Math.PI * 2);
    ctx.fill();
  },

  drawRangerSprite: function(ctx) {
    // Áo thợ săn rừng xanh
    ctx.fillStyle = '#15803D';
    ctx.fillRect(-10, -8, 20, 22);
    ctx.fillStyle = '#854D0E';
    ctx.fillRect(-8, 14, 7, 18);
    ctx.fillRect(1, 14, 7, 18);

    // Mũ thợ săn & lông vũ
    ctx.fillStyle = '#166534';
    ctx.fillRect(-9, -24, 18, 16);
    ctx.fillStyle = '#EF4444'; // Lông vũ đỏ
    ctx.fillRect(-13, -32, 5, 12);

    // Cung tên gỗ
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(16, 2, 16, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Dây cung
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, -14);
    ctx.lineTo(16, 18);
    ctx.stroke();
  },

  drawAssassinSprite: function(ctx) {
    // Trang phục Ninja Hắc Ám
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-10, -8, 20, 22);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, 14, 7, 18);
    ctx.fillRect(1, 14, 7, 18);

    // Khăn trùm đầu Ninja
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-9, -24, 18, 16);
    ctx.fillStyle = '#EF4444'; // Khăn quàng đỏ bay phấp phới
    ctx.fillRect(-16, -4, 8, 16);

    // Đôi mắt sắc lẹm
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-5, -16, 10, 3);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-3, -16, 2, 2);
    ctx.fillRect(2, -16, 2, 2);

    // Song đoản đao sắc bén
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(12, -4, 14, 3);
    ctx.fillRect(-22, 6, 12, 3);
  },

  drawHeroBars: function(ctx, x, y) {
    const h = this.hero;
    const hpPct = Math.max(0, Math.min(1, h.hp / h.maxHp));
    const mpPct = Math.max(0, Math.min(1, h.mp / h.maxMp));

    // Khung thanh máu
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 38, y, 76, 8);
    ctx.fillStyle = '#DC2626'; // Nền máu đỏ
    ctx.fillRect(x - 36, y + 1, 72 * hpPct, 6);

    // Khung thanh MP xanh lam
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 38, y + 9, 76, 5);
    ctx.fillStyle = '#2563EB'; // MP xanh
    ctx.fillRect(x - 36, y + 10, 72 * mpPct, 3);

    // Tên & Chỉ số
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`${h.hp}/${h.maxHp} HP`, x, y - 3);
  },

  // 5. VẼ QUÁI VẬT PIXEL (MONSTER PIXEL SPRITE)
  drawMonster: function(ctx) {
    const m = this.monster;
    const floatBob = Math.sin(m.animTimer) * 4;
    const x = m.x + m.lungeX;
    const y = m.baseY + floatBob;

    ctx.save();
    ctx.translate(x, y);

    // Bóng quái vật
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    const shadowR = m.isBoss ? 42 : 24;
    ctx.ellipse(0, m.isBoss ? 45 : 30, shadowR, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.flashRed > 0) {
      ctx.fillStyle = '#FFFFFF'; // Chớp trắng/đỏ khi trúng đòn
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
    this.drawMonsterBar(ctx, x, y - (m.isBoss ? 75 : 55));
  },

  drawSlimeSprite: function(ctx, color) {
    ctx.fillStyle = color || '#22C55E';
    // Khối thạch nhầy nhụa
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mắt tròn xoe
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, 6, 5, 0, Math.PI * 2);
    ctx.arc(8, 6, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-7, 6, 2.5, 0, Math.PI * 2);
    ctx.arc(7, 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBatSprite: function(ctx) {
    ctx.fillStyle = '#6B21A8';
    // Thân dơi
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cánh đập phành phạch
    const wingAngle = Math.sin(this.monster.animTimer * 2) * 12;
    ctx.fillStyle = '#4C1D95';
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(-32, -18 + wingAngle);
    ctx.lineTo(-24, 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(32, -18 + wingAngle);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.fill();

    // Mắt đỏ ma quái
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-5, -3, 3, 3);
    ctx.fillRect(2, -3, 3, 3);
  },

  drawSkeletonSprite: function(ctx) {
    ctx.fillStyle = '#E2E8F0';
    // Xương sọ
    ctx.fillRect(-10, -26, 20, 18);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, -18, 4, 5); // Mắt trái
    ctx.fillRect(2, -18, 4, 5);  // Mắt phải
    ctx.fillRect(-3, -11, 6, 3);  // Răng

    // Khung xương sườn
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-8, -6, 16, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, -2, 12, 3);
    ctx.fillRect(-6, 4, 12, 3);

    // Chân & Kiếm rỉ sét
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-6, 14, 4, 16);
    ctx.fillRect(2, 14, 4, 16);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-18, -12, 4, 26);
  },

  drawGolemSprite: function(ctx) {
    // Khối đá thạch anh to bè
    ctx.fillStyle = '#78716C';
    ctx.fillRect(-22, -16, 44, 42);
    ctx.fillStyle = '#44403C';
    ctx.fillRect(-16, 26, 12, 14);
    ctx.fillRect(4, 26, 12, 14);

    // Đầu đá
    ctx.fillStyle = '#A8A29E';
    ctx.fillRect(-14, -34, 28, 18);

    // Lõi năng lượng phát sáng
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 4, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-8, -26, 5, 4);
    ctx.fillRect(3, -26, 5, 4);
  },

  drawDragonBoss: function(ctx) {
    // Thân rồng khổng lồ
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.ellipse(0, 4, 38, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đôi cánh rồng ác quỷ
    const wingFlap = Math.sin(this.monster.animTimer) * 8;
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.lineTo(-58, -48 + wingFlap);
    ctx.lineTo(-44, 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, -12);
    ctx.lineTo(58, -48 + wingFlap);
    ctx.lineTo(44, 12);
    ctx.closePath();
    ctx.fill();

    // Đầu rồng & Sừng hắc ám
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(-18, -40, 36, 26);
    ctx.fillStyle = '#1C1917'; // Cặp sừng dài
    ctx.fillRect(-24, -58, 6, 20);
    ctx.fillRect(18, -58, 6, 20);

    // Mắt rực lửa & Lỗ mũi khè khói
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-12, -32, 6, 4);
    ctx.fillRect(6, -32, 6, 4);

    // Lửa khè nhẹ ở mồm
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(-22, -18, 5 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawMonsterBar: function(ctx, x, y) {
    const m = this.monster;
    const pct = Math.max(0, Math.min(1, m.hp / m.maxHp));
    const width = m.isBoss ? 120 : 80;

    // Khung thanh máu quái
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - (width / 2) - 2, y, width + 4, 8);
    ctx.fillStyle = m.isBoss ? '#DC2626' : '#EAB308';
    ctx.fillRect(x - (width / 2), y + 1, width * pct, 6);

    // Nhãn tên quái & Đợt Wave
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = m.isBoss ? '#FCA5A5' : '#FEF08A';
    ctx.textAlign = 'center';
    ctx.fillText(m.isBoss ? `⚠️ BOSS: ${m.name}` : `[WAVE ${m.wave}/${m.totalWaves}] ${m.name}`, x, y - 4);
  },

  // 6. HẠT CHIẾN ĐẤU & CHỮ SỐ NỔI (COMBAT FX)
  drawParticles: function(ctx) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  },

  drawFloatingTexts: function(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.font = ft.font || 'bold 14px "Space Grotesk", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
  },

  drawScanlines: function(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < this.height; y += 4) {
      ctx.fillRect(0, y, this.width, 2);
    }
  },

  addSlashEffect: function(targetX, targetY, isCrit = false) {
    this.screenShake = isCrit ? 1.4 : 0.6;
    const count = isCrit ? 35 : 18;
    const colors = isCrit ? ['#EF4444', '#F59E0B', '#FDE047', '#FFFFFF'] : ['#38BDF8', '#818CF8', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240;
      this.particles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isCrit ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
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
      speed: isCrit ? 65 : 45,
      life: 1.1,
      font: isCrit ? '800 18px "Space Grotesk", sans-serif' : 'bold 13px monospace'
    });
  },

  // 7. XỬ LÝ LƯỢT ĐẤU (TURN-BASED COMBAT ACTIONS)
  // Được gọi trực tiếp từ quiz.js khi người dùng chọn đáp án!
  handlePlayerAnswer: function(isCorrect, wordObj, comboStreak = 0) {
    if (!this.active) return;

    if (isCorrect) {
      // HIỆP SĨ TẤN CÔNG QUÁI VẬT!
      this.hero.state = 'attacking';
      RetroAudio.playSlash();

      setTimeout(() => {
        const isCrit = comboStreak >= 3;
        let baseDmg = 35 + Math.floor(Math.random() * 15);

        // Nội tại Pháp sư với từ vựng C1-C2
        const userClass = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.rpg_class) ? currentRpgUser.rpg_class : 'warrior';
        if (userClass === 'mage' && wordObj?.level === 'advanced') {
          baseDmg = Math.round(baseDmg * 1.8);
          this.addFloatDamage(this.monster.x, this.monster.y - 30, '⚡ MA PHÁP C1-C2 x1.8!', '#8C43F6', true);
        }

        const finalDmg = isCrit ? Math.round(baseDmg * 1.6) : baseDmg;
        this.monster.hp = Math.max(0, this.monster.hp - finalDmg);
        this.monster.flashRed = 0.3;

        this.addSlashEffect(this.monster.x, this.monster.y, isCrit);
        this.addFloatDamage(this.monster.x, this.monster.y, (isCrit ? '💥 CRITICAL! -' : '-') + finalDmg, isCrit ? '#EF4444' : '#F59E0B', isCrit);

        if (isCrit) RetroAudio.playCritical();
        else RetroAudio.playHit();

        // Kiểm tra nếu quái vật bị hạ gục
        if (this.monster.hp <= 0) {
          this.onMonsterDefeated();
        }

        this.updateBattleUI();
      }, 200);

    } else {
      // ĐÒN TẤN CÔNG BỊ HỤT (MISS), QUÁI VẬT PHẢN ĐÒN!
      this.addFloatDamage(this.hero.x, this.hero.y - 20, 'MISS!', '#94A3B8', false);

      setTimeout(() => {
        this.monster.state = 'attacking';
        RetroAudio.playMonsterAttack();

        setTimeout(() => {
          const monsterDmg = this.monster.isBoss ? 35 : (15 + Math.floor(Math.random() * 10));
          this.hero.hp = Math.max(0, this.hero.hp - monsterDmg);
          this.hero.flashRed = 0.4;
          this.screenShake = 1.0;

          RetroAudio.playHeroHurt();
          this.addSlashEffect(this.hero.x, this.hero.y, false);
          this.addFloatDamage(this.hero.x, this.hero.y, `PHẢN ĐÒN! -${monsterDmg} HP`, '#EF4444', true);

          // Cập nhật vào hồ sơ RPG
          if (typeof currentRpgUser !== 'undefined' && currentRpgUser) {
            currentRpgUser.hp = this.hero.hp;
            if (typeof saveCurrentRpgUser === 'function') saveCurrentRpgUser();
          }

          // Kiểm tra nếu Hiệp sĩ hết máu
          if (this.hero.hp <= 0) {
            this.onHeroFallen();
          }

          this.updateBattleUI();
        }, 220);
      }, 350);
    }
  },

  onMonsterDefeated: function() {
    RetroAudio.playVictory();
    this.addFloatDamage(this.monster.x, this.monster.y - 40, '🏆 QUÁI VẬT BỊ TIÊU DIỆT!', '#10B981', true);

    // Rơi vàng lấp lánh
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: this.monster.x,
        y: this.monster.y,
        vx: (Math.random() - 0.5) * 180,
        vy: -80 - Math.random() * 120,
        size: 3,
        color: '#FACC15',
        life: 0.8
      });
    }

    if (typeof addCoins === 'function') addCoins(5, 'Thưởng diệt quái');
  },

  onHeroFallen: function() {
    this.hero.state = 'dead';
    RetroAudio.playDefeat();
    this.addFloatDamage(this.hero.x, this.hero.y - 30, '💀 HIỆP SĨ ĐÃ GỤC NGÃ!', '#DC2626', true);

    // Mở popup cho phép dùng bình máu hồi sinh ngay
    setTimeout(() => {
      const canRevive = (typeof currentRpgUser !== 'undefined' && currentRpgUser?.inventory?.health_potion > 0);
      if (canRevive && confirm('❤️ Hiệp sĩ đã hết máu! Bạn có muốn dùng 1 Bình Máu Siêu Cấp để hồi phục +50 HP và tiếp tục chiến đấu?')) {
        this.useHealthPotionInBattle();
      } else {
        alert('Trận chiến kết thúc! Hãy về Tiệm Rèn & Dược Phẩm để trang bị thêm Bình Máu cho các thử thách sau nhé.');
      }
    }, 600);
  },

  // 8. KỸ NĂNG CLASS & VẬT PHẨM TRỰC TIẾP
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
    this.addSlashEffect(this.monster.x, this.monster.y, true);

    if (user.rpg_class === 'mage') {
      // Pháp sư: Triệt tiêu 2 đáp án sai
      if (typeof useHintScrollInQuiz === 'function') useHintScrollInQuiz(true);
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '✨ HỎA CẦU DIỆT ĐÁP ÁN SAI!', '#7C3AED', true);
    } else if (user.rpg_class === 'ranger') {
      // Xạ thủ: Mắt đại bàng chỉ điểm đáp án
      this.highlightCorrectAnswer();
      this.addFloatDamage(this.hero.x, this.hero.y - 20, '🏹 MẮT ĐẠI BÀNG CHỈ ĐIỂM!', '#16A34A', true);
    } else if (user.rpg_class === 'assassin') {
      // Sát thủ: Đoạt mệnh gây dame và cướp vàng
      const dmg = 45;
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      if (typeof addCoins === 'function') addCoins(15, 'Kỹ năng trộm vàng');
      this.addFloatDamage(this.monster.x, this.monster.y, `🥷 ĐOẠT MỆNH! -${dmg} & +15 🪙`, '#EF4444', true);
    } else {
      // Chiến binh: Cuồng phong trảm x2 sát thương tức thì
      const dmg = 60;
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      this.addFloatDamage(this.monster.x, this.monster.y, `⚔️ CUỒNG PHONG TRẢM! -${dmg}`, '#DC2626', true);
    }

    this.updateBattleUI();
  },

  useHealthPotionInBattle: function() {
    const user = (typeof currentRpgUser !== 'undefined') ? currentRpgUser : null;
    const count = user?.inventory?.health_potion || 0;
    if (count <= 0) {
      alert('Túi đồ của bạn đã hết Bình Máu! Hãy vào Tiệm Dược Phẩm [Tab Cửa Hàng] để mua thêm nhé.');
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
      alert('Túi đồ của bạn đã hết Bình MP!');
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
    this.screenShake = 1.8;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-1/3 left-1/2 -translate-x-1/2 z-50 bg-red-600 border-4 border-[#111] text-white px-6 py-4 font-display font-extrabold text-xl uppercase tracking-wider shadow-[6px_6px_0px_#111] animate-bounce';
    alertDiv.innerHTML = '⚠️ CẢNH BÁO: TRÙM CUỐI HẮC LONG XUẤT HIỆN! ⚠️';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 2500);
  },

  // 9. ĐỒNG BỘ NÚT VÀ GIAO DIỆN PHÍA DƯỚI CANVAS
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
  }
};

// ==================== TỔNG HỢP ÂM THANH 8-BIT THUẦN TÚY (WEB AUDIO) ====================
// Không dùng file MP3 tải ngoài, chạy siêu tốc không có độ trễ trên mọi thiết bị!
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
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  },

  playHit: function() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  },

  playCritical: function() {
    try {
      const ctx = this.getCtx();
      [600, 900, 1200].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
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
        gain.gain.setValueAtTime(0.18, t);
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
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
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
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
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
      [300, 420, 560, 700].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
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
      [180, 260, 180, 260].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
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

  playVictory: function() {
    try {
      const ctx = this.getCtx();
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
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
      [350, 280, 220, 150].forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch (e) {}
  }
};
