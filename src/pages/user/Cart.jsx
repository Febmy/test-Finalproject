// src/pages/user/Cart.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/carts");
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Cart error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id) => {
    try {
      await api.delete(`/delete-cart/${id}`);
      fetchCart(); // refresh cart
    } catch (err) {
      console.error("Remove error:", err.response?.data || err.message);
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  if (loading) return <p className="p-6">Loading cart...</p>;

  const total = items.reduce(
    (sum, item) => sum + (item.activity?.price || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{item.activity?.title}</p>
                  <p className="text-sm text-gray-600">
                    Rp{item.activity?.price?.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center border-t pt-4">
            <p className="font-bold">Total: Rp{total.toLocaleString()}</p>
            <button
              onClick={checkout}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
