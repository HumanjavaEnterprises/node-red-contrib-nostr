# node-red-contrib-nostr

A [Node-RED](http://nodered.org) node for integrating with the Nostr protocol. This node allows you to connect to Nostr relays, publish events, and subscribe to events in the Nostr network.

## ⚠️ Security Warning

**IMPORTANT**: When using this plugin to post to Nostr relays, you will need to provide a private key. 

**DO NOT USE YOUR MAIN NOSTR PRIVATE KEY!** Instead:

1. Generate a separate key pair specifically for your Node-RED automation using services like:
   - [nsec.app](https://nsec.app/)
   - [Alby](https://getalby.com/)
   - [Nostr.band](https://nostr.band/)

2. Keep the scope of this automation key limited:
   - Only give it permissions it actually needs
   - Consider it like a "bot account"
   - Regularly rotate the key if possible

3. Store the private key securely:
   - Use Node-RED's encrypted credentials
   - Never share or expose the key
   - Don't commit it to version control

## Description

This package provides nodes for interacting with Nostr relays, allowing you to:
- Connect to multiple relays simultaneously
- Monitor specific NPUBs for events
- Filter events by type (text notes, DMs, etc.)
- Post events to relays (using a dedicated automation key)
- Support for multiple NIPs (see Supported NIPs section)
- TypeScript support with full type definitions
- Secure credential management
- Automatic reconnection handling

## Install

### From npm (Recommended)
Run the following command in your Node-RED user directory - typically `~/.node-red`

```bash
npm install node-red-contrib-nostr
```

### From Source
```bash
cd ~/.node-red
git clone https://github.com/HumanjavaEnterprises/node-red-contrib-nostr.git
cd node-red-contrib-nostr
npm install
npm run build
```

### Using Docker
```bash
git clone https://github.com/HumanjavaEnterprises/node-red-contrib-nostr.git
cd node-red-contrib-nostr
docker compose up -d
```

## Nodes

### 1. Nostr Relay Config Node
Configuration node for managing relay connections:
- Multiple relay support (up to 3 relays)
- Secure private key storage
- Automatic reconnection handling
- Connection status monitoring

### 2. Nostr Relay Node
Main node for interacting with relays:
- Event publishing
- Event subscription with filters
- Real-time status updates
- Error handling and recovery

### 3. Nostr Filter Node
Specialized node for event filtering:
- Filter by event kinds
- Filter by authors
- Filter by tags
- Custom filter combinations

## Usage

### Relay Configuration

1. Add a new "nostr-relay-config" node
2. Configure up to 3 relay URLs (e.g., wss://relay.damus.io)
3. Set your private key (securely stored in credentials)
4. Configure auto-reconnect settings

### Event Publishing

```javascript
msg.payload = {
    type: "publish",
    content: {
        kind: 1,              // Event kind (1 for note)
        content: "Hello Nostr!",
        tags: [               // Optional tags
            ["t", "node-red"],
            ["t", "automation"]
        ]
    }
}
```

### Event Subscription

```javascript
msg.payload = {
    type: "subscribe",
    content: {
        filters: [{
            kinds: [1, 6, 7],    // Text notes, reposts, reactions
            authors: ["<pubkey>"],
            "#t": ["node-red"]   // Filter by tag
        }]
    }
}
```

### Output Format

```javascript
msg.payload = {
    type: "event",
    content: {
        id: string,          // Event ID
        pubkey: string,      // Author's public key
        created_at: number,  // Unix timestamp
        kind: number,        // Event kind
        tags: string[][],    // Event tags
        content: string,     // Event content
        sig: string         // Event signature
    }
}
```

### Status Indicators

The nodes use standard Node-RED status indicators:
- 🔴 Red: Disconnected or error
- 🟡 Yellow: Connecting or processing
- 🟢 Green: Connected and ready

## Supported NIPs

| NIP | Status | Description |
|-----|--------|-------------|
| [01](https://github.com/nostr-protocol/nips/blob/master/01.md) | ✅ | Basic protocol flow description |
| [02](https://github.com/nostr-protocol/nips/blob/master/02.md) | ✅ | Contact List and Petnames |
| [09](https://github.com/nostr-protocol/nips/blob/master/09.md) | 🚧 | Event Deletion |
| [10](https://github.com/nostr-protocol/nips/blob/master/10.md) | ✅ | Reply Threading |
| [19](https://github.com/nostr-protocol/nips/blob/master/19.md) | ✅ | bech32-encoded entities (for npub support) |
| [23](https://github.com/nostr-protocol/nips/blob/master/23.md) | 🚧 | Long-form Content |
| [42](https://github.com/nostr-protocol/nips/blob/master/42.md) | ❌ | Authentication of clients to relays |
| [51](https://github.com/nostr-protocol/nips/blob/master/51.md) | 🚧 | Lists (bookmarks & follow lists) |

Legend:
- ✅ Fully Supported
- 🚧 In Progress/Planned
- ❌ Planned for Future

## Best Practices

1. **Key Management**:
   - Generate dedicated keys for automation
   - Never use your main Nostr identity
   - Rotate keys periodically
   - Use Node-RED's credential encryption

2. **Relay Selection**:
   - Use reliable, well-known relays
   - Consider running your own relay for critical applications
   - Monitor relay health and performance
   - Configure multiple relays for redundancy

3. **Rate Limiting**:
   - Be mindful of relay resources
   - Implement appropriate delays
   - Filter events as specifically as possible
   - Use appropriate subscription filters

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
