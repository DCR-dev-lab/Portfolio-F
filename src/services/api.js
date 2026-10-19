import axios from "axios";
import Cookies from "js-cookie";

const normalizeBaseUrl = (value = "http://localhost:3005/api") => {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:3005/api"),
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");

  if (token && !config.url.includes("/admin/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
