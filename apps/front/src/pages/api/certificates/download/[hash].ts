export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { hash } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/certificates/download/${hash}`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      headers: { Cookie: cookie },
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(text, { status: response.status });
    }

    const blob = await response.blob();
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=certificado-${hash.slice(0,8)}.pdf`,
      },
    });
  } catch (error) {
    console.error('Erro no download:', error);
    return new Response(JSON.stringify({ error: "Erro ao baixar certificado" }), { status: 500 });
  }
};