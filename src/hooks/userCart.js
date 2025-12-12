// src/hooks/useCart.js
import { useEffect, useState, useRef } from "react";
import { lsGet, lsSet } from "../lib/localStorage.js";
import api from "../lib/api.js"; // Impor api jika perlu sync

const CART_KEY = "cart";

const normalizeItem = (item) => {
  const quantity =
    typeof item?.quantity === "number"
      ? Math.max(0, Math.floor(item.quantity))
      : 1;
  const activity = item?.activity ?? (typeof item === "object" ? item : {});
  const id = item?.id ?? activity?.id ?? Math.random().toString(36).slice(2, 9);
  return { id, activity, quantity };
};

const readCartRaw = () => {
  const raw = lsGet(CART_KEY);
  return raw ? tryParse(raw) : null;
};

const tryParse = (v) => {
  if (v == null) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v;
};

export default function useCart() {
  const mounted = useRef(false);

  const [items, setItems] = useState(() => {
    const raw = readCartRaw();
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(normalizeItem);
    if (raw && typeof raw === "object") {
      if (Array.isArray(raw.items)) return raw.items.map(normalizeItem);
      if (Array.isArray(raw.data)) return raw.data.map(normalizeItem);
    }
    return [];
  });

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
    try {
      lsSet(CART_KEY, items);
    } catch (e) {
      console.warn("useCart write failed", e);
    }
  }, [items]);

  useEffect(() => {
    function onStorage(e) {
      if (!e || !e.key) return;
      if (!/cart/i.test(e.key)) return;
      try {
        const parsed = tryParse(e.newValue);
        if (!parsed) {
          setItems([]);
          return;
        }
        if (Array.isArray(parsed)) setItems(parsed.map(normalizeItem));
        else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.items))
            setItems(parsed.items.map(normalizeItem));
          else if (Array.isArray(parsed.data))
            setItems(parsed.data.map(normalizeItem));
        }
      } catch (err) {
        console.warn("storage sync parse err", err);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = (newItem) => {
    setItems((prev) => {
      const n = normalizeItem(newItem);
      const exists = prev.find(
        (i) =>
          i.id === n.id ||
          (i.activity?.id && n.activity?.id && i.activity.id === n.activity.id)
      );
      if (exists) {
        return prev.map((i) =>
          i.id === exists.id ? { ...i, quantity: i.quantity + n.quantity } : i
        );
      }
      return [...prev, n];
    });
  };

  const updateQty = async (id, qty) => {
    if (typeof qty !== "number" || qty < 0) return;
    try {
      // Update API dulu
      await api.put(`/carts/${id}`, { quantity: Math.floor(qty) });
      // Lalu update local
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: Math.floor(qty) } : i))
      );
    } catch (err) {
      console.error("Update qty failed", err);
    }
  };

  const increase = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateQty(id, item.quantity + 1);
  };

  const decrease = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.quantity <= 1) {
      await removeItem(id);
      return;
    }
    await updateQty(id, item.quantity - 1);
  };

  const removeItem = async (id) => {
    try {
      // Delete dari API
      await api.delete(`/carts/${id}`);
      // Lalu update local
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  const clearCart = () => setItems([]);

  const syncWithAPI = async () => {
    try {
      const res = await api.get("/carts");
      const apiItems = res.data?.data || [];
      setItems(apiItems.map(normalizeItem)); // Merge/overwrite local dengan API
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const subtotal = items.reduce((s, it) => {
    const price = Number(it.activity?.price ?? 0);
    const qty = Number(it.quantity ?? 0);
    return s + price * qty;
  }, 0);

  return {
    items,
    setItems,
    addItem,
    updateQty,
    increase,
    decrease,
    removeItem,
    clearCart,
    syncWithAPI,
    subtotal,
  };
}
