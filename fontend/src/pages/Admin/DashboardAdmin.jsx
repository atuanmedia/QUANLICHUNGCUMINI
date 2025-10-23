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
import "../../styles/admin/componentadmin.css"; // 💅 import CSS riêng cho bảng năm

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

  // ✅ Dữ liệu thống kê tài chính
  const [monthlyFinance, setMonthlyFinance] = useState([]);
  const [yearlyFinance, setYearlyFinance] = useState([]);

  // =============================
  // 🔹 FETCH dữ liệu tổng quan
  // =============================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 🔧 Gọi song song tất cả API cần thiết
        const [statsRes, monthlyRes, yearlyRes, activitiesRes] = await Promise.all([
          api.get("/reports/stats").catch(() => ({ data: {} })),
          api.get("/invoices/stats/monthly").catch(() => ({ data: { monthlyStats: [] } })),
          api.get("/invoices/stats/yearly").catch(() => ({ data: [] })),
          api.get("/admin/activities/recent").catch(() => ({ data: [] })), // 🆕 API hoạt động gần đây
        ]);

        setStats({
          residents: { total: statsRes.data?.residents?.total ?? 0 },
          apartments: {
            total: statsRes.data?.apartments?.total ?? 0,
            occupied: statsRes.data?.apartments?.occupied ?? 0,
          },
          invoices: { unpaid: statsRes.data?.invoices?.unpaid ?? 0 },
          reports: { pending: statsRes.data?.reports?.pending ?? 0 },
        });

        setMonthlyFinance(monthlyRes.data.monthlyStats || []);
        setYearlyFinance(yearlyRes.data || []);
        setRecentActivities(activitiesRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu dashboard:", err);
        setError("Không thể tải dữ liệu tổng quan hoặc thống kê tài chính.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">
        {error}
      </p>
    );

  // =============================
  // 📊 Cấu hình biểu đồ Thu - Chi theo tháng
  // =============================
  const monthlyFinanceData = {
    labels: monthlyFinance.map((m) => `Th${m.month}`),
    datasets: [
      {
        label: "Tổng thu (VNĐ)",
        data: monthlyFinance.map((m) => m.income),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyFinanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "💰 Thống kê thu - chi theo tháng" },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => value.toLocaleString("vi-VN") + "₫",
        },
      },
    },
  };

  // =============================
  // ⏱️ Hàm hiển thị "x phút / giờ / ngày trước"
  // =============================
  const formatTimeAgo = (dateString) => {
    const diff = (new Date() - new Date(dateString)) / 1000;
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // =============================
  // 🖼️ Render giao diện
  // =============================
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Bảng điều khiển</h1>

      {/* ======= THẺ TỔNG QUAN ======= */}
      <div className="dashboard-grid">
        <Link to="/admin/residents" className="stat-card">
          <div className="stat-icon">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Tổng số cư dân</p>
            <p>{stats.residents.total}</p>
          </div>
        </Link>

        <Link to="/admin/apartments" className="stat-card">
          <div className="stat-icon">
            <HomeIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Căn hộ có người ở</p>
            <p>
              {stats.apartments.occupied} / {stats.apartments.total}
            </p>
          </div>
        </Link>

        <Link to="/admin/invoices" className="stat-card">
          <div className="stat-icon">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Hóa đơn chưa thanh toán</p>
            <p>{stats.invoices.unpaid}</p>
          </div>
        </Link>

        <Link to="/admin/reports" className="stat-card">
          <div className="stat-icon">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div className="stat-text">
            <p>Báo cáo chờ xử lý</p>
            <p>{stats.reports.pending}</p>
          </div>
        </Link>
      </div>

      {/* ======= BIỂU ĐỒ THU CHI ======= */}
      <div className="chart-card mt-6">
        <h2 className="text-xl font-semibold mb-4">
          📈 Thống kê thu - chi theo tháng
        </h2>
        <div style={{ height: "350px" }}>
          {monthlyFinance.length > 0 ? (
            <Line data={monthlyFinanceData} options={monthlyFinanceOptions} />
          ) : (
            <p className="text-center text-gray-500 mt-10">
              Không có dữ liệu thu - chi trong năm.
            </p>
          )}
        </div>
      </div>

      {/* ======= BẢNG THU CHI THEO NĂM ======= */}
      <div className="finance-table-card mt-6 pt-10">
        <h2 className="finance-table-title mb-3 mt-10">📆 Thống kê thu - chi theo năm</h2>

        <table className="finance-table">
          <thead>
            <tr>
              <th>Năm</th>
              <th>Tổng thu (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {yearlyFinance.length > 0 ? (
              yearlyFinance.map((y) => (
                <tr key={y.year}>
                  <td className="finance-year">{y.year}</td>
                  <td className="finance-income">
                    {y.income.toLocaleString("vi-VN")}₫
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="finance-empty">
                  Không có dữ liệu năm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======= HOẠT ĐỘNG GẦN ĐÂY ======= */}
      <div className="chart-card mt-6">
        <h2 className="chart-title mb-3">📰 Hoạt động gần đây</h2>
        <ul className="recent-activity-list space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((item) => (
              <li key={item.id} className="recent-activity-item flex flex-col">
                <span className="activity-text font-medium">{item.text}</span>
                <span className="text-sm text-gray-500">
                  ⏰ {formatTimeAgo(item.createdAt)}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center">Không có hoạt động nào gần đây.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardAdmin;
