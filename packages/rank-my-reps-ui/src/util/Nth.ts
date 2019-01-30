import suffix from 'ordinal-number-suffix';
export default function Nth(n:number): string {
    return suffix(n);
}