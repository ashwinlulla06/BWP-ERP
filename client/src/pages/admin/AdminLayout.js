import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children, activeMenu }) => {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ 
            width: '32px', height: '32px', borderRadius: '8px', 
            backgroundColor: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">UniReserve</span>
            <span className="brand-subtitle">CAMPUS PORTAL</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/manage" className={`nav-item ${activeMenu === 'manage' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">settings</span> <span>Manage</span>
          </NavLink>
          <NavLink to="/admin/reports" className={`nav-item ${activeMenu === 'reports' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">summarize</span> <span>Reports</span>
          </NavLink>
          <div style={{ marginTop: '20px', marginBottom: '10px', paddingLeft: '24px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Main Portal</div>
          <NavLink to="/profile" className="nav-item">
            <span className="material-symbols-outlined">person</span> <span>Profile</span>
          </NavLink>
          <NavLink to="/equipment" className="nav-item">
            <span className="material-symbols-outlined">inventory_2</span> <span>Equipment & Books</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span> <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Search equipment, books, users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="notification-btn" type="button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="notification-badge"></span>
            </button>
            <div className="header-divider"></div>
            <div className="admin-profile">
              <div className="avatar" style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: 'var(--secondary)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '12px'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'Admin'}</span>
                <span className="profile-role">ID: {user?.id ? `ADM-${user.id}` : 'ADM'}</span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
