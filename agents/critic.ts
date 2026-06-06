import type { GeneratedIdea } from "./generator.js";

export type CritiquedIdea = GeneratedIdea & {
  risks: string[];
  verdict: "advance" | "hold";
};

export function critiqueIdea(idea: GeneratedIdea): CritiquedIdea {
  const risks =
    idea.title.includes("Adapter")
      ? ["May add abstraction before the runtime is understood"]
      : idea.title.includes("Trace")
        ? ["May be premature before workflow behavior exists"]
        : ["May be too deterministic to test real agent behavior"];

  const verdict = idea.title.includes("Hermes Idea Recommendation Workflow")
    ? "advance"
    : "hold";

  return {
    ...idea,
    risks,
    verdict
  };
}
