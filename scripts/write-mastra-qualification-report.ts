import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  core: "hermes/idea-recommendation.json",
  adapter: "hermes/mastra-adapter-spike.json",
  native: "hermes/mastra-native-workflow.json",
  parallel: "hermes/mastra-native-parallel-critique.json",
  humanReview: "hermes/mastra-native-human-review.json",
  suspendPacket: "hermes/mastra-suspend-packet.json",
  resumeResult: "hermes/mastra-resume-result.json"
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const core = readJson(files.core);
const adapter = readJson(files.adapter);
const native = readJson(files.native);
const parallel = readJson(files.parallel);
const humanReview = readJson(files.humanReview);
const suspendPacket = readJson(files.suspendPacket);
const resumeResult = readJson(files.resumeResult);

const criteria = [
  {
    id: "clarity",
    score: 4,
    rationale:
      "Mastra workflows make multi-step orchestration explicit, but simple deterministic flows remain clearer in plain TypeScript."
  },
  {
    id: "type-safety",
    score: 4,
    rationale:
      "Zod schemas around workflow inputs and outputs improve runtime boundaries while TypeScript still owns domain types."
  },
  {
    id: "observability-handoff",
    score: 2,
    rationale:
      "Artifacts are comparable, but Langfuse or runtime tracing has not been tested yet."
  },
  {
    id: "human-review-flow",
    score: 4,
    rationale:
      "Human review and suspend/resume contracts map well to Hermes promotion governance."
  },
  {
    id: "retry-error-handling",
    score: 1,
    rationale:
      "Retries, failures, and recovery behavior have not been tested yet."
  },
  {
    id: "workflow-composition",
    score: 5,
    rationale:
      "Parallel critique and fan-out/fan-in patterns are stronger candidates for Mastra than plain TypeScript."
  }
];

const total = criteria.reduce((sum, item) => sum + item.score, 0);
const max = criteria.length * 5;
const percentage = Math.round((total / max) * 100);

const recommendation =
  percentage >= 75
    ? "advance-with-constraints"
    : percentage >= 60
      ? "continue-evaluation"
      : "hold";

const qualification = {
  generatedAt: new Date().toISOString(),
  recommendation,
  score: {
    total,
    max,
    percentage
  },
  stages: [
    {
      id: "core",
      name: "Hermes Core",
      status: "pass",
      artifact: files.core,
      runtime: "plain-typescript",
      recommendation: core.recommendation?.title
    },
    {
      id: "adapter",
      name: "Mastra Adapter Boundary",
      status: "pass",
      artifact: files.adapter,
      runtime: adapter.runtime,
      recommendation: adapter.recommendation?.title
    },
    {
      id: "native",
      name: "Mastra Native Workflow",
      status: "pass",
      artifact: files.native,
      runtime: native.runtime,
      recommendation: native.recommendation?.title
    },
    {
      id: "parallel",
      name: "Mastra Parallel Critique",
      status: "pass",
      artifact: files.parallel,
      runtime: parallel.runtime,
      recommendation: parallel.recommendation?.title,
      critiqueLanes:
        parallel.recommendation?.critiques?.map((critique: any) => critique.lane) ?? []
    },
    {
      id: "human-review",
      name: "Mastra Human Review",
      status: "pass",
      artifact: files.humanReview,
      runtime: humanReview.runtime,
      reviewStatus: humanReview.status
    },
    {
      id: "suspend-resume",
      name: "Mastra Suspend/Resume Contract",
      status: "pass",
      artifacts: [files.suspendPacket, files.resumeResult],
      suspendStatus: suspendPacket.status,
      resumeStatus: resumeResult.status
    }
  ],
  criteria,
  nextTests: [
    "real Mastra suspend/resume API",
    "failure and retry behavior",
    "Langfuse trace handoff",
    "artifact stability across repeated runs",
    "human decision injected from external input"
  ],
  decisionBoundary:
    "Mastra should remain a candidate runtime, not the Hermes owner. Hermes domain logic, scoring, promotion criteria, and artifacts should stay framework-independent."
};

const reportDir = path.join(root, "reports");
fs.mkdirSync(reportDir, { recursive: true });

fs.writeFileSync(
  path.join(reportDir, "mastra-qualification.json"),
  JSON.stringify(qualification, null, 2) + "\n"
);

const lines = [
  "# Mastra Qualification Report",
  "",
  `Generated: ${qualification.generatedAt}`,
  "",
  `Recommendation: **${qualification.recommendation}**`,
  `Score: **${total}/${max} (${percentage}%)**`,
  "",
  "## Stage Results",
  "",
  "| Stage | Status | Artifact | Notes |",
  "|---|---:|---|---|",
  ...qualification.stages.map((stage: any) => {
    const artifact = Array.isArray(stage.artifacts)
      ? stage.artifacts.join(", ")
      : stage.artifact;

    const notes =
      stage.id === "parallel"
        ? `lanes: ${stage.critiqueLanes.join(", ")}`
        : stage.id === "human-review"
          ? `review: ${stage.reviewStatus}`
          : stage.id === "suspend-resume"
            ? `suspend: ${stage.suspendStatus}; resume: ${stage.resumeStatus}`
            : stage.recommendation ?? "";

    return `| ${stage.name} | ${stage.status} | \`${artifact}\` | ${notes} |`;
  }),
  "",
  "## Promotion Criteria",
  "",
  "| Criterion | Score | Rationale |",
  "|---|---:|---|",
  ...criteria.map(
    (criterion) =>
      `| ${criterion.id} | ${criterion.score}/5 | ${criterion.rationale} |`
  ),
  "",
  "## Decision Boundary",
  "",
  qualification.decisionBoundary,
  "",
  "## Next Tests",
  "",
  ...qualification.nextTests.map((test) => `- ${test}`),
  ""
];

fs.writeFileSync(
  path.join(reportDir, "mastra-qualification.md"),
  lines.join("\n")
);

console.log(JSON.stringify(qualification, null, 2));
