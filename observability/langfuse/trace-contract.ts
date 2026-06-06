export type LangfuseTraceEvent = {
  traceId: string;
  stage:
    | "core"
    | "adapter"
    | "native"
    | "parallel"
    | "human-review"
    | "suspend"
    | "resume"
    | "qualification";
  name: string;
  inputArtifact?: string;
  outputArtifact?: string;
  status: "success" | "failed" | "suspended" | "approved";
  metadata: Record<string, unknown>;
};

export type LangfuseTraceReport = {
  runtime: "langfuse-qualification-local-contract";
  mode: "local-deterministic-no-network";
  traceId: string;
  events: LangfuseTraceEvent[];
  notes: string[];
};
