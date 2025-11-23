import { describe, it, expect } from "vitest";

interface FrontmatterData {
  role: string | null;
  slack: string | null;
}

/**
 * Extract role and slack from markdown frontmatter
 * @param markdown - The markdown content with frontmatter
 * @returns The role and slack extracted from frontmatter
 */
function extractFrontmatterData(markdown: string): FrontmatterData {
  // Match frontmatter between --- delimiters
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match || !match[1]) {
    return { role: null, slack: null };
  }

  const frontmatter = match[1];

  // Extract role field from frontmatter
  const roleRegex = /^role:\s*(.+)$/m;
  const roleMatch = frontmatter.match(roleRegex);
  const role = roleMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;

  // Extract slack field from frontmatter
  const slackRegex = /^slack:\s*(.+)$/m;
  const slackMatch = frontmatter.match(slackRegex);
  let slack = slackMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;
  
  // If slack is empty string, treat it as null
  if (slack === "") {
    slack = null;
  }

  return { role, slack };
}

describe("extractFrontmatterData", () => {
  it("should extract role and slack from valid frontmatter", () => {
    const markdown = `---
name: Rahul
title: Contributor
github: 07Akashh
twitter: ""
linkedin: ""
slack: U12345ABC
joining_date: ""
role: contributor
---

Still waiting for this`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("contributor");
    expect(result.slack).toBe("U12345ABC");
  });

  it("should extract role with quotes", () => {
    const markdown = `---
name: John Doe
role: "maintainer"
slack: "U67890DEF"
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("maintainer");
    expect(result.slack).toBe("U67890DEF");
  });

  it("should extract role with single quotes", () => {
    const markdown = `---
name: Jane Doe
role: 'admin'
slack: 'U11111GHI'
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("admin");
    expect(result.slack).toBe("U11111GHI");
  });

  it("should return null for both if no frontmatter", () => {
    const markdown = `Just some regular markdown content without frontmatter`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBeNull();
    expect(result.slack).toBeNull();
  });

  it("should return null for missing fields", () => {
    const markdown = `---
name: John Doe
title: Developer
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBeNull();
    expect(result.slack).toBeNull();
  });

  it("should handle empty slack as null", () => {
    const markdown = `---
name: John Doe
role: contributor
slack: ""
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("contributor");
    expect(result.slack).toBeNull();
  });

  it("should handle role with extra whitespace", () => {
    const markdown = `---
name: John Doe
role:   contributor   
slack:   U22222JKL   
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("contributor");
    expect(result.slack).toBe("U22222JKL");
  });

  it("should handle different role values", () => {
    const roles = ["contributor", "maintainer", "admin", "reviewer", "mentor"];

    roles.forEach((role) => {
      const markdown = `---
name: Test User
role: ${role}
slack: U33333MNO
---

Content`;

      const result = extractFrontmatterData(markdown);
      expect(result.role).toBe(role);
      expect(result.slack).toBe("U33333MNO");
    });
  });

  it("should handle only role without slack", () => {
    const markdown = `---
name: John Doe
role: contributor
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBe("contributor");
    expect(result.slack).toBeNull();
  });

  it("should handle only slack without role", () => {
    const markdown = `---
name: John Doe
slack: U44444PQR
---

Content here`;

    const result = extractFrontmatterData(markdown);
    expect(result.role).toBeNull();
    expect(result.slack).toBe("U44444PQR");
  });
});

