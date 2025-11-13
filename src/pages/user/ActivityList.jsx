import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function ActivityList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/activities");
        setItems(res.data.data || []);
      } catch (e) {
        console.error(e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((act) => (
        <Link
          key={act.id}
          to={`/activity/${act.id}`}
          className="border rounded p-4 hover:shadow"
        >
          <p className="font-semibold">{act.title}</p>
          <p className="text-sm text-gray-600">
            Rp{(act.price || 0).toLocaleString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
