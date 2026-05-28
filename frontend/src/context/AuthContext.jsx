import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    }
  };

  const refreshSession = async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      if (data?.token) localStorage.setItem("token", data.token);
      return true;
    } catch {
      localStorage.removeItem("token");
      return false;
    }
  };

  const bootstrapSession = async () => {
    try {
      const hasToken = Boolean(localStorage.getItem("token"));
      if (hasToken) {
        const currentUser = await loadMe();
        if (currentUser) return;
      }

      const refreshed = await refreshSession();
      if (refreshed) await loadMe();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const hydrateFromToken = async (token) => {
    localStorage.setItem("token", token);
    await loadMe();
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, forgotPassword, resetPassword, hydrateFromToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
