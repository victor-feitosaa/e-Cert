// src/pages/api/events/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  
  // Em produção, use a URL completa do seu backend
  const API_URL = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${API_URL}/events/${id}`;
  
  console.log("🔵 GET Proxy - URL:", url);
  
  try {
    const response = await fetch(url, {
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 GET Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  
  // Em produção, use a URL completa do seu backend
  const API_URL = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const url = `${API_URL}/events/${id}`;
  
  console.log("🟢 PATCH Proxy - URL:", url);
  
  try {
    const body = await request.json();
    console.log("📦 Body:", body);
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });
    
    console.log("📡 Response status:", response.status);
    
    // Tenta parsear como JSON, se falhar retorna o texto
    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Resposta não é JSON:", responseText.substring(0, 200));
      return new Response(JSON.stringify({ 
        error: "Backend returned invalid response",
        response: responseText.substring(0, 200)
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
    console.error("🔴 PATCH Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};