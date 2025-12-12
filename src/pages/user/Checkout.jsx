// src/pages/user/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import CheckoutStepper from "../../components/ui/CheckoutStepper.jsx";
import { formatCurrency } from "../../lib/format.js";
import { saveTransactionTotals } from "../../lib/transactionTotals"; // <-- import helper

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const selectedCartIds = location.state?.selectedCartIds || [];

  const [loading, setLoading] = useState(false);
  const [carts, setCarts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // -------------------------
  // Load carts, payment methods & promos
  // -------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [cartRes, pmRes, promoRes] = await Promise.all([
          api.get("/carts"),
          api.get("/payment-methods"),
          api.get("/promos"),
        ]);

        const allCarts = cartRes.data?.data || [];
        const filtered =
          selectedCartIds.length > 0
            ? allCarts.filter((c) => selectedCartIds.includes(c.id))
            : allCarts;

        setCarts(filtered);
        setPaymentMethods(pmRes.data?.data || []);
        setAvailablePromos(promoRes.data?.data || []);
      } catch (err) {
        console.error("Error load checkout data:", err.response?.data || err);
        showToast({
          type: "error",
          message: "Gagal memuat data checkout.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Hitung subtotal, diskon, total
  // -------------------------
  const { subtotal, discount, totalToPay } = useMemo(() => {
    const sub = carts.reduce((sum, cart) => {
      const price = cart.activity?.price || 0;
      return sum + price * (cart.quantity || 1);
    }, 0);

    const disc = appliedPromoCode ? promoDiscount : 0;

    const total = Math.max(sub - disc, 0);

    return { subtotal: sub, discount: disc, totalToPay: total };
  }, [carts, appliedPromoCode, promoDiscount]);

  // -------------------------
  // Form validation
  // -------------------------
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) errors.name = "Nama lengkap wajib diisi";
    if (!email.trim()) errors.email = "Email wajib diisi";
    if (!phoneNumber.trim()) errors.phone = "Nomor telepon wajib diisi";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Format email tidak valid";
    }

    // Phone number validation (min 10 digits)
    if (phoneNumber && phoneNumber.replace(/\D/g, "").length < 10) {
      errors.phone = "Nomor telepon minimal 10 digit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------------
  // Promo handler
  // -------------------------
  function handleApplyPromo() {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      showToast({
        type: "error",
        message: "Masukkan kode promo terlebih dahulu.",
      });
      return;
    }

    // Find promo from API data
    const foundPromo = availablePromos.find(
      (p) => p.promo_code?.toUpperCase() === code
    );

    if (!foundPromo) {
      showToast({
        type: "error",
        message: "Kode promo tidak valid atau sudah kadaluarsa.",
      });
      return;
    }

    // Validate minimum claim price
    const subtotalCalc = carts.reduce((sum, cart) => {
      const price = cart.activity?.price || 0;
      return sum + price * (cart.quantity || 1);
    }, 0);

    const minPrice = foundPromo.minimum_claim_price || 0;
    if (minPrice > 0 && subtotalCalc < minPrice) {
      showToast({
        type: "error",
        message: `Minimum transaksi ${formatCurrency(
          minPrice
        )} untuk promo ini.`,
      });
      return;
    }

    setAppliedPromoCode(code);
    setPromoDiscount(foundPromo.promo_discount_price || 0);
    showToast({
      type: "success",
      message: `Promo ${code} berhasil digunakan!`,
    });
  }

  // Remove promo
  function handleRemovePromo() {
    setAppliedPromoCode(null);
    setPromoDiscount(0);
    setPromoCodeInput("");
    showToast({
      type: "info",
      message: "Promo telah dihapus.",
    });
  }

  // -------------------------
  // Confirm checkout
  // -------------------------
  async function handleConfirmCheckout() {
    if (loading) return;

    if (carts.length === 0) {
      showToast({
        type: "error",
        message: "Keranjang masih kosong.",
      });
      return;
    }

    if (!selectedPaymentMethodId) {
      showToast({
        type: "error",
        message: "Pilih metode pembayaran terlebih dahulu.",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      showToast({
        type: "error",
        message: "Mohon lengkapi data dengan benar.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cartIds:
          selectedCartIds.length > 0 ? selectedCartIds : carts.map((c) => c.id),
        paymentMethodId: selectedPaymentMethodId,
        promoCode: appliedPromoCode ?? null,
        customerName: name,
        customerEmail: email,
        customerPhone: phoneNumber,
        notes,
      };

      const res = await api.post("/create-transaction", payload);
      const newTx = res.data?.data;

      // Simpan total transaksi secara terstruktur menggunakan helper
      if (newTx?.id) {
        saveTransactionTotals(newTx.id, {
          subtotal,
          discount,
          total: totalToPay,
        });
      }

      showToast({
        type: "success",
        message: "Transaksi berhasil dibuat!",
      });

      // Navigate to transactions page
      navigate("/my-transactions", {
        state: {
          transactionId: newTx?.id,
          total: totalToPay,
        },
      });
    } catch (err) {
      console.error("Error create transaction:", err.response?.data || err);
      let errorMsg = "Gagal membuat transaksi.";

      if (err.response?.data?.errors) {
        errorMsg = err.response.data.errors[0]?.msg || errorMsg;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      showToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // UI
  // -------------------------
  if (loading && carts.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <section className="space-y-4">
        <CheckoutStepper activeStep={2} />
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">
            Keranjangmu kosong. Silakan pilih aktivitas terlebih dahulu.
          </p>
          <button
            onClick={() => navigate("/activity")}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800"
          >
            Lihat Aktivitas
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <CheckoutStepper activeStep={2} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
        {/* FORM */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h1 className="text-lg font-semibold">Data Diri</h1>
          <p className="text-xs text-slate-500">
            Pastikan data kamu sudah benar sebelum melanjutkan pembayaran.
          </p>

          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Nama Lengkap *</label>
              <input
                type="text"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:ring-slate-900/10"
                }`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name)
                    setFormErrors({ ...formErrors, name: null });
                }}
                placeholder="Nama lengkap"
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Email *</label>
              <input
                type="email"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:ring-slate-900/10"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email)
                    setFormErrors({ ...formErrors, email: null });
                }}
                placeholder="email@example.com"
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Nomor Telepon *</label>
              <input
                type="tel"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  formErrors.phone
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:ring-slate-900/10"
                }`}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (formErrors.phone)
                    setFormErrors({ ...formErrors, phone: null });
                }}
                placeholder="08xxxxxxxxxx"
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">
                Catatan (opsional)
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk perjalananmu..."
              />
            </div>
          </div>
        </div>

        {/* RINGKASAN & PEMBAYARAN */}
        <aside className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Ringkasan & Pembayaran</h2>

          <div className="border border-slate-100 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Diskon promo</span>
              <span className="font-medium text-emerald-600">
                {discount > 0 ? `- ${formatCurrency(discount)}` : "-"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dashed border-slate-200 mt-1">
              <span className="font-semibold">Total bayar</span>
              <span className="font-semibold">
                {formatCurrency(totalToPay)}
              </span>
            </div>
          </div>

          {/* Input kode promo */}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Kode Promo"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                disabled={appliedPromoCode}
              />
              {appliedPromoCode ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Hapus
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
                >
                  Gunakan
                </button>
              )}
            </div>

            {appliedPromoCode && (
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700">
                  Promo{" "}
                  <span className="font-semibold">{appliedPromoCode}</span>{" "}
                  aktif
                </p>
                <p className="text-xs font-semibold text-emerald-700">
                  - {formatCurrency(promoDiscount)}
                </p>
              </div>
            )}

            {/* Info promos available */}
            {availablePromos.length > 0 && !appliedPromoCode && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Promo tersedia:</p>
                <div className="flex flex-wrap gap-1">
                  {availablePromos.slice(0, 3).map((promo) => (
                    <span
                      key={promo.id}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px]"
                      title={`Min. transaksi ${formatCurrency(
                        promo.minimum_claim_price || 0
                      )}`}
                    >
                      {promo.promo_code}
                    </span>
                  ))}
                  {availablePromos.length > 3 && (
                    <span className="text-[10px] text-slate-400">
                      +{availablePromos.length - 3} lainnya
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pilih metode pembayaran */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-slate-500">Metode Pembayaran *</p>

            {paymentMethods.length === 0 ? (
              <p className="text-xs text-slate-400">
                Loading metode pembayaran...
              </p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-pointer text-sm transition 
                      ${
                        selectedPaymentMethodId === pm.id
                          ? "border-slate-900 bg-slate-900/5"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="accent-slate-900"
                        checked={selectedPaymentMethodId === pm.id}
                        onChange={() => setSelectedPaymentMethodId(pm.id)}
                      />
                      <span>{pm.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tombol konfirmasi */}
          <button
            type="button"
            onClick={handleConfirmCheckout}
            disabled={loading || !selectedPaymentMethodId}
            className="w-full mt-2 rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-800 transition"
          >
            {loading ? "Memproses..." : "Konfirmasi Checkout"}
          </button>
        </aside>
      </div>
    </section>
  );
}
