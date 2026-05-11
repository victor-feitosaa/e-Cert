// src/pages/api/events/[eventId]/moderators/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  
  // URL do backend
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/moderators`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    console.log(data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 GET Moderator Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  
  // Pega o body da requisição
  let body;
  try {
    const text = await request.text();
    if (!text) {
      return new Response(JSON.stringify({ error: "Request body is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // URL do backend
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/events/${eventId}/invite/${body.email}`;
  
  console.log("🟢 POST Moderator Proxy - URL:", apiUrl);
  console.log("📦 Body:", body);
  console.log("Event ID:", eventId);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    console.log("📡 Response status:", response.status);

    // Tenta parsear a resposta
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Resposta não é JSON:", responseText.substring(0, 200));
      return new Response(JSON.stringify({ 
        error: "Backend returned invalid response",
        details: responseText.substring(0, 200)
      }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 POST Moderator Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

