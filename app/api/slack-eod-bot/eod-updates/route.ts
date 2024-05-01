import { isAuthenticated } from "@/lib/auth";
import { clearAllEODUpdates, getAllEODUpdates } from "@/lib/slackbotutils";

export const GET = async (req: Request) => {
  if (!isAuthenticated(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const updates = await getAllEODUpdates();
  return Response.json(updates);
};

export const DELETE = async (req: Request) => {
  if (!isAuthenticated(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const count = await clearAllEODUpdates();
  return Response.json({ count });
};
