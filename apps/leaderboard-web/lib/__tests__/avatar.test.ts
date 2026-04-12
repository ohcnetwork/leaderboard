import { describe, expect, it } from "vitest";
import { getAvatarSrc } from "../utils";

describe("getAvatarSrc", () => {
  it("returns webp path for a username", () => {
    expect(getAvatarSrc("alice")).toBe("/avatars/alice.webp");
  });

  it("handles usernames with special characters", () => {
    expect(getAvatarSrc("user-name_123")).toBe("/avatars/user-name_123.webp");
  });
});
