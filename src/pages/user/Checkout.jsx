// src/pages/user/Checkout.jsx
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cartIds, setCartIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // ambil payment methods
        const pm = await api.get("/payment-methods");
        setPaymentMethods(pm.data.data);

        // ambil cart untuk dapatkan cartIds
        const cart = await api.get("/carts");
        setCartIds(cart.data.data.map((c) => c.id));
      } catch (err) {
        console.error(
          "Checkout init error:",
          err.response?.data || err.message
        );
      }
    };
    load();
  }, []);

  const handleCheckout = async () => {
    if (!selected) return alert("Pilih metode pembayaran dulu");
    try {
      await api.post("/create-transaction", {
        cartIds,
        paymentMethodId: selected,
      });
      // ✅ redirect otomatis ke My Transactions
      navigate("/transactions");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      alert("Checkout gagal.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="space-y-3 mb-6">
        {paymentMethods.map((pm) => (
          <label key={pm.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value={pm.id}
              checked={selected === pm.id}
              onChange={() => setSelected(pm.id)}
            />
            {pm.name}
          </label>
        ))}
      </div>

      <button
        onClick={handleCheckout}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Confirm & Pay
      </button>
    </div>
  );
}
