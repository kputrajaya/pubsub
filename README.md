# PubSub

Simple pub-sub server and SDK for easy small-scale sync between pages and devices.

## Running the Server

To start the [Node.js](https://nodejs.org/) server, run:

```bash
$ npm install
$ node server.js
```

### Arguments

| Name | Type    | Default | Description                            |
| ---- | ------- | ------- | -------------------------------------- |
| `-p` | integer | `8075`  | Port number that the server listens on |
| `-t` | integer | `86400` | TTL of the stored data (seconds)       |

## Using the SDK

To use the SDK, load it in your page:

```html
<script src="https://kputrajaya.github.io/pubsub/sdk.js"></script>
```

Then, initialize the sync:

```js
const ps = new PubSub({
  host: 'ws://localhost:8075', // Server address
  appKey: 'sample', // Key prefix to prevent collision
  getData: () => name, // Return the current value
  setData: (v) => (name = v), // Use the new value
});
```

Now, when you load the page with a set `k` param (e.g., `?k=xyz`), the page will:

1. _Periodically_ check for value changes (`getData`) and publish it
2. Subscribe to _real-time_ value changes and use it (`setData`)

To also publish in _real-time_, call this method on relevant events:

```js
ps.pub();
```

### Options

| Name             | Type    | Default | Description                                    |
| ---------------- | ------- | ------- | ---------------------------------------------- |
| `subKeyParam`    | string  | `k`     | URL param which contains the subscription key  |
| `pubFrequency`   | integer | `1000`  | Delay between periodic check-and-publish (ms)  |
| `subFrequency`   | integer | `10000` | Delay between periodic fetch, as fallback (ms) |
| `reconnectDelay` | integer | `2000`  | Delay before retrying broken connections (ms)  |

### Methods and Properties

| Name        | Type     | Description                        |
| ----------- | -------- | ---------------------------------- |
| `ps.pub()`  | function | Publish latest data to server      |
| `ps.sub()`  | function | Fetch latest data from server      |
| `ps.active` | boolean  | Whether `k` (`subKeyParam`) is set |
| `ps.key`    | string   | The value of `k` (`subKeyParam`)   |

## Try It Out

Clone this repo, start the server, then open the sample [Alpine](https://alpinejs.dev/) app (`sample.html`).

Multiple tabs with the same `k` param will now sync.

## Built With

- [Express](https://expressjs.com/)
- [ws](https://www.npmjs.com/package/ws)
- [node-cache](https://www.npmjs.com/package/node-cache)
