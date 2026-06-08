export const prerender = false;
import type { APIRoute } from "astro";

// POST - Convidar participante para o evento
export const POST: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
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
    
    const { name, email } = body;

    if (!name || !email) {
        return new Response(JSON.stringify({ error: "Name and email are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
    const apiUrl = `${baseUrl}/events/${eventId}/participants/invite`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": request.headers.get("cookie") || "",
            },
            body: JSON.stringify({ name, email }),
        });
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("🔴 Invite Participant Proxy Error:", error);
        return new Response(JSON.stringify({
            error: "Could not reach event service",
            details: error.message
        }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
};