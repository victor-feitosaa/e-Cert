export const prerender = false;
import type { APIRoute } from "astro";

//listar todos os eventos
export const GET: APIRoute = async ({ request }) => {
  const url = import.meta.env.API_URL || "http://localhost:5001";

  try {
    const response = await fetch(`${url}/events/get/all`, {
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