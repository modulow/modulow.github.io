const loader = document.querySelector(".loader");
loader.hidden = false;
function dismissLoader() {
  if (loader.hidden) return;
  loader.hidden = true;
  window.dispatchEvent(new Event("portal-ready"));
}
loader.addEventListener("animationend", event => {
  if (event.target === loader && event.animationName === "loader-reveal") dismissLoader();
});
setTimeout(dismissLoader, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1000 : 1850);
document.addEventListener("focusin", dismissLoader, { once: true });
