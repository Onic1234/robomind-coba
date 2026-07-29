const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const FILE_PATH = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Request: ${req.url}`);

  fs.readFile(FILE_PATH, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading index.html');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': Buffer.byteLength(data),
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=========================================`);
  console.log(`Robo-Jek Live Server on http://127.0.0.1:${PORT}`);
  console.log(`=========================================`);
});
