import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import "../../styles/admin/componentadmin.css";
import AIChatBox from "../../components/AIChatBox"; // 💬 Trợ lý ảo AI

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [showChat, setShowChat] = useState(false); // 🔘 Bật/tắt chatbot

  return (
    <div className={`admin-layout ${theme}`}>
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <span className="admin-icon">🏙️</span>
            <span className="admin-icon">🏢</span>
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>

          <div className="admin-header-right">
            <div className="welcome-badge">👋 Chào mừng, Admin!</div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* 🔘 Nút bật/tắt Chatbot */}
      <button
        className="chat-toggle-btn"
        onClick={() => setShowChat(!showChat)}
        title={showChat ? "Ẩn trợ lý ảo" : "Hiện trợ lý ảo"}
      >
        💬
      </button>

      {/* 💬 Chatbot nổi */}
      {showChat && (
        <div className="floating-ai-chat">
          <AIChatBox />
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
