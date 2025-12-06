// src/pages/admin/AdminBanners.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../lib/format.js";

// Helper: Upload gambar ke API
async function uploadBannerImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/upload-image", formData);

    return (
      res.data?.data?.url ||
      res.data?.data?.imageUrl ||
      res.data?.url ||
      res.data?.imageUrl ||
      null
    );
  } catch (err) {
    console.error(
      "Upload banner image error:",
      err.response?.data || err.message
    );
    throw new Error("Gagal mengupload gambar banner.");
  }
}

const initialForm = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  isActive: true,
  orderIndex: 1,
};

export default function AdminBanners() {
  const { showToast } = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch semua banner
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/banners");
      setBanners(res.data?.data || []);
    } catch (err) {
      console.error("Fetch banners error:", err.response?.data || err.message);
      setError("Gagal memuat data banner.");
      showToast({ type: "error", message: "Gagal memuat data banner." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Start create new banner
  const startCreate = () => {
    resetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start edit existing banner
  const startEdit = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive ?? true,
      orderIndex: banner.orderIndex || 1,
    });
    setPreviewUrl(banner.imageUrl || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
    setImageFile(null);
    setPreviewUrl("");
  };

  // Submit form (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast({ type: "error", message: "Judul banner wajib diisi." });
      return;
    }

    try {
      setIsSubmitting(true);

      // Handle image upload
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadBannerImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          showToast({
            type: "error",
            message: "Upload gambar gagal. Gunakan URL manual.",
          });
          return;
        }
      }

      // Prepare payload
      const payload = {
        title: form.title.trim(),
        description: form.description,
        imageUrl: finalImageUrl,
        linkUrl: form.linkUrl || null,
        isActive: Boolean(form.isActive),
        orderIndex: Number(form.orderIndex) || 1,
      };

      if (editing?.id) {
        // Update banner
        await api.post(`/update-banner/${editing.id}`, payload);
        showToast({ type: "success", message: "Banner berhasil diperbarui." });
      } else {
        // Create new banner
        await api.post("/create-banner", payload);
        showToast({ type: "success", message: "Banner baru berhasil dibuat." });
      }

      resetForm();
      await fetchBanners();
    } catch (err) {
      console.error("Save banner error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: err.response?.data?.message || "Gagal menyimpan banner.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus banner ini?")) return;

    try {
      await api.delete(`/delete-banner/${id}`);
      showToast({ type: "success", message: "Banner berhasil dihapus." });
      fetchBanners();
    } catch (err) {
      console.error("Delete banner error:", err.response?.data || err.message);
      showToast({ type: "error", message: "Gagal menghapus banner." });
    }
  };

  // Toggle active status
  const toggleActive = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.post(`/update-banner/${id}`, { isActive: newStatus });

      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === id ? { ...banner, isActive: newStatus } : banner
        )
      );

      showToast({
        type: "success",
        message: `Banner ${newStatus ? "diaktifkan" : "dinonaktifkan"}.`,
      });
    } catch (err) {
      console.error("Toggle active error:", err.response?.data || err.message);
      showToast({ type: "error", message: "Gagal mengubah status banner." });
    }
  };

  return (
    <AdminLayout title="Banner Management">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              Banner Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Kelola banner promosi yang ditampilkan di homepage user.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm hover:bg-slate-800"
          >
            + Tambah Banner
          </button>
        </div>

        {/* FORM */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm md:text-base">
            {editing ? "Edit Banner" : "Buat Banner Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Kiri */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Judul Banner *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Contoh: Promo Musim Panas"
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
                    placeholder="Deskripsi singkat banner..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Link URL (opsional)
                  </label>
                  <input
                    type="url"
                    name="linkUrl"
                    value={form.linkUrl}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="https://example.com/promo"
                  />
                </div>
              </div>

              {/* Kanan */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Urutan (Order)
                    </label>
                    <input
                      type="number"
                      name="orderIndex"
                      value={form.orderIndex}
                      onChange={handleChange}
                      min="1"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Gambar Banner *
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="https://images.pexels.com/..."
                    required={!imageFile}
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Atau upload file gambar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs"
                    />
                  </div>

                  {/* Preview */}
                  {(previewUrl || form.imageUrl) && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">Preview:</p>
                      <div className="w-full h-32 md:h-40 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={previewUrl || form.imageUrl}
                          alt="Preview banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/800x400?text=Gambar+Error";
                          }}
                        />
                      </div>
                    </div>
                  )}
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
                  : "Buat Banner"}
              </button>
            </div>
          </form>
        </section>

        {/* BANNER LIST */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm md:text-base">
              Daftar Banner ({banners.length})
            </h2>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : banners.length === 0 ? (
            <EmptyState
              title="Belum ada banner"
              description="Buat banner pertama Anda menggunakan form di atas."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-3">Banner</th>
                    <th className="py-2 px-3">Judul</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Urutan</th>
                    <th className="py-2 px-3">Dibuat</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-3">
                        <div className="w-20 h-12 rounded overflow-hidden border border-slate-200">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x48?text=Error";
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="max-w-[200px]">
                          <p className="font-medium text-slate-900">
                            {banner.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {banner.description || "No description"}
                          </p>
                          {banner.linkUrl && (
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 hover:underline"
                            >
                              {banner.linkUrl.substring(0, 30)}...
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() =>
                            toggleActive(banner.id, banner.isActive)
                          }
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                            banner.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {banner.isActive ? "✓ Aktif" : "✗ Nonaktif"}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-sm font-medium">
                          {banner.orderIndex}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        {formatDateTime(banner.createdAt || banner.updatedAt)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => startEdit(banner)}
                            className="px-2 py-1 rounded-full border border-slate-300 text-[11px] text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
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
