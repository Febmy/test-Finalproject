// src/pages/admin/AdminPaymentMethods.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../lib/format.js";

const PAYMENT_TYPES = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit_card", label: "Credit Card" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "virtual_account", label: "Virtual Account" },
  { value: "qris", label: "QRIS" },
  { value: "cash", label: "Cash" },
];

const initialForm = {
  name: "",
  description: "",
  type: "bank_transfer",
  isActive: true,
  accountName: "",
  accountNumber: "",
  virtualAccountName: "",
  virtualAccountNumber: "",
  iconUrl: "",
  fee: 0,
  feePercentage: 0,
};

export default function AdminPaymentMethods() {
  const { showToast } = useToast();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch payment methods
  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payment-methods");
      setMethods(res.data?.data || []);
    } catch (err) {
      console.error(
        "Fetch payment methods error:",
        err.response?.data || err.message
      );
      setError("Gagal memuat data metode pembayaran.");
      showToast({
        type: "error",
        message: "Gagal memuat data metode pembayaran.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Start create new
  const startCreate = () => {
    resetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start edit existing
  const startEdit = (method) => {
    setEditing(method);
    setForm({
      name: method.name || "",
      description: method.description || "",
      type: method.type || "bank_transfer",
      isActive: method.isActive ?? true,
      accountName: method.accountName || "",
      accountNumber: method.accountNumber || "",
      virtualAccountName: method.virtualAccountName || "",
      virtualAccountNumber: method.virtualAccountNumber || "",
      iconUrl: method.iconUrl || "",
      fee: method.fee || 0,
      feePercentage: method.feePercentage || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast({
        type: "error",
        message: "Nama metode pembayaran wajib diisi.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare payload
      const payload = {
        name: form.name.trim(),
        description: form.description,
        type: form.type,
        isActive: Boolean(form.isActive),
        accountName: form.accountName || null,
        accountNumber: form.accountNumber || null,
        virtualAccountName: form.virtualAccountName || null,
        virtualAccountNumber: form.virtualAccountNumber || null,
        iconUrl: form.iconUrl || null,
        fee: Number(form.fee) || 0,
        feePercentage: Number(form.feePercentage) || 0,
      };

      // Remove empty strings
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }
      });

      if (editing?.id) {
        // Update
        await api.post(`/update-payment-method/${editing.id}`, payload);
        showToast({
          type: "success",
          message: "Metode pembayaran berhasil diperbarui.",
        });
      } else {
        // Create
        await api.post("/create-payment-method", payload);
        showToast({
          type: "success",
          message: "Metode pembayaran baru berhasil dibuat.",
        });
      }

      resetForm();
      await fetchMethods();
    } catch (err) {
      console.error(
        "Save payment method error:",
        err.response?.data || err.message
      );
      showToast({
        type: "error",
        message:
          err.response?.data?.message || "Gagal menyimpan metode pembayaran.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete method
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus metode pembayaran ini?")) return;

    try {
      await api.delete(`/delete-payment-method/${id}`);
      showToast({
        type: "success",
        message: "Metode pembayaran berhasil dihapus.",
      });
      fetchMethods();
    } catch (err) {
      console.error(
        "Delete payment method error:",
        err.response?.data || err.message
      );
      showToast({
        type: "error",
        message: "Gagal menghapus metode pembayaran.",
      });
    }
  };

  // Toggle active status
  const toggleActive = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.post(`/update-payment-method/${id}`, { isActive: newStatus });

      setMethods((prev) =>
        prev.map((method) =>
          method.id === id ? { ...method, isActive: newStatus } : method
        )
      );

      showToast({
        type: "success",
        message: `Metode pembayaran ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }.`,
      });
    } catch (err) {
      console.error("Toggle active error:", err.response?.data || err.message);
      showToast({ type: "error", message: "Gagal mengubah status." });
    }
  };

  // Get payment type label
  const getTypeLabel = (type) => {
    const found = PAYMENT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <AdminLayout title="Payment Method Management">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              Payment Method Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Kelola metode pembayaran yang tersedia untuk transaksi user.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm hover:bg-slate-800"
          >
            + Tambah Metode
          </button>
        </div>

        {/* FORM */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm md:text-base">
            {editing
              ? "Edit Metode Pembayaran"
              : "Tambah Metode Pembayaran Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nama Metode *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: BCA Transfer"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Deskripsi metode pembayaran..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Tipe Pembayaran *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {PAYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    URL Icon (opsional)
                  </label>
                  <input
                    type="url"
                    name="iconUrl"
                    value={form.iconUrl}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="https://example.com/icon.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Biaya Tetap (Fee)
                    </label>
                    <input
                      type="number"
                      name="fee"
                      value={form.fee}
                      onChange={handleChange}
                      min="0"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Biaya Persen (%)
                    </label>
                    <input
                      type="number"
                      name="feePercentage"
                      value={form.feePercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nama Akun (untuk transfer)
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={form.accountName}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: PT Travel App Indonesia"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nomor Akun
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: 1234567890"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nama Virtual Account
                  </label>
                  <input
                    type="text"
                    name="virtualAccountName"
                    value={form.virtualAccountName}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: BCA Virtual Account"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nomor Virtual Account
                  </label>
                  <input
                    type="text"
                    name="virtualAccountNumber"
                    value={form.virtualAccountNumber}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: 888801234567890"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Status Aktif
                  </label>
                  <div className="flex items-center h-[42px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-2 text-sm text-slate-700">
                        {form.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-between pt-3">
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs px-3 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Batal Edit
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm disabled:bg-slate-400"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editing
                  ? "Simpan Perubahan"
                  : "Buat Metode Pembayaran"}
              </button>
            </div>
          </form>
        </section>

        {/* PAYMENT METHODS LIST */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm md:text-base">
              Daftar Metode Pembayaran ({methods.length})
            </h2>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : methods.length === 0 ? (
            <EmptyState
              title="Belum ada metode pembayaran"
              description="Tambahkan metode pembayaran pertama Anda menggunakan form di atas."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-3">Metode</th>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Biaya</th>
                    <th className="py-2 px-3">Dibuat</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((method) => (
                    <tr
                      key={method.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          {method.iconUrl && (
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                              <img
                                src={method.iconUrl}
                                alt={method.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">
                              {method.name}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {method.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          {getTypeLabel(method.type)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() =>
                            toggleActive(method.id, method.isActive)
                          }
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                            method.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {method.isActive ? "✓ Aktif" : "✗ Nonaktif"}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-xs">
                          {method.fee > 0 && (
                            <p className="text-slate-700">
                              Fee: Rp{method.fee.toLocaleString()}
                            </p>
                          )}
                          {method.feePercentage > 0 && (
                            <p className="text-slate-700">
                              %: {method.feePercentage}%
                            </p>
                          )}
                          {method.fee === 0 && method.feePercentage === 0 && (
                            <p className="text-slate-400">Gratis</p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        {formatDateTime(method.createdAt || method.updatedAt)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => startEdit(method)}
                            className="px-2 py-1 rounded-full border border-slate-300 text-[11px] text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(method.id)}
                            className="px-2 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
