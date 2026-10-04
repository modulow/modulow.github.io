import { contentView } from "./backend/validation.js";

function message(element, text, error = false) {
  element.hidden = false;
  element.textContent = text;
  element.dataset.error = String(error);
}

const SHAREPOINT_HOST = "europarl.sharepoint.com";
const TICKET_SITE = "learn.IT-Kiwi";

function sharePointUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== SHAREPOINT_HOST ||
      url.username || url.password || url.port || url.hash) {
    throw new Error("Invalid SharePoint URL.");
  }
  return url;
}

function listLink(value, list) {
  const url = sharePointUrl(value);
  if (url.search || url.pathname !== `/sites/${TICKET_SITE}/Lists/${list}/AllItems.aspx`) {
    throw new Error(`Invalid SharePoint ${list} list URL.`);
  }
  return url.href;
}

export function ticketsLink(value) {
  return listLink(value, "EuropaTickets");
}

export function ticketAgentsLink(value) {
  return listLink(value, "TicketExchanges");
}

export function ticketSubmitLink(value) {
  const url = sharePointUrl(value);
  const keys = [...url.searchParams.keys()];
  if (!new RegExp(`^/:l:/s/${TICKET_SITE.replace(".", "\\.")}/[A-Za-z0-9_-]{20,120}$`).test(url.pathname) ||
      keys.length !== 1 || keys[0] !== "nav" || !/^[A-Za-z0-9_-]{8,200}={0,2}$/.test(url.searchParams.get("nav"))) {
    throw new Error("Invalid SharePoint ticket form URL.");
  }
  return url.href;
}

function ticketLinks(config) {
  return {
    submit: ticketSubmitLink(config.ticketSubmitUrl),
    list: ticketsLink(config.ticketsUrl),
    agents: ticketAgentsLink(config.ticketAgentsUrl)
  };
}

function renderContent(content, document, window, nativeTickets) {
  const $ = selector => document.querySelector(selector);
  const page = content.page;
  const text = (selector, value) => { $(selector).textContent = value; };
  const leadingText = (element, value) => { element.firstChild.textContent = `${value} `; };
  text(".hero .eyebrow", page.eyebrow);
  page.headline.forEach((line, index) => text(`.headline-line:nth-child(${index + 1})`, line));
  page.intro.forEach((line, index) => text(`.intro-text > span:nth-child(${index + 1})`, line));
  leadingText($(".primary-link"), page.primaryLink);
  text(".section-heading .eyebrow", page.essentials);
  text("#access-title", page.appsTitle);
  page.steps.forEach((step, index) => {
    document.querySelectorAll(".wayfinding-step")[index].lastChild.textContent = ` ${step}`;
  });
  text(".destinations > .access-note", page.accessNote);
  text(".footer .eyebrow", page.footerEyebrow);
  const footer = $(".footer-title");
  const accent = document.createElement("span");
  accent.setAttribute("aria-hidden", "true");
  accent.textContent = ".";
  footer.replaceChildren(document.createTextNode(page.footerLines[0]), document.createElement("br"),
    document.createTextNode(page.footerLines[1].replace(/\.$/, "")), accent);
  for (const key of ["brochure", "schedule", "support"]) {
    const value = content[key];
    const card = $(`.card-${key}`);
    card.href = key === "support" ? nativeTickets || "#tickets" : value.href;
    for (const [selector, field] of [[".card-category", "category"], ["h3", "title"], [".card-description", "description"]]) {
      card.querySelector(selector).textContent = value[field];
    }
    leadingText(card.querySelector(".card-action"), value.action);
  }
  document.documentElement.dataset.contentState = "ready";
  $("#content-status").hidden = true;
  window.dispatchEvent(new window.Event("resize"));
}

export async function initializePortal(config, {
  document = globalThis.document, window = globalThis.window, fetcher = globalThis.fetch
} = {}) {
  const $ = selector => document.querySelector(selector);
  let nativeTickets;
  if (config.ticketsEnabled) {
    try {
      const links = ticketLinks(config);
      for (const [selector, href] of [["#ticket-link", links.submit], ["#ticket-list-link", links.list], ["#ticket-agents-link", links.agents]]) {
        $(selector).href = href;
        $(selector).hidden = false;
      }
      nativeTickets = links.submit;
      $(".card-support").href = nativeTickets;
      message($("#ticket-status"), "Create an IT ticket in SharePoint. Microsoft 365 sign-in is required there.");
    } catch {
      for (const selector of ["#ticket-link", "#ticket-list-link", "#ticket-agents-link"]) {
        $(selector).removeAttribute("href");
        $(selector).hidden = true;
      }
      $(".card-support").href = "#tickets";
      message($("#ticket-status"), "SharePoint ticket configuration is invalid. Access is unavailable.", true);
    }
  }
  if (!config.enabled) return;
  document.documentElement.dataset.contentState = "loading";
  message($("#content-status"), "Loading reviewed published content...");
  try {
    if (typeof config.contentRevision !== "string" || !/^[a-zA-Z0-9._-]{1,80}$/.test(config.contentRevision)) {
      throw new Error("Content revision is invalid.");
    }
    const url = new URL("./content.json", window.location.href);
    url.searchParams.set("v", config.contentRevision);
    const response = await fetcher(url.href, {
      method: "GET", cache: "no-store", credentials: "omit", redirect: "error",
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) throw new Error(`Content file request failed (${response.status}).`);
    if (!response.headers.get("Content-Type")?.includes("application/json")) throw new Error("Content file did not return JSON.");
    const content = contentView(await response.json());
    renderContent(content, document, window, nativeTickets);
  } catch {
    document.documentElement.dataset.contentState = "fallback";
    message($("#content-status"), "Published content is unavailable or invalid. The original portal content is shown instead.", true);
  }
}
