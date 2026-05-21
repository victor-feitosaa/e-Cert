// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/user-status.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections/user-status`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
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
    console.error("GET User Status Sections Error:", error);
    return new Response(JSON.stringify({ 
      enrolledSections: [],
      error: "Could not reach event service"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};