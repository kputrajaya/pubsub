class PubSub {
  constructor(options = {}) {
    const {
      host,
      appKey,
      getData,
      setData,
      subKeyParam = 'k',
      pubFrequency = 1000,
      subFrequency = 10000,
      reconnectDelay = 2000,
    } = options;

    // Validate options
    if (!host) throw new Error('Invalid host!');
    if (!appKey) throw new Error('Invalid appKey!');
    if (typeof getData !== 'function') throw new Error('Invalid getData!');
    if (typeof setData !== 'function') throw new Error('Invalid setData!');

    let ws, lastJson, pubInterval, subInterval, reconnectTimeout;

    // Helpers
    const getParam = (name) => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
      } catch (err) {
        console.error('Error parsing URL params:', err);
        return null;
      }
    };
    const cleanup = () => {
      if (pubInterval) {
        clearInterval(pubInterval);
        pubInterval = null;
      }
      if (subInterval) {
        clearInterval(subInterval);
        subInterval = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
    const connect = () => {
      cleanup();
      lastJson = null;
      pubInterval = setInterval(this.pub, pubFrequency);
      subInterval = setInterval(this.sub, subFrequency);

      ws = new WebSocket(host);
      ws.onopen = () => {
        console.log('Connected');
        this.sub();
      };
      ws.onmessage = (e) => {
        console.debug('Receive');
        lastJson = e.data;
        try {
          setData(JSON.parse(lastJson));
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      };
      ws.onerror = function (err) {
        console.error('Error:', err.message);
        ws.close();
      };
      ws.onclose = (e) => {
        console.log('Disconnected:', e.reason);
        cleanup();
        reconnectTimeout = setTimeout(connect, reconnectDelay);
      };
    };

    const subKey = getParam(subKeyParam);
    const key = `${appKey}:${subKey}`;

    // Methods and properties
    this.pub = () => {
      if (ws?.readyState !== WebSocket.OPEN) return;
      const data = getData();
      const currentJson = JSON.stringify(data);
      if (currentJson === lastJson) return;
      console.debug('Publish');
      ws.send(JSON.stringify({ action: 'pub', key, data }));
      lastJson = currentJson;
    };
    this.sub = () => {
      if (ws?.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ action: 'sub', key }));
    };
    this.active = !!subKey;
    this.key = subKey;

    // Initialize
    if (this.active) {
      connect();
    }
  }
}

window.PubSub = PubSub;
