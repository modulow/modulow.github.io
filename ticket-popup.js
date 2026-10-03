import config from "./portal-config.js";

const SUPPORT_APP_URL = "https://ep.europa.kiwi/sharepoint-ticketing/";

function applyTicketingLinks() {
  const supportCard = document.querySelector(".card-support");
  const createLink = document.getElementById("ticket-link");
  const ticketsLink = document.getElementById("ticket-list-link");
  const status = document.getElementById("ticket-status");

  if (supportCard && supportCard.href !== SUPPORT_APP_URL) {
    supportCard.href = SUPPORT_APP_URL;
  }

  if (createLink) {
    const createUrl = `${SUPPORT_APP_URL}?action=create`;
    if (createLink.hidden) createLink.hidden = false;
    if (createLink.href !== createUrl) createLink.href = createUrl;
    if (createLink.hasAttribute("target")) createLink.removeAttribute("target");
    if (createLink.hasAttribute("rel")) createLink.removeAttribute("rel");
  }

  if (ticketsLink) {
    const ticketsUrl = `${SUPPORT_APP_URL}?action=tickets`;
    if (ticketsLink.href !== ticketsUrl) ticketsLink.href = ticketsUrl;
    if (ticketsLink.hasAttribute("target")) ticketsLink.removeAttribute("target");
    if (ticketsLink.hasAttribute("rel")) ticketsLink.removeAttribute("rel");
  }

  if (status) {
    const message = "Open the ticketing application to create and manage your requests securely.";
    if (status.textContent !== message) status.textContent = message;
  }
}

export function initializeTicketingLinks() {
  if (!config.ticketsEnabled) return;

  applyTicketingLinks();
  const observer = new MutationObserver(applyTicketingLinks);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["href", "hidden", "target", "rel"],
    childList: true,
    subtree: true
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initializeTicketingLinks();
}
