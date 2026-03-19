// server.mjs
import { createServer } from 'node:http';
const { randomUUID } = require('crypto');

const server = createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/hello') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Hello');
  }

  if (method === 'POST' && pathname === '/job') {
    let jobId = randomUUID();

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Hello');
  }
});

// starts a simple http server locally on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});

// run with `node server.mjs`