import { parseSlackRequest } from "@/app/api/task/slack";
import Tasks from "@/app/api/task/task";

export async function POST(request: Request) {
  const { userId, text: title } = await parseSlackRequest(request);

  if (!title?.trim()) {
    return new Response(":warning: Specify a title for the task to be added");
  }

  const { id, tasks } = await Tasks(userId).add({ title, status: "pending" });
  const pendingTasks = tasks.filter((task) => task.status === "pending");

  return new Response(
    `Task *#${id}* has been added to *pending* :white_check_mark:. You've *${pendingTasks.length}* tasks pending as of now.`,
    { status: 200 },
  );
}
