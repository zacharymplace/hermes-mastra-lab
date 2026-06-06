import fs from "node:fs";
import path from "node:path";

import { startActiveObservation } from "@langfuse/tracing";

import { generateIdeas } from "../../agents/generator.js";
import { critiqueIdea } from "../../agents/critic.js";
import { scoreIdea } from "../../evaluations/scorer.js";

type Review = {
  approved: boolean;
  reviewer: string;
  reason: string;
};

const root = process.cwd();

const inputPath = path.join(root, "sentra/sample-input.json");
const reviewExamplePath = path.join(root, "reviews/pending-approval.example.json");
const reviewPath = path.join(root, "reviews/promotion-v1-review.json");
const outJsonPath = path.join(root, "reports/promotions/hermes-promotion-v1.json");
const outMdPath = path.join(root, "reports/promotions/hermes-promotion-v1.md");

fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
fs.mkdirSync(path.dirname(reviewPath), { recursive: true });

if (!fs.existsSync(reviewPath)) {
  fs.copyFileSync(reviewExamplePath, reviewPath);
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const review = JSON.parse(fs.readFileSync(reviewPath, "utf8")) as Review;

const report = await startActiveObservation(
  "hermes-promotion-workflow-v1",
  async (observation) => {
    observation.update({
      input: {
        inputArtifact: "sentra/sample-input.json",
        reviewArtifact: "reviews/promotion-v1-review.json"
      },
      metadata: {
        runtime: "plain-typescript-with-langfuse-trace",
        workflow: "hermes-promotion-v1",
        tags: ["hermes", "promotion", "v1"]
      }
    });

    const candidates = generateIdeas(input)
      .map(critiqueIdea)
      .map(scoreIdea)
      .sort((a, b) => b.score - a.score);

    const recommendation = candidates[0];

    const promoted =
      review.approved === true &&
      recommendation.verdict === "advance" &&
      recommendation.score >= 18;

    const result = {
      runtime: "hermes-promotion-workflow-v1",
      mode: "operational-local",
      status: promoted ? "promoted" : "held",
      generatedAt: new Date().toISOString(),
      inputArtifact: "sentra/sample-input.json",
      reviewArtifact: "reviews/promotion-v1-review.json",
      outputArtifacts: [
        "reports/promotions/hermes-promotion-v1.json",
        "reports/promotions/hermes-promotion-v1.md"
      ],
      recommendation,
      candidates,
      review,
      checks: {
        recommendationAdvanced: recommendation.verdict === "advance",
        scoreThresholdMet: recommendation.score >= 18,
        externalReviewApproved: review.approved === true,
        reviewerCaptured: Boolean(review.reviewer),
        reasonCaptured: Boolean(review.reason),
        promoted
      },
      notes: [
        "This is the first operational Hermes promotion workflow.",
        "It uses the qualified generate → critique → score → external review → promote path.",
        "Mastra remains qualified for orchestration, but this v1 keeps domain logic plain and artifact-backed.",
        "Langfuse tracing wraps the promotion workflow for observability."
      ]
    };

    observation.update({
      output: {
        status: result.status,
        recommendationTitle: recommendation.title,
        recommendationScore: recommendation.score,
        promoted
      },
      metadata: {
        reviewer: review.reviewer,
        recommendationVerdict: recommendation.verdict,
        recommendationScore: recommendation.score
      }
    });

    return result;
  }
);

fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# Hermes Promotion Workflow v1",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Recommendation",
  "",
  `**${report.recommendation.title}**`,
  "",
  report.recommendation.summary,
  "",
  `Score: ${report.recommendation.score}`,
  `Verdict: ${report.recommendation.verdict}`,
  "",
  "## Review",
  "",
  `Approved: ${report.review.approved}`,
  `Reviewer: ${report.review.reviewer}`,
  `Reason: ${report.review.reason}`,
  "",
  "## Checks",
  "",
  ...Object.entries(report.checks).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
];

fs.writeFileSync(outMdPath, lines.join("\n"));

console.log(JSON.stringify(report, null, 2));

if (!report.checks.promoted) {
  process.exit(1);
}
