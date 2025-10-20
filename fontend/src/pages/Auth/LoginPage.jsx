import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/admin-login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "resident") navigate("/");
      else navigate("/unauthorized");
    }
  }, [user, authLoading, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      const role = res?.user?.role || res?.role;

      if (isAdminLogin && role !== "admin") {
        setError("🚫 Tài khoản này không có quyền truy cập trang quản trị.");
        setLoading(false);
        return;
      }
      if (!isAdminLogin && role !== "resident") {
        setError("🚫 Trang này chỉ dành cho cư dân.");
        setLoading(false);
        return;
      }

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "resident") navigate("/");
      else navigate("/unauthorized");
    } catch (err) {
      console.error("❌ [LoginPage] Lỗi:", err);
      setError("❌ Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      {/* 🔹 Header */}
      <header className="landing-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Logo" />
          <span>AT APARTMENT</span>
        </div>
        <nav>
          <Link to="/about">Giới thiệu</Link>
          <a href="#features">Tính năng</a>
          <a href="#contact">Liên hệ</a>
          <button className="login-open-btn" onClick={() => setShowModal(true)}>
            Đăng nhập
          </button>
        </nav>
      </header>

      {/* 🔹 Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1>QUẢN LÝ CHUNG CƯ MINI THÔNG MINH</h1>
          <p>
            Hệ thống giúp chủ trọ và cư dân quản lý phòng, hóa đơn, thông tin dễ dàng – mọi lúc, mọi nơi.
          </p>
          <button className="hero-btn" onClick={() => setShowModal(true)}>
            Bắt đầu ngay
          </button>
        </div>
      </section>

      {/* 🪟 Popup Login */}
      {showModal && (
        <div className="login-popup-overlay" onClick={() => setShowModal(false)}>
          <div className="login-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowModal(false)}>
              ✕
            </button>

            <img src="/logo.jpg" alt="Logo" className="login-logo" />
            <h2 className="login-title">
              {isAdminLogin ? "Đăng nhập Quản trị viên" : "Đăng nhập Cư dân"}
            </h2>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={submitHandler}>
              <input
                type="email"
                placeholder="Email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "⏳ Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
