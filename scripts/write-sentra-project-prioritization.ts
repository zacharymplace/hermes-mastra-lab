import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const candidates = readJson("sentra/projects/candidates/current.json");

function scoreProject(project: any) {
  const signals = project.signals ?? {};

  const strategicFit = signals.strategicFit ?? 0;
  const urgency = signals.urgency ?? 0;
  const learningValue = signals.learningValue ?? 0;
  const operatingLeverage = signals.operatingLeverage ?? 0;
  const riskReduction = signals.riskReduction ?? 0;
  const executionLeverage = signals.executionLeverage ?? 0;
  const autonomyReadiness = signals.autonomyReadiness ?? 0;
  const effort = signals.effort ?? 1;

  const gross =
    strategicFit * 3 +
    urgency * 2 +
    learningValue * 2 +
    operatingLeverage * 3 +
    riskReduction * 2 +
    executionLeverage * 3 +
    autonomyReadiness * 3;

  const score = gross - effort * 1.5;

  return {
    ...project,
    score,
    scoring: {
      strategicFit,
      urgency,
      learningValue,
      operatingLeverage,
      riskReduction,
      executionLeverage,
      autonomyReadiness,
      effort,
      gross,
      effortPenalty: effort * 1.5,
      final: score
    }
  };
}

const rankedProjects = candidates
  .map(scoreProject)
  .sort((a: any, b: any) => b.score - a.score);

const selectedProject = rankedProjects[0];

const report = {
  runtime: "sentra-multi-project-prioritization-v1",
  generatedAt: new Date().toISOString(),
  sourceArtifact: "sentra/projects/candidates/current.json",
  selectedProject,
  rankedProjects,
  checks: {
    hasCandidates: candidates.length >= 3,
    selectedProjectPresent: Boolean(selectedProject?.id),
    scoresComputed: rankedProjects.every((project: any) => typeof project.score === "number"),
    selectedHighestScore:
      selectedProject?.score === Math.max(...rankedProjects.map((project: any) => project.score)),
    risksCaptured: rankedProjects.every(
      (project: any) => Array.isArray(project.risks) && project.risks.length > 0
    )
  },
  notes: [
    "This ranks multiple active or candidate projects for Sentra.",
    "The selected project should drive the next promotion input.",
    "Scores are deterministic and auditable."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/priorities/sentra-project-prioritization.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const lines = [
  "# Sentra Multi-Project Prioritization",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Selected project",
  "",
  `**${selectedProject.name}**`,
  "",
  selectedProject.summary,
  "",
  `Score: ${selectedProject.score}`,
  "",
  "## Ranked projects",
  "",
  ...rankedProjects.map(
    (project: any, index: number) =>
      `- ${index + 1}. ${project.name}: ${project.score} — ${project.nextAction}`
  ),
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
];

fs.writeFileSync(
  path.join(root, "reports/priorities/sentra-project-prioritization.md"),
  lines.join("\n")
);

console.log(JSON.stringify(report, null, 2));
