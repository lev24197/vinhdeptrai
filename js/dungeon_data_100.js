// ==================== CƠ SỞ DỮ LIỆU 100 HẦM NGỤC, 100 BOSS VÀ BỐI CẢNH THEMATIC ====================
// Tự động phân tầng 4 Tiers: Sơ Cấp (1-25), Trung Cấp (26-50), Cao Cấp (51-75), Thần Thoại (76-100)
// Mỗi chủ đề sở hữu Quái thường riêng, Boss độc nhất, Chỉ số ATK/DEF tăng dần, và Background Canvas động.

window.DUNGEON_DATA_100 = {
    "78":  {
               "minions":  [
                               {
                                   "def":  123,
                                   "name":  "Bóng Ma Phương tiện giao thông đường bộ",
                                   "color":  "#38BDF8",
                                   "atk":  170,
                                   "type":  "minion_a",
                                   "hp":  648
                               },
                               {
                                   "def":  135,
                                   "name":  "Lính Gác Road Vehicles",
                                   "color":  "#7DD3FC",
                                   "atk":  187,
                                   "type":  "minion_b",
                                   "hp":  745
                               },
                               {
                                   "def":  148,
                                   "name":  "Hộ Vệ Tinh Anh Phương tiện giao thông đường bộ",
                                   "color":  "#FFFFFF",
                                   "atk":  212,
                                   "type":  "minion_c",
                                   "hp":  842
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  157,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Road Vehicles",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Phương tiện giao thông đường bộ!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Road Vehicles!"
                                      ],
                            "name":  "HOÀNG ĐẾ PHƯƠNG TIỆN GIAO THÔNG ĐƯỜNG BỘ: ROAD VEHICLES TITAN",
                            "atk":  224,
                            "archetype":  "turbo_highway_wyrm",
                            "baseHp":  3139,
                            "title":  "Bá Chủ Thống Trị Phương tiện giao thông đường bộ"
                        },
               "background":  {
                                  "effect":  "headlights",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1D222E",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#12151C",
                                  "props":  "highway_overpass",
                                  "skyColor":  "#090B0E"
                              },
               "cleanEn":  "Road Vehicles",
               "cleanVi":  "Phương tiện giao thông đường bộ",
               "stt":  78,
               "tier":  4,
               "biome":  "metropolis_freeway",
               "topicName":  "Phương tiện giao thông đường bộ (Road Vehicles)"
           },
    "10":  {
               "minions":  [
                               {
                                   "def":  23,
                                   "name":  "Ảo Ảnh Lo Âu",
                                   "color":  "#A855F7",
                                   "atk":  36,
                                   "type":  "anxiety_shade",
                                   "hp":  133
                               },
                               {
                                   "def":  25,
                                   "name":  "Lửa Căm Hờn Đỏ",
                                   "color":  "#C084FC",
                                   "atk":  40,
                                   "type":  "rage_wisp",
                                   "hp":  153
                               },
                               {
                                   "def":  28,
                                   "name":  "Mặt Nạ Giả Tạo",
                                   "color":  "#FFFFFF",
                                   "atk":  45,
                                   "type":  "mask_mimic",
                                   "hp":  173
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  40,
                            "color":  "#A855F7",
                            "skillName":  "Gương Phản Chiếu Cơn Thịnh Nộ",
                            "roars":  [
                                          "Ngươi không thể đánh bại chính tâm trí mình!",
                                          "Nỗi sợ hãi sâu thẳm!"
                                      ],
                            "name":  "MA HOÀNG BẢN NGÃ: EGO SHADOW MONARCH",
                            "atk":  66,
                            "archetype":  "ego_shadow",
                            "baseHp":  941,
                            "title":  "Bản Sao Hắc Ám Của Cảm Xúc"
                        },
               "background":  {
                                  "effect":  "psyche_shards",
                                  "particleColor":  "#C084FC",
                                  "floorColor":  "#25194D",
                                  "accentColor":  "#A855F7",
                                  "wallColor":  "#160F2E",
                                  "props":  "fractured_mirrors",
                                  "skyColor":  "#0B0717"
                              },
               "cleanEn":  "Personality Traits \u0026 Emotions",
               "cleanVi":  "Tính cách và Cảm xúc con người",
               "stt":  10,
               "tier":  1,
               "biome":  "mirror_psyche",
               "topicName":  "Tính cách và Cảm xúc con người (Personality Traits \u0026 Emotions)"
           },
    "63":  {
               "minions":  [
                               {
                                   "def":  101,
                                   "name":  "Linh Hồn Mạng Internet và Mạng xã hội",
                                   "color":  "#58A6FF",
                                   "atk":  140,
                                   "type":  "minion_a",
                                   "hp":  535
                               },
                               {
                                   "def":  111,
                                   "name":  "Lính Gác Internet \u0026 Social Media",
                                   "color":  "#79C0FF",
                                   "atk":  154,
                                   "type":  "minion_b",
                                   "hp":  615
                               },
                               {
                                   "def":  121,
                                   "name":  "Hộ Vệ Tinh Anh Mạng Internet và Mạng xã hội",
                                   "color":  "#FFFFFF",
                                   "atk":  175,
                                   "type":  "minion_c",
                                   "hp":  696
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  131,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Internet \u0026 Social Media",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Mạng Internet và Mạng xã hội!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Internet \u0026 Social Media!"
                                      ],
                            "name":  "BÁ VƯƠNG MẠNG INTERNET VÀ MẠNG XÃ HỘI: INTERNET \u0026 SOCIAL MEDIA TITAN",
                            "atk":  189,
                            "archetype":  "cyber_overlord",
                            "baseHp":  2654,
                            "title":  "Bá Chủ Thống Trị Mạng Internet và Mạng xã hội"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "Internet \u0026 Social Media",
               "cleanVi":  "Mạng Internet và Mạng xã hội",
               "stt":  63,
               "tier":  3,
               "biome":  "cyber_arcade_city",
               "topicName":  "Mạng Internet và Mạng xã hội (Internet \u0026 Social Media)"
           },
    "30":  {
               "minions":  [
                               {
                                   "def":  52,
                                   "name":  "Bóng Ma Trò chơi điện tử trên PC và Mobile",
                                   "color":  "#58A6FF",
                                   "atk":  75,
                                   "type":  "minion_a",
                                   "hp":  285
                               },
                               {
                                   "def":  57,
                                   "name":  "Lính Gác PC \u0026 Mobile Video Games",
                                   "color":  "#79C0FF",
                                   "atk":  82,
                                   "type":  "minion_b",
                                   "hp":  328
                               },
                               {
                                   "def":  62,
                                   "name":  "Hộ Vệ Tinh Anh Trò chơi điện tử trên PC và Mobile",
                                   "color":  "#FFFFFF",
                                   "atk":  94,
                                   "type":  "minion_c",
                                   "hp":  370
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  75,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ PC \u0026 Mobile Video Games",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Trò chơi điện tử trên PC và Mobile!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua PC \u0026 Mobile Video Games!"
                                      ],
                            "name":  "ĐẠI THẦN TRÒ CHƠI ĐIỆN TỬ TRÊN PC VÀ MOBILE: PC \u0026 MOBILE VIDEO GAMES TITAN",
                            "atk":  112,
                            "archetype":  "cyber_overlord",
                            "baseHp":  1587,
                            "title":  "Bá Chủ Thống Trị Trò chơi điện tử trên PC và Mobile"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "PC \u0026 Mobile Video Games",
               "cleanVi":  "Trò chơi điện tử trên PC và Mobile",
               "stt":  30,
               "tier":  2,
               "biome":  "cyber_arcade_city",
               "topicName":  "Trò chơi điện tử trên PC và Mobile (PC \u0026 Mobile Video Games)"
           },
    "87":  {
               "minions":  [
                               {
                                   "def":  136,
                                   "name":  "Linh Hồn Du lịch, Nhà nghỉ và Khách sạn",
                                   "color":  "#38BDF8",
                                   "atk":  187,
                                   "type":  "minion_a",
                                   "hp":  717
                               },
                               {
                                   "def":  150,
                                   "name":  "Lính Gác Tourism \u0026 Accommodations",
                                   "color":  "#BAE6FD",
                                   "atk":  206,
                                   "type":  "minion_b",
                                   "hp":  825
                               },
                               {
                                   "def":  163,
                                   "name":  "Hộ Vệ Tinh Anh Du lịch, Nhà nghỉ và Khách sạn",
                                   "color":  "#FFFFFF",
                                   "atk":  234,
                                   "type":  "minion_c",
                                   "hp":  932
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  173,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Tourism \u0026 Accommodations",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Du lịch, Nhà nghỉ và Khách sạn!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Tourism \u0026 Accommodations!"
                                      ],
                            "name":  "BÁ CHỦ DU LỊCH, NHÀ NGHỈ VÀ KHÁCH SẠN: TOURISM \u0026 ACCOMMODATIONS TITAN",
                            "atk":  245,
                            "archetype":  "skyline_zephyr_behemoth",
                            "baseHp":  3430,
                            "title":  "Bá Chủ Thống Trị Du lịch, Nhà nghỉ và Khách sạn"
                        },
               "background":  {
                                  "effect":  "beacon_lights",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#182436",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F1722",
                                  "props":  "runway_control_tower",
                                  "skyColor":  "#070B11"
                              },
               "cleanEn":  "Tourism \u0026 Accommodations",
               "cleanVi":  "Du lịch, Nhà nghỉ và Khách sạn",
               "stt":  87,
               "tier":  4,
               "biome":  "skyport_terminal",
               "topicName":  "Du lịch, Nhà nghỉ và Khách sạn (Tourism \u0026 Accommodations)"
           },
    "49":  {
               "minions":  [
                               {
                                   "def":  80,
                                   "name":  "Quái Thú Giải thưởng và Danh hiệu học thuật",
                                   "color":  "#C084FC",
                                   "atk":  113,
                                   "type":  "minion_a",
                                   "hp":  429
                               },
                               {
                                   "def":  88,
                                   "name":  "Lính Gác Academic Awards \u0026 Titles",
                                   "color":  "#E9D5FF",
                                   "atk":  124,
                                   "type":  "minion_b",
                                   "hp":  493
                               },
                               {
                                   "def":  96,
                                   "name":  "Hộ Vệ Tinh Anh Giải thưởng và Danh hiệu học thuật",
                                   "color":  "#FFFFFF",
                                   "atk":  141,
                                   "type":  "minion_c",
                                   "hp":  558
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  107,
                            "color":  "#C084FC",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Academic Awards \u0026 Titles",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Giải thưởng và Danh hiệu học thuật!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Academic Awards \u0026 Titles!"
                                      ],
                            "name":  "HẮC THẦN GIẢI THƯỞNG VÀ DANH HIỆU HỌC THUẬT: ACADEMIC AWARDS \u0026 TITLES TITAN",
                            "atk":  157,
                            "archetype":  "cathedral_archon",
                            "baseHp":  2202,
                            "title":  "Bá Chủ Thống Trị Giải thưởng và Danh hiệu học thuật"
                        },
               "background":  {
                                  "effect":  "holy_radiance",
                                  "particleColor":  "#E9D5FF",
                                  "floorColor":  "#2C2845",
                                  "accentColor":  "#C084FC",
                                  "wallColor":  "#1A1829",
                                  "props":  "stained_glass_altar",
                                  "skyColor":  "#0D0C15"
                              },
               "cleanEn":  "Academic Awards \u0026 Titles",
               "cleanVi":  "Giải thưởng và Danh hiệu học thuật",
               "stt":  49,
               "tier":  2,
               "biome":  "sacred_cathedral",
               "topicName":  "Giải thưởng và Danh hiệu học thuật (Academic Awards \u0026 Titles)"
           },
    "62":  {
               "minions":  [
                               {
                                   "def":  99,
                                   "name":  "Bóng Ma Phần mềm và Ứng dụng di động",
                                   "color":  "#58A6FF",
                                   "atk":  138,
                                   "type":  "minion_a",
                                   "hp":  527
                               },
                               {
                                   "def":  109,
                                   "name":  "Lính Gác Software \u0026 Mobile Apps",
                                   "color":  "#79C0FF",
                                   "atk":  152,
                                   "type":  "minion_b",
                                   "hp":  606
                               },
                               {
                                   "def":  119,
                                   "name":  "Hộ Vệ Tinh Anh Phần mềm và Ứng dụng di động",
                                   "color":  "#FFFFFF",
                                   "atk":  172,
                                   "type":  "minion_c",
                                   "hp":  685
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  130,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Software \u0026 Mobile Apps",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Phần mềm và Ứng dụng di động!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Software \u0026 Mobile Apps!"
                                      ],
                            "name":  "CỰ QUÁI PHẦN MỀM VÀ ỨNG DỤNG DI ĐỘNG: SOFTWARE \u0026 MOBILE APPS TITAN",
                            "atk":  187,
                            "archetype":  "cyber_overlord",
                            "baseHp":  2622,
                            "title":  "Bá Chủ Thống Trị Phần mềm và Ứng dụng di động"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "Software \u0026 Mobile Apps",
               "cleanVi":  "Phần mềm và Ứng dụng di động",
               "stt":  62,
               "tier":  3,
               "biome":  "cyber_arcade_city",
               "topicName":  "Phần mềm và Ứng dụng di động (Software \u0026 Mobile Apps)"
           },
    "22":  {
               "minions":  [
                               {
                                   "def":  41,
                                   "name":  "Bóng Ma Các môn Thể thao đồng đội",
                                   "color":  "#84CC16",
                                   "atk":  59,
                                   "type":  "minion_a",
                                   "hp":  224
                               },
                               {
                                   "def":  45,
                                   "name":  "Lính Gác Team Sports",
                                   "color":  "#A3E635",
                                   "atk":  65,
                                   "type":  "minion_b",
                                   "hp":  258
                               },
                               {
                                   "def":  49,
                                   "name":  "Hộ Vệ Tinh Anh Các môn Thể thao đồng đội",
                                   "color":  "#FFFFFF",
                                   "atk":  74,
                                   "type":  "minion_c",
                                   "hp":  291
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  61,
                            "color":  "#84CC16",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Team Sports",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các môn Thể thao đồng đội!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Team Sports!"
                                      ],
                            "name":  "CỰ QUÁI CÁC MÔN THỂ THAO ĐỒNG ĐỘI: TEAM SPORTS TITAN",
                            "atk":  94,
                            "archetype":  "gladiator_champion",
                            "baseHp":  1329,
                            "title":  "Bá Chủ Thống Trị Các môn Thể thao đồng đội"
                        },
               "background":  {
                                  "effect":  "wind_gusts",
                                  "particleColor":  "#A3E635",
                                  "floorColor":  "#33362E",
                                  "accentColor":  "#84CC16",
                                  "wallColor":  "#1E201B",
                                  "props":  "stadium_lights",
                                  "skyColor":  "#0F100D"
                              },
               "cleanEn":  "Team Sports",
               "cleanVi":  "Các môn Thể thao đồng đội",
               "stt":  22,
               "tier":  1,
               "biome":  "colosseum_arena",
               "topicName":  "Các môn Thể thao đồng đội (Team Sports)"
           },
    "13":  {
               "minions":  [
                               {
                                   "def":  28,
                                   "name":  "Ác Mộng Dụng cụ vệ sinh và Chăm sóc cá nhân",
                                   "color":  "#06B6D4",
                                   "atk":  42,
                                   "type":  "minion_a",
                                   "hp":  156
                               },
                               {
                                   "def":  31,
                                   "name":  "Lính Gác Hygiene \u0026 Personal Care Items",
                                   "color":  "#22D3EE",
                                   "atk":  46,
                                   "type":  "minion_b",
                                   "hp":  179
                               },
                               {
                                   "def":  34,
                                   "name":  "Hộ Vệ Tinh Anh Dụng cụ vệ sinh và Chăm sóc cá nhân",
                                   "color":  "#FFFFFF",
                                   "atk":  52,
                                   "type":  "minion_c",
                                   "hp":  203
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  46,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Hygiene \u0026 Personal Care Items",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Dụng cụ vệ sinh và Chăm sóc cá nhân!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Hygiene \u0026 Personal Care Items!"
                                      ],
                            "name":  "BÁ VƯƠNG DỤNG CỤ VỆ SINH VÀ CHĂM SÓC CÁ NHÂN: HYGIENE \u0026 PERSONAL CARE ITEMS TITAN",
                            "atk":  73,
                            "archetype":  "abyssal_kraken",
                            "baseHp":  1038,
                            "title":  "Bá Chủ Thống Trị Dụng cụ vệ sinh và Chăm sóc cá nhân"
                        },
               "background":  {
                                  "effect":  "ocean_bubbles",
                                  "particleColor":  "#22D3EE",
                                  "floorColor":  "#0C2E47",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#061A28",
                                  "props":  "coral_bubbles",
                                  "skyColor":  "#030D14"
                              },
               "cleanEn":  "Hygiene \u0026 Personal Care Items",
               "cleanVi":  "Dụng cụ vệ sinh và Chăm sóc cá nhân",
               "stt":  13,
               "tier":  1,
               "biome":  "abyssal_ocean",
               "topicName":  "Dụng cụ vệ sinh và Chăm sóc cá nhân (Hygiene \u0026 Personal Care Items)"
           },
    "47":  {
               "minions":  [
                               {
                                   "def":  77,
                                   "name":  "Linh Hồn Đồ thủ công mỹ nghệ",
                                   "color":  "#38BDF8",
                                   "atk":  109,
                                   "type":  "minion_a",
                                   "hp":  413
                               },
                               {
                                   "def":  85,
                                   "name":  "Lính Gác Handicrafts",
                                   "color":  "#7DD3FC",
                                   "atk":  120,
                                   "type":  "minion_b",
                                   "hp":  475
                               },
                               {
                                   "def":  92,
                                   "name":  "Hộ Vệ Tinh Anh Đồ thủ công mỹ nghệ",
                                   "color":  "#FFFFFF",
                                   "atk":  136,
                                   "type":  "minion_c",
                                   "hp":  537
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  104,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Handicrafts",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Đồ thủ công mỹ nghệ!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Handicrafts!"
                                      ],
                            "name":  "BÁ CHỦ ĐỒ THỦ CÔNG MỸ NGHỆ: HANDICRAFTS TITAN",
                            "atk":  152,
                            "archetype":  "ancient_golem",
                            "baseHp":  2137,
                            "title":  "Bá Chủ Thống Trị Đồ thủ công mỹ nghệ"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Handicrafts",
               "cleanVi":  "Đồ thủ công mỹ nghệ",
               "stt":  47,
               "tier":  2,
               "biome":  "ancient_ruins",
               "topicName":  "Đồ thủ công mỹ nghệ (Handicrafts)"
           },
    "71":  {
               "minions":  [
                               {
                                   "def":  113,
                                   "name":  "Linh Hồn Vật lý và Các lực tự nhiên",
                                   "color":  "#8B5CF6",
                                   "atk":  156,
                                   "type":  "minion_a",
                                   "hp":  595
                               },
                               {
                                   "def":  124,
                                   "name":  "Lính Gác Physics \u0026 Natural Forces",
                                   "color":  "#C4B5FD",
                                   "atk":  172,
                                   "type":  "minion_b",
                                   "hp":  684
                               },
                               {
                                   "def":  136,
                                   "name":  "Hộ Vệ Tinh Anh Vật lý và Các lực tự nhiên",
                                   "color":  "#FFFFFF",
                                   "atk":  195,
                                   "type":  "minion_c",
                                   "hp":  774
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  145,
                            "color":  "#8B5CF6",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Physics \u0026 Natural Forces",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Vật lý và Các lực tự nhiên!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Physics \u0026 Natural Forces!"
                                      ],
                            "name":  "MA VƯƠNG VẬT LÝ VÀ CÁC LỰC TỰ NHIÊN: PHYSICS \u0026 NATURAL FORCES TITAN",
                            "atk":  208,
                            "archetype":  "cosmic_destroyer",
                            "baseHp":  2913,
                            "title":  "Bá Chủ Thống Trị Vật lý và Các lực tự nhiên"
                        },
               "background":  {
                                  "effect":  "shooting_stars",
                                  "particleColor":  "#C4B5FD",
                                  "floorColor":  "#0F0E30",
                                  "accentColor":  "#8B5CF6",
                                  "wallColor":  "#08071A",
                                  "props":  "nebula_planets",
                                  "skyColor":  "#04030D"
                              },
               "cleanEn":  "Physics \u0026 Natural Forces",
               "cleanVi":  "Vật lý và Các lực tự nhiên",
               "stt":  71,
               "tier":  3,
               "biome":  "deep_cosmos",
               "topicName":  "Vật lý và Các lực tự nhiên (Physics \u0026 Natural Forces)"
           },
    "77":  {
               "minions":  [
                               {
                                   "def":  121,
                                   "name":  "Ác Mộng Ứng dụng gọi xe và Dịch vụ giao hàng",
                                   "color":  "#58A6FF",
                                   "atk":  168,
                                   "type":  "minion_a",
                                   "hp":  641
                               },
                               {
                                   "def":  133,
                                   "name":  "Lính Gác Ride-hailing \u0026 Delivery Services",
                                   "color":  "#79C0FF",
                                   "atk":  185,
                                   "type":  "minion_b",
                                   "hp":  737
                               },
                               {
                                   "def":  145,
                                   "name":  "Hộ Vệ Tinh Anh Ứng dụng gọi xe và Dịch vụ giao hàng",
                                   "color":  "#FFFFFF",
                                   "atk":  210,
                                   "type":  "minion_c",
                                   "hp":  833
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  156,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Ride-hailing \u0026 Delivery Services",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Ứng dụng gọi xe và Dịch vụ giao hàng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Ride-hailing \u0026 Delivery Services!"
                                      ],
                            "name":  "BÁ CHỦ ỨNG DỤNG GỌI XE VÀ DỊCH VỤ GIAO HÀNG: RIDE-HAILING \u0026 DELIVERY SERVICES TITAN",
                            "atk":  222,
                            "archetype":  "cyber_overlord",
                            "baseHp":  3107,
                            "title":  "Bá Chủ Thống Trị Ứng dụng gọi xe và Dịch vụ giao hàng"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "Ride-hailing \u0026 Delivery Services",
               "cleanVi":  "Ứng dụng gọi xe và Dịch vụ giao hàng",
               "stt":  77,
               "tier":  4,
               "biome":  "cyber_arcade_city",
               "topicName":  "Ứng dụng gọi xe và Dịch vụ giao hàng (Ride-hailing \u0026 Delivery Services)"
           },
    "73":  {
               "minions":  [
                               {
                                   "def":  115,
                                   "name":  "Quái Thú Nông nghiệp và Trồng trọt",
                                   "color":  "#22C55E",
                                   "atk":  160,
                                   "type":  "minion_a",
                                   "hp":  610
                               },
                               {
                                   "def":  127,
                                   "name":  "Lính Gác Agriculture \u0026 Farming",
                                   "color":  "#86EFAC",
                                   "atk":  176,
                                   "type":  "minion_b",
                                   "hp":  702
                               },
                               {
                                   "def":  138,
                                   "name":  "Hộ Vệ Tinh Anh Nông nghiệp và Trồng trọt",
                                   "color":  "#FFFFFF",
                                   "atk":  200,
                                   "type":  "minion_c",
                                   "hp":  793
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  149,
                            "color":  "#22C55E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Agriculture \u0026 Farming",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Nông nghiệp và Trồng trọt!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Agriculture \u0026 Farming!"
                                      ],
                            "name":  "BÁ VƯƠNG NÔNG NGHIỆP VÀ TRỒNG TRỌT: AGRICULTURE \u0026 FARMING TITAN",
                            "atk":  212,
                            "archetype":  "ancient_dryad",
                            "baseHp":  2977,
                            "title":  "Bá Chủ Thống Trị Nông nghiệp và Trồng trọt"
                        },
               "background":  {
                                  "effect":  "spores_fireflies",
                                  "particleColor":  "#86EFAC",
                                  "floorColor":  "#14301F",
                                  "accentColor":  "#22C55E",
                                  "wallColor":  "#0B1D12",
                                  "props":  "giant_roots_mushrooms",
                                  "skyColor":  "#050F09"
                              },
               "cleanEn":  "Agriculture \u0026 Farming",
               "cleanVi":  "Nông nghiệp và Trồng trọt",
               "stt":  73,
               "tier":  3,
               "biome":  "primeval_forest",
               "topicName":  "Nông nghiệp và Trồng trọt (Agriculture \u0026 Farming)"
           },
    "91":  {
               "minions":  [
                               {
                                   "def":  142,
                                   "name":  "Hắc Thuật Chợ truyền thống và Siêu thị",
                                   "color":  "#EC4899",
                                   "atk":  195,
                                   "type":  "minion_a",
                                   "hp":  747
                               },
                               {
                                   "def":  156,
                                   "name":  "Lính Gác Traditional Markets \u0026 Supermarkets",
                                   "color":  "#F472B6",
                                   "atk":  215,
                                   "type":  "minion_b",
                                   "hp":  859
                               },
                               {
                                   "def":  170,
                                   "name":  "Hộ Vệ Tinh Anh Chợ truyền thống và Siêu thị",
                                   "color":  "#FFFFFF",
                                   "atk":  244,
                                   "type":  "minion_c",
                                   "hp":  971
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  180,
                            "color":  "#EC4899",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Traditional Markets \u0026 Supermarkets",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Chợ truyền thống và Siêu thị!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Traditional Markets \u0026 Supermarkets!"
                                      ],
                            "name":  "MA VƯƠNG CHỢ TRUYỀN THỐNG VÀ SIÊU THỊ: TRADITIONAL MARKETS \u0026 SUPERMARKETS TITAN",
                            "atk":  254,
                            "archetype":  "chaos_jester",
                            "baseHp":  3559,
                            "title":  "Bá Chủ Thống Trị Chợ truyền thống và Siêu thị"
                        },
               "background":  {
                                  "effect":  "confetti",
                                  "particleColor":  "#F472B6",
                                  "floorColor":  "#360E47",
                                  "accentColor":  "#EC4899",
                                  "wallColor":  "#21092B",
                                  "props":  "ferris_wheel_balloons",
                                  "skyColor":  "#110416"
                              },
               "cleanEn":  "Traditional Markets \u0026 Supermarkets",
               "cleanVi":  "Chợ truyền thống và Siêu thị",
               "stt":  91,
               "tier":  4,
               "biome":  "carnival_night",
               "topicName":  "Chợ truyền thống và Siêu thị (Traditional Markets \u0026 Supermarkets)"
           },
    "3":  {
              "minions":  [
                              {
                                  "def":  13,
                                  "name":  "Ớt Hiểm Quỷ Lửa",
                                  "color":  "#EF4444",
                                  "atk":  22,
                                  "type":  "chili_fiend",
                                  "hp":  80
                              },
                              {
                                  "def":  14,
                                  "name":  "Nấm Độc Ngàn Năm",
                                  "color":  "#F97316",
                                  "atk":  24,
                                  "type":  "toxic_shiitake",
                                  "hp":  92
                              },
                              {
                                  "def":  16,
                                  "name":  "Nồi Lẩu Sắt Rực Lửa",
                                  "color":  "#FFFFFF",
                                  "atk":  28,
                                  "type":  "hotpot_mimic",
                                  "hp":  104
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  28,
                           "color":  "#EF4444",
                           "skillName":  "Sóng Thần Nước Dùng Ớt Hiểm",
                           "roars":  [
                                         "Nước lẩu sôi sùng sục sẽ nấu chín ngươi!",
                                         "Cay xé lưỡi!"
                                     ],
                           "name":  "MA VƯƠNG LẨU TỨ XUYÊN: MAGMA LEVIATHAN",
                           "atk":  50,
                           "archetype":  "hotpot_behemoth",
                           "baseHp":  715,
                           "title":  "Thần Thú Nồi Lẩu Địa Ngục"
                       },
              "background":  {
                                 "effect":  "embers",
                                 "particleColor":  "#F97316",
                                 "floorColor":  "#42160F",
                                 "accentColor":  "#EF4444",
                                 "wallColor":  "#2A0E0A",
                                 "props":  "boiling_cauldron",
                                 "skyColor":  "#170604"
                             },
              "cleanEn":  "Culinary Arts \u0026 Hotpots",
              "cleanVi":  "Ẩm thực và Các loại lẩu",
              "stt":  3,
              "tier":  1,
              "biome":  "magma_hotpot",
              "topicName":  "Ẩm thực và Các loại lẩu (Culinary Arts \u0026 Hotpots)"
          },
    "8":  {
              "minions":  [
                              {
                                  "def":  20,
                                  "name":  "Hộp Quyên Góp Sắt",
                                  "color":  "#C084FC",
                                  "atk":  32,
                                  "type":  "donation_box_imp",
                                  "hp":  118
                              },
                              {
                                  "def":  22,
                                  "name":  "Dải Ruy Băng Vàng",
                                  "color":  "#E9D5FF",
                                  "atk":  35,
                                  "type":  "golden_ribbon",
                                  "hp":  136
                              },
                              {
                                  "def":  24,
                                  "name":  "Bóng Tình Nguyện Viên Vong",
                                  "color":  "#FFFFFF",
                                  "atk":  40,
                                  "type":  "spirit_volunteer",
                                  "hp":  153
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  37,
                           "color":  "#C084FC",
                           "skillName":  "Phán Quyết Lương Tâm Ánh Sáng",
                           "roars":  [
                                         "Tấm lòng từ thiện của ngươi có chân thật?",
                                         "Lòng vị tha hay kiêu ngạo!"
                                     ],
                           "name":  "THIÊN THẦN SA NGÃ: FALLEN SERAPH OF CHARITY",
                           "atk":  61,
                           "archetype":  "cathedral_archon",
                           "baseHp":  876,
                           "title":  "Kẻ Thử Thách Lòng Trắc Ẩn"
                       },
              "background":  {
                                 "effect":  "holy_radiance",
                                 "particleColor":  "#E9D5FF",
                                 "floorColor":  "#2C2845",
                                 "accentColor":  "#C084FC",
                                 "wallColor":  "#1A1829",
                                 "props":  "stained_glass_altar",
                                 "skyColor":  "#0D0C15"
                             },
              "cleanEn":  "Volunteer \u0026 Charity Organizations",
              "cleanVi":  "Các tổ chức tình nguyện và Từ thiện",
              "stt":  8,
              "tier":  1,
              "biome":  "sacred_cathedral",
              "topicName":  "Các tổ chức tình nguyện và Từ thiện (Volunteer \u0026 Charity Organizations)"
          },
    "12":  {
               "minions":  [
                               {
                                   "def":  26,
                                   "name":  "Cơ Giới Pháp luật và Các loại tội phạm",
                                   "color":  "#38BDF8",
                                   "atk":  40,
                                   "type":  "minion_a",
                                   "hp":  148
                               },
                               {
                                   "def":  29,
                                   "name":  "Lính Gác Law \u0026 Crimes",
                                   "color":  "#7DD3FC",
                                   "atk":  44,
                                   "type":  "minion_b",
                                   "hp":  170
                               },
                               {
                                   "def":  31,
                                   "name":  "Hộ Vệ Tinh Anh Pháp luật và Các loại tội phạm",
                                   "color":  "#FFFFFF",
                                   "atk":  50,
                                   "type":  "minion_c",
                                   "hp":  192
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  44,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Law \u0026 Crimes",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Pháp luật và Các loại tội phạm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Law \u0026 Crimes!"
                                      ],
                            "name":  "CỰ QUÁI PHÁP LUẬT VÀ CÁC LOẠI TỘI PHẠM: LAW \u0026 CRIMES TITAN",
                            "atk":  71,
                            "archetype":  "iron_judge",
                            "baseHp":  1006,
                            "title":  "Bá Chủ Thống Trị Pháp luật và Các loại tội phạm"
                        },
               "background":  {
                                  "effect":  "verdict_aura",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1E273B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#131926",
                                  "props":  "justice_scales",
                                  "skyColor":  "#0A0D14"
                              },
               "cleanEn":  "Law \u0026 Crimes",
               "cleanVi":  "Pháp luật và Các loại tội phạm",
               "stt":  12,
               "tier":  1,
               "biome":  "high_tribunal",
               "topicName":  "Pháp luật và Các loại tội phạm (Law \u0026 Crimes)"
           },
    "65":  {
               "minions":  [
                               {
                                   "def":  104,
                                   "name":  "Quái Thú Đồ điện tử dân dụng",
                                   "color":  "#58A6FF",
                                   "atk":  144,
                                   "type":  "minion_a",
                                   "hp":  550
                               },
                               {
                                   "def":  114,
                                   "name":  "Lính Gác Consumer Electronics",
                                   "color":  "#79C0FF",
                                   "atk":  158,
                                   "type":  "minion_b",
                                   "hp":  632
                               },
                               {
                                   "def":  125,
                                   "name":  "Hộ Vệ Tinh Anh Đồ điện tử dân dụng",
                                   "color":  "#FFFFFF",
                                   "atk":  180,
                                   "type":  "minion_c",
                                   "hp":  715
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  135,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Consumer Electronics",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Đồ điện tử dân dụng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Consumer Electronics!"
                                      ],
                            "name":  "THẦN MA ĐỒ ĐIỆN TỬ DÂN DỤNG: CONSUMER ELECTRONICS TITAN",
                            "atk":  194,
                            "archetype":  "cyber_overlord",
                            "baseHp":  2719,
                            "title":  "Bá Chủ Thống Trị Đồ điện tử dân dụng"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "Consumer Electronics",
               "cleanVi":  "Đồ điện tử dân dụng",
               "stt":  65,
               "tier":  3,
               "biome":  "cyber_arcade_city",
               "topicName":  "Đồ điện tử dân dụng (Consumer Electronics)"
           },
    "40":  {
               "minions":  [
                               {
                                   "def":  67,
                                   "name":  "Chiến Binh Trang thiết bị phòng thí nghiệm",
                                   "color":  "#10B981",
                                   "atk":  95,
                                   "type":  "minion_a",
                                   "hp":  360
                               },
                               {
                                   "def":  74,
                                   "name":  "Lính Gác Laboratory Equipment",
                                   "color":  "#34D399",
                                   "atk":  105,
                                   "type":  "minion_b",
                                   "hp":  414
                               },
                               {
                                   "def":  80,
                                   "name":  "Hộ Vệ Tinh Anh Trang thiết bị phòng thí nghiệm",
                                   "color":  "#FFFFFF",
                                   "atk":  119,
                                   "type":  "minion_c",
                                   "hp":  468
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  92,
                            "color":  "#10B981",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Laboratory Equipment",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Trang thiết bị phòng thí nghiệm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Laboratory Equipment!"
                                      ],
                            "name":  "ĐẠI THẦN TRANG THIẾT BỊ PHÒNG THÍ NGHIỆM: LABORATORY EQUIPMENT TITAN",
                            "atk":  136,
                            "archetype":  "plague_titan",
                            "baseHp":  1911,
                            "title":  "Bá Chủ Thống Trị Trang thiết bị phòng thí nghiệm"
                        },
               "background":  {
                                  "effect":  "ecg_pulse",
                                  "particleColor":  "#34D399",
                                  "floorColor":  "#123330",
                                  "accentColor":  "#10B981",
                                  "wallColor":  "#0A1F1D",
                                  "props":  "bio_vials_ecg",
                                  "skyColor":  "#051110"
                              },
               "cleanEn":  "Laboratory Equipment",
               "cleanVi":  "Trang thiết bị phòng thí nghiệm",
               "stt":  40,
               "tier":  2,
               "biome":  "medical_bio_lab",
               "topicName":  "Trang thiết bị phòng thí nghiệm (Laboratory Equipment)"
           },
    "14":  {
               "minions":  [
                               {
                                   "def":  29,
                                   "name":  "Bóng Ma Văn hóa và Phong tục tập quán",
                                   "color":  "#38BDF8",
                                   "atk":  44,
                                   "type":  "minion_a",
                                   "hp":  163
                               },
                               {
                                   "def":  32,
                                   "name":  "Lính Gác Cultures \u0026 Customs",
                                   "color":  "#7DD3FC",
                                   "atk":  48,
                                   "type":  "minion_b",
                                   "hp":  187
                               },
                               {
                                   "def":  35,
                                   "name":  "Hộ Vệ Tinh Anh Văn hóa và Phong tục tập quán",
                                   "color":  "#FFFFFF",
                                   "atk":  55,
                                   "type":  "minion_c",
                                   "hp":  212
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  47,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Cultures \u0026 Customs",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Văn hóa và Phong tục tập quán!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Cultures \u0026 Customs!"
                                      ],
                            "name":  "THẦN THÚ VĂN HÓA VÀ PHONG TỤC TẬP QUÁN: CULTURES \u0026 CUSTOMS TITAN",
                            "atk":  75,
                            "archetype":  "ancient_golem",
                            "baseHp":  1070,
                            "title":  "Bá Chủ Thống Trị Văn hóa và Phong tục tập quán"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Cultures \u0026 Customs",
               "cleanVi":  "Văn hóa và Phong tục tập quán",
               "stt":  14,
               "tier":  1,
               "biome":  "ancient_ruins",
               "topicName":  "Văn hóa và Phong tục tập quán (Cultures \u0026 Customs)"
           },
    "26":  {
               "minions":  [
                               {
                                   "def":  47,
                                   "name":  "Khổng Lồ Địa lý tự nhiên và Địa hình",
                                   "color":  "#38BDF8",
                                   "atk":  67,
                                   "type":  "minion_a",
                                   "hp":  254
                               },
                               {
                                   "def":  52,
                                   "name":  "Lính Gác Physical Geography \u0026 Topography",
                                   "color":  "#BAE6FD",
                                   "atk":  74,
                                   "type":  "minion_b",
                                   "hp":  292
                               },
                               {
                                   "def":  56,
                                   "name":  "Hộ Vệ Tinh Anh Địa lý tự nhiên và Địa hình",
                                   "color":  "#FFFFFF",
                                   "atk":  84,
                                   "type":  "minion_c",
                                   "hp":  330
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  68,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Physical Geography \u0026 Topography",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Địa lý tự nhiên và Địa hình!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Physical Geography \u0026 Topography!"
                                      ],
                            "name":  "CHÚA TỂ ĐỊA LÝ TỰ NHIÊN VÀ ĐỊA HÌNH: PHYSICAL GEOGRAPHY \u0026 TOPOGRAPHY TITAN",
                            "atk":  103,
                            "archetype":  "avalanche_behemoth",
                            "baseHp":  1458,
                            "title":  "Bá Chủ Thống Trị Địa lý tự nhiên và Địa hình"
                        },
               "background":  {
                                  "effect":  "snowfall",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#1E293B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F172A",
                                  "props":  "snow_pine_cliffs",
                                  "skyColor":  "#080C16"
                              },
               "cleanEn":  "Physical Geography \u0026 Topography",
               "cleanVi":  "Địa lý tự nhiên và Địa hình",
               "stt":  26,
               "tier":  2,
               "biome":  "alpine_peaks",
               "topicName":  "Địa lý tự nhiên và Địa hình (Physical Geography \u0026 Topography)"
           },
    "17":  {
               "minions":  [
                               {
                                   "def":  33,
                                   "name":  "Quái Thú Báo chí và Phương tiện truyền thông",
                                   "color":  "#E11D48",
                                   "atk":  50,
                                   "type":  "minion_a",
                                   "hp":  186
                               },
                               {
                                   "def":  36,
                                   "name":  "Lính Gác Media \u0026 Broadcasting",
                                   "color":  "#F43F5E",
                                   "atk":  55,
                                   "type":  "minion_b",
                                   "hp":  214
                               },
                               {
                                   "def":  40,
                                   "name":  "Hộ Vệ Tinh Anh Báo chí và Phương tiện truyền thông",
                                   "color":  "#FFFFFF",
                                   "atk":  62,
                                   "type":  "minion_c",
                                   "hp":  242
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  52,
                            "color":  "#E11D48",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Media \u0026 Broadcasting",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Báo chí và Phương tiện truyền thông!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Media \u0026 Broadcasting!"
                                      ],
                            "name":  "BÁ CHỦ BÁO CHÍ VÀ PHƯƠNG TIỆN TRUYỀN THÔNG: MEDIA \u0026 BROADCASTING TITAN",
                            "atk":  82,
                            "archetype":  "broadcast_overlord",
                            "baseHp":  1167,
                            "title":  "Bá Chủ Thống Trị Báo chí và Phương tiện truyền thông"
                        },
               "background":  {
                                  "effect":  "crt_static",
                                  "particleColor":  "#F43F5E",
                                  "floorColor":  "#1F2937",
                                  "accentColor":  "#E11D48",
                                  "wallColor":  "#111827",
                                  "props":  "cameras_monitors",
                                  "skyColor":  "#090D14"
                              },
               "cleanEn":  "Media \u0026 Broadcasting",
               "cleanVi":  "Báo chí và Phương tiện truyền thông",
               "stt":  17,
               "tier":  1,
               "biome":  "broadcast_studio",
               "topicName":  "Báo chí và Phương tiện truyền thông (Media \u0026 Broadcasting)"
           },
    "28":  {
               "minions":  [
                               {
                                   "def":  50,
                                   "name":  "Cơ Giới Các loại nhạc cụ",
                                   "color":  "#F43F5E",
                                   "atk":  71,
                                   "type":  "minion_a",
                                   "hp":  270
                               },
                               {
                                   "def":  55,
                                   "name":  "Lính Gác Musical Instruments",
                                   "color":  "#FDA4AF",
                                   "atk":  78,
                                   "type":  "minion_b",
                                   "hp":  310
                               },
                               {
                                   "def":  60,
                                   "name":  "Hộ Vệ Tinh Anh Các loại nhạc cụ",
                                   "color":  "#FFFFFF",
                                   "atk":  89,
                                   "type":  "minion_c",
                                   "hp":  351
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  71,
                            "color":  "#F43F5E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Musical Instruments",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các loại nhạc cụ!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Musical Instruments!"
                                      ],
                            "name":  "HOÀNG ĐẾ CÁC LOẠI NHẠC CỤ: MUSICAL INSTRUMENTS TITAN",
                            "atk":  108,
                            "archetype":  "virtuoso_maestro",
                            "baseHp":  1523,
                            "title":  "Bá Chủ Thống Trị Các loại nhạc cụ"
                        },
               "background":  {
                                  "effect":  "music_notes",
                                  "particleColor":  "#FDA4AF",
                                  "floorColor":  "#381729",
                                  "accentColor":  "#F43F5E",
                                  "wallColor":  "#210E18",
                                  "props":  "pipe_organ_violins",
                                  "skyColor":  "#11070C"
                              },
               "cleanEn":  "Musical Instruments",
               "cleanVi":  "Các loại nhạc cụ",
               "stt":  28,
               "tier":  2,
               "biome":  "grand_symphony",
               "topicName":  "Các loại nhạc cụ (Musical Instruments)"
           },
    "99":  {
               "minions":  [
                               {
                                   "def":  154,
                                   "name":  "Hắc Thuật Công viên và Không gian xanh",
                                   "color":  "#22C55E",
                                   "atk":  211,
                                   "type":  "minion_a",
                                   "hp":  807
                               },
                               {
                                   "def":  169,
                                   "name":  "Lính Gác Parks \u0026 Green Spaces",
                                   "color":  "#86EFAC",
                                   "atk":  232,
                                   "type":  "minion_b",
                                   "hp":  928
                               },
                               {
                                   "def":  185,
                                   "name":  "Hộ Vệ Tinh Anh Công viên và Không gian xanh",
                                   "color":  "#FFFFFF",
                                   "atk":  264,
                                   "type":  "minion_c",
                                   "hp":  1049
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  193,
                            "color":  "#22C55E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Parks \u0026 Green Spaces",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Công viên và Không gian xanh!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Parks \u0026 Green Spaces!"
                                      ],
                            "name":  "HẮC THẦN CÔNG VIÊN VÀ KHÔNG GIAN XANH: PARKS \u0026 GREEN SPACES TITAN",
                            "atk":  273,
                            "archetype":  "ancient_dryad",
                            "baseHp":  3818,
                            "title":  "Bá Chủ Thống Trị Công viên và Không gian xanh"
                        },
               "background":  {
                                  "effect":  "spores_fireflies",
                                  "particleColor":  "#86EFAC",
                                  "floorColor":  "#14301F",
                                  "accentColor":  "#22C55E",
                                  "wallColor":  "#0B1D12",
                                  "props":  "giant_roots_mushrooms",
                                  "skyColor":  "#050F09"
                              },
               "cleanEn":  "Parks \u0026 Green Spaces",
               "cleanVi":  "Công viên và Không gian xanh",
               "stt":  99,
               "tier":  4,
               "biome":  "primeval_forest",
               "topicName":  "Công viên và Không gian xanh (Parks \u0026 Green Spaces)"
           },
    "76":  {
               "minions":  [
                               {
                                   "def":  120,
                                   "name":  "Cơ Giới Thương mại điện tử và Mua sắm trực tuyến",
                                   "color":  "#58A6FF",
                                   "atk":  166,
                                   "type":  "minion_a",
                                   "hp":  633
                               },
                               {
                                   "def":  132,
                                   "name":  "Lính Gác E-commerce \u0026 Online Shopping",
                                   "color":  "#79C0FF",
                                   "atk":  183,
                                   "type":  "minion_b",
                                   "hp":  728
                               },
                               {
                                   "def":  144,
                                   "name":  "Hộ Vệ Tinh Anh Thương mại điện tử và Mua sắm trực tuyến",
                                   "color":  "#FFFFFF",
                                   "atk":  208,
                                   "type":  "minion_c",
                                   "hp":  823
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  154,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ E-commerce \u0026 Online Shopping",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thương mại điện tử và Mua sắm trực tuyến!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua E-commerce \u0026 Online Shopping!"
                                      ],
                            "name":  "CHÚA TỂ THƯƠNG MẠI ĐIỆN TỬ VÀ MUA SẮM TRỰC TUYẾN: E-COMMERCE \u0026 ONLINE SHOPPING TITAN",
                            "atk":  219,
                            "archetype":  "cyber_overlord",
                            "baseHp":  3074,
                            "title":  "Bá Chủ Thống Trị Thương mại điện tử và Mua sắm trực tuyến"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "E-commerce \u0026 Online Shopping",
               "cleanVi":  "Thương mại điện tử và Mua sắm trực tuyến",
               "stt":  76,
               "tier":  4,
               "biome":  "cyber_arcade_city",
               "topicName":  "Thương mại điện tử và Mua sắm trực tuyến (E-commerce \u0026 Online Shopping)"
           },
    "36":  {
               "minions":  [
                               {
                                   "def":  61,
                                   "name":  "Cơ Giới Điện ảnh và Phim trường",
                                   "color":  "#E11D48",
                                   "atk":  87,
                                   "type":  "minion_a",
                                   "hp":  330
                               },
                               {
                                   "def":  67,
                                   "name":  "Lính Gác Cinema \u0026 Movie Sets",
                                   "color":  "#F43F5E",
                                   "atk":  96,
                                   "type":  "minion_b",
                                   "hp":  379
                               },
                               {
                                   "def":  73,
                                   "name":  "Hộ Vệ Tinh Anh Điện ảnh và Phim trường",
                                   "color":  "#FFFFFF",
                                   "atk":  109,
                                   "type":  "minion_c",
                                   "hp":  429
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  85,
                            "color":  "#E11D48",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Cinema \u0026 Movie Sets",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Điện ảnh và Phim trường!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Cinema \u0026 Movie Sets!"
                                      ],
                            "name":  "CHÚA TỂ ĐIỆN ẢNH VÀ PHIM TRƯỜNG: CINEMA \u0026 MOVIE SETS TITAN",
                            "atk":  126,
                            "archetype":  "broadcast_overlord",
                            "baseHp":  1781,
                            "title":  "Bá Chủ Thống Trị Điện ảnh và Phim trường"
                        },
               "background":  {
                                  "effect":  "crt_static",
                                  "particleColor":  "#F43F5E",
                                  "floorColor":  "#1F2937",
                                  "accentColor":  "#E11D48",
                                  "wallColor":  "#111827",
                                  "props":  "cameras_monitors",
                                  "skyColor":  "#090D14"
                              },
               "cleanEn":  "Cinema \u0026 Movie Sets",
               "cleanVi":  "Điện ảnh và Phim trường",
               "stt":  36,
               "tier":  2,
               "biome":  "broadcast_studio",
               "topicName":  "Điện ảnh và Phim trường (Cinema \u0026 Movie Sets)"
           },
    "4":  {
              "minions":  [
                              {
                                  "def":  14,
                                  "name":  "Bóng Ma Di Ảnh",
                                  "color":  "#D97706",
                                  "atk":  24,
                                  "type":  "portrait_ghost",
                                  "hp":  88
                              },
                              {
                                  "def":  15,
                                  "name":  "Hộp Nhạc Kỷ Vật",
                                  "color":  "#FDE68A",
                                  "atk":  26,
                                  "type":  "relic_musicbox",
                                  "hp":  101
                              },
                              {
                                  "def":  17,
                                  "name":  "Búp Bê Gia Truyền",
                                  "color":  "#FFFFFF",
                                  "atk":  30,
                                  "type":  "heirloom_doll",
                                  "hp":  114
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  30,
                           "color":  "#D97706",
                           "skillName":  "Tiếng Gầm Gia Phả Huyết Thống",
                           "roars":  [
                                         "Ngươi không có tư cách bước vào gia phả!",
                                         "Truyền thống ngàn năm!"
                                     ],
                           "name":  "GIA TRƯỞNG CỔ ĐẠI: PATRIARCH PHANTOM",
                           "atk":  52,
                           "archetype":  "patriarch_phantom",
                           "baseHp":  747,
                           "title":  "Linh Hồn Gia Tộc Bất Diệt"
                       },
              "background":  {
                                 "effect":  "clock_tick",
                                 "particleColor":  "#FDE68A",
                                 "floorColor":  "#332A22",
                                 "accentColor":  "#D97706",
                                 "wallColor":  "#1F1A15",
                                 "props":  "family_portraits",
                                 "skyColor":  "#100D0B"
                             },
              "cleanEn":  "Family \u0026 Relatives",
              "cleanVi":  "Gia đình và Người thân",
              "stt":  4,
              "tier":  1,
              "biome":  "ancestral_manor",
              "topicName":  "Gia đình và Người thân (Family \u0026 Relatives)"
          },
    "50":  {
               "minions":  [
                               {
                                   "def":  82,
                                   "name":  "Khổng Lồ Nhạc kịch và Sân khấu kịch",
                                   "color":  "#F43F5E",
                                   "atk":  115,
                                   "type":  "minion_a",
                                   "hp":  436
                               },
                               {
                                   "def":  90,
                                   "name":  "Lính Gác Musicals \u0026 Theater",
                                   "color":  "#FDA4AF",
                                   "atk":  127,
                                   "type":  "minion_b",
                                   "hp":  501
                               },
                               {
                                   "def":  98,
                                   "name":  "Hộ Vệ Tinh Anh Nhạc kịch và Sân khấu kịch",
                                   "color":  "#FFFFFF",
                                   "atk":  144,
                                   "type":  "minion_c",
                                   "hp":  567
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  109,
                            "color":  "#F43F5E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Musicals \u0026 Theater",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Nhạc kịch và Sân khấu kịch!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Musicals \u0026 Theater!"
                                      ],
                            "name":  "ĐẠI THẦN NHẠC KỊCH VÀ SÂN KHẤU KỊCH: MUSICALS \u0026 THEATER TITAN",
                            "atk":  159,
                            "archetype":  "virtuoso_maestro",
                            "baseHp":  2234,
                            "title":  "Bá Chủ Thống Trị Nhạc kịch và Sân khấu kịch"
                        },
               "background":  {
                                  "effect":  "music_notes",
                                  "particleColor":  "#FDA4AF",
                                  "floorColor":  "#381729",
                                  "accentColor":  "#F43F5E",
                                  "wallColor":  "#210E18",
                                  "props":  "pipe_organ_violins",
                                  "skyColor":  "#11070C"
                              },
               "cleanEn":  "Musicals \u0026 Theater",
               "cleanVi":  "Nhạc kịch và Sân khấu kịch",
               "stt":  50,
               "tier":  2,
               "biome":  "grand_symphony",
               "topicName":  "Nhạc kịch và Sân khấu kịch (Musicals \u0026 Theater)"
           },
    "45":  {
               "minions":  [
                               {
                                   "def":  74,
                                   "name":  "Ác Mộng Thể thao mạo hiểm",
                                   "color":  "#84CC16",
                                   "atk":  105,
                                   "type":  "minion_a",
                                   "hp":  398
                               },
                               {
                                   "def":  81,
                                   "name":  "Lính Gác Extreme Sports",
                                   "color":  "#A3E635",
                                   "atk":  116,
                                   "type":  "minion_b",
                                   "hp":  458
                               },
                               {
                                   "def":  89,
                                   "name":  "Hộ Vệ Tinh Anh Thể thao mạo hiểm",
                                   "color":  "#FFFFFF",
                                   "atk":  131,
                                   "type":  "minion_c",
                                   "hp":  517
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  101,
                            "color":  "#84CC16",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Extreme Sports",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thể thao mạo hiểm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Extreme Sports!"
                                      ],
                            "name":  "THẦN MA THỂ THAO MẠO HIỂM: EXTREME SPORTS TITAN",
                            "atk":  147,
                            "archetype":  "gladiator_champion",
                            "baseHp":  2072,
                            "title":  "Bá Chủ Thống Trị Thể thao mạo hiểm"
                        },
               "background":  {
                                  "effect":  "wind_gusts",
                                  "particleColor":  "#A3E635",
                                  "floorColor":  "#33362E",
                                  "accentColor":  "#84CC16",
                                  "wallColor":  "#1E201B",
                                  "props":  "stadium_lights",
                                  "skyColor":  "#0F100D"
                              },
               "cleanEn":  "Extreme Sports",
               "cleanVi":  "Thể thao mạo hiểm",
               "stt":  45,
               "tier":  2,
               "biome":  "colosseum_arena",
               "topicName":  "Thể thao mạo hiểm (Extreme Sports)"
           },
    "60":  {
               "minions":  [
                               {
                                   "def":  96,
                                   "name":  "Cơ Giới Bảo vệ môi trường và Rác thải",
                                   "color":  "#84CC16",
                                   "atk":  134,
                                   "type":  "minion_a",
                                   "hp":  512
                               },
                               {
                                   "def":  106,
                                   "name":  "Lính Gác Environmental Protection \u0026 Waste",
                                   "color":  "#BEF264",
                                   "atk":  147,
                                   "type":  "minion_b",
                                   "hp":  589
                               },
                               {
                                   "def":  115,
                                   "name":  "Hộ Vệ Tinh Anh Bảo vệ môi trường và Rác thải",
                                   "color":  "#FFFFFF",
                                   "atk":  168,
                                   "type":  "minion_c",
                                   "hp":  666
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  126,
                            "color":  "#84CC16",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Environmental Protection \u0026 Waste",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Bảo vệ môi trường và Rác thải!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Environmental Protection \u0026 Waste!"
                                      ],
                            "name":  "ĐẠI THẦN BẢO VỆ MÔI TRƯỜNG VÀ RÁC THẢI: ENVIRONMENTAL PROTECTION \u0026 WASTE TITAN",
                            "atk":  182,
                            "archetype":  "mutagen_horror",
                            "baseHp":  2557,
                            "title":  "Bá Chủ Thống Trị Bảo vệ môi trường và Rác thải"
                        },
               "background":  {
                                  "effect":  "toxic_smoke",
                                  "particleColor":  "#BEF264",
                                  "floorColor":  "#1A301A",
                                  "accentColor":  "#84CC16",
                                  "wallColor":  "#101D10",
                                  "props":  "acid_vats_pipes",
                                  "skyColor":  "#080F08"
                              },
               "cleanEn":  "Environmental Protection \u0026 Waste",
               "cleanVi":  "Bảo vệ môi trường và Rác thải",
               "stt":  60,
               "tier":  3,
               "biome":  "toxic_reactor",
               "topicName":  "Bảo vệ môi trường và Rác thải (Environmental Protection \u0026 Waste)"
           },
    "38":  {
               "minions":  [
                               {
                                   "def":  64,
                                   "name":  "Bóng Ma Ký túc xá và Không gian lưu trú sinh viên",
                                   "color":  "#F59E0B",
                                   "atk":  91,
                                   "type":  "minion_a",
                                   "hp":  345
                               },
                               {
                                   "def":  70,
                                   "name":  "Lính Gác Dormitories \u0026 Student Housing",
                                   "color":  "#FDE68A",
                                   "atk":  100,
                                   "type":  "minion_b",
                                   "hp":  397
                               },
                               {
                                   "def":  77,
                                   "name":  "Hộ Vệ Tinh Anh Ký túc xá và Không gian lưu trú sinh viên",
                                   "color":  "#FFFFFF",
                                   "atk":  114,
                                   "type":  "minion_c",
                                   "hp":  448
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  89,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Dormitories \u0026 Student Housing",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Ký túc xá và Không gian lưu trú sinh viên!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Dormitories \u0026 Student Housing!"
                                      ],
                            "name":  "HOÀNG ĐẾ KÝ TÚC XÁ VÀ KHÔNG GIAN LƯU TRÚ SINH VIÊN: DORMITORIES \u0026 STUDENT HOUSING TITAN",
                            "atk":  131,
                            "archetype":  "scholar_lich",
                            "baseHp":  1846,
                            "title":  "Bá Chủ Thống Trị Ký túc xá và Không gian lưu trú sinh viên"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Dormitories \u0026 Student Housing",
               "cleanVi":  "Ký túc xá và Không gian lưu trú sinh viên",
               "stt":  38,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Ký túc xá và Không gian lưu trú sinh viên (Dormitories \u0026 Student Housing)"
           },
    "83":  {
               "minions":  [
                               {
                                   "def":  130,
                                   "name":  "Hắc Thuật Kế toán và Quản lý tài chính",
                                   "color":  "#EAB308",
                                   "atk":  180,
                                   "type":  "minion_a",
                                   "hp":  686
                               },
                               {
                                   "def":  143,
                                   "name":  "Lính Gác Accounting \u0026 Financial Management",
                                   "color":  "#FEF08A",
                                   "atk":  198,
                                   "type":  "minion_b",
                                   "hp":  789
                               },
                               {
                                   "def":  156,
                                   "name":  "Hộ Vệ Tinh Anh Kế toán và Quản lý tài chính",
                                   "color":  "#FFFFFF",
                                   "atk":  225,
                                   "type":  "minion_c",
                                   "hp":  892
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  166,
                            "color":  "#EAB308",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Accounting \u0026 Financial Management",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Kế toán và Quản lý tài chính!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Accounting \u0026 Financial Management!"
                                      ],
                            "name":  "BÁ VƯƠNG KẾ TOÁN VÀ QUẢN LÝ TÀI CHÍNH: ACCOUNTING \u0026 FINANCIAL MANAGEMENT TITAN",
                            "atk":  236,
                            "archetype":  "midas_gold_dragon",
                            "baseHp":  3301,
                            "title":  "Bá Chủ Thống Trị Kế toán và Quản lý tài chính"
                        },
               "background":  {
                                  "effect":  "gold_sparkle",
                                  "particleColor":  "#FEF08A",
                                  "floorColor":  "#382B14",
                                  "accentColor":  "#EAB308",
                                  "wallColor":  "#221A0C",
                                  "props":  "gold_bars_safes",
                                  "skyColor":  "#110D06"
                              },
               "cleanEn":  "Accounting \u0026 Financial Management",
               "cleanVi":  "Kế toán và Quản lý tài chính",
               "stt":  83,
               "tier":  4,
               "biome":  "gold_bullion_vault",
               "topicName":  "Kế toán và Quản lý tài chính (Accounting \u0026 Financial Management)"
           },
    "85":  {
               "minions":  [
                               {
                                   "def":  133,
                                   "name":  "Ác Mộng Sân bay và Hàng không",
                                   "color":  "#38BDF8",
                                   "atk":  183,
                                   "type":  "minion_a",
                                   "hp":  701
                               },
                               {
                                   "def":  146,
                                   "name":  "Lính Gác Airports \u0026 Aviation",
                                   "color":  "#BAE6FD",
                                   "atk":  201,
                                   "type":  "minion_b",
                                   "hp":  806
                               },
                               {
                                   "def":  160,
                                   "name":  "Hộ Vệ Tinh Anh Sân bay và Hàng không",
                                   "color":  "#FFFFFF",
                                   "atk":  229,
                                   "type":  "minion_c",
                                   "hp":  911
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  169,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Airports \u0026 Aviation",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Sân bay và Hàng không!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Airports \u0026 Aviation!"
                                      ],
                            "name":  "THẦN MA SÂN BAY VÀ HÀNG KHÔNG: AIRPORTS \u0026 AVIATION TITAN",
                            "atk":  240,
                            "archetype":  "skyline_zephyr_behemoth",
                            "baseHp":  3365,
                            "title":  "Bá Chủ Thống Trị Sân bay và Hàng không"
                        },
               "background":  {
                                  "effect":  "beacon_lights",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#182436",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F1722",
                                  "props":  "runway_control_tower",
                                  "skyColor":  "#070B11"
                              },
               "cleanEn":  "Airports \u0026 Aviation",
               "cleanVi":  "Sân bay và Hàng không",
               "stt":  85,
               "tier":  4,
               "biome":  "skyport_terminal",
               "topicName":  "Sân bay và Hàng không (Airports \u0026 Aviation)"
           },
    "96":  {
               "minions":  [
                               {
                                   "def":  149,
                                   "name":  "Chiến Binh Phụ tùng ô tô và Xe máy",
                                   "color":  "#38BDF8",
                                   "atk":  205,
                                   "type":  "minion_a",
                                   "hp":  785
                               },
                               {
                                   "def":  164,
                                   "name":  "Lính Gác Auto \u0026 Motorcycle Parts",
                                   "color":  "#7DD3FC",
                                   "atk":  226,
                                   "type":  "minion_b",
                                   "hp":  903
                               },
                               {
                                   "def":  179,
                                   "name":  "Hộ Vệ Tinh Anh Phụ tùng ô tô và Xe máy",
                                   "color":  "#FFFFFF",
                                   "atk":  256,
                                   "type":  "minion_c",
                                   "hp":  1020
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  188,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Auto \u0026 Motorcycle Parts",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Phụ tùng ô tô và Xe máy!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Auto \u0026 Motorcycle Parts!"
                                      ],
                            "name":  "CHÚA TỂ PHỤ TÙNG Ô TÔ VÀ XE MÁY: AUTO \u0026 MOTORCYCLE PARTS TITAN",
                            "atk":  266,
                            "archetype":  "turbo_highway_wyrm",
                            "baseHp":  3721,
                            "title":  "Bá Chủ Thống Trị Phụ tùng ô tô và Xe máy"
                        },
               "background":  {
                                  "effect":  "headlights",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1D222E",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#12151C",
                                  "props":  "highway_overpass",
                                  "skyColor":  "#090B0E"
                              },
               "cleanEn":  "Auto \u0026 Motorcycle Parts",
               "cleanVi":  "Phụ tùng ô tô và Xe máy",
               "stt":  96,
               "tier":  4,
               "biome":  "metropolis_freeway",
               "topicName":  "Phụ tùng ô tô và Xe máy (Auto \u0026 Motorcycle Parts)"
           },
    "82":  {
               "minions":  [
                               {
                                   "def":  129,
                                   "name":  "Khổng Lồ Tiền tệ và Ngân hàng",
                                   "color":  "#EAB308",
                                   "atk":  178,
                                   "type":  "minion_a",
                                   "hp":  679
                               },
                               {
                                   "def":  142,
                                   "name":  "Lính Gác Currency \u0026 Banking",
                                   "color":  "#FEF08A",
                                   "atk":  196,
                                   "type":  "minion_b",
                                   "hp":  781
                               },
                               {
                                   "def":  155,
                                   "name":  "Hộ Vệ Tinh Anh Tiền tệ và Ngân hàng",
                                   "color":  "#FFFFFF",
                                   "atk":  222,
                                   "type":  "minion_c",
                                   "hp":  883
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  164,
                            "color":  "#EAB308",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Currency \u0026 Banking",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Tiền tệ và Ngân hàng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Currency \u0026 Banking!"
                                      ],
                            "name":  "CỰ QUÁI TIỀN TỆ VÀ NGÂN HÀNG: CURRENCY \u0026 BANKING TITAN",
                            "atk":  233,
                            "archetype":  "midas_gold_dragon",
                            "baseHp":  3268,
                            "title":  "Bá Chủ Thống Trị Tiền tệ và Ngân hàng"
                        },
               "background":  {
                                  "effect":  "gold_sparkle",
                                  "particleColor":  "#FEF08A",
                                  "floorColor":  "#382B14",
                                  "accentColor":  "#EAB308",
                                  "wallColor":  "#221A0C",
                                  "props":  "gold_bars_safes",
                                  "skyColor":  "#110D06"
                              },
               "cleanEn":  "Currency \u0026 Banking",
               "cleanVi":  "Tiền tệ và Ngân hàng",
               "stt":  82,
               "tier":  4,
               "biome":  "gold_bullion_vault",
               "topicName":  "Tiền tệ và Ngân hàng (Currency \u0026 Banking)"
           },
    "23":  {
               "minions":  [
                               {
                                   "def":  42,
                                   "name":  "Linh Hồn Dụng cụ tập thể hình",
                                   "color":  "#38BDF8",
                                   "atk":  61,
                                   "type":  "minion_a",
                                   "hp":  232
                               },
                               {
                                   "def":  46,
                                   "name":  "Lính Gác Gym \u0026 Fitness Equipment",
                                   "color":  "#7DD3FC",
                                   "atk":  67,
                                   "type":  "minion_b",
                                   "hp":  267
                               },
                               {
                                   "def":  50,
                                   "name":  "Hộ Vệ Tinh Anh Dụng cụ tập thể hình",
                                   "color":  "#FFFFFF",
                                   "atk":  76,
                                   "type":  "minion_c",
                                   "hp":  302
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  63,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Gym \u0026 Fitness Equipment",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Dụng cụ tập thể hình!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Gym \u0026 Fitness Equipment!"
                                      ],
                            "name":  "BÁ VƯƠNG DỤNG CỤ TẬP THỂ HÌNH: GYM \u0026 FITNESS EQUIPMENT TITAN",
                            "atk":  96,
                            "archetype":  "ancient_golem",
                            "baseHp":  1361,
                            "title":  "Bá Chủ Thống Trị Dụng cụ tập thể hình"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Gym \u0026 Fitness Equipment",
               "cleanVi":  "Dụng cụ tập thể hình",
               "stt":  23,
               "tier":  1,
               "biome":  "ancient_ruins",
               "topicName":  "Dụng cụ tập thể hình (Gym \u0026 Fitness Equipment)"
           },
    "51":  {
               "minions":  [
                               {
                                   "def":  83,
                                   "name":  "Hắc Thuật Khám phá vùng đồi núi",
                                   "color":  "#38BDF8",
                                   "atk":  116,
                                   "type":  "minion_a",
                                   "hp":  444
                               },
                               {
                                   "def":  91,
                                   "name":  "Lính Gác Mountain Exploration",
                                   "color":  "#BAE6FD",
                                   "atk":  128,
                                   "type":  "minion_b",
                                   "hp":  511
                               },
                               {
                                   "def":  100,
                                   "name":  "Hộ Vệ Tinh Anh Khám phá vùng đồi núi",
                                   "color":  "#FFFFFF",
                                   "atk":  145,
                                   "type":  "minion_c",
                                   "hp":  577
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  111,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Mountain Exploration",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Khám phá vùng đồi núi!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Mountain Exploration!"
                                      ],
                            "name":  "MA VƯƠNG KHÁM PHÁ VÙNG ĐỒI NÚI: MOUNTAIN EXPLORATION TITAN",
                            "atk":  161,
                            "archetype":  "avalanche_behemoth",
                            "baseHp":  2266,
                            "title":  "Bá Chủ Thống Trị Khám phá vùng đồi núi"
                        },
               "background":  {
                                  "effect":  "snowfall",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#1E293B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F172A",
                                  "props":  "snow_pine_cliffs",
                                  "skyColor":  "#080C16"
                              },
               "cleanEn":  "Mountain Exploration",
               "cleanVi":  "Khám phá vùng đồi núi",
               "stt":  51,
               "tier":  3,
               "biome":  "alpine_peaks",
               "topicName":  "Khám phá vùng đồi núi (Mountain Exploration)"
           },
    "92":  {
               "minions":  [
                               {
                                   "def":  143,
                                   "name":  "Cơ Giới Hợp đồng và Văn bản pháp lý",
                                   "color":  "#38BDF8",
                                   "atk":  197,
                                   "type":  "minion_a",
                                   "hp":  754
                               },
                               {
                                   "def":  157,
                                   "name":  "Lính Gác Contracts \u0026 Legal Documents",
                                   "color":  "#7DD3FC",
                                   "atk":  217,
                                   "type":  "minion_b",
                                   "hp":  867
                               },
                               {
                                   "def":  172,
                                   "name":  "Hộ Vệ Tinh Anh Hợp đồng và Văn bản pháp lý",
                                   "color":  "#FFFFFF",
                                   "atk":  246,
                                   "type":  "minion_c",
                                   "hp":  980
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  181,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Contracts \u0026 Legal Documents",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hợp đồng và Văn bản pháp lý!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Contracts \u0026 Legal Documents!"
                                      ],
                            "name":  "CỰ QUÁI HỢP ĐỒNG VÀ VĂN BẢN PHÁP LÝ: CONTRACTS \u0026 LEGAL DOCUMENTS TITAN",
                            "atk":  256,
                            "archetype":  "iron_judge",
                            "baseHp":  3591,
                            "title":  "Bá Chủ Thống Trị Hợp đồng và Văn bản pháp lý"
                        },
               "background":  {
                                  "effect":  "verdict_aura",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1E273B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#131926",
                                  "props":  "justice_scales",
                                  "skyColor":  "#0A0D14"
                              },
               "cleanEn":  "Contracts \u0026 Legal Documents",
               "cleanVi":  "Hợp đồng và Văn bản pháp lý",
               "stt":  92,
               "tier":  4,
               "biome":  "high_tribunal",
               "topicName":  "Hợp đồng và Văn bản pháp lý (Contracts \u0026 Legal Documents)"
           },
    "20":  {
               "minions":  [
                               {
                                   "def":  38,
                                   "name":  "Cơ Giới Phòng ngủ và Giấc ngủ",
                                   "color":  "#38BDF8",
                                   "atk":  55,
                                   "type":  "minion_a",
                                   "hp":  209
                               },
                               {
                                   "def":  42,
                                   "name":  "Lính Gác Bedrooms \u0026 Sleep",
                                   "color":  "#7DD3FC",
                                   "atk":  61,
                                   "type":  "minion_b",
                                   "hp":  240
                               },
                               {
                                   "def":  46,
                                   "name":  "Hộ Vệ Tinh Anh Phòng ngủ và Giấc ngủ",
                                   "color":  "#FFFFFF",
                                   "atk":  69,
                                   "type":  "minion_c",
                                   "hp":  272
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  58,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Bedrooms \u0026 Sleep",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Phòng ngủ và Giấc ngủ!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Bedrooms \u0026 Sleep!"
                                      ],
                            "name":  "ĐẠI THẦN PHÒNG NGỦ VÀ GIẤC NGỦ: BEDROOMS \u0026 SLEEP TITAN",
                            "atk":  89,
                            "archetype":  "ancient_golem",
                            "baseHp":  1264,
                            "title":  "Bá Chủ Thống Trị Phòng ngủ và Giấc ngủ"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Bedrooms \u0026 Sleep",
               "cleanVi":  "Phòng ngủ và Giấc ngủ",
               "stt":  20,
               "tier":  1,
               "biome":  "ancient_ruins",
               "topicName":  "Phòng ngủ và Giấc ngủ (Bedrooms \u0026 Sleep)"
           },
    "59":  {
               "minions":  [
                               {
                                   "def":  95,
                                   "name":  "Hắc Thuật Các loại khoáng sản và Đá",
                                   "color":  "#A855F7",
                                   "atk":  132,
                                   "type":  "minion_a",
                                   "hp":  504
                               },
                               {
                                   "def":  105,
                                   "name":  "Lính Gác Minerals \u0026 Rocks",
                                   "color":  "#D8B4FE",
                                   "atk":  145,
                                   "type":  "minion_b",
                                   "hp":  580
                               },
                               {
                                   "def":  114,
                                   "name":  "Hộ Vệ Tinh Anh Các loại khoáng sản và Đá",
                                   "color":  "#FFFFFF",
                                   "atk":  165,
                                   "type":  "minion_c",
                                   "hp":  655
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  125,
                            "color":  "#A855F7",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Minerals \u0026 Rocks",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các loại khoáng sản và Đá!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Minerals \u0026 Rocks!"
                                      ],
                            "name":  "HẮC THẦN CÁC LOẠI KHOÁNG SẢN VÀ ĐÁ: MINERALS \u0026 ROCKS TITAN",
                            "atk":  180,
                            "archetype":  "geode_colossus",
                            "baseHp":  2525,
                            "title":  "Bá Chủ Thống Trị Các loại khoáng sản và Đá"
                        },
               "background":  {
                                  "effect":  "crystal_sparkle",
                                  "particleColor":  "#D8B4FE",
                                  "floorColor":  "#202040",
                                  "accentColor":  "#A855F7",
                                  "wallColor":  "#131326",
                                  "props":  "glowing_geodes",
                                  "skyColor":  "#090913"
                              },
               "cleanEn":  "Minerals \u0026 Rocks",
               "cleanVi":  "Các loại khoáng sản và Đá",
               "stt":  59,
               "tier":  3,
               "biome":  "crystal_cavern",
               "topicName":  "Các loại khoáng sản và Đá (Minerals \u0026 Rocks)"
           },
    "86":  {
               "minions":  [
                               {
                                   "def":  134,
                                   "name":  "Bóng Ma Cảng biển và Ngành hàng hải",
                                   "color":  "#06B6D4",
                                   "atk":  185,
                                   "type":  "minion_a",
                                   "hp":  709
                               },
                               {
                                   "def":  147,
                                   "name":  "Lính Gác Seaports \u0026 Maritime Industry",
                                   "color":  "#22D3EE",
                                   "atk":  204,
                                   "type":  "minion_b",
                                   "hp":  815
                               },
                               {
                                   "def":  161,
                                   "name":  "Hộ Vệ Tinh Anh Cảng biển và Ngành hàng hải",
                                   "color":  "#FFFFFF",
                                   "atk":  231,
                                   "type":  "minion_c",
                                   "hp":  922
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  171,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Seaports \u0026 Maritime Industry",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Cảng biển và Ngành hàng hải!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Seaports \u0026 Maritime Industry!"
                                      ],
                            "name":  "CHÚA TỂ CẢNG BIỂN VÀ NGÀNH HÀNG HẢI: SEAPORTS \u0026 MARITIME INDUSTRY TITAN",
                            "atk":  242,
                            "archetype":  "abyssal_kraken",
                            "baseHp":  3397,
                            "title":  "Bá Chủ Thống Trị Cảng biển và Ngành hàng hải"
                        },
               "background":  {
                                  "effect":  "ocean_bubbles",
                                  "particleColor":  "#22D3EE",
                                  "floorColor":  "#0C2E47",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#061A28",
                                  "props":  "coral_bubbles",
                                  "skyColor":  "#030D14"
                              },
               "cleanEn":  "Seaports \u0026 Maritime Industry",
               "cleanVi":  "Cảng biển và Ngành hàng hải",
               "stt":  86,
               "tier":  4,
               "biome":  "abyssal_ocean",
               "topicName":  "Cảng biển và Ngành hàng hải (Seaports \u0026 Maritime Industry)"
           },
    "69":  {
               "minions":  [
                               {
                                   "def":  110,
                                   "name":  "Ác Mộng Công nghệ sinh học",
                                   "color":  "#10B981",
                                   "atk":  152,
                                   "type":  "minion_a",
                                   "hp":  580
                               },
                               {
                                   "def":  121,
                                   "name":  "Lính Gác Biotechnology",
                                   "color":  "#34D399",
                                   "atk":  167,
                                   "type":  "minion_b",
                                   "hp":  667
                               },
                               {
                                   "def":  132,
                                   "name":  "Hộ Vệ Tinh Anh Công nghệ sinh học",
                                   "color":  "#FFFFFF",
                                   "atk":  190,
                                   "type":  "minion_c",
                                   "hp":  754
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  142,
                            "color":  "#10B981",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Biotechnology",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Công nghệ sinh học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Biotechnology!"
                                      ],
                            "name":  "HẮC THẦN CÔNG NGHỆ SINH HỌC: BIOTECHNOLOGY TITAN",
                            "atk":  203,
                            "archetype":  "plague_titan",
                            "baseHp":  2848,
                            "title":  "Bá Chủ Thống Trị Công nghệ sinh học"
                        },
               "background":  {
                                  "effect":  "ecg_pulse",
                                  "particleColor":  "#34D399",
                                  "floorColor":  "#123330",
                                  "accentColor":  "#10B981",
                                  "wallColor":  "#0A1F1D",
                                  "props":  "bio_vials_ecg",
                                  "skyColor":  "#051110"
                              },
               "cleanEn":  "Biotechnology",
               "cleanVi":  "Công nghệ sinh học",
               "stt":  69,
               "tier":  3,
               "biome":  "medical_bio_lab",
               "topicName":  "Công nghệ sinh học (Biotechnology)"
           },
    "54":  {
               "minions":  [
                               {
                                   "def":  88,
                                   "name":  "Bóng Ma Động vật hoang dã",
                                   "color":  "#EAB308",
                                   "atk":  122,
                                   "type":  "minion_a",
                                   "hp":  467
                               },
                               {
                                   "def":  97,
                                   "name":  "Lính Gác Wild Fauna",
                                   "color":  "#FDE047",
                                   "atk":  134,
                                   "type":  "minion_b",
                                   "hp":  537
                               },
                               {
                                   "def":  106,
                                   "name":  "Hộ Vệ Tinh Anh Động vật hoang dã",
                                   "color":  "#FFFFFF",
                                   "atk":  152,
                                   "type":  "minion_c",
                                   "hp":  607
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  116,
                            "color":  "#EAB308",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Wild Fauna",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Động vật hoang dã!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Wild Fauna!"
                                      ],
                            "name":  "THẦN THÚ ĐỘNG VẬT HOANG DÃ: WILD FAUNA TITAN",
                            "atk":  168,
                            "archetype":  "apex_beast_king",
                            "baseHp":  2363,
                            "title":  "Bá Chủ Thống Trị Động vật hoang dã"
                        },
               "background":  {
                                  "effect":  "heat_haze",
                                  "particleColor":  "#FDE047",
                                  "floorColor":  "#332D1E",
                                  "accentColor":  "#EAB308",
                                  "wallColor":  "#1F1B12",
                                  "props":  "predator_skulls",
                                  "skyColor":  "#100E09"
                              },
               "cleanEn":  "Wild Fauna",
               "cleanVi":  "Động vật hoang dã",
               "stt":  54,
               "tier":  3,
               "biome":  "beast_savanna",
               "topicName":  "Động vật hoang dã (Wild Fauna)"
           },
    "66":  {
               "minions":  [
                               {
                                   "def":  105,
                                   "name":  "Khổng Lồ Nguyên tố và Phản ứng hóa học",
                                   "color":  "#84CC16",
                                   "atk":  146,
                                   "type":  "minion_a",
                                   "hp":  557
                               },
                               {
                                   "def":  116,
                                   "name":  "Lính Gác Chemical Elements \u0026 Reactions",
                                   "color":  "#BEF264",
                                   "atk":  161,
                                   "type":  "minion_b",
                                   "hp":  641
                               },
                               {
                                   "def":  126,
                                   "name":  "Hộ Vệ Tinh Anh Nguyên tố và Phản ứng hóa học",
                                   "color":  "#FFFFFF",
                                   "atk":  182,
                                   "type":  "minion_c",
                                   "hp":  724
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  137,
                            "color":  "#84CC16",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Chemical Elements \u0026 Reactions",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Nguyên tố và Phản ứng hóa học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Chemical Elements \u0026 Reactions!"
                                      ],
                            "name":  "CHÚA TỂ NGUYÊN TỐ VÀ PHẢN ỨNG HÓA HỌC: CHEMICAL ELEMENTS \u0026 REACTIONS TITAN",
                            "atk":  196,
                            "archetype":  "mutagen_horror",
                            "baseHp":  2751,
                            "title":  "Bá Chủ Thống Trị Nguyên tố và Phản ứng hóa học"
                        },
               "background":  {
                                  "effect":  "toxic_smoke",
                                  "particleColor":  "#BEF264",
                                  "floorColor":  "#1A301A",
                                  "accentColor":  "#84CC16",
                                  "wallColor":  "#101D10",
                                  "props":  "acid_vats_pipes",
                                  "skyColor":  "#080F08"
                              },
               "cleanEn":  "Chemical Elements \u0026 Reactions",
               "cleanVi":  "Nguyên tố và Phản ứng hóa học",
               "stt":  66,
               "tier":  3,
               "biome":  "toxic_reactor",
               "topicName":  "Nguyên tố và Phản ứng hóa học (Chemical Elements \u0026 Reactions)"
           },
    "57":  {
               "minions":  [
                               {
                                   "def":  92,
                                   "name":  "Quái Thú Côn trùng và Vi sinh vật",
                                   "color":  "#EAB308",
                                   "atk":  128,
                                   "type":  "minion_a",
                                   "hp":  489
                               },
                               {
                                   "def":  101,
                                   "name":  "Lính Gác Insects \u0026 Microorganisms",
                                   "color":  "#FDE047",
                                   "atk":  141,
                                   "type":  "minion_b",
                                   "hp":  562
                               },
                               {
                                   "def":  110,
                                   "name":  "Hộ Vệ Tinh Anh Côn trùng và Vi sinh vật",
                                   "color":  "#FFFFFF",
                                   "atk":  160,
                                   "type":  "minion_c",
                                   "hp":  636
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  121,
                            "color":  "#EAB308",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Insects \u0026 Microorganisms",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Côn trùng và Vi sinh vật!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Insects \u0026 Microorganisms!"
                                      ],
                            "name":  "BÁ CHỦ CÔN TRÙNG VÀ VI SINH VẬT: INSECTS \u0026 MICROORGANISMS TITAN",
                            "atk":  175,
                            "archetype":  "apex_beast_king",
                            "baseHp":  2460,
                            "title":  "Bá Chủ Thống Trị Côn trùng và Vi sinh vật"
                        },
               "background":  {
                                  "effect":  "heat_haze",
                                  "particleColor":  "#FDE047",
                                  "floorColor":  "#332D1E",
                                  "accentColor":  "#EAB308",
                                  "wallColor":  "#1F1B12",
                                  "props":  "predator_skulls",
                                  "skyColor":  "#100E09"
                              },
               "cleanEn":  "Insects \u0026 Microorganisms",
               "cleanVi":  "Côn trùng và Vi sinh vật",
               "stt":  57,
               "tier":  3,
               "biome":  "beast_savanna",
               "topicName":  "Côn trùng và Vi sinh vật (Insects \u0026 Microorganisms)"
           },
    "43":  {
               "minions":  [
                               {
                                   "def":  72,
                                   "name":  "Hắc Thuật Lịch sử và Di tích lịch sử",
                                   "color":  "#38BDF8",
                                   "atk":  101,
                                   "type":  "minion_a",
                                   "hp":  383
                               },
                               {
                                   "def":  79,
                                   "name":  "Lính Gác History \u0026 Historical Monuments",
                                   "color":  "#7DD3FC",
                                   "atk":  111,
                                   "type":  "minion_b",
                                   "hp":  440
                               },
                               {
                                   "def":  86,
                                   "name":  "Hộ Vệ Tinh Anh Lịch sử và Di tích lịch sử",
                                   "color":  "#FFFFFF",
                                   "atk":  126,
                                   "type":  "minion_c",
                                   "hp":  498
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  97,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ History \u0026 Historical Monuments",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Lịch sử và Di tích lịch sử!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua History \u0026 Historical Monuments!"
                                      ],
                            "name":  "BÁ VƯƠNG LỊCH SỬ VÀ DI TÍCH LỊCH SỬ: HISTORY \u0026 HISTORICAL MONUMENTS TITAN",
                            "atk":  143,
                            "archetype":  "ancient_golem",
                            "baseHp":  2008,
                            "title":  "Bá Chủ Thống Trị Lịch sử và Di tích lịch sử"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "History \u0026 Historical Monuments",
               "cleanVi":  "Lịch sử và Di tích lịch sử",
               "stt":  43,
               "tier":  2,
               "biome":  "ancient_ruins",
               "topicName":  "Lịch sử và Di tích lịch sử (History \u0026 Historical Monuments)"
           },
    "95":  {
               "minions":  [
                               {
                                   "def":  148,
                                   "name":  "Linh Hồn Quản trị kinh doanh doanh nghiệp",
                                   "color":  "#38BDF8",
                                   "atk":  203,
                                   "type":  "minion_a",
                                   "hp":  777
                               },
                               {
                                   "def":  163,
                                   "name":  "Lính Gác Business Administration",
                                   "color":  "#7DD3FC",
                                   "atk":  223,
                                   "type":  "minion_b",
                                   "hp":  894
                               },
                               {
                                   "def":  178,
                                   "name":  "Hộ Vệ Tinh Anh Quản trị kinh doanh doanh nghiệp",
                                   "color":  "#FFFFFF",
                                   "atk":  254,
                                   "type":  "minion_c",
                                   "hp":  1010
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  186,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Business Administration",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Quản trị kinh doanh doanh nghiệp!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Business Administration!"
                                      ],
                            "name":  "THẦN MA QUẢN TRỊ KINH DOANH DOANH NGHIỆP: BUSINESS ADMINISTRATION TITAN",
                            "atk":  263,
                            "archetype":  "ancient_golem",
                            "baseHp":  3688,
                            "title":  "Bá Chủ Thống Trị Quản trị kinh doanh doanh nghiệp"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Business Administration",
               "cleanVi":  "Quản trị kinh doanh doanh nghiệp",
               "stt":  95,
               "tier":  4,
               "biome":  "ancient_ruins",
               "topicName":  "Quản trị kinh doanh doanh nghiệp (Business Administration)"
           },
    "80":  {
               "minions":  [
                               {
                                   "def":  126,
                                   "name":  "Chiến Binh Cửa hàng thời trang và Khu mua sắm",
                                   "color":  "#38BDF8",
                                   "atk":  174,
                                   "type":  "minion_a",
                                   "hp":  663
                               },
                               {
                                   "def":  139,
                                   "name":  "Lính Gác Fashion Stores \u0026 Shopping Areas",
                                   "color":  "#7DD3FC",
                                   "atk":  191,
                                   "type":  "minion_b",
                                   "hp":  762
                               },
                               {
                                   "def":  151,
                                   "name":  "Hộ Vệ Tinh Anh Cửa hàng thời trang và Khu mua sắm",
                                   "color":  "#FFFFFF",
                                   "atk":  218,
                                   "type":  "minion_c",
                                   "hp":  862
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  161,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Fashion Stores \u0026 Shopping Areas",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Cửa hàng thời trang và Khu mua sắm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Fashion Stores \u0026 Shopping Areas!"
                                      ],
                            "name":  "ĐẠI THẦN CỬA HÀNG THỜI TRANG VÀ KHU MUA SẮM: FASHION STORES \u0026 SHOPPING AREAS TITAN",
                            "atk":  229,
                            "archetype":  "ancient_golem",
                            "baseHp":  3204,
                            "title":  "Bá Chủ Thống Trị Cửa hàng thời trang và Khu mua sắm"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Fashion Stores \u0026 Shopping Areas",
               "cleanVi":  "Cửa hàng thời trang và Khu mua sắm",
               "stt":  80,
               "tier":  4,
               "biome":  "ancient_ruins",
               "topicName":  "Cửa hàng thời trang và Khu mua sắm (Fashion Stores \u0026 Shopping Areas)"
           },
    "35":  {
               "minions":  [
                               {
                                   "def":  60,
                                   "name":  "Hắc Thuật Nhiếp ảnh và Thiết bị quay chụp",
                                   "color":  "#E11D48",
                                   "atk":  85,
                                   "type":  "minion_a",
                                   "hp":  323
                               },
                               {
                                   "def":  66,
                                   "name":  "Lính Gác Photography \u0026 Camera Gear",
                                   "color":  "#F43F5E",
                                   "atk":  94,
                                   "type":  "minion_b",
                                   "hp":  371
                               },
                               {
                                   "def":  72,
                                   "name":  "Hộ Vệ Tinh Anh Nhiếp ảnh và Thiết bị quay chụp",
                                   "color":  "#FFFFFF",
                                   "atk":  106,
                                   "type":  "minion_c",
                                   "hp":  420
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  83,
                            "color":  "#E11D48",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Photography \u0026 Camera Gear",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Nhiếp ảnh và Thiết bị quay chụp!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Photography \u0026 Camera Gear!"
                                      ],
                            "name":  "THẦN MA NHIẾP ẢNH VÀ THIẾT BỊ QUAY CHỤP: PHOTOGRAPHY \u0026 CAMERA GEAR TITAN",
                            "atk":  124,
                            "archetype":  "broadcast_overlord",
                            "baseHp":  1749,
                            "title":  "Bá Chủ Thống Trị Nhiếp ảnh và Thiết bị quay chụp"
                        },
               "background":  {
                                  "effect":  "crt_static",
                                  "particleColor":  "#F43F5E",
                                  "floorColor":  "#1F2937",
                                  "accentColor":  "#E11D48",
                                  "wallColor":  "#111827",
                                  "props":  "cameras_monitors",
                                  "skyColor":  "#090D14"
                              },
               "cleanEn":  "Photography \u0026 Camera Gear",
               "cleanVi":  "Nhiếp ảnh và Thiết bị quay chụp",
               "stt":  35,
               "tier":  2,
               "biome":  "broadcast_studio",
               "topicName":  "Nhiếp ảnh và Thiết bị quay chụp (Photography \u0026 Camera Gear)"
           },
    "41":  {
               "minions":  [
                               {
                                   "def":  69,
                                   "name":  "Quái Thú Sách và Các thể loại văn học",
                                   "color":  "#F59E0B",
                                   "atk":  97,
                                   "type":  "minion_a",
                                   "hp":  368
                               },
                               {
                                   "def":  76,
                                   "name":  "Lính Gác Books \u0026 Literary Genres",
                                   "color":  "#FDE68A",
                                   "atk":  107,
                                   "type":  "minion_b",
                                   "hp":  423
                               },
                               {
                                   "def":  83,
                                   "name":  "Hộ Vệ Tinh Anh Sách và Các thể loại văn học",
                                   "color":  "#FFFFFF",
                                   "atk":  121,
                                   "type":  "minion_c",
                                   "hp":  478
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  94,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Books \u0026 Literary Genres",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Sách và Các thể loại văn học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Books \u0026 Literary Genres!"
                                      ],
                            "name":  "MA VƯƠNG SÁCH VÀ CÁC THỂ LOẠI VĂN HỌC: BOOKS \u0026 LITERARY GENRES TITAN",
                            "atk":  138,
                            "archetype":  "scholar_lich",
                            "baseHp":  1943,
                            "title":  "Bá Chủ Thống Trị Sách và Các thể loại văn học"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Books \u0026 Literary Genres",
               "cleanVi":  "Sách và Các thể loại văn học",
               "stt":  41,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Sách và Các thể loại văn học (Books \u0026 Literary Genres)"
           },
    "5":  {
              "minions":  [
                              {
                                  "def":  16,
                                  "name":  "Khối Cơ Bắp Quỷ",
                                  "color":  "#DC2626",
                                  "atk":  26,
                                  "type":  "muscle_golem",
                                  "hp":  95
                              },
                              {
                                  "def":  18,
                                  "name":  "Tơ Thần Kinh Điện",
                                  "color":  "#F87171",
                                  "atk":  29,
                                  "type":  "neural_wisp",
                                  "hp":  109
                              },
                              {
                                  "def":  19,
                                  "name":  "Hộp Sọ Bay Gai Nhọn",
                                  "color":  "#FFFFFF",
                                  "atk":  32,
                                  "type":  "flying_cranium",
                                  "hp":  124
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  32,
                           "color":  "#DC2626",
                           "skillName":  "Trận Đồ Xương Sọ Xuyên Tâm",
                           "roars":  [
                                         "Khung xương của ngươi thuộc về ta!",
                                         "Giải phẫu cơ thể hoàn mỹ!"
                                     ],
                           "name":  "THẦN THỂ BỘ XƯƠNG: ANATOMICAL TITAN",
                           "atk":  54,
                           "archetype":  "anatomical_titan",
                           "baseHp":  779,
                           "title":  "Hóa Thân 206 Khúc Xương Cổ"
                       },
              "background":  {
                                 "effect":  "pulse_beat",
                                 "particleColor":  "#F87171",
                                 "floorColor":  "#2D1818",
                                 "accentColor":  "#DC2626",
                                 "wallColor":  "#1A1010",
                                 "props":  "skeleton_models",
                                 "skyColor":  "#0D0808"
                             },
              "cleanEn":  "Human Body Parts",
              "cleanVi":  "Các bộ phận trên cơ thể người",
              "stt":  5,
              "tier":  1,
              "biome":  "medical_bio_lab",
              "topicName":  "Các bộ phận trên cơ thể người (Human Body Parts)"
          },
    "34":  {
               "minions":  [
                               {
                                   "def":  58,
                                   "name":  "Khổng Lồ Câu lạc bộ và Các ban chuyên môn sinh viên",
                                   "color":  "#F59E0B",
                                   "atk":  83,
                                   "type":  "minion_a",
                                   "hp":  315
                               },
                               {
                                   "def":  64,
                                   "name":  "Lính Gác Clubs \u0026 Student Departments",
                                   "color":  "#FDE68A",
                                   "atk":  91,
                                   "type":  "minion_b",
                                   "hp":  362
                               },
                               {
                                   "def":  70,
                                   "name":  "Hộ Vệ Tinh Anh Câu lạc bộ và Các ban chuyên môn sinh viên",
                                   "color":  "#FFFFFF",
                                   "atk":  104,
                                   "type":  "minion_c",
                                   "hp":  410
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  82,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Clubs \u0026 Student Departments",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Câu lạc bộ và Các ban chuyên môn sinh viên!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Clubs \u0026 Student Departments!"
                                      ],
                            "name":  "THẦN THÚ CÂU LẠC BỘ VÀ CÁC BAN CHUYÊN MÔN SINH VIÊN: CLUBS \u0026 STUDENT DEPARTMENTS TITAN",
                            "atk":  122,
                            "archetype":  "scholar_lich",
                            "baseHp":  1717,
                            "title":  "Bá Chủ Thống Trị Câu lạc bộ và Các ban chuyên môn sinh viên"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Clubs \u0026 Student Departments",
               "cleanVi":  "Câu lạc bộ và Các ban chuyên môn sinh viên",
               "stt":  34,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Câu lạc bộ và Các ban chuyên môn sinh viên (Clubs \u0026 Student Departments)"
           },
    "6":  {
              "minions":  [
                              {
                                  "def":  17,
                                  "name":  "Ghế Bành Mimic",
                                  "color":  "#818CF8",
                                  "atk":  28,
                                  "type":  "chair_mimic",
                                  "hp":  103
                              },
                              {
                                  "def":  19,
                                  "name":  "Đèn Chùm Rơi Tự Do",
                                  "color":  "#A5B4FC",
                                  "atk":  31,
                                  "type":  "chandelier_wraith",
                                  "hp":  118
                              },
                              {
                                  "def":  20,
                                  "name":  "Đồng Hồ Quả Lắc Chém Gió",
                                  "color":  "#FFFFFF",
                                  "atk":  35,
                                  "type":  "pendulum_blade",
                                  "hp":  134
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  34,
                           "color":  "#818CF8",
                           "skillName":  "Cánh Cửa Không Gian Nghiền Nát",
                           "roars":  [
                                         "Bước vào trong tủ và không bao giờ trở ra!",
                                         "Nội thất cổ quái nổi giận!"
                                     ],
                           "name":  "CHÚA TỂ TỦ ĐỒ: LIVING WARDROBE GOLEM",
                           "atk":  57,
                           "archetype":  "living_wardrobe",
                           "baseHp":  812,
                           "title":  "Cự Quái Nội Thất Nuốt Chửng"
                       },
              "background":  {
                                 "effect":  "creaking_wood",
                                 "particleColor":  "#A5B4FC",
                                 "floorColor":  "#20223A",
                                 "accentColor":  "#818CF8",
                                 "wallColor":  "#141524",
                                 "props":  "mimic_furniture",
                                 "skyColor":  "#090A12"
                             },
              "cleanEn":  "Furniture \u0026 Household Items",
              "cleanVi":  "Đồ nội thất và Vật dụng gia đình",
              "stt":  6,
              "tier":  1,
              "biome":  "haunted_mansion",
              "topicName":  "Đồ nội thất và Vật dụng gia đình (Furniture \u0026 Household Items)"
          },
    "53":  {
               "minions":  [
                               {
                                   "def":  86,
                                   "name":  "Ác Mộng Thực vật và Rừng",
                                   "color":  "#22C55E",
                                   "atk":  120,
                                   "type":  "minion_a",
                                   "hp":  459
                               },
                               {
                                   "def":  95,
                                   "name":  "Lính Gác Flora \u0026 Forests",
                                   "color":  "#86EFAC",
                                   "atk":  132,
                                   "type":  "minion_b",
                                   "hp":  528
                               },
                               {
                                   "def":  103,
                                   "name":  "Hộ Vệ Tinh Anh Thực vật và Rừng",
                                   "color":  "#FFFFFF",
                                   "atk":  150,
                                   "type":  "minion_c",
                                   "hp":  597
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  114,
                            "color":  "#22C55E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Flora \u0026 Forests",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thực vật và Rừng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Flora \u0026 Forests!"
                                      ],
                            "name":  "BÁ VƯƠNG THỰC VẬT VÀ RỪNG: FLORA \u0026 FORESTS TITAN",
                            "atk":  166,
                            "archetype":  "ancient_dryad",
                            "baseHp":  2331,
                            "title":  "Bá Chủ Thống Trị Thực vật và Rừng"
                        },
               "background":  {
                                  "effect":  "spores_fireflies",
                                  "particleColor":  "#86EFAC",
                                  "floorColor":  "#14301F",
                                  "accentColor":  "#22C55E",
                                  "wallColor":  "#0B1D12",
                                  "props":  "giant_roots_mushrooms",
                                  "skyColor":  "#050F09"
                              },
               "cleanEn":  "Flora \u0026 Forests",
               "cleanVi":  "Thực vật và Rừng",
               "stt":  53,
               "tier":  3,
               "biome":  "primeval_forest",
               "topicName":  "Thực vật và Rừng (Flora \u0026 Forests)"
           },
    "2":  {
              "minions":  [
                              {
                                  "def":  11,
                                  "name":  "Espresso Slime",
                                  "color":  "#F59E0B",
                                  "atk":  20,
                                  "type":  "coffee_slime",
                                  "hp":  73
                              },
                              {
                                  "def":  12,
                                  "name":  "Hạt Cà Phê Gai Lửa",
                                  "color":  "#FCD34D",
                                  "atk":  22,
                                  "type":  "bean_imp",
                                  "hp":  84
                              },
                              {
                                  "def":  13,
                                  "name":  "Bọt Sữa Độc Hại",
                                  "color":  "#FFFFFF",
                                  "atk":  25,
                                  "type":  "latte_phantom",
                                  "hp":  95
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  27,
                           "color":  "#F59E0B",
                           "skillName":  "Hơi Thở Cà Phê Cháy Khét",
                           "roars":  [
                                         "Ngửi thấy mùi cà phê đen cháy khét chưa?",
                                         "Một ngụm đắng ngắt sẽ tiễn ngươi về sảnh!"
                                     ],
                           "name":  "CỔ THẦN BARISTA: DARK ROAST DRAGON",
                           "atk":  47,
                           "archetype":  "barista_dragon",
                           "baseHp":  682,
                           "title":  "Hắc Long Espresso Sôi Sục"
                       },
              "background":  {
                                 "effect":  "coffee_aroma",
                                 "particleColor":  "#FCD34D",
                                 "floorColor":  "#3D2416",
                                 "accentColor":  "#F59E0B",
                                 "wallColor":  "#27170E",
                                 "props":  "coffee_vats_steam",
                                 "skyColor":  "#140B07"
                             },
              "cleanEn":  "Cafe Culture \u0026 Beverages",
              "cleanVi":  "Văn hóa quán cà phê và Đồ uống",
              "stt":  2,
              "tier":  1,
              "biome":  "cozy_cafe",
              "topicName":  "Văn hóa quán cà phê và Đồ uống (Cafe Culture \u0026 Beverages)"
          },
    "44":  {
               "minions":  [
                               {
                                   "def":  73,
                                   "name":  "Cơ Giới Thư viện và Tài liệu học thuật",
                                   "color":  "#F59E0B",
                                   "atk":  103,
                                   "type":  "minion_a",
                                   "hp":  391
                               },
                               {
                                   "def":  80,
                                   "name":  "Lính Gác Libraries \u0026 Academic Resources",
                                   "color":  "#FDE68A",
                                   "atk":  113,
                                   "type":  "minion_b",
                                   "hp":  450
                               },
                               {
                                   "def":  88,
                                   "name":  "Hộ Vệ Tinh Anh Thư viện và Tài liệu học thuật",
                                   "color":  "#FFFFFF",
                                   "atk":  129,
                                   "type":  "minion_c",
                                   "hp":  508
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  99,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Libraries \u0026 Academic Resources",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thư viện và Tài liệu học thuật!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Libraries \u0026 Academic Resources!"
                                      ],
                            "name":  "THẦN THÚ THƯ VIỆN VÀ TÀI LIỆU HỌC THUẬT: LIBRARIES \u0026 ACADEMIC RESOURCES TITAN",
                            "atk":  145,
                            "archetype":  "scholar_lich",
                            "baseHp":  2040,
                            "title":  "Bá Chủ Thống Trị Thư viện và Tài liệu học thuật"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Libraries \u0026 Academic Resources",
               "cleanVi":  "Thư viện và Tài liệu học thuật",
               "stt":  44,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Thư viện và Tài liệu học thuật (Libraries \u0026 Academic Resources)"
           },
    "98":  {
               "minions":  [
                               {
                                   "def":  152,
                                   "name":  "Khổng Lồ Hoạt động Xuất - Nhập khẩu",
                                   "color":  "#38BDF8",
                                   "atk":  209,
                                   "type":  "minion_a",
                                   "hp":  800
                               },
                               {
                                   "def":  167,
                                   "name":  "Lính Gác Import \u0026 Export Activities",
                                   "color":  "#7DD3FC",
                                   "atk":  230,
                                   "type":  "minion_b",
                                   "hp":  920
                               },
                               {
                                   "def":  182,
                                   "name":  "Hộ Vệ Tinh Anh Hoạt động Xuất - Nhập khẩu",
                                   "color":  "#FFFFFF",
                                   "atk":  261,
                                   "type":  "minion_c",
                                   "hp":  1040
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  192,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Import \u0026 Export Activities",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hoạt động Xuất - Nhập khẩu!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Import \u0026 Export Activities!"
                                      ],
                            "name":  "HOÀNG ĐẾ HOẠT ĐỘNG XUẤT - NHẬP KHẨU: IMPORT \u0026 EXPORT ACTIVITIES TITAN",
                            "atk":  270,
                            "archetype":  "ancient_golem",
                            "baseHp":  3785,
                            "title":  "Bá Chủ Thống Trị Hoạt động Xuất - Nhập khẩu"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Import \u0026 Export Activities",
               "cleanVi":  "Hoạt động Xuất - Nhập khẩu",
               "stt":  98,
               "tier":  4,
               "biome":  "ancient_ruins",
               "topicName":  "Hoạt động Xuất - Nhập khẩu (Import \u0026 Export Activities)"
           },
    "72":  {
               "minions":  [
                               {
                                   "def":  114,
                                   "name":  "Chiến Binh Các nguồn năng lượng",
                                   "color":  "#A855F7",
                                   "atk":  158,
                                   "type":  "minion_a",
                                   "hp":  603
                               },
                               {
                                   "def":  125,
                                   "name":  "Lính Gác Energy Sources",
                                   "color":  "#D8B4FE",
                                   "atk":  174,
                                   "type":  "minion_b",
                                   "hp":  693
                               },
                               {
                                   "def":  137,
                                   "name":  "Hộ Vệ Tinh Anh Các nguồn năng lượng",
                                   "color":  "#FFFFFF",
                                   "atk":  198,
                                   "type":  "minion_c",
                                   "hp":  784
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  147,
                            "color":  "#A855F7",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Energy Sources",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các nguồn năng lượng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Energy Sources!"
                                      ],
                            "name":  "CỰ QUÁI CÁC NGUỒN NĂNG LƯỢNG: ENERGY SOURCES TITAN",
                            "atk":  210,
                            "archetype":  "geode_colossus",
                            "baseHp":  2945,
                            "title":  "Bá Chủ Thống Trị Các nguồn năng lượng"
                        },
               "background":  {
                                  "effect":  "crystal_sparkle",
                                  "particleColor":  "#D8B4FE",
                                  "floorColor":  "#202040",
                                  "accentColor":  "#A855F7",
                                  "wallColor":  "#131326",
                                  "props":  "glowing_geodes",
                                  "skyColor":  "#090913"
                              },
               "cleanEn":  "Energy Sources",
               "cleanVi":  "Các nguồn năng lượng",
               "stt":  72,
               "tier":  3,
               "biome":  "crystal_cavern",
               "topicName":  "Các nguồn năng lượng (Energy Sources)"
           },
    "11":  {
               "minions":  [
                               {
                                   "def":  25,
                                   "name":  "Hắc Thuật Tín ngưỡng và Tôn giáo",
                                   "color":  "#C084FC",
                                   "atk":  38,
                                   "type":  "minion_a",
                                   "hp":  141
                               },
                               {
                                   "def":  28,
                                   "name":  "Lính Gác Beliefs \u0026 Religions",
                                   "color":  "#E9D5FF",
                                   "atk":  42,
                                   "type":  "minion_b",
                                   "hp":  162
                               },
                               {
                                   "def":  30,
                                   "name":  "Hộ Vệ Tinh Anh Tín ngưỡng và Tôn giáo",
                                   "color":  "#FFFFFF",
                                   "atk":  48,
                                   "type":  "minion_c",
                                   "hp":  183
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  42,
                            "color":  "#C084FC",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Beliefs \u0026 Religions",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Tín ngưỡng và Tôn giáo!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Beliefs \u0026 Religions!"
                                      ],
                            "name":  "MA VƯƠNG TÍN NGƯỠNG VÀ TÔN GIÁO: BELIEFS \u0026 RELIGIONS TITAN",
                            "atk":  68,
                            "archetype":  "cathedral_archon",
                            "baseHp":  973,
                            "title":  "Bá Chủ Thống Trị Tín ngưỡng và Tôn giáo"
                        },
               "background":  {
                                  "effect":  "holy_radiance",
                                  "particleColor":  "#E9D5FF",
                                  "floorColor":  "#2C2845",
                                  "accentColor":  "#C084FC",
                                  "wallColor":  "#1A1829",
                                  "props":  "stained_glass_altar",
                                  "skyColor":  "#0D0C15"
                              },
               "cleanEn":  "Beliefs \u0026 Religions",
               "cleanVi":  "Tín ngưỡng và Tôn giáo",
               "stt":  11,
               "tier":  1,
               "biome":  "sacred_cathedral",
               "topicName":  "Tín ngưỡng và Tôn giáo (Beliefs \u0026 Religions)"
           },
    "70":  {
               "minions":  [
                               {
                                   "def":  111,
                                   "name":  "Bóng Ma Hệ thống đơn vị đo lường",
                                   "color":  "#06B6D4",
                                   "atk":  154,
                                   "type":  "minion_a",
                                   "hp":  588
                               },
                               {
                                   "def":  122,
                                   "name":  "Lính Gác Systems of Measurement",
                                   "color":  "#67E8F9",
                                   "atk":  169,
                                   "type":  "minion_b",
                                   "hp":  676
                               },
                               {
                                   "def":  133,
                                   "name":  "Hộ Vệ Tinh Anh Hệ thống đơn vị đo lường",
                                   "color":  "#FFFFFF",
                                   "atk":  192,
                                   "type":  "minion_c",
                                   "hp":  764
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  143,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Systems of Measurement",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hệ thống đơn vị đo lường!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Systems of Measurement!"
                                      ],
                            "name":  "ĐẠI THẦN HỆ THỐNG ĐƠN VỊ ĐO LƯỜNG: SYSTEMS OF MEASUREMENT TITAN",
                            "atk":  205,
                            "archetype":  "quantum_agi_god",
                            "baseHp":  2880,
                            "title":  "Bá Chủ Thống Trị Hệ thống đơn vị đo lường"
                        },
               "background":  {
                                  "effect":  "binary_rain",
                                  "particleColor":  "#67E8F9",
                                  "floorColor":  "#06222E",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#03141B",
                                  "props":  "quantum_servers",
                                  "skyColor":  "#010A0E"
                              },
               "cleanEn":  "Systems of Measurement",
               "cleanVi":  "Hệ thống đơn vị đo lường",
               "stt":  70,
               "tier":  3,
               "biome":  "quantum_agi_datacenter",
               "topicName":  "Hệ thống đơn vị đo lường (Systems of Measurement)"
           },
    "68":  {
               "minions":  [
                               {
                                   "def":  108,
                                   "name":  "Cơ Giới Các phát minh khoa học",
                                   "color":  "#06B6D4",
                                   "atk":  150,
                                   "type":  "minion_a",
                                   "hp":  573
                               },
                               {
                                   "def":  119,
                                   "name":  "Lính Gác Scientific Inventions",
                                   "color":  "#67E8F9",
                                   "atk":  165,
                                   "type":  "minion_b",
                                   "hp":  659
                               },
                               {
                                   "def":  130,
                                   "name":  "Hộ Vệ Tinh Anh Các phát minh khoa học",
                                   "color":  "#FFFFFF",
                                   "atk":  188,
                                   "type":  "minion_c",
                                   "hp":  745
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  140,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Scientific Inventions",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các phát minh khoa học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Scientific Inventions!"
                                      ],
                            "name":  "HOÀNG ĐẾ CÁC PHÁT MINH KHOA HỌC: SCIENTIFIC INVENTIONS TITAN",
                            "atk":  201,
                            "archetype":  "quantum_agi_god",
                            "baseHp":  2816,
                            "title":  "Bá Chủ Thống Trị Các phát minh khoa học"
                        },
               "background":  {
                                  "effect":  "binary_rain",
                                  "particleColor":  "#67E8F9",
                                  "floorColor":  "#06222E",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#03141B",
                                  "props":  "quantum_servers",
                                  "skyColor":  "#010A0E"
                              },
               "cleanEn":  "Scientific Inventions",
               "cleanVi":  "Các phát minh khoa học",
               "stt":  68,
               "tier":  3,
               "biome":  "quantum_agi_datacenter",
               "topicName":  "Các phát minh khoa học (Scientific Inventions)"
           },
    "1":  {
              "minions":  [
                              {
                                  "def":  10,
                                  "name":  "Sợi Chỉ Hắc Ám",
                                  "color":  "#F43F5E",
                                  "atk":  18,
                                  "type":  "thread_wisp",
                                  "hp":  65
                              },
                              {
                                  "def":  11,
                                  "name":  "Khuy Áo Gai Sắt",
                                  "color":  "#FB7185",
                                  "atk":  20,
                                  "type":  "button_beetle",
                                  "hp":  75
                              },
                              {
                                  "def":  12,
                                  "name":  "Ma-nơ-canh Ác Mộng",
                                  "color":  "#FFFFFF",
                                  "atk":  22,
                                  "type":  "cursed_mannequin",
                                  "hp":  84
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  25,
                           "color":  "#F43F5E",
                           "skillName":  "Vũ Điệu Lụa Đỏ Xé Gió",
                           "roars":  [
                                         "Gu thời trang của ngươi thật thảm họa!",
                                         "Hãy cúi đầu trước Nữ Hoàng Sàn Diễn!"
                                     ],
                           "name":  "BÀ HOÀNG SÀN DIỄN: COUTURE ARCHON",
                           "atk":  45,
                           "archetype":  "fashion_queen",
                           "baseHp":  650,
                           "title":  "Chúa Tể Thời Trang Cao Cấp"
                       },
              "background":  {
                                 "effect":  "glitter",
                                 "particleColor":  "#FB7185",
                                 "floorColor":  "#2D123B",
                                 "accentColor":  "#F43F5E",
                                 "wallColor":  "#1A0C22",
                                 "props":  "spotlights_mannequins",
                                 "skyColor":  "#0E0513"
                             },
              "cleanEn":  "Clothing \u0026 Fashion Accessories",
              "cleanVi":  "Quần áo và Phụ kiện thời trang",
              "stt":  1,
              "tier":  1,
              "biome":  "catwalk_fashion",
              "topicName":  "Quần áo và Phụ kiện thời trang (Clothing \u0026 Fashion Accessories)"
          },
    "58":  {
               "minions":  [
                               {
                                   "def":  93,
                                   "name":  "Khổng Lồ Vũ trụ và Hệ mặt trời",
                                   "color":  "#8B5CF6",
                                   "atk":  130,
                                   "type":  "minion_a",
                                   "hp":  497
                               },
                               {
                                   "def":  102,
                                   "name":  "Lính Gác Space \u0026 Solar System",
                                   "color":  "#C4B5FD",
                                   "atk":  143,
                                   "type":  "minion_b",
                                   "hp":  572
                               },
                               {
                                   "def":  112,
                                   "name":  "Hộ Vệ Tinh Anh Vũ trụ và Hệ mặt trời",
                                   "color":  "#FFFFFF",
                                   "atk":  162,
                                   "type":  "minion_c",
                                   "hp":  646
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  123,
                            "color":  "#8B5CF6",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Space \u0026 Solar System",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Vũ trụ và Hệ mặt trời!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Space \u0026 Solar System!"
                                      ],
                            "name":  "HOÀNG ĐẾ VŨ TRỤ VÀ HỆ MẶT TRỜI: SPACE \u0026 SOLAR SYSTEM TITAN",
                            "atk":  177,
                            "archetype":  "cosmic_destroyer",
                            "baseHp":  2492,
                            "title":  "Bá Chủ Thống Trị Vũ trụ và Hệ mặt trời"
                        },
               "background":  {
                                  "effect":  "shooting_stars",
                                  "particleColor":  "#C4B5FD",
                                  "floorColor":  "#0F0E30",
                                  "accentColor":  "#8B5CF6",
                                  "wallColor":  "#08071A",
                                  "props":  "nebula_planets",
                                  "skyColor":  "#04030D"
                              },
               "cleanEn":  "Space \u0026 Solar System",
               "cleanVi":  "Vũ trụ và Hệ mặt trời",
               "stt":  58,
               "tier":  3,
               "biome":  "deep_cosmos",
               "topicName":  "Vũ trụ và Hệ mặt trời (Space \u0026 Solar System)"
           },
    "55":  {
               "minions":  [
                               {
                                   "def":  89,
                                   "name":  "Linh Hồn Đại dương và Bờ biển",
                                   "color":  "#06B6D4",
                                   "atk":  124,
                                   "type":  "minion_a",
                                   "hp":  474
                               },
                               {
                                   "def":  98,
                                   "name":  "Lính Gác Oceans \u0026 Coastlines",
                                   "color":  "#22D3EE",
                                   "atk":  136,
                                   "type":  "minion_b",
                                   "hp":  545
                               },
                               {
                                   "def":  107,
                                   "name":  "Hộ Vệ Tinh Anh Đại dương và Bờ biển",
                                   "color":  "#FFFFFF",
                                   "atk":  155,
                                   "type":  "minion_c",
                                   "hp":  616
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  118,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Oceans \u0026 Coastlines",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Đại dương và Bờ biển!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Oceans \u0026 Coastlines!"
                                      ],
                            "name":  "THẦN MA ĐẠI DƯƠNG VÀ BỜ BIỂN: OCEANS \u0026 COASTLINES TITAN",
                            "atk":  170,
                            "archetype":  "abyssal_kraken",
                            "baseHp":  2395,
                            "title":  "Bá Chủ Thống Trị Đại dương và Bờ biển"
                        },
               "background":  {
                                  "effect":  "ocean_bubbles",
                                  "particleColor":  "#22D3EE",
                                  "floorColor":  "#0C2E47",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#061A28",
                                  "props":  "coral_bubbles",
                                  "skyColor":  "#030D14"
                              },
               "cleanEn":  "Oceans \u0026 Coastlines",
               "cleanVi":  "Đại dương và Bờ biển",
               "stt":  55,
               "tier":  3,
               "biome":  "abyssal_ocean",
               "topicName":  "Đại dương và Bờ biển (Oceans \u0026 Coastlines)"
           },
    "33":  {
               "minions":  [
                               {
                                   "def":  57,
                                   "name":  "Quái Thú Các kỳ thi ngôn ngữ và Chứng chỉ",
                                   "color":  "#F59E0B",
                                   "atk":  81,
                                   "type":  "minion_a",
                                   "hp":  307
                               },
                               {
                                   "def":  63,
                                   "name":  "Lính Gác Language Exams \u0026 Certificates",
                                   "color":  "#FDE68A",
                                   "atk":  89,
                                   "type":  "minion_b",
                                   "hp":  353
                               },
                               {
                                   "def":  68,
                                   "name":  "Hộ Vệ Tinh Anh Các kỳ thi ngôn ngữ và Chứng chỉ",
                                   "color":  "#FFFFFF",
                                   "atk":  101,
                                   "type":  "minion_c",
                                   "hp":  399
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  80,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Language Exams \u0026 Certificates",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các kỳ thi ngôn ngữ và Chứng chỉ!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Language Exams \u0026 Certificates!"
                                      ],
                            "name":  "BÁ VƯƠNG CÁC KỲ THI NGÔN NGỮ VÀ CHỨNG CHỈ: LANGUAGE EXAMS \u0026 CERTIFICATES TITAN",
                            "atk":  119,
                            "archetype":  "scholar_lich",
                            "baseHp":  1684,
                            "title":  "Bá Chủ Thống Trị Các kỳ thi ngôn ngữ và Chứng chỉ"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Language Exams \u0026 Certificates",
               "cleanVi":  "Các kỳ thi ngôn ngữ và Chứng chỉ",
               "stt":  33,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Các kỳ thi ngôn ngữ và Chứng chỉ (Language Exams \u0026 Certificates)"
           },
    "88":  {
               "minions":  [
                               {
                                   "def":  137,
                                   "name":  "Chiến Binh Hành lý và Phụ kiện dã ngoại",
                                   "color":  "#38BDF8",
                                   "atk":  189,
                                   "type":  "minion_a",
                                   "hp":  724
                               },
                               {
                                   "def":  151,
                                   "name":  "Lính Gác Luggage \u0026 Travel Accessories",
                                   "color":  "#BAE6FD",
                                   "atk":  208,
                                   "type":  "minion_b",
                                   "hp":  833
                               },
                               {
                                   "def":  164,
                                   "name":  "Hộ Vệ Tinh Anh Hành lý và Phụ kiện dã ngoại",
                                   "color":  "#FFFFFF",
                                   "atk":  236,
                                   "type":  "minion_c",
                                   "hp":  941
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  174,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Luggage \u0026 Travel Accessories",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hành lý và Phụ kiện dã ngoại!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Luggage \u0026 Travel Accessories!"
                                      ],
                            "name":  "HOÀNG ĐẾ HÀNH LÝ VÀ PHỤ KIỆN DÃ NGOẠI: LUGGAGE \u0026 TRAVEL ACCESSORIES TITAN",
                            "atk":  247,
                            "archetype":  "avalanche_behemoth",
                            "baseHp":  3462,
                            "title":  "Bá Chủ Thống Trị Hành lý và Phụ kiện dã ngoại"
                        },
               "background":  {
                                  "effect":  "snowfall",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#1E293B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F172A",
                                  "props":  "snow_pine_cliffs",
                                  "skyColor":  "#080C16"
                              },
               "cleanEn":  "Luggage \u0026 Travel Accessories",
               "cleanVi":  "Hành lý và Phụ kiện dã ngoại",
               "stt":  88,
               "tier":  4,
               "biome":  "alpine_peaks",
               "topicName":  "Hành lý và Phụ kiện dã ngoại (Luggage \u0026 Travel Accessories)"
           },
    "67":  {
               "minions":  [
                               {
                                   "def":  107,
                                   "name":  "Hắc Thuật Sinh học và Di truyền",
                                   "color":  "#10B981",
                                   "atk":  148,
                                   "type":  "minion_a",
                                   "hp":  565
                               },
                               {
                                   "def":  118,
                                   "name":  "Lính Gác Biology \u0026 Genetics",
                                   "color":  "#34D399",
                                   "atk":  163,
                                   "type":  "minion_b",
                                   "hp":  650
                               },
                               {
                                   "def":  128,
                                   "name":  "Hộ Vệ Tinh Anh Sinh học và Di truyền",
                                   "color":  "#FFFFFF",
                                   "atk":  185,
                                   "type":  "minion_c",
                                   "hp":  734
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  138,
                            "color":  "#10B981",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Biology \u0026 Genetics",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Sinh học và Di truyền!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Biology \u0026 Genetics!"
                                      ],
                            "name":  "BÁ CHỦ SINH HỌC VÀ DI TRUYỀN: BIOLOGY \u0026 GENETICS TITAN",
                            "atk":  198,
                            "archetype":  "plague_titan",
                            "baseHp":  2783,
                            "title":  "Bá Chủ Thống Trị Sinh học và Di truyền"
                        },
               "background":  {
                                  "effect":  "ecg_pulse",
                                  "particleColor":  "#34D399",
                                  "floorColor":  "#123330",
                                  "accentColor":  "#10B981",
                                  "wallColor":  "#0A1F1D",
                                  "props":  "bio_vials_ecg",
                                  "skyColor":  "#051110"
                              },
               "cleanEn":  "Biology \u0026 Genetics",
               "cleanVi":  "Sinh học và Di truyền",
               "stt":  67,
               "tier":  3,
               "biome":  "medical_bio_lab",
               "topicName":  "Sinh học và Di truyền (Biology \u0026 Genetics)"
           },
    "27":  {
               "minions":  [
                               {
                                   "def":  48,
                                   "name":  "Hắc Thuật Trường đại học và Đời sống sinh viên",
                                   "color":  "#F59E0B",
                                   "atk":  69,
                                   "type":  "minion_a",
                                   "hp":  262
                               },
                               {
                                   "def":  53,
                                   "name":  "Lính Gác University \u0026 Student Life",
                                   "color":  "#FDE68A",
                                   "atk":  76,
                                   "type":  "minion_b",
                                   "hp":  301
                               },
                               {
                                   "def":  58,
                                   "name":  "Hộ Vệ Tinh Anh Trường đại học và Đời sống sinh viên",
                                   "color":  "#FFFFFF",
                                   "atk":  86,
                                   "type":  "minion_c",
                                   "hp":  341
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  70,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ University \u0026 Student Life",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Trường đại học và Đời sống sinh viên!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua University \u0026 Student Life!"
                                      ],
                            "name":  "BÁ CHỦ TRƯỜNG ĐẠI HỌC VÀ ĐỜI SỐNG SINH VIÊN: UNIVERSITY \u0026 STUDENT LIFE TITAN",
                            "atk":  105,
                            "archetype":  "scholar_lich",
                            "baseHp":  1490,
                            "title":  "Bá Chủ Thống Trị Trường đại học và Đời sống sinh viên"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "University \u0026 Student Life",
               "cleanVi":  "Trường đại học và Đời sống sinh viên",
               "stt":  27,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Trường đại học và Đời sống sinh viên (University \u0026 Student Life)"
           },
    "16":  {
               "minions":  [
                               {
                                   "def":  32,
                                   "name":  "Chiến Binh Dụng cụ và Trang thiết bị y tế",
                                   "color":  "#10B981",
                                   "atk":  48,
                                   "type":  "minion_a",
                                   "hp":  179
                               },
                               {
                                   "def":  35,
                                   "name":  "Lính Gác Medical Tools \u0026 Equipment",
                                   "color":  "#34D399",
                                   "atk":  53,
                                   "type":  "minion_b",
                                   "hp":  206
                               },
                               {
                                   "def":  38,
                                   "name":  "Hộ Vệ Tinh Anh Dụng cụ và Trang thiết bị y tế",
                                   "color":  "#FFFFFF",
                                   "atk":  60,
                                   "type":  "minion_c",
                                   "hp":  233
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  51,
                            "color":  "#10B981",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Medical Tools \u0026 Equipment",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Dụng cụ và Trang thiết bị y tế!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Medical Tools \u0026 Equipment!"
                                      ],
                            "name":  "CHÚA TỂ DỤNG CỤ VÀ TRANG THIẾT BỊ Y TẾ: MEDICAL TOOLS \u0026 EQUIPMENT TITAN",
                            "atk":  80,
                            "archetype":  "plague_titan",
                            "baseHp":  1135,
                            "title":  "Bá Chủ Thống Trị Dụng cụ và Trang thiết bị y tế"
                        },
               "background":  {
                                  "effect":  "ecg_pulse",
                                  "particleColor":  "#34D399",
                                  "floorColor":  "#123330",
                                  "accentColor":  "#10B981",
                                  "wallColor":  "#0A1F1D",
                                  "props":  "bio_vials_ecg",
                                  "skyColor":  "#051110"
                              },
               "cleanEn":  "Medical Tools \u0026 Equipment",
               "cleanVi":  "Dụng cụ và Trang thiết bị y tế",
               "stt":  16,
               "tier":  1,
               "biome":  "medical_bio_lab",
               "topicName":  "Dụng cụ và Trang thiết bị y tế (Medical Tools \u0026 Equipment)"
           },
    "64":  {
               "minions":  [
                               {
                                   "def":  102,
                                   "name":  "Chiến Binh Trí tuệ nhân tạo và Robot",
                                   "color":  "#06B6D4",
                                   "atk":  142,
                                   "type":  "minion_a",
                                   "hp":  542
                               },
                               {
                                   "def":  112,
                                   "name":  "Lính Gác Artificial Intelligence \u0026 Robotics",
                                   "color":  "#67E8F9",
                                   "atk":  156,
                                   "type":  "minion_b",
                                   "hp":  623
                               },
                               {
                                   "def":  122,
                                   "name":  "Hộ Vệ Tinh Anh Trí tuệ nhân tạo và Robot",
                                   "color":  "#FFFFFF",
                                   "atk":  178,
                                   "type":  "minion_c",
                                   "hp":  705
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  133,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Artificial Intelligence \u0026 Robotics",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Trí tuệ nhân tạo và Robot!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Artificial Intelligence \u0026 Robotics!"
                                      ],
                            "name":  "THẦN THÚ TRÍ TUỆ NHÂN TẠO VÀ ROBOT: ARTIFICIAL INTELLIGENCE \u0026 ROBOTICS TITAN",
                            "atk":  191,
                            "archetype":  "quantum_agi_god",
                            "baseHp":  2686,
                            "title":  "Bá Chủ Thống Trị Trí tuệ nhân tạo và Robot"
                        },
               "background":  {
                                  "effect":  "binary_rain",
                                  "particleColor":  "#67E8F9",
                                  "floorColor":  "#06222E",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#03141B",
                                  "props":  "quantum_servers",
                                  "skyColor":  "#010A0E"
                              },
               "cleanEn":  "Artificial Intelligence \u0026 Robotics",
               "cleanVi":  "Trí tuệ nhân tạo và Robot",
               "stt":  64,
               "tier":  3,
               "biome":  "quantum_agi_datacenter",
               "topicName":  "Trí tuệ nhân tạo và Robot (Artificial Intelligence \u0026 Robotics)"
           },
    "24":  {
               "minions":  [
                               {
                                   "def":  44,
                                   "name":  "Chiến Binh Đồ chơi và Trò chơi truyền thống",
                                   "color":  "#EC4899",
                                   "atk":  63,
                                   "type":  "minion_a",
                                   "hp":  239
                               },
                               {
                                   "def":  48,
                                   "name":  "Lính Gác Toys \u0026 Traditional Games",
                                   "color":  "#F472B6",
                                   "atk":  69,
                                   "type":  "minion_b",
                                   "hp":  275
                               },
                               {
                                   "def":  53,
                                   "name":  "Hộ Vệ Tinh Anh Đồ chơi và Trò chơi truyền thống",
                                   "color":  "#FFFFFF",
                                   "atk":  79,
                                   "type":  "minion_c",
                                   "hp":  311
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  64,
                            "color":  "#EC4899",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Toys \u0026 Traditional Games",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Đồ chơi và Trò chơi truyền thống!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Toys \u0026 Traditional Games!"
                                      ],
                            "name":  "THẦN THÚ ĐỒ CHƠI VÀ TRÒ CHƠI TRUYỀN THỐNG: TOYS \u0026 TRADITIONAL GAMES TITAN",
                            "atk":  98,
                            "archetype":  "chaos_jester",
                            "baseHp":  1393,
                            "title":  "Bá Chủ Thống Trị Đồ chơi và Trò chơi truyền thống"
                        },
               "background":  {
                                  "effect":  "confetti",
                                  "particleColor":  "#F472B6",
                                  "floorColor":  "#360E47",
                                  "accentColor":  "#EC4899",
                                  "wallColor":  "#21092B",
                                  "props":  "ferris_wheel_balloons",
                                  "skyColor":  "#110416"
                              },
               "cleanEn":  "Toys \u0026 Traditional Games",
               "cleanVi":  "Đồ chơi và Trò chơi truyền thống",
               "stt":  24,
               "tier":  1,
               "biome":  "carnival_night",
               "topicName":  "Đồ chơi và Trò chơi truyền thống (Toys \u0026 Traditional Games)"
           },
    "19":  {
               "minions":  [
                               {
                                   "def":  36,
                                   "name":  "Hắc Thuật Vật dụng và Thiết bị nhà bếp",
                                   "color":  "#38BDF8",
                                   "atk":  53,
                                   "type":  "minion_a",
                                   "hp":  201
                               },
                               {
                                   "def":  40,
                                   "name":  "Lính Gác Kitchen Appliances \u0026 Utensils",
                                   "color":  "#7DD3FC",
                                   "atk":  58,
                                   "type":  "minion_b",
                                   "hp":  231
                               },
                               {
                                   "def":  43,
                                   "name":  "Hộ Vệ Tinh Anh Vật dụng và Thiết bị nhà bếp",
                                   "color":  "#FFFFFF",
                                   "atk":  66,
                                   "type":  "minion_c",
                                   "hp":  261
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  56,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Kitchen Appliances \u0026 Utensils",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Vật dụng và Thiết bị nhà bếp!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Kitchen Appliances \u0026 Utensils!"
                                      ],
                            "name":  "HẮC THẦN VẬT DỤNG VÀ THIẾT BỊ NHÀ BẾP: KITCHEN APPLIANCES \u0026 UTENSILS TITAN",
                            "atk":  87,
                            "archetype":  "ancient_golem",
                            "baseHp":  1232,
                            "title":  "Bá Chủ Thống Trị Vật dụng và Thiết bị nhà bếp"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Kitchen Appliances \u0026 Utensils",
               "cleanVi":  "Vật dụng và Thiết bị nhà bếp",
               "stt":  19,
               "tier":  1,
               "biome":  "ancient_ruins",
               "topicName":  "Vật dụng và Thiết bị nhà bếp (Kitchen Appliances \u0026 Utensils)"
           },
    "29":  {
               "minions":  [
                               {
                                   "def":  51,
                                   "name":  "Ác Mộng Thuật ngữ âm nhạc và Bản nhạc",
                                   "color":  "#F43F5E",
                                   "atk":  73,
                                   "type":  "minion_a",
                                   "hp":  277
                               },
                               {
                                   "def":  56,
                                   "name":  "Lính Gác Music Theory \u0026 Sheet Music",
                                   "color":  "#FDA4AF",
                                   "atk":  80,
                                   "type":  "minion_b",
                                   "hp":  319
                               },
                               {
                                   "def":  61,
                                   "name":  "Hộ Vệ Tinh Anh Thuật ngữ âm nhạc và Bản nhạc",
                                   "color":  "#FFFFFF",
                                   "atk":  91,
                                   "type":  "minion_c",
                                   "hp":  360
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  73,
                            "color":  "#F43F5E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Music Theory \u0026 Sheet Music",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thuật ngữ âm nhạc và Bản nhạc!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Music Theory \u0026 Sheet Music!"
                                      ],
                            "name":  "HẮC THẦN THUẬT NGỮ ÂM NHẠC VÀ BẢN NHẠC: MUSIC THEORY \u0026 SHEET MUSIC TITAN",
                            "atk":  110,
                            "archetype":  "virtuoso_maestro",
                            "baseHp":  1555,
                            "title":  "Bá Chủ Thống Trị Thuật ngữ âm nhạc và Bản nhạc"
                        },
               "background":  {
                                  "effect":  "music_notes",
                                  "particleColor":  "#FDA4AF",
                                  "floorColor":  "#381729",
                                  "accentColor":  "#F43F5E",
                                  "wallColor":  "#210E18",
                                  "props":  "pipe_organ_violins",
                                  "skyColor":  "#11070C"
                              },
               "cleanEn":  "Music Theory \u0026 Sheet Music",
               "cleanVi":  "Thuật ngữ âm nhạc và Bản nhạc",
               "stt":  29,
               "tier":  2,
               "biome":  "grand_symphony",
               "topicName":  "Thuật ngữ âm nhạc và Bản nhạc (Music Theory \u0026 Sheet Music)"
           },
    "61":  {
               "minions":  [
                               {
                                   "def":  98,
                                   "name":  "Ác Mộng Linh kiện máy tính",
                                   "color":  "#58A6FF",
                                   "atk":  136,
                                   "type":  "minion_a",
                                   "hp":  520
                               },
                               {
                                   "def":  108,
                                   "name":  "Lính Gác Computer Hardware components",
                                   "color":  "#79C0FF",
                                   "atk":  150,
                                   "type":  "minion_b",
                                   "hp":  598
                               },
                               {
                                   "def":  118,
                                   "name":  "Hộ Vệ Tinh Anh Linh kiện máy tính",
                                   "color":  "#FFFFFF",
                                   "atk":  170,
                                   "type":  "minion_c",
                                   "hp":  676
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  128,
                            "color":  "#58A6FF",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Computer Hardware components",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Linh kiện máy tính!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Computer Hardware components!"
                                      ],
                            "name":  "MA VƯƠNG LINH KIỆN MÁY TÍNH: COMPUTER HARDWARE COMPONENTS TITAN",
                            "atk":  184,
                            "archetype":  "cyber_overlord",
                            "baseHp":  2589,
                            "title":  "Bá Chủ Thống Trị Linh kiện máy tính"
                        },
               "background":  {
                                  "effect":  "digital_glitch",
                                  "particleColor":  "#79C0FF",
                                  "floorColor":  "#161B22",
                                  "accentColor":  "#58A6FF",
                                  "wallColor":  "#0D1117",
                                  "props":  "arcade_neon_glitch",
                                  "skyColor":  "#07090D"
                              },
               "cleanEn":  "Computer Hardware components",
               "cleanVi":  "Linh kiện máy tính",
               "stt":  61,
               "tier":  3,
               "biome":  "cyber_arcade_city",
               "topicName":  "Linh kiện máy tính (Computer Hardware components)"
           },
    "94":  {
               "minions":  [
                               {
                                   "def":  146,
                                   "name":  "Bóng Ma Phương tiện giao thông công cộng",
                                   "color":  "#38BDF8",
                                   "atk":  201,
                                   "type":  "minion_a",
                                   "hp":  770
                               },
                               {
                                   "def":  161,
                                   "name":  "Lính Gác Public Transportation",
                                   "color":  "#7DD3FC",
                                   "atk":  221,
                                   "type":  "minion_b",
                                   "hp":  885
                               },
                               {
                                   "def":  175,
                                   "name":  "Hộ Vệ Tinh Anh Phương tiện giao thông công cộng",
                                   "color":  "#FFFFFF",
                                   "atk":  251,
                                   "type":  "minion_c",
                                   "hp":  1001
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  185,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Public Transportation",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Phương tiện giao thông công cộng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Public Transportation!"
                                      ],
                            "name":  "THẦN THÚ PHƯƠNG TIỆN GIAO THÔNG CÔNG CỘNG: PUBLIC TRANSPORTATION TITAN",
                            "atk":  261,
                            "archetype":  "turbo_highway_wyrm",
                            "baseHp":  3656,
                            "title":  "Bá Chủ Thống Trị Phương tiện giao thông công cộng"
                        },
               "background":  {
                                  "effect":  "headlights",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1D222E",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#12151C",
                                  "props":  "highway_overpass",
                                  "skyColor":  "#090B0E"
                              },
               "cleanEn":  "Public Transportation",
               "cleanVi":  "Phương tiện giao thông công cộng",
               "stt":  94,
               "tier":  4,
               "biome":  "metropolis_freeway",
               "topicName":  "Phương tiện giao thông công cộng (Public Transportation)"
           },
    "97":  {
               "minions":  [
                               {
                                   "def":  151,
                                   "name":  "Quái Thú Quán ăn và Dịch vụ ăn uống",
                                   "color":  "#38BDF8",
                                   "atk":  207,
                                   "type":  "minion_a",
                                   "hp":  792
                               },
                               {
                                   "def":  166,
                                   "name":  "Lính Gác Restaurants \u0026 Food Service",
                                   "color":  "#7DD3FC",
                                   "atk":  228,
                                   "type":  "minion_b",
                                   "hp":  911
                               },
                               {
                                   "def":  181,
                                   "name":  "Hộ Vệ Tinh Anh Quán ăn và Dịch vụ ăn uống",
                                   "color":  "#FFFFFF",
                                   "atk":  259,
                                   "type":  "minion_c",
                                   "hp":  1030
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  190,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Restaurants \u0026 Food Service",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Quán ăn và Dịch vụ ăn uống!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Restaurants \u0026 Food Service!"
                                      ],
                            "name":  "BÁ CHỦ QUÁN ĂN VÀ DỊCH VỤ ĂN UỐNG: RESTAURANTS \u0026 FOOD SERVICE TITAN",
                            "atk":  268,
                            "archetype":  "ancient_golem",
                            "baseHp":  3753,
                            "title":  "Bá Chủ Thống Trị Quán ăn và Dịch vụ ăn uống"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Restaurants \u0026 Food Service",
               "cleanVi":  "Quán ăn và Dịch vụ ăn uống",
               "stt":  97,
               "tier":  4,
               "biome":  "ancient_ruins",
               "topicName":  "Quán ăn và Dịch vụ ăn uống (Restaurants \u0026 Food Service)"
           },
    "9":  {
              "minions":  [
                              {
                                  "def":  22,
                                  "name":  "Bánh Răng Bắn Tốc Độ",
                                  "color":  "#EA580C",
                                  "atk":  34,
                                  "type":  "cog_spinner",
                                  "hp":  126
                              },
                              {
                                  "def":  24,
                                  "name":  "Thợ Hàn Ma Quái",
                                  "color":  "#FB923C",
                                  "atk":  37,
                                  "type":  "welder_ghost",
                                  "hp":  145
                              },
                              {
                                  "def":  26,
                                  "name":  "Hồ Sơ Hợp Đồng Sắc Lẹm",
                                  "color":  "#FFFFFF",
                                  "atk":  42,
                                  "type":  "paper_cutter",
                                  "hp":  164
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  39,
                           "color":  "#EA580C",
                           "skillName":  "Búa Máy Thủy Lực Đập Tan",
                           "roars":  [
                                         "Đến giờ làm việc rồi! Không được nghỉ!",
                                         "Tăng ca vô tận!"
                                     ],
                           "name":  "BÁ TƯỚC CÔNG NGHIỆP: CLOCKWORK OVERSEER",
                           "atk":  64,
                           "archetype":  "foundry_juggernaut",
                           "baseHp":  909,
                           "title":  "Chúa Tể Dây Chuyền Sản Xuất"
                       },
              "background":  {
                                 "effect":  "sparks",
                                 "particleColor":  "#FB923C",
                                 "floorColor":  "#332B27",
                                 "accentColor":  "#EA580C",
                                 "wallColor":  "#1E1A18",
                                 "props":  "furnace_gears",
                                 "skyColor":  "#0F0D0C"
                             },
              "cleanEn":  "Professions \u0026 Job Titles",
              "cleanVi":  "Ngành nghề và Chức danh công việc",
              "stt":  9,
              "tier":  1,
              "biome":  "iron_foundry",
              "topicName":  "Ngành nghề và Chức danh công việc (Professions \u0026 Job Titles)"
          },
    "74":  {
               "minions":  [
                               {
                                   "def":  117,
                                   "name":  "Khổng Lồ Hệ sinh thái",
                                   "color":  "#22C55E",
                                   "atk":  162,
                                   "type":  "minion_a",
                                   "hp":  618
                               },
                               {
                                   "def":  129,
                                   "name":  "Lính Gác Ecosystems",
                                   "color":  "#86EFAC",
                                   "atk":  178,
                                   "type":  "minion_b",
                                   "hp":  711
                               },
                               {
                                   "def":  140,
                                   "name":  "Hộ Vệ Tinh Anh Hệ sinh thái",
                                   "color":  "#FFFFFF",
                                   "atk":  202,
                                   "type":  "minion_c",
                                   "hp":  803
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  150,
                            "color":  "#22C55E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Ecosystems",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hệ sinh thái!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Ecosystems!"
                                      ],
                            "name":  "THẦN THÚ HỆ SINH THÁI: ECOSYSTEMS TITAN",
                            "atk":  215,
                            "archetype":  "ancient_dryad",
                            "baseHp":  3010,
                            "title":  "Bá Chủ Thống Trị Hệ sinh thái"
                        },
               "background":  {
                                  "effect":  "spores_fireflies",
                                  "particleColor":  "#86EFAC",
                                  "floorColor":  "#14301F",
                                  "accentColor":  "#22C55E",
                                  "wallColor":  "#0B1D12",
                                  "props":  "giant_roots_mushrooms",
                                  "skyColor":  "#050F09"
                              },
               "cleanEn":  "Ecosystems",
               "cleanVi":  "Hệ sinh thái",
               "stt":  74,
               "tier":  3,
               "biome":  "primeval_forest",
               "topicName":  "Hệ sinh thái (Ecosystems)"
           },
    "37":  {
               "minions":  [
                               {
                                   "def":  63,
                                   "name":  "Ác Mộng Hội họa và Mỹ thuật",
                                   "color":  "#38BDF8",
                                   "atk":  89,
                                   "type":  "minion_a",
                                   "hp":  338
                               },
                               {
                                   "def":  69,
                                   "name":  "Lính Gác Painting \u0026 Fine Arts",
                                   "color":  "#7DD3FC",
                                   "atk":  98,
                                   "type":  "minion_b",
                                   "hp":  389
                               },
                               {
                                   "def":  76,
                                   "name":  "Hộ Vệ Tinh Anh Hội họa và Mỹ thuật",
                                   "color":  "#FFFFFF",
                                   "atk":  111,
                                   "type":  "minion_c",
                                   "hp":  439
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  87,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Painting \u0026 Fine Arts",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hội họa và Mỹ thuật!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Painting \u0026 Fine Arts!"
                                      ],
                            "name":  "BÁ CHỦ HỘI HỌA VÀ MỸ THUẬT: PAINTING \u0026 FINE ARTS TITAN",
                            "atk":  129,
                            "archetype":  "ancient_golem",
                            "baseHp":  1814,
                            "title":  "Bá Chủ Thống Trị Hội họa và Mỹ thuật"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Painting \u0026 Fine Arts",
               "cleanVi":  "Hội họa và Mỹ thuật",
               "stt":  37,
               "tier":  2,
               "biome":  "ancient_ruins",
               "topicName":  "Hội họa và Mỹ thuật (Painting \u0026 Fine Arts)"
           },
    "7":  {
              "minions":  [
                              {
                                  "def":  19,
                                  "name":  "Khuẩn Đột Biến Xanh",
                                  "color":  "#10B981",
                                  "atk":  30,
                                  "type":  "bio_germ",
                                  "hp":  110
                              },
                              {
                                  "def":  21,
                                  "name":  "Bào Tử Sốt Rét",
                                  "color":  "#34D399",
                                  "atk":  33,
                                  "type":  "fever_spore",
                                  "hp":  126
                              },
                              {
                                  "def":  23,
                                  "name":  "Kim Tiêm Ma Quái",
                                  "color":  "#FFFFFF",
                                  "atk":  38,
                                  "type":  "cursed_syringe",
                                  "hp":  143
                              }
                          ],
              "tierName":  "Sơ Cấp (Apprentice)",
              "boss":  {
                           "def":  35,
                           "color":  "#10B981",
                           "skillName":  "Bão Bào Tử Lây Nhiễm Tuyệt Đối",
                           "roars":  [
                                         "Không có kháng sinh nào chữa được ngươi!",
                                         "Triệu chứng tử vong!"
                                     ],
                           "name":  "CHÚA TỂ BỆNH DỊCH: PLAGUE CORRUPTOR LORD",
                           "atk":  59,
                           "archetype":  "plague_titan",
                           "baseHp":  844,
                           "title":  "Nguồn Cội Đại Dịch Vô Tận"
                       },
              "background":  {
                                 "effect":  "ecg_pulse",
                                 "particleColor":  "#34D399",
                                 "floorColor":  "#123330",
                                 "accentColor":  "#10B981",
                                 "wallColor":  "#0A1F1D",
                                 "props":  "bio_vials_ecg",
                                 "skyColor":  "#051110"
                             },
              "cleanEn":  "Diseases \u0026 Medical Symptoms",
              "cleanVi":  "Các loại bệnh và Triệu chứng y khoa",
              "stt":  7,
              "tier":  1,
              "biome":  "medical_bio_lab",
              "topicName":  "Các loại bệnh và Triệu chứng y khoa (Diseases \u0026 Medical Symptoms)"
          },
    "52":  {
               "minions":  [
                               {
                                   "def":  85,
                                   "name":  "Cơ Giới Hiện tượng thời tiết và Khí hậu",
                                   "color":  "#EF4444",
                                   "atk":  118,
                                   "type":  "minion_a",
                                   "hp":  451
                               },
                               {
                                   "def":  94,
                                   "name":  "Lính Gác Weather Phenomena \u0026 Climate",
                                   "color":  "#FCA5A5",
                                   "atk":  130,
                                   "type":  "minion_b",
                                   "hp":  519
                               },
                               {
                                   "def":  102,
                                   "name":  "Hộ Vệ Tinh Anh Hiện tượng thời tiết và Khí hậu",
                                   "color":  "#FFFFFF",
                                   "atk":  148,
                                   "type":  "minion_c",
                                   "hp":  586
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  113,
                            "color":  "#EF4444",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Weather Phenomena \u0026 Climate",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hiện tượng thời tiết và Khí hậu!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Weather Phenomena \u0026 Climate!"
                                      ],
                            "name":  "CỰ QUÁI HIỆN TƯỢNG THỜI TIẾT VÀ KHÍ HẬU: WEATHER PHENOMENA \u0026 CLIMATE TITAN",
                            "atk":  163,
                            "archetype":  "calamity_dragon",
                            "baseHp":  2298,
                            "title":  "Bá Chủ Thống Trị Hiện tượng thời tiết và Khí hậu"
                        },
               "background":  {
                                  "effect":  "lightning_flashes",
                                  "particleColor":  "#FCA5A5",
                                  "floorColor":  "#3D1714",
                                  "accentColor":  "#EF4444",
                                  "wallColor":  "#250F0D",
                                  "props":  "lightning_magma",
                                  "skyColor":  "#130706"
                              },
               "cleanEn":  "Weather Phenomena \u0026 Climate",
               "cleanVi":  "Hiện tượng thời tiết và Khí hậu",
               "stt":  52,
               "tier":  3,
               "biome":  "storm_caldera",
               "topicName":  "Hiện tượng thời tiết và Khí hậu (Weather Phenomena \u0026 Climate)"
           },
    "81":  {
               "minions":  [
                               {
                                   "def":  127,
                                   "name":  "Quái Thú Các công trình công cộng trong thành phố",
                                   "color":  "#38BDF8",
                                   "atk":  176,
                                   "type":  "minion_a",
                                   "hp":  671
                               },
                               {
                                   "def":  140,
                                   "name":  "Lính Gác Public City Structures",
                                   "color":  "#7DD3FC",
                                   "atk":  194,
                                   "type":  "minion_b",
                                   "hp":  772
                               },
                               {
                                   "def":  152,
                                   "name":  "Hộ Vệ Tinh Anh Các công trình công cộng trong thành phố",
                                   "color":  "#FFFFFF",
                                   "atk":  220,
                                   "type":  "minion_c",
                                   "hp":  872
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  162,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Public City Structures",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các công trình công cộng trong thành phố!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Public City Structures!"
                                      ],
                            "name":  "MA VƯƠNG CÁC CÔNG TRÌNH CÔNG CỘNG TRONG THÀNH PHỐ: PUBLIC CITY STRUCTURES TITAN",
                            "atk":  231,
                            "archetype":  "turbo_highway_wyrm",
                            "baseHp":  3236,
                            "title":  "Bá Chủ Thống Trị Các công trình công cộng trong thành phố"
                        },
               "background":  {
                                  "effect":  "headlights",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1D222E",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#12151C",
                                  "props":  "highway_overpass",
                                  "skyColor":  "#090B0E"
                              },
               "cleanEn":  "Public City Structures",
               "cleanVi":  "Các công trình công cộng trong thành phố",
               "stt":  81,
               "tier":  4,
               "biome":  "metropolis_freeway",
               "topicName":  "Các công trình công cộng trong thành phố (Public City Structures)"
           },
    "39":  {
               "minions":  [
                               {
                                   "def":  66,
                                   "name":  "Linh Hồn Các môn học hàn lâm",
                                   "color":  "#F59E0B",
                                   "atk":  93,
                                   "type":  "minion_a",
                                   "hp":  353
                               },
                               {
                                   "def":  73,
                                   "name":  "Lính Gác Academic Subjects",
                                   "color":  "#FDE68A",
                                   "atk":  102,
                                   "type":  "minion_b",
                                   "hp":  406
                               },
                               {
                                   "def":  79,
                                   "name":  "Hộ Vệ Tinh Anh Các môn học hàn lâm",
                                   "color":  "#FFFFFF",
                                   "atk":  116,
                                   "type":  "minion_c",
                                   "hp":  459
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  90,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Academic Subjects",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các môn học hàn lâm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Academic Subjects!"
                                      ],
                            "name":  "HẮC THẦN CÁC MÔN HỌC HÀN LÂM: ACADEMIC SUBJECTS TITAN",
                            "atk":  133,
                            "archetype":  "scholar_lich",
                            "baseHp":  1878,
                            "title":  "Bá Chủ Thống Trị Các môn học hàn lâm"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Academic Subjects",
               "cleanVi":  "Các môn học hàn lâm",
               "stt":  39,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Các môn học hàn lâm (Academic Subjects)"
           },
    "48":  {
               "minions":  [
                               {
                                   "def":  79,
                                   "name":  "Chiến Binh Truyện tranh và Phim hoạt hình",
                                   "color":  "#E11D48",
                                   "atk":  111,
                                   "type":  "minion_a",
                                   "hp":  421
                               },
                               {
                                   "def":  87,
                                   "name":  "Lính Gác Comics \u0026 Animation",
                                   "color":  "#F43F5E",
                                   "atk":  122,
                                   "type":  "minion_b",
                                   "hp":  484
                               },
                               {
                                   "def":  95,
                                   "name":  "Hộ Vệ Tinh Anh Truyện tranh và Phim hoạt hình",
                                   "color":  "#FFFFFF",
                                   "atk":  139,
                                   "type":  "minion_c",
                                   "hp":  547
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  106,
                            "color":  "#E11D48",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Comics \u0026 Animation",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Truyện tranh và Phim hoạt hình!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Comics \u0026 Animation!"
                                      ],
                            "name":  "HOÀNG ĐẾ TRUYỆN TRANH VÀ PHIM HOẠT HÌNH: COMICS \u0026 ANIMATION TITAN",
                            "atk":  154,
                            "archetype":  "broadcast_overlord",
                            "baseHp":  2169,
                            "title":  "Bá Chủ Thống Trị Truyện tranh và Phim hoạt hình"
                        },
               "background":  {
                                  "effect":  "crt_static",
                                  "particleColor":  "#F43F5E",
                                  "floorColor":  "#1F2937",
                                  "accentColor":  "#E11D48",
                                  "wallColor":  "#111827",
                                  "props":  "cameras_monitors",
                                  "skyColor":  "#090D14"
                              },
               "cleanEn":  "Comics \u0026 Animation",
               "cleanVi":  "Truyện tranh và Phim hoạt hình",
               "stt":  48,
               "tier":  2,
               "biome":  "broadcast_studio",
               "topicName":  "Truyện tranh và Phim hoạt hình (Comics \u0026 Animation)"
           },
    "93":  {
               "minions":  [
                               {
                                   "def":  145,
                                   "name":  "Ác Mộng Thuế và Các loại bảo hiểm",
                                   "color":  "#38BDF8",
                                   "atk":  199,
                                   "type":  "minion_a",
                                   "hp":  762
                               },
                               {
                                   "def":  160,
                                   "name":  "Lính Gác Taxes \u0026 Insurance",
                                   "color":  "#7DD3FC",
                                   "atk":  219,
                                   "type":  "minion_b",
                                   "hp":  876
                               },
                               {
                                   "def":  174,
                                   "name":  "Hộ Vệ Tinh Anh Thuế và Các loại bảo hiểm",
                                   "color":  "#FFFFFF",
                                   "atk":  249,
                                   "type":  "minion_c",
                                   "hp":  991
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  183,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Taxes \u0026 Insurance",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thuế và Các loại bảo hiểm!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Taxes \u0026 Insurance!"
                                      ],
                            "name":  "BÁ VƯƠNG THUẾ VÀ CÁC LOẠI BẢO HIỂM: TAXES \u0026 INSURANCE TITAN",
                            "atk":  259,
                            "archetype":  "iron_judge",
                            "baseHp":  3624,
                            "title":  "Bá Chủ Thống Trị Thuế và Các loại bảo hiểm"
                        },
               "background":  {
                                  "effect":  "verdict_aura",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1E273B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#131926",
                                  "props":  "justice_scales",
                                  "skyColor":  "#0A0D14"
                              },
               "cleanEn":  "Taxes \u0026 Insurance",
               "cleanVi":  "Thuế và Các loại bảo hiểm",
               "stt":  93,
               "tier":  4,
               "biome":  "high_tribunal",
               "topicName":  "Thuế và Các loại bảo hiểm (Taxes \u0026 Insurance)"
           },
    "90":  {
               "minions":  [
                               {
                                   "def":  140,
                                   "name":  "Khổng Lồ Vật liệu xây dựng",
                                   "color":  "#38BDF8",
                                   "atk":  193,
                                   "type":  "minion_a",
                                   "hp":  739
                               },
                               {
                                   "def":  154,
                                   "name":  "Lính Gác Construction Materials",
                                   "color":  "#7DD3FC",
                                   "atk":  212,
                                   "type":  "minion_b",
                                   "hp":  850
                               },
                               {
                                   "def":  168,
                                   "name":  "Hộ Vệ Tinh Anh Vật liệu xây dựng",
                                   "color":  "#FFFFFF",
                                   "atk":  241,
                                   "type":  "minion_c",
                                   "hp":  961
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  178,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Construction Materials",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Vật liệu xây dựng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Construction Materials!"
                                      ],
                            "name":  "ĐẠI THẦN VẬT LIỆU XÂY DỰNG: CONSTRUCTION MATERIALS TITAN",
                            "atk":  252,
                            "archetype":  "ancient_golem",
                            "baseHp":  3527,
                            "title":  "Bá Chủ Thống Trị Vật liệu xây dựng"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Construction Materials",
               "cleanVi":  "Vật liệu xây dựng",
               "stt":  90,
               "tier":  4,
               "biome":  "ancient_ruins",
               "topicName":  "Vật liệu xây dựng (Construction Materials)"
           },
    "21":  {
               "minions":  [
                               {
                                   "def":  39,
                                   "name":  "Ác Mộng Sự kiện, Lễ hội và Tiệc tùng",
                                   "color":  "#EC4899",
                                   "atk":  57,
                                   "type":  "minion_a",
                                   "hp":  217
                               },
                               {
                                   "def":  43,
                                   "name":  "Lính Gác Events, Festivals \u0026 Parties",
                                   "color":  "#F472B6",
                                   "atk":  63,
                                   "type":  "minion_b",
                                   "hp":  250
                               },
                               {
                                   "def":  47,
                                   "name":  "Hộ Vệ Tinh Anh Sự kiện, Lễ hội và Tiệc tùng",
                                   "color":  "#FFFFFF",
                                   "atk":  71,
                                   "type":  "minion_c",
                                   "hp":  282
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  59,
                            "color":  "#EC4899",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Events, Festivals \u0026 Parties",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Sự kiện, Lễ hội và Tiệc tùng!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Events, Festivals \u0026 Parties!"
                                      ],
                            "name":  "MA VƯƠNG SỰ KIỆN, LỄ HỘI VÀ TIỆC TÙNG: EVENTS, FESTIVALS \u0026 PARTIES TITAN",
                            "atk":  91,
                            "archetype":  "chaos_jester",
                            "baseHp":  1296,
                            "title":  "Bá Chủ Thống Trị Sự kiện, Lễ hội và Tiệc tùng"
                        },
               "background":  {
                                  "effect":  "confetti",
                                  "particleColor":  "#F472B6",
                                  "floorColor":  "#360E47",
                                  "accentColor":  "#EC4899",
                                  "wallColor":  "#21092B",
                                  "props":  "ferris_wheel_balloons",
                                  "skyColor":  "#110416"
                              },
               "cleanEn":  "Events, Festivals \u0026 Parties",
               "cleanVi":  "Sự kiện, Lễ hội và Tiệc tùng",
               "stt":  21,
               "tier":  1,
               "biome":  "carnival_night",
               "topicName":  "Sự kiện, Lễ hội và Tiệc tùng (Events, Festivals \u0026 Parties)"
           },
    "56":  {
               "minions":  [
                               {
                                   "def":  91,
                                   "name":  "Chiến Binh Thảm họa thiên nhiên",
                                   "color":  "#EF4444",
                                   "atk":  126,
                                   "type":  "minion_a",
                                   "hp":  482
                               },
                               {
                                   "def":  100,
                                   "name":  "Lính Gác Natural Disasters",
                                   "color":  "#FCA5A5",
                                   "atk":  139,
                                   "type":  "minion_b",
                                   "hp":  554
                               },
                               {
                                   "def":  109,
                                   "name":  "Hộ Vệ Tinh Anh Thảm họa thiên nhiên",
                                   "color":  "#FFFFFF",
                                   "atk":  158,
                                   "type":  "minion_c",
                                   "hp":  627
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  119,
                            "color":  "#EF4444",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Natural Disasters",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thảm họa thiên nhiên!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Natural Disasters!"
                                      ],
                            "name":  "CHÚA TỂ THẢM HỌA THIÊN NHIÊN: NATURAL DISASTERS TITAN",
                            "atk":  173,
                            "archetype":  "calamity_dragon",
                            "baseHp":  2428,
                            "title":  "Bá Chủ Thống Trị Thảm họa thiên nhiên"
                        },
               "background":  {
                                  "effect":  "lightning_flashes",
                                  "particleColor":  "#FCA5A5",
                                  "floorColor":  "#3D1714",
                                  "accentColor":  "#EF4444",
                                  "wallColor":  "#250F0D",
                                  "props":  "lightning_magma",
                                  "skyColor":  "#130706"
                              },
               "cleanEn":  "Natural Disasters",
               "cleanVi":  "Thảm họa thiên nhiên",
               "stt":  56,
               "tier":  3,
               "biome":  "storm_caldera",
               "topicName":  "Thảm họa thiên nhiên (Natural Disasters)"
           },
    "46":  {
               "minions":  [
                               {
                                   "def":  76,
                                   "name":  "Bóng Ma Ngôn ngữ học và Từ vựng học",
                                   "color":  "#38BDF8",
                                   "atk":  107,
                                   "type":  "minion_a",
                                   "hp":  406
                               },
                               {
                                   "def":  84,
                                   "name":  "Lính Gác Linguistics \u0026 Lexicology",
                                   "color":  "#7DD3FC",
                                   "atk":  118,
                                   "type":  "minion_b",
                                   "hp":  467
                               },
                               {
                                   "def":  91,
                                   "name":  "Hộ Vệ Tinh Anh Ngôn ngữ học và Từ vựng học",
                                   "color":  "#FFFFFF",
                                   "atk":  134,
                                   "type":  "minion_c",
                                   "hp":  528
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  102,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Linguistics \u0026 Lexicology",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Ngôn ngữ học và Từ vựng học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Linguistics \u0026 Lexicology!"
                                      ],
                            "name":  "CHÚA TỂ NGÔN NGỮ HỌC VÀ TỪ VỰNG HỌC: LINGUISTICS \u0026 LEXICOLOGY TITAN",
                            "atk":  150,
                            "archetype":  "ancient_golem",
                            "baseHp":  2105,
                            "title":  "Bá Chủ Thống Trị Ngôn ngữ học và Từ vựng học"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Linguistics \u0026 Lexicology",
               "cleanVi":  "Ngôn ngữ học và Từ vựng học",
               "stt":  46,
               "tier":  2,
               "biome":  "ancient_ruins",
               "topicName":  "Ngôn ngữ học và Từ vựng học (Linguistics \u0026 Lexicology)"
           },
    "75":  {
               "minions":  [
                               {
                                   "def":  118,
                                   "name":  "Hắc Thuật Thiết bị viễn thông",
                                   "color":  "#06B6D4",
                                   "atk":  164,
                                   "type":  "minion_a",
                                   "hp":  626
                               },
                               {
                                   "def":  130,
                                   "name":  "Lính Gác Telecommunication Devices",
                                   "color":  "#67E8F9",
                                   "atk":  180,
                                   "type":  "minion_b",
                                   "hp":  720
                               },
                               {
                                   "def":  142,
                                   "name":  "Hộ Vệ Tinh Anh Thiết bị viễn thông",
                                   "color":  "#FFFFFF",
                                   "atk":  205,
                                   "type":  "minion_c",
                                   "hp":  814
                               }
                           ],
               "tierName":  "Cao Cấp (Master)",
               "boss":  {
                            "def":  152,
                            "color":  "#06B6D4",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Telecommunication Devices",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Thiết bị viễn thông!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Telecommunication Devices!"
                                      ],
                            "name":  "THẦN MA THIẾT BỊ VIỄN THÔNG: TELECOMMUNICATION DEVICES TITAN",
                            "atk":  217,
                            "archetype":  "quantum_agi_god",
                            "baseHp":  3042,
                            "title":  "Bá Chủ Thống Trị Thiết bị viễn thông"
                        },
               "background":  {
                                  "effect":  "binary_rain",
                                  "particleColor":  "#67E8F9",
                                  "floorColor":  "#06222E",
                                  "accentColor":  "#06B6D4",
                                  "wallColor":  "#03141B",
                                  "props":  "quantum_servers",
                                  "skyColor":  "#010A0E"
                              },
               "cleanEn":  "Telecommunication Devices",
               "cleanVi":  "Thiết bị viễn thông",
               "stt":  75,
               "tier":  3,
               "biome":  "quantum_agi_datacenter",
               "topicName":  "Thiết bị viễn thông (Telecommunication Devices)"
           },
    "79":  {
               "minions":  [
                               {
                                   "def":  124,
                                   "name":  "Linh Hồn Hạ tầng giao thông đô thị",
                                   "color":  "#38BDF8",
                                   "atk":  172,
                                   "type":  "minion_a",
                                   "hp":  656
                               },
                               {
                                   "def":  136,
                                   "name":  "Lính Gác Urban Traffic Infrastructure",
                                   "color":  "#7DD3FC",
                                   "atk":  189,
                                   "type":  "minion_b",
                                   "hp":  754
                               },
                               {
                                   "def":  149,
                                   "name":  "Hộ Vệ Tinh Anh Hạ tầng giao thông đô thị",
                                   "color":  "#FFFFFF",
                                   "atk":  215,
                                   "type":  "minion_c",
                                   "hp":  853
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  159,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Urban Traffic Infrastructure",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Hạ tầng giao thông đô thị!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Urban Traffic Infrastructure!"
                                      ],
                            "name":  "HẮC THẦN HẠ TẦNG GIAO THÔNG ĐÔ THỊ: URBAN TRAFFIC INFRASTRUCTURE TITAN",
                            "atk":  226,
                            "archetype":  "turbo_highway_wyrm",
                            "baseHp":  3171,
                            "title":  "Bá Chủ Thống Trị Hạ tầng giao thông đô thị"
                        },
               "background":  {
                                  "effect":  "headlights",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1D222E",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#12151C",
                                  "props":  "highway_overpass",
                                  "skyColor":  "#090B0E"
                              },
               "cleanEn":  "Urban Traffic Infrastructure",
               "cleanVi":  "Hạ tầng giao thông đô thị",
               "stt":  79,
               "tier":  4,
               "biome":  "metropolis_freeway",
               "topicName":  "Hạ tầng giao thông đô thị (Urban Traffic Infrastructure)"
           },
    "84":  {
               "minions":  [
                               {
                                   "def":  132,
                                   "name":  "Cơ Giới Kiến trúc và Bất động sản",
                                   "color":  "#38BDF8",
                                   "atk":  181,
                                   "type":  "minion_a",
                                   "hp":  694
                               },
                               {
                                   "def":  145,
                                   "name":  "Lính Gác Architecture \u0026 Real Estate",
                                   "color":  "#BAE6FD",
                                   "atk":  199,
                                   "type":  "minion_b",
                                   "hp":  798
                               },
                               {
                                   "def":  158,
                                   "name":  "Hộ Vệ Tinh Anh Kiến trúc và Bất động sản",
                                   "color":  "#FFFFFF",
                                   "atk":  226,
                                   "type":  "minion_c",
                                   "hp":  902
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  168,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Architecture \u0026 Real Estate",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Kiến trúc và Bất động sản!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Architecture \u0026 Real Estate!"
                                      ],
                            "name":  "THẦN THÚ KIẾN TRÚC VÀ BẤT ĐỘNG SẢN: ARCHITECTURE \u0026 REAL ESTATE TITAN",
                            "atk":  238,
                            "archetype":  "skyline_zephyr_behemoth",
                            "baseHp":  3333,
                            "title":  "Bá Chủ Thống Trị Kiến trúc và Bất động sản"
                        },
               "background":  {
                                  "effect":  "beacon_lights",
                                  "particleColor":  "#BAE6FD",
                                  "floorColor":  "#182436",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#0F1722",
                                  "props":  "runway_control_tower",
                                  "skyColor":  "#070B11"
                              },
               "cleanEn":  "Architecture \u0026 Real Estate",
               "cleanVi":  "Kiến trúc và Bất động sản",
               "stt":  84,
               "tier":  4,
               "biome":  "skyport_terminal",
               "topicName":  "Kiến trúc và Bất động sản (Architecture \u0026 Real Estate)"
           },
    "32":  {
               "minions":  [
                               {
                                   "def":  55,
                                   "name":  "Chiến Binh Văn phòng phẩm và Dụng cụ học tập",
                                   "color":  "#F59E0B",
                                   "atk":  79,
                                   "type":  "minion_a",
                                   "hp":  300
                               },
                               {
                                   "def":  61,
                                   "name":  "Lính Gác Stationery \u0026 School Supplies",
                                   "color":  "#FDE68A",
                                   "atk":  87,
                                   "type":  "minion_b",
                                   "hp":  345
                               },
                               {
                                   "def":  66,
                                   "name":  "Hộ Vệ Tinh Anh Văn phòng phẩm và Dụng cụ học tập",
                                   "color":  "#FFFFFF",
                                   "atk":  99,
                                   "type":  "minion_c",
                                   "hp":  390
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  78,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Stationery \u0026 School Supplies",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Văn phòng phẩm và Dụng cụ học tập!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Stationery \u0026 School Supplies!"
                                      ],
                            "name":  "CỰ QUÁI VĂN PHÒNG PHẨM VÀ DỤNG CỤ HỌC TẬP: STATIONERY \u0026 SCHOOL SUPPLIES TITAN",
                            "atk":  117,
                            "archetype":  "scholar_lich",
                            "baseHp":  1652,
                            "title":  "Bá Chủ Thống Trị Văn phòng phẩm và Dụng cụ học tập"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Stationery \u0026 School Supplies",
               "cleanVi":  "Văn phòng phẩm và Dụng cụ học tập",
               "stt":  32,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Văn phòng phẩm và Dụng cụ học tập (Stationery \u0026 School Supplies)"
           },
    "89":  {
               "minions":  [
                               {
                                   "def":  139,
                                   "name":  "Quái Thú Tiếp thị và Chiến dịch quảng cáo",
                                   "color":  "#E11D48",
                                   "atk":  191,
                                   "type":  "minion_a",
                                   "hp":  732
                               },
                               {
                                   "def":  153,
                                   "name":  "Lính Gác Marketing \u0026 Advertising Campaigns",
                                   "color":  "#F43F5E",
                                   "atk":  210,
                                   "type":  "minion_b",
                                   "hp":  842
                               },
                               {
                                   "def":  167,
                                   "name":  "Hộ Vệ Tinh Anh Tiếp thị và Chiến dịch quảng cáo",
                                   "color":  "#FFFFFF",
                                   "atk":  239,
                                   "type":  "minion_c",
                                   "hp":  952
                               }
                           ],
               "tierName":  "Thần Thoại (Mythic)",
               "boss":  {
                            "def":  176,
                            "color":  "#E11D48",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Marketing \u0026 Advertising Campaigns",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Tiếp thị và Chiến dịch quảng cáo!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Marketing \u0026 Advertising Campaigns!"
                                      ],
                            "name":  "HẮC THẦN TIẾP THỊ VÀ CHIẾN DỊCH QUẢNG CÁO: MARKETING \u0026 ADVERTISING CAMPAIGNS TITAN",
                            "atk":  249,
                            "archetype":  "broadcast_overlord",
                            "baseHp":  3494,
                            "title":  "Bá Chủ Thống Trị Tiếp thị và Chiến dịch quảng cáo"
                        },
               "background":  {
                                  "effect":  "crt_static",
                                  "particleColor":  "#F43F5E",
                                  "floorColor":  "#1F2937",
                                  "accentColor":  "#E11D48",
                                  "wallColor":  "#111827",
                                  "props":  "cameras_monitors",
                                  "skyColor":  "#090D14"
                              },
               "cleanEn":  "Marketing \u0026 Advertising Campaigns",
               "cleanVi":  "Tiếp thị và Chiến dịch quảng cáo",
               "stt":  89,
               "tier":  4,
               "biome":  "broadcast_studio",
               "topicName":  "Tiếp thị và Chiến dịch quảng cáo (Marketing \u0026 Advertising Campaigns)"
           },
    "31":  {
               "minions":  [
                               {
                                   "def":  54,
                                   "name":  "Linh Hồn Khóa luận và Nghiên cứu khoa học",
                                   "color":  "#F59E0B",
                                   "atk":  77,
                                   "type":  "minion_a",
                                   "hp":  292
                               },
                               {
                                   "def":  59,
                                   "name":  "Lính Gác Theses \u0026 Academic Research",
                                   "color":  "#FDE68A",
                                   "atk":  85,
                                   "type":  "minion_b",
                                   "hp":  336
                               },
                               {
                                   "def":  65,
                                   "name":  "Hộ Vệ Tinh Anh Khóa luận và Nghiên cứu khoa học",
                                   "color":  "#FFFFFF",
                                   "atk":  96,
                                   "type":  "minion_c",
                                   "hp":  380
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  77,
                            "color":  "#F59E0B",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Theses \u0026 Academic Research",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Khóa luận và Nghiên cứu khoa học!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Theses \u0026 Academic Research!"
                                      ],
                            "name":  "MA VƯƠNG KHÓA LUẬN VÀ NGHIÊN CỨU KHOA HỌC: THESES \u0026 ACADEMIC RESEARCH TITAN",
                            "atk":  115,
                            "archetype":  "scholar_lich",
                            "baseHp":  1620,
                            "title":  "Bá Chủ Thống Trị Khóa luận và Nghiên cứu khoa học"
                        },
               "background":  {
                                  "effect":  "magic_pages",
                                  "particleColor":  "#FDE68A",
                                  "floorColor":  "#31261E",
                                  "accentColor":  "#F59E0B",
                                  "wallColor":  "#1E1813",
                                  "props":  "floating_tomes_scrolls",
                                  "skyColor":  "#0F0C09"
                              },
               "cleanEn":  "Theses \u0026 Academic Research",
               "cleanVi":  "Khóa luận và Nghiên cứu khoa học",
               "stt":  31,
               "tier":  2,
               "biome":  "infinite_library",
               "topicName":  "Khóa luận và Nghiên cứu khoa học (Theses \u0026 Academic Research)"
           },
    "15":  {
               "minions":  [
                               {
                                   "def":  31,
                                   "name":  "Linh Hồn Chính phủ và Các cơ quan nhà nước",
                                   "color":  "#38BDF8",
                                   "atk":  46,
                                   "type":  "minion_a",
                                   "hp":  171
                               },
                               {
                                   "def":  34,
                                   "name":  "Lính Gác Government \u0026 State Agencies",
                                   "color":  "#7DD3FC",
                                   "atk":  51,
                                   "type":  "minion_b",
                                   "hp":  197
                               },
                               {
                                   "def":  37,
                                   "name":  "Hộ Vệ Tinh Anh Chính phủ và Các cơ quan nhà nước",
                                   "color":  "#FFFFFF",
                                   "atk":  58,
                                   "type":  "minion_c",
                                   "hp":  222
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  49,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Government \u0026 State Agencies",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Chính phủ và Các cơ quan nhà nước!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Government \u0026 State Agencies!"
                                      ],
                            "name":  "THẦN MA CHÍNH PHỦ VÀ CÁC CƠ QUAN NHÀ NƯỚC: GOVERNMENT \u0026 STATE AGENCIES TITAN",
                            "atk":  78,
                            "archetype":  "iron_judge",
                            "baseHp":  1103,
                            "title":  "Bá Chủ Thống Trị Chính phủ và Các cơ quan nhà nước"
                        },
               "background":  {
                                  "effect":  "verdict_aura",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#1E273B",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#131926",
                                  "props":  "justice_scales",
                                  "skyColor":  "#0A0D14"
                              },
               "cleanEn":  "Government \u0026 State Agencies",
               "cleanVi":  "Chính phủ và Các cơ quan nhà nước",
               "stt":  15,
               "tier":  1,
               "biome":  "high_tribunal",
               "topicName":  "Chính phủ và Các cơ quan nhà nước (Government \u0026 State Agencies)"
           },
    "25":  {
               "minions":  [
                               {
                                   "def":  45,
                                   "name":  "Quái Thú Các loại hình nghệ thuật biểu diễn",
                                   "color":  "#F43F5E",
                                   "atk":  65,
                                   "type":  "minion_a",
                                   "hp":  247
                               },
                               {
                                   "def":  50,
                                   "name":  "Lính Gác Performing Arts",
                                   "color":  "#FDA4AF",
                                   "atk":  72,
                                   "type":  "minion_b",
                                   "hp":  284
                               },
                               {
                                   "def":  54,
                                   "name":  "Hộ Vệ Tinh Anh Các loại hình nghệ thuật biểu diễn",
                                   "color":  "#FFFFFF",
                                   "atk":  81,
                                   "type":  "minion_c",
                                   "hp":  321
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  66,
                            "color":  "#F43F5E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Performing Arts",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các loại hình nghệ thuật biểu diễn!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Performing Arts!"
                                      ],
                            "name":  "THẦN MA CÁC LOẠI HÌNH NGHỆ THUẬT BIỂU DIỄN: PERFORMING ARTS TITAN",
                            "atk":  101,
                            "archetype":  "virtuoso_maestro",
                            "baseHp":  1426,
                            "title":  "Bá Chủ Thống Trị Các loại hình nghệ thuật biểu diễn"
                        },
               "background":  {
                                  "effect":  "music_notes",
                                  "particleColor":  "#FDA4AF",
                                  "floorColor":  "#381729",
                                  "accentColor":  "#F43F5E",
                                  "wallColor":  "#210E18",
                                  "props":  "pipe_organ_violins",
                                  "skyColor":  "#11070C"
                              },
               "cleanEn":  "Performing Arts",
               "cleanVi":  "Các loại hình nghệ thuật biểu diễn",
               "stt":  25,
               "tier":  1,
               "biome":  "grand_symphony",
               "topicName":  "Các loại hình nghệ thuật biểu diễn (Performing Arts)"
           },
    "18":  {
               "minions":  [
                               {
                                   "def":  35,
                                   "name":  "Khổng Lồ Các giai đoạn trong cuộc đời",
                                   "color":  "#38BDF8",
                                   "atk":  51,
                                   "type":  "minion_a",
                                   "hp":  194
                               },
                               {
                                   "def":  38,
                                   "name":  "Lính Gác Stages of Life",
                                   "color":  "#7DD3FC",
                                   "atk":  56,
                                   "type":  "minion_b",
                                   "hp":  223
                               },
                               {
                                   "def":  42,
                                   "name":  "Hộ Vệ Tinh Anh Các giai đoạn trong cuộc đời",
                                   "color":  "#FFFFFF",
                                   "atk":  64,
                                   "type":  "minion_c",
                                   "hp":  252
                               }
                           ],
               "tierName":  "Sơ Cấp (Apprentice)",
               "boss":  {
                            "def":  54,
                            "color":  "#38BDF8",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Stages of Life",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Các giai đoạn trong cuộc đời!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Stages of Life!"
                                      ],
                            "name":  "HOÀNG ĐẾ CÁC GIAI ĐOẠN TRONG CUỘC ĐỜI: STAGES OF LIFE TITAN",
                            "atk":  84,
                            "archetype":  "ancient_golem",
                            "baseHp":  1199,
                            "title":  "Bá Chủ Thống Trị Các giai đoạn trong cuộc đời"
                        },
               "background":  {
                                  "effect":  "ambient_sparks",
                                  "particleColor":  "#7DD3FC",
                                  "floorColor":  "#22273A",
                                  "accentColor":  "#38BDF8",
                                  "wallColor":  "#151824",
                                  "props":  "runes_columns",
                                  "skyColor":  "#0A0C14"
                              },
               "cleanEn":  "Stages of Life",
               "cleanVi":  "Các giai đoạn trong cuộc đời",
               "stt":  18,
               "tier":  1,
               "biome":  "ancient_ruins",
               "topicName":  "Các giai đoạn trong cuộc đời (Stages of Life)"
           },
    "42":  {
               "minions":  [
                               {
                                   "def":  70,
                                   "name":  "Khổng Lồ Buổi hòa nhạc và Sân khấu biểu diễn",
                                   "color":  "#F43F5E",
                                   "atk":  99,
                                   "type":  "minion_a",
                                   "hp":  376
                               },
                               {
                                   "def":  77,
                                   "name":  "Lính Gác Concerts \u0026 Stages",
                                   "color":  "#FDA4AF",
                                   "atk":  109,
                                   "type":  "minion_b",
                                   "hp":  432
                               },
                               {
                                   "def":  84,
                                   "name":  "Hộ Vệ Tinh Anh Buổi hòa nhạc và Sân khấu biểu diễn",
                                   "color":  "#FFFFFF",
                                   "atk":  124,
                                   "type":  "minion_c",
                                   "hp":  489
                               }
                           ],
               "tierName":  "Trung Cấp (Adept)",
               "boss":  {
                            "def":  95,
                            "color":  "#F43F5E",
                            "skillName":  "Tuyệt Kỹ Hắc Ám: Bão Cuồng Nộ Concerts \u0026 Stages",
                            "roars":  [
                                          "Hãy run sợ trước sức mạnh của Buổi hòa nhạc và Sân khấu biểu diễn!",
                                          "Kiến thức của ngươi chưa đủ để vượt qua Concerts \u0026 Stages!"
                                      ],
                            "name":  "CỰ QUÁI BUỔI HÒA NHẠC VÀ SÂN KHẤU BIỂU DIỄN: CONCERTS \u0026 STAGES TITAN",
                            "atk":  140,
                            "archetype":  "virtuoso_maestro",
                            "baseHp":  1975,
                            "title":  "Bá Chủ Thống Trị Buổi hòa nhạc và Sân khấu biểu diễn"
                        },
               "background":  {
                                  "effect":  "music_notes",
                                  "particleColor":  "#FDA4AF",
                                  "floorColor":  "#381729",
                                  "accentColor":  "#F43F5E",
                                  "wallColor":  "#210E18",
                                  "props":  "pipe_organ_violins",
                                  "skyColor":  "#11070C"
                              },
               "cleanEn":  "Concerts \u0026 Stages",
               "cleanVi":  "Buổi hòa nhạc và Sân khấu biểu diễn",
               "stt":  42,
               "tier":  2,
               "biome":  "grand_symphony",
               "topicName":  "Buổi hòa nhạc và Sân khấu biểu diễn (Concerts \u0026 Stages)"
           },
    "100":  {
                "minions":  [
                                {
                                    "def":  155,
                                    "name":  "Cơ Giới Logistics và Chuỗi cung ứng",
                                    "color":  "#F59E0B",
                                    "atk":  213,
                                    "type":  "minion_a",
                                    "hp":  815
                                },
                                {
                                    "def":  170,
                                    "name":  "Lính Gác Logistics \u0026 Supply Chain",
                                    "color":  "#FCD34D",
                                    "atk":  234,
                                    "type":  "minion_b",
                                    "hp":  937
                                },
                                {
                                    "def":  186,
                                    "name":  "Hộ Vệ Tinh Anh Logistics và Chuỗi cung ứng",
                                    "color":  "#FFFFFF",
                                    "atk":  266,
                                    "type":  "minion_c",
                                    "hp":  1060
                                }
                            ],
                "tierName":  "Thần Thoại (Mythic)",
                "boss":  {
                             "def":  195,
                             "color":  "#F59E0B",
                             "skillName":  "Cơn Bão Vận Chuyển Container Toàn Cầu",
                             "roars":  [
                                           "Chuỗi cung ứng 100 ải đã hoàn tất!",
                                           "Ngươi đã đánh bại toàn bộ các thần ma hầm ngục!"
                                       ],
                             "name":  "SIÊU THẦN CƠ GIỚI: OMNI-SUPPLY TITAN DRAGON",
                             "atk":  275,
                             "archetype":  "omni_carrier_titan",
                             "baseHp":  3850,
                             "title":  "Bá Chủ Tối Thượng Chuỗi Cung Ứng Toàn Cầu"
                         },
                "background":  {
                                   "effect":  "crane_lasers",
                                   "particleColor":  "#FCD34D",
                                   "floorColor":  "#1E232C",
                                   "accentColor":  "#F59E0B",
                                   "wallColor":  "#13161C",
                                   "props":  "cargo_containers_cranes",
                                   "skyColor":  "#0A0B0E"
                               },
                "cleanEn":  "Logistics \u0026 Supply Chain",
                "cleanVi":  "Logistics và Chuỗi cung ứng",
                "stt":  100,
                "tier":  4,
                "biome":  "global_freight_terminal",
                "topicName":  "Logistics và Chuỗi cung ứng (Logistics \u0026 Supply Chain)"
            }
};

/**
 * Lấy bối cảnh sân đấu (Background Palette & Props) theo STT chủ đề
 */
window.getDungeonThemeForTopic = function(stt) {
  const d = window.DUNGEON_DATA_100?.[stt];
  if (d && d.background) {
    return {
      stt: stt,
      topicName: d.cleanVi || d.topicName,
      biome: d.biome,
      ...d.background
    };
  }
  // Mặc định bối cảnh ngục đá
  return {
    stt: stt || 1,
    topicName: "Hầm Ngục Bí Hiểm",
    biome: "stone_dungeon",
    wallColor: "#0B0D17",
    floorColor: "#121422",
    accentColor: "#FFE787",
    skyColor: "#070913",
    particleColor: "#F59E0B",
    props: "stone_pillars_torches",
    effect: "torch_smoke"
  };
};

/**
 * Lấy danh sách quái vật hoặc Boss độc nhất theo STT chủ đề và Wave
 */
window.getDungeonMonstersForTopic = function(stt, waveNum, totalWaves) {
  const d = window.DUNGEON_DATA_100?.[stt];
  const bossTurns = Math.min(4, Math.max(3, Math.floor(totalWaves * 0.3)));
  const bossStartWave = Math.max(2, totalWaves - bossTurns + 1);
  const isBossPhase = (waveNum >= bossStartWave);

  if (isBossPhase) {
    if (d && d.boss) {
      return {
        isBoss: true,
        name: d.boss.name,
        title: d.boss.title,
        type: d.boss.archetype || "dragon",
        color: d.boss.color || "#EF4444",
        baseHp: d.boss.baseHp,
        atk: d.boss.atk,
        def: d.boss.def,
        skillName: d.boss.skillName,
        roars: d.boss.roars,
        tier: d.tier
      };
    }
    return {
      isBoss: true,
      name: "TRÙM CUỐI: HẮC LONG MA VƯƠNG",
      title: "Chúa Tể Ngục Tối",
      type: "dragon",
      color: "#EF4444",
      baseHp: 1200,
      atk: 60,
      def: 35,
      skillName: "Hơi Thở Hắc Long",
      roars: ["Grrrr! Ngươi không thể vượt qua ta!"],
      tier: 1
    };
  }

  // Quái thường theo chủ đề
  if (d && d.minions && d.minions.length > 0) {
    const mIdx = Math.min(d.minions.length - 1, Math.floor(((waveNum - 1) / Math.max(1, bossStartWave - 1)) * d.minions.length));
    const m = d.minions[mIdx];
    return {
      isBoss: false,
      name: m.name,
      type: m.type || "minion",
      color: m.color || d.background?.accentColor || "#10B981",
      baseHp: m.hp,
      atk: m.atk,
      def: m.def,
      tier: d.tier
    };
  }

  return {
    isBoss: false,
    name: "Quái Vật Hầm Ngục",
    type: "slime",
    color: "#22C55E",
    baseHp: 80,
    atk: 25,
    def: 12,
    tier: 1
  };
};

/**
 * Tính toán sát thương chiến đấu có xét đến chỉ số DEF của đối phương
 */
window.calculateCombatDamage = function(attackerAtk, defenderDef, isCrit, skillMultiplier = 1.0) {
  const rawDmg = (attackerAtk || 35) * (skillMultiplier || 1.0) + Math.floor(Math.random() * 12);
  const defMitigation = Math.floor((defenderDef || 10) / 3);
  let netDmg = Math.max(15, rawDmg - defMitigation);
  if (isCrit) {
    netDmg = Math.round(netDmg * 1.8);
  }
  return netDmg;
};
