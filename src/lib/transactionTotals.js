// src/lib/transactionTotals.js
import { lsGet, lsSet } from "./localStorage";

export const TX_TOTALS_STORAGE_KEY = "travelapp_transaction_totals";

/**
 * Ambil map total transaksi dari storage (menggunakan localStorage helper).
 * Bentuk: { [transactionId]: { subtotal, discount, total } }
 *
 * Catatan kompatibilitas:
 * - Pertama coba baca via lsGet (yang menggunakan namespacing/prefix).
 * - Jika hasil undefined/null/empty, coba baca raw localStorage key lama (backward compatibility).
 */
export function loadTransactionTotalsMap() {
  try {
    // coba pakai helper (akan mengembalikan parsed object bila ada)
    const prefixed = lsGet(TX_TOTALS_STORAGE_KEY, undefined);
    if (prefixed !== undefined && prefixed !== null) {
      return typeof prefixed === "object" ? prefixed : {};
    }

    // fallback: coba baca raw key (untuk kompatibilitas dengan penyimpanan lama tanpa prefix)
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(TX_TOTALS_STORAGE_KEY);
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch (err) {
        // kalau parse gagal, log dan kembalikan object kosong
        // console.warn("transactionTotals: failed to parse raw storage value", err);
        return {};
      }
    }

    return {};
  } catch (err) {
    // jangan crash aplikasi jika ada masalah I/O
    // console.error("Failed to load transaction totals:", err);
    return {};
  }
}

/**
 * Simpan ringkasan total transaksi ke storage
 * Dipanggil setelah create-transaction sukses di Checkout
 *
 * Kita tulis ke lsSet (prefixed) untuk behavior baru; dan juga
 * tulis ke raw key bila tersedia (migrasi / kompatibilitas).
 */
export function saveTransactionTotals(transactionId, totals) {
  try {
    if (!transactionId || !totals) return;

    // ambil current map via helper (pastikan object baru, jangan mutate original ref)
    const current = loadTransactionTotalsMap();
    const next = { ...(current || {}) };

    next[transactionId] = {
      subtotal: Number(totals.subtotal) || 0,
      discount: Number(totals.discount) || 0,
      total: Number(totals.total) || 0,
    };

    // simpan via helper (akan menggunakan prefix)
    lsSet(TX_TOTALS_STORAGE_KEY, next);

    // juga simpan ke raw key (untuk kode lama yang masih baca raw localStorage)
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          TX_TOTALS_STORAGE_KEY,
          JSON.stringify(next)
        );
      }
    } catch (err) {
      // jika gagal menulis raw key, tidak fatal — helper sudah menyimpan
      // console.warn("transactionTotals: failed to write raw localStorage key", err);
    }
  } catch (err) {
    // console.error("Failed to save transaction totals:", err);
  }
}
