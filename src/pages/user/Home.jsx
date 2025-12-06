// src/pages/user/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { formatCurrency } from "../../lib/format.js";
import { getFriendlyErrorMessage } from "../../lib/errors.js";
import ActivityCard from "../../components/activity/ActivityCard.jsx";
import {
  Search,
  Star,
  Shield,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const FALLBACK_ACTIVITY_IMAGE =
  "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg";
const FALLBACK_PROMO_IMAGE =
  "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg";

export default function Home() {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popularCount, setPopularCount] = useState(6);

  const navigate = useNavigate();

  const loadHomepage = async () => {
    try {
      setLoading(true);
      setError("");
      const [pRes, aRes, cRes] = await Promise.all([
        api.get("/promos"),
        api.get("/activities?limit=12"),
        api.get("/categories"),
      ]);
      setPromos(pRes.data?.data || []);
      setActivities(aRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    } catch (err) {
      const msg = getFriendlyErrorMessage(err, "Gagal memuat data homepage.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomepage();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
          <div className="h-52 md:h-64 rounded-3xl bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse" />
          <div className="h-32 rounded-3xl bg-gradient-to-r from-teal-100 to-blue-100 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-40 rounded-2xl bg-gradient-to-r from-blue-100 to-teal-100 animate-pulse" />
            <div className="h-40 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse" />
            <div className="h-40 rounded-2xl bg-gradient-to-r from-teal-100 to-blue-100 animate-pulse" />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={loadHomepage}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 text-white"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-sm">
            <span className="font-semibold text-blue-700">TravelApp</span>
            <span className="text-blue-400">•</span>
            <span className="text-blue-600">Smart Travel Companion</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Visit The Most{" "}
              <span className="text-teal-600">Beautiful Places</span> In The
              World
            </h1>
            <p className="text-lg text-blue-700 max-w-2xl">
              Plan and book your perfect trip with expert advice, destination
              information, and special promos from Travel Journal API.
            </p>
          </div>

          {/* Hero Promo Card */}
          {promos[0] && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-8 md:p-10 text-white">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm uppercase tracking-widest mb-2">
                      Exclusive Promo
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      {promos[0].title}
                    </h2>
                    <p className="text-blue-100 mb-6">
                      {promos[0].description ||
                        "Special discount for your next adventure"}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                        Code: {promos[0].promo_code}
                      </span>
                      <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                        Discount:{" "}
                        {formatCurrency(promos[0].promo_discount_price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <img
                      src={promos[0].imageUrl || FALLBACK_PROMO_IMAGE}
                      alt={promos[0].title}
                      className="rounded-2xl shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Search className="h-6 w-6" />,
              title: "Activities",
              desc: "Explore amazing destinations",
              to: "/activity",
              color: "from-blue-500 to-teal-500",
            },
            {
              icon: <Star className="h-6 w-6" />,
              title: "Promos",
              desc: "Best deals & discounts",
              to: "/promos",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: "Secure Booking",
              desc: "Safe & reliable transactions",
              to: "/transactions",
              color: "from-teal-500 to-blue-500",
            },
            {
              icon: <Clock className="h-6 w-6" />,
              title: "Fast Support",
              desc: "24/7 customer service",
              to: "/help-center",
              color: "from-blue-500 to-purple-500",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className={`bg-gradient-to-r ${item.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-blue-100">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Features */}
        <section className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose TravelApp?
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Travel smarter with curated destinations, exclusive promos, and
              seamless booking experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Curated Destinations",
                desc: "Handpicked activities with top ratings",
                icon: "🌍",
              },
              {
                title: "Best Deals",
                desc: "Exclusive discounts and promotions",
                icon: "💸",
              },
              {
                title: "Flexible Schedule",
                desc: "Customizable travel plans",
                icon: "📅",
              },
              {
                title: "Secure Booking",
                desc: "Safe and transparent transactions",
                icon: "🔒",
              },
            ].map((f, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 hover:border-blue-300 transition"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg text-blue-900">{f.title}</h3>
                <p className="text-blue-700 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Activities */}
        {activities.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
                  Popular Destinations
                </h2>
                <p className="text-blue-700">
                  Top picks from Travel Journal API
                </p>
              </div>
              <button
                onClick={() => navigate("/activity")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.slice(0, popularCount).map((act) => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust TravelApp for their journey
            planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/activity")}
              className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition"
            >
              Explore Activities
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition"
            >
              Create Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
