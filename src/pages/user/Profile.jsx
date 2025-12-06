// src/pages/user/Profile.jsx
import { useEffect, useState, useRef } from "react";
import api from "../../lib/api";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { User, Mail, Phone, Camera, Save, Edit2 } from "lucide-react";

export default function Profile() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [editMode, setEditMode] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        let data = null;
        const endpoints = ["/me", "/profile", "/user/profile", "/users/me"];
        for (const ep of endpoints) {
          try {
            const res = await api.get(ep, { signal: controller.signal });
            data = res.data?.data || res.data || null;
            if (data) break;
          } catch (_) {
            continue;
          }
        }
        if (!data) {
          const raw = localStorage.getItem("userProfile");
          if (raw) data = JSON.parse(raw);
        }
        if (!data) data = {};
        const normalized = {
          id: data.id ?? data.userId ?? "",
          name: data.name ?? data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? data.phoneNumber ?? "",
          avatar:
            data.avatar ??
            data.profilePicture ??
            data.image ??
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(data.name || "U"),
        };
        if (mounted) setProfile(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          showToast({ type: "error", message: "Gagal memuat profil." });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!profile.name || !profile.email) {
      showToast({ type: "error", message: "Nama & Email wajib diisi." });
      return;
    }
    const payload = {
      name: profile.name,
      phone: profile.phone,
      avatar: profile.avatar,
    };
    const updatePaths = [
      "/update-profile",
      "/profile",
      "/me/update",
      "/users/me",
      "/user/profile",
    ];
    try {
      setSaving(true);
      let updated = null;
      for (const path of updatePaths) {
        try {
          const res = await api.patch(path, payload);
          updated = res.data?.data || res.data;
          break;
        } catch {
          try {
            const resAlt = await api.put(path, payload);
            updated = resAlt.data?.data || resAlt.data;
            break;
          } catch {
            continue;
          }
        }
      }
      if (!updated) updated = payload;
      const finalProfile = { ...profile, ...updated };
      setProfile(finalProfile);
      localStorage.setItem("userProfile", JSON.stringify(finalProfile));
      showToast({ type: "success", message: "Profil berhasil diperbarui." });
      setEditMode(false);
    } catch (err) {
      showToast({
        type: "error",
        message: err.response?.data?.message || "Gagal menyimpan perubahan.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-blue-100">
                  Manage your personal information
                </p>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>{editMode ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {editMode && (
                  <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
                    <Camera className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.name}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-gray-500">
                    {profile.phone || "No phone number"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </label>
                  <input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={!editMode}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </label>
                  <input
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed after registration.
                  </p>
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    disabled={!editMode}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Camera className="h-4 w-4" />
                    <span>Profile Picture URL</span>
                  </label>
                  <input
                    value={profile.avatar}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, avatar: e.target.value }))
                    }
                    disabled={!editMode}
                    placeholder="https://image-link.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {editMode && (
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-2">
                      <Save className="h-5 w-5" />
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </div>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
