# Rank My Reps

**Rank My Reps** helps you hold elected U.S. officials accountable by bridging the gap between policy and your ballot.

## Development Setup

This project requires [NodeJS](https://nodejs.org/en/). After that's installed, you can setup the project by running the following commands in a terminal.

```bash
# Copy this code onto your computer
git clone git@github.com:Barbarrosa/rank-my-reps.git

# Install npx for easy access to NPM/NodeJS binaries
npm install -g npx

# Run project directory; installs dependencies
npx lerna bootstrap
```

## UI Development

The user interface is developed using [Create React App](https://github.com/facebook/create-react-app). You need to configure a [ProPublica API](https://projects.propublica.org/api-docs/congress-api/) key to develop locally. Create a file `.env.local` under [packages/rank-my-reps-ui](packages/rank-my-reps-ui) with the following contents.

```env
# This file should never be committed
REACT_APP_PROPUBLICA_API_KEY=<your api key here>
```

You can start the UI by navigating to `packages/rank-my-reps-ui` and running the command `npm start`.
