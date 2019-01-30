export function isArrayOfType<T>(val: any, guard: (t: any) => t is T): val is T[] {
    return Array.isArray(val) && val.every((i) => guard(i));
}