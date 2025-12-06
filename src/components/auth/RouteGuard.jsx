// src/components/auth/RouteGuard.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function RouteGuard({ children, requireAuth = false, requireAdmin = false }) {
  const location = useLocation();
  
  // Get auth state
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userProfile = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
  
  let user = null;
  try {
    user = userProfile ? JSON.parse(userProfile) : null;
  } catch (error) {
    console.error("Error parsing user profile:", error);
  }
  
  // Jika route memerlukan auth tapi user belum login
  if (requireAuth && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Jika route memerlukan role admin tapi user bukan admin
  if (requireAdmin && (!user || user.role?.toLowerCase() !== "admin")) {
    return <Navigate to="/" replace />;
  }
  
  // Jika user sudah login tapi mencoba akses login/register page
  if (!requireAuth && token && (location.pathname === "/login" || location.pathname === "/register")) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}