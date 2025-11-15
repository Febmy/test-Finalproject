// src/pages/user/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();

    if (name.trim().length < 3) {
      showToast({ type: "error", message: "Nama minimal 3 karakter." });
      return;
    }
    if (!email.includes("@")) {
      showToast({ type: "error", message: "Email tidak valid." });
      return;
    }
    if (password.length < 6) {
      showToast({
        type: "error",
        message: "Password minimal 6 karakter.",
      });
      return;
    }

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        passwordRepeat: password,
        role,
      });

      if (res.data.code === "200") {
        showToast({
          type: "success",
          message: "Register berhasil, silakan login.",
        });
        navigate("/login");
      } else {
        showToast({
          type: "error",
          message: `Register gagal: ${res.data.message}`,
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Register gagal: periksa kembali input kamu.",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full border rounded px-3 py-2 text-sm"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded px-3 py-2 text-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded px-3 py-2 text-sm"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition">
          Register
        </button>
      </form>
    </div>
  );
}
