// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId, id } = params;
  
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/subevents/${subeventId}/sections/${id}`;
  
  console.log("🔴 DELETE Section Proxy - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    console.log("📡 Response status:", response.status);

    return new Response(null, {
      status: response.status,
    });
  } catch (error) {
    console.error("🔴 DELETE Section Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  } 
};