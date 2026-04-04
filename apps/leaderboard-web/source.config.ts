import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "../../docs",
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [],
    remarkPlugins: [remarkMdxMermaid],
  },
});
