/**
 * Basic tests for MCP server utilities
 */

import { describe, it, expect } from "vitest";
import { validatePagination, parseDate, createSuccessResult, createErrorResult } from "../utils";

describe("validatePagination", () => {
  it("should use default values", () => {
    const result = validatePagination();
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it("should enforce maximum limit", () => {
    const result = validatePagination(2000);
    expect(result.limit).toBe(1000);
  });

  it("should enforce minimum limit", () => {
    const result = validatePagination(0);
    expect(result.limit).toBe(1);
  });

  it("should enforce minimum offset", () => {
    const result = validatePagination(10, -5);
    expect(result.offset).toBe(0);
  });
});

describe("parseDate", () => {
  it("should parse valid ISO date", () => {
    const result = parseDate("2024-01-15");
    expect(result).toBe("2024-01-15");
  });

  it("should throw on invalid date", () => {
    expect(() => parseDate("invalid")).toThrow("Invalid date format");
  });
});

describe("createSuccessResult", () => {
  it("should create valid success result", () => {
    const data = { test: "value" };
    const result = createSuccessResult(data);

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.test).toBe("value");
  });
});

describe("createErrorResult", () => {
  it("should create error result from string", () => {
    const result = createErrorResult("Test error");

    expect(result.content).toHaveLength(1);
    expect(result.isError).toBe(true);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Test error");
    expect(parsed.code).toBe("TOOL_ERROR");
  });

  it("should create error result from Error object", () => {
    const error = new Error("Test error");
    const result = createErrorResult(error);

    expect(result.isError).toBe(true);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Test error");
  });
});
