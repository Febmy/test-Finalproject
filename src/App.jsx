// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Homepage from "./pages/user/Homepage";
import ActivityList from "./pages/user/ActivityList";
import ActivityDetail from "./pages/user/ActivityDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import MyTransactions from "./pages/user/MyTransactions";
import Profile from "./pages/user/Profile";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";

// Proteksi route yang butuh login
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Homepage />} />
            <Route path="/activity" element={<ActivityList />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED / BUTUH LOGIN */}
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <Cart />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/transactions"
              element={
                <RequireAuth>
                  <MyTransactions />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}
