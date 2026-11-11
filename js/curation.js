// ============================================================================
// MODULE: js/curation.js
// Chức năng: Quy trình Tạo Từ Vựng 2 Giai Đoạn Qua Chọn Lọc (Curation Wizard)
//            Giai đoạn 1: Sinh ~150 danh từ ứng viên kèm nghĩa tiếng Việt tóm tắt
//            Giai đoạn 2: Người dùng xem xét, thêm từ thủ công & chọn đúng 100 từ
//            Giai đoạn 3: Sinh trọn vẹn 9 cột Anki chi tiết cho 100 từ đã chọn
//            Phong cách Swiss Editorial: Tuyệt đối 0 Icon / Emoji, Chữ >= 12px.
// ============================================================================

let curationCurrentStt = null;
let curationCurrentTopicVi = '';
let curationCandidates = [];
let curationSelectedWords = new Set();
let curationFilterMode = 'all'; // 'all' | 'selected' | 'unselected'
let curationSearchQuery = '';

// Khởi tạo và gắn Modal Lọc Từ Vựng vào DOM
function ensureCurationModalMounted() {
  if (document.getElementById('curationModal')) return;

  const modalHtml = `
  <div id="curationModal" class="fixed inset-0 bg-black/75 hidden items-center justify-center z-50 p-2 sm:p-4">
    <div class="bg-[#F4F1EA] border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden">

      <!-- MODAL HEADER -->
      <div class="p-4 sm:p-5 border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-3 bg-[#EAE5DA]">
        <div>
          <div class="flex items-center gap-2">
            <span id="curationSttBadge" class="px-2.5 py-0.5 bg-[#111111] text-white text-xs font-mono-code font-bold">#...</span>
            <h3 id="curationTopicTitle" class="font-display font-extrabold text-base sm:text-lg text-[#111111] uppercase">LỌC CHỌN 100 TỪ TỐI ƯU TRONG 150 TỪ ỨNG VIÊN</h3>
          </div>
          <p class="text-xs font-mono-code text-zinc-600 mt-1 uppercase">
            GIAI ĐOẠN 1: DUYỆT & TÍCH CHỌN CHÍNH XÁC 100 DANH TỪ TRƯỚC KHI TẠO CHI TIẾT 9 CỘT ANKI
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="closeCurationModal()" class="neo-btn px-3 py-1.5 bg-white text-[#111111] text-xs font-mono-code uppercase">
            HỦY / ĐÓNG
          </button>
        </div>
      </div>

      <!-- STATUS BAR & KPI COUNTERS -->
      <div class="px-4 py-3 bg-white border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono-code font-bold text-zinc-600 uppercase">TIẾN ĐỘ CHỌN:</span>
            <span id="curationCountBadge" class="px-3 py-1 bg-[#111111] text-white font-mono-code font-extrabold text-xs">
              0 / 100 TỪ (0%)
            </span>
          </div>
          <span id="curationValidationTag" class="px-3 py-1 font-mono-code font-extrabold text-xs border border-[#111111] bg-[#EAE5DA] text-[#111111] uppercase">
            [CẦN CHỌN ĐỦ 100 TỪ]
          </span>
          <span id="curationDraftNotice" class="hidden text-xs font-mono-code font-bold text-[#0F766E] uppercase">
            [ĐÃ TỰ ĐỘNG LƯU BẢN NHÁP]
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="autoSelectRandom100()" class="neo-btn px-3 py-1.5 bg-[#EAE5DA] text-[#111111] text-xs font-mono-code font-bold uppercase" title="Tự động chọn ngẫu nhiên từ các từ chưa chọn cho đủ đúng 100 từ">
            TỰ CHỌN CHO ĐỦ 100 TỪ
          </button>
          <button type="button" onclick="clearAllCurationSelection()" class="neo-btn px-3 py-1.5 bg-white text-zinc-600 text-xs font-mono-code uppercase" title="Bỏ chọn toàn bộ">
            BỎ CHỌN HẾT
          </button>
          <button type="button" onclick="regenerate150CandidatesConfirm()" class="neo-btn px-3 py-1.5 bg-white text-[#BE123C] text-xs font-mono-code uppercase" title="Tạo lại 150 từ ứng viên mới từ AI">
            SINH LẠI 150 TỪ MỚI
          </button>
        </div>
      </div>

      <!-- CONTROLS & ADD CUSTOM WORD TOOLBAR -->
      <div class="px-4 py-3 bg-[#F4F1EA] border-b-2 border-[#111111] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Tìm kiếm & Bộ lọc xem -->
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <input id="curationSearchInput" type="text" oninput="onCurationSearchInput(this.value)" placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt trong 150 từ..." class="px-3 py-1.5 text-xs border-2 border-[#111111] bg-white w-full sm:w-72 focus:outline-none" />
          <div class="flex items-center gap-1">
            <button onclick="setCurationFilterMode('all')" id="cFilter-all" class="px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-[#111111] text-white border border-[#111111]">TẤT CẢ (<span id="cCountTotal">0</span>)</button>
            <button onclick="setCurationFilterMode('selected')" id="cFilter-selected" class="px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 border border-[#111111]">ĐÃ CHỌN (<span id="cCountSelected">0</span>)</button>
            <button onclick="setCurationFilterMode('unselected')" id="cFilter-unselected" class="px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 border border-[#111111]">CHƯA CHỌN (<span id="cCountUnselected">0</span>)</button>
          </div>
        </div>

        <!-- Khối tự thêm từ thủ công -->
        <div class="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-300">
          <span class="text-xs font-mono-code font-bold text-zinc-600 uppercase">TỰ THÊM TỪ:</span>
          <input id="curationCustomWord" type="text" placeholder="Từ tiếng Anh (VD: dumbbell)..." class="px-2.5 py-1.5 text-xs border-2 border-[#111111] bg-white font-mono-code w-40 focus:outline-none" />
          <input id="curationCustomMeaning" type="text" placeholder="Nghĩa tiếng Việt..." class="px-2.5 py-1.5 text-xs border-2 border-[#111111] bg-white w-40 focus:outline-none" onkeydown="if(event.key==='Enter') addCustomWordToCuration()" />
          <button type="button" onclick="addCustomWordToCuration()" class="neo-btn px-3 py-1.5 bg-[#0F766E] text-white text-xs uppercase">
            THÊM & CHỌN
          </button>
        </div>
      </div>

      <!-- WORD GRID CONTAINER -->
      <div id="curationWordsContainer" class="flex-1 overflow-y-auto p-4 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-h-[380px]">
        <div class="col-span-full p-12 text-center font-mono-code text-xs text-zinc-500 uppercase">
          ĐANG TẢI DỮ LIỆU DANH TỪ ỨNG VIÊN...
        </div>
      </div>

      <!-- MODAL FOOTER & ACTION TRIGGER -->
      <div class="p-4 bg-[#EAE5DA] border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-3">
        <div class="text-xs font-mono-code text-zinc-600 font-medium">
          LƯU Ý: NÚT "TẠO CHI TIẾT 9 CỘT" CHỈ SÁNG LÊN KHI BẠN ĐÃ TÍCH CHỌN CHÍNH XÁC ĐỦ 100/100 TỪ.
        </div>

        <div class="flex items-center gap-3">
          <button onclick="closeCurationModal()" class="neo-btn px-4 py-2 bg-white text-[#111111] text-xs font-mono-code uppercase">
            HỦY BỎ
          </button>
          <button id="btnProceedToGenerate100" onclick="proceedToGenerate100Details()" disabled class="neo-btn px-5 py-2.5 bg-zinc-300 text-zinc-500 border-2 border-zinc-400 font-display font-extrabold text-xs uppercase cursor-not-allowed transition">
            BẮT ĐẦU TẠO CHI TIẾT 9 CỘT (0 / 100 TỪ)
          </button>
        </div>
      </div>

    </div>
  </div>`;

  const mount = document.getElementById('sharedModalsMount') || document.body;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  mount.appendChild(tempDiv.firstElementChild);
}

// Bắt đầu quy trình chọn lọc cho chủ đề chưa làm kế tiếp
function startCurationWorkflowForNextPending() {
  const pending = allTopics.find(t => t.status !== 'completed');
  if (!pending) {
    alert('Tất cả 1.000 chủ đề đã được hoàn thành!');
    return;
  }
  openCurationModal(pending.stt, pending.topic);
}

// Mở Modal Lọc Từ Vựng cho một chủ đề cụ thể
async function openCurationModal(stt, topicVi) {
  ensureCurationModalMounted();
  curationCurrentStt = Number(stt);
  curationCurrentTopicVi = topicVi || (allTopics.find(t => t.stt === curationCurrentStt)?.topic || '');
  curationSearchQuery = '';
  curationFilterMode = 'all';

  const modal = document.getElementById('curationModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Gán thông tin Header
  const sttBadge = document.getElementById('curationSttBadge');
  if (sttBadge) sttBadge.innerText = `#${curationCurrentStt}`;
  const titleEl = document.getElementById('curationTopicTitle');
  if (titleEl) titleEl.innerText = `LỌC CHỌN 100 TỪ: #${curationCurrentStt} ${curationCurrentTopicVi.toUpperCase()}`;

  // Kiểm tra Gemini API Key
  let geminiKey = localStorage.getItem('gemini_api_key');
  if (!geminiKey) {
    const inputKey = prompt('Vui lòng dán Gemini API Key của bạn để hệ thống sinh 150 danh từ ứng viên:');
    if (inputKey && inputKey.trim()) {
      geminiKey = inputKey.trim();
      localStorage.setItem('gemini_api_key', geminiKey);
    } else {
      closeCurationModal();
      if (typeof openSettings === 'function') openSettings();
      return;
    }
  }

  // Kiểm tra xem có bản nháp đang chọn dở trong localStorage không
  const draftKey = `curation_draft_${curationCurrentStt}`;
  const rawDraft = localStorage.getItem(draftKey);
  if (rawDraft) {
    try {
      const draft = JSON.parse(rawDraft);
      if (Array.isArray(draft.candidates) && draft.candidates.length > 0) {
        curationCandidates = draft.candidates;
        curationSelectedWords = new Set(Array.isArray(draft.selectedWords) ? draft.selectedWords : []);
        const noticeEl = document.getElementById('curationDraftNotice');
        if (noticeEl) {
          noticeEl.innerText = `[ĐÃ KHÔI PHỤC BẢN NHÁP: ${curationSelectedWords.size}/100 TỪ]`;
          noticeEl.classList.remove('hidden');
        }
        renderCurationWordsUI();
        return;
      }
    } catch (e) {
      console.warn('Lỗi đọc bản nháp curation:', e);
    }
  }

  // Nếu không có bản nháp, tiến hành gọi AI sinh mới 150 từ
  await fetch150CandidatesFromAI(curationCurrentStt, curationCurrentTopicVi);
}

// Gọi Gemini AI sinh 150 danh từ ứng viên
async function fetch150CandidatesFromAI(stt, topicVi) {
  const container = document.getElementById('curationWordsContainer');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full p-16 text-center space-y-3">
        <div class="font-display font-extrabold text-lg text-[#111111] uppercase tracking-wide">
          ĐANG GỌI GEMINI AI SINH 150 DANH TỪ ỨNG VIÊN...
        </div>
        <p class="text-xs font-mono-code text-zinc-600 max-w-lg mx-auto">
          Mô hình đang tổng hợp các danh từ tiêu biểu, khái niệm cốt lõi và thuật ngữ chuyên ngành kèm nghĩa tiếng Việt tóm tắt cho chủ đề #${stt}: ${topicVi}.
        </p>
      </div>`;
  }

  const geminiKey = localStorage.getItem('gemini_api_key');
  const prompt = `
Bạn là chuyên gia ngôn ngữ học & biên dịch từ điển Anki chuyên nghiệp.
Chủ đề: "${topicVi}" (STT: #${stt}).
Nhiệm vụ: Hãy tạo ra danh sách gồm đúng 150 danh từ tiếng Anh (nouns hoặc compound nouns) chất lượng cao, tiêu biểu và độc nhất thuộc chủ đề này.

Yêu cầu bắt buộc:
1. 100% các từ phải là danh từ hoặc cụm danh từ tiếng Anh (nouns / noun phrases). Tuyệt đối không dùng động từ hay tính từ đơn lẻ.
2. Không trùng lặp từ.
3. Mỗi từ phải kèm theo nghĩa tiếng Việt tóm tắt (3 đến 6 từ) chính xác, súc tích và dễ hiểu.
4. Bao phủ phong phú từ các vật thể, dụng cụ, khái niệm thông dụng đến các thuật ngữ chuyên sâu của chủ đề.
5. Số lượng: Cung cấp đủ khoảng 140 - 150 từ vựng.
6. Trả về đúng định dạng JSON Array of Objects:
[
  { "word": "từ tiếng anh", "meaning_vi": "nghĩa tiếng việt tóm tắt" }
]
`;

  try {
    let list = await callGeminiApiWithFallback(prompt, geminiKey, 0.65);
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('Gemini không trả về danh sách từ hợp lệ');
    }

    // Lọc trùng và chuẩn hóa
    const seen = new Set();
    const cleanList = [];
    for (const item of list) {
      const w = String(item.word || '').trim().toLowerCase();
      const vi = String(item.meaning_vi || '').trim();
      if (!w || seen.has(w) || w.length < 2) continue;
      seen.add(w);
      cleanList.push({ id: cleanList.length + 1, word: w, meaning_vi: vi, isCustom: false });
    }

    // Nếu còn thiếu (< 130 từ), gọi bổ sung thêm 35 từ nữa
    if (cleanList.length < 130) {
      try {
        const topupPrompt = `
Chủ đề: "${topicVi}".
Hãy cung cấp thêm 35 danh từ tiếng Anh chuyên sâu khác thuộc chủ đề này, KHÔNG được trùng với các từ sau: ${cleanList.slice(0, 50).map(x => x.word).join(', ')}.
Trả về JSON Array: [ { "word": "từ tiếng anh", "meaning_vi": "nghĩa tiếng việt tóm tắt" } ]`;
        const topupList = await callGeminiApiWithFallback(topupPrompt, geminiKey, 0.7);
        if (Array.isArray(topupList)) {
          for (const item of topupList) {
            const w = String(item.word || '').trim().toLowerCase();
            const vi = String(item.meaning_vi || '').trim();
            if (!w || seen.has(w) || w.length < 2) continue;
            seen.add(w);
            cleanList.push({ id: cleanList.length + 1, word: w, meaning_vi: vi, isCustom: false });
          }
        }
      } catch (e) {
        console.warn('Lỗi bổ sung từ curation:', e);
      }
    }

    curationCandidates = cleanList;
    curationSelectedWords.clear();
    saveCurationDraft();
    renderCurationWordsUI();
  } catch (err) {
    if (container) {
      container.innerHTML = `
        <div class="col-span-full p-12 text-center space-y-3">
          <div class="text-xs font-mono-code font-extrabold text-[#BE123C] uppercase">
            [LỖI] KHÔNG THỂ TẢO DANH SÁCH 150 TỪ TỪ GEMINI AI: ${err.message}
          </div>
          <button onclick="fetch150CandidatesFromAI(curationCurrentStt, curationCurrentTopicVi)" class="neo-btn px-4 py-2 bg-[#111111] text-white text-xs uppercase">
            THỬ LẠI
          </button>
        </div>`;
    }
  }
}

// Render giao diện danh sách thẻ từ
function renderCurationWordsUI() {
  const container = document.getElementById('curationWordsContainer');
  if (!container) return;

  const total = curationCandidates.length;
  const selectedCount = curationSelectedWords.size;
  const unselectedCount = Math.max(0, total - selectedCount);

  // Cập nhật số liệu đếm
  const countTotalEl = document.getElementById('cCountTotal');
  if (countTotalEl) countTotalEl.innerText = total;
  const countSelEl = document.getElementById('cCountSelected');
  if (countSelEl) countSelEl.innerText = selectedCount;
  const countUnselEl = document.getElementById('cCountUnselected');
  if (countUnselEl) countUnselEl.innerText = unselectedCount;

  // Cập nhật Badge chính
  const pct = Math.round((selectedCount / 100) * 100);
  const badgeEl = document.getElementById('curationCountBadge');
  if (badgeEl) {
    badgeEl.innerText = `${selectedCount} / 100 TỪ (${pct}%)`;
    if (selectedCount === 100) {
      badgeEl.className = 'px-3 py-1 bg-[#0F766E] text-white font-mono-code font-extrabold text-xs shadow-[2px_2px_0px_#111]';
    } else if (selectedCount > 100) {
      badgeEl.className = 'px-3 py-1 bg-[#BE123C] text-white font-mono-code font-extrabold text-xs shadow-[2px_2px_0px_#111]';
    } else {
      badgeEl.className = 'px-3 py-1 bg-[#111111] text-white font-mono-code font-extrabold text-xs';
    }
  }

  // Cập nhật Tag Trạng Thái & Nút Bắt Đầu Tạo
  const valTag = document.getElementById('curationValidationTag');
  const btnProceed = document.getElementById('btnProceedToGenerate100');

  if (selectedCount === 100) {
    if (valTag) {
      valTag.innerText = '[ĐÃ ĐỦ CHUẨN 100 TỪ - HỢP LỆ ĐỂ TẠO 9 CỘT]';
      valTag.className = 'px-3 py-1 font-mono-code font-extrabold text-xs border-2 border-[#111111] bg-[#0F766E] text-white uppercase';
    }
    if (btnProceed) {
      btnProceed.disabled = false;
      btnProceed.className = 'neo-btn px-5 py-2.5 bg-[#0F766E] text-white border-2 border-[#111111] font-display font-extrabold text-xs uppercase cursor-pointer hover:bg-[#0D655E] shadow-[3px_3px_0px_#111111] transition';
      btnProceed.innerText = 'BẮT ĐẦU TẠO CHI TIẾT 9 CỘT CHO 100 TỪ ĐÃ CHỌN';
    }
  } else if (selectedCount > 100) {
    const extra = selectedCount - 100;
    if (valTag) {
      valTag.innerText = `[VƯỢT QUÁ: ĐÃ CHỌN ${selectedCount} TỪ (CẦN BỎ BỚT ${extra} TỪ)]`;
      valTag.className = 'px-3 py-1 font-mono-code font-extrabold text-xs border-2 border-[#111111] bg-[#BE123C] text-white uppercase';
    }
    if (btnProceed) {
      btnProceed.disabled = true;
      btnProceed.className = 'neo-btn px-5 py-2.5 bg-zinc-200 text-zinc-400 border-2 border-zinc-400 font-display font-extrabold text-xs uppercase cursor-not-allowed transition';
      btnProceed.innerText = `BỎ BỚT ${extra} TỪ ĐỂ ĐẠT ĐÚNG 100 TỪ`;
    }
  } else {
    const needed = 100 - selectedCount;
    if (valTag) {
      valTag.innerText = `[CẦN CHỌN THÊM ${needed} TỪ NỮA]`;
      valTag.className = 'px-3 py-1 font-mono-code font-extrabold text-xs border-2 border-[#111111] bg-[#EAE5DA] text-[#111111] uppercase';
    }
    if (btnProceed) {
      btnProceed.disabled = true;
      btnProceed.className = 'neo-btn px-5 py-2.5 bg-zinc-200 text-zinc-400 border-2 border-zinc-400 font-display font-extrabold text-xs uppercase cursor-not-allowed transition';
      btnProceed.innerText = `CẦN CHỌN ĐỦ 100 TỪ (HIỆN CÓ: ${selectedCount}/100)`;
    }
  }

  // Lọc theo tìm kiếm và chế độ lọc
  const q = curationSearchQuery.toLowerCase().trim();
  const visibleItems = curationCandidates.filter(item => {
    const isSelected = curationSelectedWords.has(item.word);
    if (curationFilterMode === 'selected' && !isSelected) return false;
    if (curationFilterMode === 'unselected' && isSelected) return false;
    if (q) {
      const matchW = item.word.toLowerCase().includes(q);
      const matchVi = (item.meaning_vi || '').toLowerCase().includes(q);
      if (!matchW && !matchVi) return false;
    }
    return true;
  });

  if (!visibleItems.length) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center font-mono-code text-xs text-zinc-500 uppercase">
        Không có từ nào khớp với bộ lọc hoặc tìm kiếm hiện tại.
      </div>`;
    return;
  }

  container.innerHTML = visibleItems.map((item, idx) => {
    const isSelected = curationSelectedWords.has(item.word);
    const safeWord = item.word.replace(/'/g, "\\'");
    const bgClass = isSelected
      ? 'bg-[#EAE5DA] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
      : 'bg-white border-2 border-zinc-300 hover:border-[#111111]';

    return `
      <div onclick="toggleCurationWord('${safeWord}')" class="p-3 cursor-pointer transition flex items-start gap-2.5 ${bgClass} select-none">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleCurationWord('${safeWord}')" class="mt-0.5 border-2 border-[#111111] accent-[#111111] w-4 h-4 cursor-pointer" />
        <div class="flex-1 overflow-hidden">
          <div class="flex items-baseline justify-between gap-2">
            <span class="font-mono-code font-extrabold text-sm text-[#111111] truncate">${item.word}</span>
            <span class="text-xs font-mono-code text-zinc-500 font-bold shrink-0">#${item.id}</span>
          </div>
          <div class="text-xs text-zinc-700 font-medium mt-0.5 truncate" title="${item.meaning_vi || ''}">
            ${item.meaning_vi || 'Nghĩa tiếng Việt'}
          </div>
          ${item.isCustom ? `<span class="inline-block mt-1 px-1.5 py-0.2 text-xs font-mono-code font-bold bg-[#111111] text-white">TỰ THÊM</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

// Bật/tắt chọn 1 từ
function toggleCurationWord(word) {
  const cleanWord = String(word || '').trim().toLowerCase();
  if (!cleanWord) return;

  if (curationSelectedWords.has(cleanWord)) {
    curationSelectedWords.delete(cleanWord);
  } else {
    curationSelectedWords.add(cleanWord);
  }

  saveCurationDraft();
  renderCurationWordsUI();
}

// Tự động chọn ngẫu nhiên các từ chưa chọn cho đủ đúng 100 từ
function autoSelectRandom100() {
  if (curationSelectedWords.size === 100) {
    alert('Bạn đã chọn chính xác đủ 100 từ!');
    return;
  }

  // Nếu đang lớn hơn 100 từ, cắt bớt ngẫu nhiên về đúng 100
  if (curationSelectedWords.size > 100) {
    const arr = Array.from(curationSelectedWords);
    curationSelectedWords = new Set(arr.slice(0, 100));
    saveCurationDraft();
    renderCurationWordsUI();
    return;
  }

  // Nếu đang ít hơn 100 từ, chọn ngẫu nhiên từ danh sách chưa chọn
  const unselected = curationCandidates.filter(item => !curationSelectedWords.has(item.word));
  if (!unselected.length) {
    alert('Không còn từ nào chưa chọn trong danh sách!');
    return;
  }

  // Xáo trộn mảng ngẫu nhiên (Fisher-Yates)
  const shuffled = [...unselected];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const needed = 100 - curationSelectedWords.size;
  const toAdd = shuffled.slice(0, needed);
  toAdd.forEach(item => curationSelectedWords.add(item.word));

  saveCurationDraft();
  renderCurationWordsUI();
}

// Bỏ chọn toàn bộ
function clearAllCurationSelection() {
  curationSelectedWords.clear();
  saveCurationDraft();
  renderCurationWordsUI();
}

// Tự thêm từ của bạn vào danh sách
function addCustomWordToCuration() {
  const wordInput = document.getElementById('curationCustomWord');
  const meaningInput = document.getElementById('curationCustomMeaning');
  if (!wordInput || !meaningInput) return;

  const w = wordInput.value.trim().toLowerCase();
  const vi = meaningInput.value.trim();

  if (!w) {
    alert('Vui lòng nhập từ tiếng Anh cần thêm!');
    wordInput.focus();
    return;
  }

  // Kiểm tra trùng lặp
  const exists = curationCandidates.some(item => item.word.toLowerCase() === w);
  if (exists) {
    // Nếu từ đã có sẵn trong danh sách, tự động chọn từ đó
    curationSelectedWords.add(w);
    wordInput.value = '';
    meaningInput.value = '';
    saveCurationDraft();
    renderCurationWordsUI();
    return;
  }

  const newEntry = {
    id: curationCandidates.length + 1,
    word: w,
    meaning_vi: vi || 'Nghĩa tự thêm',
    isCustom: true
  };

  curationCandidates.unshift(newEntry); // Đưa lên đầu danh sách
  curationSelectedWords.add(w); // Tự động chọn luôn từ mới thêm

  wordInput.value = '';
  meaningInput.value = '';
  saveCurationDraft();
  renderCurationWordsUI();
}

// Tìm kiếm lọc
function onCurationSearchInput(val) {
  curationSearchQuery = val || '';
  renderCurationWordsUI();
}

// Thay đổi chế độ lọc: tất cả, đã chọn, chưa chọn
function setCurationFilterMode(mode) {
  curationFilterMode = mode;
  ['all', 'selected', 'unselected'].forEach(m => {
    const btn = document.getElementById(`cFilter-${m}`);
    if (!btn) return;
    if (m === mode) {
      btn.className = 'px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-[#111111] text-white border border-[#111111]';
    } else {
      btn.className = 'px-2.5 py-1 text-xs font-mono-code font-bold uppercase bg-white text-zinc-700 border border-[#111111]';
    }
  });
  renderCurationWordsUI();
}

// Xác nhận sinh lại 150 từ mới từ AI
async function regenerate150CandidatesConfirm() {
  if (confirm(`Bạn có chắc muốn xóa bản chọn hiện tại và để AI tạo lại 150 từ ứng viên mới cho chủ đề #${curationCurrentStt}?`)) {
    curationSelectedWords.clear();
    clearCurationDraft(curationCurrentStt);
    await fetch150CandidatesFromAI(curationCurrentStt, curationCurrentTopicVi);
  }
}

// Lưu bản nháp vào localStorage
function saveCurationDraft() {
  if (!curationCurrentStt) return;
  const draftKey = `curation_draft_${curationCurrentStt}`;
  try {
    const payload = {
      stt: curationCurrentStt,
      topicVi: curationCurrentTopicVi,
      candidates: curationCandidates,
      selectedWords: Array.from(curationSelectedWords),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(draftKey, JSON.stringify(payload));
  } catch (e) {
    console.warn('Không thể lưu bản nháp vào localStorage:', e);
  }
}

// Xóa bản nháp sau khi đã xuất file thành công
function clearCurationDraft(stt) {
  try {
    localStorage.removeItem(`curation_draft_${stt}`);
  } catch (e) {}
}

// Đóng Modal Lọc Từ Vựng
function closeCurationModal() {
  const modal = document.getElementById('curationModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ============================================================================
// GIAI ĐOẠN 3: SINH TRỌN VẸN 9 CỘT CHO 100 TỪ ĐÃ CHỌN LỌC
// ============================================================================
async function proceedToGenerate100Details() {
  if (curationSelectedWords.size !== 100) {
    alert(`Yêu cầu bắt buộc: Bạn phải tích chọn chính xác đúng 100 từ! Hiện tại bạn đang chọn ${curationSelectedWords.size}/100 từ.`);
    return;
  }

  const stt = curationCurrentStt;
  const topicVi = curationCurrentTopicVi;
  const chosenWords = Array.from(curationSelectedWords);

  closeCurationModal();

  // Khởi tạo Live Runner
  if (typeof showLiveRunner === 'function') {
    showLiveRunner(`[CHỌN LỌC] ĐANG TẠO CHI TIẾT 9 CỘT CHO 100 TỪ ĐÃ CHỌN (CHỦ ĐỀ #${stt}: ${topicVi.toUpperCase()})...`, 10, 2);
  }
  if (typeof resetLiveWordTracker === 'function') {
    resetLiveWordTracker(stt, topicVi);
  }
  if (typeof logToConsole === 'function') {
    logToConsole('INFO', 'CURATION_ENRICH', `Bắt đầu sinh 9 cột Anki chi tiết cho 100 từ đã chọn lọc của chủ đề #${stt}...`);
  }

  const geminiKey = localStorage.getItem('gemini_api_key');
  const owner = localStorage.getItem('gh_owner');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';
  const ghToken = localStorage.getItem('gh_token');

  try {
    const fullItems = [];

    // Chia 100 từ thành 2 đợt (mỗi đợt 50 từ) để AI xử lý sâu, chuẩn xác từng câu ví dụ
    const batchSize = 50;
    for (let b = 0; b < chosenWords.length; b += batchSize) {
      const sliceWords = chosenWords.slice(b, b + batchSize);
      const batchNum = Math.floor(b / batchSize) + 1;
      const progressPct = Math.round(15 + (b / chosenWords.length) * 70);

      if (typeof showLiveRunner === 'function') {
        showLiveRunner(`[CHỌN LỌC] ĐANG SINH CHI TIẾT ĐỢT ${batchNum}/2 (${b + 1} - ${b + sliceWords.length} / 100 TỪ)...`, progressPct, 3);
      }

      // Chuẩn bị thông tin gợi ý nghĩa tiếng Việt từ ứng viên đã chọn
      const candidateHints = sliceWords.map(w => {
        const found = curationCandidates.find(c => c.word === w);
        return { word: w, hint_vi: found ? found.meaning_vi : '' };
      });

      const enrichPrompt = `
Bạn là chuyên gia biên soạn thẻ Anki tiếng Anh chất lượng cao hàng đầu thế giới.
Chủ đề: "${topicVi}" (STT: #${stt}).
Dưới đây là danh sách đúng ${sliceWords.length} danh từ tiếng Anh đã được người học tuyển chọn:
${JSON.stringify(candidateHints, null, 2)}

Nhiệm vụ: Với MỖI từ trong danh sách trên, hãy tạo đầy đủ dữ liệu từ điển Anki 9 cột:
1. word: giữ nguyên từ vựng tiếng Anh
2. ipa: phiên âm chuẩn Mỹ (US IPA), bắt đầu và kết thúc bằng dấu gạch chéo '/', ví dụ: /wɜːrd/
3. definition: định nghĩa tiếng Anh ngắn gọn, súc tích (1 câu rõ nghĩa)
4. meaning_vi: nghĩa tiếng Việt chuẩn xác, súc tích
5. plural: dạng số nhiều của danh từ (ví dụ 'plates', 'boxes', 'criteria', hoặc 'uncountable' nếu là danh từ không đếm được)
6. example_1: 1 câu ví dụ tiếng Anh tự nhiên, thực tế chứa từ đó (không ghi số thứ tự ở đầu)
7. example_2: 1 câu ví dụ tiếng Anh đời sống khác chứa từ đó (không ghi số thứ tự ở đầu)

Yêu cầu định dạng:
Trả về đúng JSON Array gồm đúng ${sliceWords.length} objects theo đúng thứ tự các từ đã cung cấp:
[
  {
    "word": "từ tiếng anh",
    "ipa": "/.../",
    "definition": "english definition",
    "meaning_vi": "nghĩa tiếng việt",
    "plural": "số nhiều",
    "example_1": "câu ví dụ 1",
    "example_2": "câu ví dụ 2"
  }
]
`;

      const enrichedBatch = await callGeminiApiWithFallback(enrichPrompt, geminiKey, 0.4);
      if (!Array.isArray(enrichedBatch)) {
        throw new Error(`Đợt ${batchNum} không nhận được mảng JSON hợp lệ từ Gemini`);
      }

      for (const item of enrichedBatch) {
        fullItems.push(item);
        if (typeof updateLiveWordProgress === 'function') {
          updateLiveWordProgress(item, fullItems.length, 100, fullItems.length > 50 ? 'advanced' : 'conversational', topicVi);
        }
      }
    }

    if (fullItems.length < 100) {
      throw new Error(`Chỉ nhận được ${fullItems.length}/100 từ chi tiết. Vui lòng thử lại!`);
    }

    // Đóng gói định dạng chuẩn Anki 9 cột
    if (typeof showLiveRunner === 'function') {
      showLiveRunner(`[CHỌN LỌC] ĐANG ĐÓNG GÓI 9 CỘT TSV CHO 100 TỪ...`, 90, 4);
    }

    const lines = fullItems.slice(0, 100).map(item => {
      const w = String(item.word || '').trim().toLowerCase();
      const cloze = typeof makeClozeJS === 'function' ? makeClozeJS(w) : w;
      let ipa = String(item.ipa || '').trim();
      if (!ipa.startsWith('/')) ipa = '/' + ipa.replace(/\//g, '') + '/';
      const sound = typeof makeSoundJS === 'function' ? makeSoundJS(w) : `[sound:${w}.mp3]`;
      const def = String(item.definition || '').replace(/\t|\n/g, ' ').trim();
      const vi = String(item.meaning_vi || '').replace(/\t|\n/g, ' ').trim();
      const plural = String(item.plural || '').trim().toLowerCase();
      const ex1 = String(item.example_1 || '').replace(/^[12]\.\s*/, '').trim();
      const ex2 = String(item.example_2 || '').replace(/^[12]\.\s*/, '').trim();
      return [w, cloze, ipa, sound, def, vi, vi, plural, '1. ' + ex1 + ' <br>2. ' + ex2].join('\t');
    });

    const tsvContent = lines.join('\n') + '\n';

    // Lưu file lên GitHub (nếu có cấu hình) hoặc Tải file về máy
    if (owner && repo && ghToken && typeof pushFileToGitHub === 'function') {
      if (typeof showLiveRunner === 'function') {
        showLiveRunner(`[CHỌN LỌC] ĐANG LƯU FILE output/${stt}.txt LÊN GITHUB...`, 95, 5);
      }
      await pushFileToGitHub(`output/${stt}.txt`, tsvContent, `Generate topic #${stt} (${topicVi}) via 2-Stage Curation`);
      if (typeof logToConsole === 'function') {
        logToConsole('SUCCESS', 'GITHUB_COMMIT', `Đã lưu output/${stt}.txt (100 từ chọn lọc) lên GitHub!`);
      }

      // Cập nhật status.json trên GitHub
      try {
        const statusRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/status.json?ref=${branch}`, {
          headers: { 'Authorization': `Bearer ${ghToken}` }
        });
        if (statusRes.ok) {
          const statusFileObj = await statusRes.json();
          const currentStatusData = JSON.parse(decodeURIComponent(escape(atob(statusFileObj.content))));
          const topItem = currentStatusData.topics?.find(t => t.stt === Number(stt));
          if (topItem) {
            topItem.status = 'completed';
            topItem.word_count = lines.length;
            topItem.file_path = `output/${stt}.txt`;
            topItem.generated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
            topItem.last_error = null;
          }
          currentStatusData.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
          await pushFileToGitHub('status.json', JSON.stringify(currentStatusData, null, 2), `Update status.json for topic #${stt} via Curation`);
        }
      } catch (stErr) {
        console.warn('Lỗi đồng bộ status.json:', stErr);
      }
    } else {
      // Tải file .txt về máy
      const blob = new Blob([tsvContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${stt}.txt`;
      a.click();
      if (typeof logToConsole === 'function') {
        logToConsole('SUCCESS', 'EXPORT', `Đã tải về máy file output/${stt}.txt (100 từ tuyển chọn).`);
      }
    }

    // Xóa bản nháp trong localStorage sau khi xuất thành công
    clearCurationDraft(stt);

    // Cập nhật trạng thái bộ nhớ đệm UI
    const targetObj = allTopics.find(t => t.stt === Number(stt));
    if (targetObj) {
      targetObj.status = 'completed';
      targetObj.word_count = lines.length;
      targetObj.generated_at = new Date().toLocaleString('vi-VN');
      targetObj.last_error = null;
    }
    if (typeof updateDashboardUI === 'function') updateDashboardUI();
    if (typeof renderGridMap === 'function') renderGridMap();
    if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();

    if (typeof showLiveRunner === 'function') {
      showLiveRunner(`[HOÀN TẤT] ĐÃ TẠO XONG 100 TỪ QUA CHỌN LỌC CHO CHỦ ĐỀ #${stt}: ${topicVi.toUpperCase()}!`, 100, 5, false);
    }
  } catch (err) {
    if (typeof showLiveRunner === 'function') {
      showLiveRunner(`[LỖI] KHI TẠO CHI TIẾT CHO CHỦ ĐỀ #${stt}: ${err.message}`, 100, 3, true);
    }
    if (typeof logToConsole === 'function') {
      logToConsole('ERROR', 'CURATION_FAIL', `Chủ đề #${stt} (${topicVi}) thất bại: ${err.message}`);
    }
    if (typeof toggleConsoleDrawer === 'function') {
      toggleConsoleDrawer(true);
    }
  }
}
