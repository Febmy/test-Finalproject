// src/pages/user/Register.jsx
import { useState } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) return alert("Nama minimal 3 karakter");
    if (!email.includes("@")) return alert("Email tidak valid");
    if (password.length < 6) return alert("Password minimal 6 karakter");

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        passwordRepeat: password,
        role,
      });
      if (res.data.code === "200") {
        alert("Register berhasil, silakan login.");
        navigate("/login");
      } else {
        alert(`Register gagal: ${res.data.message}`);
      }
    } catch (err) {
      alert(
        `Register gagal: ${err.response?.data?.message || "Periksa input"}`
      );
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // atau "/activity"
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
          className="w-full border rounded px-3 py-2"
          required
        />
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-green-600 text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
