# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ----------------- |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities by creating a new issue using the "Security Vulnerability" template. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity.

## Security Measures

This project implements several security measures:

1. Input validation for all Nostr events
2. Secure WebSocket connections
3. No storage of sensitive data
4. Regular dependency updates

## Best Practices

When using this Node-RED node:

1. Always use secure WebSocket connections (wss://)
2. Keep your Node-RED installation up to date
3. Review the relay URLs you connect to
4. Monitor your Node-RED logs for suspicious activity

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions and notify users

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.
