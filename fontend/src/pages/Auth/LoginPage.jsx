import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/admin-login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, login, loading: authLoading } = useAuth(); // lấy loading từ context nếu có
  const navigate = useNavigate();

  // 🔁 Điều hướng theo vai trò sau khi đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "resident") {
        navigate("/");
      } else {
        navigate("/unauthorized");
      }
    }
  }, [user, authLoading, navigate]);

  // 🧩 Xử lý đăng nhập
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.jpg" alt="Logo" className="login-logo" />
        <h2 className="login-title">ATGroup-Real Estat </h2>

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

        <p style={{ marginTop: "1rem", fontSize: "14px", color: "#4b5563" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" className="login-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
