export const prerender = false
import type { APIRoute } from "astro"



export const POST: APIRoute = async ({ request }) => {
  // Safe body parsing
  let body: unknown
  try {
    const text = await request.text()
    if (!text) {
      return new Response(JSON.stringify({ error: "Request body is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    body = JSON.parse(text)
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

const apiUrl = `${import.meta.env.API_URL ?? "http://localhost:5001"}/auth/login`

  // Forward to backend
  let res: Response
  try {
    

  res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    return new Response(JSON.stringify({ error: "Could not reach auth service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const json = await res.json()

  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      ...(res.headers.get("set-cookie")
        ? { "set-cookie": res.headers.get("set-cookie")! }
        : {}),
    },
  })
}