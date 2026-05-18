// src/pages/api/events/[eventId]/subevents/[subeventId]/participants/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

// GET - Listar participantes do subevento
export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  console.log("🟢 GET Subevent Participants - Event ID:", eventId);
  console.log("📌 Subevent ID:", subeventId);
  console.log("🔍 Search:", search);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/subevent/${subeventId}`;

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
    console.error("🔴 GET Subevent Participants Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// POST - Adicionar participante ao subevento
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

  console.log("🟢 POST Subevent Participant - Event ID:", eventId);
  console.log("📌 Subevent ID:", subeventId);
  console.log("📦 Body:", body);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/subevent/${subeventId}`;

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
    console.error("🔴 POST Subevent Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};