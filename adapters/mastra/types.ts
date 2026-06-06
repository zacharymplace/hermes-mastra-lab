import type { IdeaInput, GeneratedIdea } from "../../agents/generator.js";
import type { CritiquedIdea } from "../../agents/critic.js";
import type { ScoredIdea } from "../../evaluations/scorer.js";

export type MastraAdapterInput = IdeaInput;

export type MastraAdapterOutput = {
  runtime: "mastra-adapter-spike";
  mode: "local-deterministic";
  recommendation: ScoredIdea;
  candidates: ScoredIdea[];
  notes: string[];
};

export type MastraAdapterContract = {
  generateIdeas(input: MastraAdapterInput): Promise<GeneratedIdea[]>;
  critiqueIdea(idea: GeneratedIdea): Promise<CritiquedIdea>;
  scoreIdea(idea: CritiquedIdea): Promise<ScoredIdea>;
  recommend(input: MastraAdapterInput): Promise<MastraAdapterOutput>;
};
