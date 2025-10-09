import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import '../../styles/admin/componentadmin.css'; // 👈 import css riêng

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <header className="admin-header">
                    <h1 className="admin-title">🏢 Admin Dashboard</h1>
                    <div className="admin-user">
                        <span className="admin-welcome">👋 Chào mừng, Admin!</span>
                    </div>
                </header>
                <main className="admin-content">
                    <Outlet /> {/* Render các trang con */}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
