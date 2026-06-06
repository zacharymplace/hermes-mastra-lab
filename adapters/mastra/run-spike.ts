import fs from "node:fs";
import path from "node:path";

import { localMastraAdapter } from "./local-adapter.js";
import type { MastraAdapterInput } from "./types.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const outPath = path.join(root, "hermes/mastra-adapter-spike.json");

const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as MastraAdapterInput;
const result = await localMastraAdapter.recommend(input);

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");

console.log(JSON.stringify(result, null, 2));
