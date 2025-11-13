// src/components/CartItem.jsx
export default function CartItem({ title, price, onRemove }) {
  return (
    <div className="border rounded p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">Rp{price.toLocaleString()}</p>
      </div>
      <button onClick={onRemove} className="text-red-600 hover:underline">
        Remove
      </button>
    </div>
  );
}
