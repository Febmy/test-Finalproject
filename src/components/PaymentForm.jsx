// src/components/PaymentForm.jsx
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function PaymentForm({ cartIds }) {
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await api.get("/payment-methods");
        setMethods(res.data.data);
      } catch (err) {
        console.error(
          "Error fetching payment methods:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const handleCheckout = async () => {
    try {
      await api.post("/create-transaction", {
        cartIds,
        paymentMethodId: selected,
      });
      alert("Transaksi berhasil dibuat!");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      alert("Checkout gagal.");
    }
  };

  if (loading) return <p>Loading payment methods...</p>;

  return (
    <div className="border rounded p-4 space-y-4">
      <h2 className="font-semibold">Payment Method</h2>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full border rounded px-3 py-2"
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
        disabled={!selected}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        Confirm Payment
      </button>
    </div>
  );
}
