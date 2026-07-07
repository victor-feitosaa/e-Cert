export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/certificates/${id}/send`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Cookie: cookie },
      credentials: "include",
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Erro no envio individual:', error);
    return new Response(JSON.stringify({ error: "Erro ao enviar certificado" }), { status: 500 });
  }
};