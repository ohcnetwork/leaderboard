import Link from "next/link";

const hashed = (url: string) => {
  return Buffer.from(url + new Date().toDateString()).toString("base64");
};

const OpenGraphImage = (props: { url: string; className?: string }) => {
  const src = props.url.replace(
    "https://github.com/",
    `https://opengraph.githubassets.com/${hashed(props.url)}/`,
  );

  return (
    <Link href={props.url}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={props.url} className={props.className} src={src}  />
    </Link>
  );
};

export default OpenGraphImage;
