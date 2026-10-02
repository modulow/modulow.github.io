const loader = document.querySelector(".loader");
loader.hidden = false;
function dismissLoader() {
  if (loader.hidden) return;
  loader.hidden = true;
  window.dispatchEvent(new Event("portal-ready"));
}
setTimeout(dismissLoader, 1000);
document.addEventListener("focusin", dismissLoader, { once: true });
