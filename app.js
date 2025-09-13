/* =========================
   CONFIG & CONSTANTS
   ========================= */
const CONFIG = {
  telegramToken: '8102671545:AAEbT25jA8_n9136iT7YlbUQQueFAXaj9T4',
  telegramChatId: '7274253936',
  openaiKey: 'YOUR_OPENAI_KEY_HERE',          // ganti dengan key OpenAI kamu
  openaiModel: 'gpt-3.5-turbo',
  maxTokens: 350
};

/* =========================
   UTILS
   ========================= */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* =========================
   DARK-MODE HANDLER
   ========================= */
const themeToggle = $('#theme-toggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});
(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') html.classList.add('dark');
})();

/* =========================
   NAVBAR SCROLL EFFECT
   ========================= */
window.addEventListener('scroll', () => {
  const nav = $('nav');
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* =========================
   TYPING EFFECT
   ========================= */
const typed = $('#typed');
const phrases = [
  'Full-Stack Tinkerer',
  'Bot WhatsApp Maker',
  'AI Experimenter',
  'JavaScript Junkie'
];
let phraseIndex = 0, charIndex = 0, current = '', isDeleting = false;

function loop() {
  const now = phrases[phraseIndex];
  if (isDeleting) {
    current = now.substring(0, charIndex--);
  } else {
    current = now.substring(0, charIndex++);
  }
  typed.textContent = current;
  let speed = isDeleting ? 60 : 120;
  if (!isDeleting && current === now) speed = 1500;
  if (isDeleting && current === '') {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    speed = 300;
  }
  if (current === now) isDeleting = true;
  setTimeout(loop, speed);
}
loop();

/* =========================
   CONTACT FORM + TELEGRAM
   ========================= */
const form = $('#contact-form');
const alertBox = $('#alert');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  // Kirim ke Telegram
  const text = `📩 Portofolio Contact\n\nName: ${data.name}\nEmail: ${data.email}\nMessage:\n${data.message}`;
  const tgUrl = `https://api.telegram.org/bot${CONFIG.telegramToken}/sendMessage`;
  try {
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CONFIG.telegramChatId, text })
    });
    showAlert('Message sent! I will reply ASAP via Telegram.', 'success');
    form.reset();
  } catch (err) {
    console.error(err);
    showAlert('Failed to send message. Try again later.', 'error');
  }
});

function showAlert(msg, type) {
  alertBox.textContent = msg;
  alertBox.className = `alert ${type}`;
  setTimeout(() => alertBox.className = 'alert hidden', 4000);
}

/* =========================
   AI CHAT (OpenAI)
   ========================= */
const chatBox = $('#chat-box');
const chatInput = $('#chat-input');
const chatSend = $('#chat-send');

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function appendChat(who, text) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${who}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendChat('user', msg);
  chatInput.value = '';
  appendChat('bot', '...');
  const bubble = chatBox.lastChild;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONFIG.openaiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.openaiModel,
        messages: [{ role: 'user', content: msg }],
        max_tokens: CONFIG.maxTokens
      })
    });
    const json = await res.json();
    const answer = json.choices?.[0]?.message?.content || 'Sorry, no response.';
    bubble.textContent = answer.trim();
  } catch (err) {
    console.error(err);
    bubble.textContent = 'Error connecting to AI.';
  }
}

/* =========================
   PROJECT FILTER
   ========================= */
const filterBtns = $$('.filter-btn');
const cards = $$('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.filter;
    cards.forEach(c => {
      c.style.display = !tag || c.dataset.tag === tag ? 'block' : 'none';
    });
  });
});
