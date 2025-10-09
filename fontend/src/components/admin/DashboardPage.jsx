import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import {
    UsersIcon,
    HomeIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import '../../styles/admin/componentadmin.css'; // 👈 CSS riêng

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Component StatCard
const StatCard = ({ title, value, icon, linkTo }) => (
    <Link to={linkTo} className="stat-card">
        <div className="flex items-center">
            <div className="stat-icon">{icon}</div>
            <div className="ml-4">
                <p className="stat-title">{title}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    </Link>
);

const DashboardAdmin = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                // Endpoint backend trả dữ liệu tổng quan
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/reports/stats`,
                    config
                );
                setStats(data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Không thể tải dữ liệu tổng quan.');
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>;
    }

    // Data cho chart
    const financialOverviewData = {
        labels: ['Tổng thu', 'Tổng nợ'],
        datasets: [
            {
                label: 'Tổng quan tài chính (VND)',
                data: [
                    stats?.financials.totalRevenue || 0,
                    stats?.financials.totalDebt || 0,
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Bảng điều khiển</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tổng số cư dân"
                    value={stats?.residents.total || 0}
                    icon={<UsersIcon className="h-6 w-6" />}
                    linkTo="/admin/residents"
                />
                <StatCard
                    title="Căn hộ có người ở"
                    value={`${stats?.apartments.occupied || 0} / ${
                        stats?.apartments.total || 0
                    }`}
                    icon={<HomeIcon className="h-6 w-6" />}
                    linkTo="/admin/apartments"
                />
                <StatCard
                    title="Hóa đơn chưa thanh toán"
                    value={stats?.invoices.unpaid || 0}
                    icon={<DocumentTextIcon className="h-6 w-6" />}
                    linkTo="/admin/invoices"
                />
                <StatCard
                    title="Báo cáo chờ xử lý"
                    value={stats?.reports.pending || 0}
                    icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                    linkTo="/admin/reports"
                />
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="chart-card">
                    <h2 className="chart-title">Tổng quan tài chính</h2>
                    {stats && (
                        <div style={{ height: '400px' }}>
                            <Bar
                                data={financialOverviewData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                    },
                                    animation: {
                                        duration: 1200,
                                        easing: 'easeOutQuart',
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
