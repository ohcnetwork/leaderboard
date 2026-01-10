import type { MDXComponents } from "mdx/types";
import { ReactNode } from "react";

// Helper function to generate slug from text
function slugify(text: ReactNode): string {
  if (typeof text === "string") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (Array.isArray(text)) {
    return slugify(text.map((t) => (typeof t === "string" ? t : "")).join(" "));
  }
  return "";
}

const components: MDXComponents = {
  h1: ({ children }) => {
    const id = slugify(children);
    return (
      <h1
        id={id}
        className="text-4xl font-bold tracking-tight mb-6 mt-8 first:mt-0 scroll-mt-20"
      >
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight mb-4 mt-8 border-b pb-2 scroll-mt-20"
      >
        <a
          href={`#${id}`}
          className="no-underline hover:underline"
          aria-label={`Link to ${children}`}
        >
          {children}
        </a>
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="text-2xl font-semibold tracking-tight mb-3 mt-6 scroll-mt-20"
      >
        <a
          href={`#${id}`}
          className="no-underline hover:underline"
          aria-label={`Link to ${children}`}
        >
          {children}
        </a>
      </h3>
    );
  },
  h4: ({ children }) => {
    const id = slugify(children);
    return (
      <h4
        id={id}
        className="text-xl font-semibold tracking-tight mb-2 mt-4 scroll-mt-20"
      >
        {children}
      </h4>
    );
  },
  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <code
        className={`${className} block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono`}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline font-medium"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2">{children}</td>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
