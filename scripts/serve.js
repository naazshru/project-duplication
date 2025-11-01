import http from 'http';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const contentTypeByExtension = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm']
]);

async function ensureDist() {
  try {
    await fs.access(distDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Missing dist directory. Run "npm run build" before previewing.');
      process.exit(1);
    }
    throw error;
  }
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return contentTypeByExtension.get(extension) ?? 'application/octet-stream';
}

function createServer(port) {
  const server = http.createServer(async (request, response) => {
    try {
      const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const safeSuffix = path.normalize(urlPath).replace(/^\/+/, '');
      const requestedPath = safeSuffix.length > 0 ? safeSuffix : 'index.html';
      const filePath = path.join(distDir, requestedPath);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        const indexStats = await fs.stat(indexPath).catch(() => null);
        if (!indexStats) {
          response.writeHead(403);
          response.end('Directory listing not allowed.');
          return;
        }
        const body = await fs.readFile(indexPath);
        response.writeHead(200, { 'Content-Type': getContentType(indexPath) });
        response.end(body);
        return;
      }

      const body = await fs.readFile(filePath);
      response.writeHead(200, { 'Content-Type': getContentType(filePath) });
      response.end(body);
    } catch (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('Not found');
        return;
      }

      console.error(error);
      response.writeHead(500);
      response.end('Internal server error');
    }
  });

  server.listen(port, () => {
    console.log(`Preview server running at http://localhost:${port}`);
  });
}

async function start() {
  await ensureDist();
  const port = Number.parseInt(process.env.PORT ?? '4173', 10);
  createServer(port);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
