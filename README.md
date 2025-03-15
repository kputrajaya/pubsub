# PubSub

Simple pub-sub server and SDK for easy synchronization between pages or devices.

## Running the Server

To start the server, run:

```sh
$ npm install
$ node server.js
```

### Options

| Name | Type    | Required | Default | Description                                  |
| ---- | ------- | -------- | ------- | -------------------------------------------- |
| `-p` | integer | N        | 8075    | Port number that the server listens on       |
| `-t` | integer | N        | 86400   | Time-to-live of the stored data (in seconds) |

### REST API

In addition to WebSocket, the server also exposes a REST API:

| Path           | Method | Description                |
| -------------- | ------ | -------------------------- |
| `/cache/{key}` | GET    | Fetch data for key `{key}` |
| `/cache/{key}` | POST   | Set data for key `{key}`   |

## Using the SDK

To start using the WebSocket SDK, load it in your page:

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

If you want to publish changes in _real-time_, call this method on relevant events:

```js
ps.pub();
```

### Options

| Name             | Type     | Required | Default | Description                                                   |
| ---------------- | -------- | -------- | ------- | ------------------------------------------------------------- |
| `host`           | string   | Y        | -       | PubSub server hostname                                        |
| `appKey`         | string   | Y        | -       | Application prefix for the cache keys                         |
| `getData`        | function | Y        | -       | Function to obtain the current data value                     |
| `setData`        | function | Y        | -       | Function to handle newly received data                        |
| `subKeyParam`    | string   | N        | `'k'`   | URL parameter containing the subscription key                 |
| `pubFrequency`   | integer  | N        | `1000`  | Delay between periodic publishing, if change is detected (ms) |
| `subFrequency`   | integer  | N        | `10000` | Delay between periodic fetching, as a fallback (ms)           |
| `reconnectDelay` | integer  | N        | `1000`  | Delay before retrying broken connections (ms)                 |

## Try It Out

Clone this repo, run the server, then open the sample [Alpine.js](https://alpinejs.dev/) app (`sample.html`).

Multiple tabs will now sync their data if they have the same `k` parameter.

## Built With

- [Express](https://expressjs.com/)
- [node-cache](https://www.npmjs.com/package/node-cache)
- [ws](https://www.npmjs.com/package/ws)
