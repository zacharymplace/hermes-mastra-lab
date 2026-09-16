import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(root, "FROZEN-MANIFEST.sha256");
const manifest = await readFile(manifestPath, "utf8");
const entries = manifest.trim().split("\n").map((line) => {
  const match = line.match(/^([a-f0-9]{64})  ([A-Za-z0-9._-]+)$/);
  if (!match) throw new Error(`Invalid manifest line: ${line}`);
  return { expected: match[1], name: match[2] };
});

const expectedNames = ["oracle.json", "protocol.json", "scenarios.json"];
const actualNames = entries.map(({ name }) => name).sort();
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  throw new Error(`Unexpected normative file set: ${actualNames.join(", ")}`);
}

for (const { expected, name } of entries) {
  const bytes = await readFile(join(root, name));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
  JSON.parse(bytes.toString("utf8"));
  console.log(`PASS ${name} ${actual}`);
}

const manifestDigest = createHash("sha256").update(await readFile(manifestPath)).digest("hex");
console.log(`PASS FROZEN-MANIFEST.sha256 ${manifestDigest}`);
