import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const suspendPath = path.join(root, "hermes/mastra-suspend-packet.json");
const resumePath = path.join(root, "hermes/mastra-resume-result.json");

const suspendPacket = JSON.parse(fs.readFileSync(suspendPath, "utf8"));
const resumeResult = JSON.parse(fs.readFileSync(resumePath, "utf8"));

const checks = [
  {
    id: "suspends-before-review",
    pass: suspendPacket.status === "suspended"
  },
  {
    id: "decision-options-present",
    pass:
      Array.isArray(suspendPacket.requiredDecision) &&
      ["approve", "reject", "revise"].every((decision) =>
        suspendPacket.requiredDecision.includes(decision)
      )
  },
  {
    id: "resume-runtime-labeled",
    pass: resumeResult.runtime === "mastra-suspend-resume-contract"
  },
  {
    id: "review-decision-present",
    pass: Boolean(resumeResult.review?.decision && resumeResult.review?.reason)
  },
  {
    id: "promotion-not-automatic",
    pass: resumeResult.notes?.some((note: string) =>
      note.includes("Promotion cannot happen without a review decision")
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
