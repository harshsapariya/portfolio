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
const formStatus = document.getElementById("formStatus");

if (openBtn) openBtn.onclick = () => modal.style.display = "block";
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ------------------ EmailJS Contact Form with Spam Protection ------------------ */
emailjs.init("SSUF_MHYdEBoc-cq-"); 

// Rate limit: 1 message per 30 seconds
let lastSentTime = 0;

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSentTime < 30000) {
      formStatus.textContent = "⚠️ Please wait 30 seconds before sending another message.";
      formStatus.style.color = "orange";
      return;
    }

    // Honeypot field check
    const honeypot = document.getElementById("company").value;
    if (honeypot) {
      formStatus.textContent = "⚠️ Spam detected!";
      formStatus.style.color = "red";
      return;
    }

    // Send via EmailJS
    emailjs.sendForm(
      "service_nlbq74m",   
      "template_0bhiu0w",  
      this
    ).then(
      () => {
        formStatus.textContent = "✅ Message sent successfully!";
        formStatus.style.color = "green";
        form.reset();
        modal.style.display = "none";
        lastSentTime = Date.now();
      },
      (error) => {
        formStatus.textContent = "❌ Failed to send message. Try again.";
        formStatus.style.color = "red";
        console.error("EmailJS Error:", error);
      }
    );
  });
}
