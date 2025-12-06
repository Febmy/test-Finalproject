// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";
import api from "../../lib/api.js";
import {
  Globe,
  Bell,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==== Ambil profile dari localStorage ====
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (!raw) {
        setProfile(null);
        setIsAdmin(false);
        return;
      }
      const user = JSON.parse(raw);
      setProfile(user);
      const role = user.role || user.userRole || "";
      setIsAdmin(role === "admin");
    } catch (err) {
      console.error("Failed to parse userProfile:", err);
      setProfile(null);
      setIsAdmin(false);
    }
  }, [location.pathname]);

  // ==== Ambil jumlah cart (user saja) ====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isAdmin) {
      setCartCount(0);
      return;
    }

    let cancelled = false;

    async function fetchCartCount() {
      try {
        const res = await api.get("/carts");
        const carts = res.data?.data || [];
        const totalQty = carts.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );

        if (!cancelled) setCartCount(totalQty);
      } catch (err) {
        console.error(
          "Navbar: gagal ambil cart:",
          err.response?.data || err.message
        );
      }
    }

    fetchCartCount();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, location.pathname]);

  // ==== Ambil jumlah notifikasi ====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isAdmin) {
      setNotifCount(0);
      return;
    }

    let cancelled = false;

    async function fetchNotifCount() {
      try {
        const res = await api.get("/my-transactions");
        const list = res.data?.data || [];
        const pending = list.filter((tx) => {
          const status = (tx.status || tx.paymentStatus || "").toLowerCase();
          return status === "pending";
        });

        const count = pending.length;
        if (!cancelled) {
          setNotifCount(count);
          localStorage.setItem("travelapp_notification_count", String(count));
        }
      } catch (err) {
        if (!cancelled) setNotifCount(0);
      }
    }

    fetchNotifCount();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, isAdmin]);

  const displayName =
    profile?.name ||
    profile?.fullName ||
    profile?.username ||
    profile?.email ||
    "Traveler";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("travelapp_notification_count");
    setProfile(null);
    setIsAdmin(false);
    setCartCount(0);
    setNotifCount(0);
    navigate("/login", { replace: true });
    showToast({ type: "success", message: "Berhasil logout dari TravelApp." });
  };

  const userNavLinks = [
    { to: "/", label: "Home" },
    { to: "/activity", label: "Activity" },
    { to: "/promos", label: "Promo" },
  ];

  const adminNavLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/activities", label: "Activities" },
    { to: "/admin/promos", label: "Promos" },
    { to: "/admin/transactions", label: "Transactions" },
    { to: "/admin/users", label: "Users" },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-teal-900 via-blue-900 to-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={isAdmin ? "/admin" : "/"}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold">TravelApp</span>
                <p className="text-xs text-blue-200">
                  {isAdmin ? "Admin Panel" : "Smart Travel"}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {isLoggedIn && (
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 rounded-full hover:bg-white/10 transition"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart */}
            {!isAdmin && isLoggedIn && (
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-white text-blue-700 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu / Login */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-blue-200">
                      {isAdmin ? "Admin" : "Traveler"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50">
                    {isAdmin ? (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase">
                          Admin Panel
                        </div>
                        <NavLink
                          to="/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/admin/activities"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Activities
                        </NavLink>
                        <NavLink
                          to="/admin/promos"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Promos
                        </NavLink>
                        <NavLink
                          to="/admin/transactions"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Transactions
                        </NavLink>
                        <NavLink
                          to="/admin/users"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Users
                        </NavLink>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase">
                          Traveler
                        </div>
                        <NavLink
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Profile
                        </NavLink>
                        <NavLink
                          to="/transactions"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          My Transactions
                        </NavLink>
                        <NavLink
                          to="/wishlist"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Wishlist
                        </NavLink>
                        <NavLink
                          to="/help"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                          Help Center
                        </NavLink>
                      </>
                    )}
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-blue-700 px-6 py-2 rounded-full font-medium hover:bg-blue-50 transition"
              >
                Login / Register
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-xl mt-2 py-4 shadow-xl">
            <div className="space-y-1 px-4">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    classNames(
                      "block px-4 py-3 rounded-lg text-base font-medium",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-blue-50"
                    )
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
