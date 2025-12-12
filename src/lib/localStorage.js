// src/lib/localStorage.js
// Safe localStorage helper with optional namespacing and sessionStorage fallback

const PREFIX =
  (typeof process !== "undefined" &&
    process &&
    process.env &&
    process.env.REACT_APP_LOCALSTORAGE_PREFIX) ||
  (typeof window !== "undefined" && window?.__APP_LOCALSTORAGE_PREFIX__) ||
  "APP";

const prefixedKey = (key) => `${PREFIX}:${key}`;

const tryParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export function lsSet(key, value) {
  try {
    const v = value === undefined ? null : value;
    const s = typeof v === "string" ? v : JSON.stringify(v);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(prefixedKey(key), s);
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * lsGet: return value from prefixed localStorage key,
 * fallback to raw localStorage key, then fallback to sessionStorage raw key.
 */
export function lsGet(key, fallback = null) {
  try {
    if (typeof window === "undefined") return fallback;

    // 1) prefixed localStorage
    if (window.localStorage) {
      const pref = window.localStorage.getItem(prefixedKey(key));
      if (pref !== null) return tryParse(pref);
    }

    // 2) raw localStorage (backward compatibility)
    if (window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return tryParse(raw);
    }

    // 3) sessionStorage fallback (for non-remember-me tokens)
    if (window.sessionStorage) {
      const sessRaw = window.sessionStorage.getItem(key);
      if (sessRaw !== null) return tryParse(sessRaw);
    }

    return fallback;
  } catch (err) {
    return fallback;
  }
}

export function lsRemove(key) {
  try {
    if (typeof window === "undefined") return false;
    if (window.localStorage) {
      window.localStorage.removeItem(prefixedKey(key));
      window.localStorage.removeItem(key);
    }
    if (window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export function lsClear(prefixOnly = true) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    if (!prefixOnly) {
      window.localStorage.clear();
      return true;
    }
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`${PREFIX}:`)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    return true;
  } catch (err) {
    return false;
  }
}

export default { set: lsSet, get: lsGet, remove: lsRemove, clear: lsClear };

