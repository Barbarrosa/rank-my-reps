export function hasKeyValueTypes<K extends string | number | symbol, V>(obj: any, keyFn: (data: any) => data is K, valueFn: (data: any) => data is V): obj is {
    [i in K]?: V;
} {
    return typeof obj === 'object'
        && Object.entries(obj).every(([key, value]) => keyFn(key) && valueFn(value));
}