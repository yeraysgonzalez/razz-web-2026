const live = document.querySelector("#live");
const pagePicker = document.querySelector("#page-picker");
const pageMenu = document.querySelector("#page-menu");
const pageName = document.querySelector("#page-name");
const pageSearch = document.querySelector("#page-search");
const pageFilterTrigger = document.querySelector("#page-filter-trigger");
const pageFilterPanel = document.querySelector("#page-filter-panel");
const pageMenuEmpty = document.querySelector("#page-menu-empty");
const iframe = document.querySelector("#live-page");
const viewport = document.querySelector("#viewport-frame");
const fallback = document.querySelector("#iframe-fallback");
const sectionsTrigger = document.querySelector("#sections-trigger");
const sectionsPanel = document.querySelector("#sections-panel");
const sectionsValue = document.querySelector("#sections-value");
const publishedStatus = document.querySelector("#published-status");
const tooltip = document.querySelector("#sp-tooltip");
const colorsBtn = document.querySelector("#btn-colors");
const colorsPanel = document.querySelector("#colors-panel");
const ctaBtn = document.querySelector("#btn-cta");
const ctaPanel = document.querySelector("#cta-panel");
const radiusBtn = document.querySelector("#btn-radius");
const locationBtn = document.querySelector("#btn-location");
const animationsBtn = document.querySelector("#btn-animations");
const radiusPanel = document.querySelector("#radius-panel");
const locationPanel = document.querySelector("#location-panel");
const animationsPanel = document.querySelector("#animations-panel");
const optionsTrigger = document.querySelector("#options-trigger");
const optionsPanel = document.querySelector("#options-panel");
const optionsClose = document.querySelector("#options-close");
const optionsDragHandle = document.querySelector("#options-drag-handle");
const pagesTrigger = document.querySelector("#pages-trigger");
const pagesFlyout = document.querySelector("#pages-flyout");
const pagesClose = document.querySelector("#pages-close");
const pagesSearch = document.querySelector("#pages-search");
const OPTIONS_PANEL_WIDTH = 320;
const OPTIONS_PANEL_HEIGHT = 500;
const pageAnimationValue = document.querySelector("#page-animation-value");
const radiusAll = document.querySelector("#radius-all");
const radiusIndividualBtn = document.querySelector("#radius-individual");
const radiusIndividualPanel = document.querySelector("#radius-individual-panel");
const radiusCornerInputs = {
  tl: document.querySelector("#radius-tl"),
  tr: document.querySelector("#radius-tr"),
  bl: document.querySelector("#radius-bl"),
  br: document.querySelector("#radius-br"),
};
const toolButtons = [colorsBtn, ctaBtn, radiusBtn, locationBtn, animationsBtn];
const toolPanels = [colorsPanel, ctaPanel, radiusPanel, locationPanel, animationsPanel];

const LIVE_PATH = "/properties/meadow-view-lodge";
const LIVE_ORIGIN = "https://spring-brook.vercel.app";
const LIVE_REMOTE = `${LIVE_ORIGIN}/properties/meadow-view-lodge`;
const TOOLTIP_SELECTOR = ".sp-tool-btn[data-tooltip], #building-tools [data-tooltip], #sitemap-tools [data-tooltip], #model-tools [data-tooltip], #unit-tools [data-tooltip]";

/** Same-origin cached previews (theme bridge) for static hosts like GitHub Pages. */
const STATIC_PREVIEW_BY_PATH = {
  "/properties/meadow-view-lodge": "preview/meadow-view-lodge.html",
};
/** Bump when preview bridge / CTA CSS changes so GitHub Pages clients skip stale HTML. */
const PREVIEW_CACHE_BUST = "13";

/** Local static-pages-server.py proxies /properties/* same-origin; GitHub Pages cannot. */
function usesLocalPreviewProxy() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function staticPreviewSrc(path) {
  const clean = path?.startsWith("/") ? path : `/${path || LIVE_PATH}`;
  const relative = STATIC_PREVIEW_BY_PATH[clean];
  if (!relative) return null;
  try {
    const url = new URL(relative, window.location.href);
    url.searchParams.set("v", PREVIEW_CACHE_BUST);
    return url.href;
  } catch {
    return `${relative}?v=${PREVIEW_CACHE_BUST}`;
  }
}

const pageColors = {
  background: { name: "Light", hex: "#f5f6f0" },
  accent1: { name: "Primary", hex: "#00669e" },
  accent2: { name: "Accent 2", hex: "#e2e3dd" },
  floor: { name: "Primary", hex: "#74926a" },
  bed1: { name: "1 Bedroom", hex: "#6cbc44" },
  bed2: { name: "2 Bedrooms", hex: "#3b776f" },
  bed3: { name: "3 Bedrooms", hex: "#de7030" },
  dot: { name: "Dot color", hex: "#6cbc44" },
};

/** Button Styles panel → preview CTAs (Reserve checkout; Share/Save header). */
const buttonStyles = {
  reserve: "primary",
  share: "secondary",
};

const COLOR_PICKER_HEXES = new Set([
  "#94abf9",
  "#f598ff",
  "#e5e9fd",
  "#000000",
  "#ffffff",
]);

const FLOOR_COLOR_HEXES = new Set(["#74926a", "#00324d", "#717c81", "#ffffff", "#262626"]);

const pageFx = {
  radius: { tl: 20, tr: 20, bl: 20, br: 20 },
  radiusLinked: true,
  mapStyle: "map",
  animation: "fade",
  speed: "normal",
};

const SECTION_KEYS = [
  "header",
  "gallery",
  "highlights",
  "about",
  "bedrooms",
  "amenities",
  "availability",
  "reviews",
  "location",
  "policies",
  "faq",
];

const sectionVisibility = Object.fromEntries(SECTION_KEYS.map((key) => [key, true]));

function announce(message) {
  if (live) live.textContent = message;
}

/** Local proxy keeps the live embed. GitHub Pages shows a screenshot instead. */
function hostedCanvasSrc(liveSrc, previewPath) {
  if (usesLocalPreviewProxy()) return liveSrc;
  try {
    const url = new URL(previewPath, window.location.href);
    url.searchParams.set("v", PREVIEW_CACHE_BUST);
    return url.href;
  } catch {
    return `${previewPath}?v=${PREVIEW_CACHE_BUST}`;
  }
}

function previewSrc(path, absoluteUrl) {
  const clean = path?.startsWith("/") ? path : `/${path || LIVE_PATH}`;
  // Local proxy: real path so Next.js /_next assets resolve on the same origin.
  if (usesLocalPreviewProxy()) return clean;
  // GitHub Pages / static hosts: same-origin cached HTML with theme bridge when available.
  const cached = staticPreviewSrc(clean);
  if (cached) return cached;
  // Fallback: live remote (cross-origin — colors won't apply without the bridge).
  if (absoluteUrl) return absoluteUrl;
  try {
    return new URL(clean, LIVE_ORIGIN).href;
  } catch {
    return LIVE_REMOTE;
  }
}

function isGithubPagesNotFoundDoc(doc) {
  if (!doc) return false;
  const title = doc.title || "";
  const text = doc.body?.innerText || "";
  return (
    /GitHub Pages/i.test(title) &&
    (/There isn't a GitHub Pages site here/i.test(text) || /\b404\b/.test(text))
  );
}

/** Plain http.server / missing proxy HTML (e.g. port without static-pages-server.py). */
function isProxyMissingDoc(doc) {
  if (!doc) return false;
  const title = doc.title || "";
  const text = doc.body?.innerText || "";
  return (
    /Error response/i.test(title) &&
    (/File not found/i.test(text) || /Nothing matches the given URI/i.test(text) || /\b404\b/.test(text))
  );
}

function isBrokenPreviewDoc(doc) {
  return isGithubPagesNotFoundDoc(doc) || isProxyMissingDoc(doc);
}

let usedStaticPreviewFallback = false;

function loadStaticPreviewFallback() {
  const cached = staticPreviewSrc(iframe.dataset.remotePath || LIVE_PATH);
  if (!cached || usedStaticPreviewFallback) return false;
  usedStaticPreviewFallback = true;
  iframe.src = cached;
  return true;
}

function showPreviewFallback(message) {
  if (!fallback) return;
  fallback.hidden = false;
  fallback.setAttribute("aria-hidden", "false");
  const copy = fallback.querySelector("p");
  if (copy && message) copy.textContent = message;
}

function hidePreviewFallback() {
  if (!fallback) return;
  fallback.hidden = true;
  fallback.setAttribute("aria-hidden", "true");
}

function luminance(hex) {
  const raw = String(hex || "").replace("#", "").trim();
  if (raw.length !== 3 && raw.length !== 6) return 1;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const toLin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function closeFieldMenus(exceptMenu) {
  document.querySelectorAll(".sp-tool-panel .field-menu, .sp-cta-style-menu").forEach((menu) => {
    if (menu === exceptMenu) return;
    menu.hidden = true;
  });
  document
    .querySelectorAll(".sp-tool-panel .field-trigger, .sp-cta-style-trigger")
    .forEach((trigger) => {
      const menuId = trigger.getAttribute("aria-controls") || trigger.id.replace("-trigger", "-menu");
      const menu = document.querySelector(`#${menuId}`);
      if (menu && menu === exceptMenu) return;
      trigger.setAttribute("aria-expanded", "false");
    });
}

function closeCustomColorPanels() {
  document.querySelectorAll(".sp-custom-color-panel").forEach((panel) => {
    panel.hidden = true;
  });
}

function closeColorMenus() {
  closeCustomColorPanels();
  document.querySelectorAll(".sp-color-menu").forEach((menu) => {
    menu.hidden = true;
  });
  document.querySelectorAll(".sp-color-chip.color-trigger").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".sp-color-field").forEach((field) => {
    field.classList.remove("is-active");
  });
}

/** True when the event target is inside an open Page Colors nested picker UI. */
function isInsideColorPicker(target) {
  const el = target instanceof Element ? target : target?.parentElement;
  if (!el) return false;
  return Boolean(
    el.closest(".sp-color-menu") ||
      el.closest(".sp-custom-color-panel") ||
      el.closest(".sp-color-chip.color-trigger")
  );
}

function closeOptionsPanel() {
  if (!optionsPanel) return;
  optionsPanel.hidden = true;
  optionsPanel.classList.remove("is-dragging");
  optionsTrigger?.setAttribute("aria-expanded", "false");
  document.querySelector("#bld-options-trigger")?.setAttribute("aria-expanded", "false");
  document.querySelector("#smap-options-trigger")?.setAttribute("aria-expanded", "false");
  document.querySelector("#mdl-options-trigger")?.setAttribute("aria-expanded", "false");
  document.querySelector("#unt-options-trigger")?.setAttribute("aria-expanded", "false");
}

function syncOptionsContent() {
  const unit = document.body.classList.contains("is-unit");
  const standard = document.querySelector("#options-default-body");
  const unitBody = document.querySelector("#options-unit-body");
  if (standard) standard.hidden = unit;
  if (unitBody) unitBody.hidden = !unit;
}

function setPagesRailActive(active) {
  if (!pagesTrigger) return;
  pagesTrigger.classList.toggle("is-active", active);
  pagesTrigger.setAttribute("aria-pressed", String(active));
  pagesTrigger.setAttribute("aria-expanded", String(active));
  if (active) {
    document.querySelectorAll(".sp-rail-btn").forEach((item) => {
      if (item === pagesTrigger) return;
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
  }
}

function closePagesFlyout() {
  if (!pagesFlyout) return;
  closePageSettings();
  pagesFlyout.hidden = true;
  setPagesRailActive(false);
}

function setPagesSectionExpanded(section, expanded) {
  if (!section) return;
  section.classList.toggle("is-collapsed", !expanded);
  const toggle = section.querySelector(".sp-pages-section-toggle");
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", String(expanded));
  const label = section.querySelector(".sp-pages-section-title")?.textContent || "section";
  toggle.setAttribute("aria-label", `${expanded ? "Collapse" : "Expand"} ${label}`);
}

function currentPagesCategory() {
  const active = pageMenu?.querySelector(".sp-page-entries [role='option'][aria-selected='true']");
  const category = active?.closest(".sp-page-group")?.dataset.category;
  if (category) return category;
  return pagesFlyout?.querySelector(".sp-pages-item.is-selected")?.closest(".sp-pages-section")?.dataset.pagesSection || "";
}

function syncPagesSectionVisibility() {
  if (!pagesFlyout) return;
  const query = pagesSearch?.value.trim().toLowerCase() || "";
  if (!query) {
    const category = currentPagesCategory();
    pagesFlyout.querySelectorAll(".sp-pages-section").forEach((section) => {
      setPagesSectionExpanded(section, !category || section.dataset.pagesSection === category);
    });
    return;
  }
  pagesFlyout.querySelectorAll(".sp-pages-section").forEach((section) => {
    const hasMatch = [...section.querySelectorAll(".sp-pages-item")].some((item) => {
      const row = item.closest("li");
      return row ? !row.hidden : !item.hidden;
    });
    setPagesSectionExpanded(section, hasMatch);
  });
}

function openPagesFlyout() {
  if (!pagesFlyout) return;
  closeOptionsPanel();
  closeMenus({ keepPages: true });
  syncPagesSectionVisibility();
  pagesFlyout.hidden = false;
  setPagesRailActive(true);
  pagesSearch?.focus();
  const selected = pagesFlyout.querySelector(".sp-pages-item.is-selected");
  const section = selected?.closest(".sp-pages-section");
  if (selected && section && !section.classList.contains("is-collapsed")) {
    selected.scrollIntoView({ block: "nearest" });
  }
}

function clampOptionsPosition(left, top) {
  const maxLeft = Math.max(8, window.innerWidth - OPTIONS_PANEL_WIDTH - 8);
  const maxTop = Math.max(8, window.innerHeight - OPTIONS_PANEL_HEIGHT - 8);
  return {
    left: Math.min(Math.max(8, left), maxLeft),
    top: Math.min(Math.max(8, top), maxTop),
  };
}

function setOptionsPosition(left, top) {
  const next = clampOptionsPosition(left, top);
  optionsPanel.style.left = `${next.left}px`;
  optionsPanel.style.top = `${next.top}px`;
}

function positionOptionsBesideViewport() {
  const canvas = document.querySelector("#page-viewport");
  const frame = (viewport || canvas)?.getBoundingClientRect?.();
  if (!frame) {
    setOptionsPosition(window.innerWidth - OPTIONS_PANEL_WIDTH - 24, 120);
    return;
  }
  // Prefer just to the right of the page viewport; fall inside if needed.
  let left = frame.right + 12;
  if (left + OPTIONS_PANEL_WIDTH > window.innerWidth - 8) {
    left = frame.right - OPTIONS_PANEL_WIDTH - 16;
  }
  const top = frame.top + 8;
  setOptionsPosition(left, top);
}

function openOptionsPanel() {
  if (!optionsPanel) return;
  syncOptionsContent();
  optionsPanel.hidden = false;
  optionsTrigger?.setAttribute("aria-expanded", "true");
  document.querySelector("#bld-options-trigger")?.setAttribute("aria-expanded", "true");
  document.querySelector("#smap-options-trigger")?.setAttribute("aria-expanded", "true");
  document.querySelector("#mdl-options-trigger")?.setAttribute("aria-expanded", "true");
  document.querySelector("#unt-options-trigger")?.setAttribute("aria-expanded", "true");
  if (!optionsPanel.dataset.placed) {
    positionOptionsBesideViewport();
    optionsPanel.dataset.placed = "true";
  }
}

function closeSectionsPanel() {
  if (!sectionsPanel) return;
  sectionsPanel.hidden = true;
  sectionsTrigger?.setAttribute("aria-expanded", "false");
}

function closeToolPanels(exceptPanel) {
  toolPanels.forEach((panel) => {
    if (!panel || panel === exceptPanel) return;
    panel.hidden = true;
  });
  toolButtons.forEach((btn) => {
    if (!btn) return;
    const controls = btn.getAttribute("aria-controls");
    const open = exceptPanel && controls === exceptPanel.id && !exceptPanel.hidden;
    btn.setAttribute("aria-expanded", String(Boolean(open)));
  });
  closeFieldMenus();
}

function closeMenus({ keepPages = false } = {}) {
  pageMenu.hidden = true;
  pagePicker.setAttribute("aria-expanded", "false");
  if (pageFilterPanel) pageFilterPanel.hidden = true;
  pageFilterTrigger?.setAttribute("aria-expanded", "false");
  closeColorMenus();
  closeToolPanels();
  closeSectionsPanel();
  closeBuildingFlyouts();
  closeSitemapFlyouts();
  closeModelFlyouts();
  closeUnitFlyouts();
  hideTooltip();
  if (!keepPages) closePagesFlyout();
}

function themePayload() {
  const dark = luminance(pageColors.background.hex) < 0.45;
  const { tl, tr, bl, br } = pageFx.radius;
  return {
    type: "sp-page-theme",
    background: pageColors.background.hex,
    accent1: pageColors.accent1.hex,
    accent2: pageColors.accent2.hex,
    text: dark ? "#ffffff" : "#171d3a",
    radius: { tl, tr, bl, br },
    sections: { ...sectionVisibility },
    buttonStyles: { ...buttonStyles },
  };
}

function sectionOptionButtons() {
  return [...sectionsPanel.querySelectorAll(".sp-sections-option[data-section]")];
}

function selectAllButton() {
  return sectionsPanel.querySelector(".sp-sections-option[data-section-all]");
}

function syncSectionOption(button, on) {
  button.setAttribute("aria-selected", String(on));
}

function setSectionsLabel(label, text) {
  if (!label) return;
  const value = label.querySelector("span") || label;
  value.textContent = text;
}

function updateSectionsTriggerLabel() {
  const total = SECTION_KEYS.length;
  const visible = SECTION_KEYS.filter((key) => sectionVisibility[key]).length;
  if (visible === total) setSectionsLabel(sectionsValue, "Show All");
  else setSectionsLabel(sectionsValue, "Custom");
}

function syncSectionsUi() {
  const allOn = SECTION_KEYS.every((key) => sectionVisibility[key]);
  const allBtn = selectAllButton();
  if (allBtn) syncSectionOption(allBtn, allOn);
  sectionOptionButtons().forEach((button) => {
    const key = button.dataset.section;
    syncSectionOption(button, Boolean(sectionVisibility[key]));
  });
  updateSectionsTriggerLabel();
}

function setSectionVisible(key, on) {
  if (!(key in sectionVisibility)) return;
  sectionVisibility[key] = Boolean(on);
  syncSectionsUi();
  pushThemeToPreview();
}

function setAllSectionsVisible(on) {
  SECTION_KEYS.forEach((key) => {
    sectionVisibility[key] = Boolean(on);
  });
  syncSectionsUi();
  pushThemeToPreview();
}

function pushThemeToPreview() {
  const payload = themePayload();
  const send = () => {
    try {
      iframe.contentWindow?.postMessage(payload, "*");
    } catch {
      /* cross-origin direct page — theme only on wrapper */
    }
  };
  send();
  // Retry so CTA classes land after Next.js hydration remounts checkout/header buttons.
  setTimeout(send, 80);
  setTimeout(send, 400);
}

function applyPageColors() {
  const dark = luminance(pageColors.background.hex) < 0.45;
  viewport.style.setProperty("--page-bg", pageColors.background.hex);
  viewport.style.setProperty("--page-accent-1", pageColors.accent1.hex);
  viewport.style.setProperty("--page-accent-2", pageColors.accent2.hex);
  viewport.style.setProperty("--page-text", dark ? "#ffffff" : "#171d3a");
  viewport.classList.toggle("is-dark-page", dark);
  iframe.style.backgroundColor = pageColors.background.hex;

  pushThemeToPreview();
}

function syncColorPickerSelection(slot) {
  const menu = document.querySelector(`#color-menu-${slot}`);
  if (!menu) return;
  const current = (pageColors[slot]?.hex || "").toLowerCase();
  const palette =
    slot === "floor" || slot === "dot" || String(slot).startsWith("bed") ? FLOOR_COLOR_HEXES : COLOR_PICKER_HEXES;
  const inPalette = palette.has(current);
  const customOpen = Boolean(menu.querySelector(".sp-custom-color-panel:not([hidden])"));
  const customChosen = pageColors[slot]?.name === "Custom";
  menu.querySelectorAll(".sp-color-picker-swatch").forEach((option) => {
    const hex = (option.dataset.hex || "").toLowerCase();
    const isCustom = option.classList.contains("sp-color-picker-add");
    const selected = isCustom
      ? customOpen || customChosen
      : !customOpen && !customChosen && inPalette && hex === current;
    option.setAttribute("aria-selected", String(selected));
  });
}

function setSlotColor(slot, name, hex) {
  pageColors[slot] = { name, hex };
  const swatch = document.querySelector(`#swatch-${slot}`);
  if (swatch) swatch.style.background = hex;

  if (slot === "floor") {
    const toolbarSwatch = document.querySelector("#bld-swatch");
    const label = document.querySelector("#bld-floor-label");
    if (toolbarSwatch) toolbarSwatch.style.background = hex;
    if (label) label.textContent = name;
    syncColorPickerSelection(slot);
    return;
  }

  if (String(slot).startsWith("bed")) {
    const toolbarSwatch = document.querySelector("#smap-swatch");
    if (toolbarSwatch) toolbarSwatch.style.background = hex;
    syncColorPickerSelection(slot);
    return;
  }

  if (slot === "dot") {
    syncColorPickerSelection(slot);
    return;
  }

  if (slot === "accent1") {
    const toolbarSwatch = document.querySelector("#swatch-toolbar");
    if (toolbarSwatch) toolbarSwatch.style.background = hex;
  }

  syncColorPickerSelection(slot);
  applyPageColors();
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function hexToHsv(hex) {
  const raw = String(hex || "").replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toByte = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function normalizeHex(value) {
  const raw = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

function ensureCustomColorPanel(menu) {
  let panel = menu.querySelector(".sp-custom-color-panel");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.className = "sp-custom-color-panel";
  panel.hidden = true;
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-label", "Custom color");
  panel.innerHTML = `
    <div class="sp-custom-sv" tabindex="0" role="slider" aria-label="Saturation and brightness">
      <span class="sp-custom-sv-thumb" aria-hidden="true"></span>
    </div>
    <input class="sp-custom-hue" type="range" min="0" max="360" step="1" aria-label="Hue" />
    <div class="sp-custom-hex-row">
      <span class="sp-custom-preview" aria-hidden="true"></span>
      <div class="sp-custom-hex-field">
        <label for="">Hex</label>
        <input type="text" class="sp-custom-hex" maxlength="7" spellcheck="false" autocomplete="off" />
      </div>
    </div>
  `;
  menu.appendChild(panel);

  const hexInput = panel.querySelector(".sp-custom-hex");
  const hexId = `sp-custom-hex-${menu.id || Math.random().toString(36).slice(2, 8)}`;
  hexInput.id = hexId;
  panel.querySelector(".sp-custom-hex-field label").setAttribute("for", hexId);

  return panel;
}

function bindCustomColorPanel(panel, slot, label) {
  if (panel.dataset.bound === "true") return;
  panel.dataset.bound = "true";

  const sv = panel.querySelector(".sp-custom-sv");
  const thumb = panel.querySelector(".sp-custom-sv-thumb");
  const hueInput = panel.querySelector(".sp-custom-hue");
  const hexInput = panel.querySelector(".sp-custom-hex");
  const preview = panel.querySelector(".sp-custom-preview");
  let state = { h: 210, s: 0.2, v: 0.85 };
  let dragging = false;

  const paint = (announceChange = false) => {
    const hex = hsvToHex(state.h, state.s, state.v);
    panel.style.setProperty("--sp-custom-hue", String(Math.round(state.h)));
    hueInput.value = String(Math.round(state.h));
    thumb.style.left = `${state.s * 100}%`;
    thumb.style.top = `${(1 - state.v) * 100}%`;
    preview.style.background = hex;
    if (document.activeElement !== hexInput) hexInput.value = hex;
    setSlotColor(slot, "Custom", hex);
    if (announceChange) announce(`${label}: Custom`);
  };

  const setFromHex = (hex, announceChange = false) => {
    const next = normalizeHex(hex);
    if (!next) return false;
    state = hexToHsv(next);
    paint(announceChange);
    return true;
  };

  const setFromPointer = (event) => {
    const rect = sv.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    state.s = clamp01((event.clientX - rect.left) / rect.width);
    state.v = clamp01(1 - (event.clientY - rect.top) / rect.height);
    paint(true);
  };

  hueInput.addEventListener("input", () => {
    state.h = Number(hueInput.value) || 0;
    paint(true);
  });

  hexInput.addEventListener("change", () => {
    if (!setFromHex(hexInput.value, true)) hexInput.value = hsvToHex(state.h, state.s, state.v);
  });
  hexInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      hexInput.blur();
    }
  });

  sv.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    sv.setPointerCapture(event.pointerId);
    setFromPointer(event);
  });
  sv.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    setFromPointer(event);
  });
  sv.addEventListener("pointerup", () => {
    dragging = false;
  });
  sv.addEventListener("pointercancel", () => {
    dragging = false;
  });

  panel._loadColor = (hex) => {
    setFromHex(hex || "#d2d2d2", false);
  };
}

function openCustomColorPanel(menu, slot, label) {
  const panel = ensureCustomColorPanel(menu);
  bindCustomColorPanel(panel, slot, label);
  document.querySelectorAll(".sp-custom-color-panel").forEach((other) => {
    if (other !== panel) other.hidden = true;
  });
  panel.hidden = false;
  panel._loadColor?.(pageColors[slot]?.hex || "#d2d2d2");
  syncColorPickerSelection(slot);
  panel.querySelector(".sp-custom-hex")?.focus({ preventScroll: true });
}

function pickCustomColor(slot, label, menu) {
  // Native <input type="color"> popovers ignore CSS position on macOS/Chrome.
  // Use an in-panel nested picker under the preset swatch row instead.
  openCustomColorPanel(menu, slot, label);
}

function clampRadius(value) {
  const n = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(99, n));
}

function applyRadiusFx() {
  const { tl, tr, bl, br } = pageFx.radius;
  viewport.style.setProperty("--page-radius-tl", `${tl}px`);
  viewport.style.setProperty("--page-radius-tr", `${tr}px`);
  viewport.style.setProperty("--page-radius-bl", `${bl}px`);
  viewport.style.setProperty("--page-radius-br", `${br}px`);
  pushThemeToPreview();
}

function setAllRadii(value) {
  const n = clampRadius(value);
  pageFx.radius = { tl: n, tr: n, bl: n, br: n };
  if (radiusAll) radiusAll.value = String(n);
  Object.values(radiusCornerInputs).forEach((input) => {
    if (input) input.value = String(n);
  });
  applyRadiusFx();
}

function replayAnimation() {
  if (!pageFx.animation || pageFx.animation === "none") {
    viewport.classList.remove("is-animating");
    viewport.removeAttribute("data-animation");
    return;
  }
  viewport.dataset.animation = pageFx.animation;
  viewport.style.setProperty("--page-anim-ms", pageFx.speed === "fast" ? "320ms" : "600ms");
  viewport.classList.remove("is-animating");
  // reflow to restart
  void viewport.offsetWidth;
  viewport.classList.add("is-animating");
  window.setTimeout(() => viewport.classList.remove("is-animating"), pageFx.speed === "fast" ? 360 : 700);
}

function bindFieldMenu(triggerId, menuId, onSelect) {
  const trigger = document.querySelector(`#${triggerId}`);
  const menu = document.querySelector(`#${menuId}`);
  if (!trigger || !menu) return;

  trigger.setAttribute("aria-controls", menuId);

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    closeFieldMenus(willOpen ? menu : null);
    menu.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (event) => event.stopPropagation());

  menu.querySelectorAll("button[role='option']").forEach((option) => {
    option.addEventListener("click", () => {
      menu.querySelectorAll("button[role='option']").forEach((item) => {
        item.setAttribute("aria-selected", String(item === option));
      });
      onSelect(option);
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });
  });
}

function openToolPanel(btn, panel) {
  const willOpen = panel.hidden;
  closeMenus();
  hideTooltip();
  if (!willOpen) return;
  panel.hidden = false;
  btn.setAttribute("aria-expanded", "true");
}

pagePicker.addEventListener("click", (event) => {
  event.stopPropagation();
  const open = pageMenu.hidden;
  closeMenus();
  pageMenu.hidden = !open;
  pagePicker.setAttribute("aria-expanded", String(open));
});

sectionsTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = sectionsPanel.hidden;
  closeMenus();
  if (!willOpen) return;
  sectionsPanel.hidden = false;
  sectionsTrigger.setAttribute("aria-expanded", "true");
});

colorsBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  openToolPanel(colorsBtn, colorsPanel);
});

ctaBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  openToolPanel(ctaBtn, ctaPanel);
});

radiusBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  openToolPanel(radiusBtn, radiusPanel);
});

locationBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  openToolPanel(locationBtn, locationPanel);
});

animationsBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  openToolPanel(animationsBtn, animationsPanel);
});

optionsTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = optionsPanel.hidden;
  closeMenus();
  if (!willOpen) {
    closeOptionsPanel();
    return;
  }
  openOptionsPanel();
});

optionsClose.addEventListener("click", (event) => {
  event.stopPropagation();
  closeOptionsPanel();
});

pagesTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = pagesFlyout?.hidden;
  if (!willOpen) {
    closePagesFlyout();
    announce("Pages closed");
    return;
  }
  openPagesFlyout();
  announce("Manage Pages opened");
});

pagesClose?.addEventListener("click", (event) => {
  event.stopPropagation();
  closePagesFlyout();
  announce("Pages closed");
});

pagesFlyout?.addEventListener("click", (event) => event.stopPropagation());

pagesSearch?.addEventListener("input", () => {
  const query = pagesSearch.value.trim().toLowerCase();
  pagesFlyout.querySelectorAll(".sp-pages-item").forEach((item) => {
    const name = (item.dataset.pageName || item.textContent || "").toLowerCase();
    const match = !query || name.includes(query);
    const row = item.closest("li");
    if (row) row.hidden = !match;
    else item.hidden = !match;
  });
  syncPagesSectionVisibility();
});

pagesFlyout?.querySelectorAll(".sp-pages-section-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const section = toggle.closest(".sp-pages-section");
    if (!section) return;
    setPagesSectionExpanded(section, toggle.getAttribute("aria-expanded") !== "true");
  });
});

function selectPagesItem(item) {
  if (!pagesFlyout || !item) return;
  pagesFlyout.querySelectorAll(".sp-pages-item").forEach((other) => {
    const selected = other === item;
    other.classList.toggle("is-selected", selected);
    if (selected) other.setAttribute("aria-current", "true");
    else other.removeAttribute("aria-current");
  });
  if (pageSettings && !pageSettings.hidden) {
    if (item.dataset.settings) applyPageSettings(item);
    else closePageSettings();
  }
}

const MANAGED_PAGE_ALIASES = {
  "Contact Us": "Contact",
};

function syncManagedPageSelection(name) {
  if (!pagesFlyout) return;
  const managedName = MANAGED_PAGE_ALIASES[name] || name;
  const items = [...pagesFlyout.querySelectorAll(".sp-pages-item")];
  const match = managedName ? items.find((item) => item.dataset.pageName === managedName) : null;
  if (match) {
    selectPagesItem(match);
    return;
  }
  const selected = items.find((item) => item.classList.contains("is-selected"));
  const ifpb = ["building", "sitemap", "model", "unit"].includes(selected?.dataset.settings);
  if (!ifpb) return;
  selectPagesItem(items.find((item) => item.dataset.pageName === "Property Page") || selected);
  closePageSettings();
}

pagesFlyout?.querySelectorAll(".sp-pages-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    if (event.target.closest(".sp-pages-item-open")) return;
    event.stopPropagation();
    if (event.target.closest(".sp-pages-item-chevron")) {
      openPageSettings(item);
      return;
    }
    selectPagesItem(item);
    announce(`${item.dataset.pageName || item.textContent.trim()} selected`);
  });
});

const pageSettings = document.querySelector("#page-settings");
const pageSettingsTitle = document.querySelector("#page-settings-title");
const pageSettingsSeoTitle = document.querySelector("#page-settings-seo-title");
const pageSettingsSeoDescription = document.querySelector("#page-settings-seo-description");
const pageSettingsPreviewTitle = document.querySelector("#page-settings-preview-title");
const pageSettingsPreviewUrl = document.querySelector("#page-settings-preview-url");
const pageSettingsPreviewDesc = document.querySelector("#page-settings-preview-desc");
const pageSettingsShare = document.querySelector("#page-settings-share");
const pageSettingsSharePreview = document.querySelector("#page-settings-share-preview");
const pageSettingsShareLabel = document.querySelector("#page-settings-share-label");
const pageSettingsCanonical = document.querySelector("#page-settings-canonical");
let pageSettingsKey = null;
const ENGINES_PAGES = new Set(["model", "unit"]);
const BASIC_PAGES = new Set(["building", "sitemap"]);
const pageEngineState = {};
const pageSeoState = {};
const PAGE_SEO_URLS = {
  building: "https://www.livingappletree.com/buildings/1",
  sitemap: "https://www.livingappletree.com/buildings/1/floors/1",
  model: "https://www.livingappletree.com/models/A1",
  unit: "https://www.livingappletree.com/units/12001",
};
const PAGE_SEO_TITLE = "[screen_title] [separator] [site_title]";
const PAGE_SEO_DESCRIPTION =
  'Apartments for rent in [app key="address.city"] [app key="address.state"]. Contact us Today!';

function defaultPageSeo() {
  return {
    title: PAGE_SEO_TITLE,
    description: PAGE_SEO_DESCRIPTION,
    shareUrl: "",
  };
}

function pageSeo(key) {
  if (!pageSeoState[key]) pageSeoState[key] = defaultPageSeo();
  return pageSeoState[key];
}

function syncSeoPreview(key) {
  const title = pageSettingsSeoTitle?.value.trim() || PAGE_SEO_TITLE;
  const description = pageSettingsSeoDescription?.value.trim() || PAGE_SEO_DESCRIPTION;
  if (pageSettingsPreviewTitle) pageSettingsPreviewTitle.textContent = title;
  if (pageSettingsPreviewDesc) pageSettingsPreviewDesc.textContent = description;
  if (pageSettingsPreviewUrl) {
    pageSettingsPreviewUrl.textContent = PAGE_SEO_URLS[key] || "https://www.livingappletree.com/";
  }
}

function renderShareImage(url) {
  if (!pageSettingsSharePreview || !pageSettingsShareLabel) return;
  if (url) {
    pageSettingsSharePreview.src = url;
    pageSettingsSharePreview.hidden = false;
    pageSettingsShareLabel.textContent = "Replace image";
  } else {
    pageSettingsSharePreview.removeAttribute("src");
    pageSettingsSharePreview.hidden = true;
    pageSettingsShareLabel.textContent = "Choose image";
  }
}

function readPageSeo(key) {
  if (!key || !pageSettingsSeoTitle) return;
  const state = pageSeo(key);
  state.title = pageSettingsSeoTitle.value;
  state.description = pageSettingsSeoDescription.value;
}

function writePageSeo(key) {
  const state = pageSeo(key);
  if (pageSettingsSeoTitle) pageSettingsSeoTitle.value = state.title;
  if (pageSettingsSeoDescription) pageSettingsSeoDescription.value = state.description;
  if (pageSettingsShare) pageSettingsShare.value = "";
  renderShareImage(state.shareUrl);
  syncSeoPreview(key);
}

function pageEngine(key) {
  if (!pageEngineState[key]) pageEngineState[key] = { visible: "global", canonical: "" };
  return pageEngineState[key];
}

function readPageEngines(key) {
  if (!key || !ENGINES_PAGES.has(key)) return;
  const state = pageEngine(key);
  const selected = pageSettings?.querySelector("#page-settings-engines .bld-choice.is-selected");
  state.visible = selected?.dataset.value || "global";
  state.canonical = pageSettingsCanonical?.value || "";
}

function writePageEngines(key) {
  const state = pageEngine(key);
  pageSettings?.querySelectorAll("#page-settings-engines .bld-choice").forEach((item) => {
    const on = item.dataset.value === state.visible;
    item.classList.toggle("is-selected", on);
    item.setAttribute("aria-pressed", String(on));
  });
  if (pageSettingsCanonical) pageSettingsCanonical.value = state.canonical;
}

function syncSettingsTabs(key) {
  const engines = ENGINES_PAGES.has(key);
  const basic = BASIC_PAGES.has(key);
  pageSettings?.querySelectorAll("[data-settings-tab]").forEach((tab) => {
    const only = tab.dataset.settingsOnly;
    if (only === "engines") tab.hidden = !engines;
    if (only === "standard") tab.hidden = engines || basic;
    if (only === "model") tab.hidden = true;
  });
  const modelGeneral = document.querySelector("#page-settings-model-general");
  if (modelGeneral) modelGeneral.hidden = key !== "model";
  const unitGeneral = document.querySelector("#page-settings-unit-general");
  if (unitGeneral) unitGeneral.hidden = key !== "unit";
  const generalTab = pageSettings?.querySelector('[data-settings-tab="general"]');
  if (generalTab) {
    generalTab.hidden = basic;
    generalTab.textContent = ENGINES_PAGES.has(key) ? "Data & Pricing Settings" : "General";
  }
  const selected = pageSettings?.querySelector('[data-settings-tab][aria-selected="true"]');
  if (!selected || selected.hidden) showSettingsTab(basic ? "seo" : "general");
}

function applyPageSettings(item) {
  const key = item?.dataset.settings;
  if (!key) return;
  if (pageSettingsKey) {
    readPageSeo(pageSettingsKey);
    readPageEngines(pageSettingsKey);
  }
  pageSettingsKey = key;
  writePageSeo(key);
  writePageEngines(key);
  syncSettingsTabs(key);
  showSettingsTab(BASIC_PAGES.has(key) ? "seo" : "general");
  if (pageSettingsTitle) pageSettingsTitle.textContent = `${item.dataset.pageName} Settings`;
  pagesFlyout?.querySelectorAll(".sp-pages-item-open").forEach((button) => {
    button.setAttribute("aria-expanded", String(button.closest(".sp-pages-item") === item));
  });
}

const TRACKED_PANES = {
  general: "#page-settings-model-general",
  display: "#page-settings-model-display",
};
const savedPaneState = {};
let pendingSettingsTab = null;
const pageSettingsUnsaved = document.querySelector("#page-settings-unsaved");

function trackedRoot(name) {
  if (name === "general") {
    if (pageSettingsKey === "unit") return document.querySelector("#page-settings-unit-general");
    if (pageSettingsKey === "model") return document.querySelector("#page-settings-model-general");
    return null;
  }
  const selector = TRACKED_PANES[name];
  return selector ? document.querySelector(selector) : null;
}

function stateBucket(name) {
  return name === "general" ? `general:${pageSettingsKey}` : name;
}

function readPaneState(root) {
  if (!root) return null;
  return {
    selects: [...root.querySelectorAll(".unit-select-value")].map((el) => el.textContent),
    choices: [...root.querySelectorAll(".bld-choice")].map((el) => el.getAttribute("aria-pressed") === "true"),
    switches: [...root.querySelectorAll(".unit-switch")].map((el) => el.getAttribute("aria-checked") === "true"),
    fields: [...root.querySelectorAll("input, textarea")]
      .filter((el) => el.type !== "file")
      .map((el) => el.value),
  };
}

function writePaneState(root, state) {
  if (!root || !state) return;
  root.querySelectorAll(".unit-select").forEach((select, index) => {
    const value = state.selects[index] ?? "";
    const label = select.querySelector(".unit-select-value");
    if (label) label.textContent = value;
    select.querySelectorAll(".unit-select-menu button").forEach((item) => {
      item.setAttribute("aria-selected", String(item.textContent === value));
    });
  });
  root.querySelectorAll(".bld-choice").forEach((item, index) => {
    const on = Boolean(state.choices[index]);
    item.classList.toggle("is-selected", on);
    item.setAttribute("aria-pressed", String(on));
  });
  root.querySelectorAll(".unit-switch").forEach((item, index) => {
    item.setAttribute("aria-checked", String(Boolean(state.switches[index])));
  });
  [...root.querySelectorAll("input, textarea")]
    .filter((el) => el.type !== "file")
    .forEach((el, index) => {
      el.value = state.fields[index] ?? "";
    });
}

function statesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function syncCanonicalField() {
  const toggle = document.querySelector("#mdl-use-canonical");
  const field = document.querySelector("#mdl-canonical-field");
  if (!toggle || !field) return;
  field.hidden = toggle.getAttribute("aria-checked") !== "true";
}

function currentTrackedTab() {
  const selected = pageSettings?.querySelector('[data-settings-tab][aria-selected="true"]');
  const name = selected?.dataset.settingsTab;
  return TRACKED_PANES[name] ? name : null;
}

function isPaneDirty(name) {
  const root = trackedRoot(name);
  const saved = savedPaneState[stateBucket(name)];
  if (!root || !saved) return false;
  return !statesEqual(readPaneState(root), saved);
}

function setSaveVisible(name, visible) {
  const save = trackedRoot(name)?.querySelector(".sp-settings-save");
  if (save) save.hidden = !visible;
}

function refreshSaveButton() {
  const name = currentTrackedTab();
  if (!name) return;
  setSaveVisible(name, isPaneDirty(name));
}

function commitPane(name) {
  const root = trackedRoot(name);
  if (!root) return;
  savedPaneState[stateBucket(name)] = readPaneState(root);
  setSaveVisible(name, false);
}

function revertPane(name) {
  writePaneState(trackedRoot(name), savedPaneState[stateBucket(name)]);
  syncCanonicalField();
  setSaveVisible(name, false);
}

function hideUnsavedPrompt() {
  pendingSettingsTab = null;
  if (pageSettingsUnsaved) pageSettingsUnsaved.hidden = true;
}

function showUnsavedPrompt(nextTab) {
  pendingSettingsTab = nextTab;
  if (pageSettingsUnsaved) pageSettingsUnsaved.hidden = false;
}

function showSettingsTab(name) {
  closeSettingsSelects();
  pageSettings?.querySelectorAll("[data-settings-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.settingsTab === name));
  });
  pageSettings?.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== name;
  });
  syncCanonicalField();
  refreshSaveButton();
}

function requestSettingsTab(name) {
  const current = currentTrackedTab();
  if (current === name) return;
  if (pageSettingsUnsaved && !pageSettingsUnsaved.hidden) {
    pendingSettingsTab = name;
    return;
  }
  if (current && isPaneDirty(current)) {
    showUnsavedPrompt(name);
    return;
  }
  showSettingsTab(name);
}

savedPaneState["general:model"] = readPaneState(document.querySelector("#page-settings-model-general"));
savedPaneState["general:unit"] = readPaneState(document.querySelector("#page-settings-unit-general"));
savedPaneState.display = readPaneState(document.querySelector("#page-settings-model-display"));
syncCanonicalField();

function openPageSettings(item) {
  if (!item?.dataset.settings || !pageSettings) return;
  if (pagesFlyout?.hidden) openPagesFlyout();
  selectPagesItem(item);
  pageSettings.hidden = false;
  pagesFlyout?.classList.add("is-settings-open");
  applyPageSettings(item);
  announce(`${item.dataset.pageName} settings`);
}

function closePageSettings() {
  if (!pageSettings || pageSettings.hidden) {
    pagesFlyout?.classList.remove("is-settings-open");
    return;
  }
  readPageSeo(pageSettingsKey);
  readPageEngines(pageSettingsKey);
  pageSettingsKey = null;
  pageSettings.hidden = true;
  pagesFlyout?.classList.remove("is-settings-open");
  pagesFlyout?.querySelectorAll(".sp-pages-item-open").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}

pagesFlyout?.querySelectorAll(".sp-pages-item-open").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openPageSettings(button.closest(".sp-pages-item"));
  });
});

function closeSettingsSelects(except) {
  pageSettings?.querySelectorAll(".unit-select-menu").forEach((menu) => {
    if (menu === except) return;
    menu.hidden = true;
    menu.closest(".unit-select")?.querySelector(".unit-select-trigger")?.setAttribute("aria-expanded", "false");
  });
}

pageSettings?.addEventListener("click", (event) => {
  event.stopPropagation();
  const unsavedAction = event.target.closest("[data-unsaved]");
  if (unsavedAction) {
    const current = currentTrackedTab();
    if (unsavedAction.dataset.unsaved === "save" && current) commitPane(current);
    if (unsavedAction.dataset.unsaved === "discard" && current) revertPane(current);
    const next = pendingSettingsTab;
    hideUnsavedPrompt();
    if (next) showSettingsTab(next);
    if (unsavedAction.dataset.unsaved === "save") announce("Changes saved");
    return;
  }
  const saveBtn = event.target.closest(".sp-settings-save-btn");
  if (saveBtn) {
    const name = saveBtn.closest("[data-save-for]")?.dataset.saveFor || currentTrackedTab();
    if (name) commitPane(name);
    announce("Changes saved");
    return;
  }
  const choice = event.target.closest(".bld-choice");
  if (choice) {
    const group = choice.parentElement;
    if (group?.dataset.multi === "true") {
      const on = choice.getAttribute("aria-pressed") !== "true";
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-pressed", String(on));
    } else {
      group?.querySelectorAll(".bld-choice").forEach((item) => {
        const on = item === choice;
        item.classList.toggle("is-selected", on);
        item.setAttribute("aria-pressed", String(on));
      });
    }
    readPageEngines(pageSettingsKey);
    closeSettingsSelects();
    refreshSaveButton();
    return;
  }
  const option = event.target.closest("#page-settings .unit-select-menu button");
  if (option) {
    const select = option.closest(".unit-select");
    const value = select?.querySelector(".unit-select-value");
    if (value) value.textContent = option.textContent;
    select?.querySelectorAll(".unit-select-menu button").forEach((item) => {
      item.setAttribute("aria-selected", String(item === option));
    });
    closeSettingsSelects();
    refreshSaveButton();
    return;
  }
  const selectTrigger = event.target.closest("#page-settings .unit-select-trigger");
  if (selectTrigger) {
    const menu = selectTrigger.parentElement?.querySelector(".unit-select-menu");
    const willOpen = Boolean(menu?.hidden);
    closeSettingsSelects(willOpen ? menu : null);
    if (menu) menu.hidden = !willOpen;
    selectTrigger.setAttribute("aria-expanded", String(willOpen));
    return;
  }
  const switchBtn = event.target.closest("#page-settings .unit-switch");
  if (switchBtn) {
    const on = switchBtn.getAttribute("aria-checked") !== "true";
    switchBtn.setAttribute("aria-checked", String(on));
    syncCanonicalField();
    refreshSaveButton();
    return;
  }
  closeSettingsSelects();
});

pageSettings?.addEventListener("input", (event) => {
  if (event.target.closest("#page-settings-model-general, #page-settings-model-display, #page-settings-unit-general")) {
    refreshSaveButton();
  }
});

pageSettings?.querySelectorAll("[data-settings-tab]").forEach((tab) => {
  tab.addEventListener("click", () => requestSettingsTab(tab.dataset.settingsTab));
});

function rememberSeoField() {
  if (pageSettingsKey) readPageSeo(pageSettingsKey);
  syncSeoPreview(pageSettingsKey);
}

pageSettingsSeoTitle?.addEventListener("input", rememberSeoField);
pageSettingsSeoDescription?.addEventListener("input", rememberSeoField);
pageSettingsCanonical?.addEventListener("input", () => readPageEngines(pageSettingsKey));

pageSettingsShare?.addEventListener("change", () => {
  if (!pageSettingsKey) return;
  const file = pageSettingsShare.files?.[0];
  const state = pageSeo(pageSettingsKey);
  if (!file) {
    state.shareUrl = "";
    renderShareImage("");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.shareUrl = String(reader.result || "");
    renderShareImage(state.shareUrl);
  };
  reader.readAsDataURL(file);
});

document.querySelector("#page-settings-close")?.addEventListener("click", (event) => {
  event.stopPropagation();
  closePageSettings();
  announce("Page settings closed");
});

document.querySelector("#page-settings-goto")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const item = pagesFlyout?.querySelector(".sp-pages-item.is-selected");
  const name = item?.dataset.pageName || "";
  if (name) goToManagedPage(name);
  else closePagesFlyout();
});

colorsPanel?.addEventListener("click", (event) => {
  // Keep the Page Colors panel open, but dismiss nested preset/HSV pickers
  // when the click is elsewhere inside the panel (title, idle chips area, etc.).
  event.stopPropagation();
  if (!isInsideColorPicker(event.target)) {
    closeColorMenus();
  }
});
ctaPanel?.addEventListener("click", (event) => event.stopPropagation());
radiusPanel.addEventListener("click", (event) => event.stopPropagation());
locationPanel.addEventListener("click", (event) => event.stopPropagation());
animationsPanel?.addEventListener("click", (event) => event.stopPropagation());
sectionsPanel.addEventListener("click", (event) => event.stopPropagation());
optionsPanel.addEventListener("click", (event) => event.stopPropagation());

document.addEventListener("click", (event) => {
  if (
    event.target.closest("#options-panel") ||
    event.target.closest("#options-trigger") ||
    event.target.closest("#pages-flyout") ||
    event.target.closest("#pages-trigger") ||
    event.target.closest("#page-settings")
  ) {
    return;
  }
  // Match Button Styles / Radius / etc.: outside click closes tool panels
  // (and nested Page Colors preset/HSV pickers via closeMenus → closeColorMenus).
  closeMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (pageSettingsUnsaved && !pageSettingsUnsaved.hidden) {
    hideUnsavedPrompt();
    return;
  }
  closeMenus();
  closeOptionsPanel();
  closePagesFlyout();
});

// Clicks on the preview iframe do not bubble to `document`. Treat focus moving
// into the canvas as an outside dismissal, same as other tool panels.
window.addEventListener("blur", () => {
  window.requestAnimationFrame(() => {
    if (document.activeElement === iframe) closeMenus();
  });
});

let optionsDrag = null;

optionsDragHandle?.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  if (event.target.closest(".sp-options-close")) return;
  event.preventDefault();
  const rect = optionsPanel.getBoundingClientRect();
  optionsDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };
  optionsPanel.classList.add("is-dragging");
  optionsDragHandle.setPointerCapture(event.pointerId);
});

optionsDragHandle?.addEventListener("pointermove", (event) => {
  if (!optionsDrag || optionsDrag.pointerId !== event.pointerId) return;
  setOptionsPosition(event.clientX - optionsDrag.offsetX, event.clientY - optionsDrag.offsetY);
});

function endOptionsDrag(event) {
  if (!optionsDrag || optionsDrag.pointerId !== event.pointerId) return;
  optionsDrag = null;
  optionsPanel.classList.remove("is-dragging");
  try {
    optionsDragHandle.releasePointerCapture(event.pointerId);
  } catch {
    /* already released */
  }
}

optionsDragHandle?.addEventListener("pointerup", endOptionsDrag);
optionsDragHandle?.addEventListener("pointercancel", endOptionsDrag);

window.addEventListener("resize", () => {
  if (optionsPanel?.hidden) return;
  const left = Number.parseFloat(optionsPanel.style.left) || 0;
  const top = Number.parseFloat(optionsPanel.style.top) || 0;
  setOptionsPosition(left, top);
});

function syncPageMenu() {
  const query = (pageSearch?.value || "").trim().toLowerCase();
  let seen = false;
  pageMenu.querySelectorAll(".sp-page-group").forEach((group) => {
    const enabled = group.dataset.enabled !== "false";
    let matches = 0;
    group.querySelectorAll("[role='option']").forEach((option) => {
      const name = (option.dataset.page || option.textContent).toLowerCase();
      const show = !query || name.includes(query);
      option.closest("li").hidden = !show;
      if (show) matches += 1;
    });
    const visible = enabled && matches > 0;
    group.hidden = !visible;
    const divider = group.querySelector(".sp-page-divider");
    if (divider) divider.hidden = !seen;
    if (visible) seen = true;
  });
  if (pageMenuEmpty) pageMenuEmpty.hidden = seen;
}

pageMenu.addEventListener("click", (event) => event.stopPropagation());

pageSearch?.addEventListener("input", syncPageMenu);

function pageFilterButtons() {
  return [...(pageFilterPanel?.querySelectorAll(".sp-sections-option[data-category]") || [])];
}

function syncPageFilterState() {
  const buttons = pageFilterButtons();
  const allOn = buttons.length > 0 && buttons.every((button) => button.getAttribute("aria-selected") === "true");
  const all = pageFilterPanel?.querySelector("[data-category-all]");
  if (all) all.setAttribute("aria-selected", String(allOn));
  pageFilterTrigger?.classList.toggle("is-custom", !allOn);
}

pageFilterTrigger?.addEventListener("click", () => {
  const open = pageFilterPanel.hidden;
  pageFilterPanel.hidden = !open;
  pageFilterTrigger.setAttribute("aria-expanded", String(open));
});

pageFilterPanel?.querySelectorAll(".sp-sections-option").forEach((button) => {
  button.addEventListener("click", () => {
    const buttons = pageFilterButtons();
    if (button.dataset.categoryAll) {
      const turnOn = button.getAttribute("aria-selected") !== "true";
      buttons.forEach((item) => {
        item.setAttribute("aria-selected", String(turnOn));
        const group = pageMenu.querySelector(`.sp-page-group[data-category="${item.dataset.category}"]`);
        if (group) group.dataset.enabled = String(turnOn);
      });
    } else {
      const on = button.getAttribute("aria-selected") !== "true";
      button.setAttribute("aria-selected", String(on));
      const group = pageMenu.querySelector(`.sp-page-group[data-category="${button.dataset.category}"]`);
      if (group) group.dataset.enabled = String(on);
    }
    syncPageFilterState();
    syncPageMenu();
  });
});

syncPageFilterState();

function editorPageOption(name) {
  const names = [name];
  const alias = MANAGED_PAGE_ALIASES[name];
  if (alias) names.push(alias);
  const reverse = Object.entries(MANAGED_PAGE_ALIASES).find(([, managed]) => managed === name);
  if (reverse) names.push(reverse[0]);
  for (const candidate of names) {
    const button = pageMenu?.querySelector(
      `.sp-page-entries [role='option'][data-page="${CSS.escape(candidate)}"]`
    );
    if (button) return button;
  }
  return null;
}

function activateEditorPage(button) {
  if (!button) return;
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === button));
  });
  pageName.textContent = button.dataset.page;
  if (button.dataset.canvas === "building") {
    showBuildingPage();
    announce(`Loaded ${button.dataset.page}`);
    closeMenus();
    return;
  }
  if (button.dataset.canvas === "sitemap") {
    showSitemapPage();
    announce(`Loaded ${button.dataset.page}`);
    closeMenus();
    return;
  }
  if (button.dataset.canvas === "model") {
    showModelPage();
    announce(`Loaded ${button.dataset.page}`);
    closeMenus();
    return;
  }
  if (button.dataset.canvas === "unit") {
    showUnitPage();
    announce(`Loaded ${button.dataset.page}`);
    closeMenus();
    return;
  }
  if (button.dataset.pending === "true") {
    showLivePage(button.dataset.page);
    announce(`Loaded ${button.dataset.page}`);
    closeMenus();
    return;
  }
  showLivePage(button.dataset.page);
  const absoluteUrl = button.dataset.url || LIVE_REMOTE;
  let remotePath = LIVE_PATH;
  try {
    remotePath = button.dataset.url ? new URL(button.dataset.url).pathname || "/" : LIVE_PATH;
  } catch {
    remotePath = LIVE_PATH;
  }
  iframe.dataset.remotePath = remotePath;
  iframe.dataset.remoteUrl = absoluteUrl;
  hidePreviewFallback();
  iframe.src = previewSrc(remotePath, absoluteUrl);
  iframe.title = `${button.dataset.page} — live page`;
  if (fallbackLink) fallbackLink.href = absoluteUrl;
  announce(`Loaded ${button.dataset.page}`);
  closeMenus();
}

function goToManagedPage(name) {
  const button = editorPageOption(name);
  if (button) {
    activateEditorPage(button);
    return;
  }
  if (pageName) pageName.textContent = name;
  showLivePage(name);
  announce(`Loaded ${name}`);
  closeMenus();
}

pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((button) => {
  button.addEventListener("click", () => activateEditorPage(button));
});

sectionsPanel.addEventListener("click", (event) => {
  const button = event.target.closest(".sp-sections-option");
  if (!button) return;

  if (button.dataset.sectionAll) {
    const turnOn = button.getAttribute("aria-selected") !== "true";
    setAllSectionsVisible(turnOn);
    announce(turnOn ? "Showing all sections" : "Hiding all sections");
    return;
  }

  const key = button.dataset.section;
  if (!key) return;
  const next = button.getAttribute("aria-selected") !== "true";
  setSectionVisible(key, next);
  announce(`${next ? "Showing" : "Hiding"} ${button.textContent.trim()}`);
});

document.querySelectorAll(".sp-device-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".sp-device-btn").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    viewport.dataset.device = button.dataset.device;
    announce(`${button.dataset.device} preview`);
  });
});

document.querySelectorAll(".sp-rail-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (button === pagesTrigger) return;
    closePagesFlyout();
    document.querySelectorAll(".sp-rail-btn").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    announce(`${button.getAttribute("aria-label")} selected`);
  });
});

document.querySelectorAll(".sp-color-field").forEach((field) => {
  const slot = field.dataset.slot;
  const trigger = field.querySelector(".color-trigger");
  const menu = field.querySelector(".color-menu");
  if (!trigger || !menu) return;
  const labelEl = field.querySelector(".sp-color-chip-label");
  const label = field.dataset.label || labelEl?.textContent?.trim() || slot;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    closeColorMenus();
    hideTooltip();
    if (willOpen) {
      syncColorPickerSelection(slot);
      field.classList.add("is-active");
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    }
  });

  menu.addEventListener("click", (event) => event.stopPropagation());

  menu.querySelectorAll(".sp-color-picker-swatch").forEach((option) => {
    option.addEventListener("click", () => {
      if (option.classList.contains("sp-color-picker-add")) {
        pickCustomColor(slot, label, menu);
        return;
      }
      closeCustomColorPanels();
      setSlotColor(slot, option.dataset.color, option.dataset.hex);
      announce(`${label}: ${option.dataset.color}`);
      closeColorMenus();
    });
  });
});

["background", "accent1", "accent2", "floor", "bed1", "bed2", "bed3", "dot"].forEach(syncColorPickerSelection);

bindFieldMenu("page-animation-trigger", "page-animation-menu", (option) => {
  pageFx.animation = option.dataset.animation || "none";
  pageAnimationValue.textContent = option.textContent.trim();
  replayAnimation();
  announce(`Animation: ${pageAnimationValue.textContent}`);
});

if (radiusAll) {
  radiusAll.addEventListener("input", () => {
    pageFx.radiusLinked = true;
    setAllRadii(radiusAll.value);
  });
  radiusAll.addEventListener("change", () => {
    setAllRadii(radiusAll.value);
    announce(`Corner radius: ${pageFx.radius.tl}`);
  });
}

if (radiusIndividualBtn && radiusIndividualPanel) {
  radiusIndividualBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = radiusIndividualPanel.hidden;
    radiusIndividualPanel.hidden = !open;
    radiusIndividualBtn.setAttribute("aria-pressed", String(open));
    radiusIndividualBtn.setAttribute("aria-expanded", String(open));
    if (open) pageFx.radiusLinked = false;
  });
}

Object.entries(radiusCornerInputs).forEach(([key, input]) => {
  if (!input) return;
  input.addEventListener("input", () => {
    pageFx.radiusLinked = false;
    pageFx.radius[key] = clampRadius(input.value);
    applyRadiusFx();
  });
  input.addEventListener("change", () => {
    pageFx.radius[key] = clampRadius(input.value);
    input.value = String(pageFx.radius[key]);
    applyRadiusFx();
    announce(`Corner ${key.toUpperCase()}: ${pageFx.radius[key]}`);
  });
});

document.querySelectorAll("#location-panel button[data-map-style]").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll("#location-panel button[data-map-style]").forEach((item) => {
      item.setAttribute("aria-selected", String(item === option));
    });
    pageFx.mapStyle = option.dataset.mapStyle || "map";
    announce(`Location map style: ${option.querySelector("span")?.textContent.trim()}`);
  });
});

function styleLabel(style) {
  return style === "secondary" ? "Secondary" : "Primary";
}

function syncCtaStyleField(slot) {
  const style = buttonStyles[slot] || "primary";
  const trigger = document.querySelector(`#cta-${slot}-trigger`);
  const value = document.querySelector(`#cta-${slot}-value`);
  const preview = trigger?.querySelector(".sp-cta-preview");
  const menu = document.querySelector(`#cta-${slot}-menu`);
  if (preview) preview.dataset.style = style;
  if (value) value.textContent = styleLabel(style);
  menu?.querySelectorAll("button[role='option']").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.style === style));
  });
}

function bindCtaStyleMenu(slot, label) {
  const triggerId = `cta-${slot}-trigger`;
  const menuId = `cta-${slot}-menu`;
  bindFieldMenu(triggerId, menuId, (option) => {
    buttonStyles[slot] = option.dataset.style || "primary";
    syncCtaStyleField(slot);
    pushThemeToPreview();
    announce(`${label}: ${styleLabel(buttonStyles[slot])}`);
  });
}

bindCtaStyleMenu("reserve", "Reserve");
bindCtaStyleMenu("share", "Share/Save");
syncCtaStyleField("reserve");
syncCtaStyleField("share");

document.querySelectorAll("#page-speed button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#page-speed button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    pageFx.speed = button.dataset.speed || "normal";
    replayAnimation();
    announce(`Animation speed: ${pageFx.speed}`);
  });
});

document.querySelector("#btn-save").addEventListener("click", () => {
  announce("Draft saved");
  publishedStatus.innerHTML = "<strong>Draft saved</strong> just now";
});

document.querySelector("#btn-publish").addEventListener("click", () => {
  announce("Page published");
  publishedStatus.innerHTML = "<strong>Page Published:</strong> just now";
});

function hideTooltip() {
  if (!tooltip) return;
  tooltip.hidden = true;
  tooltip.textContent = "";
  document.querySelectorAll(`${TOOLTIP_SELECTOR}.is-tooltip-open`).forEach((btn) => {
    btn.classList.remove("is-tooltip-open");
  });
}

function showTooltip(anchor) {
  if (!tooltip || !anchor?.dataset.tooltip) return;
  if (anchor.getAttribute("aria-expanded") === "true") return;
  const text = anchor.dataset.tooltip;
  tooltip.textContent = text;
  tooltip.hidden = false;
  document.querySelectorAll(TOOLTIP_SELECTOR).forEach((btn) => {
    btn.classList.toggle("is-tooltip-open", btn === anchor);
  });

  const rect = anchor.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tipRect.width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
  let top = rect.bottom + 8;
  if (top + tipRect.height > window.innerHeight - 8) {
    top = rect.top - tipRect.height - 8;
  }
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

document.querySelectorAll(TOOLTIP_SELECTOR).forEach((button) => {
  button.addEventListener("mouseenter", () => showTooltip(button));
  button.addEventListener("focus", () => showTooltip(button));
  button.addEventListener("mouseleave", hideTooltip);
  button.addEventListener("blur", hideTooltip);
});

window.addEventListener("scroll", hideTooltip, true);
window.addEventListener("resize", hideTooltip);

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type === "sp-preview-ready") {
    pushThemeToPreview();
  }
});

iframe.addEventListener("load", () => {
  try {
    const doc = iframe.contentDocument;
    if (isBrokenPreviewDoc(doc)) {
      // Prefer same-origin cached HTML (theme bridge) when the local proxy isn't running.
      if (loadStaticPreviewFallback()) return;
      showPreviewFallback(
        isGithubPagesNotFoundDoc(doc)
          ? "This preview path isn’t available on GitHub Pages. Open the live site, or run static-pages-server.py locally for an embedded preview."
          : "The local preview proxy isn’t available. Open the live site, or run static-pages-server.py for an embedded preview."
      );
      return;
    }
  } catch {
    /* cross-origin remote preview — treat as loaded */
  }
  hidePreviewFallback();
  pushThemeToPreview();
  replayAnimation();
});

iframe.addEventListener("error", () => {
  if (loadStaticPreviewFallback()) return;
  showPreviewFallback(
    "The live page couldn’t load inside this frame (likely blocked by embed headers)."
  );
});

// Fallback link still points at the live remote site
const fallbackLink = fallback?.querySelector("a");
if (fallbackLink) fallbackLink.href = iframe.dataset.remoteUrl || LIVE_REMOTE;

// Resolve src for the current host (fixes GitHub Pages root-relative 404 in the canvas).
iframe.src = previewSrc(
  iframe.dataset.remotePath || LIVE_PATH,
  iframe.dataset.remoteUrl || LIVE_REMOTE
);

applyPageColors();
setAllRadii(pageFx.radius.tl);
syncSectionsUi();

const buildingTools = document.querySelector("#building-tools");
const buildingFrame = document.querySelector("#building-page");
const BUILDING_PAGE_SRC = "/buildings/1";
const buildingFlyouts = buildingTools
  ? [...buildingTools.querySelectorAll(".bld-flyout")]
  : [];
const sitemapTools = document.querySelector("#sitemap-tools");
const sitemapFrame = document.querySelector("#sitemap-page");
const SITEMAP_PAGE_SRC = "/buildings/1/floors/1";
const sitemapFlyouts = sitemapTools
  ? [...sitemapTools.querySelectorAll(".bld-flyout")]
  : [];
const modelTools = document.querySelector("#model-tools");
const modelFrame = document.querySelector("#model-page");
const MODEL_PAGE_SRC = "/models/A1";
const modelFlyouts = modelTools ? [...modelTools.querySelectorAll(".bld-flyout")] : [];
const unitTools = document.querySelector("#unit-tools");
const unitFrame = document.querySelector("#unit-page");
const UNIT_PAGE_SRC = "/units/12001";
const unitFlyouts = unitTools ? [...unitTools.querySelectorAll(".bld-flyout")] : [];

function closeUnitFlyouts() {
  unitFlyouts.forEach((panel) => {
    panel.hidden = true;
    const trigger = unitTools.querySelector(`[aria-controls="${panel.id}"]`);
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
  const sections = document.querySelector("#unt-sections-panel");
  if (sections) {
    sections.hidden = true;
    document.querySelector("#unt-sections-trigger")?.setAttribute("aria-expanded", "false");
  }
}

function closeModelFlyouts() {
  modelFlyouts.forEach((panel) => {
    panel.hidden = true;
    const trigger = modelTools.querySelector(`[aria-controls="${panel.id}"]`);
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
  const sections = document.querySelector("#mdl-sections-panel");
  if (sections) {
    sections.hidden = true;
    document.querySelector("#mdl-sections-trigger")?.setAttribute("aria-expanded", "false");
  }
}

function closeSitemapFlyouts() {
  sitemapFlyouts.forEach((panel) => {
    panel.hidden = true;
    const trigger = sitemapTools.querySelector(`[aria-controls="${panel.id}"]`);
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
  const sections = document.querySelector("#smap-sections-panel");
  if (sections) {
    sections.hidden = true;
    document.querySelector("#smap-sections-trigger")?.setAttribute("aria-expanded", "false");
  }
  closeColorMenus();
}

function closeBuildingFlyouts() {
  buildingFlyouts.forEach((panel) => {
    panel.hidden = true;
    const trigger = buildingTools.querySelector(`[aria-controls="${panel.id}"]`);
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
  const sections = document.querySelector("#bld-sections-panel");
  if (sections) {
    sections.hidden = true;
    document.querySelector("#bld-sections-trigger")?.setAttribute("aria-expanded", "false");
  }
  closeColorMenus();
}

function showBuildingPage() {
  document.body.classList.add("is-building");
  document.body.classList.remove("is-sitemap", "is-model", "is-unit");
  closeSitemapFlyouts();
  closeModelFlyouts();
  closeUnitFlyouts();
  if (sitemapTools) sitemapTools.hidden = true;
  if (sitemapFrame) sitemapFrame.hidden = true;
  if (modelTools) modelTools.hidden = true;
  if (modelFrame) modelFrame.hidden = true;
  if (unitTools) unitTools.hidden = true;
  if (unitFrame) unitFrame.hidden = true;
  syncOptionsContent();
  if (buildingTools) buildingTools.hidden = false;
  if (buildingFrame) {
    if (buildingFrame.dataset.loaded !== "true") {
      buildingFrame.src = hostedCanvasSrc(BUILDING_PAGE_SRC, "preview/github-building.html");
      buildingFrame.dataset.loaded = "true";
    }
    buildingFrame.hidden = false;
  }
  if (iframe) iframe.hidden = true;
  if (fallback) fallback.hidden = true;
  syncManagedPageSelection("Building Page");
}

function showSitemapPage() {
  document.body.classList.add("is-sitemap");
  document.body.classList.remove("is-building", "is-model", "is-unit");
  closeBuildingFlyouts();
  closeModelFlyouts();
  closeUnitFlyouts();
  if (buildingTools) buildingTools.hidden = true;
  if (buildingFrame) buildingFrame.hidden = true;
  if (modelTools) modelTools.hidden = true;
  if (modelFrame) modelFrame.hidden = true;
  if (unitTools) unitTools.hidden = true;
  if (unitFrame) unitFrame.hidden = true;
  syncOptionsContent();
  if (sitemapTools) sitemapTools.hidden = false;
  if (sitemapFrame) {
    if (sitemapFrame.dataset.loaded !== "true") {
      sitemapFrame.src = hostedCanvasSrc(SITEMAP_PAGE_SRC, "preview/github-sitemap.html");
      sitemapFrame.dataset.loaded = "true";
    }
    sitemapFrame.hidden = false;
  }
  if (iframe) iframe.hidden = true;
  if (fallback) fallback.hidden = true;
  syncManagedPageSelection("Sitemap Page");
}

function showModelPage() {
  document.body.classList.add("is-model");
  document.body.classList.remove("is-building", "is-sitemap", "is-unit");
  closeBuildingFlyouts();
  closeSitemapFlyouts();
  closeUnitFlyouts();
  if (buildingTools) buildingTools.hidden = true;
  if (buildingFrame) buildingFrame.hidden = true;
  if (sitemapTools) sitemapTools.hidden = true;
  if (sitemapFrame) sitemapFrame.hidden = true;
  if (unitTools) unitTools.hidden = true;
  if (unitFrame) unitFrame.hidden = true;
  syncOptionsContent();
  if (modelTools) modelTools.hidden = false;
  if (modelFrame) {
    if (modelFrame.dataset.loaded !== "true") {
      modelFrame.src = hostedCanvasSrc(MODEL_PAGE_SRC, "preview/github-model.html");
      modelFrame.dataset.loaded = "true";
    }
    modelFrame.hidden = false;
  }
  if (iframe) iframe.hidden = true;
  if (fallback) fallback.hidden = true;
  syncOptionsContent();
  syncManagedPageSelection("Model Page");
}

function showUnitPage() {
  document.body.classList.add("is-unit");
  document.body.classList.remove("is-building", "is-sitemap", "is-model");
  closeBuildingFlyouts();
  closeSitemapFlyouts();
  closeModelFlyouts();
  if (buildingTools) buildingTools.hidden = true;
  if (buildingFrame) buildingFrame.hidden = true;
  if (sitemapTools) sitemapTools.hidden = true;
  if (sitemapFrame) sitemapFrame.hidden = true;
  if (modelTools) modelTools.hidden = true;
  if (modelFrame) modelFrame.hidden = true;
  if (unitTools) unitTools.hidden = false;
  if (unitFrame) {
    if (unitFrame.dataset.loaded !== "true") {
      unitFrame.src = hostedCanvasSrc(UNIT_PAGE_SRC, "preview/github-unit.html");
      unitFrame.dataset.loaded = "true";
    }
    unitFrame.hidden = false;
  }
  if (iframe) iframe.hidden = true;
  if (fallback) fallback.hidden = true;
  syncOptionsContent();
  syncManagedPageSelection("Unit Page");
}

function showLivePage(managedName) {
  document.body.classList.remove("is-building", "is-sitemap", "is-model", "is-unit");
  closeBuildingFlyouts();
  closeSitemapFlyouts();
  closeModelFlyouts();
  closeUnitFlyouts();
  if (buildingTools) buildingTools.hidden = true;
  if (buildingFrame) buildingFrame.hidden = true;
  if (sitemapTools) sitemapTools.hidden = true;
  if (sitemapFrame) sitemapFrame.hidden = true;
  if (modelTools) modelTools.hidden = true;
  if (modelFrame) modelFrame.hidden = true;
  if (unitTools) unitTools.hidden = true;
  if (unitFrame) unitFrame.hidden = true;
  if (iframe) iframe.hidden = false;
  syncOptionsContent();
  syncManagedPageSelection(managedName || "");
}

function buildingSectionButtons() {
  return [...document.querySelectorAll("#bld-sections-panel .sp-sections-option[data-section]")];
}

function syncBuildingSectionsLabel() {
  const buttons = buildingSectionButtons();
  const on = buttons.filter((button) => button.getAttribute("aria-selected") === "true");
  const label = document.querySelector("#bld-sections-value");
  const all = document.querySelector("#bld-sections-panel [data-section-all]");
  if (all) all.setAttribute("aria-selected", String(on.length === buttons.length && buttons.length > 0));
  if (!label) return;
  if (on.length === buttons.length) setSectionsLabel(label, "Show All");
  else setSectionsLabel(label, "Custom");
}

function toggleBuildingSection(button) {
  const buttons = buildingSectionButtons();
  if (button.dataset.sectionAll) {
    const turnOn = button.getAttribute("aria-selected") !== "true";
    buttons.forEach((item) => item.setAttribute("aria-selected", String(turnOn)));
  } else {
    const next = button.getAttribute("aria-selected") !== "true";
    button.setAttribute("aria-selected", String(next));
  }
  syncBuildingSectionsLabel();
}

buildingTools?.addEventListener("click", (event) => {
  event.stopPropagation();
  hideTooltip();
  const trigger = event.target.closest("[aria-controls]");
  if (trigger?.id === "bld-options-trigger") {
    const willOpen = optionsPanel.hidden;
    closeMenus();
    if (willOpen) openOptionsPanel();
    else closeOptionsPanel();
    return;
  }
  const sectionOption = event.target.closest("#bld-sections-panel .sp-sections-option");
  if (sectionOption) {
    toggleBuildingSection(sectionOption);
    return;
  }
  if (trigger && buildingTools.contains(trigger)) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel?.classList.contains("bld-flyout") || panel?.id === "bld-sections-panel") {
      const open = panel.hidden;
      closeBuildingFlyouts();
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      event.stopPropagation();
      return;
    }
  }
  const color = event.target.closest(".bld-color-row");
  if (color) {
    buildingTools.querySelectorAll(".bld-color-row").forEach((row) => {
      const on = row === color;
      row.classList.toggle("is-selected", on);
      row.setAttribute("aria-selected", String(on));
    });
    const swatch = document.querySelector("#bld-swatch");
    if (swatch) swatch.style.background = color.dataset.hex;
    return;
  }
  const zoomBtn = event.target.closest(".bld-zoom-btn");
  if (zoomBtn) {
    if (zoomBtn.disabled) return;
    const current = Number(document.querySelector("#bld-zoom-value")?.textContent) || 1;
    setBuildingZoom(current + (zoomBtn.dataset.zoom === "up" ? 1 : -1));
    return;
  }
  const choice = event.target.closest(".bld-choice");
  if (choice) {
    choice.parentElement.querySelectorAll(".bld-choice").forEach((item) => {
      const on = item === choice;
      item.classList.toggle("is-selected", on);
      item.setAttribute("aria-pressed", String(on));
    });
  }
});

function setZoomValue(panel, valueId, next) {
  const value = Math.min(5, Math.max(1, next));
  const root = document.querySelector(panel);
  const label = document.querySelector(valueId);
  const up = root?.querySelector('[data-zoom="up"]');
  const down = root?.querySelector('[data-zoom="down"]');
  if (label) label.textContent = String(value);
  if (up) up.disabled = value >= 5;
  if (down) down.disabled = value <= 1;
}

function setBuildingZoom(next) {
  setZoomValue("#bld-pan-panel", "#bld-zoom-value", next);
}

function setSitemapZoom(next) {
  setZoomValue("#smap-pan-panel", "#smap-zoom-value", next);
}

const SITEMAP_RADIUS_MIN = 0;
const SITEMAP_RADIUS_MAX = 200;

function setSitemapRadius(next) {
  const value = Math.min(SITEMAP_RADIUS_MAX, Math.max(SITEMAP_RADIUS_MIN, next));
  const input = document.querySelector("#smap-radius-value");
  const root = document.querySelector("#smap-settings-panel");
  if (input && document.activeElement !== input) input.value = String(value);
  const up = root?.querySelector('[data-radius="up"]');
  const down = root?.querySelector('[data-radius="down"]');
  if (up) up.disabled = value >= SITEMAP_RADIUS_MAX;
  if (down) down.disabled = value <= SITEMAP_RADIUS_MIN;
  return value;
}

function commitSitemapRadius() {
  const input = document.querySelector("#smap-radius-value");
  if (!input) return;
  const raw = Number.parseInt(String(input.value).replace(/[^\d]/g, ""), 10);
  const value = setSitemapRadius(Number.isFinite(raw) ? raw : 20);
  input.value = String(value);
}

function sitemapSectionButtons() {
  return [...document.querySelectorAll("#smap-sections-panel .sp-sections-option[data-section]")];
}

function syncSitemapSectionsLabel() {
  const buttons = sitemapSectionButtons();
  const on = buttons.filter((button) => button.getAttribute("aria-selected") === "true");
  const label = document.querySelector("#smap-sections-value");
  const all = document.querySelector("#smap-sections-panel [data-section-all]");
  if (all) all.setAttribute("aria-selected", String(on.length === buttons.length && buttons.length > 0));
  if (!label) return;
  if (on.length === buttons.length) setSectionsLabel(label, "Show All");
  else setSectionsLabel(label, "Custom");
}

function modelSectionButtons() {
  return [...document.querySelectorAll("#mdl-sections-panel .sp-sections-option[data-section]")];
}

function syncModelSectionsLabel() {
  const buttons = modelSectionButtons();
  const on = buttons.filter((button) => button.getAttribute("aria-selected") === "true");
  const label = document.querySelector("#mdl-sections-value");
  const all = document.querySelector("#mdl-sections-panel [data-section-all]");
  if (all) all.setAttribute("aria-selected", String(on.length === buttons.length && buttons.length > 0));
  if (!label) return;
  if (on.length === buttons.length) setSectionsLabel(label, "Show All");
  else setSectionsLabel(label, "Custom");
}

function unitSectionButtons() {
  return [...document.querySelectorAll("#unt-sections-panel .sp-sections-option[data-section]")];
}

function syncUnitSectionsLabel() {
  const buttons = unitSectionButtons();
  const on = buttons.filter((button) => button.getAttribute("aria-selected") === "true");
  const label = document.querySelector("#unt-sections-value");
  if (!label) return;
  if (on.length === buttons.length) setSectionsLabel(label, "Show All");
  else setSectionsLabel(label, "Custom");
}

function toggleUnitSection(button) {
  const next = button.getAttribute("aria-selected") !== "true";
  button.setAttribute("aria-selected", String(next));
  syncUnitSectionsLabel();
}

function toggleModelSection(button) {
  const buttons = modelSectionButtons();
  if (button.dataset.sectionAll) {
    const turnOn = button.getAttribute("aria-selected") !== "true";
    buttons.forEach((item) => item.setAttribute("aria-selected", String(turnOn)));
  } else {
    const next = button.getAttribute("aria-selected") !== "true";
    button.setAttribute("aria-selected", String(next));
  }
  syncModelSectionsLabel();
}

function toggleSitemapSection(button) {
  const buttons = sitemapSectionButtons();
  if (button.dataset.sectionAll) {
    const turnOn = button.getAttribute("aria-selected") !== "true";
    buttons.forEach((item) => item.setAttribute("aria-selected", String(turnOn)));
  } else {
    const next = button.getAttribute("aria-selected") !== "true";
    button.setAttribute("aria-selected", String(next));
  }
  syncSitemapSectionsLabel();
}

setBuildingZoom(1);
setSitemapZoom(1);
setSitemapRadius(20);
const sitemapRadiusInput = document.querySelector("#smap-radius-value");
sitemapRadiusInput?.addEventListener("change", commitSitemapRadius);
sitemapRadiusInput?.addEventListener("blur", commitSitemapRadius);
sitemapRadiusInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    commitSitemapRadius();
  }
});
syncBuildingSectionsLabel();
syncSitemapSectionsLabel();
syncModelSectionsLabel();
syncUnitSectionsLabel();

document.addEventListener("click", (event) => {
  if (!buildingTools || buildingTools.hidden) return;
  if (event.target.closest("#building-tools")) return;
  closeBuildingFlyouts();
});

sitemapTools?.addEventListener("click", (event) => {
  event.stopPropagation();
  hideTooltip();
  const trigger = event.target.closest("[aria-controls]");
  if (trigger?.id === "smap-options-trigger") {
    const willOpen = optionsPanel.hidden;
    closeMenus();
    if (willOpen) openOptionsPanel();
    else closeOptionsPanel();
    return;
  }
  if (event.target.closest("#smap-color-panel .sp-color-field, #smap-settings-panel .sp-color-field")) return;
  closeColorMenus();
  const radiusBtn = event.target.closest("#smap-settings-panel [data-radius]");
  if (radiusBtn) {
    if (radiusBtn.disabled) return;
    const current = Number.parseInt(document.querySelector("#smap-radius-value")?.value, 10);
    setSitemapRadius((Number.isFinite(current) ? current : 20) + (radiusBtn.dataset.radius === "up" ? 1 : -1));
    return;
  }
  const sectionOption = event.target.closest("#smap-sections-panel .sp-sections-option");
  if (sectionOption) {
    toggleSitemapSection(sectionOption);
    return;
  }
  const zoomBtn = event.target.closest("#smap-pan-panel .bld-zoom-btn");
  if (zoomBtn) {
    if (zoomBtn.disabled) return;
    const current = Number(document.querySelector("#smap-zoom-value")?.textContent) || 1;
    setSitemapZoom(current + (zoomBtn.dataset.zoom === "up" ? 1 : -1));
    return;
  }
  const choice = event.target.closest("#sitemap-tools .bld-choice");
  if (choice) {
    choice.parentElement.querySelectorAll(".bld-choice").forEach((item) => {
      const on = item === choice;
      item.classList.toggle("is-selected", on);
      item.setAttribute("aria-pressed", String(on));
    });
    return;
  }
  if (trigger && sitemapTools.contains(trigger)) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel?.classList.contains("bld-flyout") || panel?.id === "smap-sections-panel") {
      const open = panel.hidden;
      closeSitemapFlyouts();
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    }
  }
});

document.addEventListener("click", (event) => {
  if (!sitemapTools || sitemapTools.hidden) return;
  if (event.target.closest("#sitemap-tools")) return;
  if (event.target.closest("#options-panel") || event.target.closest("#smap-options-trigger")) return;
  closeSitemapFlyouts();
});

const sitemapButton = pageMenu?.querySelector('[data-canvas="sitemap"]');
if (sitemapButton && new URLSearchParams(location.search).get("page") === "sitemap") {
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === sitemapButton));
  });
  pageName.textContent = sitemapButton.dataset.page;
  showSitemapPage();
}

const buildingButton = pageMenu?.querySelector('[data-canvas="building"]');
if (buildingButton && new URLSearchParams(location.search).get("page") === "building") {
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === buildingButton));
  });
  pageName.textContent = buildingButton.dataset.page;
  showBuildingPage();
}

modelTools?.addEventListener("click", (event) => {
  event.stopPropagation();
  hideTooltip();
  const visibility = event.target.closest("#mdl-visibility");
  if (visibility) {
    const hiding = visibility.classList.contains("is-shown");
    visibility.classList.toggle("is-shown", !hiding);
    visibility.classList.toggle("is-hidden", hiding);
    const label = hiding ? "Visibility: Inactive" : "Visibility: Active";
    visibility.setAttribute("aria-pressed", String(!hiding));
    visibility.setAttribute("aria-label", label);
    visibility.dataset.tooltip = label;
    document.querySelector("#viewport-frame")?.classList.toggle("is-page-hidden", hiding);
    announce(hiding ? "Page hidden" : "Page shown");
    return;
  }
  const trigger = event.target.closest("[aria-controls]");
  if (trigger?.id === "mdl-options-trigger") {
    const willOpen = optionsPanel.hidden;
    closeMenus();
    if (willOpen) openOptionsPanel();
    else closeOptionsPanel();
    return;
  }
  const sectionOption = event.target.closest("#mdl-sections-panel .sp-sections-option");
  if (sectionOption) {
    toggleModelSection(sectionOption);
    return;
  }
  const choice = event.target.closest("#model-tools .bld-choice");
  if (choice) {
    if (choice.parentElement?.dataset.multi === "true") {
      const on = choice.getAttribute("aria-pressed") !== "true";
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-pressed", String(on));
    } else {
      choice.parentElement.querySelectorAll(".bld-choice").forEach((item) => {
        const on = item === choice;
        item.classList.toggle("is-selected", on);
        item.setAttribute("aria-pressed", String(on));
      });
    }
    return;
  }
  if (trigger && modelTools.contains(trigger)) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel?.classList.contains("bld-flyout") || panel?.id === "mdl-sections-panel") {
      const open = panel.hidden;
      closeModelFlyouts();
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    }
  }
});

document.addEventListener("click", (event) => {
  if (!modelTools || modelTools.hidden) return;
  if (event.target.closest("#model-tools")) return;
  if (event.target.closest("#options-panel") || event.target.closest("#mdl-options-trigger")) return;
  closeModelFlyouts();
});

const modelButton = pageMenu?.querySelector('[data-canvas="model"]');
if (modelButton && new URLSearchParams(location.search).get("page") === "model") {
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === modelButton));
  });
  pageName.textContent = modelButton.dataset.page;
  showModelPage();
}

unitTools?.addEventListener("click", (event) => {
  event.stopPropagation();
  hideTooltip();
  const trigger = event.target.closest("[aria-controls]");
  if (trigger?.id === "unt-options-trigger") {
    const willOpen = optionsPanel.hidden;
    closeMenus();
    if (willOpen) openOptionsPanel();
    else closeOptionsPanel();
    return;
  }
  const sectionOption = event.target.closest("#unt-sections-panel .sp-sections-option");
  if (sectionOption) {
    toggleUnitSection(sectionOption);
    return;
  }
  const choice = event.target.closest("#unit-tools .bld-choice");
  if (choice) {
    if (choice.parentElement?.dataset.multi === "true") {
      const on = choice.getAttribute("aria-pressed") !== "true";
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-pressed", String(on));
    } else {
      choice.parentElement.querySelectorAll(".bld-choice").forEach((item) => {
        const on = item === choice;
        item.classList.toggle("is-selected", on);
        item.setAttribute("aria-pressed", String(on));
      });
    }
    return;
  }
  if (trigger && unitTools.contains(trigger)) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel?.classList.contains("bld-flyout") || panel?.id === "unt-sections-panel") {
      const open = panel.hidden;
      closeUnitFlyouts();
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    }
  }
});

document.addEventListener("click", (event) => {
  if (!unitTools || unitTools.hidden) return;
  if (event.target.closest("#unit-tools")) return;
  if (event.target.closest("#options-panel") || event.target.closest("#unt-options-trigger")) return;
  closeUnitFlyouts();
});

function unitButtonRow(label = "", link = "") {
  const row = document.createElement("article");
  row.className = "unit-button-card";
  row.innerHTML = `
    <div class="unit-button-head">
      <label class="bld-field"><span>Button Label</span><input type="text" value="${label}" /></label>
      <button type="button" class="unit-icon-btn" data-remove="button" aria-label="Delete button">
        <img src="assets/static-pages/icon-unit-button-delete.svg" alt="" width="28" height="28" />
      </button>
    </div>
    <div class="unit-button-body">
      <label class="bld-field"><span>Link</span><input type="text" value="${link}" /></label>
      <div class="unit-select">
        <span class="unit-select-label">Button Color</span>
        <button type="button" class="unit-select-trigger" aria-expanded="false" aria-haspopup="listbox">
          <span class="unit-select-value">Transparent</span>
          <img src="assets/static-pages/icon-unit-button-angle.svg" alt="" width="10.7812" height="6.10107" />
        </button>
        <ul class="unit-select-menu" role="listbox" hidden>
          <li><button type="button" role="option" aria-selected="true">Transparent</button></li>
          <li><button type="button" role="option" aria-selected="false">Primary</button></li>
          <li><button type="button" role="option" aria-selected="false">Secondary</button></li>
        </ul>
      </div>
    </div>`;
  return row;
}

function addUnitTile() {
  const list = document.querySelector("#unit-tiles");
  const empty = document.querySelector("#unit-tiles-empty");
  if (!list) return;
  const tile = document.createElement("article");
  tile.className = "unit-tile unit-button-card";
  tile.innerHTML = `
    <div class="unit-button-head">
      <label class="bld-field"><span>Label</span><input type="text" /></label>
      <button type="button" class="unit-icon-btn" data-remove="tile" aria-label="Delete tile">
        <img src="assets/static-pages/icon-unit-button-delete.svg" alt="" width="28" height="28" />
      </button>
    </div>
    <div class="unit-button-body">
      <label class="bld-field"><span>Value</span><input type="text" /></label>
    </div>`;
  list.appendChild(tile);
  if (empty) empty.hidden = true;
  tile.querySelector("input")?.focus();
}

function closeUnitSelects(except) {
  document.querySelectorAll("#options-unit-body .unit-select-menu").forEach((menu) => {
    if (menu === except) return;
    menu.hidden = true;
    menu.closest(".unit-select")?.querySelector(".unit-select-trigger")?.setAttribute("aria-expanded", "false");
  });
}

const unitOptions = document.querySelector("#options-unit-body");
unitOptions?.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  if (add) {
    if (add.dataset.add === "tile") addUnitTile();
    if (add.dataset.add === "button") {
      const list = document.querySelector("#unit-buttons");
      const row = unitButtonRow();
      list?.appendChild(row);
      row.querySelector("input")?.focus();
    }
    return;
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    if (remove.dataset.remove === "tile") {
      remove.closest(".unit-tile")?.remove();
      const list = document.querySelector("#unit-tiles");
      const empty = document.querySelector("#unit-tiles-empty");
      if (empty && list && !list.children.length) empty.hidden = false;
    }
    if (remove.dataset.remove === "button") remove.closest(".unit-button-card")?.remove();
    return;
  }
  const edit = event.target.closest("[data-edit]");
  if (edit) {
    edit.closest(".unit-button-card")?.querySelector("input")?.focus();
    return;
  }
  const option = event.target.closest(".unit-select-menu button");
  if (option) {
    const select = option.closest(".unit-select");
    const value = select?.querySelector(".unit-select-value");
    if (value) value.textContent = option.textContent;
    select?.querySelectorAll(".unit-select-menu button").forEach((item) => {
      item.setAttribute("aria-selected", String(item === option));
    });
    closeUnitSelects();
    return;
  }
  const selectTrigger = event.target.closest(".unit-select-trigger");
  if (selectTrigger) {
    const menu = selectTrigger.parentElement?.querySelector(".unit-select-menu");
    const willOpen = menu?.hidden;
    closeUnitSelects(willOpen ? menu : null);
    if (menu) menu.hidden = !willOpen;
    selectTrigger.setAttribute("aria-expanded", String(Boolean(willOpen)));
    return;
  }
  const choice = event.target.closest(".bld-choice");
  if (choice) {
    if (choice.parentElement?.dataset.multi === "true") {
      const on = choice.getAttribute("aria-pressed") !== "true";
      choice.classList.toggle("is-selected", on);
      choice.setAttribute("aria-pressed", String(on));
    }
    return;
  }
  closeUnitSelects();
});

unitOptions?.addEventListener("pointerdown", (event) => {
  const grip = event.target.closest(".unit-grip");
  if (!grip) return;
  const field = grip.closest(".unit-area-field")?.querySelector("textarea");
  if (!field) return;
  event.preventDefault();
  const startY = event.clientY;
  const startHeight = field.getBoundingClientRect().height;
  const move = (ev) => {
    field.style.height = `${Math.max(80, startHeight + (ev.clientY - startY))}px`;
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
});

const unitButton = pageMenu?.querySelector('[data-canvas="unit"]');
if (unitButton && new URLSearchParams(location.search).get("page") === "unit") {
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === unitButton));
  });
  pageName.textContent = unitButton.dataset.page;
  showUnitPage();
}

// The shared GitHub Pages link has no page query. Open Building there.
// Localhost keeps Meadow View Lodge unless a page is requested.
if (buildingButton && !new URLSearchParams(location.search).get("page") && !usesLocalPreviewProxy()) {
  pageMenu.querySelectorAll(".sp-page-entries [role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === buildingButton));
  });
  pageName.textContent = buildingButton.dataset.page;
  showBuildingPage();
}
