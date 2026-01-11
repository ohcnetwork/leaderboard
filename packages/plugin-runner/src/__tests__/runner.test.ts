/**
 * Dependency resolution tests
 */

import { describe, it, expect } from "vitest";
import { resolvePluginOrder } from "../runner";

describe("resolvePluginOrder", () => {
  it("orders a simple chain", () => {
    const order = resolvePluginOrder([
      ["A", { depends_on: [] }],
      ["B", { depends_on: ["A"] }],
    ]);

    expect(order).toEqual(["A", "B"]);
  });

  it("respects dependencies even if config order is reversed", () => {
    const order = resolvePluginOrder([
      ["B", { depends_on: ["A"] }],
      ["A", { depends_on: [] }],
    ]);

    expect(order).toEqual(["A", "B"]);
  });

  it("fails for missing dependency IDs", () => {
    expect(() =>
      resolvePluginOrder([
        ["A", { depends_on: ["X"] }],
      ])
    ).toThrow('Plugin "A" depends on unknown plugin "X"');
  });

  it("fails for cycles with a readable path", () => {
    expect(() =>
      resolvePluginOrder([
        ["A", { depends_on: ["B"] }],
        ["B", { depends_on: ["A"] }],
      ])
    ).toThrow("Circular dependency detected: A -> B -> A");
  });
});
