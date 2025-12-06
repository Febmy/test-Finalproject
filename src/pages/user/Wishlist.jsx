// src/pages/user/Wishlist.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../lib/format";
import { getFriendlyErrorMessage } from "../../lib/errors";

// Fallback image
const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg?auto=compress&cs=tinysrgb&w=1200";

/**
 * Wishlist Page
 * - Auto-detects API endpoint: /wishlist, /wishlists, /favorites
 * - Supports remove from wishlist
 * - Clean responsive design
 */

export default function Wishlist() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  // Load wishlist
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // Try multiple possible endpoints
        const endpoints = ["/wishlist", "/wishlists", "/favorites"];

        let response = null;
        let data = null;

        // Try each endpoint until one works
        for (const ep of endpoints) {
          try {
            const res = await api.get(ep, { signal: controller.signal });
            response = res;
            break;
          } catch (err) {
            if (err.response?.status === 404) {
              continue; // Try next endpoint
            }
            throw err; // Re-throw other errors
          }
        }

        if (!response) {
          // No endpoint worked
          setWishlist([]);
          return;
        }

        // Extract data from response
        data = response.data?.data ?? response.data ?? null;

        if (!data) data = [];

        // Handle different response formats
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];

        // Normalize wishlist items
        const normalized = arr.map((item) => {
          const activity = item.activity ?? item.activityDetail ?? item;

          return {
            id: item.id ?? item._id ?? item.wishlistId ?? null,
            activityId:
              activity.id ?? activity._id ?? activity.activityId ?? null,
            title: activity.title ?? activity.name ?? "Untitled Activity",
            price:
              activity.price ??
              activity.pricePerPerson ??
              activity.unitPrice ??
              0,
            image:
              activity.imageUrl ||
              (Array.isArray(activity.imageUrls) && activity.imageUrls[0]) ||
              activity.thumbnail ||
              activity.image ||
              FALLBACK_IMAGE,
            description:
              activity.shortDescription ??
              activity.description ??
              "No description available.",
            category: activity.category?.name ?? activity.categoryName ?? null,
            location: activity.location ?? activity.city ?? null,
            createdAt: item.createdAt ?? item.created_at ?? item.date,
          };
        });

        if (!mounted) return;
        setWishlist(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Wishlist load error:", err);

          if (err.response?.status === 404) {
            setError("Fitur wishlist belum tersedia di API ini.");
          } else {
            const errorMsg = getFriendlyErrorMessage(
              err,
              "Gagal memuat wishlist."
            );
            setError(errorMsg);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Remove from wishlist
  const removeItem = async (wishId) => {
    const ok = window.confirm("Hapus item ini dari wishlist?");
    if (!ok) return;

    try {
      setRemoving((prev) => ({ ...prev, [wishId]: true }));

      // Try multiple possible delete endpoints
      const endpoints = [
        `/wishlist/${wishId}`,
        `/wishlists/${wishId}`,
        `/favorites/${wishId}`,
        `/delete-wishlist/${wishId}`,
      ];

      let success = false;
      let errorMsg = "";

      for (const ep of endpoints) {
        try {
          await api.delete(ep);
          success = true;
          break;
        } catch (err) {
          errorMsg = err.response?.data?.message || err.message;
          continue;
        }
      }

      if (!success) {
        throw new Error(
          errorMsg || "Endpoint delete wishlist tidak ditemukan."
        );
      }

      // Remove from state
      setWishlist((prev) => prev.filter((w) => w.id !== wishId));

      showToast({
        type: "success",
        message: "Item berhasil dihapus dari wishlist.",
      });
    } catch (err) {
      console.error("Remove wishlist error:", err);
      showToast({
        type: "error",
        message: err.message || "Gagal menghapus item.",
      });
    } finally {
      setRemoving((prev) => ({ ...prev, [wishId]: false }));
    }
  };

  // Add to cart from wishlist
  const addToCart = async (activityId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast({
          type: "error",
          message: "Silakan login terlebih dahulu.",
        });
        navigate("/login");
        return;
      }

      await api.post("/add-cart", {
        activityId: activityId,
        bookingDate: null,
      });

      showToast({
        type: "success",
        message: "Berhasil ditambahkan ke keranjang!",
      });

      // Navigate to cart
      setTimeout(() => {
        navigate("/cart");
      }, 1000);
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast({
        type: "error",
        message: "Gagal menambahkan ke keranjang.",
      });
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-10">
          <Spinner size={32} />
          <p className="mt-4 text-sm text-slate-500">Memuat wishlist...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Empty wishlist
  if (wishlist.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20">
        <EmptyState
          icon="❤️"
          title="Wishlist Kosong"
          description="Tambahkan aktivitas favorit Anda ke wishlist untuk menyimpannya nanti."
          action={
            <button
              onClick={() => navigate("/activity")}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Jelajahi Aktivitas
            </button>
          }
        />
      </div>
    );
  }

  // Wishlist list
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Wishlist
        </h1>
        <p className="text-sm text-slate-600">
          {wishlist.length} aktivitas favorit Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Image */}
            <div
              className="h-48 w-full overflow-hidden bg-slate-100 cursor-pointer"
              onClick={() => navigate(`/activity/${item.activityId}`)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title & Info */}
              <div>
                <h2
                  className="font-semibold text-slate-900 text-base line-clamp-1 cursor-pointer hover:text-slate-700"
                  onClick={() => navigate(`/activity/${item.activityId}`)}
                >
                  {item.title}
                </h2>

                <div className="flex items-center gap-2 mt-1">
                  {item.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                      {item.category}
                    </span>
                  )}
                  {item.location && (
                    <span className="text-[11px] text-slate-500">
                      {item.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 line-clamp-2">
                {item.description}
              </p>

              {/* Price */}
              <div className="font-semibold text-slate-900">
                {formatCurrency(item.price)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => addToCart(item.activityId)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                >
                  Tambah ke Keranjang
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={removing[item.id]}
                  className="p-2 rounded-xl border border-slate-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title="Hapus dari wishlist"
                >
                  {removing[item.id] ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "✕"
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Info Footer */}
      {wishlist.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Wishlist disimpan di akun Anda. Data diambil dari API yang tersedia.
          </p>
        </div>
      )}
    </div>
  );
}
