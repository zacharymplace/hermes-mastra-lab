import fs from "node:fs";
import path from "node:path";

import type { LangfuseTraceEvent } from "../../observability/langfuse/trace-contract.js";

type LangfuseObservation = {
  update: (data: Record<string, unknown>) => unknown;
};

export type LangfuseSdkEmissionResult = {
  runtime: "langfuse-sdk-emission-spike";
  mode: "dry-run" | "sdk-emission";
  traceId: string;
  attemptedEvents: number;
  emittedEvents: number;
  skippedReason?: string;
  artifactsLinked: boolean;
  sdkVersionMode: "langfuse-tracing-5";
  warnings: string[];
  notes: string[];
};

type LangfuseTracingModule = {
  startActiveObservation?: <TResult>(
    name: string,
    fn: (observation: LangfuseObservation) => Promise<TResult>,
    options?: Record<string, unknown>
  ) => Promise<TResult>;
  flush?: () => Promise<void>;
  shutdown?: () => Promise<void>;
};

function hasLangfuseCredentials() {
  return Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

function artifactExists(root: string, artifact?: string) {
  return artifact ? fs.existsSync(path.join(root, artifact)) : false;
}

export async function emitLangfuseTraceContract(options: {
  root: string;
  sourceReportPath: string;
  outPath: string;
}): Promise<LangfuseSdkEmissionResult> {
  const source = JSON.parse(
    fs.readFileSync(path.join(options.root, options.sourceReportPath), "utf8")
  );

  const events = source.events as LangfuseTraceEvent[];
  const traceId = source.traceId as string;

  const artifactsLinked = events.every((event) =>
    artifactExists(options.root, event.outputArtifact)
  );

  if (!hasLangfuseCredentials()) {
    const result: LangfuseSdkEmissionResult = {
      runtime: "langfuse-sdk-emission-spike",
      mode: "dry-run",
      traceId,
      attemptedEvents: events.length,
      emittedEvents: 0,
      skippedReason:
        "Missing LANGFUSE_PUBLIC_KEY and/or LANGFUSE_SECRET_KEY. No network emission attempted.",
      artifactsLinked,
      sdkVersionMode: "langfuse-tracing-5",
      warnings: [],
      notes: [
        "Dry-run mode validates the SDK emission payload without sending network traces.",
        "Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY to attempt real SDK emission.",
        "LANGFUSE_BASE_URL may be set for self-hosted Langfuse."
      ]
    };

    fs.writeFileSync(options.outPath, JSON.stringify(result, null, 2) + "\n");
    return result;
  }

  const tracing = (await import("@langfuse/tracing")) as LangfuseTracingModule;

  if (!tracing.startActiveObservation) {
    throw new Error(
      "Expected @langfuse/tracing v5 to expose startActiveObservation."
    );
  }

  const emitted = await tracing.startActiveObservation(
    "hermes-mastra-langfuse-qualification",
    async (rootObservation) => {
      rootObservation.update({
        input: {
          sourceReportPath: options.sourceReportPath
        },
        output: {
          artifactCount: events.length,
          artifactsLinked
        },
        metadata: {
          hermesTraceId: traceId,
          sourceReportPath: options.sourceReportPath,
          artifactCount: events.length,
          artifactsLinked
        },
        tags: ["hermes", "mastra", "langfuse", "qualification"]
      });

      const emittedEvents = [];

      for (const event of events) {
        const emittedEvent = await tracing.startActiveObservation!(
          `hermes-stage-${event.stage}`,
          async (eventObservation) => {
            eventObservation.update({
              input: {
                inputArtifact: event.inputArtifact ?? null
              },
              output: {
                outputArtifact: event.outputArtifact ?? null,
                status: event.status
              },
              metadata: {
                hermesTraceId: traceId,
                stage: event.stage,
                artifactExists: artifactExists(options.root, event.outputArtifact),
                ...event.metadata
              },
              tags: [
                "hermes",
                "mastra",
                "langfuse-qualification",
                `stage:${event.stage}`
              ]
            });

            return {
              stage: event.stage,
              status: event.status,
              outputArtifact: event.outputArtifact ?? null
            };
          },
          {
            asType: "span"
          }
        );

        emittedEvents.push(emittedEvent);
      }

      return emittedEvents;
    },
    {
      asType: "span"
    }
  );

  if (tracing.flush) {
    await tracing.flush();
  }

  if (tracing.shutdown) {
    await tracing.shutdown();
  }

  const result: LangfuseSdkEmissionResult = {
    runtime: "langfuse-sdk-emission-spike",
    mode: "sdk-emission",
    traceId,
    attemptedEvents: events.length,
    emittedEvents: emitted.length,
    artifactsLinked,
    sdkVersionMode: "langfuse-tracing-5",
    warnings: [],
    notes: [
      "Attempted real Langfuse SDK emission through @langfuse/tracing v5 startActiveObservation with direct observation.update calls.",
      "Verify trace visibility in the Langfuse UI before removing the blocker.",
      "This does not yet prove Mastra-native automatic tracing."
    ]
  };

  fs.writeFileSync(options.outPath, JSON.stringify(result, null, 2) + "\n");
  return result;
}
