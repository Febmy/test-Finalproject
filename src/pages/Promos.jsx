// src/pages/Promos.jsx
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useToast } from "../context/ToastContext.jsx";

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/promos");
        setPromos(res.data.data || []);
      } catch (err) {
        console.error("Promos error:", err.response?.data || err.message);
        const msg = "Gagal memuat data promo.";
        setError(msg);
        showToast({ type: "error", message: msg });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [showToast]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded-full animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-6">Promo</h1>

      {/* Grid sesuai wireframe */}
      <div className="grid md:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="border rounded-2xl p-4 bg-white hover:shadow-sm hover:-translate-y-0.5 transition"
          >
            <h2 className="font-semibold mb-2 text-sm md:text-base">
              {promo.title}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm">
              {promo.description || promo.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
