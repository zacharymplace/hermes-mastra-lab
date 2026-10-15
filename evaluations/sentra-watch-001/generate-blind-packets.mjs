import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const source = JSON.parse(fs.readFileSync(path.join(here, "scenarios.json"), "utf8"));
const config = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));
const outDir = path.join(here, "generated");
fs.mkdirSync(outDir, { recursive: true });

for (const [arm, armConfig] of Object.entries(config.arms)) {
  const allowed = new Set(armConfig.visibility);
  const packet = {
    experiment_id: config.experiment_id,
    arm,
    instructions: {
      classifications: config.classifications,
      evidence_rule: "Cite only event IDs present in this packet.",
      output_fields: [
        "scenario_id",
        "arm",
        "classification",
        "first_detection_tick",
        "confidence",
        "evidence_event_ids",
        "rationale"
      ]
    },
    scenarios: source.scenarios.map(({ scenario_id, family, events }) => ({
      scenario_id,
      family,
      events: events.filter((event) => allowed.has(event.visibility))
    }))
  };
  fs.writeFileSync(
    path.join(outDir, `${arm.toLowerCase()}-packet.json`),
    JSON.stringify(packet, null, 2) + "\n"
  );
}

console.log(`Generated blinded packets in ${outDir}`);
