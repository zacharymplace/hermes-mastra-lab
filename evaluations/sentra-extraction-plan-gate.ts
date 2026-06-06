import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const plan = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/plans/sentra-os-extraction-plan.json"),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass: plan.runtime === "sentra-os-extraction-planner-v1"
  },
  {
    id: "selected-project-is-sentra-os",
    pass: plan.checks?.selectedProjectIsSentraOs === true
  },
  {
    id: "objective-present",
    pass: typeof plan.objective === "string" && plan.objective.length > 0
  },
  {
    id: "milestones-present",
    pass: Array.isArray(plan.milestones) && plan.milestones.length >= 4
  },
  {
    id: "dependencies-present",
    pass: Array.isArray(plan.dependencies) && plan.dependencies.length >= 3
  },
  {
    id: "risks-present",
    pass: Array.isArray(plan.risks) && plan.risks.length >= 3
  },
  {
    id: "success-criteria-present",
    pass:
      Array.isArray(plan.successCriteria) &&
      plan.successCriteria.length >= 5
  },
  {
    id: "next-action-contracts",
    pass: plan.nextAction.includes("contracts")
  },
  {
    id: "report-written",
    pass: fs.existsSync(
      path.join(root, "reports/plans/sentra-os-extraction-plan.md")
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
