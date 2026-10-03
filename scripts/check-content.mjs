import { readFile } from "node:fs/promises";
import { contentView } from "../backend/validation.js";

// Failure is intentional when no reviewed export has been supplied.
const source = await readFile(new URL("../content.json", import.meta.url), "utf8");
contentView(JSON.parse(source));
console.log("content.json matches the approved publication schema.");
