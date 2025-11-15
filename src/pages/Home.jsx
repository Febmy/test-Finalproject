import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Homepage() {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, aRes] = await Promise.all([
          api.get("/promos"),
          api.get("/activities?limit=8"),
        ]);

        setPromos(pRes.data.data || []);
        setActivities(aRes.data.data || []);
      } catch (err) {
        console.error("Homepage error:", err.response?.data || err.message);
        const msg = "Gagal memuat data homepage.";
        setError(msg);
        showToast({ type: "error", message: msg });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="h-40 md:h-56 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // ====== DATA DARI API ======
  const heroPromo = promos[0];

  // gambar hero: ambil dari API, kalau kosong pakai fallback unsplash
  const heroImage =
    heroPromo?.imageUrl ||
    (Array.isArray(heroPromo?.imageUrls) && heroPromo.imageUrls[0]) ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

  // 3 aktivitas pertama sebagai rekomendasi
  const recommendedActivities = activities.slice(0, 3);

  // helper gambar aktivitas
  const getActivityImage = (act) =>
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    "https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ===== HERO PROMO DARI API ===== */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-lg transition grid md:grid-cols-[2fr,1.2fr] gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Promo
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
            {heroPromo?.title || "Staycation Brings Silaturahmi 🙏"}
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-xl">
            {heroPromo?.description ||
              "Friendly reminder, family staycation shall be forever memorable. Nikmati diskon menarik untuk berbagai destinasi liburan."}
          </p>
        </div>

        {/* GAMBAR HERO */}
        <div className="rounded-3xl overflow-hidden bg-slate-100">
          <img
            src={heroImage}
            alt={heroPromo?.title || "Promo TravelApp"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* ===== SECTION I–III ===== */}
      <section className="space-y-3">
        <button
          onClick={() => navigate("/activity")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base font-semibold hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          Semua Aktivitas
        </button>
        <button
          onClick={() => navigate("/activity")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base font-semibold hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          Rekomendasi
        </button>
        <button
          onClick={() => navigate("/transactions")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base font-semibold hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          Transaksi Saya
        </button>
      </section>

      {/* ===== REKOMENDASI DARI API ===== */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Rekomendasi untukmu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedActivities.map((act) => (
            <Link
              key={act.id}
              to={`/activity/${act.id}`}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col"
            >
              <div className="h-24 bg-slate-100">
                <img
                  src={getActivityImage(act)}
                  alt={act.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                <p className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                  {act.title}
                </p>
                <p className="text-xs md:text-sm text-slate-500">
                  Rp{(act.price || 0).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
