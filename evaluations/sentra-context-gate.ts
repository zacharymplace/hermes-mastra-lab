import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const snapshot = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/snapshot.json"), "utf8")
);

const promotionInput = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/promotion-input.json"), "utf8")
);

const checks = [
  {
    id: "snapshot-runtime-labeled",
    pass: snapshot.runtime === "sentra-context-generator-v1"
  },
  {
    id: "active-projects-present",
    pass: Array.isArray(snapshot.activeProjects) && snapshot.activeProjects.length > 0
  },
  {
    id: "accepted-decisions-present",
    pass:
      Array.isArray(snapshot.acceptedDecisions) &&
      snapshot.acceptedDecisions.length > 0
  },
  {
    id: "top-priority-present",
    pass: Boolean(snapshot.topPriority?.title)
  },
  {
    id: "promotion-input-from-snapshot",
    pass: promotionInput.sourceArtifact === "sentra/snapshot.json"
  },
  {
    id: "promotion-context-present",
    pass:
      Array.isArray(promotionInput.context) &&
      promotionInput.context.length >= 4
  },
  {
    id: "sentra-hermes-boundary-preserved",
    pass:
      Array.isArray(promotionInput.notes) &&
      promotionInput.notes.some((note: string) =>
        note.includes("Sentra owns current operating context")
      )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
