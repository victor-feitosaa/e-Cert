export const DELETE: APIRoute = async ({ params, request }) => {
  const { eventId, templateId } = params;
  const baseUrl = import.meta.env.API_URL || "http://localhost:5001";
  const url = `${baseUrl}/events/${eventId}/certificate-templates/${templateId}`;
  const cookie = request.headers.get("cookie") || "";

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Cookie: cookie },
      credentials: "include",
    });
    return new Response(null, { status: response.status });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao deletar template" }), { status: 500 });
  }
};