// src/components/Navbar.jsx
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const loadCartCount = async () => {
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await api.get("/carts");
        const data = res.data.data || [];
        // jumlah total item = jumlah quantity
        const totalQty = data.reduce(
          (sum, item) => sum + (item.quantity ?? 1),
          0
        );
        setCartCount(totalQty);
      } catch (err) {
        console.error(
          "Navbar cart count error:",
          err.response?.data || err.message
        );
      }
    };

    const loadUser = async () => {
      if (!token) {
        setUserName("");
        return;
      }
      try {
        const res = await api.get("/user");
        setUserName(res.data.data?.name || "");
      } catch (err) {
        console.error("Navbar user error:", err.response?.data || err.message);
      }
    };

    loadCartCount();
    loadUser();
  }, [token, location.pathname]); // update tiap pindah halaman

  const baseLink =
    "px-3 py-1.5 text-xs md:text-sm rounded-full border border-transparent hover:bg-slate-100";
  const activeLink = "bg-slate-900 text-white hover:bg-slate-900";
  const inactiveLink = "text-slate-700";

  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* BRAND */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-sm md:text-base font-semibold tracking-tight text-slate-900"
          >
            TravelApp
          </Link>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/activity"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            Activity
          </NavLink>
        </nav>

        {/* AKSI */}
        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {userName && (
                <span className="hidden md:inline text-xs text-slate-600 mr-1">
                  Hi, <span className="font-medium">{userName}</span>
                </span>
              )}

              <Link
                to="/profile"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Profile
              </Link>

              <Link
                to="/cart"
                className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cart
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-slate-900 text-white text-[10px]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/transactions"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                My Transactions
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
