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
     } from '@material-ui/icons';
import MaterialTable, { Icons, MaterialTableProps } from 'material-table';
import * as React from 'react';
import { Optional } from '../../util/Optional';
import { Replace } from '../../util/Replace';

type AdaptedMaterialTable = React.ComponentType<Optional<Replace<MaterialTableProps,"data",any[]>,"data">>;

const IconMaterialTable = (props: MaterialTableProps) => {
    const icons:Icons = Object.entries({
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
    }).reduce((a,[key,Value]) => ((a[key] = () => <Value/>),a), {}) as Icons;
    return <MaterialTable icons={icons} data={[]} {...props}/>;
};

IconMaterialTable.displayName = 'IconMaterialTable';

export default IconMaterialTable as AdaptedMaterialTable;