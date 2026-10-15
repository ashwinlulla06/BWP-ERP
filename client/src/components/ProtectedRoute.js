import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardRoute } from "../App";

function ProtectedRoute({ requiredRole }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="page-loader" role="status" aria-live="polite">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <span>Loading your UniReserve account...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole) {
    if (requiredRole === "admin" && user.role === "faculty") {
      // allow
    } else if (user.role !== requiredRole) {
      return <Navigate to={getDashboardRoute(user)} replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
