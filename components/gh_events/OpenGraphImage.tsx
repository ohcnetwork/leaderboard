const OpenGraphImage = (props: { url: string; className?: string }) => {
  const src = props.url.replace(
    "https://github.com/",
    "https://opengraph.githubassets.com/1/"
  );

  return (
    <a href={props.url}>
      <img alt={props.url} className={props.className} src={src} />
    </a>
  );
};

export default OpenGraphImage;
