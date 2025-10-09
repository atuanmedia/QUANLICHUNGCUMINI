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
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { Transition } from "@headlessui/react";

const ResidentNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔹 Các mục trong thanh menu
  const navItems = [
    { name: "Trang chủ", icon: HomeIcon, path: "/dashboard" },
    { name: "Thông báo", icon: BellIcon, path: "/announcements" },
    { name: "Hóa đơn", icon: ReceiptPercentIcon, path: "/invoices" },
    { name: "Phản ánh", icon: ChatBubbleLeftRightIcon, path: "/reports" },
    // ✅ Thêm tab “Tạm trú / Tạm vắng”
    { name: "Tạm trú / Tạm vắng", icon: ClipboardDocumentListIcon, path: "/temp-residence" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#0c4a6e] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔹 Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
            <span className="font-semibold text-lg tracking-wide">
              Chung cư Mini
            </span>
          </Link>

          {/* 🔹 Menu Desktop */}
          <div className="hidden md:flex space-x-2 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-[#0369a1] text-white shadow-inner border-b-2 border-yellow-400"
                    : "text-gray-200 hover:bg-[#0369a1] hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 mr-1" />
                {item.name}
              </Link>
            ))}

            {/* 🔹 User Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                <UserCircleIcon className="h-6 w-6 mr-1" />
                {user?.name || "Cư dân"}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 Nút Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-[#0369a1] focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Menu Mobile */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-150 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden bg-[#075985] px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? "bg-[#0369a1] text-white border-l-4 border-yellow-400"
                  : "text-gray-300 hover:bg-[#0369a1] hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.name}
            </Link>
          ))}

          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center text-gray-300 hover:bg-[#0369a1] hover:text-white px-3 py-2 rounded-md text-base font-medium"
          >
            <UserCircleIcon className="h-5 w-5 mr-2" />
            Thông tin cá nhân
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center text-gray-300 hover:bg-[#0369a1] hover:text-white px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            <ArrowLeftEndOnRectangleIcon className="h-5 w-5 mr-2 text-red-400" />
            Đăng xuất
          </button>
        </div>
      </Transition>
    </nav>
  );
};

export default ResidentNavbar;
