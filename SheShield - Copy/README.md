# 🛡️ SheShield – Women's Safety & Cyber Protection Platform

SheShield is a web platform that combines **physical safety, cyber protection, evidence preservation, and legal guidance** into a single, accessible tool for women.

## 🌐 Live Pages

| Page | Description |
|------|-------------|
| **Dashboard** (`index.html`) | Safety score, quick actions, recent alerts |
| **SOS Center** (`pages/sos-center.html`) | Emergency contacts, SOS countdown alert, quick-dial helplines, live location |
| **Cyber Safety Hub** (`pages/cyber-safety.html`) | Instagram blackmail, WhatsApp scams, fake profile reporting, cyber crime help |
| **Evidence Vault** (`pages/evidence-vault.html`) | PIN-protected screenshot upload, incident notes, export records |
| **Legal Awareness** (`pages/legal-awareness.html`) | Rights, key laws (IPC/IT Act/PoSH/DV Act), complaint process, helpline directory |
| **Emergency Guidance** (`pages/emergency-guide.html`) | Select situation (stalking/harassment/blackmail/unsafe travel) → get step-by-step guidance |

## 🎯 Why This Project

Most women's safety apps focus only on SOS alerts. As a Digital and Cyber Forensic Science graduate, I combined **physical safety, cyber safety, evidence preservation, and emergency guidance** into one platform — addressing the full lifecycle of a safety incident: prevention → response → evidence → legal action.

## 🛠️ Tech Stack

**Phase 1**
- HTML5, CSS3, Vanilla JavaScript

**Phase 2**
- LocalStorage (contacts, vault records, PIN)
- Fully responsive design (mobile-first)

**Phase 3 (Planned)**
- Firebase (Auth + Firestore for cross-device sync)

## ✨ Key Features

- 🆘 Press-and-hold SOS button with 10-second countdown + cancel
- 📍 Live location sharing via browser Geolocation API
- 🔐 PIN-locked Evidence Vault with image upload (drag & drop) + incident notes
- ⬇️ Export evidence records as a text file for police complaints
- 📚 Tab-based Cyber Safety guidance with legal references
- ⚖️ Accordion-style law explainer (IPC, IT Act, DV Act, PoSH Act)
- 🚨 Situation-based emergency guidance (stalking, harassment, blackmail, unsafe travel)
- 📱 Fully responsive — works on mobile, tablet, desktop

## 📁 Folder Structure

```
SheShield/
│
├── index.html
├── css/
│   ├── style.css        (base + dashboard)
│   ├── sos.css
│   ├── cyber.css
│   ├── vault.css
│   ├── legal.css
│   └── emergency.css
├── js/
│   ├── main.js          (shared: navbar, scroll, animations)
│   ├── sos.js
│   ├── cyber.js
│   ├── vault.js
│   ├── legal.js
│   └── emergency.js
│
├── pages/
│   ├── sos-center.html
│   ├── cyber-safety.html
│   ├── evidence-vault.html
│   ├── legal-awareness.html
│   └── emergency-guide.html
│
└── README.md
```

## 🚀 Run Locally

No build step required — pure HTML/CSS/JS.

```bash
git clone https://github.com/<your-username>/SheShield.git
cd SheShield
# Open index.html in your browser, or use a local server:
npx serve .
```

## 📞 Helplines Referenced

| Number | Service |
|--------|---------|
| 112 | National Emergency |
| 1091 | Women Helpline |
| 100 | Police |
| 1930 | Cyber Crime Helpline |
| 15100 | NALSA Legal Aid |
| 1098 | Child Helpline |

## ⚠️ Disclaimer

This is a portfolio/demo project. It is not a substitute for professional legal advice or official emergency services. All legal information is for awareness purposes — always consult the relevant authorities for an actual case.

---

Built with care, by a Digital & Cyber Forensic Science graduate. 🌸