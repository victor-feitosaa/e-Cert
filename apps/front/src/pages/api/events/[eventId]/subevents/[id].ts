// src/pages/api/events/[eventId]/subevents/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:5001";

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🔵 GET Proxy - URL:", url);

  try {
    const response = await fetch(url, {
      headers: { "Cookie": request.headers.get("cookie") || "" },
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Could not reach event service", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const url = `${API_URL}/subevents/${id}`;  
  console.log("🟢 PATCH Proxy - URL:", url);

  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      console.error("❌ Resposta não é JSON:", responseText.substring(0, 200));
      return new Response(JSON.stringify({ error: "Backend returned invalid response" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Could not reach event service", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🔴 DELETE Proxy - URL:", url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Cookie": request.headers.get("cookie") || "" },
      credentials: "include",
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Could not reach event service", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return new Response(null, {
    status: 204,
  });
}