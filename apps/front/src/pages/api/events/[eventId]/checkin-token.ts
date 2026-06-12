export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;

  console.log("🟢 GET Checkin Token - Event ID:", eventId);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/checkin/${eventId}/checkin-token`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    console.log("📡 Response status:", response.status);

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 GET Checkin Token Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};