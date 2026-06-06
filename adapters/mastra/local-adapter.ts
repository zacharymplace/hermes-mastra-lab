import { generateIdeas } from "../../agents/generator.js";
import { critiqueIdea } from "../../agents/critic.js";
import { scoreIdea } from "../../evaluations/scorer.js";

import type {
  MastraAdapterContract,
  MastraAdapterInput,
  MastraAdapterOutput
} from "./types.js";

export const localMastraAdapter: MastraAdapterContract = {
  async generateIdeas(input) {
    return generateIdeas(input);
  },

  async critiqueIdea(idea) {
    return critiqueIdea(idea);
  },

  async scoreIdea(idea) {
    return scoreIdea(idea);
  },

  async recommend(input: MastraAdapterInput): Promise<MastraAdapterOutput> {
    const candidates = await Promise.all(
      (await this.generateIdeas(input)).map(async (idea) => {
        const critiqued = await this.critiqueIdea(idea);
        return this.scoreIdea(critiqued);
      })
    );

    candidates.sort((a, b) => b.score - a.score);

    return {
      runtime: "mastra-adapter-spike",
      mode: "local-deterministic",
      recommendation: candidates[0],
      candidates,
      notes: [
        "This is the adapter boundary Mastra must satisfy.",
        "No live LLM calls are used yet.",
        "Hermes core logic remains framework-independent."
      ]
    };
  }
};
