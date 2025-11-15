// src/lib/api.js
import axios from "axios";
import { API_KEY, BASE_URL } from "../utils/env";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  config.headers.apiKey = API_KEY;
  config.headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
