// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
});

api.interceptors.request.use((config) => {
  config.headers.apiKey = "24405e01-fbc1-45a5-9f5a-be13afcd757c";
  config.headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
