import { useEffect, useState } from "react";

export default function getSubscribableState<T>(
  watchedValues: any[],
  initialValue: T,
  subscribe: () => AsyncIterableIterator<typeof initialValue>
): {
  state: typeof initialValue;
  loading: boolean;
} {
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let generator: AsyncIterableIterator<typeof initialValue>;
    (async () => {
      generator = subscribe();
      setLoading(true);
      setState((await generator.next()).value);
      setLoading(false);

      for await (const newVal of generator) {
        setState(newVal);
      }
    })();
    return () => {
      if (generator && generator.return) {
        generator.return();
      }
    };
  }, watchedValues);
  return {
    loading,
    state
  };
}
