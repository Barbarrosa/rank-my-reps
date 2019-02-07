type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]: U };
