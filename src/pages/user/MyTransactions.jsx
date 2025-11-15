// src/pages/user/MyTransactions.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";

// Helper: format Rupiah
function formatRupiah(value) {
  if (!value && value !== 0) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper: format tanggal & jam
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper: hitung jumlah item di transaksi
// Kalau API ada field carts + quantity -> jumlahkan
// Kalau tidak ada -> return null, nanti fallback ke "Total: RpX" saja
function getItemCount(tx) {
  if (Array.isArray(tx.carts) && tx.carts.length > 0) {
    return tx.carts.reduce((sum, cart) => sum + (cart.quantity || 1), 0);
  }
  // fallback lain kalau API punya field lain
  if (Array.isArray(tx.cartIds)) {
    return tx.cartIds.length;
  }
  return null;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-transactions");
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error(
        "Error load transactions:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCancel = async (transactionId) => {
    const ok = window.confirm("Yakin mau membatalkan transaksi ini?");
    if (!ok) return;

    try {
      await api.post(`/cancel-transaction/${transactionId}`);
      // reload list setelah cancel
      await fetchTransactions();
    } catch (err) {
      console.error(
        "Cancel transaction error:",
        err.response?.data || err.message
      );
      alert(
        err.response?.data?.errors ||
          "Gagal membatalkan transaksi. Pastikan status masih pending."
      );
    }
  };

  const filtered = transactions.filter((tx) => {
    if (activeFilter === "all") return true;
    return tx.status === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Transactions
        </h1>
        <p className="text-sm text-slate-500">
          Lihat riwayat transaksi perjalananmu.
        </p>
      </header>

      {/* FILTER TABS */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm border transition
              ${
                activeFilter === f.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST TRANSAKSI */}
      <section className="space-y-4">
        {loading && (
          <p className="text-sm text-slate-500">Loading transactions...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            Belum ada transaksi pada filter ini.
          </p>
        )}

        {filtered.map((tx) => {
          const itemCount = getItemCount(tx);
          const firstCart = tx.carts?.[0];
          const firstActivity = firstCart?.activity;

          const title = firstActivity?.title || "Activity";
          const imageUrl =
            firstActivity?.imageUrls?.[0] ||
            firstActivity?.imageUrls ||
            firstActivity?.image ||
            "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"; // fallback

          const status = tx.status || "pending";

          const totalText =
            itemCount && itemCount > 0
              ? `${formatRupiah(tx.totalAmount)} • ${itemCount} item${
                  itemCount > 1 ? "s" : ""
                }`
              : `${formatRupiah(tx.totalAmount)}`;

          return (
            <article
              key={tx.id}
              className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 rounded-3xl p-4 md:p-5 items-stretch"
            >
              {/* GAMBAR */}
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* KONTEN */}
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-semibold text-slate-900 text-base md:text-lg">
                      {title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Payment: {tx.paymentMethod?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        status === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : status === "failed"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : status === "cancelled"
                          ? "bg-slate-50 text-slate-500 border border-slate-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                  >
                    {status}
                  </span>
                </div>

                {/* TOTAL + ACTIONS */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm font-medium text-slate-900">
                    Total: <span className="font-semibold">{totalText}</span>
                  </p>

                  {status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(tx.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
