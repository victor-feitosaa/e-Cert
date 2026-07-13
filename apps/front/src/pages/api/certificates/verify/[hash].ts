// pages/api/certificates/verify/[hash].ts
export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { hash } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/certificates/verify/${encodeURIComponent(hash || "")}`;

  try {
    const response = await fetch(apiUrl, { method: "GET" });
    const data = await response.json();

    // Se o backend já retornou no formato { status, data }, repassa; senão, adapta
    if (data.status && data.data) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Caso contrário, envolve no formato esperado pelo frontend
    const wrapped = {
      status: response.ok ? "success" : "error",
      data: data,
    };
    return new Response(JSON.stringify(wrapped), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Could not reach certificate service",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};