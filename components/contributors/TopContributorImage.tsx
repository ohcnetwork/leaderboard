import { getBase64Url } from "@/lib/plaiceholder";
import Image from "next/image";

export default async function TopContributorImage({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const base64Url = await getBase64Url(src);

  return (
    <Image
      loading="lazy"
      className="h-11 w-11 rounded-full shadow-md shadow-primary-500 ring-1 ring-primary-500"
      placeholder="blur"
      blurDataURL={base64Url}
      src={src}
      alt={alt}
      title={title}
      height={44}
      width={44}
    />
  );
}
