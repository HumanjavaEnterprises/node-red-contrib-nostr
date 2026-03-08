# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-03-06

### Fixed
- Added type assertion for Node-RED `registerType` compatibility

## [0.2.0] - 2026-03-06

### Changed
- **Noble 2.0 migration** via nostr-websocket-utils and nostr-crypto-utils upgrades
- **nostr-tools 2.x:** Upgraded from 1.x
- **Vitest 4:** Upgraded test framework
- Dropped Node.js 16 support

### Fixed
- Relay URL validation and custom filter field allowlist
- Read private key from Node-RED credential store, not config
- Replaced hardcoded private key with ephemeral key generation
- Updated nostr-websocket-utils to fix CJS module resolution

### Security
- Multiple security patches (0.1.4, 0.1.5, 0.1.6): credential handling and key management hardening

## [0.1.1] - 2025-02-19

### Changed
- Updated dependencies and migrated to nostr-websocket-utils 0.3.x API
- Fixed all ESLint errors
- Fixed postbuild script to handle missing icons directory gracefully

### Added
- Improved GitHub Actions and documentation
- Comprehensive NIPs support table in README
- Comprehensive test suite and project metadata

## [0.1.0] - 2025-01-10

### Added
- Initial release
- Nostr Relay Config node for managing relay connections
- Nostr Filter node for event filtering by kind, author, and tags
- Nostr NPUB Filter node for monitoring specific NPUBs
- Nostr Relay node for direct relay interaction
- Docker support with docker-compose configuration
- TypeScript support with full type definitions
- Automatic reconnection handling via nostr-websocket-utils
- Secure credential management for private keys
- Example flows for event monitoring and NPUB tracking
- Community files and GitHub templates
