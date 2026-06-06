import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const prioritization = JSON.parse(
fs.readFileSync(
path.join(root, "reports/priorities/sentra-project-prioritization.json"),
"utf8"
)
);

const checks = [
{
id: "selected-agentic-workflow",
pass: prioritization.selectedProject?.id === "hermes-agentic-workflow"
},
{
id: "execution-leverage-scored",
pass:
typeof prioritization.selectedProject?.scoring?.executionLeverage === "number" &&
prioritization.selectedProject.scoring.executionLeverage >= 5
},
{
id: "autonomy-readiness-scored",
pass:
typeof prioritization.selectedProject?.scoring?.autonomyReadiness === "number" &&
prioritization.selectedProject.scoring.autonomyReadiness >= 5
},
{
id: "docs-present",
pass: fs.existsSync(path.join(root, "docs/hermes-agentic-workflow.md"))
},
{
id: "safe-scope-documented",
pass: fs
.readFileSync(path.join(root, "docs/hermes-agentic-workflow.md"), "utf8")
.includes("stop before merge")
}
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
process.exit(1);
}
