// App shell from the UniReserve template: fixed sidebar + topbar + content area.
// Use it as a layout route so every page gets the same chrome:
//   <Route element={<Layout />}> ...page routes... </Route>
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Icon from "./Icon";

const BRAND = { name: "UniReserve", tagline: "Campus Portal" };

// One list for the whole team — add your module's link here.
const NAV = [
  { to: "/equipment", label: "Lab Equipment", icon: "science" },
  { to: "/books", label: "Library Books", icon: "auto_stories" },
  { to: "/my-bookings", label: "My Bookings", icon: "event_available" },
  { to: "/my-reservations", label: "My Reservations", icon: "bookmark" },
  { to: "/admin", label: "Admin", icon: "admin_panel_settings" },
];

// TODO (Person 1): replace with the logged-in user from your auth state.
const TEMP_USER = { name: "Test User", code: "#1", dept: "MCA" };

export default function Layout({ user = TEMP_USER, onLogout, children }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Topbar search jumps to the catalog with the term pre-filled.
  const search = (e) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(q.trim())}`);
  };

  const logout = onLogout || (() => navigate("/login")); // TODO (Person 1): real logout

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <aside className="sidebar">
        <div>
          <div className="sidebar__brand">
            <div className="brand-mark">
              <Icon name="school" size={20} />
            </div>
            <div className="brand-text">
              <div className="brand-name">{BRAND.name}</div>
              <div className="brand-tag">{BRAND.tagline}</div>
            </div>
          </div>
          <nav className="sidebar__nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar__bottom">
          <div className="sidebar__logout">
            <button type="button" className="nav-link nav-link--danger" onClick={logout}>
              <Icon name="logout" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar__left">
          <form className="search-field" onSubmit={search}>
            <Icon name="search" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books by title or author..."
              aria-label="Search books"
            />
          </form>
          <div className="dept-chip">
            <Icon name="domain" />
            <span>Dept: {user.dept}</span>
          </div>
        </div>
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div>
            <div className="user-chip__name">{user.name}</div>
            <div className="code-tag">{user.code}</div>
          </div>
        </div>
      </header>

      <main className="main">{children ?? <Outlet />}</main>
    </>
  );
}
