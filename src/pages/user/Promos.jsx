// src/pages/Promos.jsx
export default function Promos() {
  const promos = [
    {
      id: 1,
      title: "Staycation Brings Silaturahmi 🙏",
      desc: "Diskon hingga Rp1 juta untuk Hotels, Villas & Resorts.",
    },
    { id: 2, title: "Test Promo Fixed", desc: "Test description" },
    {
      id: 3,
      title: "Staycation Brings Silaturahmi 🙏",
      desc: "Diskon hingga Rp1 juta untuk Hotels, Villas & Resorts.",
    },
    // tambahkan data lain sesuai API
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-6">Promo</h1>

      {/* Grid sesuai wireframe */}
      <div className="grid md:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="border rounded p-4 hover:shadow">
            <h2 className="font-semibold mb-2">{promo.title}</h2>
            <p className="text-gray-600 text-sm">{promo.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
