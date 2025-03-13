class PubSub {
  constructor(options = {}) {
    const {
      host = 'localhost',
      appKey = 'foo',
      subKeyParam = 'k',
      getData = () => ({}),
      setData = console.log,
      pubFrequency = 1000,
      subFrequency = 10000,
      reconnectDelay = 1000,
    } = options;

    let ws;
    let lastJson;
    let pubInt;
    let subInt;

    const getParam = (name) => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
      } catch (err) {
        console.error('Error parsing params:', err);
        return null;
      }
    };
    const clearIntervals = () => {
      clearInterval(pubInt);
      clearInterval(subInt);
    };
    const connect = () => {
      lastJson = null;
      clearIntervals();
      pubInt = setInterval(this.pub, pubFrequency);
      subInt = setInterval(this.sub, subFrequency);

      ws = new WebSocket(`wss://${host}/`);
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
        clearIntervals();
        setTimeout(connect, reconnectDelay);
      };
    };

    const subKey = getParam(subKeyParam);
    const key = `${appKey}:${subKey}`;

    this.pub = () => {
      if (!ws?.readyState === WebSocket.OPEN) return;
      const data = getData();
      const currentJson = JSON.stringify(data);
      if (currentJson === lastJson) return;
      console.debug('Publish');
      ws.send(JSON.stringify({ action: 'pub', key, data }));
      lastJson = currentJson;
    };
    this.sub = () => {
      if (!ws?.readyState === WebSocket.OPEN) return;
      ws.send(JSON.stringify({ action: 'sub', key }));
    };

    if (subKey) {
      connect();
    }
  }
}

window.PubSub = PubSub;
