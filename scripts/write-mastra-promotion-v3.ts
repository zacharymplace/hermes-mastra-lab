import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const inputs = {
  mastraQualification: readJson("reports/mastra-qualification.json"),
  langfuseQualification: readJson("reports/langfuse-qualification.json"),
  langfuseSdk: readJson("reports/langfuse-sdk-emission-spike.json"),
  realSuspendResume: readJson("reports/mastra-real-suspend-resume.json"),
  persistence: readJson("reports/mastra-persistence-qualification.json"),
  externalHuman: readJson("reports/mastra-external-human-input.json"),
  failureRecovery: readJson("reports/mastra-failure-recovery.json")
};

const criteria = [
  {
    id: "clarity",
    score: 4,
    max: 5,
    rationale:
      "Mastra makes multi-step orchestration, suspend/resume, and review boundaries explicit. Plain TypeScript remains clearer for simple deterministic logic."
  },
  {
    id: "type-safety",
    score: 4,
    max: 5,
    rationale:
      "Workflow schemas improve runtime boundaries while Hermes domain scoring and recommendation types stay framework-independent."
  },
  {
    id: "observability-handoff",
    score: 5,
    max: 5,
    rationale:
      "Langfuse SDK, OTEL export, and UI visibility are verified. Hermes artifacts can be tied to runtime traces."
  },
  {
    id: "human-review-flow",
    score: 5,
    max: 5,
    rationale:
      "Suspend/resume, persisted snapshots, and external review artifacts are all qualified."
  },
  {
    id: "retry-error-handling",
    score: 4,
    max: 5,
    rationale:
      "Controlled failure recovery is qualified. Built-in automatic retry policy behavior remains a future refinement."
  },
  {
    id: "workflow-composition",
    score: 5,
    max: 5,
    rationale:
      "Native workflow, fan-out/fan-in critique, persisted review, and recovery paths show strong composition fit."
  }
];

const total = criteria.reduce((sum, item) => sum + item.score, 0);
const max = criteria.reduce((sum, item) => sum + item.max, 0);

const blockers = [
  {
    id: "automatic-retry-policy",
    status: "open-refinement",
    severity: "medium",
    note:
      "Explicit rerun-based recovery is qualified, but Mastra-native automatic retry policy behavior has not been isolated."
  },
  {
    id: "production-storage-choice",
    status: "open-refinement",
    severity: "medium",
    note:
      "Local LibSQL persistence is qualified. Production deployment still needs a storage choice and backup policy."
  },
  {
    id: "runtime-cost-and-complexity",
    status: "watch",
    severity: "low",
    note:
      "Mastra adds framework surface area. Keep Hermes domain logic framework-independent to preserve reversibility."
  }
];

const closedBlockers = [
  "real-langfuse-sdk",
  "langfuse-ui-visibility",
  "real-mastra-suspend",
  "snapshot-persistence",
  "external-human-input",
  "failure-recovery"
];

const report = {
  runtime: "mastra-promotion-report-v3",
  generatedAt: new Date().toISOString(),
  decision: "promote-for-controlled-use",
  recommendation:
    "Use Mastra as the Hermes orchestration runtime for qualified workflows, while keeping Hermes domain logic, scoring, promotion rules, and artifacts framework-independent.",
  score: {
    total,
    max,
    percentage: Math.round((total / max) * 100)
  },
  criteria,
  evidence: {
    mastraQualification: {
      recommendation: inputs.mastraQualification.recommendation,
      score: inputs.mastraQualification.score,
      stages: inputs.mastraQualification.stages?.map((stage: any) => ({
        id: stage.id,
        status: stage.status,
        runtime: stage.runtime
      }))
    },
    langfuse: {
      localContract: inputs.langfuseQualification.mode,
      sdkMode: inputs.langfuseSdk.mode,
      eventsEmitted: inputs.langfuseSdk.emittedEvents,
      artifactsLinked: inputs.langfuseSdk.artifactsLinked
    },
    suspendResume: {
      realSuspend: inputs.realSuspendResume.checks?.usedRealSuspend === true,
      resumeInitiallyBlockedByPersistence:
        inputs.realSuspendResume.checks?.requiresSnapshotPersistence === true,
      persistenceQualified: inputs.persistence.passed === true,
      externalHumanInputQualified: inputs.externalHuman.passed === true
    },
    failureRecovery: {
      qualified: inputs.failureRecovery.passed === true,
      firstRunStatus: inputs.failureRecovery.firstRun?.status,
      secondRunStatus: inputs.failureRecovery.secondRun?.status,
      recoveredOutputValid:
        inputs.failureRecovery.checks?.recoveredOutputValid === true
    }
  },
  closedBlockers,
  remainingBlockers: blockers,
  guardrails: [
    "Hermes domain logic must remain outside Mastra workflow definitions.",
    "Mastra should orchestrate; Hermes should decide.",
    "All promotion decisions must remain explicit and artifact-backed.",
    "Local storage artifacts must remain ignored.",
    "Langfuse traces should support review, not replace committed artifacts."
  ],
  nextActions: [
    "Add Mastra promotion v3 gate.",
    "Wire the qualified path into a single end-to-end Hermes promotion workflow.",
    "Add a production storage decision record before using this outside local development.",
    "Optionally isolate Mastra-native automatic retry policy behavior."
  ]
};

const jsonPath = path.join(root, "reports/mastra-promotion-v3.json");
const mdPath = path.join(root, "reports/mastra-promotion-v3.md");

fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# Mastra Promotion Report v3",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `Decision: ${report.decision}`,
  "",
  "## Recommendation",
  "",
  report.recommendation,
  "",
  "## Score",
  "",
  `${total} / ${max} (${report.score.percentage}%)`,
  "",
  "## Criteria",
  "",
  ...criteria.flatMap((item) => [
    `### ${item.id}`,
    "",
    `Score: ${item.score} / ${item.max}`,
    "",
    item.rationale,
    ""
  ]),
  "## Closed blockers",
  "",
  ...closedBlockers.map((item) => `- ${item}`),
  "",
  "## Remaining blockers / refinements",
  "",
  ...blockers.map((item) => `- ${item.id} (${item.severity}): ${item.note}`),
  "",
  "## Guardrails",
  "",
  ...report.guardrails.map((item) => `- ${item}`),
  "",
  "## Next actions",
  "",
  ...report.nextActions.map((item) => `- ${item}`),
  ""
];

fs.writeFileSync(mdPath, lines.join("\n"));

console.log(JSON.stringify(report, null, 2));
