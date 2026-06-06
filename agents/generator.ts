export type IdeaInput = {
  goal: string;
  constraints: string[];
  context: string[];
};

export type GeneratedIdea = {
  title: string;
  summary: string;
  rationale: string[];
};

export function generateIdeas(input: IdeaInput): GeneratedIdea[] {
  return [
    {
      title: "Hermes Idea Recommendation Workflow",
      summary:
        "Create a deterministic idea generation, critique, scoring, and recommendation workflow before adding live LLM calls.",
      rationale: [
        "Proves the orchestration shape first",
        "Creates a baseline for later Mastra comparison",
        "Keeps the experiment auditable"
      ]
    },
    {
      title: "Mastra Runtime Adapter Spike",
      summary:
        "Wrap Hermes agents behind a thin runtime adapter so Mastra can be tested without contaminating core logic.",
      rationale: [
        "Reduces framework lock-in",
        "Keeps Hermes portable",
        "Creates a clear comparison point"
      ]
    },
    {
      title: "Langfuse Trace Contract",
      summary:
        "Define the minimum trace fields Hermes must emit regardless of runtime.",
      rationale: [
        "Preserves observability",
        "Makes runtime swaps measurable",
        "Supports regression review"
      ]
    }
  ];
}
