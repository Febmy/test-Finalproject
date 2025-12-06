// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Eye, EyeOff, Lock, Mail, Globe } from "lucide-react";

// Validation functions
function validateEmail(email) {
  if (!email) return "Email wajib diisi.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? "" : "Format email tidak valid.";
}

function validatePassword(pw) {
  if (!pw) return "Password wajib diisi.";
  if (pw.length < 6) return "Password minimal 6 karakter.";
  return "";
}

// Redirect berdasarkan role user
function redirectByRole(navigate, profile) {
  const role =
    profile?.role?.toLowerCase() || profile?.userRole?.toLowerCase() || "";

  // Tunggu sebentar untuk memastikan state diupdate
  setTimeout(() => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, 100);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // State untuk form
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Auto-redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawProfile = localStorage.getItem("userProfile");

    if (!token || !rawProfile) return;

    try {
      const profile = JSON.parse(rawProfile);
      redirectByRole(navigate, profile);
    } catch (error) {
      console.error("Error parsing user profile:", error);
      // Clear invalid data
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
    }
  }, [navigate]);

  // Validasi real-time
  useEffect(() => {
    if (email) {
      const emailError = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: emailError }));
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const passwordError = validatePassword(password);
      setErrors((prev) => ({ ...prev, password: passwordError }));
    }
  }, [password]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi final
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      showToast({
        type: "error",
        message: "Harap perbaiki error pada form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // API call untuk login
      const response = await api.post("/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const { token, data: userData } = response.data || {};

      if (!token) {
        throw new Error("Token tidak ditemukan dalam respons");
      }

      // Format user profile
      const userProfile = {
        id: userData?.id,
        name: userData?.name || userData?.fullName || email.split("@")[0],
        email: userData?.email || email,
        role: userData?.role || "user",
        avatar: userData?.profilePictureUrl || userData?.avatar,
        phoneNumber: userData?.phoneNumber,
        createdAt: userData?.createdAt,
      };

      // Simpan data ke localStorage/sessionStorage
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userProfile", JSON.stringify(userProfile));
      }

      // Show success message
      showToast({
        type: "success",
        message: `Selamat datang, ${userProfile.name}!`,
      });

      // Redirect berdasarkan role
      redirectByRole(navigate, userProfile);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login gagal. Silakan coba lagi.";
      const statusCode = error.response?.status;
      const apiMessage = error.response?.data?.message;

      if (statusCode === 400 || statusCode === 401) {
        errorMessage = "Email atau password salah.";
      } else if (statusCode === 404) {
        errorMessage = "Akun tidak ditemukan.";
      } else if (apiMessage) {
        errorMessage = apiMessage;
      } else if (error.message === "Network Error") {
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet.";
      }

      showToast({
        type: "error",
        message: errorMessage,
      });

      // Clear password on error
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo credentials
  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        {/* Left Column: Form */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                TravelApp
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Selamat Datang Kembali
            </h1>
            <p className="text-gray-600 mt-2">
              Masuk ke akun Anda untuk melanjutkan petualangan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-sm transition-all
                    ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl text-sm transition-all
                    ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Submit */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">Ingat saya</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium rounded-xl
                  hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Coba dengan akun demo:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin("admin@travelapp.com", "admin123")
                }
                className="p-3 border border-gray-300 rounded-xl hover:border-teal-400 hover:bg-teal-50 
                  transition-colors text-sm flex flex-col items-center"
              >
                <span className="font-medium text-gray-900">Admin</span>
                <span className="text-xs text-gray-500">
                  admin@travelapp.com
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("user@travelapp.com", "user123")}
                className="p-3 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 
                  transition-colors text-sm flex flex-col items-center"
              >
                <span className="font-medium text-gray-900">User</span>
                <span className="text-xs text-gray-500">
                  user@travelapp.com
                </span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* API Info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">API Travel Journal:</span>{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">/login</code>{" "}
              endpoint terintegrasi
            </p>
          </div>
        </div>

        {/* Right Column: Illustration/Info */}
        <div
          className="hidden md:flex flex-col justify-between bg-gradient-to-br from-teal-600 via-blue-600 to-purple-700 
          text-white p-12 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-2"></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              w-64 h-64 rounded-full border-2"
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">
              Jelajahi Dunia dengan TravelApp
            </h2>
            <p className="text-teal-100 leading-relaxed">
              Platform travel terintegrasi dengan API Travel Journal yang
              menyediakan:
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xs">✓</span>
                </div>
                <span>Aktivitas & destinasi terupdate</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xs">✓</span>
                </div>
                <span>Sistem booking real-time</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xs">✓</span>
                </div>
                <span>Promo & diskon eksklusif</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xs">✓</span>
                </div>
                <span>Role-based access (User & Admin)</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-sm text-teal-100/80">
              <div>
                <p className="font-medium">TravelApp v1.0</p>
                <p>Final Project Frontend</p>
              </div>
              <div className="text-right">
                <p>API Travel Journal</p>
                <p>bootcamp.do.dibimbing.id</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
