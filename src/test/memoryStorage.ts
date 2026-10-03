/** Isolated browser storage for tests (Node's experimental localStorage is not used). */
export function createMemoryStorage(): Storage {
    const entries = new Map<string, string>();
    return {
        get length() { return entries.size; },
        clear: () => entries.clear(),
        getItem: key => entries.get(key) ?? null,
        key: index => Array.from(entries.keys())[index] ?? null,
        removeItem: key => { entries.delete(key); },
        setItem: (key, value) => { entries.set(key, String(value)); },
    };
}
