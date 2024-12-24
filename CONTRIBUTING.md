# Contributing to node-red-contrib-nostr

First off, thank you for considering contributing to node-red-contrib-nostr! It's people like you that make this Node-RED node better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include Node-RED and node version information
* Include any relevant logs or error messages

### Suggesting Enhancements

If you have a suggestion for a new feature or enhancement:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful to most users

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code lints
* Update the documentation

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Project Structure

```
node-red-contrib-nostr/
├── src/
│   └── nodes/           # TypeScript source files
│       ├── *.ts        # Node implementations
│       └── *.html      # Node UI definitions
├── dist/               # Compiled JavaScript (git-ignored)
├── __tests__/         # Test files
├── __mocks__/         # Mock implementations
└── package.json       # Project configuration
```

### Coding Style

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Add comments for complex logic
* Update documentation for API changes

## Testing

* Write tests for any new functionality
* Run the test suite before submitting a PR
* Include both unit tests and integration tests where appropriate

## Documentation

* Update the README.md with details of changes to the interface
* Update the JSDoc comments in source code
* Add or update examples for new features

## Community

* Join our discussions in the issue tracker
* Help other users who ask questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to create an issue or contact the maintainers if you have any questions!
