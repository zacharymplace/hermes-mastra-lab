import path from "node:path";

import { emitLangfuseTraceContract } from "../integrations/langfuse/sdk-emitter.js";

const root = process.cwd();

const result = await emitLangfuseTraceContract({
  root,
  sourceReportPath: "reports/langfuse-qualification.json",
  outPath: path.join(root, "reports/langfuse-sdk-emission-spike.json")
});

console.log(JSON.stringify(result, null, 2));
