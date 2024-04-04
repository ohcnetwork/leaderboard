export async function POST(request: Request) {
  const payload = await request.json();

  if (payload.type === "url_verification") {
    console.log("Received URL verification challenge request.");
    return new Response(payload.challenge, {
      headers: {
        "content-type": "text/plain",
      },
    });
  }

  if (payload.type === "event_callback") {
    console.log("Received event_callback event");
    console.log(payload.event);

    return new Response(null, { status: 200 });
  }

  console.log("Unhandled event type: ", payload.type);
  return Response.json({ type: "Event type unknown" }, { status: 400 });
}
