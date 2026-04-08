export const prerender = false;

export async function GET({ params, request }) {
  const { id } = params;
  const cookieHeader = request.headers.get("cookie") || "";
  
  const res = await fetch(`http://localhost:5001/events/${id}`, {
    method: "GET",
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) {
    return new Response(null, { status: 302, headers: { Location: "/dashboard" } });
  }

  const eventData = await res.json();
  return new Response(JSON.stringify(eventData), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}