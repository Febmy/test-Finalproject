// src/pages/user/ActivityList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | budget | premium

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [actRes, promoRes] = await Promise.all([
          api.get("/activities?limit=50"),
          api.get("/promos"),
        ]);

        setActivities(actRes.data.data || []);
        setPromos(promoRes.data.data || []);
      } catch (err) {
        console.error("Activities error:", err.response?.data || err.message);
        setError("Gagal memuat daftar aktivitas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getActivityImage = (act) =>
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const filteredActivities = activities.filter((act) => {
    const q = search.toLowerCase();
    const matchesSearch =
      act.title?.toLowerCase().includes(q) ||
      act.location?.toLowerCase().includes(q);

    let matchesFilter = true;
    if (filter === "budget") {
      matchesFilter = (act.price || 0) <= 500000;
    } else if (filter === "premium") {
      matchesFilter = (act.price || 0) > 500000;
    }

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-5 w-64 bg-slate-200 rounded-full animate-pulse" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-9 w-20 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="space-y-3 mt-4">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Semua Aktivitas
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Jelajahi berbagai aktivitas dan promo yang tersedia.
        </p>
        <p className="text-xs text-slate-500">
          Menampilkan{" "}
          <span className="font-semibold">{filteredActivities.length}</span>{" "}
          dari <span className="font-semibold">{activities.length}</span>{" "}
          aktivitas.
        </p>
      </header>

      {/* PROMO STRIP */}
      {promos.length > 0 && (
        <section className="bg-slate-900 text-white rounded-3xl p-4 md:p-5 space-y-3 ">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">
            Promo
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {promos.slice(0, 4).map((promo) => (
              <div
                key={promo.id}
                className="min-w-[220px] bg-slate-800/70 rounded-2xl p-3 border border-slate-700"
              >
                <p className="text-xs font-semibold line-clamp-2">
                  {promo.title}
                </p>
                {promo.promoCode && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 text-slate-900 text-[10px] px-2 py-0.5">
                    Code: {promo.promoCode}
                  </p>
                )}
                {promo.discountPrice && (
                  <p className="mt-1 text-[11px] text-slate-200">
                    Diskon hingga Rp
                    {promo.discountPrice.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FILTER + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-xs sm:text-sm rounded-full ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("budget")}
            className={`px-4 py-1.5 text-xs sm:text-sm rounded-full ${
              filter === "budget"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => setFilter("premium")}
            className={`px-4 py-1.5 text-xs sm:text-sm rounded-full ${
              filter === "premium"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Premium
          </button>
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Cari judul / lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* LIST ACTIVITY */}
      <section className="space-y-3">
        {filteredActivities.map((act) => (
          <Link
            key={act.id}
            to={`/activity/${act.id}`}
            className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src={getActivityImage(act)}
                alt={act.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-slate-900">
                  {act.title}
                </h2>
                {act.location && (
                  <p className="text-xs text-slate-500 mt-1">{act.location}</p>
                )}
                {act.description && (
                  <p className="text-xs md:text-sm text-slate-500 mt-1 line-clamp-2">
                    {act.description}
                  </p>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-900 font-semibold mt-1">
                Rp{(act.price || 0).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}

        {filteredActivities.length === 0 && (
          <p className="text-sm text-slate-500">
            Tidak ada aktivitas yang cocok dengan pencarianmu.
          </p>
        )}
      </section>
    </div>
  );
}
