const POSTS = [
  {
    title: "Lorem Ipsum Sit Dolor",
    excerpt: "Donec id enim pellentesque, porta sapien eu, maximus lectus. Maecenas porta.",
    image:
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1400&q=80",
    body: "A closer look at how multifamily marketers can turn everyday content into demand. From resident stories to amenity photography, the brands that win are the ones that publish with intention — and keep testing what actually converts.",
  },
  {
    title: "Donec Id Enim Sapien",
    excerpt:
      "Morbi ac pellentesque, porta velit pulvinar ante. Integer vitae nulla id lectus maximus vehicula. Fusce facilisis lectus.",
    image:
      "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1400&q=80",
    body: "Interactive shopping tools, floor plans, and unit-level availability only work when the experience feels effortless. We break down the UX patterns that help renters choose faster — without adding friction to your leasing team.",
  },
  {
    title: "Integer Vitae Mauris",
    excerpt:
      "Donec id enim pellentesque, porta sapien eu, maximus lectus. Maecenas porta venenatis sagittis lectus.",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&q=80",
    body: "Savvy operators treat their website like a leasing teammate. Here’s how design, copy, and conversion work together when the goal is more qualified tours — not just more traffic.",
  },
  {
    title: "Lectus Maecenas Porta",
    excerpt:
      "Morbi ac pellentesque id lectus maximus ante. Integer vitae nulla id lectus maximus vehicula.",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
    body: "Behind every high-performing property site is a content engine: photography, video, and a CMS that marketing can actually use. We share a production checklist teams can run before the next campaign launch.",
  },
  {
    title: "Vitae Mauris Sed",
    excerpt:
      "Donec id enim pellentesque, porta sapien eu, maximus lectus. Maecenas porta velit auctor elit maximus sed.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80",
    body: "Great visuals are not decoration — they are the product. See how cinematic stills, 3D tours, and lifestyle photography change dwell time and inquiry quality across a portfolio.",
  },
  {
    title: "Lorem Ipsum Sit Dolor",
    excerpt: "Integer vitae nulla id lectus maximus ante. Integer vitae nulla id lectus maximus.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80",
    body: "Amenity storytelling still wins, but only when it is specific. We look at pool, coworking, and wellness pages that feel like a place — and the ones that feel like a brochure.",
  },
  {
    title: "Built to Convert, Built to Lease",
    excerpt: "A field guide to property websites that help prospects find a home faster.",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7afb15f?auto=format&fit=crop&w=1400&q=80",
    body: "Templates are a starting point. The sites that lease have opinionated information architecture, clear CTAs, and a shopping flow that mirrors how renters actually decide.",
  },
  {
    title: "Designing With Heart",
    excerpt: "Why partnership, not just pixels, is the difference in multifamily web.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    body: "Razz teams ship with operators, not around them. This piece covers discovery, launch, and the feedback loops that keep a site useful after the confetti settles.",
  },
  {
    title: "The Map Is the Product",
    excerpt: "Interactive site maps and unit-level experiences that help renters take action.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    body: "When availability, pricing, and floor plans live in one visual, renters stop bouncing. Here’s how to keep that experience fast, honest, and on-brand.",
  },
];

const grid = document.querySelector("[data-posts-grid]");
const loadMoreBtn = document.querySelector("[data-load-more]");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toast = document.querySelector("[data-toast]");

let visible = 6;

function cardTemplate(post, index) {
  const card = document.createElement("article");
  card.className = "post-card";
  card.innerHTML = `
    <button class="post-media" type="button" data-open-article="${index}" aria-label="Read ${post.title}">
      <img src="${post.image}" alt="${post.title}" />
    </button>
    <h3>${post.title}</h3>
    <p>${post.excerpt}</p>
    <button class="read-more" type="button" data-open-article="${index}">Read More</button>
  `;
  return card;
}

function renderPosts(animateNew = false) {
  const next = POSTS.slice(0, visible);
  const existing = grid.children.length;
  next.slice(existing).forEach((post, i) => {
    const card = cardTemplate(post, existing + i);
    grid.appendChild(card);
  });
  loadMoreBtn.hidden = visible >= POSTS.length;
  revealCards(animateNew ? existing : 0);
}

function revealCards(from = 0) {
  const cards = [...grid.querySelectorAll(".post-card")].slice(from);
  if (!window.gsap) {
    cards.forEach((card) => {
      card.style.opacity = "1";
      card.style.transform = "none";
    });
    return;
  }
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
  });
}

function openArticle(index) {
  const post = POSTS[index];
  const article = document.querySelector("[data-article]");
  article.querySelector("[data-article-image]").src = post.image;
  article.querySelector("[data-article-title]").textContent = post.title;
  article.querySelector("[data-article-body]").textContent = post.body;
  article.hidden = false;
  document.body.style.overflow = "hidden";
  if (window.gsap) {
    gsap.fromTo(".article-sheet", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
  }
}

function closeArticle() {
  document.querySelector("[data-article]").hidden = true;
  document.body.style.overflow = "";
}

function setConnect(open) {
  const modal = document.querySelector("[data-connect-modal]");
  modal.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open && window.gsap) {
    gsap.fromTo(".modal-card", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function intro() {
  if (!window.gsap) {
    document.querySelector(".page-veil").style.display = "none";
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const tl = gsap.timeline();
  tl.to(".page-veil", { opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.15 }).set(".page-veil", {
    display: "none",
  });
  tl.from(".site-header", { y: -24, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.2);
  tl.from(".hero h1 .line span", { yPercent: 110, duration: 0.9, stagger: 0.12, ease: "power4.out" }, 0.28);
  tl.from(".hero-cta", { y: 16, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.7);

  gsap.from(".site-footer .footer-cta", {
    scrollTrigger: { trigger: ".site-footer", start: "top 80%" },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  });
}

document.addEventListener("click", (event) => {
  const articleBtn = event.target.closest("[data-open-article]");
  if (articleBtn) openArticle(Number(articleBtn.dataset.openArticle));
  if (event.target.closest("[data-close-article]")) closeArticle();
  if (event.target.closest("[data-open-connect]")) setConnect(true);
  if (event.target.closest("[data-close-connect]")) setConnect(false);
  if (event.target.closest("[data-menu-toggle]")) nav.classList.toggle("is-open");
  if (event.target.closest("[data-chat-toggle]")) {
    const panel = document.querySelector("[data-chat-panel]");
    panel.hidden = !panel.hidden;
  }
  if (event.target.closest("[data-load-more]")) {
    visible = Math.min(visible + 3, POSTS.length);
    renderPosts(true);
  }
});

document.querySelector("[data-connect-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  setConnect(false);
  showToast("Thanks — we’ll be in touch shortly.");
  event.target.reset();
});

document.querySelector("[data-chat-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.target.message;
  const log = document.querySelector("[data-chat-log]");
  const mine = document.createElement("p");
  mine.className = "chat-bubble mine";
  mine.textContent = input.value;
  log.appendChild(mine);
  input.value = "";
  window.setTimeout(() => {
    const reply = document.createElement("p");
    reply.className = "chat-bubble";
    reply.textContent = "Got it. A specialist will follow up — or book a demo from Connect.";
    log.appendChild(reply);
    log.scrollTop = log.scrollHeight;
  }, 500);
});

document.querySelectorAll(".nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    nav.classList.remove("is-open");
    showToast("That page lives elsewhere in the Razz site — you’re on Blog.");
  });
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
});

renderPosts();
intro();
