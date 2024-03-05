import { getContributors } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { readFileSync } from "fs";
import { Chart } from "./Chart";

interface Activity {
  time: number;
  type: string;
}

interface ActivityCounts {
  [type: string]: { [month: string]: number };
}

export default async function Page() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  const directory: string = path.join(process.cwd(), "data/github");

  const readJSONFiles = (directory: string): Activity[] => {
    const files: string[] = fs.readdirSync(directory);
    const activityData: Activity[] = [];

    files.forEach((file: string) => {
      if (file.endsWith(".json")) {
        const filePath: string = path.join(directory, file);
        const jsonData: { activity: Activity[] } = JSON.parse(
          readFileSync(filePath, "utf-8"),
        );
        activityData.push(...jsonData.activity);
      }
    });

    return activityData;
  };

  const activities: Activity[] = readJSONFiles(directory);

  const activityCounts: ActivityCounts = {};

  activities.forEach((activity: Activity) => {
    const timestamp: number = activity.time * 1000;
    const date: Date = new Date(timestamp);

    const type: string = activity.type;
    const month: string = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

    if (!activityCounts[type]) {
      activityCounts[type] = {};
    }
    if (!activityCounts[type][month]) {
      activityCounts[type][month] = 0;
    }

    activityCounts[type][month]++;
  });

  return (
    <>
      <div>
        <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
          <h1 className="text-center text-6xl leading-none drop-shadow-lg">
            <p>{contributors.length}</p>
            <p className="text-xl">contributors</p>
          </h1>
          <ul className="relative flex flex-wrap justify-center gap-1">
            {contributors.map((c) => (
              <li
                key={c.github}
                className="transition-all duration-150 ease-in-out hover:scale-125 hover:shadow-xl hover:shadow-primary-500"
              >
                <Link href={`/contributors/${c.github}`}>
                  <Image
                    height={48}
                    width={48}
                    className="h-12 w-12 rounded-lg hover:ring hover:ring-primary-500"
                    src={`https://avatars.githubusercontent.com/${c.github}?s=128`}
                    alt={c.github}
                    title={`${c.name} - @${c.github}`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <Chart activityCounts={activityCounts} />
        </div>
      </div>
    </>
  );
}
