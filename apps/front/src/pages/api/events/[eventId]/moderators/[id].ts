// src/pages/api/events/[eventId]/moderators/[id].ts
export const prerender = false;
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, id } = params;

  console.log("DELETE Moderator - Event ID:", eventId);
  console.log(" DELETE Moderator - Member ID:", id);

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const url = `${baseUrl}/events/${eventId}/moderator/${id}`;

  console.log("DELETE URL:", url);
  console.log(" Cookie enviado:", request.headers.get("cookie"));

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get("cookie") || "", 
      },
      credentials: 'include'
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta:", errorText);
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: `Erro ${response.status}: ${errorText}` 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao remover moderador:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: 'Erro interno ao remover moderador' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};