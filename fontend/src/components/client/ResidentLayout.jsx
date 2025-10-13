import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Transition } from "@headlessui/react";
import {
  HomeIcon,
  BellIcon,
  ReceiptPercentIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon,
  ClipboardDocumentListIcon,
  LifebuoyIcon, // ✅ Icon Hỗ trợ
} from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/client/componentclient.css";

const ResidentLayout = () => {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const location = useLocation();

  const bannerImages = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="resident-layout">
      {/* NAVBAR */}
      <nav className="resident-navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            <img src="/logo.jpg" alt="Logo" />
            <span>Cổng cư dân</span>
          </Link>

          {/* Desktop menu */}
          <div className="navbar-menu">
            <NavLink
              to="/dashboard"
              icon={HomeIcon}
              text="Trang chủ"
              active={isActive("/dashboard")}
            />
            <NavLink
              to="/announcements"
              icon={BellIcon}
              text="Thông báo"
              active={isActive("/announcements")}
            />
            <NavLink
              to="/invoices"
              icon={ReceiptPercentIcon}
              text="Hóa đơn"
              active={isActive("/invoices")}
            />
            <NavLink
              to="/reports"
              icon={ChatBubbleLeftRightIcon}
              text="Phản ánh"
              active={isActive("/reports")}
            />
            <NavLink
              to="/temp-residence"
              icon={ClipboardDocumentListIcon}
              text="Khai báo"
              active={isActive("/temp-residence")}
            />

            {/* ✅ Thêm mục Hỗ trợ */}
            <NavLink
              to="/support"
              icon={LifebuoyIcon}
              text="Hỗ trợ"
              active={isActive("/support")}
            />

            {/* User info */}
            <div className="navbar-user">
              <FontAwesomeIcon
                icon={faCircleUser}
                className="text-accent"
                style={{ fontSize: 30 }}
              />
              <span className="user-name">{user?.name || "Cư dân"}</span>
              <button type="button" className="logout-link" onClick={logout}>
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  style={{ fontSize: 28, color: "red" }}
                />
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <Transition
          show={mobileMenuOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="mobile-menu">
            <NavLink
              to="/dashboard"
              icon={HomeIcon}
              text="Trang chủ"
              mobile
              active={isActive("/dashboard")}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <NavLink
              to="/announcements"
              icon={BellIcon}
              text="Thông báo"
              mobile
              active={isActive("/announcements")}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <NavLink
              to="/invoices"
              icon={ReceiptPercentIcon}
              text="Hóa đơn"
              mobile
              active={isActive("/invoices")}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <NavLink
              to="/reports"
              icon={ChatBubbleLeftRightIcon}
              text="Phản ánh"
              mobile
              active={isActive("/reports")}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <NavLink
              to="/temp-residence"
              icon={ClipboardDocumentListIcon}
              text="Khai báo"
              mobile
              active={isActive("/temp-residence")}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            {/* ✅ Hỗ trợ Mobile */}
            <NavLink
              to="/support"
              icon={LifebuoyIcon}
              text="Hỗ trợ"
              mobile
              active={isActive("/support")}
              onNavigate={() => setMobileMenuOpen(false)}
            />

            <button
              type="button"
              className="logout-btn"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </Transition>
      </nav>

      {/* BANNER */}
      <div className="banner-container">
        {bannerImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`banner-${i + 1}`}
            className={`banner-image ${i === currentBanner ? "active" : "hidden"}`}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ))}
        <div className="banner-overlay">
          <h1>Chào mừng đến với Chung cư Mini</h1>
          <p>Kết nối cư dân – Nâng tầm cuộc sống</p>
        </div>
      </div>

      {/* CONTENT */}
      <main className="resident-content">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="resident-footer">
        © {new Date().getFullYear()} Hệ thống Quản lý Chung cư Mini
      </footer>
    </div>
  );
};

const NavLink = ({ to, icon: Icon, text, active, mobile = false, onNavigate }) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={`navlink ${active ? "active" : ""} ${mobile ? "mobile" : ""}`}
  >
    <Icon className="h-5 w-5" />
    {text}
  </Link>
);

export default ResidentLayout;
