import { describe, expect, it } from "vitest";
import { parseBlock } from "../src/parse";

describe("parseBlock", () => {
  it("reads file", () => {
    expect(parseBlock("file: ELI5/How DNS Works.html")).toEqual({
      file: "ELI5/How DNS Works.html",
    });
  });

  it("reads file and height", () => {
    expect(parseBlock("file: a.html\nheight: 600")).toEqual({ file: "a.html", height: 600 });
  });

  it("ignores blank lines, lines without a colon, unknown keys, CRLF, and padding", () => {
    expect(parseBlock("\r\n  file:  a.html  \r\njust text\r\ntheme: dark\r\n\r\n")).toEqual({
      file: "a.html",
    });
  });

  it("errors when file is missing", () => {
    expect(parseBlock("height: 600")).toEqual({
      error: "html-embed: missing required `file:` line",
    });
  });

  it("errors when file is empty", () => {
    expect(parseBlock("file:")).toEqual({
      error: "html-embed: missing required `file:` line",
    });
  });

  it.each(["0", "-5", "12.5", "tall", ""])("errors on invalid height %j", (h) => {
    expect(parseBlock(`file: a.html\nheight: ${h}`)).toEqual({
      error: `html-embed: height must be a positive integer, got "${h}"`,
    });
  });
});
