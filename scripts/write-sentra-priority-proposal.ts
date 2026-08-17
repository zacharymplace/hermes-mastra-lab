import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const weeklyReview = readJson("sentra/reviews/weekly/current.json");
const currentPriorities = readJson("sentra/priorities/current.json");

const proposedPriorities = weeklyReview.nextPriorities.map(
  (priority: any, index: number) => ({
    id: priority.id,
    rank: index + 1,
    title: priority.title,
    why: priority.why,
    desiredOutcome: priority.desiredOutcome,
    source: "sentra/reviews/weekly/current.json"
  })
);

const proposal = {
  runtime: "sentra-priority-rewriter-v1",
  generatedAt: new Date().toISOString(),
  status: "pending-approval",
  sourceArtifact: "sentra/reviews/weekly/current.json",
  targetArtifact: "sentra/priorities/current.json",
  currentPriorities,
  proposedPriorities,
  reviewSummary: weeklyReview.summary,
  checks: {
    hasCurrentPriorities:
      Array.isArray(currentPriorities) && currentPriorities.length > 0,
    hasProposedPriorities: Array.isArray(proposedPriorities),
    proposalChangesTopPriority:
      currentPriorities?.[0]?.id !== proposedPriorities?.[0]?.id,
    allProposalsSourcedFromReview: proposedPriorities.every(
      (priority: any) =>
        priority.source === "sentra/reviews/weekly/current.json"
    )
  },
  notes: [
    "This proposes a priority rewrite from the weekly review.",
    "It does not mutate sentra/priorities/current.json without approval.",
    "The apply step requires sentra/priorities/proposals/current-approval.json."
  ]
};

fs.writeFileSync(
  path.join(root, "sentra/priorities/proposals/current.json"),
  JSON.stringify(proposal, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/priorities/sentra-priority-proposal.json"),
  JSON.stringify(proposal, null, 2) + "\n"
);

const lines = [
  "# Sentra Priority Proposal",
  "",
  `Generated: ${proposal.generatedAt}`,
  `Status: ${proposal.status}`,
  "",
  "## Review summary",
  "",
  proposal.reviewSummary,
  "",
  "## Proposed priorities",
  "",
  ...proposedPriorities.map(
    (priority: any) => `- ${priority.rank}. ${priority.title}: ${priority.why}`
  ),
  "",
  "## Checks",
  "",
  ...Object.entries(proposal.checks).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Notes",
  "",
  ...proposal.notes.map((note) => `- ${note}`),
  ""
];

fs.writeFileSync(
  path.join(root, "reports/priorities/sentra-priority-proposal.md"),
  lines.join("\n")
);

console.log(JSON.stringify(proposal, null, 2));
