import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AdminLayout from './components/admin/AdminLayout';
import ResidentLayout from './components/client/ResidentLayout';
import LoginPage from './pages/Auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import Spinner from './components/common/Spinner';
import UnauthorizedPage from './pages/UnauthorizedPage';


// Admin Pages
import DashboardAdmin from './pages/Admin/DashboardAdmin';
import ApartmentManagement from './pages/Admin/ApartmentManagement';
import ResidentManagement from './pages/Admin/ResidentManagement';
import AnnouncementManagement from './pages/Admin/AnnouncementManagement';
import InvoiceManagement from './pages/Admin/InvoiceManagement';
import ReportManagement from './pages/Admin/ReportManagement';
import TempResidenceAdmin from './pages/Admin/TempResidenceAdmin';

// Resident Pages
import DashboardResident from './pages/Resident/DashboardResident';
import ResidentAnnouncements from './pages/Resident/ResidentAnnouncements';
import ResidentInvoices from './pages/Resident/ResidentInvoices';
import ResidentReports from './pages/Resident/ResidentReports';
import TempResidenceResident from './pages/Resident/TempResidenceResident';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />; // Or a dedicated unauthorized page
    }

    return children;
};


function App() {
    return (
        <Routes>
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />


            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
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
            </Route>

            {/* Resident Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={['resident']}>
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


            </Route>

            {/* Fallback Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;