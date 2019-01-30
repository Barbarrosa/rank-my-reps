export default function InstrumentTypeGuard<T extends (...args: any[]) => any>(fn:T): T {
    return ((...args: any[]): any => {
        const result: ReturnType<T> = fn(...args);
        console.log(fn.name, args);
        if(!result) {
            console.log('Failed', fn.name, args, new Error().stack);
        }
        return result;
    }) as T;
}