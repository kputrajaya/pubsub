const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const minimist = require('minimist');
const NodeCache = require('node-cache');
const WebSocket = require('ws');

const argv = minimist(process.argv.slice(2));
const argPort = argv.p || 8075;
const argTtl = argv.t || 86400;

const MAX_KEY_LENGTH = 100;
const MAX_PAYLOAD_BYTES = 512 * 1024;
const RESERVED_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype));
const ALLOWED_HOST = (process.env.ALLOWED_HOST || '').trim().toLowerCase();

const cache = new NodeCache({ stdTTL: argTtl });
const keyClients = new Map();

// Helpers
const isValidKey = (key) => typeof key === 'string'
  && key.length > 0
  && key.length <= MAX_KEY_LENGTH
  && !RESERVED_KEYS.has(key);
const isAllowedHost = (value) => {
  if (!ALLOWED_HOST) return true;
  if (!value) return false;
  const host = String(value)
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split('/')[0]
    .replace(/^\[([^\]]+)\]/, '$1')
    .split(':')[0]
    .toLowerCase();
  return host === ALLOWED_HOST || host.endsWith(`.${ALLOWED_HOST}`);
};
const clientAdd = (key, client) => {
  if (!keyClients.has(key)) keyClients.set(key, new Set());
  keyClients.get(key).add(client);
};
const clientDelete = (client) => {
  for (const [key, clients] of keyClients) {
    const found = clients.delete(client);
    if (found && clients.size === 0) {
      keyClients.delete(key);
    }
  }
};
const get = (key) => {
  return cache.get(key);
};
const setAndPublish = (key, data, self = null) => {
  cache.set(key, data);
  const dataJson = JSON.stringify(data);
  (keyClients.get(key) || []).forEach((client) => {
    if (client !== self && client.readyState === WebSocket.OPEN) {
      client.send(dataJson);
    }
  });
};

// HTTP handlers
const app = express();
app.use(bodyParser.json({ limit: MAX_PAYLOAD_BYTES }));
const server = http.createServer(app);
app.use((req, res, next) => {
  if (!isAllowedHost(req.headers.host)) return res.status(403).json();
  return next();
});
app.post('/cache/:key', (req, res) => {
  if (req.body === undefined) return res.status(400).json();
  if (!isValidKey(req.params.key)) return res.status(400).json();
  setAndPublish(req.params.key, req.body);
  res.json();
});
app.get('/cache/:key', (req, res) => {
  if (!isValidKey(req.params.key)) return res.status(400).json();
  const data = get(req.params.key);
  res.json(data === undefined ? null : data);
});

// WebSocket handlers
const wss = new WebSocket.Server({
  server,
  maxPayload: MAX_PAYLOAD_BYTES,
  verifyClient: (info, done) => {
    if (!isAllowedHost(info.req.headers.host) || !isAllowedHost(info.origin)) {
      return done(false, 403, 'Forbidden');
    }
    return done(true);
  },
});
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('error', (error) => {
    console.warn(`WebSocket client error: ${error.code || 'unknown'}`);
  });
  ws.on('message', (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch { }
    if (!parsed || !isValidKey(parsed.key)) return;

    switch (parsed.action) {
      case 'pub':
        if (parsed.data === undefined) return;
        setAndPublish(parsed.key, parsed.data, ws);
        break;
      case 'sub':
        clientAdd(parsed.key, ws);
        const data = get(parsed.key);
        if (data !== undefined) {
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
