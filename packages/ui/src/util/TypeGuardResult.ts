type TypeGuardResult<F, T> = F extends (v) => v is infer G
  ? G extends T
    ? G
    : never
  : never;

export default TypeGuardResult;
