import Image from "next/image";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";

async function fetchPeople() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/people`, { cache: "no-store" });
  if (!res.ok) return { updatedAt: Date.now(), people: [] as any[] };
  return res.json() as Promise<{ updatedAt: number; people: any[] }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const { people } = await fetchPeople();
  return {
    title: `People - ${config.meta.title}`,
    description: `Meet the ${people.length} contributors who make ${config.org.name} possible.`,
    openGraph: {
      title: `People - ${config.meta.title}`,
      description: `Meet the ${people.length} contributors who make ${config.org.name} possible.`,
      url: `${config.meta.site_url}/people`,
      siteName: config.meta.title,
      images: [config.meta.image_url],
    },
  };
}

export default async function PeoplePage() {
  const config = getConfig();
  const { updatedAt, people } = await fetchPeople();

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Our People</h1>
        <p className="text-lg text-muted-foreground">
          Meet the {people.length} amazing contributors who make {config.org.name} possible
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Updated: {new Date(updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {people.map((p) => (
          <Link key={p.username} href={`https://github.com/${p.username}`} target="_blank" className="group block">
            <div className="flex flex-col items-center gap-2">
              <Image src={p.avatar_url} alt={p.name ?? p.username} width={96} height={96} className="rounded-md" />
              <div className="text-sm text-center">
                <div className="font-medium">{p.name ?? p.username}</div>
                <div className="text-xs opacity-70">@{p.username}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {people.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          No contributors found yet. Try again in a bit.
        </p>
      )}
    </div>
  );
}
