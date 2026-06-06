export type FailureScenarioId =
  | "generator-throws"
  | "critic-throws"
  | "scorer-invalid"
  | "artifact-write-blocked";

export type FailureScenario = {
  id: FailureScenarioId;
  stage: "generate" | "critique" | "score" | "artifact";
  expectedBehavior: "retry-then-recover" | "fail-safely";
  maxAttempts: number;
};

export type FailureAttempt = {
  attempt: number;
  status: "failed" | "recovered" | "safe-failure";
  error?: string;
};

export type FailureResult = {
  id: FailureScenarioId;
  stage: FailureScenario["stage"];
  expectedBehavior: FailureScenario["expectedBehavior"];
  passed: boolean;
  attempts: FailureAttempt[];
  finalStatus: "recovered" | "safe-failure";
  artifactPreserved: boolean;
  traceEmitted: boolean;
};

export type FailureQualificationReport = {
  runtime: "failure-qualification-local-contract";
  mode: "local-deterministic-no-network";
  recommendation: "continue-evaluation" | "advance-failure-handling" | "hold";
  results: FailureResult[];
  notes: string[];
};
