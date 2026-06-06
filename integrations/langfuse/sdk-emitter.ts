import fs from "node:fs";
import path from "node:path";

import type { LangfuseTraceEvent } from "../../observability/langfuse/trace-contract.js";

export type LangfuseSdkEmissionResult = {
  runtime: "langfuse-sdk-emission-spike";
  mode: "dry-run" | "sdk-emission";
  traceId: string;
  attemptedEvents: number;
  emittedEvents: number;
  skippedReason?: string;
  artifactsLinked: boolean;
  notes: string[];
};

type LangfuseTracingModule = {
  observe?: <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    options?: Record<string, unknown>
  ) => (...args: TArgs) => Promise<TResult>;
  updateActiveObservation?: (data: Record<string, unknown>) => void;
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

  if (!tracing.observe || !tracing.updateActiveObservation) {
    throw new Error(
      "Expected @langfuse/tracing to expose observe and updateActiveObservation."
    );
  }

  const emitEvent = tracing.observe(
    async (event: LangfuseTraceEvent) => {
      tracing.updateActiveObservation?.({
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
      name: "hermes-mastra-langfuse-event",
      asType: "span"
    }
  );

  for (const event of events) {
    await emitEvent(event);
  }

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
    emittedEvents: events.length,
    artifactsLinked,
    notes: [
      "Attempted real Langfuse SDK emission through @langfuse/tracing.",
      "Verify trace visibility in the Langfuse UI before removing the blocker.",
      "This does not yet prove Mastra-native automatic tracing."
    ]
  };

  fs.writeFileSync(options.outPath, JSON.stringify(result, null, 2) + "\n");
  return result;
}
