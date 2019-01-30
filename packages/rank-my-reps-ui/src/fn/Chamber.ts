export type Chamber = "house" | "senate" | "House" | "Senate";
export function isChamber(data: any): data is Chamber {
    return data === "house" || data === "senate"
        || data === "House" || data === "Senate";
}