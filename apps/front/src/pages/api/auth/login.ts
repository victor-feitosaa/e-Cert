import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()

  const res = await fetch("http://localhost:5001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  // repassa o Set-Cookie da sua API pro browser
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      // forward do cookie jwt que sua API setou
      ...(res.headers.get("set-cookie")
        ? { "set-cookie": res.headers.get("set-cookie")! }
        : {}),
    },
  })
}