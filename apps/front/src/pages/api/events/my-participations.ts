// src/pages/api/events/my-participations.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get("jwt")?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ status: "fail", message: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";

  const res = await fetch(`${baseUrl}/participants/my-events`, {
    headers: { Cookie: `jwt=${jwt}` },
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};