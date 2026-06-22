// =============================================
// SHESHIELD – Emergency Guidance JS
// =============================================

const guidanceData = {
  stalking: {
    icon: '👁️',
    title: 'Stalking',
    immediate: 'If the person is physically near you right now, move to a public, well-lit place (shop, hospital, police station) immediately. Do not go home directly if they know your address.',
    steps: [
      'Do not engage or confront the stalker directly — this can escalate the situation.',
      'Note down dates, times, locations, and descriptions of every stalking incident.',
      'Screenshot any messages, calls, or social media activity — save to Evidence Vault.',
      'Inform trusted family/friends about the situation so you are not alone in this.',
      'Vary your daily routine and routes temporarily if possible.',
      'File a complaint under IPC Sec 354D (Stalking) at your nearest police station — Zero FIR allowed.',
      'If in immediate danger, use the SOS button to alert your emergency contacts instantly.'
    ]
  },
  harassment: {
    icon: '😠',
    title: 'Harassment',
    immediate: 'Remove yourself from the immediate situation if possible. If in a public space, move toward other people, security, or staff.',
    steps: [
      'Say "No" clearly and firmly — you do not need to be polite to someone harassing you.',
      'Look for nearby authority figures: security guards, shop staff, police.',
      'Screenshot/record any messages or calls — these count as evidence.',
      'If it happened in a workplace, report to HR / Internal Complaints Committee (PoSH Act).',
      'If it happened in public, you can file a complaint under IPC Sec 354A.',
      'Save all evidence in the Evidence Vault with date, time, and description.',
      'Tell someone you trust immediately — don\'t carry this alone.'
    ]
  },
  blackmail: {
    icon: '📸',
    title: 'Blackmail',
    immediate: 'Do NOT pay any money or send any further photos/videos. Paying does not guarantee they will stop — it often increases demands.',
    steps: [
      'Screenshot every threat message, including profile details of the blackmailer.',
      'Do not delete the conversation — it is your strongest evidence.',
      'Block the person only AFTER you\'ve saved all evidence.',
      'Report the account on the platform (Instagram/WhatsApp/Facebook) immediately.',
      'File a complaint at cybercrime.gov.in or call 1930 — this is anonymous and free.',
      'Remember: sharing private images without consent is a crime under IT Act 66E — you are the victim.',
      'Tell a trusted adult or call the Women Helpline (1091) for emotional support.'
    ]
  },
  unsafetravel: {
    icon: '🚖',
    title: 'Unsafe Travel',
    immediate: 'Share your live location with a trusted contact right now using the SOS Center. Stay alert and keep your phone accessible.',
    steps: [
      'If in a cab/auto, share trip details (vehicle number, driver name) with someone immediately.',
      'Sit behind the driver, never in the front seat, when traveling alone at night.',
      'If you feel unsafe, ask the driver to stop at a public, well-lit place — not a deserted area.',
      'Call a trusted contact and stay on the phone, speaking loudly enough for the driver to hear.',
      'Use the SOS countdown feature for instant alert with your live location.',
      'If walking, head toward shops, hospitals, or police stations — avoid shortcuts through empty areas.',
      'Note the vehicle number plate and driver details — report to police if anything feels wrong.'
    ]
  }
};

const situationCards = document.querySelectorAll('.situation-card');
const selectorSection = document.querySelector('.selector-section');
const guidanceSection = document.getElementById('guidanceSection');
const backBtn = document.getElementById('backBtn');

situationCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.situation;
    showGuidance(key);
  });
});

backBtn?.addEventListener('click', () => {
  guidanceSection.style.display = 'none';
  selectorSection.style.display = 'block';
  window.scrollTo({ top: selectorSection.offsetTop - 80, behavior: 'smooth' });
});

function showGuidance(key) {
  const data = guidanceData[key];
  if (!data) return;

  document.getElementById('guidanceIcon').textContent = data.icon;
  document.getElementById('guidanceTitle').textContent = data.title;
  document.getElementById('immediateText').textContent = data.immediate;

  const stepsList = document.getElementById('guidanceSteps');
  stepsList.innerHTML = '';
  data.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="step-num">${i + 1}</span><span>${step}</span>`;
    stepsList.appendChild(li);
  });

  selectorSection.style.display = 'none';
  guidanceSection.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

console.log('🚨 Emergency Guidance loaded');