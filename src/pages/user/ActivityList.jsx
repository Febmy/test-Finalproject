// src/pages/user/ActivityList.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import ActivityCard from "../../components/activity/ActivityCard.jsx";
import { formatCurrency } from "../../lib/format.js";
import { getFriendlyErrorMessage } from "../../lib/errors.js";
import { Search, Filter, TrendingUp } from "lucide-react";

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [actRes, promoRes] = await Promise.all([
          api.get("/activities"),
          api.get("/promos"),
        ]);
        setActivities(actRes.data?.data || []);
        setPromos(promoRes.data?.data || []);
      } catch (err) {
        const msg = getFriendlyErrorMessage(
          err,
          "Gagal memuat daftar aktivitas dan promo."
        );
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredActivities = activities.filter((act) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      act.title?.toLowerCase().includes(q) ||
      act.location?.toLowerCase().includes(q);
    const price = act.price || 0;
    let matchesFilter = true;
    if (filter === "budget") matchesFilter = price <= 500_000;
    else if (filter === "premium") matchesFilter = price > 500_000;
    return matchesSearch && matchesFilter;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
          <div className="h-10 w-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Activities
          </h1>
          <p className="text-blue-700 mt-4 max-w-2xl mx-auto">
            Explore various activities and promos available for your next
            adventure.
          </p>
          <p className="text-blue-500 mt-2">
            Showing{" "}
            <span className="font-bold">{filteredActivities.length}</span> of{" "}
            <span className="font-bold">{activities.length}</span> activities
          </p>
        </div>

        {/* Promo Strip */}
        {promos.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6" />
                <h2 className="text-xl font-bold">Hot Promos</h2>
              </div>
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
                {promos.length} available
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {promos.slice(0, 4).map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <h3 className="font-bold text-lg">
                    {promo.title || promo.name}
                  </h3>
                  {promo.promo_code && (
                    <p className="text-sm mt-2">
                      Code:{" "}
                      <span className="font-mono bg-white/20 px-2 py-1 rounded">
                        {promo.promo_code}
                      </span>
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    Min:{" "}
                    {formatCurrency(
                      promo.minimum_claim_price ?? promo.minimumClaimPrice
                    )}
                  </p>
                  <p className="text-sm">
                    Discount:{" "}
                    {formatCurrency(
                      promo.promo_discount_price ?? promo.promoDiscountPrice
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {["all", "budget", "premium"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === type
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {type === "all"
                    ? "All Activities"
                    : type === "budget"
                    ? "Budget (≤500K)"
                    : "Premium (>500K)"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities or locations..."
                className="pl-12 pr-4 py-3 w-full md:w-80 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">
              No activities found
            </h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
