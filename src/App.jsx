import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Homepage from "./pages/user/Homepage";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ActivityList from "./pages/user/ActivityList";
import ActivityDetail from "./pages/user/ActivityDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import MyTransactions from "./pages/user/MyTransactions";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/activity" element={<ActivityList />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <MyTransactions />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
