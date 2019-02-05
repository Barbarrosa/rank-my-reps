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

interface Props {
  open: boolean;
  registerApiKeyCb: (fn: () => Promise<string>) => void;
}

export default function ApiKeyRequest({
  open,
  registerApiKeyCb
}: Props): JSX.Element {
  let resolve: (key: string) => any;
  let reject: (err: Error) => any;
  const apiKeySubmitted = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const [apiKey, setApiKey] = React.useState("");
  const handleClose = () => {
    reject(new Error("API key not provided"));
  };
  const saveToSession = () => {
    resolve(apiKey);
  };
  const updateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };
  registerApiKeyCb(async () => apiKeySubmitted);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={saveToSession} color="primary">
          Save to Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
