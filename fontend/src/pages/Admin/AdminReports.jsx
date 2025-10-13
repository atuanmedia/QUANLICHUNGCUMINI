import React, { useEffect, useState } from 'react';
import axios from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminReports = () => {
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
                const { data } = await api.get(`/reports/stats`, config);
                setStats(data);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Không thể tải dữ liệu thống kê.");
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

    const apartmentStatusData = {
        labels: ['Đã có người ở', 'Còn trống'],
        datasets: [
            {
                label: 'Tình trạng căn hộ',
                data: [stats?.apartments.occupied, stats?.apartments.empty],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const invoiceStatusData = {
        labels: ['Đã thanh toán', 'Chưa thanh toán', 'Quá hạn'],
        datasets: [
            {
                label: 'Tình trạng hóa đơn',
                data: [stats?.invoices.paid, stats?.invoices.unpaid, stats?.invoices.overdue],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 159, 64, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)'],
                borderWidth: 1,
            },
        ],
    };
    
    const financialOverviewData = {
        labels: ['Tổng thu', 'Tổng nợ'],
        datasets: [
            {
                label: 'Tổng quan tài chính',
                data: [stats?.financials.totalRevenue, stats?.financials.totalDebt],
                backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Báo cáo & Thống kê</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Tình trạng căn hộ</h2>
                    {stats && <Pie data={apartmentStatusData} />}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Tình trạng hóa đơn</h2>
                    {stats && <Bar data={invoiceStatusData} />}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Tổng quan tài chính</h2>
                    {stats && <Bar data={financialOverviewData} />}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;