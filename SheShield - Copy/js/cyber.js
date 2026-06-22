// =============================================
// SHESHIELD – Cyber Safety JS
// =============================================

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`tab-${target}`)?.classList.add('active');
  });
});

// Tip cards entrance animation
const tipCards = document.querySelectorAll('.tip-card');
if (tipCards.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 70);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  tipCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    obs.observe(card);
  });
}

console.log('🔒 Cyber Safety Hub loaded');