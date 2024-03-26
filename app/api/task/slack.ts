export const parseSlackRequest = async (request: Request) => {
  const formData = await request.formData();

  const userId = formData.get("user_id")?.toString().trim();
  const text = formData.get("text")?.toString().trim();

  if (!userId) {
    throw Response.json({ user_id: "This field is required" }, { status: 400 });
  }

  // TODO: Ensure incoming requests are from allowed sources

  return { userId, text };
};
