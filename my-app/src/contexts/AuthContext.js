// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { introspectAPI, loginAPI, logoutAPI } from "../config/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // { name, email, roles[] } | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await introspectAPI();
        if (r?.valid) {
          const cachedStr = localStorage.getItem("auth_user");
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            // migrate: nếu chưa có email, ghép từ remember_email
            if (!cached.email) {
              const rem = localStorage.getItem("remember_email");
              if (rem) {
                cached.email = rem;
                localStorage.setItem("auth_user", JSON.stringify(cached));
              }
            }
            setUser(cached);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    const res = await loginAPI({ email, password }); // BE set cookie AUTH
    const u = {
      name: res?.name ?? email,
      email, // <— LƯU EMAIL Ở ĐÂY
      roles: Array.isArray(res?.roles)
        ? res.roles
        : (res?.roles ? String(res.roles).split(",").map(s => s.trim()) : []),
    };
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  const logout = async () => {
    try { await logoutAPI(); } finally {
      setUser(null);
      localStorage.removeItem("auth_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
