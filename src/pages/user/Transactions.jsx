// src/pages/user/Transactions.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { formatCurrency, formatDateTime } from "../../lib/format.js";
import { getFriendlyErrorMessage } from "../../lib/errors.js";

// Status colors and labels
const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: "emerald",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-100",
  },
  pending: {
    label: "Pending",
    color: "amber",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-100",
  },
  failed: {
    label: "Failed",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "slate",
    bgColor: "bg-slate-50",
    textColor: "text-slate-500",
    borderColor: "border-slate-100",
  },
  paid: {
    label: "Paid",
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-100",
  },
  processing: {
    label: "Processing",
    color: "indigo",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-100",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
  { key: "cancelled", label: "Cancelled" },
];

// Helper functions
function getItemCount(tx) {
  if (Array.isArray(tx.carts) && tx.carts.length > 0) {
    return tx.carts.reduce((sum, cart) => sum + (cart.quantity || 1), 0);
  }
  if (Array.isArray(tx.cartIds)) {
    return tx.cartIds.length;
  }
  return 1; // Default to 1 if unknown
}

function getFirstActivity(tx) {
  if (Array.isArray(tx.carts) && tx.carts.length > 0) {
    const firstCart = tx.carts[0];
    return {
      id: firstCart.activity?.id,
      title: firstCart.activity?.title || "Activity",
      image:
        firstCart.activity?.imageUrl ||
        (Array.isArray(firstCart.activity?.imageUrls) &&
          firstCart.activity.imageUrls[0]) ||
        firstCart.activity?.thumbnail ||
        "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
    };
  }
  return {
    title: "Transaction",
    image:
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
  };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
  });

  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for new transaction from checkout
  useEffect(() => {
    if (location.state?.transactionId) {
      showToast({
        type: "success",
        message: `Transaksi #${location.state.transactionId} berhasil dibuat!`,
      });
      // Clear state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, showToast]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Try multiple endpoints
      const endpoints = [
        "/my-transactions",
        "/transactions",
        "/user-transactions",
      ];
      let response = null;

      for (const ep of endpoints) {
        try {
          const res = await api.get(ep);
          response = res;
          break;
        } catch (err) {
          if (err.response?.status === 404) continue;
          throw err;
        }
      }

      if (!response) {
        throw new Error("Endpoint transactions tidak ditemukan.");
      }

      let raw = response.data?.data || response.data || [];
      if (!Array.isArray(raw)) {
        raw = raw.items || raw.transactions || [];
      }

      // Sort by date (newest first)
      const sorted = [...raw].sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.updatedAt || a.transactionDate || 0
        );
        const dateB = new Date(
          b.createdAt || b.updatedAt || b.transactionDate || 0
        );
        return dateB - dateA;
      });

      setTransactions(sorted);

      // Calculate stats
      const stats = {
        total: sorted.length,
        success: sorted.filter((t) => t.status === "success").length,
        pending: sorted.filter((t) => t.status === "pending").length,
        failed: sorted.filter(
          (t) => t.status === "failed" || t.status === "cancelled"
        ).length,
      };
      setStats(stats);
    } catch (err) {
      console.error("Error load transactions:", err);
      const errorMsg = getFriendlyErrorMessage(
        err,
        "Gagal memuat data transaksi."
      );
      showToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (transactionId, transactionStatus) => {
    if (transactionStatus !== "pending") {
      showToast({
        type: "error",
        message: "Hanya transaksi dengan status pending yang bisa dibatalkan.",
      });
      return;
    }

    const ok = window.confirm("Yakin ingin membatalkan transaksi ini?");
    if (!ok) return;

    try {
      setCancelling((prev) => ({ ...prev, [transactionId]: true }));

      await api.post(`/cancel-transaction/${transactionId}`);

      // Update local state
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, status: "cancelled" } : tx
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        failed: prev.failed + 1,
      }));

      showToast({
        type: "success",
        message: "Transaksi berhasil dibatalkan.",
      });
    } catch (err) {
      console.error("Cancel transaction error:", err);
      showToast({
        type: "error",
        message: err.response?.data?.message || "Gagal membatalkan transaksi.",
      });
    } finally {
      setCancelling((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  const handleRetryPayment = (transactionId) => {
    showToast({
      type: "info",
      message: "Fitur retry payment akan segera tersedia.",
    });
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === "all") return true;
    return tx.status === activeFilter;
  });

  // Loading state
  if (loading) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Transaksi Saya</h1>
          <p className="text-sm text-slate-600">Memuat riwayat transaksi...</p>
        </header>
        <div className="flex justify-center py-10">
          <Spinner size={32} />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Transaksi Saya
        </h1>
        <p className="text-sm text-slate-600">
          Riwayat pemesanan aktivitas perjalanan Anda.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-medium">
            Total: {stats.total}
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
            Success: {stats.success}
          </div>
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
            Pending: {stats.pending}
          </div>
          <div className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
            Failed/Cancelled: {stats.failed}
          </div>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? transactions.length
              : transactions.filter((t) => t.status === f.key).length;

          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition flex items-center gap-2
                ${
                  activeFilter === f.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {f.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === f.key
                    ? "bg-white/20"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TRANSACTIONS LIST */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title={`Tidak ada transaksi ${
            activeFilter !== "all" ? `dengan status ${activeFilter}` : ""
          }`}
          description={
            activeFilter !== "all"
              ? "Coba filter lain atau buat transaksi baru."
              : "Belum ada transaksi. Mulai pesan aktivitas sekarang!"
          }
          icon="📋"
          actions={
            activeFilter !== "all" ? (
              <button
                onClick={() => setActiveFilter("all")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Lihat Semua Transaksi
              </button>
            ) : (
              <button
                onClick={() => navigate("/activity")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Jelajahi Aktivitas
              </button>
            )
          }
        />
      ) : (
        <section className="space-y-4">
          {filteredTransactions.map((tx) => {
            const itemCount = getItemCount(tx);
            const activity = getFirstActivity(tx);
            const status = tx.status || "pending";
            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            const totalAmount = tx.totalAmount || tx.amount || 0;

            return (
              <article
                key={tx.id || tx._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* IMAGE */}
                  <div
                    className="w-full md:w-40 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      activity.id && navigate(`/activity/${activity.id}`)
                    }
                  >
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Header with status */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="font-semibold text-slate-900 text-base md:text-lg line-clamp-1">
                          {activity.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-slate-500">
                            ID: {tx.id?.slice(-8) || tx._id?.slice(-8) || "N/A"}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            {formatDateTime(tx.createdAt || tx.transactionDate)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            {itemCount} item{itemCount > 1 ? "s" : ""}
                          </span>
                        </div>

                        {tx.paymentMethod && (
                          <p className="text-xs text-slate-500">
                            Payment: {tx.paymentMethod.name || tx.paymentMethod}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}
                        >
                          {statusConfig.label}
                        </span>

                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/activity/${activity.id}`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                      >
                        Lihat Aktivitas
                      </button>

                      {status === "pending" && (
                        <button
                          onClick={() => handleCancel(tx.id, status)}
                          disabled={cancelling[tx.id]}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancelling[tx.id] ? "Membatalkan..." : "Batalkan"}
                        </button>
                      )}

                      {status === "failed" && (
                        <button
                          onClick={() => handleRetryPayment(tx.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                        >
                          Coba Lagi
                        </button>
                      )}

                      {status === "success" && (
                        <button
                          onClick={() => {
                            // Download invoice or view details
                            showToast({
                              type: "info",
                              message: "Invoice akan dikirim ke email Anda.",
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                        >
                          Download Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* FOOTER INFO */}
      {transactions.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Data transaksi diambil dari API Travel Journal. Status akan
            diperbarui secara otomatis.
          </p>
        </div>
      )}
    </section>
  );
}
