import Head from "next/head";
export default function PageHead({ title, metaTags }) {
  return (
    <Head>
      <title>{title && title + " | "}Coronasafe Contributors</title>
      <meta
        property="og:url"
        content={"https://contributors.coronasafe.network"}
      />
      <meta
        name="description"
        content="Coronasafe Leaderboard tracks the weekly progress of all coronasafe contributors."
      />
      {metaTags &&
        metaTags.map((tag) => (
          <meta key={tag.name} property={tag.name} content={tag.content} />
        ))}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
