export const prerender = false;
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ params, request }) => {
  const { subeventId, id } = params;
    const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
    const apiUrl = `${baseUrl}/subevents/member/${id}`;

    try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
    });
    return new Response(JSON.stringify(await response.json()), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return new Response(JSON.stringify({ error: "Failed to delete member" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};