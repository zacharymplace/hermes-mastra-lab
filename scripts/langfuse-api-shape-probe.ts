import {
  getLangfuseTracer,
  observe,
  startActiveObservation,
  startObservation,
  updateActiveObservation
} from "@langfuse/tracing";

console.log({
  observe: typeof observe,
  startActiveObservation: typeof startActiveObservation,
  startObservation: typeof startObservation,
  updateActiveObservation: typeof updateActiveObservation,
  getLangfuseTracer: typeof getLangfuseTracer
});

const tracer = getLangfuseTracer();

console.log({
  tracerType: typeof tracer,
  tracerKeys:
    tracer && typeof tracer === "object"
      ? Object.keys(tracer).sort()
      : []
});
