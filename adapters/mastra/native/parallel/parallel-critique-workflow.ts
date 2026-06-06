import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { generateIdeas } from "../../../../agents/generator.js";
import { critiqueIdea } from "../../../../agents/critic.js";
import { scoreIdea } from "../../../../evaluations/scorer.js";

const ideaInputSchema = z.object({
  goal: z.string(),
  constraints: z.array(z.string()),
  context: z.array(z.string())
});

const generatedIdeaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  rationale: z.array(z.string())
});

const critiqueSchema = z.object({
  lane: z.string(),
  risks: z.array(z.string()),
  verdict: z.enum(["advance", "hold"])
});

const scoredIdeaSchema = generatedIdeaSchema.extend({
  risks: z.array(z.string()),
  verdict: z.enum(["advance", "hold"]),
  score: z.number(),
  scoring: z.object({
    shipSize: z.number(),
    strategicFit: z.number(),
    learningValue: z.number(),
    reversibility: z.number()
  }),
  critiques: z.array(critiqueSchema)
});

const outputSchema = z.object({
  runtime: z.literal("mastra-native-parallel-critique"),
  mode: z.literal("local-deterministic"),
  recommendation: scoredIdeaSchema,
  candidates: z.array(scoredIdeaSchema),
  notes: z.array(z.string())
});

const generateStep = createStep({
  id: "generate-ideas",
  inputSchema: ideaInputSchema,
  outputSchema: z.object({
    ideas: z.array(generatedIdeaSchema)
  }),
  execute: async ({ inputData }) => ({
    ideas: generateIdeas(inputData)
  })
});

const parallelCritiqueStep = createStep({
  id: "parallel-critique",
  inputSchema: z.object({
    ideas: z.array(generatedIdeaSchema)
  }),
  outputSchema: z.object({
    candidates: z.array(scoredIdeaSchema)
  }),
  execute: async ({ inputData }) => {
    const candidates = await Promise.all(
      inputData.ideas.map(async (idea) => {
        const base = critiqueIdea(idea);

        const critiques = [
          {
            lane: "strategy",
            risks: base.risks,
            verdict: base.verdict
          },
          {
            lane: "execution",
            risks: idea.title.includes("Workflow")
              ? ["Implementation is shippable but may still hide runtime tradeoffs"]
              : ["May expand scope before the core workflow proves value"],
            verdict: base.verdict
          },
          {
            lane: "architecture",
            risks: idea.title.includes("Adapter")
              ? ["Abstraction may become permanent before Mastra earns promotion"]
              : ["Architecture impact needs comparison against plain TypeScript"],
            verdict: base.verdict
          }
        ];

        const merged = {
          ...base,
          risks: [...new Set(critiques.flatMap((critique) => critique.risks))]
        };

        return {
          ...scoreIdea(merged),
          critiques
        };
      })
    );

    candidates.sort((a, b) => b.score - a.score);

    return { candidates };
  }
});

const recommendStep = createStep({
  id: "recommend",
  inputSchema: z.object({
    candidates: z.array(scoredIdeaSchema)
  }),
  outputSchema,
  execute: async ({ inputData }) => ({
    runtime: "mastra-native-parallel-critique",
    mode: "local-deterministic",
    recommendation: inputData.candidates[0],
    candidates: inputData.candidates,
    notes: [
      "This tests fan-out/fan-in critique shape.",
      "Mastra only earns promotion if this is clearer than plain TypeScript.",
      "Hermes domain logic remains outside the runtime."
    ]
  })
});

export const parallelCritiqueWorkflow = createWorkflow({
  id: "parallel-critique-workflow",
  inputSchema: ideaInputSchema,
  outputSchema
})
  .then(generateStep)
  .then(parallelCritiqueStep)
  .then(recommendStep)
  .commit();
