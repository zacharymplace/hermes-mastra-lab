import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

type Check = {
  id: string;
  pass: boolean;
  detail?: unknown;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

function hasRequiredObjectFields(value: any, fields: string[]) {
  return fields.every((field) => Object.prototype.hasOwnProperty.call(value, field));
}

function hasRequiredArrayItems(items: any[], fields: string[]) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => hasRequiredObjectFields(item, fields));
}

const schemaPaths = [
  "sentra/contracts/project.schema.json",
  "sentra/contracts/decision.schema.json",
  "sentra/contracts/review.schema.json",
  "sentra/contracts/priority.schema.json",
  "sentra/contracts/snapshot.schema.json",
  "sentra/contracts/promotion-input.schema.json",
  "sentra/contracts/ledger-event.schema.json",
  "sentra/contracts/plan.schema.json"
];

const projects = readJson("sentra/projects/current.json");
const projectCandidates = readJson("sentra/projects/candidates/current.json");
const decisions = readJson("sentra/decisions/current.json");
const reviews = readJson("sentra/reviews/current.json");
const priorities = readJson("sentra/priorities/current.json");
const snapshot = readJson("sentra/snapshot.json");
const promotionInput = readJson("sentra/promotion-input.json");
const plan = readJson("sentra/plans/sentra-os-extraction.json");

const ledgerEvents = fs
  .readFileSync(path.join(root, "sentra/ledger/events.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const checks: Check[] = [
  {
    id: "schemas-present",
    pass: schemaPaths.every(exists),
    detail: schemaPaths
  },
  {
    id: "docs-present",
    pass: exists("docs/sentra-contracts.md")
  },
  {
    id: "project-contract",
    pass:
      hasRequiredArrayItems(projects, ["id", "name", "status", "summary", "nextAction", "risks"]) &&
      hasRequiredArrayItems(projectCandidates, ["id", "name", "status", "summary", "nextAction", "signals", "risks"])
  },
  {
    id: "decision-contract",
    pass: hasRequiredArrayItems(decisions, ["id", "status", "decision", "rationale"])
  },
  {
    id: "review-contract",
    pass: hasRequiredArrayItems(reviews, ["id", "status", "summary"])
  },
  {
    id: "priority-contract",
    pass: hasRequiredArrayItems(priorities, ["id", "rank", "title", "why", "desiredOutcome"])
  },
  {
    id: "snapshot-contract",
    pass:
      snapshot.runtime === "sentra-context-generator-v1" &&
      hasRequiredObjectFields(snapshot, [
        "generatedAt",
        "activeProjects",
        "acceptedDecisions",
        "recentReviews",
        "priorities",
        "topPriority",
        "staleRisks",
        "hermesPrompt"
      ])
  },
  {
    id: "promotion-input-contract",
    pass:
      promotionInput.runtime === "sentra-promotion-input-v1" &&
      hasRequiredObjectFields(promotionInput, [
        "generatedAt",
        "sourceArtifact",
        "goal",
        "constraints",
        "context",
        "notes"
      ])
  },
  {
    id: "ledger-event-contract",
    pass: hasRequiredArrayItems(ledgerEvents, ["type", "summary"])
  },
  {
    id: "plan-contract",
    pass:
      plan.runtime === "sentra-os-extraction-planner-v1" &&
      hasRequiredObjectFields(plan, [
        "generatedAt",
        "selectedProject",
        "objective",
        "milestones",
        "dependencies",
        "risks",
        "successCriteria",
        "nextAction"
      ])
  }
];

const passed = checks.every((check) => check.pass);

const report = {
  runtime: "sentra-contracts-v1",
  generatedAt: new Date().toISOString(),
  passed,
  schemaCount: schemaPaths.length,
  schemaPaths,
  checks,
  notes: [
    "This validates Sentra artifacts against the v1 contract expectations.",
    "The validator intentionally uses lightweight structural checks before adding a JSON Schema runtime dependency.",
    "Sentra contracts must remain framework-independent."
  ]
};

fs.mkdirSync(path.join(root, "reports/contracts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "reports/contracts/sentra-contracts.json"),
  JSON.stringify(report, null, 2) + "\n"
);

console.log(JSON.stringify(report, null, 2));

if (!passed) {
  process.exit(1);
}
