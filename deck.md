---
marp: true
paginate: true
---

# Synchronization: A Story

**Kevin Putrajaya**

---

# &#127984;

Once upon a time, when building a _web-app_, I faced these challenges:

- **Multi-device sync** across tabs and devices
- **Real-time updates** without page refreshes
- **Seamless connect and disconnect** at anytime
- **Lightweight client** implementation

---

... Alright, I was building **board game apps**.

# &#128584;

---

# Alternatives

### &#9940; Browser APIs &mdash; _local and same-browser only_

- **`BroadcastChannel`**: Communication without persistence
- **`SharedWorker`**: Complex custom logic and processing
- **`localStorage` events**: Triggered for every value change

### &#9888;&#65039; SaaS &mdash; _vendor lock-in and more bloated_

- **[Pusher](https://pusher.com/)**: Free for 200k daily messages
- **[Firebase RTDB](https://firebase.google.com/docs/database)**: Free for 1GB storage & 10GB monthly bandwidth

---

# Alternatives (cont'd)

### &#9989; Custom solution &mdash; _why easy if hard can?_

- **WebSocket**: Lightweight but low-level
- **Socket.IO**: Abstracted with polling fallback

---

# Solution

### &#128452;&#65039; Server-side

- **WebSocket**: Native real-time communication
- **Cache backend**: In-memory storage with TTL
- **Room-based**: Message routing based on keys

### &#128187; Client-side

- **Lightweight SDK**: 1kB download size
- **Easy implementation**: One statement setup
- **URL param trigger**: Integrate without UI changes

---

# Sample Integration

### &#9000;&#65039; Implement

```js
new PubSub({
  host: 'ws://localhost:8075',
  appKey: 'sample',
  getData: () => data,
  setData: (v) => (data = v),
});
```

### &#9654;&#65039; Activate

```xml
<url>?k=<key>
```

---

# Walkthrough and Demo

---

# Conclusion

- **Solved a practical need**: Enabled synchronization across devices
- **Maintained a lean approach**: Minimized complexity wherever possible
- **Prioritized client simplicity**: Designed with client-focused requirements

---

> #### Those who build their own WebSocket server do not have vendor lock-in problem.
>
> &mdash; Confucius
