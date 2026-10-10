import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManage from "./pages/admin/AdminManage";
import Reports from "./pages/admin/Reports";

import EquipmentList from "./pages/equipment/EquipmentList";
import BookEquipment from "./pages/equipment/BookEquipment";
import MyBookings from "./pages/equipment/MyBookings";

export function getDashboardRoute(user) {
  if (!user) return "/login";
  if (user.role === "admin" || user.role === "faculty") return "/admin/dashboard";
  return "/equipment";
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDashboardRoute(user)} replace />;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/equipment/:id/book" element={<BookEquipment />} />
            <Route path="/equipment/my-bookings" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage" element={<AdminManage />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;