import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { generateIdeas } from "../../../agents/generator.js";
import { critiqueIdea } from "../../../agents/critic.js";
import { scoreIdea } from "../../../evaluations/scorer.js";

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

const critiquedIdeaSchema = generatedIdeaSchema.extend({
  risks: z.array(z.string()),
  verdict: z.enum(["advance", "hold"])
});

const scoredIdeaSchema = critiquedIdeaSchema.extend({
  score: z.number(),
  scoring: z.object({
    shipSize: z.number(),
    strategicFit: z.number(),
    learningValue: z.number(),
    reversibility: z.number()
  })
});

const workflowOutputSchema = z.object({
  runtime: z.literal("mastra-native-workflow"),
  mode: z.literal("local-deterministic"),
  recommendation: scoredIdeaSchema,
  candidates: z.array(scoredIdeaSchema),
  notes: z.array(z.string())
});

const generateStep = createStep({
  id: "generate-ideas",
  inputSchema: ideaInputSchema,
  outputSchema: z.object({
    input: ideaInputSchema,
    ideas: z.array(generatedIdeaSchema)
  }),
  execute: async ({ inputData }) => ({
    input: inputData,
    ideas: generateIdeas(inputData)
  })
});

const critiqueAndScoreStep = createStep({
  id: "critique-and-score-ideas",
  inputSchema: z.object({
    input: ideaInputSchema,
    ideas: z.array(generatedIdeaSchema)
  }),
  outputSchema: z.object({
    candidates: z.array(scoredIdeaSchema)
  }),
  execute: async ({ inputData }) => ({
    candidates: inputData.ideas
      .map(critiqueIdea)
      .map(scoreIdea)
      .sort((a, b) => b.score - a.score)
  })
});

const recommendStep = createStep({
  id: "recommend-idea",
  inputSchema: z.object({
    candidates: z.array(scoredIdeaSchema)
  }),
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => ({
    runtime: "mastra-native-workflow",
    mode: "local-deterministic",
    recommendation: inputData.candidates[0],
    candidates: inputData.candidates,
    notes: [
      "This is the first Mastra-native workflow shape.",
      "It uses createWorkflow, createStep, then, and commit.",
      "Hermes domain logic still lives outside Mastra."
    ]
  })
});

export const ideaRecommendationWorkflow = createWorkflow({
  id: "idea-recommendation-workflow",
  inputSchema: ideaInputSchema,
  outputSchema: workflowOutputSchema
})
  .then(generateStep)
  .then(critiqueAndScoreStep)
  .then(recommendStep)
  .commit();
