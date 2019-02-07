# UI Development

The user interface is developed using [Create React App](https://github.com/facebook/create-react-app). You need to configure a [ProPublica API](https://projects.propublica.org/api-docs/congress-api/) key to develop locally. Create a file `.env.development.local` in this folder with the following contents.

```env
# This file should never be committed
REACT_APP_PROPUBLICA_API_KEY=<your api key here>
```

You can start the UI by running the command `npm start` from this folder.
