# TravelApp – Final Project Front End Web Development

TravelApp adalah aplikasi pemesanan aktivitas wisata yang dibangun dengan **React + Vite** dan terhubung ke **Travel Journal API** (`https://travel-journal-api-bootcamp.do.dibimbing.id`).

Proyek ini mensimulasikan platform di mana:

- **User** bisa mencari aktivitas, memesan melalui cart & checkout, serta melihat riwayat transaksi.
- **Admin** bisa mengelola aktivitas, promo, user, dan transaksi melalui admin panel dengan akses berbasis **role**.

---

## 🎯 Tujuan Proyek

- Mengimplementasikan alur **end-to-end** pemesanan aktivitas wisata (browse → cart → checkout → transaksi).
- Menerapkan **autentikasi JWT** dengan proteksi route dan pemisahan jelas antara **dunia User** dan **dunia Admin**.
- Menggunakan best practice frontend:
  - Komponen reusable & terstruktur.
  - Axios instance + interceptor.
  - Context untuk toast notification.
  - Utility helper (format tanggal & currency).

---

## ✨ Ringkasan Fitur

### 👤 Sisi User

- Register & Login.
- Homepage dengan section:
  - Semua Aktivitas.
  - Rekomendasi.
  - Transaksi Saya.
- Activity List + Activity Detail dengan **gallery multi-image** jika `imageUrls` tersedia.
- Cart (tambah/hapus item, clear cart, ringkasan total).
- Checkout (pilih metode pembayaran, create transaction).
- My Transactions (filter by status, sort dari transaksi terbaru).
- Profile (lihat data user yang sedang login).
- Toast notification untuk feedback semua aksi penting.

### 🛠️ Sisi Admin

- Login khusus admin (berbasis **role** dari profil).
- Pemisahan dunia:
  - User **tidak bisa** mengakses `/admin`.
  - Admin **tidak diarahkan** ke halaman user untuk navigasi utama.
- Dashboard ringkasan (total activity, promo, transaksi, user).
- Users Management:
  - Tabel user (nama, email, role).
  - Ubah role user ⇄ admin.
  - **Search** by nama/email.
  - **Pagination**.
- Activities Management:
  - Tabel semua aktivitas.
  - Create / Update / Delete activity.
  - Pilih kategori dari dropdown (`categories` API).
  - Field image:
    - Mendukung `imageUrl` tunggal.
    - Menyiapkan dukungan **multi image** (`imageUrls[]`) dan form upload file.
    - Jika endpoint `/upload-image` error, UI menampilkan toast dan fallback ke input URL manual.
- Promos Management:
  - Create / Update / Delete promo.
  - Field: judul, kode promo, minimum claim, diskon, imageUrl, terms & condition.
  - Data promo juga digunakan sebagai **hero banner** & section promo di sisi user.
- Transactions Management:
  - Tabel semua transaksi admin.
  - Filter by status (All, Pending, Success, Failed, Cancelled).
  - **Sorting tanggal desc** (terbaru di atas).
  - **Pagination** di frontend.
  - Update status transaksi pending → `success` / `failed`.
  - Perubahan status tercermin di halaman My Transactions user.

---

## 🧑‍💻 Tech Stack

- **React 18**
- **Vite**
- **React Router DOM v6**
- **Axios** dengan instance custom di `src/lib/api.js`
- **Tailwind-style utility CSS** (via `index.css`)
- **Context API** untuk Toast (`ToastContext`)
- ESLint (opsional) untuk konsistensi code style

---

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat

- Node.js **v18+**
- npm (bawaan Node)

### 2. Clone & Instalasi

````bash
git clone https://github.com/Febmy/test-Finalproject.git
cd test-Finalproject
npm install

## 🚀 Deploy ke Netlify

Project ini sudah berhasil di-deploy menggunakan [Netlify](https://www.netlify.com).

🔗 **Live Demo:** [finalproject-dibimbing.netlify.app](https://finalproject-dibimbing.netlify.app/)

### Cara Deploy ke Netlify

1. **Build project lokal**
   ```bash
   npm run build

🧱 Struktur Folder

Struktur utama proyek:

src/
  components/
    activity/
      ActivityCard.jsx
    cart/
      CartItem.jsx
    layout/
      Navbar.jsx
      Footer.jsx
      PageContainer.jsx
      ScrollToTop.jsx
      AdminLayout.jsx
    ui/
      EmptyState.jsx
      Spinner.jsx

  context/
    ToastContext.jsx

  lib/
    api.js       # konfigurasi axios (baseURL, apiKey, interceptor)
    format.js    # helper format tanggal & currency

  pages/
    admin/
      AdminDashboard.jsx
      AdminActivities.jsx
      AdminPromos.jsx
      AdminTransactions.jsx
      AdminUsers.jsx
    auth/
      Login.jsx
      Register.jsx
    user/
      Home.jsx
      ActivityList.jsx
      ActivityDetail.jsx
      Cart.jsx
      Checkout.jsx
      Transactions.jsx
      Profile.jsx
      Promos.jsx
      NotFound.jsx

  App.jsx        # routing utama + proteksi route user/admin
  main.jsx       # entry React

🔐 Autentikasi, Role & Proteksi Route

Token JWT disimpan di localStorage setelah login.

Header setiap request diatur oleh axios instance:

baseURL dari VITE_BASE_URL.

apiKey dari VITE_API_KEY.

Authorization: Bearer <token> jika token tersedia.

Komponen helper di App.jsx:

RequireAuth → melindungi semua route user (/, /activity, /cart, dll).

RequireAdmin → melindungi route admin (/admin/...) dan membaca role dari userProfile di localStorage.

Dunia User vs Admin

Navbar & layout user hanya dipakai di route sisi user.

Admin panel menggunakan AdminLayout sendiri dengan sidebar dan tombol logout.

Jika user non-admin mencoba membuka /admin, akan di-redirect (misalnya ke / atau /login).

👤 Fitur Sisi User – Detail
1. Homepage (/)

Hero banner mengambil promo pertama dari API.

Section:

Semua Aktivitas – list aktivitas dari endpoint activities.

Rekomendasi – subset aktivitas terpilih.

Transaksi Saya – snapshot transaksi terbaru user.

Footer dengan teks hak cipta dan link Terms & Privacy (placeholder).

2. Activity List (/activity)

Menampilkan semua aktivitas dari API.

Card menampilkan gambar, judul, lokasi, kategori, dan harga.

Opsional filter/tab (mis. All / Budget / Premium) berdasarkan rentang harga.

3. Activity Detail (/activity/:id)

Menampilkan detail lengkap satu aktivitas.

Mendukung gallery multi-image:

Mengambil array imageUrls (jika ada) → ditampilkan sebagai galeri dengan thumbnail.

Jika hanya ada imageUrl tunggal / thumbnail → tetap ditampilkan sebagai gambar utama.

Jika keduanya tidak ada → memakai gambar fallback.

Section booking:

Input tanggal (type="date") – boleh dikosongkan (tentative).

Tombol Tambah ke Cart:

Jika belum login → redirect ke login + toast error.

Jika sudah login → panggil endpoint add-cart dan redirect ke /cart saat berhasil.

4. Cart (/cart)

Menarik data keranjang user dari endpoint /carts.

Tabel/list item dengan gambar, judul, harga, dan informasi jumlah.

Ringkasan di bagian bawah:

Total item.

Total harga dalam rupiah.

Aksi:

Hapus item tertentu.

Clear cart.

Kembali ke Activity.

Lanjut ke Checkout.

5. Checkout (/checkout)

Mengambil:

Data cart → cartIds.

Data metode pembayaran → /payment-methods.

Form input:

Nama lengkap, email, phone.

Pilihan metode pembayaran (radio).

Tombol Confirm Checkout:

Validasi field & metode pembayaran.

Panggil endpoint Create Transaction menggunakan cartIds & paymentMethodId.

Redirect ke /transactions jika sukses.

6. My Transactions (/transactions)

Menampilkan riwayat transaksi user dari /my-transactions.

Filter berdasarkan status (All, Success, Pending, Failed, Cancelled).

Data transaksi ditampilkan dengan:

Gambar aktivitas.

Judul & metode pembayaran.

Total amount (format rupiah).

Tanggal & waktu.

Badge status.

Sorting di frontend: transaksi terbaru muncul di atas.

7. Profile (/profile)

Menampilkan informasi user yang sedang login (nama, email, dan data lain dari /profile).

Layout card sederhana dan konsisten dengan halaman lain.

8. Toast Notification

Menggunakan ToastContext:

showToast({ type, message }) dipanggil di banyak aksi:

Login/Register.

Add to cart.

Checkout.

Cancel / update transaksi.

CRUD di admin panel.

Posisi toast: pojok atas, auto dismiss setelah beberapa detik.

🛠️ Fitur Admin – Detail
1. Dashboard (/admin)

Menampilkan angka ringkas seperti:

Total aktivitas.

Total promo.

Total transaksi.

Total user.

Mengambil data dari endpoint terkait admin.

2. Users Management (/admin/users)

Menampilkan list user dari endpoint admin.

Tabel berisi:

Nama.

Email.

Role (user / admin).

Fitur tambahan:

Search berdasarkan nama atau email.

Pagination dengan informasi:

“Menampilkan X–Y dari Z user”.

Bisa mengubah role user dengan dropdown / control yang sesuai, memanggil endpoint update role.

3. Activities Management (/admin/activities)

Menampilkan semua activity.

Form Create / Edit:

Title.

Description.

Price.

Category (dropdown dari endpoint categories).

Image:

Input imageUrl manual.

Input file upload (multiple) untuk menyiapkan imageUrls array.

Delete activity dengan konfirmasi.

Perubahan data langsung mempengaruhi sisi user:

/activity (list).

/activity/:id (detail + gallery).

Catatan upload gambar:
FE sudah mengirim file sebagai FormData ke endpoint /upload-image. Jika environment API mengembalikan error (500), aplikasi:

Menampilkan pesan error via toast.

Tetap mengizinkan admin menyimpan aktivitas dengan URL manual.

4. Promos Management (/admin/promos)

Menampilkan semua promo dari API.

Create / Edit / Delete promo.

Field:

title

promo_code

minimum_claim_price

promo_discount_price

imageUrl

terms_condition

Promo dipakai:

Di halaman promo user.

Sebagai hero/highlight utama di homepage.

5. Transactions Management (/admin/transactions)

Menampilkan semua transaksi di sistem.

Filter status: All / Pending / Success / Failed / Cancelled.

Sorting tanggal: transaksi terbaru di paling atas (diurutkan di frontend menggunakan createdAt / field waktu lain).

Pagination:

Mengatur jumlah transaksi per halaman.

Menampilkan informasi posisi data (X–Y dari Z transaksi).

Kolom yang ditampilkan:

ID / kode transaksi.

Nama & email user.

Total amount (rupiah).

Metode pembayaran.

Status.

Waktu dibuat.

Aksi:

Untuk transaksi pending, admin bisa:

Set status ke success.

Set status ke failed.

Menggunakan endpoint update-transaction-status/{id}.

✅ Kesesuaian Dengan Guideline Final Project

Secara garis besar, proyek ini telah mengimplementasikan:

Autentikasi & otorisasi:

Login / register user.

Proteksi route user & admin.

Role-based access untuk admin panel.

Flow bisnis pemesanan:

Browse aktivitas → detail → add to cart → checkout → transaksi → riwayat transaksi.

Admin panel:

Manajemen user, aktivitas, promo, dan transaksi.

Aksi approve / reject transaksi pending.

Penggunaan API:

Semua data utama (user, activity, promo, cart, transaksi) berasal dari Travel Journal API.

UX & feedback:

Toast notification konsisten.

Empty state + skeleton loading.

Validasi & penanganan error dasar di frontend.

⚠️ Catatan & Pengembangan Lanjutan

Endpoint /upload-image pada environment tertentu dapat mengembalikan error 500. Aplikasi sudah menangani ini dengan:

Menampilkan pesan error via toast.

Fallback ke input URL manual.

Beberapa improvement yang bisa ditambahkan ke depannya:

Pagination juga di sisi user (/transactions).

Filtering & sorting yang lebih kaya di halaman activity.

Mode dark theme.

✍️ Author

Dibuat sebagai final project Front End Web Development bootcamp, oleh:

Febmy Shesar Baihaqi (@Febmy)
````
