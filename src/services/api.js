import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, ""),
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");

  if (token && !config.url.includes("/admin/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
