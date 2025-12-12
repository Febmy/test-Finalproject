// src/lib/api.js
import axios from "axios";
import { API_KEY, BASE_URL } from "../utils/env";
import { lsGet } from "./localStorage.js"; // pastikan helper mu ada dan berfungsi

// create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  // timeout: 10000, // opsional
});

/**
 * Request interceptor
 * - set apiKey header
 * - set Content-Type default (unless formdata)
 * - set Authorization dynamically by reading token at request time
 */
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // always include apiKey (if defined)
    if (API_KEY && !config.headers.apiKey) {
      config.headers.apiKey = API_KEY;
    }

    // attach token dynamically (read from helper which reads localStorage/sessionStorage)
    try {
      const token =
        typeof lsGet === "function"
          ? lsGet("token")
          : localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // ensure Authorization removed if none
        if (config.headers.Authorization) delete config.headers.Authorization;
      }
    } catch (e) {
      // ignore storage read errors
      if (config.headers.Authorization) delete config.headers.Authorization;
    }

    // If FormData, let browser set Content-Type + boundary
    if (config.data instanceof FormData) {
      if (config.headers["Content-Type"]) delete config.headers["Content-Type"];
    } else {
      // default for JSON calls
      if (!config.headers["Content-Type"])
        config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * - pass through normal responses
 * - handle errors: if backend returns 401 we could clear token (optional)
 * - DEV TEMP: intercept 404s for /carts and return a fake successful response
 *
 * IMPORTANT:
 * - The "carts" stub below is ONLY a development quick-fix to avoid 404 blocking local cart behavior.
 * - Remove the DEV TEMP block before production or when backend cart endpoints are available.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";

    // DEV TEMP: If request targets /carts and server returned 404, return a stubbed success response.
    // This prevents the UI from being blocked by missing backend cart endpoints while you use localStorage cart.
    // -------------------------------------------------------------------------
    if (/\/carts(\/|$)/.test(url) && error?.response?.status === 404) {
      // Determine a shape that your code expects. Common shapes:
      // - { data: [] }  or { data: { items: [], ... } }
      // Adjust below to match your app callers.
      const fakeData = {
        // example: return empty cart items list
        data: {
          items: [],
        },
      };

      const fakeResponse = {
        ...fakeData,
        status: 200,
        statusText: "OK (stubbed)",
        config: error.config,
        headers: {},
      };

      // resolve promise with fake response so callers proceed as if OK
      return Promise.resolve(fakeResponse);
    }
    // -------------------------------------------------------------------------

    // Optional: handle unauthorized globally
    if (error?.response?.status === 401) {
      try {
        // clear possible bad tokens (use your helper if you have lsRemove)
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("userProfile");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userProfile");
          } catch (e) {}
        }
      } catch (e) {}
      // optionally redirect to login here — but do it in app-level logic instead
    }

    return Promise.reject(error);
  }
);

export default api;
