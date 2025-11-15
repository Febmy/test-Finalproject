// src/components/PaymentForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function PaymentForm({ cartIds = [] }) {
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await api.get("/payment-methods");
        setMethods(res.data.data || []);
      } catch (err) {
        console.error(
          "Error fetching payment methods:",
          err.response?.data || err.message
        );
        const msg = "Gagal memuat metode pembayaran.";
        setError(msg);
        showToast({ type: "error", message: msg });
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [showToast]);

  const handleCheckout = async () => {
    if (!selected) {
      showToast({
        type: "error",
        message: "Pilih metode pembayaran terlebih dahulu.",
      });
      return;
    }

    if (!cartIds.length) {
      showToast({
        type: "error",
        message: "Keranjang masih kosong.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/create-transaction", {
        cartIds,
        paymentMethodId: selected,
      });
      showToast({
        type: "success",
        message: "Transaksi berhasil dibuat.",
      });
      navigate("/transactions");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message:
          err.response?.data?.message || "Checkout gagal, silakan coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="border rounded-2xl p-4 bg-white space-y-4">
      <h2 className="font-semibold text-sm text-slate-900">Payment Method</h2>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
      >
        <option value="">-- Pilih metode --</option>
        {methods.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleCheckout}
        disabled={!selected || submitting}
        className={`w-full rounded-xl py-2 text-sm font-medium ${
          !selected || submitting
            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-slate-900"
        } transition`}
      >
        {submitting ? "Processing..." : "Confirm Payment"}
      </button>
    </div>
  );
}
