import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold">
          Travel
        </Link>
        <Link to="/activity">Activities</Link>
        {token && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/transactions">My Transactions</Link>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-red-600">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
