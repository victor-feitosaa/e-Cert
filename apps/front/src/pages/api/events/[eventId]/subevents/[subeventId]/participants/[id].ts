// src/pages/api/events/[eventId]/subevents/[subeventId]/participants/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

// DELETE - Remover participante do subevento
export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId, id } = params;

  console.log("🔴 DELETE Subevent Participant - ID:", id);
  console.log("📌 Event ID:", eventId);
  console.log("📌 Subevent ID:", subeventId);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/subevent/${id}`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 DELETE Subevent Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};