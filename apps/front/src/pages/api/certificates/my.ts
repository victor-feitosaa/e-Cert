export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/certificates/my`;
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
    return new Response(JSON.stringify({ error: "Erro ao buscar certificados" }), { status: 500 });
  }
};