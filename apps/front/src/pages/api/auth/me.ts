// src/pages/api/auth/me.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/auth/me`;

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
    return new Response(JSON.stringify({ error: "Could not reach auth service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};