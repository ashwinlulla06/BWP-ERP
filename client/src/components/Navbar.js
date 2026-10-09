import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-md portal-navbar" aria-label="Main navigation">
      <div className="container-xl">
        <NavLink className="navbar-brand brand-lockup" to={user ? "/profile" : "/login"}>
          <span className="brand-mark" aria-hidden="true">U</span>
          <span>
            <strong>UniReserve</strong>
            <small>Campus Portal</small>
          </span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#portalNavigation"
          aria-controls="portalNavigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="portalNavigation">
          <div className="navbar-nav ms-auto align-items-md-center gap-md-2 py-3 py-md-0">
            {user ? (
              <>
                <NavLink className="nav-link" to="/profile">Profile</NavLink>
                <span className="user-chip" title={user.email}>
                  <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                  </span>
                </span>
                <button className="btn btn-outline-danger btn-sm logout-button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/login">Log in</NavLink>
                <NavLink className="btn btn-primary btn-sm px-3" to="/register">
                  Create account
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
