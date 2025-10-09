import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🧩 Interceptor luôn đọc token mới nhất từ localStorage
api.interceptors.request.use((config) => {
  try {
    const path = window.location.pathname;
    const isAdmin = path.startsWith("/admin");

    // Luôn đọc lại mỗi request (tránh cache)
    const adminToken = localStorage.getItem("admin_token");
    const residentToken = localStorage.getItem("resident_token");
    const token = isAdmin ? adminToken : residentToken;

    console.log(
      "📡 [API Interceptor]",
      "| path:", path,
      "| isAdmin:", isAdmin,
      "| admin_token:", adminToken ? adminToken.slice(0, 20) + "..." : "null",
      "| resident_token:", residentToken ? residentToken.slice(0, 20) + "..." : "null"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ [API] Không có token hợp lệ => gửi request không xác thực");
    }
  } catch (err) {
    console.error("❌ [API Interceptor error]:", err);
  }

  return config;
});

export default api;
