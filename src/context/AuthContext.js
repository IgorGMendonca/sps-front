import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  login as apiLogin,
  setStoredToken,
  setStoredUser,
} from "../services/AuthService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    setStoredToken(newToken);
    setStoredUser(newUser);
    setToken(newToken);
    setUser(newUser);
    return newToken;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearStoredUser();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.type === "admin";

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
    }),
    [token, user, isAuthenticated, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
