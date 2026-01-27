/* ------------------ Animated Background Dots ------------------ */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const colors = [
  'rgba(20,20,30,0.7)',
  'rgba(40,40,50,0.7)',
  'rgba(60,60,70,0.7)',
  'rgba(80,80,90,0.7)',
  'rgba(100,100,110,0.7)'
];

const dots = [];
const dotCount = 80;

for (let i = 0; i < dotCount; i++) {
  dots.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 1,
    speed: Math.random() * 0.3 + 0.1,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

function animateDots() {
  ctx.clearRect(0, 0, width, height);

  dots.forEach(dot => {
    dot.x += dot.speed;
    if (dot.x > width) dot.x = 0;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = dot.color;
    ctx.fill();
  });

  requestAnimationFrame(animateDots);
}

animateDots();

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

/* ------------------ Encrypted → Decrypted Logo ------------------ */
const logoEl = document.getElementById('animatedLogo');
const nameText = "root@HS";
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
let display = Array(nameText.length).fill("");

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

function animateDecrypt() {
  let done = true;

  display = display.map((c, i) => {
    if (c !== nameText[i]) {
      done = false;
      return Math.random() < 0.07 ? nameText[i] : randomChar();
    }
    return nameText[i];
  });

  logoEl.textContent = ">_ " + display.join("");

  if (done) {
    setTimeout(() => display.fill(""), 1000);
  }

  requestAnimationFrame(animateDecrypt);
}

animateDecrypt();

/* ------------------ Modal Popup ------------------ */
const modal = document.getElementById("contactModal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.querySelector(".modal .close");
const form = document.getElementById("contactForm");

if (openBtn) openBtn.onclick = () => modal.style.display = "block";
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    alert(
      `Thank you, ${name}! Your message has been sent.\n\nEmail: ${email}\nMessage: ${message}`
    );

    form.reset();
    modal.style.display = "none";
  });
}
