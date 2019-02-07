import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@material-ui/core";
import * as React from "react";
import { setApiKeyRequestMethod } from "../fn/api";

let apiKeyProvideResolve: (key: string) => void;
const apiKeyPromise = new Promise<string>(res => {
  apiKeyProvideResolve = res;
});

let apiKeyRequestTrigger: () => void;
const apiKeyRequestPromise = new Promise(res => {
  apiKeyRequestTrigger = res;
});

const API_KEY_STORAGE_KEY = "ProPublicaApiKey";

setApiKeyRequestMethod(async () => {
  const sessionStorage = window.sessionStorage;
  const key = sessionStorage.getItem(API_KEY_STORAGE_KEY);
  if (key) {
    return key;
  }
  apiKeyRequestTrigger();
  const result = await apiKeyPromise;
  window.sessionStorage.setItem(API_KEY_STORAGE_KEY, result);
  return result;
});

export default function ApiKeyRequest(): JSX.Element {
  const [apiKey, setApiKey] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const saveToSession = () => {
    apiKeyProvideResolve(apiKey);
    setOpen(false);
  };

  const updateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  React.useEffect(() => {
    (async () => {
      await apiKeyRequestPromise;
      if (!open && apiKey === "") {
        setOpen(true);
      }
    })();
  });

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={true}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">ProPublica API Key</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter a{" "}
          <a
            href="https://projects.propublica.org/api-docs/congress-api/#get-an-api-key"
            target="_blank"
          >
            ProPublica API key
          </a>
          .
        </DialogContentText>
        <TextField
          autoFocus={true}
          margin="dense"
          id="api-key-entry"
          label="API key"
          type="text"
          fullWidth={true}
          value={apiKey}
          onChange={updateApiKey}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={saveToSession} color="primary">
          Save to Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
