// @ts-nocheck
import * as __fd_glob_13 from "../docs/getting-started/index.mdx?collection=docs"
import * as __fd_glob_12 from "../docs/getting-started/configuration.mdx?collection=docs"
import * as __fd_glob_11 from "../docs/troubleshooting.mdx?collection=docs"
import * as __fd_glob_10 from "../docs/testing.mdx?collection=docs"
import * as __fd_glob_9 from "../docs/scrapers.mdx?collection=docs"
import * as __fd_glob_8 from "../docs/index.mdx?collection=docs"
import * as __fd_glob_7 from "../docs/deployment.mdx?collection=docs"
import * as __fd_glob_6 from "../docs/data-management.mdx?collection=docs"
import * as __fd_glob_5 from "../docs/customization.mdx?collection=docs"
import * as __fd_glob_4 from "../docs/contributing.mdx?collection=docs"
import * as __fd_glob_3 from "../docs/configuration-reference.mdx?collection=docs"
import * as __fd_glob_2 from "../docs/api-reference.mdx?collection=docs"
import { default as __fd_glob_1 } from "../docs/getting-started/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "docs", {"meta.json": __fd_glob_0, "getting-started/meta.json": __fd_glob_1, }, {"api-reference.mdx": __fd_glob_2, "configuration-reference.mdx": __fd_glob_3, "contributing.mdx": __fd_glob_4, "customization.mdx": __fd_glob_5, "data-management.mdx": __fd_glob_6, "deployment.mdx": __fd_glob_7, "index.mdx": __fd_glob_8, "scrapers.mdx": __fd_glob_9, "testing.mdx": __fd_glob_10, "troubleshooting.mdx": __fd_glob_11, "getting-started/configuration.mdx": __fd_glob_12, "getting-started/index.mdx": __fd_glob_13, });