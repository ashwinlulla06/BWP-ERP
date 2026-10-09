import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ name: user.name, department: user.department });
  const [message, setMessage] = useState(location.state?.registered ? "Account created successfully." : "");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({ name: user.name, department: user.department });
  }, [user]);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setMessage("");
    setError("");
  };

  const handleCancel = () => {
    setForm({ name: user.name, department: user.department });
    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      await updateProfile(form);
      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="container-xl">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Account & profile</span>
            <h1>Welcome, {user.name}</h1>
            <p>Review your UniReserve identity and keep your campus details current.</p>
          </div>
          <span className="role-badge"><span className="status-dot" /> {user.role}</span>
        </div>

        {message && <div className="alert alert-success" role="status">{message}</div>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="row g-4">
          <div className="col-lg-4">
            <aside className="profile-summary card-surface">
              <div className="profile-avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <div className="profile-meta">
                <span><small>Account ID</small><strong>{user.id}</strong></span>
                <span><small>Access level</small><strong className="text-capitalize">{user.role}</strong></span>
                <span><small>Status</small><strong className="available-text">Active</strong></span>
              </div>
            </aside>
          </div>

          <div className="col-lg-8">
            <div className="card-surface profile-form-card">
              <div className="card-heading">
                <div>
                  <h2>Profile information</h2>
                  <p>Only your name and department can be changed.</p>
                </div>
                {!isEditing && (
                  <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="profileName">Full name</label>
                    <input className="form-control" id="profileName" name="name" value={form.name} onChange={handleChange} disabled={!isEditing} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="profileDepartment">Department</label>
                    <input className="form-control" id="profileDepartment" name="department" value={form.department} onChange={handleChange} disabled={!isEditing} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="profileEmail">University email</label>
                    <input className="form-control" id="profileEmail" value={user.email} disabled readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="profileRole">Role</label>
                    <input className="form-control text-capitalize" id="profileRole" value={user.role} disabled readOnly />
                  </div>
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button className="btn btn-light" type="button" onClick={handleCancel} disabled={isSaving}>Cancel</button>
                    <button className="btn btn-primary" type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving...</>
                      ) : "Save changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="notice-card mt-4">
              <span className="notice-icon" aria-hidden="true">✓</span>
              <div><strong>Account security</strong><p>Your password is never stored in browser storage by this mock frontend.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
