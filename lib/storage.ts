const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

function webStorage() {
  return {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
    removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve(); },
    multiRemove: (keys: string[]) => { keys.forEach((k) => localStorage.removeItem(k)); return Promise.resolve(); },
    multiGet: (keys: string[]) => Promise.resolve(keys.map((k) => [k, localStorage.getItem(k)] as [string, string | null])),
    getAllKeys: () => Promise.resolve(Object.keys(localStorage)),
    mergeItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
  };
}

let _nativeStore: any = null;

async function nativeStorage() {
  if (_nativeStore) return _nativeStore;
  const mod = await import("@react-native-async-storage/async-storage");
  _nativeStore = mod.default;
  return _nativeStore;
}

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return webStorage().getItem(key);
    return (await nativeStorage()).getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) { webStorage().setItem(key, value); return; }
    await (await nativeStorage()).setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) { webStorage().removeItem(key); return; }
    await (await nativeStorage()).removeItem(key);
  },
  async multiRemove(keys: string[]): Promise<void> {
    if (isWeb) { webStorage().multiRemove(keys); return; }
    await (await nativeStorage()).multiRemove(keys);
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    if (isWeb) return webStorage().multiGet(keys);
    return (await nativeStorage()).multiGet(keys);
  },
  async getAllKeys(): Promise<string[]> {
    if (isWeb) return webStorage().getAllKeys();
    return (await nativeStorage()).getAllKeys();
  },
  async mergeItem(key: string, value: string): Promise<void> {
    if (isWeb) { webStorage().mergeItem(key, value); return; }
    await (await nativeStorage()).mergeItem(key, value);
  },
};
