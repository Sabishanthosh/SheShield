// =============================================
// SHESHIELD – Main JavaScript
// =============================================

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Hamburger menu ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// --- Active nav link highlight ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.includes(currentPage)) {
    link.classList.add('active');
  }
});

// --- Safety Score Animation ---
function animateScore() {
  const circle = document.getElementById('scoreCircle');
  const numberEl = document.getElementById('scoreNumber');
  if (!circle || !numberEl) return;

  const score = 72; // out of 100
  const circumference = 314; // 2 * π * 50
  const offset = circumference - (score / 100) * circumference;

  // Animate circle
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 300);

  // Animate number count-up
  let count = 0;
  const interval = setInterval(() => {
    count++;
    numberEl.textContent = count;
    if (count >= score) clearInterval(interval);
  }, 20);
}

// Run score animation when section is in view
const scoreSection = document.querySelector('.safety-score-section');
if (scoreSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateScore();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(scoreSection);
}

// --- Action cards - subtle entrance animation ---
const cards = document.querySelectorAll('.action-card');
if (cards.length) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    cardObserver.observe(card);
  });
}

// --- Alert items entrance ---
const alertItems = document.querySelectorAll('.alert-item');
if (alertItems.length) {
  const alertObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, i * 100);
        alertObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  alertItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-16px)';
    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    alertObserver.observe(item);
  });
}

console.log('🛡️ SheShield loaded successfully');