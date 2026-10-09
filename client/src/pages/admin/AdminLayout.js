import React, { useState } from 'react';
import './AdminLayout.css';

const AdminLayout = ({ children, activeMenu }) => {
  const [search, setSearch] = useState('');

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
          <a href="/admin/dashboard" className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span> <span>Dashboard</span>
          </a>
          <a href="/admin/manage" className={`nav-item ${activeMenu === 'manage' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">settings</span> <span>Manage</span>
          </a>
          <a href="/admin/reports" className={`nav-item ${activeMenu === 'reports' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">summarize</span> <span>Reports</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
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
                SA
              </div>
              <div className="profile-info">
                <span className="profile-name">System Admin</span>
                <span className="profile-role">ID: ADM-99120</span>
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
