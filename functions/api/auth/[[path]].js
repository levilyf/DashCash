// Placeholder endpoint for a future Better Auth integration.
export function onRequest() {
  return new Response('Google sign-in is a demo simulation and is not connected.', {
    status: 501,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
