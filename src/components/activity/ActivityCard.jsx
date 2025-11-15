// src/components/ActivityCard.jsx
export default function ActivityCard({ title, description, price, imageUrl }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <img
        src={imageUrl}
        alt={title}
        className="h-40 w-full object-cover rounded mb-3"
      />
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="mt-2 font-bold text-blue-600">Rp{price.toLocaleString()}</p>
    </div>
  );
}
