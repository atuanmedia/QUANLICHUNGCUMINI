import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/common/Spinner";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  HomeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Import axios instance có interceptor (gắn token tự động)
import api from "../../api/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 📊 Component hiển thị từng thẻ thống kê nhỏ
const StatCard = ({ title, value, icon, linkTo }) => (
  <Link
    to={linkTo}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
  >
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value !== undefined && value !== null ? value : 0}
        </p>
      </div>
    </div>
  </Link>
);

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    residents: { total: 0 },
    apartments: { total: 0, occupied: 0 },
    invoices: { unpaid: 0 },
    reports: { pending: 0 },
    financials: { totalRevenue: 0, totalDebt: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Gọi API thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("📊 [Dashboard] Fetching admin stats...");

        // ✅ Gọi qua api instance để tự động gắn token admin_token
        const { data } = await api.get("/reports/stats");

        console.log("📈 [Dashboard] API response:", data);

        // Gán giá trị mặc định = 0 nếu rỗng
        setStats({
          residents: { total: data?.residents?.total ?? 0 },
          apartments: {
            total: data?.apartments?.total ?? 0,
            occupied: data?.apartments?.occupied ?? 0,
          },
          invoices: { unpaid: data?.invoices?.unpaid ?? 0 },
          reports: { pending: data?.reports?.pending ?? 0 },
          financials: {
            totalRevenue: data?.financials?.totalRevenue ?? 0,
            totalDebt: data?.financials?.totalDebt ?? 0,
          },
        });
      } catch (err) {
        console.error("❌ Error fetching dashboard stats:", err);
        setError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user]);

  if (loading) return <Spinner />;

  if (error)
    return (
      <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">
        {error}
      </p>
    );

  // ✅ Biểu đồ tổng quan tài chính
  const financialOverviewData = {
    labels: ["Tổng thu", "Tổng nợ"],
    datasets: [
      {
        label: "Tổng quan tài chính (VND)",
        data: [
          stats?.financials?.totalRevenue ?? 0,
          stats?.financials?.totalDebt ?? 0,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const financialOverviewOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Tổng quan tài chính (VNĐ)" },
    },
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Bảng điều khiển</h1>

      {/* Thẻ thống kê */}
      <div className="dashboard-grid">
        <Link to="/admin/residents" className="stat-card">
          <div className="stat-icon">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Tổng số cư dân</p>
            <p>{stats?.residents?.total ?? 0}</p>
          </div>
        </Link>

        <Link to="/admin/apartments" className="stat-card">
          <div className="stat-icon">
            <HomeIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Căn hộ có người ở</p>
            <p>
              {`${stats?.apartments?.occupied ?? 0} / ${
                stats?.apartments?.total ?? 0
              }`}
            </p>
          </div>
        </Link>

        <Link to="/admin/invoices" className="stat-card">
          <div className="stat-icon">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Hóa đơn chưa thanh toán</p>
            <p>{stats?.invoices?.unpaid ?? 0}</p>
          </div>
        </Link>

        <Link to="/admin/reports" className="stat-card">
          <div className="stat-icon">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Báo cáo chờ xử lý</p>
            <p>{stats?.reports?.pending ?? 0}</p>
          </div>
        </Link>
      </div>

      {/* Biểu đồ */}
      <div className="chart-card">
        <h2 className="text-xl font-semibold mb-4">Tổng quan tài chính</h2>
        <Bar data={financialOverviewData} options={financialOverviewOptions} />
      </div>
    </div>
  );
};

export default DashboardAdmin;
