import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/admin-login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Xác định xem đang ở trang admin login hay resident login
  const isAdminLogin = location.pathname.startsWith("/admin");

  // 🔁 Nếu đã đăng nhập, điều hướng theo role
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "resident") navigate("/");
      else navigate("/unauthorized");
    }
  }, [user, authLoading, navigate]);

  // 🧩 Xử lý đăng nhập
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      const role = res?.user?.role || res?.role;

      console.log("🎯 [LoginPage] Role from response:", role);
      console.log("📍 [LoginPage] isAdminLogin:", isAdminLogin);

      // 🚫 Nếu vào sai trang login so với role
      if (isAdminLogin && role !== "admin") {
        setError("🚫 Tài khoản này không có quyền truy cập trang quản trị.");
        setLoading(false);
        return;
      }
      if (!isAdminLogin && role !== "resident") {
        setError("🚫 Trang này chỉ dành cho cư dân, không phải admin.");
        setLoading(false);
        return;
      }

      // ✅ Navigate sau login (AuthContext cũng có, nhưng để chắc chắn)
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "resident") navigate("/");
      else navigate("/unauthorized");

    } catch (err) {
      console.error("❌ [LoginPage] Đăng nhập lỗi:", err);
      setError("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
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

        {!isAdminLogin && (
          <p style={{ marginTop: "1rem", fontSize: "14px", color: "#4b5563" }}>
            Chưa có tài khoản?{" "}
            <Link to="/register" className="login-link">
              Đăng ký ngay
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
