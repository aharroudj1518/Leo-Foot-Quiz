import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (request, response) => {
  // Test-only loopback server: stop explicitly before Playwright's Windows cleanup.
  if (request.method === 'POST' && request.url === '/__shutdown') {
    response.writeHead(200).end('stopping');
    setImmediate(shutdown);
    return;
  }
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path === '/simulator') {
      response.writeHead(200, {'Content-Type':'text/html','Cache-Control':'no-store'});
      response.end(await readFile(new URL('./phone-preview.html', import.meta.url)));
      return;
    }
    const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
server.listen(Number(process.env.PORT ?? 8081), '127.0.0.1');
function shutdown() { server.close(); server.closeAllConnections(); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
