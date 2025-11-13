// src/pages/user/Homepage.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function Homepage() {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [p, a] = await Promise.all([
        api.get("/promos"),
        api.get("/activities?limit=8"),
      ]);
      setPromos(p.data.data);
      setActivities(a.data.data);
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Promos</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {promos.map((promo) => (
            <div key={promo.id} className="border p-4 rounded">
              <p className="font-semibold">{promo.title}</p>
              <p className="text-sm">{promo.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between mb-3">
          <h2 className="text-xl font-bold">Activities</h2>
          <Link to="/activity" className="text-blue-600">
            See all
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {activities.map((act) => (
            <Link
              key={act.id}
              to={`/activity/${act.id}`}
              className="border p-4 rounded hover:shadow"
            >
              <p className="font-semibold">{act.title}</p>
              <p className="text-sm">Rp{act.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
