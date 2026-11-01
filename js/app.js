// ==================== KHỞI TẠO ỨNG DỤNG & ĐIỀU HƯỚNG CHÍNH (APP ENTRY) ====================

function switchMainTab(tab) {
  ['list', 'grid', 'corpus', 'audit', 'quiz'].forEach(t => {
    const sec = document.getElementById('tabSection-' + t);
    if (sec) sec.classList.toggle('hidden', t !== tab);
    const btn = document.getElementById('mainTab-' + t);
    if (btn) {
      btn.className = t === tab
        ? 'neo-btn px-4 py-2.5 bg-[#111] text-white font-display font-extrabold text-xs uppercase'
        : 'neo-btn px-4 py-2.5 bg-[#F8F7F2] text-[#111] font-display font-extrabold text-xs uppercase';
    }
  });

  if (tab === 'quiz' && typeof renderQuizTopicSelection === 'function') {
    renderQuizTopicSelection();
  }
}

function openRandomCompletedStudy() {
  switchMainTab('quiz');
  const anchor = document.getElementById('workspaceAnchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

// Tự động khởi chạy nạp dữ liệu khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  loadData(true);
});

// Fallback nếu DOMContentLoaded đã kích hoạt trước đó
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  loadData(true);
}
