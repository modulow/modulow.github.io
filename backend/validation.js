export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function text(value, max, name) {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new HttpError(400, `Invalid ${name}.`);
  }
  return value.trim();
}

export function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).some(key => !keys.includes(key)) ||
      keys.some(key => !Object.hasOwn(value, key))) {
    throw new HttpError(400, "Invalid request fields.");
  }
}

export function safeLink(value) {
  if (value === "#tickets") return value;
  const url = new URL(text(value, 2048, "link"));
  if (url.protocol !== "https:" || url.username || url.password) throw new HttpError(400, "Invalid link.");
  return url.href;
}

function lines(value, name) {
  if (!Array.isArray(value) || value.length !== 2) throw new HttpError(400, `Invalid ${name}.`);
  return value.map(line => text(line, 250, name));
}

export function contentView(envelope) {
  exactKeys(envelope, ["schemaVersion", "records"]);
  if (envelope.schemaVersion !== 1 || !Array.isArray(envelope.records) || envelope.records.length !== 4) {
    throw new HttpError(502, "Invalid publication envelope.");
  }
  const content = {};
  for (const fields of envelope.records) {
    exactKeys(fields, ["Title", "Published", "Payload"]);
    if (fields.Published !== true) throw new HttpError(502, "Unpublished content is not allowed.");
    const key = fields.Title;
    if (!["page", "brochure", "schedule", "support"].includes(key) || Object.hasOwn(content, key)) {
      throw new HttpError(502, "Invalid published content keys.");
    }
    const value = fields.Payload;
    if (key === "page") {
      exactKeys(value, ["eyebrow", "headline", "intro", "primaryLink", "essentials", "appsTitle", "steps", "accessNote", "footerEyebrow", "footerLines"]);
      content[key] = {
        eyebrow: text(value.eyebrow, 250, "eyebrow"),
        headline: lines(value.headline, "headline"),
        intro: lines(value.intro, "intro"),
        primaryLink: text(value.primaryLink, 100, "primary link"),
        essentials: text(value.essentials, 100, "essentials"),
        appsTitle: text(value.appsTitle, 100, "apps title"),
        steps: (() => {
          if (!Array.isArray(value.steps) || value.steps.length !== 3) throw new HttpError(400, "Invalid steps.");
          return value.steps.map(step => text(step, 100, "step"));
        })(),
        accessNote: text(value.accessNote, 1000, "access note"),
        footerEyebrow: text(value.footerEyebrow, 250, "footer eyebrow"),
        footerLines: lines(value.footerLines, "footer lines")
      };
    } else {
      exactKeys(value, ["category", "title", "description", "action", "href"]);
      content[key] = {
        category: text(value.category, 100, "category"),
        title: text(value.title, 160, "card title"),
        description: text(value.description, 1000, "card description"),
        action: text(value.action, 100, "action"),
        href: safeLink(value.href)
      };
      if (key === "support" && value.href !== "#tickets") throw new HttpError(502, "Support must link to portal tickets.");
    }
  }
  if (Object.keys(content).length !== 4) throw new HttpError(502, "Publish page and all three cards before activation.");
  return content;
}
