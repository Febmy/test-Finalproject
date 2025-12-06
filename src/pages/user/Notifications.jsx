// src/pages/user/Notifications.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js"; // FIXED: Correct import path
import Spinner from "../../components/ui/Spinner.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await api.get("/notifications", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let items =
          res.data?.data ||
          res.data?.notifications ||
          res.data?.items ||
          res.data ||
          [];

        if (!Array.isArray(items) && Array.isArray(items?.items)) {
          items = items.items;
        }

        if (!Array.isArray(items)) {
          setNotifications([]);
        } else {
          // Sort by date (newest first)
          items.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
            const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
            return dateB - dateA;
          });
          setNotifications(items);
        }
      } catch (err) {
        console.error("Notifications error:", err.response?.data || err);
        if (err.response?.status === 404) {
          setError("Endpoint notifications tidak ditemukan di API.");
        } else {
          setError("Gagal memuat notifikasi. Coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAll = () => {
    if (window.confirm("Hapus semua notifikasi?")) {
      setNotifications([]);
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex flex-col items-center">
        <Spinner />
        <p className="mt-2 text-sm text-slate-500">Memuat notifikasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const hasData = notifications && notifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="py-8 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Notifikasi
          </h1>
          {hasData && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} baru
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Daftar notifikasi yang diambil dari endpoint{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">
            /notifications
          </code>
          .
        </p>
      </header>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <div className="text-4xl mb-2">🔔</div>
          <p className="text-sm text-slate-600 mb-2">
            Belum ada notifikasi yang tercatat.
          </p>
          <p className="text-xs text-slate-400">
            Nantinya notifikasi di sini bisa berisi perubahan status transaksi,
            promo baru, dan pengingat aktivitas.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Hapus Semua
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((n, idx) => {
              const title = n.title || n.type || `Notifikasi #${idx + 1}`;
              const message =
                n.message || n.description || n.body || "Tidak ada deskripsi.";
              const createdAt = n.createdAt || n.created_at || n.date || n.time;
              const isRead = n.read || false;

              return (
                <article
                  key={n.id || idx}
                  className={`rounded-2xl border bg-white p-4 md:p-5 flex flex-col gap-1 shadow-sm ${
                    !isRead ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {title}
                        </p>
                        {!isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {createdAt && (
                        <p className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      {!isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] text-blue-600 hover:text-blue-800"
                        >
                          Tandai sudah dibaca
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification type badge */}
                  {n.type && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded">
                        {n.type}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[11px] text-slate-400 pt-4 border-t">
        Catatan: Struktur field notifikasi di-parse secara fleksibel (title,
        message, description, status, dll) supaya cocok dengan response API
        Travel Journal.
      </p>
    </div>
  );
}
