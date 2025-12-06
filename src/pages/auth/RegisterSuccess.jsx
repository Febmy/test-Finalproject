// src/pages/auth/RegisterSuccess.jsx
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Mail, User, ArrowRight, Home } from "lucide-react";

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from registration
  const email = location.state?.email || "user@example.com";
  const name = location.state?.name || "Pengguna Baru";

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", {
        state: { email },
        replace: true,
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, email]);

  const handleGoToLogin = () => {
    navigate("/login", {
      state: { email },
      replace: true,
    });
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center">
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pendaftaran Berhasil! 🎉
            </h1>
            <p className="text-emerald-100">Selamat bergabung di TravelApp</p>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selamat, {name}!
              </h2>
              <p className="text-gray-600">
                Akun Anda telah berhasil dibuat dan siap digunakan
              </p>
            </div>

            {/* Account Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium text-gray-900">{name}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Terdaftar</p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-3">
                Langkah selanjutnya:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
                    1
                  </div>
                  <span className="text-gray-700">
                    Periksa email untuk konfirmasi (opsional)
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    2
                  </div>
                  <span className="text-gray-700">
                    Login dengan email dan password
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    3
                  </div>
                  <span className="text-gray-700">
                    Jelajahi aktivitas dan mulai booking
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl
                  hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                  transition-all duration-200 flex items-center justify-center"
              >
                <span>Lanjut ke Halaman Login</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button
                onClick={handleGoToHome}
                className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  transition-all duration-200 flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 text-center">
                Anda akan diarahkan ke halaman login dalam{" "}
                <span className="font-bold">10 detik</span>
              </p>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Butuh bantuan?{" "}
                <Link
                  to="/help"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Hubungi support
                </Link>{" "}
                atau{" "}
                <Link
                  to="/faq"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  lihat FAQ
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-2">
                  <span className="text-xs text-white font-bold">T</span>
                </div>
                <span>TravelApp • Final Project</span>
              </div>
              <div>
                <span>API Travel Journal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Final Project Frontend Development • Dibimbing.id Bootcamp
          </p>
        </div>
      </div>
    </div>
  );
}
