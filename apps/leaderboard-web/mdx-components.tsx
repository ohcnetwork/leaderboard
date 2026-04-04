import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(): MDXComponents {
  return {
    ...defaultMdxComponents,
  };
}
