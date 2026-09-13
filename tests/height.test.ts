import { describe, expect, it } from "vitest";
import { HEIGHT_MESSAGE_TYPE } from "../src/srcdoc";
import { heightFromMessage, MAX_HEIGHT, MIN_HEIGHT } from "../src/height";

const embedId = "html-embed-1";
const valid = (height: unknown) => ({ type: HEIGHT_MESSAGE_TYPE, id: embedId, height });

describe("heightFromMessage", () => {
  it("returns the height from a valid message", () => {
    expect(heightFromMessage(valid(300), embedId)).toBe(300);
  });

  it("clamps a height below MIN_HEIGHT up to MIN_HEIGHT", () => {
    expect(heightFromMessage(valid(10), embedId)).toBe(MIN_HEIGHT);
  });

  it("clamps a height above MAX_HEIGHT down to MAX_HEIGHT", () => {
    expect(heightFromMessage(valid(50000), embedId)).toBe(MAX_HEIGHT);
  });

  it("rejects the wrong message type", () => {
    expect(heightFromMessage({ type: "other", id: embedId, height: 300 }, embedId)).toBeNull();
  });

  it("rejects the wrong embed id", () => {
    expect(
      heightFromMessage({ type: HEIGHT_MESSAGE_TYPE, id: "other", height: 300 }, embedId),
    ).toBeNull();
  });

  it.each([null, "a string", 42])("rejects non-object data (%#)", (data) => {
    expect(heightFromMessage(data, embedId)).toBeNull();
  });

  it.each([NaN, Infinity, "300"])("rejects a non-finite-number height (%#)", (height) => {
    expect(heightFromMessage(valid(height), embedId)).toBeNull();
  });
});
