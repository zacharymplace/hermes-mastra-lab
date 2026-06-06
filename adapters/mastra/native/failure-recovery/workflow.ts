import fs from "node:fs";
import path from "node:path";

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const inputSchema = z.object({
  failMarkerPath: z.string(),
  outputPath: z.string()
});

const outputSchema = z.object({
  runtime: z.literal("mastra-failure-recovery"),
  status: z.literal("recovered"),
  attempts: z.number(),
  markerPath: z.string()
});

const flakyStep = createStep({
  id: "flaky-step",
  inputSchema,
  outputSchema,
  execute: async ({ inputData }) => {
    const markerPath = path.resolve(inputData.failMarkerPath);
    const outputPath = path.resolve(inputData.outputPath);

    let attempts = 0;

    if (fs.existsSync(markerPath)) {
      attempts = Number(fs.readFileSync(markerPath, "utf8")) || 0;
    }

    attempts += 1;

    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    fs.writeFileSync(markerPath, String(attempts));

    if (attempts === 1) {
      throw new Error("Intentional first-attempt failure for recovery qualification.");
    }

    const result = {
      runtime: "mastra-failure-recovery" as const,
      status: "recovered" as const,
      attempts,
      markerPath
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");

    return result;
  }
});

export const failureRecoveryWorkflow = createWorkflow({
  id: "failure-recovery-workflow",
  inputSchema,
  outputSchema
})
  .then(flakyStep)
  .commit();
