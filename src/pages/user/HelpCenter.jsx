// src/pages/user/HelpCenter.jsx
import PageContainer from "../../components/layout/PageContainer";

export default function HelpCenter() {
  const faqs = [
    {
      q: "Bagaimana cara memesan aktivitas?",
      a: "Pilih aktivitas yang diinginkan, masukkan ke keranjang, lalu lakukan checkout melalui halaman cart.",
    },
    {
      q: "Bagaimana cara menggunakan kode promo?",
      a: "Masukkan kode promo pada halaman checkout. Jika valid, potongan akan diterapkan otomatis oleh sistem.",
    },
    {
      q: "Apakah saya bisa membatalkan transaksi?",
      a: "Beberapa transaksi bisa dibatalkan selama statusnya masih Pending. Buka halaman My Transactions dan cek opsi 'Batalkan'.",
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "Kami mendukung Virtual Account, Bank Transfer, dan metode lainnya sesuai penyedia pembayaran.",
    },
  ];

  const contacts = [
    {
      label: "Email Support",
      value: "support@travelapp.com",
      link: "mailto:support@travelapp.com",
    },
    {
      label: "WhatsApp",
      value: "+62 812-3456-7890",
      link: "https://wa.me/6281234567890",
    },
    {
      label: "Instagram",
      value: "@travelapp",
      link: "https://instagram.com/travelapp",
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Page Title */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Help Center</h1>
          <p className="text-sm text-slate-500">
            Temukan jawaban dari pertanyaan yang sering diajukan.
          </p>
        </header>

        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Pertanyaan Umum (FAQ)
          </h2>

          <div className="space-y-4">
            {faqs.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2"
              >
                <p className="font-medium text-slate-900">{item.q}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Kontak Kami
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 hover:shadow-sm transition"
              >
                <p className="text-sm text-slate-500">{c.label}</p>
                <a
                  href={c.link}
                  target="_blank"
                  className="text-slate-900 font-medium hover:underline"
                >
                  {c.value}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Help Section */}
        <section className="pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Masih butuh bantuan? Kami siap membantu melalui layanan support
            24/7.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
