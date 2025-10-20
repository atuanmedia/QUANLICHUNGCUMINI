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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../../api/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    residents: { total: 0 },
    apartments: { total: 0, occupied: 0 },
    invoices: { unpaid: 0 },
    reports: { pending: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/reports/stats");
        setStats({
          residents: { total: data?.residents?.total ?? 0 },
          apartments: {
            total: data?.apartments?.total ?? 0,
            occupied: data?.apartments?.occupied ?? 0,
          },
          invoices: { unpaid: data?.invoices?.unpaid ?? 0 },
          reports: { pending: data?.reports?.pending ?? 0 },
        });
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
        setError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRecent = async () => {
      try {
        const { data } = await api.get("/reports/recent"); // API giả định
        setRecentActivities(data || []);
      } catch {
        setRecentActivities([
          { id: 1, text: "🧾 Cư dân Phòng 203 vừa thanh toán hóa đơn tháng 10" },
          { id: 2, text: "🚨 Báo cáo sự cố mới: Rò rỉ nước tại tầng 3" },
          { id: 3, text: "📢 Thông báo bảo trì điện tầng 2 - ngày 22/10" },
        ]);
      }
    };

    if (user && user.role === "admin") {
      fetchStats();
      fetchRecent();
    }
  }, [user]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">
        {error}
      </p>
    );

  // ✅ Biểu đồ doanh thu giả định (demo)
  const monthlyRevenueData = {
    labels: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10"],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: [21000000, 25000000, 28000000, 32000000, 29000000, 35000000, 33000000, 37000000, 39000000, 42000000],
        borderColor: "rgba(245, 214, 108, 1)",
        backgroundColor: "rgba(245, 214, 108, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyRevenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "📈 Doanh thu theo tháng (VNĐ)" },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        ticks: {
          callback: (value) => value.toLocaleString("vi-VN") + "₫",
        },
      },
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
              {`${stats?.apartments?.occupied ?? 0} / ${stats?.apartments?.total ?? 0
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

      {/* Biểu đồ Doanh thu */}
      <div className="chart-card">
        <h2 className="text-xl font-semibold mb-4">Tổng quan hoạt động</h2>
        <div style={{ height: "350px" }}>
          <Line data={monthlyRevenueData} options={monthlyRevenueOptions} />
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="chart-card mt-6">
        <h2 className="chart-title">Hoạt động gần đây</h2>
        <ul className="recent-activity-list">
          {recentActivities.map((item) => (
            <li key={item.id} className="recent-activity-item">
              <span className="activity-icon">{item.text.split(" ")[0]}</span>
              <span className="activity-text">{item.text.slice(2)}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default DashboardAdmin;
