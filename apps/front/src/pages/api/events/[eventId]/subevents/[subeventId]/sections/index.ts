// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  // ✅ URL correta baseada no app.js
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections`;

  console.log("🟢 GET Sections - URL:", apiUrl);

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
    console.error("🔴 GET Sections Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Could not reach event service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// POST - Criar seção (mantido)
export const POST: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;
  
  let body;
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  // ✅ URL correta
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections`;
  
  console.log("🟢 POST Section Proxy - URL:", apiUrl);
  console.log("📦 Body:", body);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 POST Section Proxy Error:", error);
    return new Response(JSON.stringify({ error: "Could not reach event service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};