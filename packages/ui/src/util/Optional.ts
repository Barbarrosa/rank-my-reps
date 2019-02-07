type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Optional<
  T extends { [key: string]: any },
  K extends keyof T
> = Omit<T, K> & { [P in K]?: T[K] };
