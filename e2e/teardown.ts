export default async function teardown() {
  const response = await fetch('http://127.0.0.1:8081/__shutdown', { method: 'POST', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Preview server did not shut down cleanly');
}
