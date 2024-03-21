import { getPlaiceholder } from "plaiceholder";

export const getBase64Url = async (url: string) => {
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }

    const buffer = await res.arrayBuffer();

    const { base64 } = await getPlaiceholder(Buffer.from(buffer));

    return base64;
  } catch (err) {
    console.error(err);
  }
};
