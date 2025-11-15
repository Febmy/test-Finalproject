# TravelApp – Final Project Frontend

Aplikasi **TravelApp** adalah final project frontend yang dibangun dengan **React + Vite** dan menggunakan API dari:

`https://travel-journal-api-bootcamp.do.dibimbing.id`

Aplikasi ini mensimulasikan platform pemesanan aktivitas wisata: user bisa login, melihat aktivitas, menambahkan ke cart, checkout, melihat riwayat transaksi, meng-cancel transaksi pending, hingga melihat profil dirinya.

---

## ✨ Fitur Utama

### 1. Autentikasi User

- **Register** dan **Login** menggunakan endpoint API.
- Token JWT disimpan (mis. di `localStorage`) dan otomatis dikirim lewat `Authorization: Bearer <token>` pada setiap request.
- Navbar akan menampilkan:
  - Nama user (Hi, \<nama\>)
  - Tombol **Profile**, **Cart**, **My Transactions**, dan **Logout**.
- Tombol **Logout** akan:
  - Menghapus token.
  - Mengarahkan kembali ke halaman login.

### 2. Homepage

- Menampilkan **hero image** / banner utama.
- Seksi:
  - _Section I – Semua Aktivitas_
  - _Section II – Rekomendasi_
  - _Section III – Transaksi Saya_
- Card rekomendasi diambil dari endpoint aktivitas (bukan data statis).
- Terdapat **footer** dengan teks hak cipta dan link Terms & Privacy.

### 3. Halaman Activity List

- Route: `/activity`
- Menampilkan daftar semua aktivitas dari API.
- Filter/tab:
  - **All**, **Budget**, **Premium** (opsional filter berdasarkan harga).
- Card aktivitas berisi:
  - Gambar aktivitas (dari API).
  - Judul, deskripsi singkat, harga.
- Klik card akan membuka halaman **Activity Detail**.

### 4. Halaman Activity Detail

- Route: `/activity/:id`
- Menampilkan detail 1 aktivitas:
  - Gambar, judul, harga, deskripsi lengkap.
- Section **Booking**:
  - Input **tanggal** (date).
  - (Opsional jumlah orang — saat ini logic quantity langsung di cart).
  - Tombol **Add to Cart**:
    - Memanggil endpoint **Add Cart**.
    - Menampilkan toast sukses / error.

### 5. Cart

- Route: `/cart`
- Menampilkan semua item yang ada di cart user (endpoint `/carts`).
- Untuk setiap item:
  - Gambar aktivitas, judul, harga.
  - Informasi `x1` (jumlah item).
  - Tombol **Remove** untuk menghapus item (Delete Cart).
- Di bagian bawah:
  - Informasi ringkas:  
    `Ada X aktivitas dengan total Y orang di keranjangmu.`
  - Total harga: `Total: RpX`.
  - Tombol:
    - **Clear** (mengosongkan cart).
    - **Activity** (kembali ke halaman activity).
    - **Checkout** (navigasi ke halaman checkout).

### 6. Checkout

- Route: `/checkout`
- Mengambil:
  - Data **payment methods** dari endpoint `/payment-methods`.
  - Data cart (untuk mendapatkan `cartIds`).
- Form Checkout:
  - Data dasar (full name, email, phone) – disimpan di state.
  - Pilihan **metode pembayaran** (radio).
  - Tombol **Confirm Checkout**:
    - Validasi form dan payment method.
    - Memanggil endpoint **Create Transaction** dengan payload:
      ```json
      {
        "cartIds": ["id-cart-1", "id-cart-2"],
        "paymentMethodId": "id-payment-method"
      }
      ```
    - Jika sukses, redirect ke **My Transactions**.
- Semua error (network/validasi) akan menampilkan **toast**.

### 7. My Transactions

- Route: `/transactions`
- Menampilkan riwayat transaksi user dari endpoint `/my-transactions`.
- Filter/tab:
  - **All**, **Success**, **Pending**, **Failed**, **Cancelled**.
- Card transaksi:
  - Gambar aktivitas.
  - Judul (Activity).
  - **Total**: `RpX` dan jika memungkinkan: `Total: RpX • N item`.
  - Payment method.
  - Tanggal & waktu transaksi.
  - Badge status: `success | pending | failed | cancelled`.
- Tombol **Cancel**:
  - Hanya muncul untuk transaksi dengan status **pending**.
  - Memanggil endpoint **Cancel Transaction**.
  - Jika sukses, status di UI berubah menjadi `cancelled`.
  - Menampilkan toast sukses/error.

### 8. Profile

- Route: `/profile`
- Menampilkan informasi user:
  - Nama, email, dan data lain yang tersedia dari endpoint `/profile`.
- Layout rapi dan konsisten dengan desain halaman lain.

### 9. Toast Notification

- Menggunakan **Toast component** custom:
  - Ditampilkan untuk:
    - Login gagal/berhasil.
    - Add to cart berhasil/gagal.
    - Checkout berhasil/gagal.
    - Update/cancel transaksi.
  - Posisi di pojok atas (top-right) dengan auto-hide setelah beberapa detik.

### 10. Routing & Proteksi Halaman

- Menggunakan **React Router DOM**:
  - Public routes: `/login`, `/register`.
  - Protected routes: `/`, `/activity`, `/activity/:id`, `/cart`, `/checkout`, `/transactions`, `/profile`.
- ProtectedRoute akan:
  - Mengecek apakah token JWT ada.
  - Jika tidak ada, otomatis redirect ke `/login`.

---

## 🧰 Tech Stack

- **React 18**
- **Vite**
- **React Router DOM v6**
- **Axios** (dengan instance custom di `lib/api.js`)
- **Tailwind CSS** / utility CSS
- **ESLint + Prettier** (opsional, untuk konsistensi code style)

---

## 🔑 Konfigurasi API

Semua konfigurasi API menggunakan environment variables.

Buat file `.env` di root project:

```bash
VITE_API_BASE_URL=https://travel-journal-api-bootcamp.do.dibimbing.id
VITE_API_KEY=24405e01-fbc1-45a5-9f5a-xxxxxx   # ganti dengan API_KEY milikmu
```

# Final Project - TravelApp (Front End Web Development)

Final Project ini adalah aplikasi **TravelApp** berbasis React yang menampilkan daftar aktivitas perjalanan, detail aktivitas, fitur cart & checkout, hingga riwayat transaksi pengguna.

Aplikasi ini dibangun dengan fokus pada:

- **Responsiveness** (mobile–first)
- **Error handling yang jelas** (toast global)
- **Struktur folder yang rapi & Single Responsibility Principle**
- **Kerapihan kode dan pemisahan concerns** (API, context, UI components)

---

## 🚀 Tech Stack

- **React + Vite**
- **React Router DOM** – routing halaman
- **Axios** – komunikasi ke REST API
- **Tailwind CSS** (utility-first styling)
- **Context API** – untuk Toast (global feedback)

---

## 📂 Project Structure

```txt
src/
  components/
    layout/
      Navbar.jsx        # Navigasi utama (desktop + mobile menu) + logout toast
      Footer.jsx        # Footer global
      PageContainer.jsx # Wrapper layout untuk semua halaman
      ScrollToTop.jsx   # Scroll ke atas setiap ganti route

    activity/
      ActivityCard.jsx  # Kartu aktivitas di listing

    cart/
      CartItem.jsx      # Kartu item keranjang (dipakai di Cart)

    ui/
      EmptyState.jsx    # Komponen state kosong (tidak ada data)
      Spinner.jsx       # Komponen loading / spinner

  pages/
    Home.jsx            # Halaman utama (hero + rekomendasi aktivitas)
    ActivityList.jsx    # Daftar semua aktivitas
    ActivityDetail.jsx  # Detail 1 aktivitas + add to cart
    Cart.jsx            # Keranjang + update quantity, clear, dan ke checkout
    Checkout.jsx        # Halaman konfirmasi pembayaran + create transaction
    Transactions.jsx    # Halaman My Transactions + filter + cancel
    Profile.jsx         # Detail profil user (GET /user)
    Promos.jsx          # Daftar promo dari endpoint /promos
    NotFound.jsx        # Halaman 404

    auth/
      Login.jsx         # Login user, simpan token, toast feedback
      Register.jsx      # Register user baru

  context/
    ToastContext.jsx    # Global toast (success/error) untuk semua aksi penting

  lib/
    api.js              # Axios instance (baseURL, interceptor token)
    format.js           # Helper formatCurrency & formatDateTime

  App.jsx               # Routing + proteksi route (RequireAuth)
  main.jsx              # Root render, bungkus dengan BrowserRouter + ToastProvider
  index.css             # Global styles
```
