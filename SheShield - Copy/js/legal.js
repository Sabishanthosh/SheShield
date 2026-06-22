// =============================================
// SHESHIELD – Legal Awareness JS
// =============================================

// Accordion toggle for laws
const lawHeaders = document.querySelectorAll('.law-header');

lawHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.law-item');
    const wasOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.law-item').forEach(li => li.classList.remove('open'));

    // Open clicked one if it wasn't already open
    if (!wasOpen) {
      item.classList.add('open');
    }
  });
});

// Open first law item by default
document.querySelector('.law-item')?.classList.add('open');

// Right cards entrance animation
const rightCards = document.querySelectorAll('.right-card');
if (rightCards.length) {
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

  rightCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    obs.observe(card);
  });
}

console.log('⚖️ Legal Awareness loaded');