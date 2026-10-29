import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import './styles.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
let previousFocus = null;
let menuTimer = null;

function setMenu(open) {
  window.clearTimeout(menuTimer);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', open);

  if (open) {
    mobileNav.hidden = false;
    requestAnimationFrame(() => mobileNav.classList.add('is-open'));
    previousFocus = document.activeElement;
    mobileNav.querySelector('a')?.focus();
  } else {
    mobileNav.classList.remove('is-open');
    menuTimer = window.setTimeout(() => { mobileNav.hidden = true; }, 240);
    if (previousFocus === menuToggle) menuToggle.focus();
  }
}

menuToggle.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false);
  if (event.key !== 'Tab' || mobileNav.hidden) return;

  const focusable = [...mobileNav.querySelectorAll('a'), menuToggle];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const progress = document.querySelector('#page-progress');
const header = document.querySelector('#site-header');
const hero = document.querySelector('.hero');
const sections = [...document.querySelectorAll('main section[id]')];
const desktopLinks = [...document.querySelectorAll('.desktop-nav a')];
let scrollTicking = false;

function syncActiveNavigation() {
  const marker = window.scrollY + header.offsetHeight + 120;
  const activeSection = sections.reduce((current, section) => (
    section.offsetTop <= marker ? section : current
  ), null);

  desktopLinks.forEach((link) => {
    const active = Boolean(activeSection && link.hash === `#${activeSection.id}`);
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  header.classList.toggle('is-scrolled', window.scrollY > 24);

  if (!reducedMotion.matches && window.innerWidth > 620) {
    hero.style.setProperty('--hero-shift', `${Math.min(18, window.scrollY * .022)}px`);
  } else {
    hero.style.setProperty('--hero-shift', '0px');
  }
  syncActiveNavigation();
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollEffects);
}, { passive: true });
updateScrollEffects();

requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

const revealItems = document.querySelectorAll('.reveal');
const initialHashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
if (reducedMotion.matches || !('IntersectionObserver' in window) || initialHashTarget) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));

  // Essential content must never remain hidden if an embedded preview or
  // background tab pauses its observer.
  window.setTimeout(() => {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) item.classList.add('is-visible');
    });
  }, 700);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.hash);
    target?.classList.add('is-visible');
    target?.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  });
});
syncActiveNavigation();

const services = {
  gtm: {
    kicker: 'Web3 Go-to-Market & Growth Strategy',
    title: 'Build the path before buying attention.',
    description: 'Positioning, audience definition, launch priorities, channel mix, and measurement form a clear plan for growth.',
    image: '/src/assets/experience/strategy-nyc.webp',
    alt: 'Black-and-white New York skyline representing strategic market entry',
  },
  pr: {
    kicker: 'Crypto PR & Creator Marketing',
    title: 'Give the story a reason to travel.',
    description: 'Narrative development, media outreach, creator coordination, content, and reporting designed for relevant audiences.',
    image: '/src/assets/experience/web3tv-interview.webp',
    alt: 'Web3TV interview with Anna Alumbaiva',
  },
  community: {
    kicker: 'Community & Social Growth',
    title: 'Turn an audience into participation.',
    description: 'Community operations, social content, ambassador programs, and participation-led campaigns that create reasons to return.',
    image: '/src/assets/experience/superteam-community.webp',
    alt: 'Web3 community event with Superteam',
  },
  ecosystem: {
    kicker: 'Ecosystem & Campaign Activation',
    title: 'Coordinate the moment that matters.',
    description: 'Launch, education, partnership, developer, ecosystem, and onboarding initiatives aligned around one measurable objective.',
    image: '/src/assets/experience/bloomberg-panel.webp',
    alt: 'Web3 investment roundtable at Bloomberg in Hong Kong',
  },
};

Object.values(services).forEach(({ image }) => {
  const preload = new Image();
  preload.src = image;
});

const serviceTabs = document.querySelectorAll('.service-tab');
const serviceKicker = document.querySelector('#service-kicker');
const serviceTitle = document.querySelector('#service-title');
const serviceDescription = document.querySelector('#service-description');
const serviceImage = document.querySelector('#service-image');
const servicePanel = document.querySelector('#service-panel');

function activateService(tab, { focus = false } = {}) {
    const service = services[tab.dataset.service];
    serviceTabs.forEach((item) => {
      item.classList.toggle('is-active', item === tab);
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
      item.querySelector('.service-action').textContent = item === tab ? 'Active' : 'View';
    });
    servicePanel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();

    const applyContent = () => {
      serviceKicker.textContent = service.kicker;
      serviceTitle.textContent = service.title;
      serviceDescription.textContent = service.description;
      serviceImage.src = service.image;
      serviceImage.alt = service.alt;
    };

    if (reducedMotion.matches) {
      applyContent();
      return;
    }

    servicePanel.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: .35, transform: 'translateY(8px)', offset: .42 },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 440, easing: 'cubic-bezier(.16,1,.3,1)' });
    window.setTimeout(applyContent, 150);
}

serviceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateService(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % serviceTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + serviceTabs.length) % serviceTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = serviceTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateService(serviceTabs[nextIndex], { focus: true });
  });
});

document.querySelectorAll('.service-mobile details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.service-mobile details').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const processItems = [...document.querySelectorAll('.process li')];
const processList = document.querySelector('.process');
if (processList && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const processObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    processItems.forEach((item, index) => {
      window.setTimeout(() => {
        processItems.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex <= index));
      }, index * 150);
    });
  }, { threshold: .35 });
  processObserver.observe(processList);
}

document.querySelectorAll('.case-feature video').forEach((video) => {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    video.pause();
    return;
  }

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: .15 });
  videoObserver.observe(video);
});

const interest = document.querySelector('#interest');
const selectionStatus = document.querySelector('#selection-status');
document.querySelectorAll('.engagement-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.engagement-card').forEach((item) => {
      const selected = item === card;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
      item.querySelector('.card-action').textContent = selected ? 'Selected' : 'Select';
    });
    interest.value = card.dataset.interest;
    selectionStatus.textContent = `${card.querySelector('strong').textContent} selected for your enquiry.`;
  });
});

const form = document.querySelector('#enquiry-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    status.textContent = 'Please complete the required fields.';
    return;
  }
  status.textContent = 'Preview confirmed. Your information remains in this browser and was not transmitted.';
  form.querySelector('button[type="submit"]').textContent = 'Brief checked — not sent';
});

function setupCanvas(canvas, draw, { animate = false } = {}) {
  if (!canvas) return;
  let progressValue = animate && !reducedMotion.matches ? 0 : 1;

  const render = (progressAmount = progressValue) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    draw(context, rect.width, rect.height, progressAmount);
  };

  render();
  const resizeObserver = new ResizeObserver(() => render());
  resizeObserver.observe(canvas);

  if (animate && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        progressValue = Math.min(1, (now - start) / 1100);
        render(progressValue);
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .16 });
    observer.observe(canvas);
  }
}

function drawHeroSignal(context, width, height, progressAmount = 1) {
  const compact = width < 620;
  const points = compact
    ? [[width * .72, height * .78], [width * .82, height * .62], [width * .86, height * .43], [width * .89, height * .25]]
    : [[width * .58, height * .36], [width * .69, height * .56], [width * .81, height * .62], [width * .92, height * .30]];

  context.strokeStyle = '#ff5a50';
  context.lineWidth = 2.5;
  context.shadowColor = '#ff5a50';
  context.shadowBlur = 10;
  context.beginPath();
  context.moveTo(...points[0]);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpoint = (previous[0] + current[0]) / 2;
    context.bezierCurveTo(midpoint, previous[1], midpoint, current[1], current[0], current[1]);
  }
  const pathLength = width * 1.35;
  context.setLineDash([pathLength, pathLength]);
  context.lineDashOffset = pathLength * (1 - progressAmount);
  context.stroke();
  context.setLineDash([]);

  const labels = ['Attention', 'Relevance', 'Participation', 'Adoption'];
  context.font = `600 ${compact ? 10 : 12}px Manrope, sans-serif`;
  points.forEach(([x, y], index) => {
    const nodeStart = index / (points.length + .6);
    const nodeOpacity = Math.max(0, Math.min(1, (progressAmount - nodeStart) * 5));
    if (nodeOpacity <= 0) return;
    context.globalAlpha = nodeOpacity;
    context.fillStyle = '#ff5a50';
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    if (!compact || index === labels.length - 1) {
      context.fillStyle = '#fffdf8';
      context.fillText(labels[index], Math.min(x + 10, width - 84), y - 10);
    }
  });
  context.globalAlpha = 1;
}

function drawNoise(context, width, height) {
  const points = [[.1,.58],[.18,.3],[.25,.72],[.34,.42],[.44,.2],[.5,.66],[.6,.34],[.69,.76],[.78,.24],[.88,.54]];
  context.strokeStyle = '#9ba09d';
  context.globalAlpha = .42;
  context.lineWidth = 1;
  points.forEach((point, index) => {
    points.slice(index + 1).forEach((other, offset) => {
      if ((index + offset) % 3 !== 0) return;
      context.beginPath();
      context.moveTo(point[0] * width, point[1] * height);
      context.lineTo(other[0] * width, other[1] * height);
      context.stroke();
    });
  });
  context.globalAlpha = 1;
  points.forEach(([x, y]) => {
    context.fillStyle = '#6f787a';
    context.beginPath();
    context.arc(x * width, y * height, 4, 0, Math.PI * 2);
    context.fill();
  });
}

function drawAdoption(context, width, height) {
  const points = [[.08,.77],[.28,.68],[.49,.55],[.69,.38],[.9,.16]];
  context.strokeStyle = '#ff5a50';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(points[0][0] * width, points[0][1] * height);
  points.slice(1).forEach(([x, y]) => context.lineTo(x * width, y * height));
  context.stroke();
  points.forEach(([x, y], index) => {
    context.fillStyle = '#ff5a50';
    context.beginPath();
    context.arc(x * width, y * height, index === points.length - 1 ? 7 : 4, 0, Math.PI * 2);
    context.fill();
  });
}

function drawCtaSignal(context, width, height, progressAmount = 1) {
  const points = [[width * .54, height * .72],[width * .64, height * .57],[width * .75, height * .64],[width * .88, height * .31]];
  context.strokeStyle = '#ff5a50';
  context.lineWidth = 2.5;
  context.shadowColor = '#ff5a50';
  context.shadowBlur = 9;
  context.beginPath();
  context.moveTo(...points[0]);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpoint = (previous[0] + current[0]) / 2;
    context.bezierCurveTo(midpoint, previous[1], midpoint, current[1], current[0], current[1]);
  }
  const pathLength = width;
  context.setLineDash([pathLength, pathLength]);
  context.lineDashOffset = pathLength * (1 - progressAmount);
  context.stroke();
  context.setLineDash([]);
  context.shadowBlur = 0;
  if (progressAmount > .82) {
    context.fillStyle = '#ff5a50';
    context.beginPath();
    context.arc(points.at(-1)[0], points.at(-1)[1], 6, 0, Math.PI * 2);
    context.fill();
  }
}

setupCanvas(document.querySelector('#hero-signal'), drawHeroSignal, { animate: true });
setupCanvas(document.querySelector('#noise-canvas'), drawNoise);
setupCanvas(document.querySelector('#adoption-canvas'), drawAdoption);
setupCanvas(document.querySelector('#cta-signal'), drawCtaSignal, { animate: true });
