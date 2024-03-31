import { parseSlackRequest } from "@/app/api/task/slack";
import Tasks, { Task } from "@/app/api/task/task";

export async function POST(request: Request) {
  const { userId } = await parseSlackRequest(request);

  const tasks = await Tasks(userId).groupedByStatus();
  return new Response(getReply(tasks), { status: 200 });
}

const getReply = (tasks: Record<Task["status"], Task[]>) => {
  return Object.entries(tasks)
    .map(([status, tasks]) => {
      return `
*${status.toUpperCase()} ${tasks.length ? ` \`${tasks.length}\`` : ""}*
${formatTasks(tasks)}
    `;
    })
    .join("\n");
};

const formatTasks = (tasks: Task[]) => {
  if (tasks.length === 0) {
    return "_No tasks_";
  }
  return tasks.map((task) => `• *#${task.id}*: ${task.title}`).join("\n");
};
