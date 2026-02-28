import WebSocket, { WebSocketServer } from 'ws';


export function attachWebsocket(server, options = {}) {
  const wss = new WebSocketServer({ server, path: options.path || '/ws' });

 
  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (message) => {
     
      try {
        const data = JSON.parse(message.toString());
      
        if (data?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (e) {
        // Log parse errors instead of silently swallowing
        if (typeof console !== 'undefined') {
          console.warn('[websocket] Message parse error:', e?.message);
        }
      }
    });
  });

 
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

 
  function broadcast(data) {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(text);
    });
  }

  return { wss, broadcast, close: () => { clearInterval(interval); wss.close(); } };
}

export default attachWebsocket;
