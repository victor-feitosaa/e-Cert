// src/pages/api/events/[eventId]/subevents/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:5001";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🔵 GET subevent:", url);
  try {
    const response = await fetch(url, {
      headers: { "Cookie": request.headers.get("cookie") || "" },
    });
    const text = await response.text();
    console.log(`↩ ${response.status}:`, text.slice(0, 200));
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ GET error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🟡 PATCH subevent:", url);
  try {
    const body = await request.json();
    console.log("→ body:", JSON.stringify(body).slice(0, 300));
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    console.log(`↩ ${response.status}:`, text.slice(0, 200));
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ PATCH error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🟢 PUT subevent:", url);
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
    const text = await response.text();
    console.log(`↩ ${response.status}:`, text.slice(0, 200));
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ PUT error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;
  const url = `${API_URL}/subevents/${id}`;
  console.log("🔴 DELETE subevent:", url);
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Cookie": request.headers.get("cookie") || "" },
    });
    console.log(`↩ ${response.status}`);
    if (response.status === 204) return new Response(null, { status: 204 });
    const text = await response.text();
    return new Response(text || "{}", {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};