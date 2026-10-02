const hero = document.querySelector(".hero");
const header = document.querySelector(".header");
const headerInner = document.querySelector(".header-inner");
const layers = [
  { element: document.querySelector(".kiwi-art"), speed: 0.85 },
  { element: document.querySelector(".kiwi-blob"), speed: 0.65 }
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;
let heroBottom = 0;
let headerHeight = 0;

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
  const bottom = heroBottom - scroll;
  for (const layer of layers) {
    const top = layer.top - scroll * layer.speed;
    layer.element.style.transform = `translate3d(0, ${-scroll * layer.speed}px, 0)`;
    layer.element.style.setProperty("--clip-top", `${Math.max(0, headerHeight - top)}px`);
    layer.element.style.setProperty("--clip-bottom", `${Math.max(0, top + layer.height - bottom)}px`);
    layer.element.style.visibility = bottom <= headerHeight ? "hidden" : "visible";
  }
}

function measure() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  hero.classList.remove("hero-motion");
  for (const layer of layers) layer.element.removeAttribute("style");
  headerHeight = headerInner.getBoundingClientRect().height;
  header.style.setProperty("--header-visible-height", `${headerHeight}px`);
  if (reducedMotion.matches) return;
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
