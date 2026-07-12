// src/pages/api/events/[eventId]/certificate-templates/[templateId]/index.ts
export const prerender = false;
import type { APIRoute } from "astro";

// GET /api/events/[eventId]/certificate-templates/[templateId]
export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, templateId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates/${templateId}`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      headers: { Cookie: cookie },
      credentials: "include",
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao buscar template" }), { status: 500 });
  }
};

// PUT /api/events/[eventId]/certificate-templates/[templateId]
export const PUT: APIRoute = async ({ params, request }) => {
  const { eventId, templateId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates/${templateId}`;
  const cookie = request.headers.get("cookie") || "";
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
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
    return new Response(JSON.stringify({ error: "Erro ao atualizar template" }), { status: 500 });
  }
};

// DELETE /api/events/[eventId]/certificate-templates/[templateId]
export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, templateId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates/${templateId}`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Cookie: cookie },
      credentials: "include",
    });
    return new Response(null, { status: response.status });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao deletar template" }), { status: 500 });
  }
};