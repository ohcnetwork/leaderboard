import Head from "next/head";
export default function PageHead({ title, metaTags }) {
  return (
    <Head>
      <title>{title && title + " | "}{process.env.NEXT_PUBLIC_PAGE_TITLE}</title>
      <meta
        property="og:url"
        content={process.env.NEXT_PUBLIC_META_URL}
      />
      <meta
        name="description"
        content={process.env.NEXT_PUBLIC_META_DESCRIPTION}
      />
      {metaTags &&
        metaTags.map((tag) => (
          <meta key={tag.name} property={tag.name} content={tag.content} />
        ))}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
