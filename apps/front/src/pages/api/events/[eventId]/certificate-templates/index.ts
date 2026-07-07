export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates`;

  try {
    const response = await fetch(url, {
      headers: { Cookie: request.headers.get("cookie") || "" },
      credentials: "include",
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao buscar templates" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates`;
  const cookie = request.headers.get("cookie") || "";
  const body = await request.json();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao criar template" }), { status: 500 });
  }
};