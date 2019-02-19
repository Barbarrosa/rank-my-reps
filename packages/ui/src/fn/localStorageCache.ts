const getStorage: () => Storage = (): Storage => window.localStorage;

interface CacheItemParam<T> {
  expirySeconds?: number;
  key: string;
  value: T;
}

interface CacheItem<T> extends CacheItemParam<T> {
  date: number;
}

function isCacheItem<T>(
  item: any,
  guard: (z: any) => z is T
): item is CacheItem<T> {
  // Structure matches
  return (
    typeof item === "object" &&
    typeof item.key === "string" &&
    typeof item.expirySeconds === "number" &&
    typeof item.date === "number" &&
    // Validate expiry
    (item.expirySeconds < 0 ||
      new Date(item.date + 100 * item.expirySeconds) > new Date()) &&
    // Cached item matches expected type
    guard(item.value)
  );
}

export async function storeValue<T>({
  key,
  value,
  expirySeconds = 3000
}: CacheItemParam<T>): Promise<void> {
  const storage = getStorage();

  const cacheItem: CacheItem<T> = {
    date: new Date().getTime(),
    expirySeconds,
    key,
    value
  };

  try {
    const jsonCacheItem = JSON.stringify(cacheItem);
    storage.setItem(key, jsonCacheItem);
    const event = new CustomEvent<CustomStorageEventData>(
      CUSTOM_STORAGE_EVENT_NAME,
      {
        detail: {
          key,
          newValue: jsonCacheItem
        }
      }
    );
    window.dispatchEvent(event);
  } catch (e) {
    console.error("Failed to add value to cache", cacheItem, e);
  }
}

interface CacheResponse<T> {
  isHit: boolean;
  value?: T;
}

interface CacheHit<T> extends CacheResponse<T> {
  value: T;
}

const CUSTOM_STORAGE_EVENT_NAME = "FactBasedVote_StorageChangedEvent";
interface CustomStorageEventData {
  key: typeof StorageEvent.prototype.key;
  newValue: typeof StorageEvent.prototype.newValue;
  oldValue?: typeof StorageEvent.prototype.oldValue;
}

const isCustomStorageEvent = (
  ev: Event & { detail?: CustomStorageEventData }
): ev is CustomEvent<CustomStorageEventData> => {
  return (
    typeof ev.detail === "object" &&
    typeof ev.detail.key === "string" &&
    typeof ev.detail.newValue === "string" &&
    (typeof ev.detail.oldValue === "string" ||
      ev.detail.oldValue === undefined ||
      ev.detail.oldValue === null)
  );
};

window.addEventListener("storage", (ev: StorageEvent) => {
  if (ev.storageArea === window.localStorage) {
    const { key, newValue, oldValue } = ev;
    const event = new CustomEvent<CustomStorageEventData>(
      CUSTOM_STORAGE_EVENT_NAME,
      {
        detail: {
          key,
          newValue,
          oldValue
        }
      }
    );
    window.dispatchEvent(event);
  }
});

export async function getValue<T>(
  key: string,
  guard: (x: any) => x is T
): Promise<CacheResponse<T>> {
  const storage = getStorage();
  const cachedValue = storage.getItem(key);
  if (cachedValue) {
    try {
      const parsedValue: unknown = JSON.parse(cachedValue);
      if (isCacheItem(parsedValue, guard)) {
        return {
          isHit: true,
          value: parsedValue.value
        };
      } else {
        console.warn("Invalid cache item, removing item.", parsedValue);
        storage.removeItem(key);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    isHit: false
  };
}

export function checkHit<T>(
  response: CacheResponse<T>
): response is CacheHit<T> {
  return response.isHit === true;
}

type Validator<R> = (data: any) => data is R;
type OrigFn<P extends any[], R> = (...args: P) => Promise<R>;

export function cacheGet<P extends any[], R>(
  prefix: string,
  validFn: Validator<R>,
  fn: OrigFn<P, R>,
  expirySeconds: number = 3000
): OrigFn<P, R> {
  return async (...args: P): Promise<R> => {
    const key = `${prefix}:${args.join(":")}`;
    const cacheResult = await getValue(key, validFn);
    if (checkHit(cacheResult)) {
      return cacheResult.value;
    }
    const value = await fn(...args);
    await storeValue({ key, value, expirySeconds });
    return value;
  };
}

export function cacheSet<R, V, K extends string[], P extends any[]>(
  prefix: string,
  toKeyParts: (...args: P) => K,
  toValue: (...args: P) => V,
  fn: OrigFn<P, R>,
  expirySeconds: number = 3000
): OrigFn<P, R> {
  return async (...args: P): Promise<R> => {
    const key = `${prefix}:${toKeyParts(...args).join(":")}`;
    const value = await fn(...args);
    await storeValue({ key, value: toValue(...args), expirySeconds });
    return value;
  };
}

export async function* cacheSubscribe<R>(
  key: string,
  validFn: Validator<R>
): AsyncIterableIterator<R> {
  let resolve: (value: R) => void = () => {};
  const promises: Array<Promise<R>> = [
    new Promise<R>(res => {
      resolve = res;
    })
  ];

  // Provide current storage value immediately
  try {
    const val = JSON.parse(getStorage().getItem(key) || "null");
    if (isCacheItem(val, validFn)) {
      const origResolve = resolve;
      promises.push(
        new Promise(res => {
          resolve = res;
        })
      );
      origResolve(val.value);
    }
  } catch (e) {}

  const listener = (event: Event) => {
    if (!isCustomStorageEvent(event)) {
      return;
    }
    const { detail } = event;
    if (detail.key === key) {
      try {
        const val = JSON.parse(detail.newValue || "null");
        if (isCacheItem(val, validFn)) {
          const origResolve = resolve;
          promises.push(
            new Promise(res => {
              resolve = res;
            })
          );
          origResolve(val.value);
        }
      } catch (e) {}
    }
  };

  do {
    // Allow changes to stack up in promise queue
    window.addEventListener(CUSTOM_STORAGE_EVENT_NAME, listener);
    try {
      // Return next new value for cache key
      yield (await promises.shift()) as R;
    } finally {
      // Ensure listener is removed when returning/throwing from yield
      window.removeEventListener(CUSTOM_STORAGE_EVENT_NAME, listener);
    }
  } while (true);
}
