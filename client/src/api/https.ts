import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const http = axios.create({
  baseURL: base,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const sid = localStorage.getItem("session_id");
  if (sid) {
    config.headers = config.headers ?? {};
    config.headers["X-Session-ID"] = sid;
  }
  return config;
});
