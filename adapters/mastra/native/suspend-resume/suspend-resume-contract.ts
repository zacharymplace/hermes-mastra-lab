export type ReviewDecision = {
  decision: "approve" | "reject" | "revise";
  reviewer: string;
  reason: string;
};

export type SuspendPacket = {
  status: "suspended";
  suspendReason: string;
  recommendationTitle: string;
  recommendationScore: number;
  requiredDecision: ReviewDecision["decision"][];
};

export type ResumeResult = {
  runtime: "mastra-suspend-resume-contract";
  status: "approved" | "rejected" | "revision-requested";
  review: ReviewDecision;
  notes: string[];
};

export function resumeFromDecision(review: ReviewDecision): ResumeResult {
  const status =
    review.decision === "approve"
      ? "approved"
      : review.decision === "reject"
        ? "rejected"
        : "revision-requested";

  return {
    runtime: "mastra-suspend-resume-contract",
    status,
    review,
    notes: [
      "This contract defines the Hermes suspend/resume promotion boundary.",
      "Mastra must preserve explicit review state.",
      "Promotion cannot happen without a review decision."
    ]
  };
}
