export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params; // pega ambos

  const subEventId = subeventId; // Use o parâmetro correto para o subevento

  console.log("🔍 GET Sections for subevent:", subEventId);
  const cookie = request.headers.get("cookie");
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";

  // URL CORRETA: inclui eventId e subEventId
  const apiUrl = `${baseUrl}/subevents/${subEventId}/sections`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (cookie) headers["Cookie"] = cookie;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET Sections Error:", error);
    return new Response(
      JSON.stringify({
        status: "success",
        data: { sections: [] },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId, subeventId } = params;
  let body;
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const apiUrl = `${baseUrl}/events/${eventId}/subevents/${subeventId}/sections`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST Sections Error:", error);
    return new Response(JSON.stringify({ error: "Could not reach event service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};