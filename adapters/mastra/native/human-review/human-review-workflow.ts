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

const reviewDecisionSchema = z.object({
  decision: z.enum(["approve", "reject", "revise"]),
  reviewer: z.string(),
  reason: z.string()
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
  candidates: z.array(scoredIdeaSchema),
  reviewRequired: z.literal(true),
  reviewReason: z.string()
});

const outputSchema = z.object({
  runtime: z.literal("mastra-native-human-review"),
  mode: z.literal("local-deterministic-review-simulation"),
  status: z.enum(["approved", "rejected", "revision-requested"]),
  review: reviewDecisionSchema,
  recommendation: scoredIdeaSchema,
  candidates: z.array(scoredIdeaSchema),
  notes: z.array(z.string())
});

const prepareReviewStep = createStep({
  id: "prepare-review-packet",
  inputSchema: ideaInputSchema,
  outputSchema: reviewPacketSchema,
  execute: async ({ inputData }) => {
    const candidates = generateIdeas(inputData)
      .map(critiqueIdea)
      .map(scoreIdea)
      .sort((a, b) => b.score - a.score);

    return {
      recommendation: candidates[0],
      candidates,
      reviewRequired: true,
      reviewReason: "Recommendation requires human promotion decision before artifact release."
    };
  }
});

const simulatedHumanReviewStep = createStep({
  id: "simulated-human-review",
  inputSchema: reviewPacketSchema,
  outputSchema: reviewPacketSchema.extend({
    review: reviewDecisionSchema
  }),
  execute: async ({ inputData }) => ({
    ...inputData,
    review: {
      decision: inputData.recommendation.score >= 18 ? "approve" : "revise",
      reviewer: "local-simulation",
      reason:
        inputData.recommendation.score >= 18
          ? "Score clears threshold and risks are documented."
          : "Score does not clear promotion threshold."
    }
  })
});

const finalizeStep = createStep({
  id: "finalize-reviewed-recommendation",
  inputSchema: reviewPacketSchema.extend({
    review: reviewDecisionSchema
  }),
  outputSchema,
  execute: async ({ inputData }) => {
    const status =
      inputData.review.decision === "approve"
        ? "approved"
        : inputData.review.decision === "reject"
          ? "rejected"
          : "revision-requested";

    return {
      runtime: "mastra-native-human-review",
      mode: "local-deterministic-review-simulation",
      status,
      review: inputData.review,
      recommendation: inputData.recommendation,
      candidates: inputData.candidates,
      notes: [
        "This simulates the Hermes human review boundary.",
        "The next version should replace simulated review with real suspend/resume.",
        "Hermes promotion remains explicit rather than automatic."
      ]
    };
  }
});

export const humanReviewWorkflow = createWorkflow({
  id: "human-review-workflow",
  inputSchema: ideaInputSchema,
  outputSchema
})
  .then(prepareReviewStep)
  .then(simulatedHumanReviewStep)
  .then(finalizeStep)
  .commit();
