/**
 * Tests for the D1 database client adapter
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { D1DatabaseClient, createD1Database } from "../d1-client";

/**
 * Create a mock D1Database binding
 */
function createMockD1() {
  const mockStatement = {
    bind: vi.fn(),
    all: vi.fn(),
  };

  // bind() returns the same statement (chainable)
  mockStatement.bind.mockReturnValue(mockStatement);

  const d1 = {
    prepare: vi.fn().mockReturnValue(mockStatement),
    batch: vi.fn(),
  } as unknown as D1Database;

  return { d1, mockStatement };
}

describe("D1DatabaseClient", () => {
  let d1: D1Database;
  let mockStatement: ReturnType<typeof createMockD1>["mockStatement"];

  beforeEach(() => {
    const mock = createMockD1();
    d1 = mock.d1;
    mockStatement = mock.mockStatement;
  });

  describe("execute", () => {
    it("should execute a query without params", async () => {
      mockStatement.all.mockResolvedValue({
        results: [{ id: 1, name: "alice" }],
        meta: { changes: 0 },
      });

      const client = new D1DatabaseClient(d1);
      const result = await client.execute("SELECT * FROM contributor");

      expect(d1.prepare).toHaveBeenCalledWith("SELECT * FROM contributor");
      expect(mockStatement.bind).not.toHaveBeenCalled();
      expect(result.rows).toEqual([{ id: 1, name: "alice" }]);
      expect(result.rowsAffected).toBe(0);
    });

    it("should execute a query with params", async () => {
      mockStatement.all.mockResolvedValue({
        results: [{ username: "alice", role: "core" }],
        meta: { changes: 0 },
      });

      const client = new D1DatabaseClient(d1);
      const result = await client.execute(
        "SELECT * FROM contributor WHERE username = ?",
        ["alice"],
      );

      expect(d1.prepare).toHaveBeenCalledWith(
        "SELECT * FROM contributor WHERE username = ?",
      );
      expect(mockStatement.bind).toHaveBeenCalledWith("alice");
      expect(result.rows).toEqual([{ username: "alice", role: "core" }]);
    });

    it("should handle insert results with lastInsertRowid", async () => {
      mockStatement.all.mockResolvedValue({
        results: [],
        meta: { changes: 1, last_row_id: 42 },
      });

      const client = new D1DatabaseClient(d1);
      const result = await client.execute(
        "INSERT INTO contributor (username) VALUES (?)",
        ["bob"],
      );

      expect(result.rowsAffected).toBe(1);
      expect(result.lastInsertRowid).toBe(42n);
    });

    it("should handle empty results", async () => {
      mockStatement.all.mockResolvedValue({
        results: [],
        meta: { changes: 0 },
      });

      const client = new D1DatabaseClient(d1);
      const result = await client.execute(
        "SELECT * FROM contributor WHERE username = ?",
        ["nonexistent"],
      );

      expect(result.rows).toEqual([]);
      expect(result.rowsAffected).toBe(0);
    });

    it("should handle undefined results gracefully", async () => {
      mockStatement.all.mockResolvedValue({
        meta: { changes: 0 },
      });

      const client = new D1DatabaseClient(d1);
      const result = await client.execute("SELECT 1");

      expect(result.rows).toEqual([]);
    });
  });

  describe("batch", () => {
    it("should execute batch statements", async () => {
      const mockStmt1 = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn(),
      };
      const mockStmt2 = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn(),
      };

      (d1.prepare as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockStmt1)
        .mockReturnValueOnce(mockStmt2);

      (d1.batch as ReturnType<typeof vi.fn>).mockResolvedValue([
        { results: [{ count: 5 }], meta: { changes: 0 } },
        { results: [], meta: { changes: 3 } },
      ]);

      const client = new D1DatabaseClient(d1);
      const results = await client.batch([
        { sql: "SELECT COUNT(*) as count FROM contributor" },
        {
          sql: "DELETE FROM activity WHERE contributor = ?",
          params: ["alice"],
        },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].rows).toEqual([{ count: 5 }]);
      expect(results[0].rowsAffected).toBe(0);
      expect(results[1].rows).toEqual([]);
      expect(results[1].rowsAffected).toBe(3);
    });
  });

  describe("close", () => {
    it("should be a no-op", async () => {
      const client = new D1DatabaseClient(d1);
      await expect(client.close()).resolves.toBeUndefined();
    });
  });
});

describe("createD1Database", () => {
  it("should return a Database instance", () => {
    const { d1 } = createMockD1();
    const db = createD1Database(d1);

    expect(db).toBeInstanceOf(D1DatabaseClient);
    expect(db.execute).toBeDefined();
    expect(db.batch).toBeDefined();
    expect(db.close).toBeDefined();
  });
});
