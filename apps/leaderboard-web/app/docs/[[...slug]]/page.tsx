import { Mermaid } from "@/components/mdx/mermaid";
import { source } from "@/lib/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const pageData = page.data;
  const MDX = pageData.body;

  return (
    <DocsPage toc={pageData.toc} full={pageData.full}>
      <DocsBody>
        <h1>{pageData.title}</h1>
        <MDX components={{ ...defaultMdxComponents, Mermaid }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
