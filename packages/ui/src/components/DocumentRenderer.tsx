import { Button } from "@material-ui/core";
import * as React from "react";
import { Document, Page } from "react-pdf/dist/entry.webpack";
import AdaptedMaterialTable from "./adapters/AdaptedMaterialTable";

export default function DocumentRenderer({
  title,
  uri
}: {
  title: string;
  uri?: string;
}): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [numPages, setPages] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  if (!uri) {
    return <p>This document's PDF URI is missing from our data.</p>;
  }

  const onLoad = ({ numPages: pages }: { numPages: number }) => {
    setLoading(false);
    setPages(pages);
  };

  const onLoadError = () => {
    setHasError(true);
    setLoading(false);
  };

  const triggerRetry = () => {
    setLoading(true);
    setHasError(false);
  };

  return (
    <AdaptedMaterialTable
      title={title}
      isLoading={loading}
      data={
        numPages
          ? Array(numPages)
              .fill("")
              .map((e, page) => ({ page }))
          : [{ page: 1 }]
      }
      options={{
        header: false,
        pageSize: 1,
        pageSizeOptions: [],
        search: false,
        sorting: false,
        toolbar: false
      }}
      columns={[
        {
          field: "page",
          render: ({ page }) => {
            if (hasError) {
              return (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={triggerRetry}
                >
                  Error, click here to try again.
                </Button>
              );
            }
            if (numPages < 1) {
              return (
                <Document
                  file={uri}
                  onLoadSuccess={onLoad}
                  onLoadError={onLoadError}
                  options={{}}
                />
              );
            }
            return (
              <Document
                file={uri}
                onLoadSuccess={onLoad}
                onLoadError={onLoadError}
                options={{}}
              >
                <Page key={"page_" + (page + 1)} pageNumber={page + 1} />
              </Document>
            );
          },
          title: "Page"
        }
      ]}
    />
  );
}
