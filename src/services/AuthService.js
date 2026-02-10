import axios from "axios";
import baseURL from "../config/api";

const STORAGE_KEY_TOKEN = "sps_auth_token";
const STORAGE_KEY_USER = "sps_auth_user";

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

/**
 * Obtém o usuário armazenado (id, type, etc.) para regras de permissão.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY_USER);
}

/**
 * Faz login na API. Espera: POST /auth/login com { email, password }.
 * Retorna { token, user } em sucesso. A API deve retornar user (id, type, email, nome) para controle de permissão.
 */
export async function login(email, password) {
  const { data } = await axios.post(`${baseURL}/auth/login`, {
    email: email.trim(),
    password,
  });
  const token = data?.token;
  if (!token) {
    throw new Error("Resposta da API sem token");
  }
  setStoredToken(token);
  const user = data?.user ?? null;
  setStoredUser(user);
  return { token, user };
}

/**
 * Faz logout apenas no cliente (remove token e usuário).
 */
export function logout() {
  clearStoredToken();
  clearStoredUser();
}
