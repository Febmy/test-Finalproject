// src/pages/user/Login.jsx
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // kalau sudah login, langsung arahkan ke home
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // atau "/activity"
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return alert("Email tidak valid");
    if (password.length < 6) return alert("Password minimal 6 karakter");

    try {
      const res = await api.post("/login", { email, password });

      const token = res.data.token;
      // coba ambil data user dari response, kalau tidak ada pakai fallback
      const user = res.data.user ||
        res.data.data?.user || {
          email,
          name: "Guest User",
        };

      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(user));

      alert("Login berhasil");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login gagal. Periksa email/password.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
