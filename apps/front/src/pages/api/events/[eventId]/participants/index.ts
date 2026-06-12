// src/pages/api/events/[eventId]/participants/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

// GET - Listar participantes do evento
export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';

  console.log("🟢 GET Event Participants - Event ID:", eventId);
  console.log("🔍 Search:", search);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants/`;

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
    console.error("🔴 GET Event Participants Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// POST - Adicionar participante ao evento
export const POST: APIRoute = async ({ params, request }) => {
  const { eventId } = params;

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

  console.log("🟢 POST Event Participant - Event ID:", eventId);
  console.log("📦 Body:", body);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/participants`;

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
    console.error("🔴 POST Event Participant Proxy Error:", error);
    return new Response(JSON.stringify({
      error: "Could not reach event service",
      details: error.message
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// DELETE - Remover participante do evento (usando userId no corpo)
export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId } = params;

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

  const { userId } = body;

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId é obrigatório" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("🔴 DELETE Event Participant - Event ID:", eventId);
  console.log("👤 User ID:", userId);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  // O backend precisa ter uma rota DELETE /events/:eventId/participants que aceite { userId } no corpo
  const apiUrl = `${baseUrl}/events/${eventId}/participants`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ userId }),
    });

    // Se o backend responder com 204 (sem conteúdo)
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

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