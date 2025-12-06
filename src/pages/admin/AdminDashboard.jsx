// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { formatCurrency } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getFriendlyErrorMessage } from "../../lib/errors.js";
import {
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  Package,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    userCount: 0,
    activityCount: 0,
    promoCount: 0,
    transactionCount: 0,
    totalRevenue: 0,
    pendingCount: 0,
    statusCounts: { pending: 0, success: 0, failed: 0, cancelled: 0 },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, txRes, actRes, promoRes] = await Promise.all([
        api.get("/all-user"),
        api.get("/all-transactions"),
        api.get("/activities"),
        api.get("/promos"),
      ]);
      const users = usersRes.data?.data || [];
      const transactions = txRes.data?.data || [];
      const activities = actRes.data?.data || [];
      const promos = promoRes.data?.data || [];

      let revenue = 0,
        pending = 0,
        success = 0,
        failed = 0,
        cancelled = 0;
      transactions.forEach((tx) => {
        const status = (tx.status || "").toLowerCase();
        const total =
          tx.totalAmount ??
          tx.total_price ??
          tx.totalPrice ??
          tx.total ??
          tx.amount ??
          0;
        if (status === "success" || status === "paid") {
          revenue += total;
          success += 1;
        } else if (status === "pending") pending += 1;
        else if (status === "failed") failed += 1;
        else if (status === "cancelled") cancelled += 1;
      });

      setStats({
        userCount: users.length,
        activityCount: activities.length,
        promoCount: promos.length,
        transactionCount: transactions.length,
        totalRevenue: revenue,
        pendingCount: pending,
        statusCounts: { pending, success, failed, cancelled },
      });
    } catch (err) {
      const msg = getFriendlyErrorMessage(err, "Gagal memuat data dashboard.");
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.userCount,
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-teal-500",
    },
    {
      title: "Activities",
      value: stats.activityCount,
      icon: <Activity className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Transactions",
      value: stats.transactionCount,
      icon: <CreditCard className="h-6 w-6" />,
      color: "from-teal-500 to-blue-500",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Promos",
      value: stats.promoCount,
      icon: <Package className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Pending",
      value: stats.pendingCount,
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100">
                Ringkasan aktivitas sistem: user, aktivitas, transaksi, dan
                revenue.
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Transaction Status Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                {Object.entries(stats.statusCounts).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          key === "success"
                            ? "bg-green-500"
                            : key === "pending"
                            ? "bg-yellow-500"
                            : key === "failed"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="capitalize font-medium">{key}</span>
                    </div>
                    <span className="font-bold">{value} trx</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Quick Insights</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>Success Rate</span>
                  <span className="font-bold text-green-600">
                    {stats.transactionCount > 0
                      ? Math.round(
                          (stats.statusCounts.success /
                            stats.transactionCount) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Average Revenue</span>
                  <span className="font-bold">
                    {formatCurrency(
                      stats.totalRevenue /
                        Math.max(stats.statusCounts.success, 1)
                    )}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pending Rate</span>
                  <span className="font-bold text-yellow-600">
                    {stats.transactionCount > 0
                      ? Math.round(
                          (stats.statusCounts.pending /
                            stats.transactionCount) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
