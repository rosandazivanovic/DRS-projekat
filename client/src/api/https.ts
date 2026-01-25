import axios, { AxiosHeaders } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const sid = localStorage.getItem("session_id");

  if (sid) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("X-Session-ID", sid);
  }

  return config;
});
