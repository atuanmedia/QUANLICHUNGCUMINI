// frontend/src/pages/UnauthorizedPage.jsx
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚫 Không có quyền truy cập</h1>
      <p>Bạn không được phép truy cập trang này.</p>
      <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
        Quay lại trang đăng nhập
      </Link>
    </div>
  );
}
