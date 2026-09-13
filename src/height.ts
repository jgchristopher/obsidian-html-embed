import { HEIGHT_MESSAGE_TYPE } from "./srcdoc";

export const MIN_HEIGHT = 50;
export const MAX_HEIGHT = 20000;

// Parent-side filter for the boot script's postMessage payload. Rejects
// anything that isn't a well-formed message for this embed before we trust
// its height, then clamps into the supported range.
export function heightFromMessage(data: unknown, embedId: string): number | null {
  if (typeof data !== "object" || data === null) return null;

  const { type, id, height } = data as Record<string, unknown>;
  if (type !== HEIGHT_MESSAGE_TYPE) return null;
  if (id !== embedId) return null;
  if (typeof height !== "number" || !Number.isFinite(height)) return null;

  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height));
}
