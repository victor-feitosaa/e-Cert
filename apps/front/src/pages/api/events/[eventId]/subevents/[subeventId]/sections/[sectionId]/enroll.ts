// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/[sectionId]/enroll.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId, sectionId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections/${sectionId}/enroll`;

  console.log("🟢 POST Section Enroll - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 POST Section Enroll Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Could not reach event service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};