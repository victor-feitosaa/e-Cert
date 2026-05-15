// src/pages/api/events/[eventId]/participants/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

// GET - Buscar participante por ID
export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;

  console.log("🟢 GET Event Participant - ID:", id);
  console.log("📌 Event ID:", eventId);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/${id}`;

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
    console.error("🔴 GET Event Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// PUT - Atualizar participante
export const PUT: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;

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

  console.log("🟢 PUT Event Participant - ID:", id);
  console.log("📦 Body:", body);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/${id}`;

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
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
    console.error("🔴 PUT Event Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// DELETE - Remover participante
export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;

  console.log("🔴 DELETE Event Participant - ID:", id);
  console.log("📌 Event ID:", eventId);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/${id}`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 DELETE Event Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};