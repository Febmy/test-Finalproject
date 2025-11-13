// src/pages/user/ActivityDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get(`/activity/${id}`).then((res) => setActivity(res.data.data));
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post("/add-cart", { activityId: id });
      navigate("/cart");
    } catch (err) {
      alert("Gagal menambahkan ke cart");
    }
  };

  if (!activity) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{activity.title}</h1>
      <p>Rp{activity.price.toLocaleString()}</p>
      <p>{activity.description}</p>
      <button
        onClick={addToCart}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Add to Cart
      </button>
    </div>
  );
}
