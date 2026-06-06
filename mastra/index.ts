import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { realSuspendResumeWorkflow } from "../adapters/mastra/native/suspend-resume-real/approval-workflow.js";

export const mastra = new Mastra({
  workflows: {
    realSuspendResumeWorkflow
  },
  storage: new LibSQLStore({
    id: "hermes-mastra-lab-local",
    url: "file:./storage/mastra.db"
  })
});
