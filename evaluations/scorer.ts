import type { CritiquedIdea } from "../agents/critic.js";

export type ScoredIdea = CritiquedIdea & {
  score: number;
  scoring: {
    shipSize: number;
    strategicFit: number;
    learningValue: number;
    reversibility: number;
  };
};

export function scoreIdea(idea: CritiquedIdea): ScoredIdea {
  const scoring = {
    shipSize: idea.title.includes("Workflow") ? 5 : 3,
    strategicFit: idea.title.includes("Hermes") ? 5 : 4,
    learningValue: idea.title.includes("Mastra") ? 5 : 4,
    reversibility: 5
  };

  const score =
    scoring.shipSize +
    scoring.strategicFit +
    scoring.learningValue +
    scoring.reversibility;

  return {
    ...idea,
    score,
    scoring
  };
}
