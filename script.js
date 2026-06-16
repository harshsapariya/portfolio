document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     SECURITY LAYER
     Clickjacking · XSS · SQLi · CORS · SSRF
  ══════════════════════════════════════════ */

  /* 1. CLICKJACKING — JS frame-busting (second layer after CSP) */
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }

  /* 2. XSS — sanitize any value before use */
  function sanitizeInput(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
      .replace(/=/g, '&#x3D;');
  }

  function containsXSS(value) {
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript\s*:/gi,
      /on\w+\s*=/gi,          // onclick=, onerror=, etc.
      /<iframe[\s\S]*?>/gi,
      /<object[\s\S]*?>/gi,
      /<embed[\s\S]*?>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript\s*:/gi,
      /data\s*:\s*text\/html/gi,
    ];
    return xssPatterns.some(p => p.test(value));
  }

  /* 3. SQL INJECTION — detect common SQLi patterns in inputs */
  function containsSQLi(value) {
    const sqliPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE|REPLACE)\b)/gi,
      /(--|;|\/\*|\*\/)/g,              // SQL comment markers
      /(\bOR\b|\bAND\b)\s+[\w'"]+=[\w'"]+/gi, // OR 1=1, AND 'a'='a'
      /'\s*(OR|AND)\s*'/gi,
      /\bSLEEP\s*\(\d+\)/gi,           // time-based blind SQLi
      /\bWAITFOR\s+DELAY\b/gi,
      /\bBENCHMARK\s*\(/gi,
      /\b(LOAD_FILE|INTO\s+OUTFILE)\b/gi,
    ];
    return sqliPatterns.some(p => p.test(value));
  }

  /* 4. SSRF — block URLs pointing to internal/private addresses */
  function containsSSRF(value) {
    const ssrfPatterns = [
      /https?:\/\/(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1)/gi,
      /https?:\/\/10\.\d+\.\d+\.\d+/gi,       // 10.x.x.x private
      /https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/gi, // 172.16–31
      /https?:\/\/192\.168\.\d+\.\d+/gi,       // 192.168.x.x
      /https?:\/\/169\.254\.\d+\.\d+/gi,       // link-local / AWS metadata
      /https?:\/\/metadata\.google\.internal/gi,
      /file:\/\//gi,
      /dict:\/\//gi,
      /ftp:\/\//gi,
      /gopher:\/\//gi,
    ];
    return ssrfPatterns.some(p => p.test(value));
  }

  /* 5. Validate all form inputs before submission */
  function validateInputSecurity(value, fieldName) {
    if (containsXSS(value)) {
      return `✗ Invalid content detected in ${fieldName} (XSS pattern).`;
    }
    if (containsSQLi(value)) {
      return `✗ Invalid content detected in ${fieldName} (SQL pattern).`;
    }
    if (containsSSRF(value)) {
      return `✗ Invalid content detected in ${fieldName} (restricted URL).`;
    }
    return null;
  }

  /* 6. CORS — warn if page loaded from unexpected origin */
  const allowedOrigins = ['127.0.0.1', 'localhost', 'harshsapariya.com'];
  const currentHost = window.location.hostname;
  if (currentHost && !allowedOrigins.some(o => currentHost.includes(o))) {
    console.warn('[Security] Unexpected origin:', currentHost);
  }

  /* 7. Disable right-click context menu inspection on prod */
  // (optional — comment out if you want devtools during dev)
  // document.addEventListener('contextmenu', e => e.preventDefault());

  /* ── Active nav on scroll ── */
  const navLinks = document.querySelectorAll('.n-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 80) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('[data-reveal]');

  if (reveals.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = [...(entry.target.parentElement?.children || [])];
          const index = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('revealed'), index * 100);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ── Skill bars animate on scroll into view ── */
  const skillWraps = document.querySelectorAll('.skills-wrap');

  if (skillWraps.length) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-bar').forEach(bar => {
            setTimeout(() => {
              bar.style.width = (bar.dataset.w || 0) + '%';
            }, 200);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillWraps.forEach(el => barObserver.observe(el));
  }

  /* ── Hero name glitch on hover ── */
  const nameEl = document.querySelector('.hero-name .first');
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  const originalName = 'HARSH';
  let glitchInterval;

  if (nameEl) {
    nameEl.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(glitchInterval);
      glitchInterval = setInterval(() => {
        nameEl.textContent = originalName
          .split('')
          .map((char, i) =>
            i < iteration
              ? originalName[i]
              : glyphs[Math.floor(Math.random() * glyphs.length)]
          )
          .join('');
        if (iteration++ >= originalName.length) {
          clearInterval(glitchInterval);
          nameEl.textContent = originalName;
        }
      }, 45);
    });
  }

  /* ── EmailJS contact form ── */
  if (typeof emailjs !== 'undefined') {
    emailjs.init('SSUF_MHYdEBoc-cq-');
  }

  let lastSent = 0;
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  /* ── Email validation helpers ── */
  const blockedDomains = [
    'test.com', 'fake.com', 'example.com', 'mailinator.com',
    'guerrillamail.com', 'trashmail.com', 'throwam.com', 'yopmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
    'spam4.me', 'dispostable.com', 'tempmail.com', 'tempr.email',
    'disposablemail.com', 'maildrop.cc', 'temp-mail.org', 'fakeinbox.com',
    'getairmail.com', 'filzmail.com', 'spamgourmet.com', 'trashmail.at',
    'aol.fake', 'nomail.com', 'noemail.com', 'invalid.com'
  ];

  function isValidEmailFormat(email) {
    // Must match standard email pattern
    const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function isBlockedDomain(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return blockedDomains.includes(domain);
  }

  function hasValidTLD(email) {
    const parts = email.split('@')[1]?.split('.');
    const tld = parts?.[parts.length - 1]?.toLowerCase();
    // TLD must be at least 2 chars and not suspiciously short/fake
    return tld && tld.length >= 2 && tld.length <= 6;
  }

  function validateEmail(email) {
    if (!isValidEmailFormat(email)) {
      return '✗ Please enter a valid email address.';
    }
    if (!hasValidTLD(email)) {
      return '✗ Email domain looks invalid.';
    }
    if (isBlockedDomain(email)) {
      return '✗ Disposable or fake email addresses are not allowed.';
    }
    return null; // valid
  }

  /* ── Live email feedback ── */
  const emailInput = document.getElementById('email');
  const emailError = document.createElement('span');
  emailError.className = 'email-error';
  if (emailInput) {
    emailInput.parentElement.appendChild(emailError);

    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (!val) { emailError.textContent = ''; return; }
      const err = validateEmail(val);
      emailError.textContent = err || '✓ Looks good.';
      emailError.style.color = err ? '#ff4444' : '#d4ff1e';
    });

    emailInput.addEventListener('input', () => {
      emailError.textContent = '';
    });
  }

  if (form && formStatus && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (Date.now() - lastSent < 30000) {
        formStatus.textContent = '⚠ Please wait 30 seconds before sending again.';
        formStatus.style.color = 'orange';
        return;
      }

      const honeypot = document.getElementById('company');
      if (honeypot && honeypot.value) return;

      // Security validation on all fields
      const fields = [
        { id: 'name',    label: 'Name' },
        { id: 'email',   label: 'Email' },
        { id: 'message', label: 'Message' },
      ];

      for (const field of fields) {
        const el = document.getElementById(field.id);
        if (!el) continue;
        const val = el.value.trim();
        const secErr = validateInputSecurity(val, field.label);
        if (secErr) {
          formStatus.textContent = secErr;
          formStatus.style.color = '#ff4444';
          el.focus();
          return;
        }
      }

      // Validate email format
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailErr = validateEmail(emailVal);
      if (emailErr) {
        formStatus.textContent = emailErr;
        formStatus.style.color = '#ff4444';
        emailInput.focus();
        return;
      }

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm('service_nlbq74m', 'template_0bhiu0w', this)
          .then(() => {
            formStatus.textContent = "✓ Message sent! I'll get back to you soon.";
            formStatus.style.color = '#d4ff1e';
            form.reset();
            if (emailError) emailError.textContent = '';
            lastSent = Date.now();
            submitBtn.textContent = 'Send Message →';
            submitBtn.disabled = false;
          })
          .catch(err => {
            console.error('EmailJS error:', err);
            formStatus.textContent = '✗ Failed to send. Please try again.';
            formStatus.style.color = '#ff4444';
            submitBtn.textContent = 'Send Message →';
            submitBtn.disabled = false;
          });
      } else {
        formStatus.textContent = '✓ Form ready (EmailJS not loaded in preview).';
        formStatus.style.color = '#d4ff1e';
        submitBtn.textContent = 'Send Message →';
        submitBtn.disabled = false;
      }
    });
  }

});