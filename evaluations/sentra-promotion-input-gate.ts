import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifact = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/promotion-input.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: artifact.runtime === "sentra-promotion-input-v1"
  },
  {
    id: "goal-present",
    pass: typeof artifact.goal === "string" && artifact.goal.length > 0
  },
  {
    id: "constraints-present",
    pass: Array.isArray(artifact.constraints) && artifact.constraints.length >= 3
  },
  {
    id: "context-present",
    pass: Array.isArray(artifact.context) && artifact.context.length >= 3
  },
  {
    id: "sentra-hermes-boundary-note",
    pass:
      Array.isArray(artifact.notes) &&
      artifact.notes.some((note: string) =>
        note.includes("Sentra owns current operating context")
      )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
