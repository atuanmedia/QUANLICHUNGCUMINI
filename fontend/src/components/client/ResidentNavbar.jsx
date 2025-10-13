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
  LifebuoyIcon, // icon cho "Hỗ trợ"
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
    { name: "Khai báo", icon: ClipboardDocumentListIcon, path: "/temp-residence" },
    { name: "Hỗ trợ", icon: LifebuoyIcon, path: "/support" }, // ✅ thêm mục Hỗ trợ
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔹 Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-semibold text-lg text-gray-800">Cổng cư dân</span>
          </Link>

          {/* 🔹 Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-900 font-semibold shadow-sm border-b-2 border-yellow-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                }`}
              >
                <item.icon className="h-5 w-5 mr-1" />
                {item.name}
              </Link>
            ))}

            {/* 🔹 User Info + Logout */}
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-300">
              <div className="flex items-center text-gray-800 font-medium">
                <UserCircleIcon className="h-6 w-6 mr-1" />
                {user?.name || "Cư dân"}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-500 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* 🔹 Nút mở menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-800" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-800" />
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
        <div className="md:hidden bg-white shadow-lg px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-900 border-l-4 border-yellow-400"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.name}
            </Link>
          ))}

          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex items-center px-3 py-2 text-gray-800">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              {user?.name || "Cư dân"}
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-base font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default ResidentNavbar;
