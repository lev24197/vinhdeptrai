// ==================== KHO DỮ LIỆU GẦN 100 TRANG BỊ PIXEL RPG ====================
// Phân bố: 24 Vũ Khí, 16 Mũ, 18 Áo Giáp, 14 Găng Tay, 14 Giày, 16 Phụ Kiện (Tổng 102 Món)

const RPG_TIERS = {
  common:    { name: 'Thường',       color: '#94A3B8', border: '#64748B', bg: '#F1F5F9', multiplier: 1.0 },
  uncommon:  { name: 'Tinh Luyện',   color: '#16A34A', border: '#15803D', bg: '#DCFCE7', multiplier: 1.25 },
  rare:      { name: 'Quý Hiếm',     color: '#2563EB', border: '#1D4ED8', bg: '#DBEAFE', multiplier: 1.6 },
  epic:      { name: 'Sử Thi',       color: '#9333EA', border: '#7E22CE', bg: '#F3E8FF', multiplier: 2.2 },
  legendary: { name: 'Huyền Thoại',  color: '#D97706', border: '#B45309', bg: '#FEF3C7', multiplier: 3.2 }
};

const RPG_SET_BONUSES = {
  oxford: {
    name: 'Bộ Học Giả Oxford',
    icon: '🎓',
    color: '#3B82F6',
    desc2: 'Combo 2 món: +25% EXP khi học từ vựng C1-C2',
    desc4: 'Combo 4 món: Bác Học — Giảm 25% MP tiêu hao & Tự động loại 1 đáp án sai ở từ khó',
    pieces: ['wp_m_codex', 'hm_oxford_cap', 'ar_oxford_robe', 'gl_oxford_scribe', 'ac_oxford_medal']
  },
  dragon: {
    name: 'Bộ Hỏa Long Bá Vương',
    icon: '🐉',
    color: '#EF4444',
    desc2: 'Combo 2 món: Đòn đánh thiêu đốt quái rút 8% HP mỗi giây',
    desc4: 'Combo 4 món: Hỏa Long Phẫn Nộ — Chuỗi Streak 3+ phóng tia lửa gây x2.2 sát thương',
    pieces: ['wp_w_blood', 'hm_dragon_crown', 'ar_dragon_scale', 'gl_dragon_fists', 'bt_dragon_stompers', 'ac_dragon_heart']
  },
  chrono: {
    name: 'Bộ Thời Không Thần Tốc',
    icon: '⚡',
    color: '#F59E0B',
    desc2: 'Combo 2 món: Trả lời đúng dưới 2.5s được x1.5 điểm và +50% Vàng',
    desc4: 'Combo 4 món: Ngưng Đọng Thời Gian — 100% Bạo Kích x2.5 khi phản xạ cực nhanh',
    pieces: ['wp_w_vocab', 'bt_wind_striders', 'gl_swift_striker', 'bt_anki_chronos', 'ac_exp_hourglass']
  },
  shadow: {
    name: 'Bộ Hắc Ám Dạ Xoa',
    icon: '🥷',
    color: '#8B5CF6',
    desc2: 'Combo 2 món: +15% Tỷ lệ Né Tránh khi lỡ chọn sai',
    desc4: 'Combo 4 món: Ảo Ảnh Vô Hình — Diệt quái hồi 25 HP và tàng hình lướt kiếm',
    pieces: ['wp_a_shadow', 'hm_shadow_mask', 'ar_shadow_garb', 'gl_shadow_claws', 'bt_stealth_treads', 'ac_shadow_locket']
  },
  anki_god: {
    name: 'Bộ Thần Binh Tối Thượng Anki',
    icon: '👑',
    color: '#F59E0B',
    desc2: 'Combo 2 món: +30% Sát thương toàn hệ phái & +150 HP tối đa',
    desc4: 'Combo 4 món: Toàn Tri Toàn Năng — Miễn nhiễm 1 lần chọn sai mỗi ải + Hào quang sét hoàng kim',
    pieces: ['wp_w_excalibur', 'hm_anki_god_crown', 'ar_anki_aegis', 'gl_infinity_touch', 'ac_anki_infinity_core']
  }
};

const RPG_EQUIPMENT_CATALOG = [
  // ==================== 1. VŨ KHÍ CHIẾN BINH (WARRIOR SWORDS) ====================
  {
    id: 'wp_w_wood',
    name: 'Kiếm Gỗ Tập Sự',
    slot: 'weapon', reqClass: 'warrior', tier: 'common',
    cost: 50, sellPrice: 20, salvageDust: 5,
    stats: { atk: 8, hp: 10, mp: 0, crit: 2, dodge: 0, expBonus: 0, goldBonus: 2 },
    desc: 'Thanh kiếm gỗ dùng cho tân binh rèn luyện phản xạ từ vựng cơ bản.',
    visual: { weaponType: 'sword', bladeColor: '#A16207', bladeLength: 22, glowColor: null, particle: null }
  },
  {
    id: 'wp_w_iron',
    name: 'Thiết Kiếm Rèn Thô',
    slot: 'weapon', reqClass: 'warrior', tier: 'uncommon',
    cost: 150, sellPrice: 65, salvageDust: 15,
    stats: { atk: 18, hp: 25, mp: 0, crit: 5, dodge: 0, expBonus: 0, goldBonus: 5 },
    desc: 'Được rèn từ quặng sắt sông băng, mũi kiếm sắc bén gia tăng sát thương chém quái.',
    visual: { weaponType: 'sword', bladeColor: '#CBD5E1', bladeLength: 26, glowColor: '#94A3B8', particle: null }
  },
  {
    id: 'wp_w_blood',
    name: 'Huyết Kiếm Cuồng Nộ',
    slot: 'weapon', reqClass: 'warrior', tier: 'rare', setKey: 'dragon',
    cost: 400, sellPrice: 180, salvageDust: 40,
    stats: { atk: 34, hp: 45, mp: 0, crit: 10, dodge: 0, expBonus: 5, goldBonus: 8 },
    passive: { type: 'vampiric', val: 5, label: 'Hút Máu: Hồi 5 HP mỗi câu đúng' },
    desc: 'Lưỡi kiếm đỏ thắm thấm đẫm huyết long, hút sinh lực quái vật để hồi phục cho chủ nhân.',
    visual: { weaponType: 'sword', bladeColor: '#DC2626', bladeLength: 30, glowColor: '#EF4444', particle: 'fire' }
  },
  {
    id: 'wp_w_guardian',
    name: 'Cự Kiếm Hộ Vệ',
    slot: 'weapon', reqClass: 'warrior', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 52, hp: 120, mp: 10, crit: 8, dodge: 5, expBonus: 10, goldBonus: 12 },
    passive: { type: 'shield_regen', val: 10, label: 'Hộ Vệ: Tăng 120 HP và giảm 10 sát thương quái' },
    desc: 'Thanh đại kiếm nặng ngàn cân, vừa là vũ khí công phá vừa là lá chắn bất khả xâm phạm.',
    visual: { weaponType: 'sword', bladeColor: '#38BDF8', bladeLength: 34, glowColor: '#0EA5E9', particle: 'ice' }
  },
  {
    id: 'wp_w_vocab',
    name: 'Lưỡi Gươm Từ Vựng (Vocab Blade)',
    slot: 'weapon', reqClass: 'warrior', tier: 'epic', setKey: 'chrono',
    cost: 1100, sellPrice: 500, salvageDust: 130,
    stats: { atk: 68, hp: 80, mp: 20, crit: 18, dodge: 5, expBonus: 20, goldBonus: 18 },
    passive: { type: 'fast_reflex', val: 50, label: 'Thần Tốc: Trả lời đúng <2.5s sát thương x1.5' },
    desc: 'Lưỡi kiếm khắc đầy chữ cổ ngữ, càng suy nghĩ nhanh sát thương càng bộc phát kinh hoàng.',
    visual: { weaponType: 'sword', bladeColor: '#F59E0B', bladeLength: 32, glowColor: '#FBBF24', particle: 'lightning' }
  },
  {
    id: 'wp_w_excalibur',
    name: 'Thần Kiếm Anki Excalibur',
    slot: 'weapon', reqClass: 'warrior', tier: 'legendary', setKey: 'anki_god',
    cost: 2500, sellPrice: 1200, salvageDust: 350,
    stats: { atk: 110, hp: 160, mp: 40, crit: 25, dodge: 8, expBonus: 35, goldBonus: 30 },
    passive: { type: 'holy_cleave', val: 100, label: 'Thánh Nộ: Đòn chém nổ tung sét vàng lan toàn sàn đấu' },
    desc: 'Thần khí tối cao của các dũng sĩ Anki, tỏa hào quang chấn nhiếp mọi tà ma hầm ngục.',
    visual: { weaponType: 'sword', bladeColor: '#FEF08A', bladeLength: 36, glowColor: '#F59E0B', particle: 'holy' }
  },

  // ==================== 2. VŨ KHÍ PHÁP SƯ (MAGE STAFFS) ====================
  {
    id: 'wp_m_oak',
    name: 'Gậy Gỗ Sồi Cổ',
    slot: 'weapon', reqClass: 'mage', tier: 'common',
    cost: 50, sellPrice: 20, salvageDust: 5,
    stats: { atk: 10, hp: 5, mp: 15, crit: 3, dodge: 0, expBonus: 2, goldBonus: 0 },
    desc: 'Gậy phép làm từ nhánh sồi ngàn năm, dẫn truyền các tia ma pháp cơ bản.',
    visual: { weaponType: 'staff', bladeColor: '#78350F', bladeLength: 28, glowColor: null, particle: null }
  },
  {
    id: 'wp_m_sapphire',
    name: 'Quyền Trượng Ngọc Lam',
    slot: 'weapon', reqClass: 'mage', tier: 'uncommon',
    cost: 150, sellPrice: 65, salvageDust: 15,
    stats: { atk: 22, hp: 15, mp: 35, crit: 6, dodge: 0, expBonus: 5, goldBonus: 5 },
    desc: 'Đầu trượng gắn viên ngọc sapphire biển khơi, giúp hồi phục và tích tụ năng lượng MP mau lẹ.',
    visual: { weaponType: 'staff', bladeColor: '#0284C7', bladeLength: 30, glowColor: '#38BDF8', particle: null }
  },
  {
    id: 'wp_m_ignis',
    name: 'Gậy Phép Bão Lửa (Ignis)',
    slot: 'weapon', reqClass: 'mage', tier: 'rare',
    cost: 400, sellPrice: 180, salvageDust: 40,
    stats: { atk: 40, hp: 20, mp: 45, crit: 12, dodge: 0, expBonus: 8, goldBonus: 10 },
    passive: { type: 'fire_dot', val: 8, label: 'Thiêu Đốt: Quái vật mất 8 HP mỗi giây' },
    desc: 'Ngọn lửa vĩnh hằng cuộn quanh đầu trượng, thiêu rụi dã thú khi tung đòn Hỏa Cầu.',
    visual: { weaponType: 'staff', bladeColor: '#EA580C', bladeLength: 32, glowColor: '#FB923C', particle: 'fire' }
  },
  {
    id: 'wp_m_ice',
    name: 'Trượng Băng Tuyết Vĩnh Cửu',
    slot: 'weapon', reqClass: 'mage', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 56, hp: 40, mp: 70, crit: 15, dodge: 5, expBonus: 15, goldBonus: 12 },
    passive: { type: 'frost_freeze', val: 20, label: 'Đóng Băng: Giảm 20% sát thương quái vật' },
    desc: 'Lấy từ đỉnh núi tuyết vĩnh cửu, mỗi tia ma thuật phóng ra đều phủ tuyết lạnh giá.',
    visual: { weaponType: 'staff', bladeColor: '#67E8F9', bladeLength: 34, glowColor: '#A5F3FC', particle: 'ice' }
  },
  {
    id: 'wp_m_codex',
    name: 'Cổ Trượng Tri Thức Oxford',
    slot: 'weapon', reqClass: 'mage', tier: 'epic', setKey: 'oxford',
    cost: 1100, sellPrice: 500, salvageDust: 130,
    stats: { atk: 72, hp: 50, mp: 90, crit: 20, dodge: 5, expBonus: 30, goldBonus: 20 },
    passive: { type: 'scholar_boost', val: 80, label: 'Uyên Bác: Gặp từ vựng C1-C2 sát thương x1.8' },
    desc: 'Cây trượng gắn bản dịch cổ thư Oxford, mở rộng trí tuệ vô biên cho người nắm giữ.',
    visual: { weaponType: 'staff', bladeColor: '#818CF8', bladeLength: 34, glowColor: '#C084FC', particle: 'holy' }
  },
  {
    id: 'wp_m_void',
    name: 'Thần Trượng Hư Không (Cosmic Void)',
    slot: 'weapon', reqClass: 'mage', tier: 'legendary',
    cost: 2500, sellPrice: 1200, salvageDust: 350,
    stats: { atk: 115, hp: 80, mp: 130, crit: 28, dodge: 10, expBonus: 40, goldBonus: 35 },
    passive: { type: 'mp_drain', val: 12, label: 'Hấp Thụ: Hồi 12 MP mỗi câu trả lời chính xác' },
    desc: 'Trượng pháp ngưng đọng vũ trụ sâu thẳm, bắn ra các hố đen ma thuật xé toạc không gian.',
    visual: { weaponType: 'staff', bladeColor: '#A855F7', bladeLength: 36, glowColor: '#E879F9', particle: 'shadow' }
  },

  // ==================== 3. VŨ KHÍ XẠ THỦ (RANGER BOWS) ====================
  {
    id: 'wp_r_hunter',
    name: 'Cung Gỗ Thợ Săn',
    slot: 'weapon', reqClass: 'ranger', tier: 'common',
    cost: 50, sellPrice: 20, salvageDust: 5,
    stats: { atk: 9, hp: 10, mp: 5, crit: 4, dodge: 2, expBonus: 0, goldBonus: 2 },
    desc: 'Cây cung mộc mạc của thợ săn rừng thẳm, dây cung làm từ gân thú dẻo dai.',
    visual: { weaponType: 'bow', bladeColor: '#92400E', bladeLength: 26, glowColor: null, particle: null }
  },
  {
    id: 'wp_r_iron',
    name: 'Cung Sắt Tinh Luyện',
    slot: 'weapon', reqClass: 'ranger', tier: 'uncommon',
    cost: 150, sellPrice: 65, salvageDust: 15,
    stats: { atk: 20, hp: 20, mp: 10, crit: 8, dodge: 4, expBonus: 5, goldBonus: 5 },
    desc: 'Thân cung bọc sắt giúp đường tên bắn ra căng và đầm tay hơn.',
    visual: { weaponType: 'bow', bladeColor: '#94A3B8', bladeLength: 28, glowColor: '#CBD5E1', particle: null }
  },
  {
    id: 'wp_r_zephyr',
    name: 'Cung Gió Lốc (Zephyr Windbow)',
    slot: 'weapon', reqClass: 'ranger', tier: 'rare',
    cost: 400, sellPrice: 180, salvageDust: 40,
    stats: { atk: 36, hp: 30, mp: 15, crit: 14, dodge: 8, expBonus: 8, goldBonus: 8 },
    passive: { type: 'double_shot', val: 20, label: 'Song Tiễn: 20% tỉ lệ bắn 2 mũi tên liên kích' },
    desc: 'Từng mũi tên lướt đi mang theo những cơn gió lốc rít gào xé gió.',
    visual: { weaponType: 'bow', bladeColor: '#10B981', bladeLength: 30, glowColor: '#34D399', particle: 'lightning' }
  },
  {
    id: 'wp_r_piercing',
    name: 'Nỏ Thần Xuyên Phá',
    slot: 'weapon', reqClass: 'ranger', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 54, hp: 45, mp: 25, crit: 20, dodge: 6, expBonus: 12, goldBonus: 12 },
    passive: { type: 'armor_pierce', val: 30, label: 'Xuyên Giáp: Bỏ qua 30% phòng thủ quái vật' },
    desc: 'Mũi nỏ bọc kim cương nhọn hoắt, xuyên thủng mọi giáp trụ của các quái vật đá.',
    visual: { weaponType: 'bow', bladeColor: '#F59E0B', bladeLength: 32, glowColor: '#FBBF24', particle: 'fire' }
  },
  {
    id: 'wp_r_eagle',
    name: 'Cung Thiện Xạ Đại Bàng',
    slot: 'weapon', reqClass: 'ranger', tier: 'epic',
    cost: 1100, sellPrice: 500, salvageDust: 130,
    stats: { atk: 70, hp: 60, mp: 35, crit: 24, dodge: 10, expBonus: 20, goldBonus: 20 },
    passive: { type: 'eagle_hint', val: 1, label: 'Mắt Ưng: Tự động hiện thêm gợi ý nghĩa' },
    desc: 'Mang lại tầm nhìn xa như chim ưng sải cánh, bách phát bách trúng.',
    visual: { weaponType: 'bow', bladeColor: '#EAB308', bladeLength: 32, glowColor: '#FEF08A', particle: 'holy' }
  },
  {
    id: 'wp_r_solaris',
    name: 'Cung Thái Dương (Solaris Bow)',
    slot: 'weapon', reqClass: 'ranger', tier: 'legendary',
    cost: 2500, sellPrice: 1200, salvageDust: 350,
    stats: { atk: 108, hp: 90, mp: 50, crit: 30, dodge: 12, expBonus: 35, goldBonus: 30 },
    passive: { type: 'solar_rain', val: 100, label: 'Mưa Tên: Mũi tên ánh sáng thiêu đốt toàn diện' },
    desc: 'Tích tụ sức mạnh mặt trời chói lòa, bắn ra những vệt sáng quét sạch màn đêm.',
    visual: { weaponType: 'bow', bladeColor: '#FACC15', bladeLength: 36, glowColor: '#EA580C', particle: 'holy' }
  },

  // ==================== 4. VŨ KHÍ SÁT THỦ (ASSASSIN DAGGERS) ====================
  {
    id: 'wp_a_rookie',
    name: 'Dao Găm Tân Thủ',
    slot: 'weapon', reqClass: 'assassin', tier: 'common',
    cost: 50, sellPrice: 20, salvageDust: 5,
    stats: { atk: 11, hp: 5, mp: 5, crit: 5, dodge: 3, expBonus: 0, goldBonus: 5 },
    desc: 'Cặp dao găm nhỏ gọn, dễ giấu trong tay áo để ra đòn bất ngờ.',
    visual: { weaponType: 'dagger', bladeColor: '#64748B', bladeLength: 18, glowColor: null, particle: null }
  },
  {
    id: 'wp_a_shadow',
    name: 'Song Đao Hắc Thiết',
    slot: 'weapon', reqClass: 'assassin', tier: 'uncommon', setKey: 'shadow',
    cost: 150, sellPrice: 65, salvageDust: 15,
    stats: { atk: 24, hp: 15, mp: 10, crit: 12, dodge: 6, expBonus: 5, goldBonus: 10 },
    desc: 'Rèn từ sắt đen không phản chiếu ánh sáng, thoắt ẩn thoắt hiện trong bóng tối.',
    visual: { weaponType: 'dagger', bladeColor: '#1E293B', bladeLength: 20, glowColor: '#475569', particle: null }
  },
  {
    id: 'wp_a_venom',
    name: 'Chủy Thủ Tẩm Độc (Venomfang)',
    slot: 'weapon', reqClass: 'assassin', tier: 'rare',
    cost: 400, sellPrice: 180, salvageDust: 40,
    stats: { atk: 42, hp: 25, mp: 15, crit: 18, dodge: 8, expBonus: 8, goldBonus: 12 },
    passive: { type: 'poison_dot', val: 12, label: 'Trúng Độc: Quái vật mất 12 HP mỗi lượt' },
    desc: 'Tẩm nọc độc của rắn chúa hầm ngục, chỉ một vết cứa nhỏ cũng đủ hạ gục mãnh thú.',
    visual: { weaponType: 'dagger', bladeColor: '#16A34A', bladeLength: 22, glowColor: '#4ADE80', particle: 'shadow' }
  },
  {
    id: 'wp_a_phantom',
    name: 'Dao Găm Ảo Ảnh (Phantom Blade)',
    slot: 'weapon', reqClass: 'assassin', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 58, hp: 40, mp: 25, crit: 24, dodge: 14, expBonus: 15, goldBonus: 15 },
    passive: { type: 'shadow_dodge', val: 20, label: 'Ảo Ảnh: 20% né hoàn toàn sát thương khi chọn sai' },
    desc: 'Lưỡi dao trong suốt như pha lê, khiến đối phương không thể phán đoán phương hướng tấn công.',
    visual: { weaponType: 'dagger', bladeColor: '#C084FC', bladeLength: 24, glowColor: '#E879F9', particle: 'shadow' }
  },
  {
    id: 'wp_a_bloodmoon',
    name: 'Đoản Đao Huyết Nguyệt',
    slot: 'weapon', reqClass: 'assassin', tier: 'epic',
    cost: 1100, sellPrice: 500, salvageDust: 130,
    stats: { atk: 76, hp: 50, mp: 30, crit: 30, dodge: 12, expBonus: 20, goldBonus: 25 },
    passive: { type: 'super_crit', val: 250, label: 'Đoạt Mệnh: Sát thương chí mạng tăng vọt lên x2.5' },
    desc: 'Tắm dưới ánh trăng máu, lưỡi dao khao khát những chuỗi combo chuẩn xác tột cùng.',
    visual: { weaponType: 'dagger', bladeColor: '#E11D48', bladeLength: 24, glowColor: '#FB7185', particle: 'fire' }
  },
  {
    id: 'wp_a_soulreaper',
    name: 'Tử Thần Song Đao (Soulreaper)',
    slot: 'weapon', reqClass: 'assassin', tier: 'legendary',
    cost: 2500, sellPrice: 1200, salvageDust: 350,
    stats: { atk: 112, hp: 70, mp: 45, crit: 38, dodge: 18, expBonus: 35, goldBonus: 40 },
    passive: { type: 'soul_drain', val: 25, label: 'Hút Hồn: Diệt quái lập tức hồi phục 25 HP' },
    desc: 'Vũ khí truyền thuyết của đệ nhất thích khách, kết liễu kẻ thù chỉ trong tích tắc.',
    visual: { weaponType: 'dagger', bladeColor: '#4C1D95', bladeLength: 26, glowColor: '#A855F7', particle: 'shadow' }
  },

  // ==================== 5. MŨ BẢO HỘ & NÓN PHÙ THỦY (HELMETS) ====================
  {
    id: 'hm_cloth_band',
    name: 'Băng Đô Vải Thô',
    slot: 'helmet', reqClass: 'all', tier: 'common',
    cost: 40, sellPrice: 15, salvageDust: 4,
    stats: { atk: 0, hp: 15, mp: 5, crit: 0, dodge: 1, expBonus: 0, goldBonus: 0 },
    desc: 'Băng đô thô sơ giúp cố định tóc và giữ tinh thần tập trung khi học từ vựng.',
    visual: { helmType: 'band', helmColor: '#94A3B8', crestColor: null }
  },
  {
    id: 'hm_leather_cap',
    name: 'Mũ Da Thợ Săn',
    slot: 'helmet', reqClass: 'all', tier: 'common',
    cost: 70, sellPrice: 30, salvageDust: 8,
    stats: { atk: 1, hp: 30, mp: 5, crit: 2, dodge: 2, expBonus: 2, goldBonus: 0 },
    desc: 'Làm từ da thỏ rừng, nhẹ nhàng và bảo vệ đỉnh đầu.',
    visual: { helmType: 'leather_cap', helmColor: '#78350F', crestColor: null }
  },
  {
    id: 'hm_apprentice_hood',
    name: 'Mũ Trùm Học Đồ',
    slot: 'helmet', reqClass: 'all', tier: 'uncommon',
    cost: 140, sellPrice: 60, salvageDust: 15,
    stats: { atk: 2, hp: 35, mp: 25, crit: 0, dodge: 2, expBonus: 5, goldBonus: 2 },
    desc: 'Mũ trùm bằng len xanh của học sinh viện hàn lâm phép thuật.',
    visual: { helmType: 'hood', helmColor: '#1E3A8A', crestColor: null }
  },
  {
    id: 'hm_iron_helm',
    name: 'Mũ Sắt Thiết Binh',
    slot: 'helmet', reqClass: 'warrior', tier: 'uncommon',
    cost: 160, sellPrice: 70, salvageDust: 18,
    stats: { atk: 3, hp: 60, mp: 0, crit: 0, dodge: 0, expBonus: 0, goldBonus: 5 },
    desc: 'Mũ sắt đúc nguyên khối có khe nhìn hẹp, giảm sát thương khi bị quái va chạm.',
    visual: { helmType: 'knight_helm', helmColor: '#64748B', crestColor: '#EF4444' }
  },
  {
    id: 'hm_hunter_beret',
    name: 'Mũ Nồi Thợ Săn Rừng',
    slot: 'helmet', reqClass: 'ranger', tier: 'uncommon',
    cost: 150, sellPrice: 65, salvageDust: 16,
    stats: { atk: 4, hp: 40, mp: 10, crit: 4, dodge: 4, expBonus: 5, goldBonus: 5 },
    desc: 'Gắn một chiếc lông công xanh, tăng sự tự tin và phản xạ của cung thủ.',
    visual: { helmType: 'leather_cap', helmColor: '#15803D', crestColor: '#FACC15' }
  },
  {
    id: 'hm_shadow_mask',
    name: 'Khăn Bịt Mặt Bóng Đêm',
    slot: 'helmet', reqClass: 'assassin', tier: 'rare', setKey: 'shadow',
    cost: 350, sellPrice: 150, salvageDust: 35,
    stats: { atk: 6, hp: 45, mp: 15, crit: 8, dodge: 8, expBonus: 5, goldBonus: 10 },
    desc: 'Che giấu khuôn mặt hoàn hảo, khiến quái vật mất tập trung khi tấn công.',
    visual: { helmType: 'hood', helmColor: '#0F172A', crestColor: '#9333EA' }
  },
  {
    id: 'hm_wizard_hat',
    name: 'Nón Phù Thủy Học Viện',
    slot: 'helmet', reqClass: 'mage', tier: 'rare',
    cost: 380, sellPrice: 160, salvageDust: 40,
    stats: { atk: 8, hp: 40, mp: 50, crit: 5, dodge: 2, expBonus: 12, goldBonus: 8 },
    desc: 'Chiếc nón chóp cao đính ngôi sao vàng, biểu tượng của các bậc thầy ghi nhớ từ vựng.',
    visual: { helmType: 'wizard_hat', helmColor: '#4338CA', crestColor: '#FBBF24' }
  },
  {
    id: 'hm_guardian_visage',
    name: 'Mặt Nạ Giác Đấu Kim Loại',
    slot: 'helmet', reqClass: 'warrior', tier: 'epic',
    cost: 750, sellPrice: 320, salvageDust: 80,
    stats: { atk: 10, hp: 120, mp: 10, crit: 5, dodge: 0, expBonus: 10, goldBonus: 15 },
    desc: 'Mặt nạ thép hung tợn của các võ sĩ giác đấu thành Rome cổ đại.',
    visual: { helmType: 'knight_helm', helmColor: '#475569', crestColor: '#38BDF8' }
  },
  {
    id: 'hm_eagle_crest',
    name: 'Mũ Lông Vũ Đại Bàng',
    slot: 'helmet', reqClass: 'ranger', tier: 'epic',
    cost: 750, sellPrice: 320, salvageDust: 80,
    stats: { atk: 12, hp: 70, mp: 30, crit: 12, dodge: 10, expBonus: 15, goldBonus: 12 },
    desc: 'Được dệt từ lông vũ của chim ưng thần, giúp đôi mắt tinh anh nhìn thấu đáp án trắc nghiệm.',
    visual: { helmType: 'leather_cap', helmColor: '#A16207', crestColor: '#FEF08A' }
  },
  {
    id: 'hm_blood_mask',
    name: 'Mặt Nạ Huyết Sát',
    slot: 'helmet', reqClass: 'assassin', tier: 'epic',
    cost: 800, sellPrice: 350, salvageDust: 85,
    stats: { atk: 15, hp: 60, mp: 20, crit: 16, dodge: 10, expBonus: 12, goldBonus: 20 },
    desc: 'Thấm đẫm sương đêm và tà khí, khơi dậy bản năng săn mồi tuyệt đỉnh.',
    visual: { helmType: 'hood', helmColor: '#881337', crestColor: '#F43F5E' }
  },
  {
    id: 'hm_arcane_cowl',
    name: 'Mũ Trùm Ma Pháp Cổ Xưa',
    slot: 'helmet', reqClass: 'mage', tier: 'epic',
    cost: 820, sellPrice: 360, salvageDust: 90,
    stats: { atk: 14, hp: 65, mp: 80, crit: 8, dodge: 4, expBonus: 20, goldBonus: 15 },
    desc: 'Tỏa ánh sáng huỳnh quang tím, che chắn tâm trí trước những câu hỏi đánh đố.',
    visual: { helmType: 'wizard_hat', helmColor: '#6B21A8', crestColor: '#E879F9' }
  },
  {
    id: 'hm_valkyrie_helm',
    name: 'Mũ Valkyrie Cánh Bạc',
    slot: 'helmet', reqClass: 'warrior', tier: 'legendary',
    cost: 1800, sellPrice: 850, salvageDust: 240,
    stats: { atk: 22, hp: 180, mp: 40, crit: 12, dodge: 5, expBonus: 25, goldBonus: 25 },
    desc: 'Mũ giáp của nữ thần chiến tranh phương Bắc, hai bên đính đôi cánh bạc vỗ nhẹ.',
    visual: { helmType: 'knight_helm', helmColor: '#E2E8F0', crestColor: '#38BDF8' }
  },
  {
    id: 'hm_dragon_crown',
    name: 'Vương Miện Hỏa Long',
    slot: 'helmet', reqClass: 'all', tier: 'legendary', setKey: 'dragon',
    cost: 2000, sellPrice: 950, salvageDust: 280,
    stats: { atk: 25, hp: 160, mp: 50, crit: 15, dodge: 6, expBonus: 25, goldBonus: 30 },
    desc: 'Được đúc từ sừng Hắc Long Ma Vương, ngự trị tối thượng trên đầu người chinh phục hầm ngục.',
    visual: { helmType: 'crown', helmColor: '#DC2626', crestColor: '#F59E0B' }
  },
  {
    id: 'hm_void_walker',
    name: 'Mũ Hư Không Sa Ngã',
    slot: 'helmet', reqClass: 'all', tier: 'legendary',
    cost: 2100, sellPrice: 1000, salvageDust: 300,
    stats: { atk: 28, hp: 140, mp: 90, crit: 18, dodge: 12, expBonus: 30, goldBonus: 30 },
    desc: 'Hòa quyện với bóng đêm hư vô, cho phép người đội bước đi không để lại dấu vết.',
    visual: { helmType: 'hood', helmColor: '#312E81', crestColor: '#818CF8' }
  },
  {
    id: 'hm_oxford_cap',
    name: 'Mũ Cử Nhân Oxford',
    slot: 'helmet', reqClass: 'all', tier: 'legendary', setKey: 'oxford',
    cost: 2200, sellPrice: 1050, salvageDust: 320,
    stats: { atk: 20, hp: 150, mp: 100, crit: 10, dodge: 8, expBonus: 45, goldBonus: 35 },
    desc: 'Biểu tượng tối thượng của học thuật Anki, tăng vượt bậc lượng EXP thu nhận từ mọi chủ đề.',
    visual: { helmType: 'crown', helmColor: '#1E40AF', crestColor: '#FBBF24' }
  },
  {
    id: 'hm_anki_god_crown',
    name: 'Vương Miện Thần Thoại Anki',
    slot: 'helmet', reqClass: 'all', tier: 'legendary', setKey: 'anki_god',
    cost: 3000, sellPrice: 1500, salvageDust: 450,
    stats: { atk: 35, hp: 220, mp: 120, crit: 20, dodge: 10, expBonus: 50, goldBonus: 50 },
    desc: 'Vương miện của Đấng Sáng Tạo Từ Điển, ban cho trí nhớ vĩnh hằng không thể lay chuyển.',
    visual: { helmType: 'crown', helmColor: '#F59E0B', crestColor: '#FEF08A' }
  },

  // ==================== 6. ÁO GIÁP & ÁO CHOÀNG (ARMOR & ROBES) ====================
  {
    id: 'ar_cloth_tunic',
    name: 'Áo Vải Tân Thủ',
    slot: 'armor', reqClass: 'all', tier: 'common',
    cost: 45, sellPrice: 18, salvageDust: 4,
    stats: { atk: 0, hp: 20, mp: 5, crit: 0, dodge: 1, expBonus: 0, goldBonus: 0 },
    desc: 'Áo vải gai đơn sơ bảo vệ cơ thể khỏi gió lạnh đầu mùa.',
    visual: { armorColor: '#94A3B8', shoulderColor: '#64748B', capeColor: null }
  },
  {
    id: 'ar_leather_vest',
    name: 'Áo Da Săn Bắn',
    slot: 'armor', reqClass: 'all', tier: 'common',
    cost: 80, sellPrice: 35, salvageDust: 8,
    stats: { atk: 2, hp: 45, mp: 5, crit: 2, dodge: 2, expBonus: 2, goldBonus: 0 },
    desc: 'Áo giáp da dẻo dai giúp cử động nhanh nhẹn khi né quái.',
    visual: { armorColor: '#78350F', shoulderColor: '#92400E', capeColor: null }
  },
  {
    id: 'ar_apprentice_robe',
    name: 'Áo Choàng Học Đồ',
    slot: 'armor', reqClass: 'mage', tier: 'uncommon',
    cost: 160, sellPrice: 70, salvageDust: 16,
    stats: { atk: 3, hp: 40, mp: 35, crit: 2, dodge: 1, expBonus: 5, goldBonus: 5 },
    desc: 'Áo choàng màu xanh lam thêu sợi chỉ bạc của các học viên pháp sư.',
    visual: { armorColor: '#1E3A8A', shoulderColor: '#1D4ED8', capeColor: '#3B82F6' }
  },
  {
    id: 'ar_iron_breastplate',
    name: 'Thiết Giáp Chiến Binh',
    slot: 'armor', reqClass: 'warrior', tier: 'uncommon',
    cost: 180, sellPrice: 80, salvageDust: 20,
    stats: { atk: 2, hp: 80, mp: 0, crit: 0, dodge: 0, expBonus: 0, goldBonus: 5 },
    desc: 'Tấm giáp sắt trước ngực bảo vệ tim và phổi trước những móng vuốt sắc nhọn.',
    visual: { armorColor: '#475569', shoulderColor: '#64748B', capeColor: null }
  },
  {
    id: 'ar_ranger_tunic',
    name: 'Áo Khoác Ngụy Trang',
    slot: 'armor', reqClass: 'ranger', tier: 'uncommon',
    cost: 170, sellPrice: 75, salvageDust: 18,
    stats: { atk: 5, hp: 55, mp: 15, crit: 5, dodge: 4, expBonus: 5, goldBonus: 5 },
    desc: 'Dệt từ lá cây rừng rậm, giúp hòa mình vào thiên nhiên hầm ngục.',
    visual: { armorColor: '#166534', shoulderColor: '#15803D', capeColor: '#22C55E' }
  },
  {
    id: 'ar_shadow_garb',
    name: 'Áo Dạ Hành Sát Thủ',
    slot: 'armor', reqClass: 'assassin', tier: 'rare', setKey: 'shadow',
    cost: 420, sellPrice: 190, salvageDust: 45,
    stats: { atk: 8, hp: 60, mp: 20, crit: 10, dodge: 8, expBonus: 8, goldBonus: 10 },
    desc: 'May bằng tơ nhện bóng tối, triệt tiêu tiếng bước chân khi áp sát quái vật.',
    visual: { armorColor: '#0F172A', shoulderColor: '#1E293B', capeColor: '#6B21A8' }
  },
  {
    id: 'ar_mage_vestment',
    name: 'Lễ Phục Ma Pháp Lam',
    slot: 'armor', reqClass: 'mage', tier: 'rare',
    cost: 450, sellPrice: 200, salvageDust: 50,
    stats: { atk: 10, hp: 65, mp: 65, crit: 6, dodge: 3, expBonus: 12, goldBonus: 10 },
    desc: 'Tích tụ lượng lớn linh khí đất trời, đẩy nhanh tốc độ tung chiêu phép.',
    visual: { armorColor: '#312E81', shoulderColor: '#4338CA', capeColor: '#818CF8' }
  },
  {
    id: 'ar_knight_carapace',
    name: 'Chiến Giáp Hiệp Sĩ Bạc',
    slot: 'armor', reqClass: 'warrior', tier: 'rare',
    cost: 460, sellPrice: 210, salvageDust: 50,
    stats: { atk: 6, hp: 130, mp: 10, crit: 3, dodge: 0, expBonus: 5, goldBonus: 12 },
    desc: 'Giáp tấm thép trắng sáng loáng, giảm 15% lực phản đòn khi hiệp sĩ chọn sai.',
    visual: { armorColor: '#CBD5E1', shoulderColor: '#94A3B8', capeColor: '#DC2626' }
  },
  {
    id: 'ar_frost_robe',
    name: 'Áo Choàng Băng Hàn',
    slot: 'armor', reqClass: 'mage', tier: 'epic',
    cost: 900, sellPrice: 400, salvageDust: 100,
    stats: { atk: 14, hp: 90, mp: 90, crit: 10, dodge: 5, expBonus: 15, goldBonus: 15 },
    desc: 'Tỏa ra làn khí lạnh thấu xương, làm chậm bước tấn công của kẻ thù.',
    visual: { armorColor: '#0891B2', shoulderColor: '#06B6D4', capeColor: '#CFFAFE' }
  },
  {
    id: 'ar_wind_tunic',
    name: 'Phong Y Lướt Gió',
    slot: 'armor', reqClass: 'ranger', tier: 'epic',
    cost: 880, sellPrice: 390, salvageDust: 95,
    stats: { atk: 16, hp: 95, mp: 35, crit: 14, dodge: 12, expBonus: 15, goldBonus: 15 },
    desc: 'Dệt từ sợi lông chim ưng bão táp, bước di chuyển như bay trên không.',
    visual: { armorColor: '#0D9488', shoulderColor: '#14B8A6', capeColor: '#5EEAD4' }
  },
  {
    id: 'ar_dragon_scale',
    name: 'Long Lân Giáp (Dragonscale)',
    slot: 'armor', reqClass: 'all', tier: 'epic', setKey: 'dragon',
    cost: 950, sellPrice: 420, salvageDust: 110,
    stats: { atk: 18, hp: 150, mp: 40, crit: 12, dodge: 6, expBonus: 15, goldBonus: 20 },
    desc: 'Ghép từ vảy đỏ rực của rồng lửa, kháng 40% sát thương từ mọi đòn tấn công của quái.',
    visual: { armorColor: '#991B1B', shoulderColor: '#DC2626', capeColor: '#F59E0B' }
  },
  {
    id: 'ar_abyssal_cloak',
    name: 'Áo Choàng Vực Thẳm',
    slot: 'armor', reqClass: 'assassin', tier: 'epic',
    cost: 920, sellPrice: 410, salvageDust: 105,
    stats: { atk: 20, hp: 85, mp: 30, crit: 20, dodge: 14, expBonus: 15, goldBonus: 25 },
    desc: 'Được dệt từ bóng đêm sâu thẳm dưới lòng đất hầm ngục, vô cùng nhẹ và mỏng.',
    visual: { armorColor: '#18181B', shoulderColor: '#27272A', capeColor: '#7C3AED' }
  },
  {
    id: 'ar_oxford_robe',
    name: 'Học Bào Giáo Sư Oxford',
    slot: 'armor', reqClass: 'all', tier: 'legendary', setKey: 'oxford',
    cost: 2300, sellPrice: 1100, salvageDust: 330,
    stats: { atk: 22, hp: 160, mp: 120, crit: 12, dodge: 8, expBonus: 40, goldBonus: 35 },
    desc: 'Lễ phục trang nghiêm của bậc giáo sư từ điển, tăng tối đa EXP nhận được khi làm bài.',
    visual: { armorColor: '#1E3A8A', shoulderColor: '#2563EB', capeColor: '#FBBF24' }
  },
  {
    id: 'ar_celestial_plate',
    name: 'Thần Giáp Thiên Giới',
    slot: 'armor', reqClass: 'warrior', tier: 'legendary',
    cost: 2400, sellPrice: 1150, salvageDust: 340,
    stats: { atk: 25, hp: 260, mp: 60, crit: 15, dodge: 6, expBonus: 25, goldBonus: 30 },
    desc: 'Được rèn từ quặng sao băng rơi từ thiên giới, tỏa ánh sáng thánh thiện xua đuổi tà ma.',
    visual: { armorColor: '#E2E8F0', shoulderColor: '#F8FAFC', capeColor: '#38BDF8' }
  },
  {
    id: 'ar_phoenix_feather',
    name: 'Vũ Y Phượng Hoàng Lửa',
    slot: 'armor', reqClass: 'mage', tier: 'legendary',
    cost: 2450, sellPrice: 1180, salvageDust: 350,
    stats: { atk: 28, hp: 180, mp: 140, crit: 20, dodge: 8, expBonus: 30, goldBonus: 35 },
    desc: 'Dệt từ lông cánh phượng hoàng tái sinh, hồi phục một phần máu sau mỗi trận thắng.',
    visual: { armorColor: '#B91C1C', shoulderColor: '#EA580C', capeColor: '#FACC15' }
  },
  {
    id: 'ar_phantom_mesh',
    name: 'U Linh Hắc Giáp',
    slot: 'armor', reqClass: 'assassin', tier: 'legendary',
    cost: 2500, sellPrice: 1200, salvageDust: 360,
    stats: { atk: 32, hp: 130, mp: 60, crit: 28, dodge: 20, expBonus: 30, goldBonus: 45 },
    desc: 'Hóa người mặc thành thực thể nửa hư vô, tăng mạnh cơ hội né đòn khi làm sai.',
    visual: { armorColor: '#2E1065', shoulderColor: '#581C87', capeColor: '#C084FC' }
  },
  {
    id: 'ar_titan_fortress',
    name: 'Pháo Đài Titan Vĩnh Cửu',
    slot: 'armor', reqClass: 'warrior', tier: 'legendary',
    cost: 2600, sellPrice: 1250, salvageDust: 380,
    stats: { atk: 30, hp: 320, mp: 50, crit: 10, dodge: 4, expBonus: 25, goldBonus: 30 },
    desc: 'Biến cơ thể thành một pháo đài thép bất khả chiến bại trước mọi đòn công của Trùm Cuối.',
    visual: { armorColor: '#334155', shoulderColor: '#475569', capeColor: '#F59E0B' }
  },
  {
    id: 'ar_anki_aegis',
    name: 'Thánh Y Bất Diệt Anki',
    slot: 'armor', reqClass: 'all', tier: 'legendary', setKey: 'anki_god',
    cost: 3200, sellPrice: 1600, salvageDust: 480,
    stats: { atk: 40, hp: 300, mp: 150, crit: 22, dodge: 12, expBonus: 50, goldBonus: 50 },
    desc: 'Bộ giáp vĩ đại nhất mang năng lượng của toàn bộ 1000 chủ đề từ điển tiếng Anh.',
    visual: { armorColor: '#B45309', shoulderColor: '#F59E0B', capeColor: '#FEF08A' }
  },

  // ==================== 7. GĂNG TAY & BAO TAY (GLOVES) ====================
  {
    id: 'gl_cloth_wraps',
    name: 'Băng Quấn Cổ Tay',
    slot: 'gloves', reqClass: 'all', tier: 'common',
    cost: 35, sellPrice: 12, salvageDust: 3,
    stats: { atk: 2, hp: 10, mp: 0, crit: 1, dodge: 1, expBonus: 0, goldBonus: 0 },
    desc: 'Quấn quanh bàn tay giúp cầm nắm chuôi kiếm chắc chắn hơn.',
    visual: { gloveColor: '#94A3B8' }
  },
  {
    id: 'gl_leather_gloves',
    name: 'Bao Tay Da Thô',
    slot: 'gloves', reqClass: 'all', tier: 'common',
    cost: 65, sellPrice: 28, salvageDust: 7,
    stats: { atk: 4, hp: 20, mp: 5, crit: 2, dodge: 2, expBonus: 2, goldBonus: 2 },
    desc: 'Chống chai sần và giảm độ giật khi bắn cung hay vung gậy.',
    visual: { gloveColor: '#78350F' }
  },
  {
    id: 'gl_iron_bracers',
    name: 'Hộ Cổ Tay Thép',
    slot: 'gloves', reqClass: 'warrior', tier: 'uncommon',
    cost: 140, sellPrice: 60, salvageDust: 15,
    stats: { atk: 8, hp: 45, mp: 0, crit: 3, dodge: 0, expBonus: 0, goldBonus: 5 },
    desc: 'Thép nặng nề bảo vệ cổ tay, tăng lực chém ngàn cân.',
    visual: { gloveColor: '#64748B' }
  },
  {
    id: 'gl_hunter_grips',
    name: 'Găng Cung Thủ Tinh Anh',
    slot: 'gloves', reqClass: 'ranger', tier: 'uncommon',
    cost: 135, sellPrice: 58, salvageDust: 14,
    stats: { atk: 10, hp: 30, mp: 10, crit: 6, dodge: 4, expBonus: 5, goldBonus: 5 },
    desc: 'Đầu ngón tay dệt sợi chỉ ma thuật, rút tên nhanh như chớp giật.',
    visual: { gloveColor: '#15803D' }
  },
  {
    id: 'gl_silk_mitts',
    name: 'Găng Tơ Ma Thuật',
    slot: 'gloves', reqClass: 'mage', tier: 'uncommon',
    cost: 145, sellPrice: 62, salvageDust: 15,
    stats: { atk: 10, hp: 25, mp: 30, crit: 4, dodge: 1, expBonus: 5, goldBonus: 5 },
    desc: 'Tơ tằm biển hấp thụ mana, giảm độ trễ khi niệm chú Hỏa Cầu.',
    visual: { gloveColor: '#3B82F6' }
  },
  {
    id: 'gl_thief_fingerless',
    name: 'Bao Tay Cụt Ngón Đạo Tặc',
    slot: 'gloves', reqClass: 'assassin', tier: 'rare',
    cost: 320, sellPrice: 140, salvageDust: 32,
    stats: { atk: 14, hp: 30, mp: 15, crit: 10, dodge: 6, expBonus: 5, goldBonus: 15 },
    desc: 'Lộ đầu ngón tay để nhạy bén xoay chuyển song dao cận chiến.',
    visual: { gloveColor: '#1E293B' }
  },
  {
    id: 'gl_knight_gauntlets',
    name: 'Thiết Giáp Thủ Hiệp Sĩ',
    slot: 'gloves', reqClass: 'warrior', tier: 'rare',
    cost: 340, sellPrice: 150, salvageDust: 35,
    stats: { atk: 16, hp: 70, mp: 10, crit: 5, dodge: 0, expBonus: 5, goldBonus: 10 },
    desc: 'Các khớp ngón tay bọc thép sắc nhọn, gạt phăng mọi đòn đánh lén.',
    visual: { gloveColor: '#475569' }
  },
  {
    id: 'gl_spellfire_gloves',
    name: 'Găng Tay Hỏa Thuật',
    slot: 'gloves', reqClass: 'mage', tier: 'epic',
    cost: 720, sellPrice: 310, salvageDust: 75,
    stats: { atk: 22, hp: 50, mp: 60, crit: 12, dodge: 3, expBonus: 12, goldBonus: 12 },
    desc: 'Các đầu ngón tay luôn bốc khói âm ỉ, phóng ra ma thuật thiêu đốt.',
    visual: { gloveColor: '#EA580C' }
  },
  {
    id: 'gl_swift_striker',
    name: 'Bao Tay Thần Tốc (Swift Striker)',
    slot: 'gloves', reqClass: 'all', tier: 'epic', setKey: 'chrono',
    cost: 760, sellPrice: 330, salvageDust: 80,
    stats: { atk: 24, hp: 60, mp: 30, crit: 16, dodge: 8, expBonus: 15, goldBonus: 18 },
    desc: 'Tăng tốc độ phản xạ của đôi tay, giúp bấm trắc nghiệm cực chuẩn.',
    visual: { gloveColor: '#F59E0B' }
  },
  {
    id: 'gl_gold_touch',
    name: 'Găng Tay Midas Hút Vàng',
    slot: 'gloves', reqClass: 'all', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 18, hp: 65, mp: 35, crit: 8, dodge: 5, expBonus: 15, goldBonus: 40 },
    passive: { type: 'gold_magnet', val: 40, label: 'Midas: Tăng 40% Vàng nhận được sau mỗi trận' },
    desc: 'Chạm tay vào đâu cũng hóa thành vàng ròng lấp lánh.',
    visual: { gloveColor: '#FBBF24' }
  },
  {
    id: 'gl_shadow_claws',
    name: 'Móng Vuốt Dạ Xoa',
    slot: 'gloves', reqClass: 'assassin', tier: 'epic', setKey: 'shadow',
    cost: 780, sellPrice: 340, salvageDust: 85,
    stats: { atk: 26, hp: 55, mp: 25, crit: 20, dodge: 10, expBonus: 15, goldBonus: 20 },
    desc: 'Móng vuốt sắt bén nhọn cào rách da thịt quái vật trong chớp mắt.',
    visual: { gloveColor: '#581C87' }
  },
  {
    id: 'gl_oxford_scribe',
    name: 'Bao Tay Thư Ký Oxford',
    slot: 'gloves', reqClass: 'all', tier: 'legendary', setKey: 'oxford',
    cost: 1900, sellPrice: 900, salvageDust: 260,
    stats: { atk: 30, hp: 110, mp: 80, crit: 14, dodge: 6, expBonus: 35, goldBonus: 30 },
    desc: 'Từng chép lại hàng ngàn trang cổ thư, giúp người đeo hấp thụ từ vựng tức thì.',
    visual: { gloveColor: '#1E3A8A' }
  },
  {
    id: 'gl_dragon_fists',
    name: 'Nanh Vuốt Hỏa Long',
    slot: 'gloves', reqClass: 'warrior', tier: 'legendary', setKey: 'dragon',
    cost: 2000, sellPrice: 950, salvageDust: 280,
    stats: { atk: 36, hp: 140, mp: 40, crit: 18, dodge: 5, expBonus: 25, goldBonus: 30 },
    desc: 'Bọc từ vảy rồng chúa rực lửa, tung những cú đấm long trời lở đất.',
    visual: { gloveColor: '#DC2626' }
  },
  {
    id: 'gl_infinity_touch',
    name: 'Găng Tay Vô Cực Anki',
    slot: 'gloves', reqClass: 'all', tier: 'legendary', setKey: 'anki_god',
    cost: 2800, sellPrice: 1400, salvageDust: 420,
    stats: { atk: 45, hp: 180, mp: 90, crit: 25, dodge: 10, expBonus: 45, goldBonus: 45 },
    desc: 'Khảm 6 viên đá trí nhớ vô tận, búng tay thanh tẩy toàn bộ câu hỏi khó.',
    visual: { gloveColor: '#F59E0B' }
  },

  // ==================== 8. GIÀY CHIẾN BINH & ỦNG LƯỚT GIÓ (BOOTS) ====================
  {
    id: 'bt_rag_shoes',
    name: 'Giày Vải Rách',
    slot: 'boots', reqClass: 'all', tier: 'common',
    cost: 35, sellPrice: 12, salvageDust: 3,
    stats: { atk: 0, hp: 15, mp: 0, crit: 0, dodge: 1, expBonus: 0, goldBonus: 0 },
    desc: 'Đôi giày rách của người tha hương, che chở bàn chân trên đá sắc.',
    visual: { bootColor: '#64748B' }
  },
  {
    id: 'bt_leather_boots',
    name: 'Ủng Da Thợ Săn',
    slot: 'boots', reqClass: 'all', tier: 'common',
    cost: 70, sellPrice: 30, salvageDust: 7,
    stats: { atk: 1, hp: 30, mp: 5, crit: 1, dodge: 2, expBonus: 2, goldBonus: 2 },
    desc: 'Ủng da cổ cao chống bùn lầy hầm ngục, bước đi êm ái.',
    visual: { bootColor: '#78350F' }
  },
  {
    id: 'bt_apprentice_slippers',
    name: 'Hài Vải Pháp Sư',
    slot: 'boots', reqClass: 'mage', tier: 'uncommon',
    cost: 140, sellPrice: 60, salvageDust: 15,
    stats: { atk: 2, hp: 25, mp: 30, crit: 2, dodge: 2, expBonus: 5, goldBonus: 5 },
    desc: 'Đế đệm lông cừu êm ái, hỗ trợ tinh thần thư thái khi thi triển phép thuật.',
    visual: { bootColor: '#1E3A8A' }
  },
  {
    id: 'bt_iron_greaves',
    name: 'Ủng Sắt Thiết Binh',
    slot: 'boots', reqClass: 'warrior', tier: 'uncommon',
    cost: 160, sellPrice: 70, salvageDust: 18,
    stats: { atk: 2, hp: 65, mp: 0, crit: 0, dodge: 0, expBonus: 0, goldBonus: 5 },
    desc: 'Ủng bọc thép nặng chịch, đứng vững như bàn thạch trước va đập của quái.',
    visual: { bootColor: '#475569' }
  },
  {
    id: 'bt_stealth_treads',
    name: 'Giày Đệm Êm Dạ Hành',
    slot: 'boots', reqClass: 'assassin', tier: 'uncommon', setKey: 'shadow',
    cost: 155, sellPrice: 68, salvageDust: 16,
    stats: { atk: 4, hp: 35, mp: 10, crit: 4, dodge: 6, expBonus: 5, goldBonus: 8 },
    desc: 'Đế cao su ma thuật không phát ra bất cứ âm thanh nào khi di chuyển.',
    visual: { bootColor: '#0F172A' }
  },
  {
    id: 'bt_wind_striders',
    name: 'Ủng Lướt Gió Zephyr',
    slot: 'boots', reqClass: 'all', tier: 'rare', setKey: 'chrono',
    cost: 380, sellPrice: 170, salvageDust: 38,
    stats: { atk: 6, hp: 50, mp: 20, crit: 6, dodge: 8, expBonus: 8, goldBonus: 10 },
    desc: 'Như có làn gió nâng bước chân, tăng tốc độ phản xạ và né đòn.',
    visual: { bootColor: '#14B8A6' }
  },
  {
    id: 'bt_knight_sabatons',
    name: 'Ủng Thép Giác Đấu',
    slot: 'boots', reqClass: 'warrior', tier: 'rare',
    cost: 400, sellPrice: 180, salvageDust: 40,
    stats: { atk: 5, hp: 95, mp: 10, crit: 2, dodge: 2, expBonus: 5, goldBonus: 10 },
    desc: 'Mũi ủng bọc sắt sắc nhọn có thể dùng để đá bồi thêm sát thương vào quái.',
    visual: { bootColor: '#64748B' }
  },
  {
    id: 'bt_arcane_sandals',
    name: 'Hài Bí Thuật Lơ Lửng',
    slot: 'boots', reqClass: 'mage', tier: 'epic',
    cost: 750, sellPrice: 320, salvageDust: 80,
    stats: { atk: 8, hp: 60, mp: 70, crit: 8, dodge: 6, expBonus: 15, goldBonus: 12 },
    desc: 'Nâng người mặc lơ lửng cách mặt đất vài phân, hoàn toàn không dính bẫy gai.',
    visual: { bootColor: '#6366F1' }
  },
  {
    id: 'bt_frost_walkers',
    name: 'Ủng Băng Giá Tuyết Trắng',
    slot: 'boots', reqClass: 'all', tier: 'epic',
    cost: 780, sellPrice: 340, salvageDust: 85,
    stats: { atk: 10, hp: 80, mp: 40, crit: 10, dodge: 8, expBonus: 15, goldBonus: 15 },
    desc: 'Mỗi bước chân đạp xuống đều để lại một bông hoa tuyết pixel tinh khôi.',
    visual: { bootColor: '#38BDF8' }
  },
  {
    id: 'bt_blood_treads',
    name: 'Huyết Bộ Hài',
    slot: 'boots', reqClass: 'assassin', tier: 'epic',
    cost: 820, sellPrice: 360, salvageDust: 90,
    stats: { atk: 14, hp: 65, mp: 25, crit: 16, dodge: 12, expBonus: 15, goldBonus: 20 },
    desc: 'Càng đổ máu bước chân càng thoăn thoắt, lao đến hạ sát mục tiêu chớp nhoáng.',
    visual: { bootColor: '#BE123C' }
  },
  {
    id: 'bt_mercury_winged',
    name: 'Ủng Có Cánh Hermes',
    slot: 'boots', reqClass: 'all', tier: 'legendary',
    cost: 2000, sellPrice: 950, salvageDust: 280,
    stats: { atk: 18, hp: 120, mp: 60, crit: 15, dodge: 20, expBonus: 30, goldBonus: 35 },
    passive: { type: 'wing_dodge', val: 25, label: 'Né Thần Sầu: 25% cơ hội né hoàn toàn đòn phản công' },
    desc: 'Đôi cánh thiên sứ ở gót chân đập liên hồi, giúp người chạy nhanh hơn cả gió lốc.',
    visual: { bootColor: '#F59E0B' }
  },
  {
    id: 'bt_dragon_stompers',
    name: 'Ủng Long Lực',
    slot: 'boots', reqClass: 'warrior', tier: 'legendary', setKey: 'dragon',
    cost: 2100, sellPrice: 1000, salvageDust: 300,
    stats: { atk: 24, hp: 180, mp: 40, crit: 12, dodge: 6, expBonus: 25, goldBonus: 30 },
    desc: 'Mỗi bước dậm chân làm rung chuyển cả sàn đấu hầm ngục, uy chấn bát hoang.',
    visual: { bootColor: '#991B1B' }
  },
  {
    id: 'bt_shadow_stride',
    name: 'Hư Bộ Vô Thanh',
    slot: 'boots', reqClass: 'assassin', tier: 'legendary',
    cost: 2200, sellPrice: 1050, salvageDust: 320,
    stats: { atk: 26, hp: 100, mp: 50, crit: 22, dodge: 22, expBonus: 30, goldBonus: 40 },
    desc: 'Băng qua hư không như bóng ma lướt đi, không để lại bất kỳ tung tích nào.',
    visual: { bootColor: '#3B0764' }
  },
  {
    id: 'bt_anki_chronos',
    name: 'Thời Không Thần Hài Anki',
    slot: 'boots', reqClass: 'all', tier: 'legendary', setKey: 'chrono',
    cost: 2800, sellPrice: 1400, salvageDust: 420,
    stats: { atk: 30, hp: 160, mp: 80, crit: 20, dodge: 16, expBonus: 45, goldBonus: 45 },
    desc: 'Làm chậm dòng chảy thời gian của câu đố, giúp tư duy thông suốt tột đỉnh.',
    visual: { bootColor: '#FBBF24' }
  },

  // ==================== 9. PHỤ KIỆN & NHẪN CỔ TỰ (ACCESSORIES) ====================
  {
    id: 'ac_copper_ring',
    name: 'Nhẫn Đồng Cổ',
    slot: 'accessory', reqClass: 'all', tier: 'common',
    cost: 40, sellPrice: 15, salvageDust: 4,
    stats: { atk: 2, hp: 15, mp: 5, crit: 1, dodge: 0, expBonus: 2, goldBonus: 2 },
    desc: 'Chiếc nhẫn đồng đơn sơ mang lại một chút may mắn ban đầu.'
  },
  {
    id: 'ac_silver_band',
    name: 'Nhẫn Bạc May Mắn',
    slot: 'accessory', reqClass: 'all', tier: 'uncommon',
    cost: 130, sellPrice: 55, salvageDust: 14,
    stats: { atk: 4, hp: 25, mp: 10, crit: 3, dodge: 1, expBonus: 5, goldBonus: 10 },
    desc: 'Chạm khắc hoa văn cỏ 4 lá, tăng lượng tiền vàng thu thập được từ quái.'
  },
  {
    id: 'ac_scholar_pendant',
    name: 'Mặt Dây Chuyền Học Giả',
    slot: 'accessory', reqClass: 'all', tier: 'uncommon',
    cost: 150, sellPrice: 65, salvageDust: 16,
    stats: { atk: 5, hp: 20, mp: 25, crit: 2, dodge: 0, expBonus: 12, goldBonus: 5 },
    desc: 'Viên đá xanh khai thông trí nhớ, tăng tốc độ hấp thu điểm kinh nghiệm.'
  },
  {
    id: 'ac_ruby_ring',
    name: 'Nhẫn Hồng Ngọc Bạo Kích',
    slot: 'accessory', reqClass: 'all', tier: 'rare',
    cost: 360, sellPrice: 160, salvageDust: 36,
    stats: { atk: 12, hp: 35, mp: 15, crit: 10, dodge: 0, expBonus: 5, goldBonus: 10 },
    desc: 'Viên ruby đỏ rực thắp sáng lửa giận, tăng cơ hội ra đòn bạo kích.'
  },
  {
    id: 'ac_sapphire_amulet',
    name: 'Bùa Lam Ngọc Minh Mẫn',
    slot: 'accessory', reqClass: 'mage', tier: 'rare',
    cost: 380, sellPrice: 170, salvageDust: 38,
    stats: { atk: 10, hp: 30, mp: 50, crit: 4, dodge: 2, expBonus: 10, goldBonus: 10 },
    desc: 'Giúp tâm trí người học luôn tĩnh lặng và sáng suốt như mặt hồ mùa thu.'
  },
  {
    id: 'ac_emerald_band',
    name: 'Nhẫn Phỉ Thúy Sinh Lực',
    slot: 'accessory', reqClass: 'all', tier: 'rare',
    cost: 370, sellPrice: 165, salvageDust: 37,
    stats: { atk: 6, hp: 80, mp: 20, crit: 2, dodge: 2, expBonus: 8, goldBonus: 8 },
    desc: 'Nạp năng lượng thiên nhiên bồi bổ sinh lực, tăng lượng máu dồi dào.'
  },
  {
    id: 'ac_shadow_locket',
    name: 'Hộp Locket Bóng Đêm',
    slot: 'accessory', reqClass: 'assassin', tier: 'rare', setKey: 'shadow',
    cost: 410, sellPrice: 185, salvageDust: 42,
    stats: { atk: 14, hp: 40, mp: 20, crit: 12, dodge: 8, expBonus: 8, goldBonus: 15 },
    desc: 'Bên trong chứa một giọt tinh chất hắc ám, che chở thích khách trước kẻ thù.'
  },
  {
    id: 'ac_berserk_talisman',
    name: 'Bùa Cuồng Bạo (Berserk Talisman)',
    slot: 'accessory', reqClass: 'warrior', tier: 'epic',
    cost: 800, sellPrice: 350, salvageDust: 85,
    stats: { atk: 25, hp: 90, mp: 15, crit: 15, dodge: 0, expBonus: 10, goldBonus: 15 },
    desc: 'Càng bị quái đánh trúng, sức tấn công chém trả càng thêm dữ dội.'
  },
  {
    id: 'ac_gold_magnet',
    name: 'Bùa Nam Châm Hút Vàng Siêu Cấp',
    slot: 'accessory', reqClass: 'all', tier: 'epic',
    cost: 850, sellPrice: 380, salvageDust: 90,
    stats: { atk: 15, hp: 70, mp: 30, crit: 5, dodge: 4, expBonus: 15, goldBonus: 50 },
    passive: { type: 'gold_frenzy', val: 50, label: 'Kho Báu: Thưởng thêm 50% tiền vàng toàn bộ ải' },
    desc: 'Quái vật nổ tung tiền vàng tự động bay thẳng vào hòm đồ của bạn.'
  },
  {
    id: 'ac_exp_hourglass',
    name: 'Đồng Hồ Cát Tri Thức',
    slot: 'accessory', reqClass: 'all', tier: 'epic', setKey: 'chrono',
    cost: 900, sellPrice: 400, salvageDust: 100,
    stats: { atk: 18, hp: 75, mp: 50, crit: 10, dodge: 5, expBonus: 35, goldBonus: 20 },
    desc: 'Hạt cát vàng chảy xuôi nhắc nhở thời gian trôi mau, tăng 35% điểm kinh nghiệm.'
  },
  {
    id: 'ac_phoenix_feather',
    name: 'Lông Vũ Phượng Hoàng Tái Sinh',
    slot: 'accessory', reqClass: 'all', tier: 'epic',
    cost: 1100, sellPrice: 500, salvageDust: 130,
    stats: { atk: 15, hp: 110, mp: 40, crit: 8, dodge: 6, expBonus: 15, goldBonus: 20 },
    passive: { type: 'revive_once', val: 50, label: 'Hồi Sinh: Tự động hồi sinh với 50% máu khi gục ngã' },
    desc: 'Tia lửa phượng hoàng không bao giờ tắt, trao cho bạn một cơ hội thứ hai khi thua trận.'
  },
  {
    id: 'ac_dragon_heart',
    name: 'Hạt Nhân Hỏa Long (Dragon Heart)',
    slot: 'accessory', reqClass: 'all', tier: 'legendary', setKey: 'dragon',
    cost: 2200, sellPrice: 1050, salvageDust: 320,
    stats: { atk: 35, hp: 180, mp: 60, crit: 18, dodge: 5, expBonus: 25, goldBonus: 30 },
    desc: 'Trái tim rồng đập thình thịch nguồn năng lượng hủy diệt, thiêu đốt mọi rào cản.'
  },
  {
    id: 'ac_oxford_medal',
    name: 'Huy Chương Danh Dự Oxford',
    slot: 'accessory', reqClass: 'all', tier: 'legendary', setKey: 'oxford',
    cost: 2300, sellPrice: 1100, salvageDust: 330,
    stats: { atk: 30, hp: 160, mp: 100, crit: 15, dodge: 8, expBonus: 50, goldBonus: 40 },
    desc: 'Phần thưởng vinh danh các học giả ghi nhớ trọn bộ từ điển tiếng Anh.'
  },
  {
    id: 'ac_memory_matrix',
    name: 'Ma Trận Siêu Trí Nhớ',
    slot: 'accessory', reqClass: 'all', tier: 'legendary',
    cost: 2400, sellPrice: 1150, salvageDust: 340,
    stats: { atk: 32, hp: 170, mp: 110, crit: 20, dodge: 10, expBonus: 45, goldBonus: 45 },
    desc: 'Kết nối hàng triệu tế bào thần kinh, giúp ghi nhớ từ vựng tức thì không thể quên.'
  },
  {
    id: 'ac_all_seeing_eye',
    name: 'Mắt Thần Soi Lỗi Sai',
    slot: 'accessory', reqClass: 'all', tier: 'legendary',
    cost: 2500, sellPrice: 1200, salvageDust: 350,
    stats: { atk: 38, hp: 190, mp: 90, crit: 24, dodge: 12, expBonus: 40, goldBonus: 40 },
    passive: { type: 'eye_sight', val: 1, label: 'Thấu Suốt: Tự động phát hiện và loại bỏ các cạm bẫy từ sai' },
    desc: 'Con mắt thần của các vị thánh, soi rọi ánh sáng chân lý qua từng chữ viết.'
  },
  {
    id: 'ac_anki_infinity_core',
    name: 'Trái Tim Vĩnh Hằng Anki',
    slot: 'accessory', reqClass: 'all', tier: 'legendary', setKey: 'anki_god',
    cost: 3500, sellPrice: 1800, salvageDust: 550,
    stats: { atk: 50, hp: 250, mp: 150, crit: 28, dodge: 15, expBonus: 60, goldBonus: 60 },
    passive: { type: 'god_aura', val: 100, label: 'Bất Tử: Giảm 30% sát thương nhận vào & Tỏa hào quang thần thoại' },
    desc: 'Viên ngọc tinh túy gom góp tri thức của toàn bộ nhân loại, bảo vật vô giá của vũ đài.'
  }
];

// Helper tìm kiếm trang bị theo ID
function getRpgEquipmentById(id) {
  if (!id) return null;
  return RPG_EQUIPMENT_CATALOG.find(item => item.id === id) || null;
}

// Helper lấy toàn bộ danh sách trang bị theo Slot
function getRpgEquipmentBySlot(slot) {
  return RPG_EQUIPMENT_CATALOG.filter(item => item.slot === slot);
}

// Helper lấy toàn bộ danh sách trang bị theo Hệ phái
function getRpgEquipmentByClass(rpgClass) {
  return RPG_EQUIPMENT_CATALOG.filter(item => item.reqClass === 'all' || item.reqClass === rpgClass);
}

// Helper tính toán chỉ số Set đồ kích hoạt
function calculateActiveSetBonuses(equippedIds) {
  const activeBonuses = [];
  const equippedItems = equippedIds.map(id => getRpgEquipmentById(id)).filter(Boolean);
  const setCount = {};

  equippedItems.forEach(item => {
    if (item.setKey) {
      setCount[item.setKey] = (setCount[item.setKey] || 0) + 1;
    }
  });

  Object.keys(setCount).forEach(setKey => {
    const count = setCount[setKey];
    const setDef = RPG_SET_BONUSES[setKey];
    if (setDef && count >= 2) {
      activeBonuses.push({ setKey, count, setDef, tier: count >= 4 ? 4 : 2 });
    }
  });

  return activeBonuses;
}

// Xuất global cho toàn bộ hệ thống
if (typeof window !== 'undefined') {
  window.RPG_TIERS = RPG_TIERS;
  window.RPG_SET_BONUSES = RPG_SET_BONUSES;
  window.RPG_EQUIPMENT_CATALOG = RPG_EQUIPMENT_CATALOG;
  window.getRpgEquipmentById = getRpgEquipmentById;
  window.getRpgEquipmentBySlot = getRpgEquipmentBySlot;
  window.getRpgEquipmentByClass = getRpgEquipmentByClass;
  window.calculateActiveSetBonuses = calculateActiveSetBonuses;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RPG_TIERS,
    RPG_SET_BONUSES,
    RPG_EQUIPMENT_CATALOG,
    getRpgEquipmentById,
    getRpgEquipmentBySlot,
    getRpgEquipmentByClass,
    calculateActiveSetBonuses
  };
}
