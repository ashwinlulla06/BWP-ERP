import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EquipmentList from './pages/equipment/EquipmentList';
import BookEquipment from './pages/equipment/BookEquipment';
import MyBookings from './pages/equipment/MyBookings';

// TEMPORARY: remove when Person 1's layout is in (see section 3)
import EquipmentShell from './pages/equipment/ui/EquipmentShell';

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

        <Route path="/equipment" element={<EquipmentShell><EquipmentList /></EquipmentShell>} />
        <Route path="/equipment/:id/book" element={<EquipmentShell><BookEquipment /></EquipmentShell>} />
        <Route path="/equipment/my-bookings" element={<EquipmentShell><MyBookings /></EquipmentShell>} />

        {/* Fallback for other non-existent routes */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
