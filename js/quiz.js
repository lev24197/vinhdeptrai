// ==================== ĐẤU TRƯỜNG TRẮC NGHIỆM ANKI (QUIZ ARENA) ====================
let quizSelectedStts = new Set();
let quizWordsCache = {}; // stt -> array of words
let quizQuestions = [];
let quizCurrentIdx = 0;
let quizScore = 0;
let quizStreak = 0;
let quizMaxStreak = 0;
let quizMistakes = [];
let quizTargetQuestionCount = 10;
let quizIsAnswered = false;
let currentQuizWord = null;

// Web Audio Synthesizer (Chạy mượt tức thì không cần nạp file MP3 ngoài)
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playQuizSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const t = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    }
  } catch (e) {}
}

function speakWordTTS(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
}

function setQuizQuestionCount(count) {
  quizTargetQuestionCount = count;
  document.querySelectorAll('.quiz-qcount-btn').forEach(btn => {
    btn.className = 'quiz-qcount-btn py-2 text-xs font-mono-code font-extrabold border-2 border-[#111] bg-white text-[#111]';
  });
  const targetBtn = document.getElementById('qCountBtn-' + count);
  if (targetBtn) targetBtn.className = 'quiz-qcount-btn py-2 text-xs font-mono-code font-extrabold border-2 border-[#111] bg-[#111] text-white';
}

function renderQuizTopicSelection() {
  const container = document.getElementById('quizTopicCheckboxGrid');
  if (!container) return;
  const completed = allTopics.filter(t => t.status === 'completed');
  const notice = document.getElementById('quizCompletedTopicsNotice');
  if (notice) notice.innerText = `${completed.length} chủ đề đã hoàn thành`;

  if (!completed.length) {
    container.innerHTML = `<div class="p-4 text-xs font-bold text-slate-500 col-span-full text-center">Chưa có chủ đề nào hoàn thành. Vui lòng bấm tạo ít nhất 1 chủ đề trước!</div>`;
    return;
  }

  // Mặc định chọn 5 chủ đề đầu nếu chưa chọn gì
  if (quizSelectedStts.size === 0) {
    completed.slice(0, 5).forEach(t => quizSelectedStts.add(t.stt));
  }

  const q = (document.getElementById('quizTopicSearch')?.value || '').toLowerCase().trim();
  container.innerHTML = completed.map(t => {
    const isMatched = !q || t.topic.toLowerCase().includes(q) || String(t.stt).includes(q);
    const isChecked = quizSelectedStts.has(t.stt);
    const hideClass = isMatched ? '' : 'hidden';
    return `
      <label class="${hideClass} cursor-pointer neo-box-sm p-2.5 transition flex items-center justify-between gap-2 ${isChecked ? 'bg-[#FFE787] border-[#111]' : 'bg-white'}" id="quizLabel-${t.stt}">
        <div class="flex items-center gap-2 overflow-hidden">
          <input type="checkbox" onchange="toggleQuizTopicCheckbox(${t.stt}, this.checked)" ${isChecked ? 'checked' : ''} class="w-4 h-4 accent-[#141414] rounded cursor-pointer" />
          <div class="truncate">
            <span class="font-mono-code text-[11px] font-extrabold bg-[#141414] text-white px-1 py-0.2 rounded">#${t.stt}</span>
            <span class="text-xs font-bold text-[#141414] ml-1">${t.topic}</span>
          </div>
        </div>
        <span class="text-[10px] font-mono-code font-bold text-slate-500 shrink-0">${t.word_count || 100}t</span>
      </label>
    `;
  }).join('');

  updateQuizWordsCountBadge();
}

function toggleQuizTopicCheckbox(stt, isChecked) {
  if (isChecked) quizSelectedStts.add(stt);
  else quizSelectedStts.delete(stt);
  const label = document.getElementById('quizLabel-' + stt);
  if (label) {
    label.className = `cursor-pointer neo-box-sm p-2.5 transition flex items-center justify-between gap-2 ${isChecked ? 'bg-[#FFE787] border-[#111]' : 'bg-white'}`;
  }
  updateQuizWordsCountBadge();
}

function selectAllQuizTopics(selectAll) {
  const completed = allTopics.filter(t => t.status === 'completed');
  if (selectAll) completed.forEach(t => quizSelectedStts.add(t.stt));
  else quizSelectedStts.clear();
  renderQuizTopicSelection();
}

function selectRecentQuizTopics(num) {
  quizSelectedStts.clear();
  const completed = allTopics.filter(t => t.status === 'completed');
  completed.slice(0, num).forEach(t => quizSelectedStts.add(t.stt));
  renderQuizTopicSelection();
}

function filterQuizTopicsUI() {
  const q = (document.getElementById('quizTopicSearch')?.value || '').toLowerCase().trim();
  const completed = allTopics.filter(t => t.status === 'completed');
  completed.forEach(t => {
    const label = document.getElementById('quizLabel-' + t.stt);
    if (label) {
      const match = !q || t.topic.toLowerCase().includes(q) || String(t.stt).includes(q);
      label.classList.toggle('hidden', !match);
    }
  });
}

function updateQuizWordsCountBadge() {
  const completed = allTopics.filter(t => t.status === 'completed');
  const badge = document.getElementById('quizSelectedCountBadge');
  if (badge) badge.innerText = `${quizSelectedStts.size} / ${completed.length}`;
  const level = document.getElementById('quizLevelSelect')?.value || 'all';
  const wordsPerTopic = level === 'all' ? 100 : 50;
  const totalWords = quizSelectedStts.size * wordsPerTopic;
  const wordsBadge = document.getElementById('quizTotalWordsAvailable');
  if (wordsBadge) wordsBadge.innerText = `${totalWords.toLocaleString()} từ`;
}

async function loadWordsForTopics(sttList) {
  const allWords = [];
  for (const stt of sttList) {
    if (!quizWordsCache[stt]) {
      try {
        const res = await smartFetch(`output/${stt}.txt`);
        if (res.ok) {
          const text = await res.text();
          const lines = text.split('\n').filter(l => l.trim());
          const topicObj = allTopics.find(t => t.stt === stt) || { topic: `Chủ đề #${stt}` };
          quizWordsCache[stt] = lines.map((line, idx) => {
            const cols = line.split('\t');
            return {
              stt: stt,
              topicName: topicObj.topic,
              word: String(cols[0] || '').trim(),
              cloze: String(cols[1] || '').trim(),
              ipa: String(cols[2] || '').trim(),
              sound: String(cols[3] || '').trim(),
              definition: String(cols[4] || '').trim(),
              meaningVi: String(cols[5] || '').trim(),
              plural: String(cols[7] || '').trim(),
              examples: String(cols[8] || '').trim(),
              level: idx < 50 ? 'conversational' : 'advanced'
            };
          });
        }
      } catch (e) {
        console.error(`Lỗi tải file output/${stt}.txt:`, e);
      }
    }
    if (quizWordsCache[stt]) {
      allWords.push(...quizWordsCache[stt]);
    }
  }
  return allWords;
}

async function startQuizSession() {
  if (quizSelectedStts.size === 0) {
    alert('Vui lòng chọn ít nhất 1 chủ đề bạn đã học trên Anki!');
    return;
  }

  const sttList = Array.from(quizSelectedStts);
  const levelFilter = document.getElementById('quizLevelSelect').value;
  const mode = document.getElementById('quizModeSelect').value;

  if (typeof showLiveRunner === 'function') {
    showLiveRunner(`⚡ ĐANG NẠP KHO TỪ VỰNG TỪ ${sttList.length} CHỦ ĐỀ ĐÃ CHỌN...`, 40, 3);
  }
  const rawWords = await loadWordsForTopics(sttList);
  const runnerBanner = document.getElementById('liveRunnerBanner');
  if (runnerBanner) runnerBanner.classList.add('hidden');

  if (!rawWords.length) {
    alert('Không tải được từ vựng nào từ các chủ đề đã chọn. Vui lòng kiểm tra file trong output/!');
    return;
  }

  let candidateWords = rawWords.filter(w => w.word && w.meaningVi);
  if (levelFilter === 'conversational') candidateWords = candidateWords.filter(w => w.level === 'conversational');
  else if (levelFilter === 'advanced') candidateWords = candidateWords.filter(w => w.level === 'advanced');

  if (candidateWords.length < 4) {
    alert('Số lượng từ theo cấp độ đã chọn ít hơn 4 từ, không đủ tạo trắc nghiệm 4 đáp án!');
    return;
  }

  // Xáo trộn candidateWords
  const shuffled = [...candidateWords].sort(() => 0.5 - Math.random());
  const totalQ = Math.min(quizTargetQuestionCount, shuffled.length);
  const targets = shuffled.slice(0, totalQ);

  quizQuestions = targets.map(target => {
    const others = candidateWords.filter(w => w.word.toLowerCase() !== target.word.toLowerCase() && w.meaningVi.toLowerCase() !== target.meaningVi.toLowerCase());
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);

    let qType = mode;
    if (qType === 'mixed') qType = Math.random() > 0.5 ? 'en_to_vi' : 'vi_to_en';

    let promptMain = '';
    let promptSubtitle = '';
    let options = [];
    let correctOptionText = '';

    if (qType === 'en_to_vi') {
      promptSubtitle = 'Dịch từ vựng sau sang tiếng Việt:';
      promptMain = target.word;
      correctOptionText = target.meaningVi;
      options = [
        { text: target.meaningVi, isCorrect: true, wordObj: target },
        ...distractors.map(d => ({ text: d.meaningVi, isCorrect: false, wordObj: d }))
      ];
    } else {
      promptSubtitle = 'Chọn từ vựng tiếng Anh tương ứng với nghĩa:';
      promptMain = target.meaningVi;
      correctOptionText = target.word;
      options = [
        { text: target.word, isCorrect: true, wordObj: target },
        ...distractors.map(d => ({ text: d.word, isCorrect: false, wordObj: d }))
      ];
    }

    options.sort(() => 0.5 - Math.random());

    return {
      target: target,
      type: qType,
      promptMain: promptMain,
      promptSubtitle: promptSubtitle,
      options: options,
      correctOptionText: correctOptionText
    };
  });

  quizCurrentIdx = 0;
  quizScore = 0;
  quizStreak = 0;
  quizMaxStreak = 0;
  quizMistakes = [];
  quizIsAnswered = false;

  document.getElementById('quizView-setup').classList.add('hidden');
  document.getElementById('quizView-result').classList.add('hidden');
  document.getElementById('quizView-play').classList.remove('hidden');

  renderCurrentQuizCard();
  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

function renderCurrentQuizCard() {
  if (quizCurrentIdx >= quizQuestions.length) {
    showQuizResults();
    return;
  }

  quizIsAnswered = false;
  const q = quizQuestions[quizCurrentIdx];
  currentQuizWord = q.target;

  document.getElementById('quizPlayBadge').innerText = `CÂU ${quizCurrentIdx + 1}/${quizQuestions.length}`;
  document.getElementById('quizPlayTopicName').innerText = `#${q.target.stt} ${q.target.topicName}`;
  document.getElementById('quizCurrentScore').innerText = quizScore;
  document.getElementById('quizStreakCount').innerText = quizStreak;

  const comboBadge = document.getElementById('quizComboMultiplier');
  if (quizStreak >= 5) {
    comboBadge.innerText = 'COMBO x2.0 🔥';
    comboBadge.classList.remove('hidden');
  } else if (quizStreak >= 3) {
    comboBadge.innerText = 'COMBO x1.5 🔥';
    comboBadge.classList.remove('hidden');
  } else {
    comboBadge.classList.add('hidden');
  }

  const pct = Math.round(((quizCurrentIdx) / quizQuestions.length) * 100);
  document.getElementById('quizPlayProgressBar').style.width = `${Math.max(8, pct)}%`;

  const levelBadge = document.getElementById('quizQuestionLevelBadge');
  if (q.target.level === 'advanced') {
    levelBadge.innerText = '⚡ C1-C2 NÂNG CAO';
    levelBadge.className = 'tid-badge-num bg-[#8C43F6] text-white text-[10px]';
  } else {
    levelBadge.innerText = '💬 A2-B2 GIAO TIẾP';
    levelBadge.className = 'tid-badge-num bg-[#169C64] text-white text-[10px]';
  }

  document.getElementById('quizPromptSubtitle').innerText = q.promptSubtitle;
  document.getElementById('quizPromptMain').innerText = q.promptMain;
  document.getElementById('quizPromptIpa').innerText = q.type === 'en_to_vi' ? (q.target.ipa || '') : '';
  document.getElementById('quizPromptHint').innerText = q.type === 'vi_to_en' ? (q.target.definition ? `Gợi ý EN: ${q.target.definition}` : '') : '';

  if (q.type === 'en_to_vi') {
    speakWordTTS(q.target.word);
  }

  const letters = ['A', 'B', 'C', 'D'];
  const optContainer = document.getElementById('quizOptionsContainer');
  optContainer.innerHTML = q.options.map((opt, idx) => `
    <button type="button" onclick="chooseQuizOption(${idx})" id="quizOptBtn-${idx}" class="neo-btn p-4 bg-white text-left flex items-center gap-3.5 transition group hover:-translate-y-0.5">
      <span class="w-8 h-8 rounded bg-[#141414] text-white font-mono-code font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#111] group-hover:bg-[#FF9F1C] group-hover:text-[#111]">
        ${letters[idx]}
      </span>
      <span class="font-bold text-sm sm:text-base text-[#141414] leading-snug flex-1">
        ${opt.text}
      </span>
      <span class="font-mono-code text-xs text-slate-400 font-bold hidden sm:inline">[Phím ${idx + 1}]</span>
    </button>
  `).join('');

  document.getElementById('quizExplainBox').classList.add('hidden');
}

function speakCurrentQuizPrompt() {
  if (currentQuizWord && currentQuizWord.word) {
    speakWordTTS(currentQuizWord.word);
  }
}

function chooseQuizOption(idx) {
  if (quizIsAnswered) return;
  quizIsAnswered = true;

  const q = quizQuestions[quizCurrentIdx];
  const selected = q.options[idx];
  const optBtn = document.getElementById('quizOptBtn-' + idx);
  const isCorrect = selected.isCorrect;

  q.options.forEach((opt, i) => {
    const btn = document.getElementById('quizOptBtn-' + i);
    if (btn) btn.classList.add('pointer-events-none');
    if (opt.isCorrect && btn) {
      btn.className = 'neo-btn p-4 bg-[#169C64] text-white text-left flex items-center gap-3.5 border-2 border-[#111] shadow-[3px_3px_0px_#111]';
      const iconSpan = btn.querySelector('span:first-child');
      if (iconSpan) {
        iconSpan.className = 'w-8 h-8 rounded bg-white text-[#169C64] font-mono-code font-extrabold text-sm flex items-center justify-center shrink-0';
        iconSpan.innerText = '✓';
      }
    }
  });

  const feedback = document.getElementById('quizFeedbackStatus');

  if (isCorrect) {
    playQuizSound('correct');
    quizStreak++;
    if (quizStreak > quizMaxStreak) quizMaxStreak = quizStreak;

    let multiplier = 1.0;
    if (quizStreak >= 5) multiplier = 2.0;
    else if (quizStreak >= 3) multiplier = 1.5;

    const points = Math.round(10 * multiplier);
    quizScore += points;
    document.getElementById('quizCurrentScore').innerText = quizScore;
    document.getElementById('quizStreakCount').innerText = quizStreak;

    feedback.innerHTML = `
      <span class="text-[#169C64] flex items-center gap-1.5">
        <span class="text-xl">🎉</span> CHÍNH XÁC! (+${points} điểm ${multiplier > 1 ? `• COMBO x${multiplier} 🔥` : ''})
      </span>
    `;
  } else {
    playQuizSound('wrong');
    quizStreak = 0;
    document.getElementById('quizStreakCount').innerText = 0;
    document.getElementById('quizComboMultiplier').classList.add('hidden');

    if (optBtn) {
      optBtn.className = 'neo-btn p-4 bg-[#F05332] text-white text-left flex items-center gap-3.5 border-2 border-[#111] shadow-[3px_3px_0px_#111]';
      const iconSpan = optBtn.querySelector('span:first-child');
      if (iconSpan) {
        iconSpan.className = 'w-8 h-8 rounded bg-white text-[#F05332] font-mono-code font-extrabold text-sm flex items-center justify-center shrink-0';
        iconSpan.innerText = '✕';
      }
    }

    feedback.innerHTML = `
      <span class="text-[#F05332] flex items-center gap-1.5">
        <span class="text-xl">❌</span> CHƯA CHÍNH XÁC! (Đáp án đúng là ô xanh)
      </span>
    `;
    quizMistakes.push(q.target);
  }

  speakWordTTS(q.target.word);

  document.getElementById('quizExpWordTitle').innerText = q.target.word;
  document.getElementById('quizExpIpa').innerText = q.target.ipa ? `IPA: ${q.target.ipa}` : '';
  document.getElementById('quizExpPlural').innerText = q.target.plural ? `(Số nhiều: ${q.target.plural})` : '';
  document.getElementById('quizExpDef').innerText = q.target.definition ? `Định nghĩa: ${q.target.definition}` : '';
  document.getElementById('quizExpVi').innerText = `Nghĩa VI: ${q.target.meaningVi}`;
  document.getElementById('quizExpExamples').innerHTML = q.target.examples ? `Ví dụ thực tế: <br>${q.target.examples}` : '';

  const nextBtn = document.getElementById('quizNextBtn');
  if (quizCurrentIdx === quizQuestions.length - 1) {
    nextBtn.innerHTML = `XEM KẾT QUẢ VINH DANH 🏆`;
  } else {
    nextBtn.innerHTML = `CÂU TIẾP THEO ➔ (Phím Enter)`;
  }

  document.getElementById('quizExplainBox').classList.remove('hidden');
}

function nextQuizCard() {
  quizCurrentIdx++;
  renderCurrentQuizCard();
}

function quitQuizEarly() {
  if (confirm('Bạn có chắc muốn dừng bài trắc nghiệm và xem kết quả hiện tại không?')) {
    showQuizResults();
  }
}

function showQuizResults() {
  playQuizSound('fanfare');
  document.getElementById('quizView-play').classList.add('hidden');
  document.getElementById('quizView-result').classList.remove('hidden');

  const totalAnswered = quizCurrentIdx;
  const totalCorrect = totalAnswered - quizMistakes.length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  let rank = 'ANKI TITAN';
  let emoji = '🏆';
  let title = 'XUẤT SẮC TUYỆT ĐỐI!';
  let sub = 'Bạn không trả lời sai một câu nào. Trí nhớ từ vựng của bạn cực kỳ đẳng cấp!';

  if (accuracy >= 85) {
    rank = 'VOCAB MASTER';
    emoji = '🥇';
    title = 'BẬC THẦY GHI NHỚ TỪ VỰNG!';
    sub = 'Khả năng phản xạ và ghi nhớ từ vựng Anki của bạn rất vững chắc.';
  } else if (accuracy >= 70) {
    rank = 'RISING SCHOLAR';
    emoji = '🥈';
    title = 'KẾT QUẢ RẤT KHẢ QUAN!';
    sub = 'Bạn đã nắm được phần lớn từ vựng, chỉ cần củng cố thêm một chút.';
  } else {
    rank = 'ANKI APPRENTICE';
    emoji = '🥉';
    title = 'CẦN ÔN TẬP THÊM!';
    sub = 'Đừng lo lắng! Hãy bấm nút ôn lại các từ sai ở bên dưới để nắm chắc 100%.';
  }

  document.getElementById('quizResultRankBadge').innerText = rank;
  document.getElementById('quizResultEmoji').innerText = emoji;
  document.getElementById('quizResultTitle').innerText = title;
  document.getElementById('quizResultSub').innerText = sub;

  document.getElementById('quizResultScore').innerText = quizScore;
  document.getElementById('quizResultAccuracy').innerText = `${accuracy}%`;
  document.getElementById('quizResultMaxStreak').innerText = quizMaxStreak;
  document.getElementById('quizResultCorrectRatio').innerText = `${totalCorrect}/${totalAnswered}`;

  const mistakeBox = document.getElementById('quizMistakesContainer');
  const mistakeList = document.getElementById('quizMistakeWordList');
  if (quizMistakes.length > 0) {
    document.getElementById('quizMistakeCountText').innerText = quizMistakes.length;
    mistakeList.innerHTML = quizMistakes.map(m => `
      <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-[#111] text-xs">
        <div class="flex items-center gap-2">
          <button onclick="speakWordTTS('${m.word}')" class="neo-btn px-2 py-0.5 bg-[#FFE787] text-[10px] font-bold">🔊</button>
          <span class="font-display font-extrabold text-[#141414]">${m.word}</span>
          <span class="font-mono-code text-slate-500 text-[11px]">${m.ipa || ''}</span>
        </div>
        <div class="font-bold text-[#169C64]">${m.meaningVi}</div>
      </div>
    `).join('');
    mistakeBox.classList.remove('hidden');
  } else {
    mistakeBox.classList.add('hidden');
  }

  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

function retryMistakeWordsQuiz() {
  if (!quizMistakes.length) return;
  const mistakeWords = [...quizMistakes];
  const shuffled = mistakeWords.sort(() => 0.5 - Math.random());

  quizQuestions = shuffled.map(target => {
    const others = mistakeWords.filter(w => w.word.toLowerCase() !== target.word.toLowerCase());
    const distractors = others.slice(0, 3);
    while (distractors.length < 3) {
      distractors.push({ word: 'sample', meaningVi: 'mẫu' });
    }
    const options = [
      { text: target.meaningVi, isCorrect: true, wordObj: target },
      ...distractors.map(d => ({ text: d.meaningVi, isCorrect: false, wordObj: d }))
    ].sort(() => 0.5 - Math.random());

    return {
      target: target,
      type: 'en_to_vi',
      promptSubtitle: 'Dịch từ vựng sau sang tiếng Việt:',
      promptMain: target.word,
      options: options,
      correctOptionText: target.meaningVi
    };
  });

  quizCurrentIdx = 0;
  quizScore = 0;
  quizStreak = 0;
  quizMaxStreak = 0;
  quizMistakes = [];
  quizIsAnswered = false;

  document.getElementById('quizView-result').classList.add('hidden');
  document.getElementById('quizView-play').classList.remove('hidden');
  renderCurrentQuizCard();
  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

function playAgainSameSettings() {
  startQuizSession();
}

function backToQuizSetup() {
  document.getElementById('quizView-play').classList.add('hidden');
  document.getElementById('quizView-result').classList.add('hidden');
  document.getElementById('quizView-setup').classList.remove('hidden');
  renderQuizTopicSelection();
  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

// Phím tắt bàn phím
window.addEventListener('keydown', (e) => {
  const playView = document.getElementById('quizView-play');
  if (playView && !playView.classList.contains('hidden')) {
    if (!quizIsAnswered) {
      if (e.key === '1' || e.key.toLowerCase() === 'a') chooseQuizOption(0);
      else if (e.key === '2' || e.key.toLowerCase() === 'b') chooseQuizOption(1);
      else if (e.key === '3' || e.key.toLowerCase() === 'c') chooseQuizOption(2);
      else if (e.key === '4' || e.key.toLowerCase() === 'd') chooseQuizOption(3);
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nextQuizCard();
      }
    }
  }
});
