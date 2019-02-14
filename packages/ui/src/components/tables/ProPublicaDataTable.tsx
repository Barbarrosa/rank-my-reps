import * as React from "react";
import AdaptedMaterialTable, {
  AdaptedMaterialTableProps
} from "../adapters/AdaptedMaterialTable";

export default function ProPublicaDataTable(
  props: AdaptedMaterialTableProps
): JSX.Element {
  return (
    <React.Fragment>
      <AdaptedMaterialTable {...props} />
      <div>
        <p>
          <a href="https://www.propublica.org/" target="_blank">
            ProPublica
          </a>{" "}
          provides Congress-related data under the{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc-nd/3.0/"
            target="_blank"
          >
            Creative Commons Attribution-NonCommercial-NoDerivs 3.0 license
          </a>
          .
        </p>
        <p>
          You can read more about{" "}
          <a
            href="https://projects.propublica.org/api-docs/congress-api/"
            target="_blank"
          >
            ProPublica's API by clicking here
          </a>
          .
        </p>
      </div>
    </React.Fragment>
  );
}
