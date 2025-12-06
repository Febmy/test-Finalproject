// src/components/cart/CartItem.jsx
import { formatCurrency } from "../../lib/format.js";

// Helper: ambil image dengan fallback elegan
function getActivityImage(activity = {}) {
  return (
    activity.imageUrl ||
    (Array.isArray(activity.imageUrls) && activity.imageUrls[0]) ||
    activity.thumbnail ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200"
  );
}

export default function CartItem({
  item,
  onIncrease = () => {},
  onDecrease = () => {},
  onRemove = () => {},
}) {
  if (!item) return null;

  const { activity = {}, quantity = 1 } = item;

  const {
    title = "Activity",
    description = "Aktivitas pilihanmu.",
    price = 0,
  } = activity;

  const imageUrl = getActivityImage(activity);
  const total = price * quantity;

  return (
    <article className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 shadow-sm">
      {/* THUMBNAIL */}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
        {/* LEFT */}
        <div className="space-y-1 min-w-0">
          <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
            {title}
          </p>

          <p className="text-xs text-slate-500 line-clamp-1">{description}</p>

          <p className="text-xs text-slate-500">
            {formatCurrency(price)} x {quantity}
          </p>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex flex-col items-end gap-2">
          {/* Quantity Controls */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1">
            <button
              type="button"
              onClick={onDecrease}
              className="w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center border border-slate-200 hover:bg-slate-50"
            >
              -
            </button>

            <span className="text-xs md:text-sm font-medium min-w-[20px] text-center">
              {quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              className="w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center border border-slate-200 hover:bg-slate-50"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] text-red-600 hover:text-red-700 hover:underline"
          >
            Hapus
          </button>

          {/* Total Price */}
          <p className="text-xs font-semibold text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </article>
  );
}
