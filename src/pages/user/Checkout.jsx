// src/pages/user/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function Checkout() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cartIds, setCartIds] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // ambil payment methods
        const pmRes = await api.get("/payment-methods");
        setPaymentMethods(pmRes.data.data || []);

        // ambil cart untuk dapatkan cartIds
        const cartRes = await api.get("/carts");
        const carts = cartRes.data.data || [];
        setCartIds(carts.map((c) => c.id));
      } catch (err) {
        console.error(
          "Checkout init error:",
          err.response?.data || err.message
        );
        setError("Gagal memuat data checkout.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    selectedMethod &&
    cartIds.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Lengkapi form dan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/create-transaction", {
        cartIds,
        paymentMethodId: selectedMethod,
      });

      // setelah sukses, arahkan ke My Transactions
      navigate("/transactions");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      setError("Checkout gagal, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* tab bar kecil */}
      <div className="flex gap-2">
        <div className="h-2 w-10 rounded-full bg-slate-300" />
        <div className="h-2 w-10 rounded-full bg-slate-300" />
        <div className="h-2 w-10 rounded-full bg-slate-300" />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* FORM DATA USER */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold mb-2 text-slate-900">Form</h2>
          <p className="text-xs text-slate-500 mb-2">
            Pastikan data kamu sudah benar sebelum melakukan pembayaran.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Nama lengkap sesuai identitas"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Catatan (opsional)
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                placeholder="Catatan tambahan untuk perjalananmu..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`mt-4 w-full rounded-xl py-2 text-sm font-medium 
              ${
                !isFormValid || submitting
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-slate-900"
              } transition`}
          >
            {submitting ? "Processing..." : "Confirm Checkout"}
          </button>
        </form>

        {/* PAYMENT METHOD */}
        <section className="bg-slate-100 rounded-3xl p-6 space-y-3">
          <h2 className="font-semibold mb-2 text-slate-900">Payment</h2>
          <p className="text-xs text-slate-500 mb-2">
            Pilih metode pembayaran yang ingin kamu gunakan.
          </p>

          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <label
                key={pm.id}
                className="flex items-center gap-2 text-sm cursor-pointer "
              >
                <input
                  type="radio"
                  name="payment"
                  value={pm.id}
                  checked={selectedMethod === pm.id}
                  onChange={() => setSelectedMethod(pm.id)}
                  className="accent-slate-900"
                />
                <img src={pm.imageUrl} alt={pm.name} />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
