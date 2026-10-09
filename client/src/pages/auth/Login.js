import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      navigate(location.state?.from || "/profile", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container-xl">
        <div className="row g-0 auth-card overflow-hidden">
          <div className="col-lg-5 auth-intro">
            <span className="eyebrow">University resource portal</span>
            <h1>Campus resources, reserved with confidence.</h1>
            <p>
              Access laboratory equipment and library reference books through one
              secure university account.
            </p>
            <div className="portal-status">
              <span className="status-dot" aria-hidden="true" />
              <span><strong>Portal available</strong><small>Secure authentication is ready</small></span>
            </div>
          </div>

          <div className="col-lg-7 auth-form-panel">
            <div className="form-heading">
              <span className="section-icon" aria-hidden="true">→</span>
              <div>
                <span className="eyebrow">Welcome back</span>
                <h2>Log in to UniReserve</h2>
                <p>Use the email and password for your registered account.</p>
              </div>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="loginEmail">University email</label>
                <input
                  className="form-control"
                  id="loginEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex.morgan@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="loginPassword">Password</label>
                <input
                  className="form-control"
                  id="loginPassword"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="At least 6 characters"
                  minLength="6"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Logging in...</>
                ) : "Log in"}
              </button>
            </form>

            <p className="form-footer">
              New to UniReserve? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
