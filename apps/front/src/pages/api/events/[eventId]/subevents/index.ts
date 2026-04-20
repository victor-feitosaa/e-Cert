// src/pages/api/events/[eventId]/subevents/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:5001";

export const GET: APIRoute = async ({params, request}) => {
  const {eventId} = params;
  const url = `${API_URL}/subevents`;
  console.log("🔵 GET subevents list:", url);
  try {
    const response = await fetch(url, {
      headers: {"Cookie": request.headers.get("cookie") || ""},
    });
    const text = await response.text();
    console.log(`↩ ${response.status}:`, text.slice(0, 200));
    return new Response(text, {
      status: response.status,
      headers: {"Content-Type": "application/json"},
    });
  } catch (error) {
    console.error("❌ GET list error:", error);
    return new Response(JSON.stringify({error: error.message}), {
      status: 502, headers: {"Content-Type": "application/json"},
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {

  console.log("ID EVENTO", params.eventId)

  const url = `http://localhost:5001/subevents/${params.eventId}`;
  console.log("🟢 POST subevent:", url);
  try {
    const body = await request.json();
    console.log("→ body:", JSON.stringify(body).slice(0, 300));
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const text = await response.text();
    console.log(`↩ ${response.status}:`, text.slice(0, 200));
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ POST error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};


