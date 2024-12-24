# node-red-contrib-nostr

A [Node-RED](http://nodered.org) node for integrating with the Nostr protocol. This node allows you to connect to Nostr relays, publish events, and subscribe to events in the Nostr network.

## Install

Run the following command in your Node-RED user directory - typically `~/.node-red`

```bash
npm install node-red-contrib-nostr
```

Or, if installing from source:

```bash
cd ~/.node-red
git clone https://github.com/HumanjavaEnterprises/node-red-contrib-nostr.git
cd node-red-contrib-nostr
npm install
```

## Usage

### Nostr Relay Node

The Nostr Relay node provides a connection to a Nostr relay server. It can be used to:
- Connect to any Nostr relay using a WebSocket URL
- Publish events to the relay
- Subscribe to events from the relay
- Monitor connection status

#### Configuration

- **Name**: Optional name for the node instance
- **Relay URL**: WebSocket URL of the Nostr relay (e.g., `wss://relay.damus.io`)

#### Input

The node accepts messages with the following properties:

```javascript
msg.payload = {
    type: "publish" | "subscribe",
    content: {
        // For publish:
        kind: number,        // Event kind (1 for note, 7 for reaction, etc.)
        content: string,     // Content of the note
        tags: string[][],    // Optional tags

        // For subscribe:
        filters: [{          // Array of filters
            kinds: number[], // Optional event kinds to filter
            authors: string[], // Optional author public keys
            // ... other filter options
        }]
    }
}
```

#### Output

The node outputs messages in the following format:

```javascript
msg.payload = {
    type: "event",
    content: {
        // Nostr event object
        id: string,
        pubkey: string,
        created_at: number,
        kind: number,
        tags: string[][],
        content: string,
        sig: string
    }
}
```

#### Status

The node indicates its status through the following indicators:
- 🔴 Disconnected: Not connected to relay
- 🟡 Connecting: Attempting to connect
- 🟢 Connected: Successfully connected to relay

## Supported NIPs

| NIP | Status | Description |
|-----|--------|-------------|
| [01](https://github.com/nostr-protocol/nips/blob/master/01.md) | ✅ | Basic protocol flow description |
| [02](https://github.com/nostr-protocol/nips/blob/master/02.md) | ✅ | Contact List and Petnames |
| [09](https://github.com/nostr-protocol/nips/blob/master/09.md) | 🚧 | Event Deletion |
| [10](https://github.com/nostr-protocol/nips/blob/master/10.md) | 🚧 | Reply Threading |
| [19](https://github.com/nostr-protocol/nips/blob/master/19.md) | ✅ | bech32-encoded entities (for npub support) |
| [23](https://github.com/nostr-protocol/nips/blob/master/23.md) | 🚧 | Long-form Content |
| [42](https://github.com/nostr-protocol/nips/blob/master/42.md) | ❌ | Authentication of clients to relays |
| [51](https://github.com/nostr-protocol/nips/blob/master/51.md) | 🚧 | Lists (bookmarks & follow lists) |

Legend:
- ✅ Fully Supported
- 🚧 In Progress/Planned
- ❌ Planned for Future

## User Profile Features

### Following Users

The node supports following users by their npub. Here's how to use it:

```javascript
msg.payload = {
    type: "follow",
    content: {
        npub: "npub1...", // User's npub
    }
}
```

### Profile Updates

Subscribe to profile updates (NIP-02):

```javascript
msg.payload = {
    type: "subscribe",
    content: {
        filters: [{
            kinds: [0],  // kind 0 is for metadata (profile info)
            authors: ["<pubkey>"]  // derived from npub
        }]
    }
}
```

### Reading Events

Subscribe to user events:

```javascript
msg.payload = {
    type: "subscribe",
    content: {
        filters: [{
            kinds: [1, 6, 7],  // text notes, reposts, reactions
            authors: ["<pubkey>"]  // derived from npub
        }]
    }
}
```

## Example Flows

### Following a User and Getting Their Updates

```json
[{
    "id": "inject-follow",
    "type": "inject",
    "name": "Follow User",
    "payload": {
        "type": "follow",
        "content": {
            "npub": "npub1sn0wdenkukak0d9dfczzeacvhkrgz92ak89wnfwtj0f8r9qnfqqsrh90j"
        }
    },
    "wires": [["nostr-relay"]]
},
{
    "id": "nostr-relay",
    "type": "nostr-relay",
    "name": "Nostr Connection",
    "relayUrl": "wss://relay.damus.io",
    "wires": [["debug"]]
},
{
    "id": "debug",
    "type": "debug",
    "name": "Profile Updates",
    "active": true,
    "complete": true
}]
```

## Example Flow

Here's a basic example of subscribing to text notes (kind 1):

```json
[{
    "id": "nostr-relay",
    "type": "nostr-relay",
    "name": "My Relay",
    "relayUrl": "wss://relay.damus.io",
    "wires": [["debug"]]
},
{
    "id": "inject",
    "type": "inject",
    "name": "Subscribe",
    "payload": {
        "type": "subscribe",
        "content": {
            "filters": [{
                "kinds": [1]
            }]
        }
    },
    "wires": [["nostr-relay"]]
},
{
    "id": "debug",
    "type": "debug",
    "name": "Debug",
    "active": true,
    "complete": false
}]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Repository

[https://github.com/HumanjavaEnterprises/node-red-contrib-nostr](https://github.com/HumanjavaEnterprises/node-red-contrib-nostr)

## Author

[vveerrgg](https://github.com/vveerrgg)
