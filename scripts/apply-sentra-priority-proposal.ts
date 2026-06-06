import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const proposalPath = "sentra/priorities/proposals/current.json";
const approvalPath = "sentra/priorities/proposals/current-approval.json";
const approvalExamplePath =
  "sentra/priorities/proposals/current-approval.example.json";
const targetPath = "sentra/priorities/current.json";
const reportPath = "reports/priorities/sentra-priority-apply.json";

if (!fs.existsSync(path.join(root, approvalPath))) {
  fs.copyFileSync(
    path.join(root, approvalExamplePath),
    path.join(root, approvalPath)
  );
}

const proposal = readJson(proposalPath);
const approval = readJson(approvalPath);

const applied =
  proposal.status === "pending-approval" &&
  approval.approved === true &&
  Array.isArray(proposal.proposedPriorities) &&
  proposal.proposedPriorities.length > 0;

if (applied) {
  fs.writeFileSync(
    path.join(root, targetPath),
    JSON.stringify(
      proposal.proposedPriorities.map((priority: any) => ({
        id: priority.id,
        rank: priority.rank,
        title: priority.title,
        why: priority.why,
        desiredOutcome: priority.desiredOutcome
      })),
      null,
      2
    ) + "\n"
  );
}

const report = {
  runtime: "sentra-priority-apply-v1",
  generatedAt: new Date().toISOString(),
  status: applied ? "applied" : "held",
  proposalArtifact: proposalPath,
  approvalArtifact: approvalPath,
  targetArtifact: targetPath,
  approval,
  checks: {
    proposalPendingApproval: proposal.status === "pending-approval",
    approvalGranted: approval.approved === true,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    prioritiesApplied: applied
  },
  notes: [
    "This applies the weekly-review priority proposal after explicit approval.",
    "The next Sentra context run should consume the rewritten priorities.",
    "Approval artifacts are local operating inputs and should not be required for committed state."
  ]
};

fs.writeFileSync(path.join(root, reportPath), JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));

if (!applied) {
  process.exit(1);
}
