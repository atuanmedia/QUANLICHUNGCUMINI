import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    UsersIcon, 
    BuildingOfficeIcon, 
    ReceiptPercentIcon, 
    MegaphoneIcon, 
    ChartBarIcon, 
    ArrowLeftEndOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin/componentadmin.css'; // 👈 Import CSS riêng

const AdminSidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', icon: HomeIcon, path: '/admin/dashboard' },
        { name: 'Cư dân', icon: UsersIcon, path: '/admin/residents' },
        { name: 'Căn hộ', icon: BuildingOfficeIcon, path: '/admin/apartments' },
        { name: 'Hóa đơn', icon: ReceiptPercentIcon, path: '/admin/invoices' },
        { name: 'Phản ánh', icon: ChartBarIcon, path: '/admin/reports' },
        { name: 'Thông báo', icon: MegaphoneIcon, path: '/admin/announcements' },
        { name: 'Tạm trú / Tạm vắng', icon: MegaphoneIcon, path: '/admin/temp-residence' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <img src="/logo.jpg" alt="Logo" className="sidebar-logo-img" />
                <span className="sidebar-logo-text">Chung cư Mini</span>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <item.icon className="sidebar-icon" />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="sidebar-link logout-btn">
                    <ArrowLeftEndOnRectangleIcon className="sidebar-icon" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
