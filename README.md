# node-red-contrib-nostr

[![npm version](https://badge.fury.io/js/node-red-contrib-nostr.svg)](https://badge.fury.io/js/node-red-contrib-nostr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node-RED](https://img.shields.io/badge/Node--RED-Contribution-red.svg)](https://flows.nodered.org/node/node-red-contrib-nostr)
[![Tests](https://github.com/HumanjavaEnterprises/node-red-contrib-nostr/actions/workflows/test.yml/badge.svg)](https://github.com/HumanjavaEnterprises/node-red-contrib-nostr/actions/workflows/test.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/github/HumanjavaEnterprises/node-red-contrib-nostr/badge.svg)](https://snyk.io/test/github/HumanjavaEnterprises/node-red-contrib-nostr)

A [Node-RED](http://nodered.org) node for integrating with the Nostr protocol. This node allows you to connect to Nostr relays, publish events, and subscribe to events in the Nostr network.

## ⚠️ Security Note

A private key is **only required** if you want to:
- Publish events to relays
- Send encrypted direct messages
- Perform any action that requires signing

For just listening to relays or subscribing to events, **no private key is needed**.

If you do need to publish events, follow these security guidelines:

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

### Dependency Vulnerability Status

We actively monitor and address security vulnerabilities in this codebase. **`npm audit --omit=dev` reports zero vulnerabilities** for this package — there are no known security issues in production dependencies.

Any remaining `npm audit` findings are in development-only tooling (eslint, typescript-eslint, vitest, etc.) and transitive dependencies of node-red itself, with no upstream fix available. These are devDependencies that are never included in the published package and pose no risk to consumers of this library. We monitor upstream fixes and update promptly when they become available.

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

## Technical Architecture

### Module System
This package uses a hybrid approach to module systems to ensure maximum compatibility:
- Built as CommonJS for Node-RED compatibility
- Handles ESM dependencies through dynamic imports
- Supports both modern and legacy Node.js environments

### WebSocket Management
Built on [nostr-websocket-utils](https://github.com/HumanjavaEnterprises/nostr-websocket-utils) for enterprise-grade reliability:
- **Automatic Reconnection**: Smart backoff strategy for connection drops
- **Connection Health**: Built-in heartbeat monitoring
- **Type Safety**: Full TypeScript support
- **Error Resilience**: Comprehensive error handling
- **Memory Efficient**: Proper cleanup of resources
- **Debug Support**: Detailed logging

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
- Multiple relay support
- Secure private key storage
- Automatic reconnection handling
- Connection status monitoring
- Dynamic import of ESM dependencies

### 2. Nostr Filter Node
Specialized node for event filtering:
- Filter by event kinds
- Filter by authors (NPUBs)
- Filter by tags
- Time-based filtering
- Custom filter combinations
- Real-time event processing

### 3. Nostr NPUB Filter Node
Dedicated node for NPUB-based filtering:
- Monitor specific NPUBs
- Filter by event types
- Real-time NPUB event tracking
- Automatic hex key conversion

### 4. Nostr Relay Node
Direct relay interaction node:
- Publish events to relays
- Subscribe to event streams
- Connection status monitoring
- Automatic reconnection handling

## Example Flows

### Basic Event Monitoring
```json
{
    "id": "basic-monitor",
    "type": "nostr-filter",
    "relay": "wss://relay.example.com",
    "filterType": "kind",
    "eventKinds": [1],
    "wires": [["debug"]]
}
```

### NPUB Tracking
```json
{
    "id": "npub-track",
    "type": "nostr-npub-filter",
    "relay": "wss://relay.example.com",
    "npubValue": "npub1...",
    "eventKinds": [1, 6],
    "wires": [["debug"]]
}
```

## Error Handling

The nodes implement comprehensive error handling:
- Invalid private key detection
- Relay connection failures
- Message parsing errors
- NPUB validation
- WebSocket connection issues

## Development

### Building from Source
```bash
npm install
npm run build
```

### Running Tests
```bash
npm test
```

Test coverage includes:
- Unit tests for all nodes
- WebSocket connection handling
- Event filtering logic
- Error handling

### Docker Development
```bash
docker compose up
```

## Supported NIPs

| NIP | Description | Status |
|-----|------------|--------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic Protocol | ✅ Implemented |
| [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md) | Contact List and Petnames | ✅ Implemented |
| [NIP-03](https://github.com/nostr-protocol/nips/blob/master/03.md) | OpenTimestamps Attestations | 🚧 Planned |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted Direct Messages | 🚧 Planned |
| [NIP-09](https://github.com/nostr-protocol/nips/blob/master/09.md) | Event Deletion | 🚧 Planned |
| [NIP-11](https://github.com/nostr-protocol/nips/blob/master/11.md) | Relay Information Document | ✅ Implemented |
| [NIP-15](https://github.com/nostr-protocol/nips/blob/master/15.md) | End of Stored Events Notice | ✅ Implemented |
| [NIP-20](https://github.com/nostr-protocol/nips/blob/master/20.md) | Command Results | ✅ Implemented |
| [NIP-28](https://github.com/nostr-protocol/nips/blob/master/28.md) | Public Chat | 🚧 Planned |
| [NIP-40](https://github.com/nostr-protocol/nips/blob/master/40.md) | Expiration Timestamp | 🚧 Planned |

Legend:
- ✅ Implemented: Fully supported
- 🚧 Planned: On the roadmap
- ❌ Not Planned: Not currently planned for implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Node-RED Specific Tags

This module provides nodes for working with Nostr protocol in Node-RED.

### Node Properties

* Category: network
* Name: node-red-contrib-nostr
* Types: nostr-relay-config, nostr-filter, nostr-npub-filter
* Description: Node-RED nodes for interacting with Nostr protocol
* Author: Vveerrgg
* Keywords: node-red,nostr,websocket,relay,filter,npub
* Dependencies: @humanjavaenterprises/nostr-tools,nostr-websocket-utils
* Node-RED: >= 2.0.0
