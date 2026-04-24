// src/pages/api/events/[eventId]/subevents/[subeventId]/index.ts
export const prerender = false;
import type { APIRoute } from "astro";


export const GET: APIRoute = async ({ params, request }) => {
  const { subeventId } = params;
  
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/subevents/${subeventId}`;
  
  console.log("🟢 GET Subevent - URL:", apiUrl);

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
    console.error("🔴 GET Subevent Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};



// PUT - Atualizar subevento
export const PUT: APIRoute = async ({ params, request }) => {
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

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/subevents/${subeventId}`;
  
  console.log("🟢 PUT Subevent Proxy - URL:", apiUrl);
  console.log("📦 Body:", body);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    console.log("📡 Response status:", response.status);

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
    console.error("🔴 PUT Subevent Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// DELETE - Deletar subevento
export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;
  
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/subevents/${subeventId}`;
  
  console.log("🔴 DELETE Subevent Proxy - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    console.log("📡 Response status:", response.status);

    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : null;
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
    console.error("🔴 DELETE Subevent Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};