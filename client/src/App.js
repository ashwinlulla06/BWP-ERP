import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Admin Pages (Person 4)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManage from './pages/admin/AdminManage';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route redirects to Admin Dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage" element={<AdminManage />} />
        <Route path="/admin/reports" element={<Reports />} />

        {/* Fallback for other non-existent routes */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
