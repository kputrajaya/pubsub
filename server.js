const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const NodeCache = require('node-cache');
const WebSocket = require('ws');

const SERVER_PORT = 8075;
const DATA_TTL = 24 * 3600;

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cache = new NodeCache({ stdTTL: DATA_TTL });
const keyClients = {};

// Helpers
const clientAdd = (key, client) => {
  keyClients[key] = keyClients[key] || new Set();
  keyClients[key].add(client);
};
const clientDelete = (client) => {
  for (let key in keyClients) {
    const found = keyClients[key].delete(client);
    if (found && keyClients[key].size === 0) {
      delete keyClients[key];
    }
  }
};
const setAndPublish = (key, data, self = null) => {
  cache.set(key, data);
  const dataJson = JSON.stringify(data);
  (keyClients[key] || []).forEach((client) => {
    if (client !== self && client.readyState === WebSocket.OPEN) {
      client.send(dataJson);
    }
  });
};

// HTTP handlers
app.post('/cache/:key', (req, res) => {
  if (!req.body) return res.status(400).json();
  setAndPublish(req.params.key, req.body);
  res.json();
});
app.get('/cache/:key', (req, res) => {
  const data = cache.get(req.params.key);
  res.json(data || null);
});

// WebSocket handlers
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {}
    if (!parsed || !parsed.key) return;

    switch (parsed.action) {
      case 'pub':
        if (!parsed.data) return;
        setAndPublish(parsed.key, parsed.data, ws);
        break;
      case 'sub':
        clientAdd(parsed.key, ws);
        const data = cache.get(parsed.key);
        if (data) {
          ws.send(JSON.stringify(data));
        }
        break;
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected');
    clientDelete(ws);
  });
});

// Start server
server.listen(SERVER_PORT, () => {
  console.log('Server is running');
});
