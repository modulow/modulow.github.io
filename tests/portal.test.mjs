import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initializePortal, ticketAgentsLink, ticketSubmitLink, ticketsLink } from "../portal-ui.js";
import { contentView } from "../backend/validation.js";
import config from "../portal-config.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const seed = JSON.parse(await readFile(new URL("../backend/content-seed.json", import.meta.url), "utf8"));
const content = () => ({ schemaVersion: 1, records: seed.map(value => ({ ...structuredClone(value), Published: true })) });
const native = "https://europarl.sharepoint.com/sites/learn.IT-Kiwi/Lists/EuropaTickets/AllItems.aspx";
const submit = "https://europarl.sharepoint.com/:l:/s/learn.IT-Kiwi/JAAt_nP2M5fdRpr-S_YUyZICAaohrMu1P2lFpVhNeblaX-k?nav=Nzk3NjUwYjUtNmViMi00YzE1LTlhM2EtMDg4MzY3ZjlmZDBh";
const agents = "https://europarl.sharepoint.com/sites/learn.IT-Kiwi/Lists/TicketExchanges/AllItems.aspx";
const ticketSettings = { ticketsEnabled: true, ticketSubmitUrl: submit, ticketsUrl: native, ticketAgentsUrl: agents };
const settings = { enabled: true, contentRevision: "reviewed-2", ...ticketSettings };
const ticketIds = ["#ticket-link", "#ticket-list-link", "#ticket-agents-link"];
const dom = () => new JSDOM(html, { url: "https://ep.europa.kiwi" });
const json = body => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

test("disabled configuration preserves original content/links without network or authentication", async () => {
  const window = dom().window;
  const document = window.document;
  const original = document.querySelector(".card-support").href;
  await initializePortal({ ...config, enabled: false, ticketsEnabled: false }, { document, window, fetcher: () => assert.fail("No network while disabled") });
  assert.equal(document.querySelector(".card-support").href, original);
  assert.equal(document.querySelector(".headline-line").textContent, "Fresh apps.");
  assert.equal(original, "https://ep.europa.kiwi/#tickets");
  for (const id of ticketIds) assert.equal(document.querySelector(id).hidden, true);
  assert.equal(document.querySelector("#ticket-form"), null);
  assert.equal(html.includes("ticket-popup"), false);
  assert.equal(html.includes("sharepoint-ticketing"), false);
  assert.equal(html.includes("msal"), false);
  window.close();
});

test("published repository file validates and public config contains only navigation links", async () => {
  const published = JSON.parse(await readFile(new URL("../content.json", import.meta.url), "utf8"));
  assert.doesNotThrow(() => contentView(published));
  assert.deepEqual(published.records.map(record => record.Title).sort(), ["brochure", "page", "schedule", "support"]);
  assert.equal(config.enabled, true);
  assert.equal(config.ticketsEnabled, true);
  assert.deepEqual(Object.keys(config).sort(), ["contentRevision", "enabled", "ticketAgentsUrl", "ticketSubmitUrl", "ticketsEnabled", "ticketsUrl"]);
  assert.equal(ticketSubmitLink(config.ticketSubmitUrl), submit);
  assert.equal(ticketsLink(config.ticketsUrl), native);
  assert.equal(ticketAgentsLink(config.ticketAgentsUrl), agents);
  const source = [JSON.stringify(published), JSON.stringify(config), html].join("\n");
  assert.doesNotMatch(source, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "No email addresses in public files");
  assert.doesNotMatch(source, /i:0#\.f\|membership|claims|\/_api\//i, "No membership claims or SharePoint API endpoints");
});

test("activated content updates text safely, keeps artwork/icons/classes and uses native ticket link", async () => {
  const window = dom().window;
  const document = window.document;
  const value = content();
  value.records[0].Payload.headline[0] = "<img src=x onerror=alert(1)>";
  const icons = [...document.querySelectorAll(".card svg")].map(element => element.outerHTML);
  const artwork = document.querySelector(".kiwi-feature").innerHTML;
  let calls = 0;
  await initializePortal(settings, { document, window, fetcher: async (url, options) => {
    calls++;
    assert.equal(url, "https://ep.europa.kiwi/content.json?v=reviewed-2");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers, undefined);
    return json(value);
  } });
  assert.equal(document.documentElement.dataset.contentState, "ready");
  assert.equal(document.querySelector(".headline-line").textContent, value.records[0].Payload.headline[0]);
  assert.equal(document.querySelector(".headline-line img"), null);
  assert.equal(document.querySelector(".kiwi-feature").innerHTML, artwork);
  assert.deepEqual([...document.querySelectorAll(".card svg")].map(element => element.outerHTML), icons);
  assert.equal(document.querySelector(".card-support").href, submit);
  assert.equal(document.querySelector("#ticket-link").href, submit);
  assert.equal(document.querySelector("#ticket-list-link").href, native);
  assert.equal(document.querySelector("#ticket-agents-link").href, agents);
  for (const id of ticketIds) assert.equal(document.querySelector(id).hidden, false);
  assert.equal(document.querySelector("#content-status").hidden, true);
  assert.equal(calls, 1);
  window.close();
});

test("invalid or missing file preserves the existing DOM with an explicit fallback warning", async () => {
  for (const fetcher of [
    async () => { throw new Error("Network"); },
    async () => new Response("fail", { status: 503 }),
    async () => new Response("missing", { status: 404 }),
    async () => new Response("{bad", { headers: { "Content-Type": "application/json" } }),
    async () => json({ ...content(), privateTickets: [] }),
    async () => { const value = content(); value.records[0].Payload.headline = ["one"]; return json(value); },
    async () => new Response("<html>", { headers: { "Content-Type": "text/html" } })
  ]) {
    const window = dom().window;
    const originalHero = window.document.querySelector(".hero-copy").innerHTML;
    const originalCards = [...window.document.querySelectorAll(".card:not(.card-support)")].map(card => card.outerHTML);
    await initializePortal(settings, { document: window.document, window, fetcher });
    assert.equal(window.document.documentElement.dataset.contentState, "fallback");
    assert.equal(window.document.querySelector("#content-status").dataset.error, "true");
    assert.equal(window.document.querySelector("#content-status").hidden, false);
    assert.equal(window.document.querySelector("#ticket-link").href, submit);
    assert.equal(window.document.querySelector(".headline-line").textContent, "Fresh apps.");
    assert.equal(window.document.querySelector(".hero-copy").innerHTML, originalHero);
    assert.deepEqual([...window.document.querySelectorAll(".card:not(.card-support)")].map(card => card.outerHTML), originalCards);
    assert.match(window.document.querySelector("#content-status").textContent, /original portal content/);
    window.close();
  }
});

test("ticket links activate independently without fetching any ticket or people data", async () => {
  const window = dom().window;
  await initializePortal({ ...settings, enabled: false }, { document: window.document, window, fetcher: () => assert.fail("No API") });
  assert.equal(window.document.querySelector(".card-support").href, submit);
  for (const id of ticketIds) {
    const link = window.document.querySelector(id);
    assert.equal(link.hidden, false);
    assert.equal(new URL(link.href).hostname, "europarl.sharepoint.com");
    assert.equal(link.hasAttribute("target"), false);
  }
  assert.match(window.document.querySelector(".ticket-agents-note").textContent, /agents only/);
  window.close();
});

test("invalid native ticket links fail closed and never navigate to foreign sites", async () => {
  for (const url of [
    "javascript:alert(1)", native.replace("europarl", "evil"),
    native.replace("https:", "http:"), `${native}?redirect=https://evil.test`,
    native.replace("https://", "https://user:pass@"), native.replace("EuropaTickets", "Documents")
  ]) {
    assert.throws(() => ticketsLink(url));
    const window = dom().window;
    await initializePortal({ ...settings, enabled: false, ticketsUrl: url }, { document: window.document, window });
    assert.equal(window.document.querySelector("#ticket-link").hidden, true);
    assert.equal(window.document.querySelector("#ticket-status").dataset.error, "true");
    assert.equal(window.document.querySelector(".card-support").getAttribute("href"), "#tickets");
    window.close();
  }
});

test("invalid revision does not fetch and reports fallback", async () => {
  const window = dom().window;
  await initializePortal({ ...settings, contentRevision: "https://evil.test" }, {
    document: window.document, window, fetcher: () => assert.fail("No unsafe API request")
  });
  assert.equal(window.document.documentElement.dataset.contentState, "fallback");
  window.close();
});
