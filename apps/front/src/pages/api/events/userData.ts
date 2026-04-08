export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({request}) => {

    try {  

        const cookieHeader = request.headers.get("cookie") || "";

        const res = await fetch("http://localhost:5001/testes/testeuserdata", {
            headers:{
                ...(cookieHeader ? { "Cookie": cookieHeader } : {})
            }
        })//MUDAR DEPOIS
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
        
    } catch (error) {
        return new Response(JSON.stringify({ error: "Erro ao buscar dados do usuário" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });

    }
}