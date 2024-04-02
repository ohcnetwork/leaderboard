import Image, { ImageProps } from "next/image";
import { getBase64Url } from "@/lib/plaiceholder";

export default async function ImageWithBlur({
  alt,
  src,
  ...props
}: ImageProps) {
  if (typeof src === "string") {
    const blurDataURL = await getBase64Url(src);
    return (
      <Image
        src={src}
        alt={alt}
        {...props}
        loading="lazy"
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );
  }

  return (
    <Image {...props} src={src} alt={alt} loading="lazy" placeholder="blur" />
  );
}
