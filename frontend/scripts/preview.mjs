import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/browser');
const shell = readFileSync(resolve(root, 'index.html'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };
createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = resolve(root, `.${path}`);
  if (!file.startsWith(root + '/') && file !== root) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html');
  if (!existsSync(file)) {
    if (extname(file)) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(shell); return;
  }
  response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(Number(process.env.PORT ?? 4173), '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${process.env.PORT ?? 4173}`));
