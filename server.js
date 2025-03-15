const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const minimist = require('minimist');
const NodeCache = require('node-cache');
const WebSocket = require('ws');

const argv = minimist(process.argv.slice(2));
const argPort = argv.p || 8075;
const argTtl = argv.t || 86400;

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cache = new NodeCache({ stdTTL: argTtl });
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
const get = (key) => {
  return cache.get(key);
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
  const data = get(req.params.key);
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
        const data = get(parsed.key);
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
server.listen(argPort, () => {
  console.log(`Server is running on port ${argPort} with TTL ${argTtl}`);
});
