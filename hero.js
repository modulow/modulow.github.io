const hero = document.querySelector(".hero");
const header = document.querySelector(".header");
const layers = [
  { element: document.querySelector(".kiwi-art"), speed: 0.85 },
  { element: document.querySelector(".kiwi-blob"), speed: 0.65 }
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;
let heroBottom = 0;
let headerHeight = 0;

function paint() {
  frame = 0;
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
  if (reducedMotion.matches) return;
  const scroll = window.scrollY;
  heroBottom = hero.getBoundingClientRect().bottom + scroll;
  headerHeight = header.getBoundingClientRect().height;
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
  if (!reducedMotion.matches && !frame) frame = requestAnimationFrame(paint);
}, { passive: true });
window.addEventListener("resize", measure);
window.addEventListener("load", measure);
reducedMotion.addEventListener("change", measure);
measure();
