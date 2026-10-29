// Servidor estático mínimo para .preview/ (solo para revisar los temas en el navegador).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..', '.preview');
const port = Number(process.env.PORT ?? 4321);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^[/\\]+/, '');
  try {
    const body = await readFile(join(root, path || 'themes.html'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404).end('no encontrado');
  }
}).listen(port, () => console.log(`✦ http://localhost:${port}`));
