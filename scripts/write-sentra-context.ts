import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const projects = readJson<any[]>("sentra/projects/current.json");
const decisions = readJson<any[]>("sentra/decisions/current.json");
const reviews = readJson<any[]>("sentra/reviews/current.json");
const priorities = readJson<any[]>("sentra/priorities/current.json");

const activeProjects = projects.filter((project) => project.status === "active");
const acceptedDecisions = decisions.filter((decision) => decision.status === "accepted");
const topPriority = [...priorities].sort((a, b) => a.rank - b.rank)[0];

const snapshot = {
  runtime: "sentra-context-generator-v1",
  generatedAt: new Date().toISOString(),
  activeProjects,
  acceptedDecisions,
  recentReviews: reviews,
  priorities,
  topPriority,
  staleRisks: activeProjects.flatMap((project) => project.risks ?? []),
  hermesPrompt: {
    goal: topPriority?.title ?? "Generate the next best Hermes push",
    constraints: [
      "Use current Sentra operating state",
      "Preserve Hermes domain logic outside framework code",
      "Keep promotion artifact-backed",
      "Require explicit review for promotion"
    ],
    context: [
      ...activeProjects.map((project) => `Project: ${project.name} — ${project.summary}`),
      ...acceptedDecisions.map((decision) => `Decision: ${decision.decision}`),
      ...reviews.map((review) => `Review: ${review.summary}`),
      ...priorities.map((priority) => `Priority ${priority.rank}: ${priority.title} — ${priority.why}`)
    ]
  }
};

fs.writeFileSync(
  path.join(root, "sentra/snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "sentra/promotion-input.json"),
  JSON.stringify(
    {
      runtime: "sentra-promotion-input-v1",
      generatedAt: snapshot.generatedAt,
      sourceArtifact: "sentra/snapshot.json",
      goal: snapshot.hermesPrompt.goal,
      constraints: snapshot.hermesPrompt.constraints,
      context: snapshot.hermesPrompt.context,
      notes: [
        "This is generated from Sentra operating state.",
        "Sentra owns current operating context; Hermes owns recommendation and promotion.",
        "Promotion input should not be edited directly unless debugging."
      ]
    },
    null,
    2
  ) + "\n"
);

console.log(JSON.stringify(snapshot, null, 2));
