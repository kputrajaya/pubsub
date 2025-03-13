# PubSub

Simple pub-sub server and SDK for easy synchronization between pages or devices.

## How to Use

Here is how to do basic initialization:

```js
const ps = new PubSub({
  host: 'pubsub.domain.com', // PubSub server hostname
  appKey: 'sample', // Application prefix for the cache keys
  getData: () => load(), // Function to obtain the current data value
  setData: (data) => save(data), // Function to handle newly received data

  // Optional arguments
  subKeyParam: 'k', // URL parameter which contains the subscription key
  pubFrequency: 1000, // Delay between periodic sending, if change is detected (ms)
  subFrequency: 10000, // Delay between periodic fetching, as a safeguard (ms)
  reconnectDelay: 1000, // Delay before retrying broken connection (ms)
});
```

This would enable data synchronization if the value of `subKeyParam` is not empty.

For instance, the page `app.domain.com?k=123` will synchronize data using the key `sample:123`.

To trigger manual or event-based data publishing, simply call:

```js
ps.pub();
```

## Built With

- [Express](https://expressjs.com/)
- [node-cache](https://www.npmjs.com/package/node-cache)
- [ws](https://www.npmjs.com/package/ws)
