// Minimal zero-dependency static server for the CoreConnect pages.
// Run via start-server.bat, or:  node serve.js   (optional: set PORT=xxxx)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8123;
const ROOT = __dirname;
const HOME = '/coreconnect_dashboard_v41/coreconnect_dashboard_v41.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif':  'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.mp4':  'video/mp4', '.webmanifest': 'application/manifest+json',
  '.map':  'application/json'
};

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }

  if (pathname === '/' || pathname === '') pathname = HOME;

  let filePath = path.normalize(path.join(ROOT, pathname));
  // Block path traversal outside the project folder
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.stat(filePath, (err, st) => {
    if (!err && st.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (e, data) => {
      if (e) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 Not found: ' + pathname); }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
}).listen(PORT, () => {
  console.log('CoreConnect serving: ' + ROOT);
  console.log('Open: http://localhost:' + PORT + '/');
  console.log('(Press Ctrl+C to stop.)');
});
