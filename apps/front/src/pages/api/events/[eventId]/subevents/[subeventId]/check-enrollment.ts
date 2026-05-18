export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/subevent/${subeventId}/check`;

  console.log("🟢 GET Check Subevent Enrollment - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("🔴 Backend retornou não-JSON:", response.status);
      return new Response(JSON.stringify({ enrolled: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔴 GET Check Subevent Enrollment Proxy Error:", error);
    return new Response(JSON.stringify({ enrolled: false }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};