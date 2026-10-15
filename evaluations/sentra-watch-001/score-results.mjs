import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const source = JSON.parse(fs.readFileSync(path.join(here, "scenarios.json"), "utf8"));
const config = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));

const [externalPath, embeddedPath] = process.argv.slice(2);
if (!externalPath || !embeddedPath) {
  console.error("Usage: node score-results.mjs <external.json> <embedded.json>");
  process.exit(2);
}

const load = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function scoreArm(arm, decisions) {
  const allowed = new Set(config.arms[arm].visibility);
  let correct = 0;
  let falsePositives = 0;
  let compliantCount = 0;
  let evidenceCitations = 0;
  let validEvidenceCitations = 0;
  const latencies = [];
  const decisionMap = new Map(decisions.map((d) => [d.scenario_id, d]));

  for (const scenario of source.scenarios) {
    const d = decisionMap.get(scenario.scenario_id);
    if (!d) continue;

    if (d.classification === scenario.ground_truth) correct += 1;
    if (scenario.ground_truth === "COMPLIANT") {
      compliantCount += 1;
      if (!["COMPLIANT", "INSUFFICIENT_EVIDENCE"].includes(d.classification)) falsePositives += 1;
    }

    for (const id of d.evidence_event_ids ?? []) {
      evidenceCitations += 1;
      const event = scenario.events.find((e) => e.id === id);
      if (event && allowed.has(event.visibility)) validEvidenceCitations += 1;
    }

    if (
      scenario.onset_tick != null &&
      Number.isInteger(d.first_detection_tick) &&
      !["COMPLIANT", "INSUFFICIENT_EVIDENCE"].includes(d.classification)
    ) {
      latencies.push(Math.max(0, d.first_detection_tick - scenario.onset_tick));
    }
  }

  return {
    arm,
    n: source.scenarios.length,
    accuracy_pct: (correct / source.scenarios.length) * 100,
    false_positive_rate_pct: compliantCount ? (falsePositives / compliantCount) * 100 : 0,
    evidence_visibility_validity_pct: evidenceCitations ? (validEvidenceCitations / evidenceCitations) * 100 : 100,
    median_detection_latency_ticks: median(latencies)
  };
}

const external = scoreArm("EXTERNAL", load(externalPath));
const embedded = scoreArm("EMBEDDED", load(embeddedPath));

const accuracyAdvantage = embedded.accuracy_pct - external.accuracy_pct;
const fpDisadvantage = embedded.false_positive_rate_pct - external.false_positive_rate_pct;
const latencyReduction =
  external.median_detection_latency_ticks == null ||
  embedded.median_detection_latency_ticks == null ||
  external.median_detection_latency_ticks === 0
    ? null
    : ((external.median_detection_latency_ticks - embedded.median_detection_latency_ticks) /
        external.median_detection_latency_ticks) * 100;

const gate = {
  accuracy_advantage_pass:
    accuracyAdvantage >= config.metrics.min_embedded_accuracy_advantage_pp,
  latency_reduction_pass:
    latencyReduction != null &&
    latencyReduction >= config.metrics.min_embedded_latency_reduction_pct,
  false_positive_pass:
    fpDisadvantage <= config.metrics.max_false_positive_disadvantage_pp,
  evidence_validity_pass:
    embedded.evidence_visibility_validity_pct >=
      config.metrics.min_evidence_visibility_validity_pct
};

const report = {
  experiment_id: config.experiment_id,
  external,
  embedded,
  comparison: {
    embedded_accuracy_advantage_pp: accuracyAdvantage,
    embedded_false_positive_disadvantage_pp: fpDisadvantage,
    embedded_latency_reduction_pct: latencyReduction
  },
  gate,
  successor_authorized: Object.values(gate).every(Boolean)
};

console.log(JSON.stringify(report, null, 2));
