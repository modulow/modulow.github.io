import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { contentView } from "../backend/validation.js";

const seed = JSON.parse(await readFile(new URL("../backend/content-seed.json", import.meta.url), "utf8"));
const publication = () => ({ schemaVersion: 1, records: seed.map(record => ({ ...structuredClone(record), Published: true })) });

test("seed produces only the four approved public records", () => {
  const value = contentView(publication());
  assert.deepEqual(Object.keys(value), ["page", "brochure", "schedule", "support"]);
  assert.equal(value.page.headline[0], "Fresh apps.");
  assert.equal(value.support.href, "#tickets");
});

for (const [name, mutate] of [
  ["draft", value => { value.records[0].Published = false; }],
  ["string boolean", value => { value.records[0].Published = "true"; }],
  ["tickets in envelope", value => { value.tickets = []; }],
  ["metadata", value => { value.records[0].Author = "private"; }],
  ["internal document", value => { value.records[0].Payload.document = "private"; }],
  ["duplicate", value => { value.records[1].Title = "page"; }],
  ["unknown key", value => { value.records[0].Title = "tickets"; }],
  ["missing record", value => { value.records.pop(); }],
  ["extra record", value => { value.records.push(value.records[0]); }],
  ["wrong version", value => { value.schemaVersion = 2; }],
  ["string Payload", value => { value.records[0].Payload = JSON.stringify(value.records[0].Payload); }],
  ["missing field", value => { delete value.records[0].Payload.intro; }],
  ["wrong line count", value => { value.records[0].Payload.headline.push("third"); }],
  ["oversized text", value => { value.records[1].Payload.title = "x".repeat(161); }],
  ["javascript URL", value => { value.records[1].Payload.href = "javascript:alert(1)"; }],
  ["HTTP URL", value => { value.records[1].Payload.href = "http://example.test"; }],
  ["credential URL", value => { value.records[1].Payload.href = "https://user:pass@example.test"; }],
  ["support redirect", value => { value.records[3].Payload.href = "https://example.test"; }]
]) {
  test(`rejects ${name}`, () => {
    const value = publication();
    mutate(value);
    assert.throws(() => contentView(value));
  });
}
