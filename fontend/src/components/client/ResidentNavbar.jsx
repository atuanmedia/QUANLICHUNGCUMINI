import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BellIcon,
  ReceiptPercentIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { Transition } from "@headlessui/react";

const ResidentNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Trang chủ", icon: HomeIcon, path: "/dashboard" },
    { name: "Thông báo", icon: BellIcon, path: "/announcements" },
    { name: "Hóa đơn", icon: ReceiptPercentIcon, path: "/invoices" },
    { name: "Phản ánh", icon: ChatBubbleLeftRightIcon, path: "/reports" },
    { name: "Khai báo", icon: ClipboardDocumentListIcon, path: "/temp-residence" },
    { name: "Hỗ trợ", icon: LifebuoyIcon, path: "/support" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false); // Đóng menu mobile khi logout
  };

  // Hàm đóng menu khi click vào link
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="resident-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo" onClick={handleNavClick}>
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-semibold text-lg">Cổng cư dân</span>
        </Link>

        {/* Menu Desktop */}
        <div className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`navlink ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* User Info & Logout - Desktop */}
          <div className="navbar-user">
            <div className="user-name">
              <UserCircleIcon className="h-5 w-5 inline mr-1" />
              {user?.name || "Cư dân"}
            </div>
            <button
              onClick={handleLogout}
              className="logout-link"
              aria-label="Đăng xuất"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu với Transition */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="mobile-menu md:hidden">
          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`navlink mobile ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* User Info & Logout - Mobile */}
          <div className="border-t border-gray-200 mt-2 pt-3">
            <div className="flex items-center px-3 py-2 text-gray-700">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{user?.name || "Cư dân"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn w-full mt-1"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default ResidentNavbar;