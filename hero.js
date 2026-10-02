const hero = document.querySelector(".hero");
const header = document.querySelector(".header");
const headerInner = document.querySelector(".header-inner");
const layers = [
  { element: document.querySelector(".kiwi-large"), speed: 0.85, entranceDuration: 450 },
  { element: document.querySelector(".kiwi-small-upper"), speed: 0.85, entranceDuration: 800 },
  { element: document.querySelector(".kiwi-small-lower"), speed: 0.85, entranceDuration: 1200 },
  { element: document.querySelector(".kiwi-blob"), speed: 0.65, entranceDuration: 650, entranceDelay: 1200 }
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;
let heroBottom = 0;
let headerHeight = 0;
let entranceStart = !reducedMotion.matches && window.scrollY < 1
  ? (document.querySelector(".loader").hidden ? performance.now() + 1000 : Infinity)
  : null;
window.addEventListener("portal-ready", () => {
  if (!reducedMotion.matches && window.scrollY < 1) {
    entranceStart = performance.now() + 1000;
    if (!frame) frame = requestAnimationFrame(paint);
  }
}, { once: true });

function updateHeader() {
  const compact = window.scrollY > 48;
  if (header.classList.contains("is-compact") === compact) return false;
  header.classList.toggle("is-compact", compact);
  measure();

  return true;
}

function paint() {
  frame = 0;
  if (updateHeader()) return;
  if (reducedMotion.matches) return;
  const scroll = window.scrollY;
  if (scroll > 48) entranceStart = null;
  let entering = false;
  const bottom = heroBottom - scroll;
  for (const layer of layers) {
    const progress = entranceStart === null || !layer.entranceDuration ? 1 : Math.max(0, Math.min(1, (performance.now() - entranceStart - (layer.entranceDelay || 0)) / layer.entranceDuration));
    entering ||= progress < 1;
    const entranceOffset = layer.height * .85 * (1 - progress) ** 3;
    const displacement = -scroll * layer.speed + entranceOffset;
    const top = layer.top + displacement;
    layer.element.style.transform = `translate3d(0, ${displacement}px, 0)`;
    layer.element.style.opacity = layer.entranceDelay ? `${progress}` : "1";
    layer.element.style.setProperty("--clip-top", `${Math.max(0, headerHeight - top)}px`);
    layer.element.style.setProperty("--clip-bottom", `${Math.max(0, top + layer.height - bottom)}px`);
    layer.element.style.visibility = bottom <= headerHeight || progress === 0 ? "hidden" : "visible";
  }
  if (entering && entranceStart !== Infinity) frame = requestAnimationFrame(paint);
}

function measure() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  hero.classList.remove("hero-motion");
  for (const layer of layers) layer.element.removeAttribute("style");
  headerHeight = headerInner.getBoundingClientRect().height;
  header.style.setProperty("--header-visible-height", `${headerHeight}px`);
  if (reducedMotion.matches) {
    entranceStart = null;
    return;
  }
  const scroll = window.scrollY;
  heroBottom = hero.getBoundingClientRect().bottom + scroll;
  for (const layer of layers) {
    const rect = layer.element.getBoundingClientRect();
    layer.top = rect.top + scroll;
    layer.height = rect.height;
    layer.element.style.left = `${rect.left}px`;
    layer.element.style.top = `${layer.top}px`;
    layer.element.style.width = `${rect.width}px`;
  }
  hero.classList.add("hero-motion");
  paint();
}

window.addEventListener("scroll", () => {
  if (!frame) frame = requestAnimationFrame(paint);
}, { passive: true });
window.addEventListener("resize", () => {
  header.classList.remove("is-compact");
  header.style.height = "auto";
  header.style.height = `${header.getBoundingClientRect().height}px`;
  header.classList.toggle("is-compact", window.scrollY > 48);
  measure();
});
window.addEventListener("load", measure);
reducedMotion.addEventListener("change", measure);
// Reserve the expanded header's space so compaction cannot shift the page.
header.style.height = `${header.getBoundingClientRect().height}px`;
header.classList.toggle("is-compact", window.scrollY > 48);
measure();

const cards = document.querySelectorAll(".card");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const reveal = card => {
    card.classList.remove("card-pending");
    observer.unobserve(card);
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal(entry.target);
    }
  }, { threshold: 0.08 });
  for (const card of cards) {
    card.classList.add("card-reveal", "card-pending");
    card.addEventListener("focusin", () => reveal(card));
    observer.observe(card);
  }
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    for (const card of cards) reveal(card);
    observer.disconnect();
  });
}
