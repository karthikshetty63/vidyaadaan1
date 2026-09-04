import http from 'node:http';

const app = http.createServer((request, response) => {
  if (request.url === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Route not found' }));
});

export default app;