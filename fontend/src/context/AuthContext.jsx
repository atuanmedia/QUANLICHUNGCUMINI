import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🧩 Load user từ token theo URL hiện tại
  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        const isAdmin = window.location.pathname.startsWith("/admin");
        const token = isAdmin
          ? localStorage.getItem("admin_token")
          : localStorage.getItem("resident_token");
        const role = isAdmin ? "admin" : "resident";

        console.log("🔍 [Auth Init] Path:", window.location.pathname);
        console.log("🔍 [Auth Init] isAdmin:", isAdmin, "| role:", role);
        console.log(
          "🔍 [Auth Init] token:",
          token ? token.slice(0, 30) + "..." : "null"
        );

        if (token) {
          const { data } = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("✅ [Auth Init] Loaded user:", data);
          setUser(data);
        } else {
          console.warn("⚠️ [Auth Init] No token found for this path");
        }
      } catch (error) {
        console.error("❌ [Auth Init] Failed to load user:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("resident_token");
      } finally {
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, [API_BASE_URL]);

  // 🧩 Hàm đăng nhập
  const login = async (email, password) => {
    console.log("🚀 [Login] Start:", email);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("🟢 [Login] Response:", data);

      const role = data.user?.role || data.role;
      console.log("🎯 [Login] Detected role:", role);

      if (role === "admin") {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin/dashboard");
      } else if (role === "resident") {
        localStorage.setItem("resident_token", data.token);
        navigate("/");
      } else {
        console.warn("⚠️ [Login] Unknown role:", role);
        navigate("/unauthorized");
      }

      setUser(data.user || data);
      return data;
    } catch (error) {
      console.error(
        "❌ [Login] Failed:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  // 🧩 Đăng xuất
  const logout = () => {
    const isAdmin = window.location.pathname.startsWith("/admin");
    if (isAdmin) {
      localStorage.removeItem("admin_token");
      console.log("🗑️ [Logout] Removed admin_token");
    } else {
      localStorage.removeItem("resident_token");
      console.log("🗑️ [Logout] Removed resident_token");
    }
    setUser(null);
    navigate(isAdmin ? "/admin/login" : "/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
