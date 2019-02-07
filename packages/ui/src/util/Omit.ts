export type Omit<T, K extends string> = K extends keyof T
  ? Pick<T, Exclude<keyof T, K>>
  : T;
