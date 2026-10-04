import type { WorkerOutbound, WordVerdict } from "@tilawa/core";
import type { Passage } from "../learning";
export type EngineCommand =
  | { type: "begin"; expected?: Passage }
  | { type: "audio"; samples: Float32Array }
  | { type: "finish" };
export interface EngineResult {
  id: number;
  events: WorkerOutbound[];
  verdicts: WordVerdict[];
  words?: string[];
  error?: string;
}
