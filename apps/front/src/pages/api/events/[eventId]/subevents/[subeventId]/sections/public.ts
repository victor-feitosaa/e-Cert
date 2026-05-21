// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/public.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { eventId,subeventId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections/public`;

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
    console.error("GET Public Sections Error:", error);
    return new Response(JSON.stringify({ 
      status: "success", 
      data: { sections: [] } 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};