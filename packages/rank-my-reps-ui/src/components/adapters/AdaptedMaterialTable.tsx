import {
  Check,
  ChevronLeft as PreviousPage,
  ChevronRight as DetailPanel,
  ChevronRight as NextPage,
  Filter,
  FirstPage,
  LastPage,
  Remove as ThirdStateCheck,
  SaveAlt as Export,
  Search,
  ViewColumn
} from "@material-ui/icons";
import MaterialTable, { Icons, MaterialTableProps } from "material-table";
import * as React from "react";
import { Optional } from "../../util/Optional";
import { Replace } from "../../util/Replace";

type AdaptedMaterialTable = React.ComponentType<
  Optional<Replace<MaterialTableProps, "data", any[]>, "data">
>;

const IconMaterialTable = (props: MaterialTableProps) => {
  const icons: Icons = Object.entries({
    Check,
    DetailPanel,
    Export,
    Filter,
    FirstPage,
    LastPage,
    NextPage,
    PreviousPage,
    Search,
    ThirdStateCheck,
    ViewColumn
  }).reduce((a, [key, Value]) => ((a[key] = () => <Value />), a), {}) as Icons;
  return (
    <React.Fragment>
      <MaterialTable icons={icons} data={[]} {...props} />
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
};

IconMaterialTable.displayName = "IconMaterialTable";

export default IconMaterialTable as AdaptedMaterialTable;
