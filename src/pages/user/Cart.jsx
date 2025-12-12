// src/pages/user/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatCurrency } from "../../lib/format.js";
import CartItem from "../../components/cart/CartItem.jsx";
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import useCart from "../../hooks/userCart.js"; // Gunakan hook yang disesuaikan

export default function Cart() {
  const { items, increase, decrease, removeItem, subtotal, syncWithAPI } =
    useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAndSync = async () => {
      setLoading(true);
      await syncWithAPI(); // Sync local dengan API
      setLoading(false);
    };
    fetchAndSync();
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast({ type: "error", message: "Keranjang kosong." });
      return;
    }
    navigate("/checkout", {
      state: { selectedCartIds: items.map((item) => item.id) },
    });
  };

  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-blue-100">
                {items.length === 0
                  ? "Your cart is empty"
                  : `You have ${items.length} items (${totalQty} persons) in your cart`}
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <ShoppingCart className="h-8 w-8" />
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Start exploring activities and add them to your cart"
            icon="🛒"
            actions={
              <button
                onClick={() => navigate("/activity")}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold"
              >
                Browse Activities
              </button>
            }
          />
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Cart Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrease={() => increase(item.id)} // Handler async ke API + local
                    onDecrease={() => decrease(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Order Summary
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Total for {totalQty} persons
                  </p>
                  <p className="text-4xl font-bold text-blue-600 mt-4">
                    {formatCurrency(subtotal)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate("/activity")}
                    className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
