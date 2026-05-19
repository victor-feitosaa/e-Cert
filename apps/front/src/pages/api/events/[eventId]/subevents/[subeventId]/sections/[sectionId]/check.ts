// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/[sectionId]/check.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId, sectionId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections/${sectionId}/check`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ enrolled: false }), { status: 200 });
  }
};