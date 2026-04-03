// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "docs",
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
});
export { source_config_default as default, docs };
