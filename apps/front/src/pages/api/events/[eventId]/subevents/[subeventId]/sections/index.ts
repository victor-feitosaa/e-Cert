// src/pages/api/events/[eventId]/subevents/[subeventId]/sections/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

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

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  // ✅ Rota correta - igual ao Postman
  const apiUrl = `${baseUrl}/subevents/${subeventId}/sections`;
  
  console.log("🟢 POST Section Proxy - URL:", apiUrl);
  console.log("📦 Body:", body);
  console.log("Event ID (não usado):", eventId); // Apenas para debug

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
    console.error("🔴 POST Section Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};