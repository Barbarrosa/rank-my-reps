import * as React from 'react';

interface Props<Z extends keyof H, B extends keyof H,F extends string,R,H> {
    sources?: Z[];
    passThroughFields?: B[];
    destination: F;
    children: React.ReactElement<Record<F,R>>;
    transform: (source:Pick<H,Z>) => R;
}

function CombineData<P extends Props<Z,B,F,R,H>, H extends Record<Z|B,any>, B extends string, Z extends string,F extends string,R>(props: P & H): JSX.Element {
    type PassThrough = Pick<H,B>;
    type SourceData = Pick<H,Z>;
    const { sources, destination, children, transform, passThroughFields } = props;
    const data: SourceData = (sources || []).reduce((a: SourceData,s: Z) => {
        if(s in props) {
            a[s] = props[s] as SourceData[Z];
        }
        return a;
    }, {} as SourceData) as SourceData;
    const passThrough: PassThrough = (passThroughFields || []).reduce((a: PassThrough,s: B) => {
        if(s in props) {
            a[s] = props[s] as PassThrough[B];
        }
        return a;
    }, {} as PassThrough) as PassThrough;
    const transformedData: R = transform(data);
    const newChildren = React.Children.map(
        children,
        (child: React.ReactElement<Record<F,R> & Partial<PassThrough>>|string|number) => {
            if(typeof child === "string") {
                return child.slice();
            } else if(typeof child === "number") {
                return child + 0;
            }
            const obj: Record<F,R> & Partial<PassThrough> = { [destination]: transformedData } as Record<F,R> & Partial<PassThrough>;
            for(const [key,value] of Object.entries(passThrough)) {
                obj[key] = value;
            }
            return React.cloneElement(child, obj);
        }
    );
    return <React.Fragment>
        {newChildren}
    </React.Fragment>;
}
CombineData.displayName = 'CombineData';
export default CombineData;