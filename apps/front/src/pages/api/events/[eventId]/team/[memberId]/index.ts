// src/pages/api/events/[eventId]/team/[memberId]/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const PUT: APIRoute = async ({ params, request }) => {
  const { eventId, memberId } = params;

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

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/team/${memberId}`;

  console.log("🟢 PUT Update Team Member - URL:", apiUrl);
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

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("🔴 PUT Update Team Member Error:", error);
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
  const { eventId, memberId } = params;

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

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/team/${memberId}`;

  console.log("🟢 PATCH Update Team Member - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
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
    console.error("🔴 PATCH Update Team Member Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};


export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, memberId } = params;

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/team/${memberId}`;

  console.log("🔴 DELETE Team Member - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
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
    console.error("🔴 DELETE Team Member Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach event service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};