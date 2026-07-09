export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  
  // O backend tem a rota /subevents/:subEventId/certificates/generate
  const url = `${baseUrl}/subevents/${subeventId}/certificates/generate`;
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
  } catch (error) {
    console.error('Erro no proxy generate subevent:', error);
    return new Response(JSON.stringify({ error: "Erro ao gerar certificados do subevento" }), { status: 500 });
  }
};