export const prerender = false;
import type { APIRoute } from 'astro';


export const GET: APIRoute = async ({ params, request }) => {
  const { eventId } = params;
  const baseUrl = import.meta.env.API_URL || 'http://localhost:5001';
  const apiUrl = `${baseUrl}/events/${eventId}/checkin/permission`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
    },
    credentials: 'include',
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
};