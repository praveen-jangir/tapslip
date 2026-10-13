// Zero-dependency static file server for the TapSlip Owner Web Admin.
// Usage: node server.js [port]   (default port 4173)

const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { extname, join, normalize } = require('node:path');

// `server.js` lives inside `web-admin/`, so `__dirname` is the admin root.
const ROOT = normalize(join(__dirname));
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // Serve index.html for the root path.
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = normalize(join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`TapSlip Owner Admin listening at http://localhost:${PORT}`);
  });
}

module.exports = server;
