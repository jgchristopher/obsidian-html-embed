import { describe, expect, it } from "vitest";
import { bootScript, buildSrcdoc, HEIGHT_MESSAGE_TYPE } from "../src/srcdoc";

const opts = { theme: "dark", embedId: "html-embed-1" } as const;
const script = bootScript(opts);

describe("bootScript", () => {
  it("is a single script element whose body is valid JavaScript", () => {
    const m = /^<script>([\s\S]*)<\/script>$/.exec(script);
    expect(m).not.toBeNull();
    expect(() => new Function(m![1])).not.toThrow();
  });

  it("carries theme, embed id, and message type", () => {
    expect(script).toContain('"theme":"dark"');
    expect(script).toContain('"id":"html-embed-1"');
    expect(script).toContain(`"type":"${HEIGHT_MESSAGE_TYPE}"`);
  });

  it("cannot be closed early by a hostile embed id", () => {
    const s = bootScript({ theme: "light", embedId: "</script><b>x" });
    expect(s.match(/<\/script>/g)).toHaveLength(1);
  });
});

describe("buildSrcdoc", () => {
  it("injects right after an opening <head> tag that has attributes", () => {
    const html = '<!DOCTYPE html><html><head lang="en"><title>T</title></head><body></body></html>';
    expect(buildSrcdoc(html, opts)).toBe(
      `<!DOCTYPE html><html><head lang="en">${script}<title>T</title></head><body></body></html>`,
    );
  });

  it("does not mistake <header> for <head>", () => {
    const html = "<!doctype html><body><header>Hi</header></body>";
    expect(buildSrcdoc(html, opts)).toBe(`<!doctype html>${script}<body><header>Hi</header></body>`);
  });

  it("injects after the doctype, never before it, when there is no <head>", () => {
    const html = "<!DOCTYPE html>\n<p>Hi</p>";
    expect(buildSrcdoc(html, opts)).toBe(`<!DOCTYPE html>${script}\n<p>Hi</p>`);
  });

  it("prepends when there is neither <head> nor doctype", () => {
    expect(buildSrcdoc("<p>Hi</p>", opts)).toBe(`${script}<p>Hi</p>`);
  });

  it("matches <HEAD> case-insensitively", () => {
    expect(buildSrcdoc("<HTML><HEAD></HEAD></HTML>", opts)).toBe(`<HTML><HEAD>${script}</HEAD></HTML>`);
  });
});
