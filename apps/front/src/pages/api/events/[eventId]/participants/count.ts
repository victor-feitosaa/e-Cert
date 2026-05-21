// src/pages/api/events/[eventId]/participants/count.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { eventId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/count`;

  console.log("🟢 GET Participants Count - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 GET Participants Count Error:", error);
    return new Response(JSON.stringify({ count: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};