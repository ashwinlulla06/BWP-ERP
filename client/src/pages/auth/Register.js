import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  department: "",
  role: "student",
  password: "",
  confirmPassword: "",
};

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/profile", { replace: true, state: { registered: true } });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page register-page">
      <div className="container-xl">
        <div className="auth-card register-card">
          <div className="register-heading">
            <div>
              <span className="eyebrow">Join the campus portal</span>
              <h1>Create your UniReserve account</h1>
              <p>Register as a student or faculty member to manage university resources.</p>
            </div>
            <span className="security-chip"><span className="status-dot" /> Secure registration</span>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerName">Full name</label>
                <input className="form-control" id="registerName" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerEmail">University email</label>
                <input className="form-control" id="registerEmail" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerDepartment">Department</label>
                <input className="form-control" id="registerDepartment" name="department" value={form.department} onChange={handleChange} placeholder="Electrical & Computer Engineering" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerRole">Role</label>
                <select className="form-select" id="registerRole" name="role" value={form.role} onChange={handleChange} required>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
                <div className="form-text">Administrator accounts cannot be created here.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerPassword">Password</label>
                <input className="form-control" id="registerPassword" name="password" type="password" minLength="6" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder="At least 6 characters" required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                <input className="form-control" id="confirmPassword" name="confirmPassword" type="password" minLength="6" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-4">
              <p className="form-footer m-0">Already registered? <Link to="/login">Log in</Link></p>
              <button className="btn btn-primary px-4" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Creating account...</>
                ) : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;
