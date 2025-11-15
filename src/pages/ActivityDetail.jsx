// src/pages/user/ActivityDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activity, setActivity] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/activity/${id}`);
        setActivity(res.data.data);
      } catch (err) {
        console.error(
          "Activity detail error:",
          err.response?.data || err.message
        );
        setError("Gagal memuat detail aktivitas.");
        showToast({
          type: "error",
          message: "Gagal memuat detail aktivitas.",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, showToast]);

  const handleAddToCart = async () => {
    if (!id) return;

    try {
      await api.post("/add-cart", {
        activityId: id,
        bookingDate: date || null,
      });

      showToast({
        type: "success",
        message: "Berhasil menambahkan ke keranjang.",
      });

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message:
          err.response?.data?.message || "Gagal menambahkan ke keranjang.",
      });
    }
  };

  const getImage = (act) =>
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-600">
          Aktivitas tidak ditemukan atau sudah tidak tersedia.
        </p>
      </div>
    );
  }

  const imgSrc = getImage(activity);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* ATAS: GAMBAR + BOOKING */}
      <section className="grid md:grid-cols-[1.7fr,1.1fr] gap-6 items-start">
        {/* KIRI: GAMBAR + INFO SINGKAT */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden bg-slate-100">
            <img
              src={imgSrc}
              alt={activity.title}
              className="w-full h-[260px] md:h-[320px] object-cover"
              loading="lazy"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {activity.title}
            </h1>
            {activity.location && (
              <p className="text-xs md:text-sm text-slate-500">
                {activity.location}
              </p>
            )}
            <p className="text-sm md:text-base font-semibold text-slate-900">
              Rp{(activity.price || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* KANAN: BOOKING BOX */}
        <aside className="bg-slate-900 text-white rounded-3xl p-6 md:p-7 flex flex-col justify-between gap-4 shadow-sm">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Booking
            </p>
            <p className="text-sm text-slate-100">
              Pilih tanggal perjalananmu, lalu lanjutkan ke keranjang untuk
              menyelesaikan pembayaran.
            </p>

            <div className="space-y-2 mt-2">
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full mt-4 rounded-xl bg-white text-slate-900 font-medium py-2 text-sm
                       hover:bg-slate-100 transition"
          >
            Add to Cart
          </button>
        </aside>
      </section>

      {/* DESCRIPTION */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-sm">
        <h2 className="font-semibold mb-2 text-slate-900">Description</h2>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
          {activity.description || "Tidak ada deskripsi untuk aktivitas ini."}
        </p>
      </section>

      {/* TOMBOL BAWAH */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          className="flex-1 sm:flex-none border rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="flex-1 sm:flex-none border rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/activity")}
        >
          Activity
        </button>
        <button
          className="flex-1 sm:flex-none bg-black text-white rounded-xl px-4 py-2 text-sm hover:bg-slate-900"
          onClick={() => navigate("/checkout")}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
