# PubSub

Simple pub-sub server and SDK for easy sync between pages and devices.

## Running the Server

To start the [Node.js](https://nodejs.org/) server, run:

```sh
$ npm install
$ node server.js
```

### Options

| Name | Type    | Required | Default | Description                            |
| ---- | ------- | -------- | ------- | -------------------------------------- |
| `-p` | integer | N        | `8075`  | Port number that the server listens on |
| `-t` | integer | N        | `86400` | TTL of in-memory stored data (s)       |

### REST API

In addition to WebSocket, the server also exposes an optional REST API:

| Path           | Method | Description           |
| -------------- | ------ | --------------------- |
| `/cache/{key}` | GET    | Fetch data in `{key}` |
| `/cache/{key}` | POST   | Store data to `{key}` |

## Using the SDK

To start using the SDK, load it in your page:

```html
<script src="https://kputrajaya.github.io/pubsub/sdk.js"></script>
```

Then, initialize synchronization:

```js
const ps = new PubSub({
  host: 'ws://localhost:8075',
  appKey: 'sample',
  getData: () => name,
  setData: (v) => (name = v),
});
```

Now, when you load the page with a set `k` parameter (e.g., `?k=xyz`), the page will:

1. Subscribe to _real-time_ data changes
2. _Periodically_ check for data changes and publish it

If you want to also publish in _real-time_, call this method on relevant events:

```js
ps.pub();
```

### Initialization Options

| Name             | Type     | Required | Default | Description                                       |
| ---------------- | -------- | -------- | ------- | ------------------------------------------------- |
| `host`           | string   | Y        | -       | WebSocket server address                          |
| `appKey`         | string   | Y        | -       | Application key (prefix) for stored data          |
| `getData`        | function | Y        | -       | Function to obtain the current data value         |
| `setData`        | function | Y        | -       | Function to handle newly received data            |
| `subKeyParam`    | string   | N        | `k`     | URL parameter which contains the subscription key |
| `pubFrequency`   | integer  | N        | `1000`  | Delay between periodic publishing (ms)            |
| `subFrequency`   | integer  | N        | `10000` | Delay between periodic fetching, as fallback (ms) |
| `reconnectDelay` | integer  | N        | `2000`  | Delay before retrying broken connections (ms)     |

### Methods and Properties

| Name        | Type     | Description                                       |
| ----------- | -------- | ------------------------------------------------- |
| `ps.pub()`  | function | Publish changed data                              |
| `ps.sub()`  | function | Notify server to send the latest data             |
| `ps.active` | boolean  | Whether `subKeyParam` is set and sync is expected |

## Try It Out

Clone this repo, run the server, then open the sample [Alpine.js](https://alpinejs.dev/) app ([`sample.html`](sample.html)).

Multiple tabs with the same `k` parameter will now sync.

## Built With

- [Express](https://expressjs.com/)
- [ws](https://www.npmjs.com/package/ws)
- [node-cache](https://www.npmjs.com/package/node-cache)
