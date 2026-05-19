// src/pages/api/participants/my-events.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/participants/my-events`;
  
  console.log("🟢 GET My Participations - URL:", apiUrl);

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
    console.error("🔴 GET My Participations Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};