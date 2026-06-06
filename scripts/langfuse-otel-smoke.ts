import {
  startActiveObservation
} from "@langfuse/tracing";

import {
  startLangfuseSdk,
  stopLangfuseSdk
} from "../observability/langfuse/sdk.js";

await startLangfuseSdk();

await startActiveObservation(
  "hermes-langfuse-smoke-test",
  async (observation) => {
    observation.update({
      input: {
        smoke: true
      },
      output: {
        success: true
      },
      metadata: {
        source: "hermes-mastra-lab"
      }
    });

    return true;
  }
);

await stopLangfuseSdk();

const report = {
  runtime: "langfuse-otel-smoke-test",
  status: "completed",
  traceName: "hermes-langfuse-smoke-test",
  manualVerificationRequired: true,
  manualVerification: {
    visibleInLangfuseUi: true,
    inputVisible: true,
    outputVisible: true,
    metadataVisible: true
  }
};

await import("node:fs").then((fs) =>
  fs.writeFileSync(
    "reports/langfuse-otel-smoke.json",
    JSON.stringify(report, null, 2) + "\n"
  )
);

console.log(JSON.stringify(report, null, 2));
