//get all participants
export  const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
    const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
    const apiUrl = `${baseUrl}/events/${eventId}/eventParticipants`;

    console.log("GET All Participants - URL:", apiUrl);
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": request.headers.get("cookie") || "",
            },
        });
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("GET All Participants Proxy Error:", error);
        return new Response(JSON.stringify({ error: "Could not reach event service" }), {
            status: 502,
            headers: { "Content-Type": "application/json" }
        });
    }
};
