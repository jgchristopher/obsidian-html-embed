export type BlockConfig = { file: string; height?: number };
export type ParseResult = BlockConfig | { error: string };

export function parseBlock(source: string): ParseResult {
  const fields = new Map<string, string>();
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields.set(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
  }

  const file = fields.get("file");
  if (!file) return { error: "html-embed: missing required `file:` line" };

  const heightRaw = fields.get("height");
  if (heightRaw === undefined) return { file };

  const height = Number(heightRaw);
  if (!Number.isInteger(height) || height <= 0) {
    return { error: `html-embed: height must be a positive integer, got "${heightRaw}"` };
  }
  return { file, height };
}
