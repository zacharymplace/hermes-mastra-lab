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

const scoredIdeaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  rationale: z.array(z.string()),
  risks: z.array(z.string()),
  verdict: z.enum(["advance", "hold"]),
  score: z.number(),
  scoring: z.object({
    shipSize: z.number(),
    strategicFit: z.number(),
    learningValue: z.number(),
    reversibility: z.number()
  })
});

const reviewPacketSchema = z.object({
  recommendation: scoredIdeaSchema,
  candidates: z.array(scoredIdeaSchema)
});

const resumeSchema = z.object({
  approved: z.boolean(),
  reviewer: z.string(),
  reason: z.string()
});

const suspendSchema = z.object({
  reason: z.string(),
  recommendationTitle: z.string(),
  recommendationScore: z.number(),
  requiredDecision: z.array(z.enum(["approve", "reject"]))
});

const outputSchema = z.object({
  runtime: z.literal("mastra-real-suspend-resume"),
  status: z.enum(["approved", "rejected"]),
  review: resumeSchema,
  recommendation: scoredIdeaSchema,
  suspendReason: z.string()
});

const prepareRecommendationStep = createStep({
  id: "prepare-recommendation",
  inputSchema: ideaInputSchema,
  outputSchema: reviewPacketSchema,
  execute: async ({ inputData }) => {
    const candidates = generateIdeas(inputData)
      .map(critiqueIdea)
      .map(scoreIdea)
      .sort((a, b) => b.score - a.score);

    return {
      recommendation: candidates[0],
      candidates
    };
  }
});

export const approvalStep = createStep({
  id: "approval-step",
  inputSchema: reviewPacketSchema,
  resumeSchema,
  suspendSchema,
  outputSchema,
  execute: async ({ inputData, resumeData, suspend, suspendData }) => {
    if (!resumeData) {
      return await suspend({
        reason: "Human approval required before Hermes promotion.",
        recommendationTitle: inputData.recommendation.title,
        recommendationScore: inputData.recommendation.score,
        requiredDecision: ["approve", "reject"]
      });
    }

    return {
      runtime: "mastra-real-suspend-resume",
      status: resumeData.approved ? "approved" : "rejected",
      review: resumeData,
      recommendation: inputData.recommendation,
      suspendReason:
        suspendData?.reason ?? "Human approval required before Hermes promotion."
    };
  }
});

export const realSuspendResumeWorkflow = createWorkflow({
  id: "real-suspend-resume-workflow",
  inputSchema: ideaInputSchema,
  outputSchema
})
  .then(prepareRecommendationStep)
  .then(approvalStep)
  .commit();
