export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const baseUrl = import.meta.env.API_URL || 'http://localhost:5001';
  const apiUrl = `${baseUrl}/events/${eventId}/checkin`;

  const body = await request.json();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
};