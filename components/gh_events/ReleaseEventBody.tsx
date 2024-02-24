import { ReleaseEvent } from "@/lib/gh_events";
import Image from "next/image";
import Link from "next/link";

export default function GitHubReleaseEventBody({
  event,
}: {
  event: ReleaseEvent;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        className="underline text-white font-medium"
        href={event.payload.release.html_url}
      >
        See release notes
      </Link>
      <span className="text-white font-medium">Contributors</span>
      <ul className="flex flex-wrap gap-2">
        {event.payload.release.mentions.map((contributor) => (
          <li key={contributor.login}>
            <Image
              src={contributor.avatar_url + "&s=64"}
              alt={contributor.login}
              className="w-8 h-8 rounded-full"
              height={32}
              width={32}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
