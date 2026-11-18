(() => {
  // Company WhatsApp number (India, country code 91).
  const WHATSAPP_NUMBER = '919943680611';
  // Optional: a form endpoint that emails each registration or enquiry to you. Leave '' until it is set up.
  const NOTIFY_URL = '';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  setTimeout(() => $('#intro').classList.add('done'), reduce ? 0 : 1300);
  $('#yr').textContent = new Date().getFullYear();
  $('#wa').href = waLink('Hello Indhra Projects, I would like to know more about your services.');

  // header + mobile nav
  const header = $('#header'), nav = $('#nav'), menuBtn = $('#menuBtn');
  addEventListener('scroll', () => header.classList.toggle('solid', scrollY > 40), { passive: true });
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // pages: each section is a full-screen page; moving between them slides the current page out and the next one in
  const pages = $$('.page');
  let cur = 0, busy = false, lastNav = 0;
  const pageOf = (id) => { const el = id && document.getElementById(id); const pg = el && el.closest('.page'); return pg ? pages.indexOf(pg) : -1; };
  const dots = $('#dots');
  pages.forEach((pg, i) => {
    if (!pg.dataset.title) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.i = i;
    b.setAttribute('aria-label', pg.dataset.title);
    b.innerHTML = `<span>${pg.dataset.title}</span>`;
    dots.appendChild(b);
  });
  const paint = () => $$('#dots button').forEach((b) => b.classList.toggle('on', +b.dataset.i === cur));
  const go = (to) => {
    if (busy || to < 0 || to >= pages.length || to === cur) return;
    const dir = to > cur ? 1 : -1;
    const from = pages[cur], next = pages[to];
    busy = true;
    lastNav = performance.now();
    next.style.transition = 'none';
    next.style.transform = `translate3d(0,${dir > 0 ? 100 : -100}%,0)`;
    next.style.zIndex = '3';
    from.style.zIndex = '2';
    void next.offsetHeight;
    next.style.transition = '';
    next.style.transform = '';
    next.classList.add('on');
    from.classList.remove('on');
    from.classList.add(dir > 0 ? 'out-up' : 'out-down');
    cur = to;
    paint();
    setTimeout(() => {
      from.style.transition = 'none';
      from.classList.remove('out-up', 'out-down');
      from.style.zIndex = '';
      void from.offsetHeight;
      from.style.transition = '';
      busy = false;
    }, 950);
  };
  // a page only scrolls inside itself when its content is taller than the screen
  const canScroll = (el, dy) => (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2);
  pages[0].classList.add('on');
  paint();
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });
  addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 12 || busy || performance.now() - lastNav < 900) return;
    if (canScroll(pages[cur], e.deltaY)) return;
    e.preventDefault();
    go(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  let touchY = null;
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) < 45 || canScroll(pages[cur], dy)) return;
    go(cur + (dy > 0 ? 1 : -1));
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
  });
  // every link opens its page with the slide, never by scrolling
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    go(id ? pageOf(id) : 0);
  });

  // courses: each one opens its own page with an Enquiry and a Register option
  const COURSES = {
    workshops: { title: 'Workshops', eyebrow: 'Learn by doing', copy: 'Ask about upcoming digital marketing workshops, from social media to ads and analytics.' },
    internships: { title: 'Internships', eyebrow: 'Gain experience', copy: 'Enquire about internship opportunities and the skills you would like to develop.' },
    courses: { title: 'Professional courses', eyebrow: 'Build your next skill', copy: 'Tell us what you want to learn and ask about professional course options.' },
    'skill-development': { title: 'Technical skill development', eyebrow: 'Grow with confidence', copy: 'Explore skill-building support shaped around your learning and career goals.' },
  };
  const cEnq = $('#enquire-form'), cReg = $('#register-form'), cfb = $('#cfb');
  const flash = (msg, ok) => { cfb.className = 'fb ' + (ok ? 'ok' : 'err'); cfb.textContent = msg; };
  const setMode = (m) => {
    $$('.seg-btn').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    cEnq.hidden = m !== 'enquire';
    cReg.hidden = m !== 'register';
    flash('', true);
    cfb.textContent = '';
  };
  $$('.seg-btn').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  const openCourse = (key) => {
    const c = COURSES[key];
    if (!c) return;
    $('#course-title').textContent = c.title;
    $('#course-eyebrow').textContent = c.eyebrow;
    $('#course-copy').textContent = c.copy;
    cEnq.elements.course.value = c.title;
    setMode('enquire');
    go(pages.findIndex((p) => p.id === 'course'));
  };
  $$('[data-course]').forEach((b) => b.addEventListener('click', () => openCourse(b.dataset.course)));
  const basics = (d) => {
    if (d.name.trim().length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address.';
    if (!/^[+()0-9. -]{7,30}$/.test(d.phone.trim())) return 'Please enter a valid phone number.';
    return '';
  };
  const hand = (text) => { const w = window.open(waLink(text), '_blank'); if (!w) return false; w.opener = null; return true; };
  const notify = (payload) => {
    if (NOTIFY_URL) fetch(NOTIFY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  };
  const blocked = 'Your browser blocked the WhatsApp window. Please allow pop-ups and try again.';
  cEnq.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cEnq));
    const err = basics(d) || (d.message.trim().length < 10 ? 'Please add a little more detail to your question.' : '');
    if (err) return flash(err, false);
    const text = `Course enquiry - Indhra Projects\n\nCourse: ${d.course}\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\n\n${d.message.trim()}`;
    if (!hand(text)) return flash(blocked, false);
    notify({ type: 'enquiry', ...d });
    cEnq.reset();
    cEnq.elements.course.value = d.course;
    flash('WhatsApp is open with your enquiry. Tap send there to reach the Indhra Projects team.', true);
  });
  cReg.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cReg));
    const err = basics(d) || (!d.level ? 'Please choose your current status.' : !d.batch ? 'Please choose a preferred batch.' : !d.mode ? 'Please choose online or in person.' : !d.workshop ? 'Please choose a digital marketing workshop.' : !d.consent ? 'Please tick the box to confirm we can contact you.' : '');
    if (err) return flash(err, false);
    const text = `New registration - Indhra Projects\n\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\nCity: ${(d.city || '-').trim()}\nStatus: ${d.level}\nPreferred batch: ${d.batch}\nMode: ${d.mode}\nWorkshop: ${d.workshop}`;
    if (!hand(text)) return flash(blocked, false);
    notify({ type: 'registration', ...d });
    cReg.reset();
    flash('Your registration is ready in WhatsApp. Tap send there to complete it.', true);
  });

  // live ticker: random codes and Japanese glyphs, looping forever
  const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const words = ['未来', '光', '宇宙', '星', '夢', '電子', '空', '風', '流れ', '響'];
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  const token = () => {
    const r = Math.random();
    if (r < 0.3) return { t: '0x' + Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0'), j: false };
    if (r < 0.5) return { t: Array.from({ length: 8 }, () => (Math.random() < 0.5 ? '0' : '1')).join(''), j: false };
    if (r < 0.65) return { t: ['fn()', '{ }', '=> ;', '::', 'if (x)', 'sys.run', 'px/py', '// ok'][Math.floor(Math.random() * 8)], j: false };
    if (r < 0.85) return { t: Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => pick(glyphs)).join(''), j: true };
    return { t: pick(words), j: true };
  };
  const items = Array.from({ length: 36 }, token).map((x) => `<span class="${x.j ? 'jp' : ''}">${x.t}</span>`).join('');
  $('#tickerTrack').innerHTML = items + items;
  $('#topTrack').innerHTML = Array.from({ length: 36 }, token).map((x) => `<span class="${x.j ? 'jp' : ''}">${x.t}</span>`).join('').repeat(2);

  // scroll reveal
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach((el) => io.observe(el));

  // 3D tilt on cards
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 9 + 'deg');
      el.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 9 + 'deg');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  // pointer parallax on the background scene
  if (!reduce) addEventListener('pointermove', (e) => {
    const root = document.documentElement.style;
    root.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
    root.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
  }, { passive: true });

  // enquiry buttons preselect the service
  const service = $('#service');
  $$('[data-service]').forEach((a) => a.addEventListener('click', () => { service.value = a.dataset.service; }));

  // enquiry form: validate, then open WhatsApp with the enquiry ready to send
  const form = $('#enquiry'), fb = $('#fb');
  const check = (d) => {
    if (d.name.trim().length < 2) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address.';
    if (!/^[+()0-9. -]{7,30}$/.test(d.phone.trim())) return 'Please enter a valid phone number.';
    if (!d.service) return 'Please select a service.';
    if (d.message.trim().length < 10) return 'Please add a little more detail to your message.';
    return '';
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const error = check(d);
    if (error) { fb.className = 'fb err'; fb.textContent = error; return; }
    const text = `Enquiry for Indhra Projects\n\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\nService: ${d.service}\n\n${d.message.trim()}`;
    const win = window.open(waLink(text), '_blank');
    if (!win) { fb.className = 'fb err'; fb.textContent = 'Your browser blocked the WhatsApp window. Please allow pop-ups, or use the WhatsApp button.'; return; }
    win.opener = null;
    fb.className = 'fb ok';
    fb.textContent = 'WhatsApp is open with your enquiry. Tap send there to reach the Indhra Projects team.';
    form.reset();
  });

  // background canvas: nebula haze
  const cv = $('#fx'), ctx = cv.getContext('2d');
  const sprite = (r, stops) => {
    const c = document.createElement('canvas');
    c.width = c.height = r * 2;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  };
  const hazeImg = sprite(128, [[0, 'rgba(190,160,255,.8)'], [0.45, 'rgba(150,120,255,.28)'], [1, 'rgba(120,100,255,0)']]);
  let W, H, clouds = [];
  const cloud = (any) => { const z = Math.random(); return { x: any ? rnd(0, W) : -rnd(200, 500), y: H * rnd(0.04, 0.55), z, w: rnd(260, 520) * (0.6 + z), v: rnd(6, 16) * (0.4 + z * 1.4) }; };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clouds = Array.from({ length: W < 700 ? 8 : 14 }, () => cloud(true));
  };
  addEventListener('resize', resize);
  resize();

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const c of clouds) {
      c.x += c.v * dt;
      if (c.x > W + 80) Object.assign(c, cloud(false));
      ctx.globalAlpha = 0.1 + c.z * 0.2;
      ctx.drawImage(hazeImg, c.x, c.y, c.w, c.w * 0.45);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (!reduce) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
