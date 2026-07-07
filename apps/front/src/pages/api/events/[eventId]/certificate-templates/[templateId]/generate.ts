export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId, templateId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates/${templateId}/generate`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      credentials: "include",
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao gerar certificados" }), { status: 500 });
  }
};