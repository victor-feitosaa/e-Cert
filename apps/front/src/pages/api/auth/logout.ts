// src/pages/api/auth/logout.ts
export const prerender = false;
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const baseUrl = import.meta.env.API_URL || "https://ecert.duckdns.org";
  const apiUrl = `${baseUrl}/auth/logout`;
  
  console.log("🟢 POST Logout Proxy - URL:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    // Pegar o set-cookie para limpar o cookie no frontend
    const setCookie = response.headers.get("set-cookie");
    
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    
    if (setCookie) {
      headers.append("set-cookie", setCookie);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("🔴 POST Logout Proxy Error:", error);
    return new Response(JSON.stringify({ 
      error: "Could not reach auth service",
      details: error.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};