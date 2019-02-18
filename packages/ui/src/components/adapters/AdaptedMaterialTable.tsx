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

type OptionalIcons = Optional<Icons, keyof Icons>;
type AdaptedMaterialTable = React.ComponentType<
  Optional<
    Replace<
      Optional<Replace<MaterialTableProps, "data", any[]>, "data">,
      "icons",
      OptionalIcons
    >,
    "icons"
  >
>;

const getFilterFn = (fieldName: string) => {
  const nameParts = fieldName.split(".");
  return (filter: any, data: object) => {
    // Empty filters always return this object
    if (filter === "" || filter === null || filter === undefined) {
      return true;
    }
    // Navigate into object hierarchy
    for (const part of nameParts) {
      data = data[part];
      if (data === undefined || data === null) {
        // Return false if part of the heirarchy is missing
        return false;
      }
    }
    return data && ("" + data).includes(filter);
  };
};

const IconMaterialTable = (props: MaterialTableProps) => {
  // Configure icons
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
  }).reduce(
    (a, [key, Value]) => ((a[key] = iconProps => <Value {...iconProps} />), a),
    {}
  ) as Icons;

  // Make nested fields searchable
  const columns: typeof props.columns = [];
  for (const col of props.columns) {
    if (col.field && col.field.includes(".") && !col.customFilterAndSearch) {
      columns.push({ ...col, customFilterAndSearch: getFilterFn(col.field) });
    } else {
      columns.push(col);
    }
  }

  const newProps = { ...props, columns };

  return (
    <React.Fragment>
      <MaterialTable
        data={[]}
        {...newProps}
        icons={{
          ...icons,
          ...(newProps.icons || {})
        }}
        options={{
          doubleHorizontalScroll: true,
          emptyRowsWhenPaging: false,
          filtering: true,
          search: false,
          ...(newProps.options || {})
        }}
      />
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
