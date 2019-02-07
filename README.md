# Rank My Reps

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Rank My Reps** helps you hold elected U.S. officials accountable by bridging the gap between policy and your ballot.

## Development Setup

This project requires [NodeJS](https://nodejs.org/en/). After that's installed, you can setup the project by running the following commands in a terminal.

```bash
# Copy this code repository onto your computer
git clone git@github.com:Barbarrosa/rank-my-reps.git

# Install npx for easy access to NPM/NodeJS binaries
npm install -g npx

# Switch to the main project folder
cd rank-my-reps

# Install dependencies
npx lerna bootstrap
```

- [UI Development](packages/ui/README.md)
- [Infrastructure Development](packages/infrastructure/README.md)
