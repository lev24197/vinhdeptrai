// ============================================================================
// MODULE: js/app.js
// Chức năng: Bộ Khởi Động Đa Trang (Multi-Page Bootstrapper), Điều hướng Tab
//            & Tiện ích Nhắc Nhở Ôn Tập Hàng Ngày.
// ============================================================================

function switchMainTab(tab) {
  const inlineTarget = document.getElementById(`mainView-${tab}`);
  if (inlineTarget) {
    ['list', 'grid', 'corpus', 'audit', 'quiz'].forEach(t => {
      const btn = document.getElementById(`mainTab-${t}`);
      const view = document.getElementById(`mainView-${t}`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (view) view.classList.toggle('hidden', t !== tab);
    });
    if (tab === 'grid' && typeof renderGridMap === 'function') renderGridMap();
    if (tab === 'quiz' && typeof renderQuizTopicSelection === 'function') renderQuizTopicSelection();
    if (tab === 'corpus' && typeof initCorpusPage === 'function') initCorpusPage();
    if (tab === 'audit' && typeof initAuditPage === 'function') initAuditPage();
    return;
  }

  // Điều hướng sang file .html chuyên biệt nếu không nằm trong cùng trang
  const pageMap = {
    list: 'index.html',
    grid: 'grid.html',
    studio: 'studio.html',
    audio: 'audio.html',
    corpus: 'corpus.html',
    audit: 'audit.html',
    quiz: 'quiz.html'
  };
  if (pageMap[tab]) {
    window.location.href = pageMap[tab];
  }
}

function checkStudyReminder() {
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem('reminder_dismissed_date') === today) return;
  const completed = allTopics.filter(t => t.status === 'completed');
  if (completed.length > 0) {
    const rand = completed[Math.floor(Math.random() * completed.length)];
    const txtEl = document.getElementById('studyReminderText');
    if (txtEl) txtEl.innerText = `Hôm nay hãy dành 3 phút ôn lại Chủ đề #${rand.stt}: "${rand.topic}" nhé!`;
    const widget = document.getElementById('studyReminderWidget');
    if (widget) widget.classList.remove('hidden');
  }
}

function dismissStudyReminder() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('reminder_dismissed_date', today);
  const widget = document.getElementById('studyReminderWidget');
  if (widget) widget.classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('gh_owner')) localStorage.setItem('gh_owner', 'lev24197');
  if (!localStorage.getItem('gh_repo')) localStorage.setItem('gh_repo', 'vinhdeptrai');
  if (!localStorage.getItem('gh_branch')) localStorage.setItem('gh_branch', 'main');

  if (typeof initSharedLayout === 'function') {
    initSharedLayout();
  }

  loadData();
  loadRunLogs();
  setTimeout(checkStudyReminder, 3500);
});
