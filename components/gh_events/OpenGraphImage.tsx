import Image from "next/image";
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
      <Image
        alt={props.url}
        className={props.className}
        src={src}
        height={630}
        width={1200}
      />
    </Link>
  );
};

export default OpenGraphImage;
