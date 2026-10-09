import { useSyncExternalStore } from "react";

const stores = new Map();

function parse(raw, fallback) {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function createStore(key, fallback) {
  const listeners = new Set();
  let cachedRaw;
  let cachedValue = fallback;

  // useSyncExternalStore needs a stable reference while the stored text is unchanged.
  const read = () => {
    let raw = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); fall back to defaults.
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw, fallback);
    }
    return cachedValue;
  };

  const write = (value) => {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignored for the same reason as in read().
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    const onStorage = (event) => {
      if (event.key === key || event.key === null) listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return { read, write, subscribe };
}

/** Returns the shared store for a localStorage key holding JSON. */
export function localStore(key, fallback = null) {
  if (!stores.has(key)) stores.set(key, createStore(key, fallback));
  return stores.get(key);
}

/** Subscribes a component to a store; `serverValue` is used until hydration finishes. */
export function useLocalStore(store, serverValue) {
  return useSyncExternalStore(store.subscribe, store.read, () => serverValue);
}
