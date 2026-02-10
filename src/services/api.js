import axios from "axios";
import baseURL from "../config/api";
import { getStoredToken } from "./AuthService";

const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado – o AuthContext pode reagir se necessário
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
