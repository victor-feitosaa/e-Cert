// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/[sectionId]/leave.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId, sectionId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  // ✅ URL correta
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections/${sectionId}/leave`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    return new Response(null, { status: response.status });
  } catch (error) {
    console.error("🔴 DELETE Section Leave Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Could not reach event service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};