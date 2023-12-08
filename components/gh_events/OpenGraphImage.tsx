const hashed = (url: string) => {
  return Buffer.from(url + new Date().toDateString()).toString("base64");
};

const OpenGraphImage = (props: { url: string; className?: string }) => {
  const src = props.url.replace(
    "https://github.com/",
    `https://opengraph.githubassets.com/${hashed(props.url)}/`
  );

  return (
    <a href={props.url}>
      <img alt={props.url} className={props.className} src={src} />
    </a>
  );
};

export default OpenGraphImage;
