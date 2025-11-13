// src/pages/user/MyTransactions.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/my-transactions");
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error(
          "Error fetching transactions:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <p className="p-6">Loading transactions...</p>;

  // Filter transaksi berdasarkan status
  const filtered =
    status === "all"
      ? transactions
      : transactions.filter((trx) => trx.status === status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Transactions</h1>

      {/* Dropdown filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border px-2 py-1 mb-4"
      >
        <option value="all">All</option>
        <option value="success">Success</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>

      {filtered.length === 0 ? (
        <p>No transactions found for status "{status}".</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((trx) => (
            <div key={trx.id} className="border rounded p-4">
              <p className="font-semibold">
                {trx.activity?.title || "No activity data"}
              </p>
              <p className="text-sm text-gray-600">
                Rp{trx.activity?.price?.toLocaleString() || 0} — {trx.status}
              </p>
              <p className="text-xs text-gray-500">
                Date: {new Date(trx.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                Payment: {trx.paymentMethod?.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
