import config from "./portal-config.js";

const TICKET_MESSAGE = "kiwi-ticket-created";
const SHAREPOINT_HOST = "europarl.sharepoint.com";
const TICKETS_PATH = "/sites/learn.IT-Kiwi/Lists/EuropaTickets/";

export function buildTicketFormUrl(listUrl, callbackUrl) {
  const list = new URL(listUrl);
  const callback = new URL(callbackUrl);

  if (
    list.protocol !== "https:" ||
    list.hostname !== SHAREPOINT_HOST ||
    !list.pathname.startsWith(TICKETS_PATH)
  ) {
    throw new Error("Invalid SharePoint ticket list URL.");
  }

  const form = new URL(`${TICKETS_PATH}NewForm.aspx`, list.origin);
  form.searchParams.set("Source", callback.href);
  return form.href;
}

function setStatus(message) {
  const status = document.getElementById("ticket-status");
  if (status) status.textContent = message;
}

function openTicketForm(event) {
  event?.preventDefault();

  let ticketUrl;
  try {
    ticketUrl = buildTicketFormUrl(
      config.ticketsUrl,
      new URL("./ticket-sent.html", window.location.href)
    );
  } catch {
    setStatus("The ticket form is temporarily unavailable.");
    return;
  }

  const popup = window.open(
    ticketUrl,
    "kiwi-ticket-form",
    "popup=yes,width=760,height=860,resizable=yes,scrollbars=yes"
  );

  if (!popup) {
    setStatus("Your browser blocked the ticket window. Allow pop-ups for Kiwi and try again.");
    return;
  }

  popup.focus();
  setStatus("The secure Microsoft 365 ticket window is open. Kiwi will stay here for you.");
}

export function initializeTicketPopup() {
  if (!config.ticketsEnabled) return;

  const ticketLink = document.getElementById("ticket-link");
  const supportCard = document.querySelector(".card-support");

  if (ticketLink) {
    ticketLink.hidden = false;
    ticketLink.href = `${TICKETS_PATH}NewForm.aspx`;
    ticketLink.removeAttribute("target");
    ticketLink.removeAttribute("rel");
    ticketLink.addEventListener("click", openTicketForm);
  }

  if (supportCard) {
    supportCard.href = `${TICKETS_PATH}NewForm.aspx`;
    supportCard.addEventListener("click", openTicketForm);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== TICKET_MESSAGE) return;

    setStatus("Your ticket was submitted successfully.");
    window.focus();
  });

  setStatus("Create a ticket securely with your Microsoft 365 account, or view your existing tickets.");
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initializeTicketPopup();
}
