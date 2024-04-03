import { parseSlackRequest } from "@/app/api/task/slack";
import Tasks from "@/app/api/task/task";

export async function POST(request: Request) {
  const { userId, text } = await parseSlackRequest(request);

  const id = parseInt(text?.replace("#", "") || "");
  if (!id) {
    return new Response(`'${text}' is not a valid task ID.`);
  }

  const result = await Tasks(userId).delete(id);
  if (!result) {
    return new Response(`No tasks found with id '#${id}'`);
  }

  return new Response(
    `Task *#${result.id} ${result.title}* has been *deleted*. :wastebasket:`,
  );
}
