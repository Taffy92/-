import type { ConversionTaskStatus } from "./types";

const allowedTransitions: Readonly<Record<ConversionTaskStatus, readonly ConversionTaskStatus[]>> = {
  queued: ["inspecting"],
  inspecting: ["ready"],
  ready: ["running"],
  running: ["writing", "failed", "cancelled"],
  writing: ["completed", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: []
};

export function canTransitionConversionTask(
  current: ConversionTaskStatus,
  next: ConversionTaskStatus
) {
  return allowedTransitions[current].includes(next);
}
