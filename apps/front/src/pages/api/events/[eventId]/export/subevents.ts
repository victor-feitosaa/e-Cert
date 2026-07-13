export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/export/subevents`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      headers: { Cookie: cookie },
      credentials: "include",
    });
    const blob = await response.blob();
    return new Response(blob, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': response.headers.get('Content-Disposition') || `attachment; filename=subeventos-${eventId}.xlsx`,
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao exportar" }), { status: 500 });
  }
};