// src/components/layout/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";

// Helper ambil user profile
function getUser() {
  try {
    const raw = localStorage.getItem("userProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const adminMenu = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/transactions", label: "Transaksi" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/activities", label: "Activities" },
  { to: "/admin/promos", label: "Promos & Banner" },
  { to: "/admin/banners", label: "Banners" }, // ← Tambah ini
  { to: "/admin/payment-methods", label: "Payment Methods" }, // ← Tambah ini
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(getUser());

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    showToast?.({ type: "success", message: "Berhasil logout." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Panel
            </p>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">
              {title || "Dashboard"}
            </h1>
          </div>

          {user && (
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{user.name}</p>
              <p className="uppercase tracking-[0.18em] text-[10px]">
                {user.role}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[220px,1fr]">
        {/* SIDEBAR */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-3 h-fit">
          <nav className="space-y-1">
            {adminMenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm rounded-xl transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full px-3 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          {children}
        </section>
      </div>
    </div>
  );
}
