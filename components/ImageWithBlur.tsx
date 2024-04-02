import Image, { ImageProps } from "next/image";
import { getBase64Url } from "@/lib/plaiceholder";

export default async function ImageWithBlur({
  imageUrl,
  alt,
  ...props
}: ImageProps & { imageUrl: string }) {
  const blurDataURL = await getBase64Url(imageUrl);
  return (
    <Image
      alt={alt}
      {...props}
      loading="lazy"
      placeholder="blur"
      blurDataURL={blurDataURL}
    />
  );
}
