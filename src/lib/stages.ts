// Application pipeline. `rejected` is a terminal status outside the linear flow.
export const PIPELINE = ["submitted", "under_review", "interview", "offer", "hired"] as const;

export type Stage = (typeof PIPELINE)[number] | "rejected";

export const ALL_STAGES: Stage[] = [...PIPELINE, "rejected"];

export const STAGE_LABEL: Record<Stage, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export function isStage(value: string): value is Stage {
  return (ALL_STAGES as string[]).includes(value);
}

export function nextStage(stage: Stage): Stage | null {
  if (stage === "rejected" || stage === "hired") return null;
  const i = PIPELINE.indexOf(stage as (typeof PIPELINE)[number]);
  return i >= 0 && i < PIPELINE.length - 1 ? PIPELINE[i + 1] : null;
}
