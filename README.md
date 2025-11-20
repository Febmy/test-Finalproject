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

# TravelApp – Final Project Frontend Web Development

TravelApp adalah aplikasi pemesanan aktivitas wisata sederhana yang terhubung dengan **Travel Journal API**.  
Project ini memiliki **dua sisi**:

- **User App** – user bisa menjelajah aktivitas, memasukkan ke keranjang, menggunakan kode promo, dan checkout.
- **Admin Panel** – admin bisa mengelola aktivitas, promo/banner, melihat semua transaksi, dan mengatur status pembayaran.

Repo ini dibuat sebagai **Final Project** program **Front End Web Development Bootcamp**.

---

## 🚀 Tech Stack

- **React 18** + **Vite**
- **React Router DOM**
- **Tailwind CSS**
- **Axios** untuk HTTP request
- LocalStorage (menyimpan token & profil user)
- Travel Journal API (Dibimbing Bootcamp)

---

## 📦 Fitur Utama

### 1. Public / User (tanpa login)

- Melihat **banner promo** di halaman utama.
- Melihat daftar **activity**:
  - List semua aktivitas.
  - Filter berdasarkan kategori.
- Melihat **detail activity**:
  - Deskripsi lengkap.
  - Harga.
  - Gambar.
- Halaman Promo: menampilkan promo yang aktif dari API.

### 2. User Login

- **Register & Login** menggunakan endpoint Auth Travel Journal.
- Token JWT disimpan di `localStorage` dan dipakai untuk request protected.
- **Profile Page**:
  - Menampilkan nama & email user.
  - Bisa melihat data user yang sedang login.

### 3. Cart & Checkout

- **Cart Page**

  - Menambahkan aktivitas ke cart dari halaman detail aktivitas.
  - Melihat daftar item dalam cart.
  - Mengubah **quantity** item.
  - Menghapus item dari cart.
  - Menghitung total harga berdasarkan data dari API.

- **Checkout Page**
  - Mengambil **payment methods** dari API dan memilih metode pembayaran.
  - Mengambil **cartIds** dari API, lalu membuat transaksi lewat endpoint `create-transaction`.
  - Mendukung **kode promo**:
    - Input promo code.
    - Validasi ke endpoint promo.
    - Mengurangi total harga jika memenuhi `minimum_claim_price`.
  - Menampilkan total harga **sebelum & sesudah** promo.
  - Menampilkan toast untuk success / error.

### 4. User Transactions

- Halaman **My Transactions**:
  - Menampilkan riwayat transaksi user yang login.
  - Menampilkan status transaksi: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`.
  - Format tanggal dan nominal dalam format Indonesia.

### 5. Admin Panel

> Admin route hanya bisa diakses jika user **login** sebagai admin  
> (role `"admin"` disimpan di `userProfile` di localStorage).

Admin panel dapat diakses di `/admin` dan memiliki beberapa menu:

#### a. Dashboard

- Ringkasan angka:
  - Total Activities.
  - Total Promos.
  - Total Transactions.
  - Total Users.
- Angka diambil langsung dari API yang sama dengan halaman lain.

#### b. Users Management

- Mengambil semua user dari endpoint admin (`/all-user`).
- Menampilkan list nama, email, dan role saat ini.
- Admin bisa mengubah **role user** (`user` ⇄ `admin`) via endpoint `update-user-role/{id}`.

#### c. Activities Management

- Melihat semua `activities` dari API.
- **Create / Update Activity**:
  - Mengambil daftar **category** dari endpoint `categories`.
  - Admin bisa memilih kategori dari dropdown, tidak perlu copy-paste `categoryId`.
  - Menambahkan / mengedit:
    - `title`
    - `description`
    - `price`
    - `imageUrls` (array string)
- **Delete Activity**:
  - Menghapus activity lewat endpoint delete.
- Semua perubahan akan langsung tercermin di sisi user:
  - `/activity` (ActivityList)
  - `/activity/:id` (ActivityDetail)

#### d. Promos & Banner Management

- **Promo CRUD**:
  - Create / update / delete promo.
  - Field yang digunakan:
    - `title`
    - `promo_code`
    - `minimum_claim_price`
    - `promo_discount_price`
    - tanggal berlaku, dsb (sesuai API).
- **Banner CRUD**:
  - Mengelola banner yang tampil di homepage user.
- Section promo & banner di user side membaca data dari endpoint yang sama.

#### e. Transactions Management

- Mengambil **semua transaksi** dari endpoint admin (`/all-transactions`).
- Filter berdasarkan status:
  - `Semua`, `Pending`, `Success`, `Failed`, `Cancelled`.
- Menampilkan:
  - ID transaksi.
  - User (nama + email).
  - Total (menggunakan `totalAmount` dari API).
  - Status.
  - Payment method (nama & virtual account).
  - Tanggal dibuat.
- **Approve / Reject pembayaran**:
  - Untuk transaksi berstatus `pending`, admin bisa:
    - `Approve (Success)` → kirim payload `{ status: "success" }`
    - `Reject (Failed)` → kirim payload `{ status: "failed" }`
  - Setelah diubah, status juga berubah di halaman transaksi user.

---

## 📁 Struktur Folder (singkat)

```bash
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
    transactions/
      PaymentForm.jsx
    ui/
      EmptyState.jsx
      Spinner.jsx
  context/
    ToastContext.jsx
  lib/
    api.js          # konfigurasi axios (baseURL, apiKey, interceptor)
    format.js       # helper format tanggal & currency
  pages/
    user/
      Home.jsx
      ActivityList.jsx
      ActivityDetail.jsx
      Cart.jsx
      Checkout.jsx
      Transactions.jsx
      Profile.jsx
      auth/
        Login.jsx
        Register.jsx
    admin/
      AdminDashboard.jsx
      AdminTransactions.jsx
      AdminUsers.jsx
      AdminActivities.jsx
      AdminPromos.jsx
  App.jsx           # routing + proteksi route user & admin
  main.jsx          # React root
```
