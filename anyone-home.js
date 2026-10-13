const ARTICLES = [
  {
    kicker: "AI & HYBRID LEASING",
    title: "The Truth About 100% Automated Leasing Assitants",
    body: "Fully automated assistants drop the thread the moment a prospect asks something specific — a fee, a pet policy, a Saturday tour that conflicts with a model unit. Anyone Home keeps the AI on the first response and hands the conversation to a person when the lead is ready. Operators using that hybrid path see about 40% more lease conversions than teams that leave prospects inside a closed bot.",
  },
  {
    kicker: "LEASING METRICS",
    title: "How Attribution Models Can Save Your Ad Spend",
    body: "Guest cards that credit only the last click hide the campaigns that actually started the search. Anyone Home records every touch on the same card, so marketing can see which sources produce tours and which ones only produce form fills. That is the difference between cutting a channel and funding the one that leases.",
  },
];

const toast = document.querySelector("[data-toast]");
const nav = document.querySelector("[data-nav]");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function setOpen(selector, open) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-menu-toggle]")) {
    const open = nav.classList.toggle("is-open");
    event.target.closest("[data-menu-toggle]").setAttribute("aria-expanded", String(open));
  }
  if (event.target.closest(".nav a")) nav.classList.remove("is-open");
  if (event.target.closest("[data-open-demo]")) setOpen("[data-demo]", true);
  if (event.target.closest("[data-close-demo]")) setOpen("[data-demo]", false);
  if (event.target.closest("[data-open-chat]")) document.querySelector("[data-chat]").hidden = false;
  if (event.target.closest("[data-close-chat]")) document.querySelector("[data-chat]").hidden = true;
  if (event.target.closest("[data-open-sample]")) {
    showToast("Sample call: a prospect books a Saturday tour in under a minute.");
  }
  if (event.target.closest("[data-close-article]")) setOpen("[data-article]", false);
  const articleBtn = event.target.closest("[data-open-article]");
  if (articleBtn) {
    const article = ARTICLES[Number(articleBtn.dataset.openArticle)];
    document.querySelector("[data-article-kicker]").textContent = article.kicker;
    document.querySelector("[data-article-title]").textContent = article.title;
    document.querySelector("[data-article-body]").textContent = article.body;
    setOpen("[data-article]", true);
  }
  const legal = event.target.closest("[data-legal]");
  if (legal) {
    event.preventDefault();
    showToast(`${legal.dataset.legal} will open on the Anyone Home site.`);
  }
});

const demoForm = document.querySelector("[data-demo-form]");
if (demoForm) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setOpen("[data-demo]", false);
    showToast("Demo request received. We’ll be in touch.");
    event.target.reset();
  });
}

const subscribeForm = document.querySelector("[data-subscribe]");
if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("You’re subscribed to Anyone Home insights.");
    event.target.reset();
  });
}

const chatForm = document.querySelector("[data-chat-form]");
if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.target.message;
  const log = document.querySelector("[data-chat-log]");
  const mine = document.createElement("p");
  mine.className = "chat-line mine";
  mine.textContent = input.value;
  log.appendChild(mine);
  const reply = document.createElement("p");
  reply.className = "chat-line";
  reply.textContent = "Yes — a 2-bedroom overlooking the courtyard is open. I can book Saturday at 11:00 AM.";
  log.appendChild(reply);
  input.value = "";
  log.scrollTop = log.scrollHeight;
  });
}

const analytics = document.querySelector(".analytics");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  if (el.dataset.counted === "true") return;
  el.dataset.counted = "true";
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const duration = 1200;

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function playAnalytics() {
  if (!analytics) return;
  analytics.classList.add("is-in");
  if (reduceMotion) return;
  analytics.querySelectorAll("[data-count]").forEach(animateCount);
}

function typeInto(parent, text, indexRef) {
  text.split(" ").forEach((word) => {
    if (!word) return;
    const wordEl = document.createElement("span");
    wordEl.className = "type-word";
    [...word].forEach((char) => {
      const span = document.createElement("span");
      span.className = "type-char";
      span.textContent = char;
      span.style.animationDelay = `${indexRef.i * 38}ms`;
      wordEl.appendChild(span);
      indexRef.i += 1;
    });
    parent.appendChild(wordEl);
    indexRef.i += 1;
  });
}

function typeTitle(el) {
  if (el.dataset.typed === "true" || reduceMotion) return;
  el.dataset.typed = "true";
  const lines = [...el.querySelectorAll(":scope > .type-line")].map((line) => line.textContent.trim()).filter(Boolean);
  const full = lines.length ? lines.join(" ") : el.textContent.trim();
  el.setAttribute("aria-label", full);
  el.replaceChildren();
  el.classList.add("is-typing");
  const indexRef = { i: 0 };
  if (lines.length) {
    lines.forEach((line, lineIndex) => {
      if (lineIndex) el.appendChild(document.createElement("br"));
      typeInto(el, line, indexRef);
    });
  } else {
    typeInto(el, full, indexRef);
  }
  window.setTimeout(() => el.classList.remove("is-typing"), full.length * 38 + 500);
}

const revealTargets = [
  ...document.querySelectorAll(
    ".hero-copy, .hero-visual, .section-head, .card, .story-card, .lease-copy, .ecosystem, .stat-stack div, .finale > *, .split, .browser, .journey-panel, .crm, .chat-copy, .chat-panel, .closing > *, .refrain"
  ),
];

revealTargets.forEach((el) => {
  el.classList.add("reveal");
  const order = [...el.parentElement.children].indexOf(el);
  if (
    el.classList.contains("card") ||
    el.parentElement.classList.contains("stat-stack") ||
    el.parentElement.classList.contains("finale") ||
    el.parentElement.classList.contains("closing")
  ) {
    el.style.transitionDelay = `${Math.min(order, 4) * 90}ms`;
  }
});

function markVisible(el, visible) {
  el.classList.toggle("is-visible", visible);
  if (!visible) return;
  if (el.matches(".label, h1, .display, .finale h2")) typeTitle(el);
  el.querySelectorAll(".label, h1, .display").forEach(typeTitle);
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  playAnalytics();
  document.querySelectorAll("[data-count]").forEach((el) => {
    el.dataset.counted = "true";
  });
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => markVisible(entry.target, entry.isIntersecting));
    },
    { threshold: 0.22 }
  );
  revealTargets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) markVisible(el, true);
    revealObserver.observe(el);
  });

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === analytics) playAnalytics();
        else animateCount(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  if (analytics) countObserver.observe(analytics);
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (!analytics || !analytics.contains(el)) countObserver.observe(el);
  });

  const storyVideo = document.querySelector(".story-video");
  const photoPan = document.querySelector(".photo-pan");
  const heroVisual = document.querySelector(".hero-visual");
  let parallaxFrame = 0;

  function updateParallax() {
    parallaxFrame = 0;
    if (storyVideo) {
      const rect = storyVideo.parentElement.getBoundingClientRect();
      const shift = (rect.top - window.innerHeight * 0.4) * -0.08;
      storyVideo.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
    }
    if (photoPan) {
      const rect = photoPan.parentElement.getBoundingClientRect();
      const shift = (rect.top - window.innerHeight * 0.4) * -0.06;
      photoPan.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
    }
    if (heroVisual) {
      heroVisual.style.setProperty("--parallax", `${window.scrollY * 0.05}px`);
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (parallaxFrame) return;
      parallaxFrame = window.requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
  updateParallax();
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  setOpen("[data-demo]", false);
  setOpen("[data-article]", false);
  const chat = document.querySelector("[data-chat]");
  if (chat) chat.hidden = true;
});
