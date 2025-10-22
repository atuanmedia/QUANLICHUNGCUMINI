import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ===============================
  // 🧩 Load user khi mở trang
  // ===============================
  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        const isAdmin = window.location.pathname.startsWith("/admin");
        const tokenKey = isAdmin ? "admin_token" : "resident_token";
        const expiresKey = `${tokenKey}_expiresAt`;

        const token = localStorage.getItem(tokenKey);
        const expiresAt = localStorage.getItem(expiresKey);

        // ⚠️ Nếu token hết hạn hoặc thiếu → logout
        if (!token || (expiresAt && Date.now() > parseInt(expiresAt))) {
          console.warn("⚠️ Token expired or missing");
          logout(isAdmin, true); // true = silent (không toast lại)
          return;
        }

        // ✅ Token còn hạn → load profile
        const { data } = await api.get(`/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ [Auth Init] Loaded user:", data);
        setUser(data);
      } catch (error) {
        console.error("❌ [Auth Init] Failed to load user:", error);
        logout(undefined, true);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, [API_BASE_URL]);

  // ===============================
  // 🧩 Login
  // ===============================
  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        `/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const role = data.user?.role || data.role;
      const token = data.token;
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút

      if (role === "admin") {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_token_expiresAt", expiresAt);
        navigate("/admin/dashboard");
      } else if (role === "resident") {
        localStorage.setItem("resident_token", token);
        localStorage.setItem("resident_token_expiresAt", expiresAt);
        navigate("/");
      } else {
        console.warn("⚠️ [Login] Unknown role:", role);
        navigate("/unauthorized");
      }

      setUser(data.user || data);
      return data;
    } catch (error) {
      console.error("❌ [Login] Failed:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  // ===============================
  // 🧩 Logout
  // ===============================
  const logout = (forceAdmin, silent = false) => {
    const isAdmin = forceAdmin ?? window.location.pathname.startsWith("/admin");

    if (isAdmin) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_expiresAt");
    } else {
      localStorage.removeItem("resident_token");
      localStorage.removeItem("resident_token_expiresAt");
    }

    setUser(null);

    if (!silent) {
      toast.info("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }

    navigate(isAdmin ? "/admin/login" : "/login");
  };

  // ===============================
  // ⏰ Auto logout sau 10 phút không thao tác
  // ===============================
  useEffect(() => {
    if (!user) return;

    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        toast.warn("⏰ Bạn đã không hoạt động trong 10 phút. Phiên đăng nhập kết thúc!", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
        logout();
      }, 10 * 60 * 1000);
    };

    // Theo dõi hành vi người dùng
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onkeypress = resetTimer;
    window.onclick = resetTimer;
    window.onscroll = resetTimer;

    resetTimer();

    return () => clearTimeout(timeout);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
