import * as React from 'react';
import { JsonToTable } from 'react-json-to-table';

interface Props {
    data: any[];
}

export function DataToTable(props: Props): JSX.Element {
    return <JsonToTable json={props.data} />
}