// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"api-reference.mdx": () => import("../docs/api-reference.mdx?collection=docs"), "configuration-reference.mdx": () => import("../docs/configuration-reference.mdx?collection=docs"), "contributing.mdx": () => import("../docs/contributing.mdx?collection=docs"), "customization.mdx": () => import("../docs/customization.mdx?collection=docs"), "data-management.mdx": () => import("../docs/data-management.mdx?collection=docs"), "deployment.mdx": () => import("../docs/deployment.mdx?collection=docs"), "index.mdx": () => import("../docs/index.mdx?collection=docs"), "scrapers.mdx": () => import("../docs/scrapers.mdx?collection=docs"), "testing.mdx": () => import("../docs/testing.mdx?collection=docs"), "troubleshooting.mdx": () => import("../docs/troubleshooting.mdx?collection=docs"), "getting-started/configuration.mdx": () => import("../docs/getting-started/configuration.mdx?collection=docs"), "getting-started/index.mdx": () => import("../docs/getting-started/index.mdx?collection=docs"), }),
};
export default browserCollections;