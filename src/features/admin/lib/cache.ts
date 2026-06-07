// Tiny in-memory cache so admin pages don't show a loading skeleton when you
// switch tabs and come back. Survives unmount/remount within a single session;
// cleared on full page reload or logout.
const store = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T) {
  store.set(key, value);
}

export function clearCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
