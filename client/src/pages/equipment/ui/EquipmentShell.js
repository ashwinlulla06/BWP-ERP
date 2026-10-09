import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
 
// TEMPORARY layout (sidebar + page area) copied from the UniReserve design.
// Use it only until Person 1's shared Navbar/layout is ready, then drop the
// <EquipmentShell> wrapper in App.js. The three pages never include it
// themselves, so nothing is duplicated when the real layout arrives.
const LINKS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/equipment', icon: 'science', label: 'Lab Equipment', end: true },
  { to: '/books', icon: 'menu_book', label: 'Library Books' },
  { to: '/equipment/my-bookings', icon: 'event_available', label: 'My Bookings' },
];
 
export default function EquipmentShell({ children, onLogout }) {
  return (
    <div className="eq-scope eq-shell">
      <aside className="eq-sidebar">
        <div className="eq-brand">
          <span className="eq-brand__mark"><Icon name="school" filled size={22} /></span>
          <span>
            <span className="eq-brand__name">UniReserve</span>
            <span className="eq-brand__sub">Campus Portal</span>
          </span>
        </div>
        <nav className="eq-nav" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `eq-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Icon name={l.icon} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="eq-nav__link eq-nav__link--logout" onClick={onLogout}>
          <Icon name="logout" />
          <span>Log out</span>
        </button>
      </aside>
      <main className="eq-main">{children}</main>
    </div>
  );
}