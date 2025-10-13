import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import "../../styles/admin/componentadmin.css";

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <span className="admin-icon">🏙️</span>
            <span className="admin-icon">🏢</span>
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>

          <div className="admin-header-right">
           

            <div className="welcome-badge">
              👋 Chào mừng, Admin!
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
