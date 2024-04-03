import Markdown from "@/components/Markdown";
import { IoCalendar } from "react-icons/io5";
import { TbTargetArrow } from "react-icons/tb";

interface Transcript {
  id: string;
  title: string;
  participants: string[];
  duration: number;
  date: number;
  summary: {
    action_items: string;
    keywords: string[];
    outline: string;
    overview: string;
    shorthand_bullet: string;
  };
  meeting_attendees:
    | {
        displayName: string | null;
        email: string | null;
        name: string | null;
      }[]
    | null;
}

export default async function Page() {
  const res = await fetch("https://api.fireflies.ai/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `query Transcripts($userId: String) {
        transcripts(user_id: $userId) {
          id
          title
          participants
          duration
          date
          summary {
            action_items
            keywords
            outline
            overview
            shorthand_bullet
          }
          meeting_attendees {
            displayName
            email
            name
          }
        }
      }
      `,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FIREFLIES_API_KEY}`,
    },
  });

  const json = await res.json();
  const data = json.data?.transcripts as Transcript[];

  console.log(json);

  return (
    <div className="mx-auto max-w-6xl p-4 md:py-10">
      <ul className="flex flex-col gap-6 md:gap-12">
        {data.map((value) => (
          <li key={value.id}>
            <MeetingCard meeting={value} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const MeetingCard = ({ meeting }: { meeting: Transcript }) => {
  return (
    <div className="flex flex-col justify-start gap-4 rounded-lg border border-secondary-200 p-4 shadow dark:border-secondary-800 md:p-8">
      <div className="flex flex-col gap-2">
        <h3>{meeting.title}</h3>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-secondary-500 dark:text-secondary-400">
          <div className="inline-flex items-center space-x-2 whitespace-nowrap">
            <IoCalendar />{" "}
            <span className="font-bold">
              {new Date(meeting.date).toDateString()}
            </span>
          </div>
          <div>
            <ul>
              <li className="flex flex-wrap gap-2">
                {meeting.summary.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded bg-secondary-200 px-1.5 py-1 text-xs capitalize text-secondary-800 dark:bg-secondary-700 dark:text-secondary-100"
                  >
                    {keyword}
                  </span>
                ))}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-row items-start justify-between gap-8">
          <div>
            <Markdown className="px-2">
              {meeting.summary.shorthand_bullet}
            </Markdown>
          </div>

          <div className="flex w-96 flex-col">
            <h5 className="font-bold">Participants</h5>
            <Markdown>
              {meeting.meeting_attendees
                ?.map((p) => `- ${p.displayName || p.name || p.email}`)
                .join("\n") || "_None_"}
            </Markdown>
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="inline-flex items-center space-x-2 text-lg font-bold">
            <TbTargetArrow />
            <span>Overview</span>
          </h4>
          <Markdown className="px-2 text-secondary-500 dark:text-secondary-300">
            {meeting.summary.overview}
          </Markdown>
        </div>

        <div className="flex flex-col">
          <h4 className="inline-flex items-center space-x-2 text-lg font-bold">
            <TbTargetArrow />
            <span>Outline</span>
          </h4>
          <Markdown className="px-2 text-secondary-500 dark:text-secondary-300">
            {meeting.summary.outline}
          </Markdown>
        </div>

        <div className="flex flex-col">
          <h4 className="inline-flex items-center space-x-2 text-lg font-bold">
            <TbTargetArrow />
            <span>Action Items</span>
          </h4>
          <Markdown className="px-2 italic text-secondary-500 dark:text-secondary-400">
            {meeting.summary.action_items}
          </Markdown>
        </div>
      </div>
    </div>
  );
};
