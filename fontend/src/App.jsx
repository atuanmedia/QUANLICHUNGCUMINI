import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 🧩 Common components
import Spinner from "./components/common/Spinner";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

// 🏢 Layouts
import AdminLayout from "./components/admin/AdminLayout";
import ResidentLayout from "./components/client/ResidentLayout";
import LoginPage from "./pages/Auth/LoginPage";

// 📁 Admin pages
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import ApartmentManagement from "./pages/Admin/ApartmentManagement";
import ResidentManagement from "./pages/Admin/ResidentManagement";
import AnnouncementManagement from "./pages/Admin/AnnouncementManagement";
import InvoiceManagement from "./pages/Admin/InvoiceManagement";
import ReportManagement from "./pages/Admin/ReportManagement";
import TempResidenceAdmin from "./pages/Admin/TempResidenceAdmin";
import ChatSupport from "./pages/Admin/ChatSupport";

// 🏠 Resident pages
import DashboardResident from "./pages/Resident/DashboardResident";
import ResidentAnnouncements from "./pages/Resident/ResidentAnnouncements";
import ResidentInvoices from "./pages/Resident/ResidentInvoices";
import ResidentReports from "./pages/Resident/ResidentReports";
import TempResidenceResident from "./pages/Resident/TempResidenceResident";
import Support from "./pages/Resident/Support";

// 🌟 Public pages
import AboutPage from "./pages/Resident/AboutPage";

// ✅ Hiệu ứng fade chuyển trang
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: "easeIn" } },
};

// ✅ Route bảo vệ
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

// ✅ NProgress khi đổi route
const RouteChangeProgress = () => {
  const location = useLocation();
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 400);
    return () => clearTimeout(timer);
  }, [location]);
  return null;
};

function App() {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, []);

  return (
    <>
      <RouteChangeProgress />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme={theme === "dark" ? "dark" : "colored"}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen transition-all duration-300"
        >
          <Routes location={location} key={location.pathname}>
            {/* 🔐 Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* 🏢 Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="apartments" element={<ApartmentManagement />} />
              <Route path="residents" element={<ResidentManagement />} />
              <Route path="announcements" element={<AnnouncementManagement />} />
              <Route path="invoices" element={<InvoiceManagement />} />
              <Route path="reports" element={<ReportManagement />} />
              <Route path="temp-residence" element={<TempResidenceAdmin />} />
              <Route path="chat-support" element={<ChatSupport />} />
            </Route>

            {/* 🏠 Resident routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["resident"]}>
                  <ResidentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardResident />} />
              <Route path="announcements" element={<ResidentAnnouncements />} />
              <Route path="invoices" element={<ResidentInvoices />} />
              <Route path="reports" element={<ResidentReports />} />
              <Route path="temp-residence" element={<TempResidenceResident />} />
              <Route path="support" element={<Support />} />
            </Route>

            {/* 🌟 Trang công khai */}
            <Route path="/about" element={<AboutPage />} />

            {/* ⚠️ Fallback */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;
