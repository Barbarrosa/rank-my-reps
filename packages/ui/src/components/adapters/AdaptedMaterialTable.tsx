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

export type AdaptedMaterialTableProps = Optional<
  Replace<MaterialTableProps, "data", any[]>,
  "data"
>;
export type AdaptedMaterialTableType = React.ComponentType<
  AdaptedMaterialTableProps
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
  }).reduce((a, [key, Value]) => ((a[key] = () => <Value />), a), {}) as Icons;

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
    <MaterialTable
      icons={icons}
      data={[]}
      options={{ filtering: true, search: false }}
      {...newProps}
    />
  );
};

IconMaterialTable.displayName = "IconMaterialTable";

export default IconMaterialTable as AdaptedMaterialTableType;
