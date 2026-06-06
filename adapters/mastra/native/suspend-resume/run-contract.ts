import fs from "node:fs";
import path from "node:path";

import {
  resumeFromDecision,
  type ReviewDecision,
  type SuspendPacket
} from "./suspend-resume-contract.js";

const root = process.cwd();
const recommendationPath = path.join(root, "hermes/mastra-native-human-review.json");
const suspendPath = path.join(root, "hermes/mastra-suspend-packet.json");
const resumePath = path.join(root, "hermes/mastra-resume-result.json");

const source = JSON.parse(fs.readFileSync(recommendationPath, "utf8"));

const suspendPacket: SuspendPacket = {
  status: "suspended",
  suspendReason: "Human promotion decision required before recommendation release.",
  recommendationTitle: source.recommendation.title,
  recommendationScore: source.recommendation.score,
  requiredDecision: ["approve", "reject", "revise"]
};

const review: ReviewDecision = {
  decision: source.recommendation.score >= 18 ? "approve" : "revise",
  reviewer: "local-suspend-resume-simulation",
  reason:
    source.recommendation.score >= 18
      ? "Recommendation clears promotion threshold with documented risks."
      : "Recommendation needs revision before promotion."
};

const resumeResult = resumeFromDecision(review);

fs.writeFileSync(suspendPath, JSON.stringify(suspendPacket, null, 2) + "\n");
fs.writeFileSync(resumePath, JSON.stringify(resumeResult, null, 2) + "\n");

console.log(JSON.stringify({ suspendPacket, resumeResult }, null, 2));
