import { omit } from 'lodash';
import * as React from 'react';

interface Props<T,Z extends string>{
    alias: Z;
    data: any[];
    children: React.ReactElement<T>;
}

const ReassignData = <T extends {[P in Z]: any[]},Z extends string>(props: Props<T,Z>): JSX.Element => {
    const children = React.Children.map(
        props.children,
        (child: React.ReactElement<T>|string|number) => {
            if(typeof child === "string") {
                return child.slice();
            } else if(typeof child === "number") {
                return child + 0;
            }
            const obj = {
                ...omit(props,['alias','data','children']),
                [props.alias as string]: props.data
            };
            return React.cloneElement(child, obj);
        }
    );
    return <React.Fragment>
        {children}
    </React.Fragment>;
}
ReassignData.displayName = 'ReassignData';
export default ReassignData;