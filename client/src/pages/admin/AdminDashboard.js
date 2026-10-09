import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const mockBookings = [
  {
    id: 'BKG-001',
    user: 'Alex Morgan',
    type: 'Equipment',
    resource: 'Digital Oscilloscope 100MHz',
    date: '2024-10-08',
    time: '10:00 AM - 12:00 PM',
    status: 'Pending',
  },
  {
    id: 'BKG-002',
    user: 'Sarah Jenkins',
    type: 'Library Book',
    resource: 'Introduction to Algorithms (4th Ed)',
    date: '2024-10-07',
    time: 'Pickup by 5:00 PM',
    status: 'Approved',
  },
  {
    id: 'BKG-003',
    user: 'Michael Chang',
    type: 'Equipment',
    resource: 'Robotics Arena (Bench #2)',
    date: '2024-10-09',
    time: '02:00 PM - 04:00 PM',
    status: 'Pending',
  },
  {
    id: 'BKG-004',
    user: 'Emily Chen',
    type: 'Equipment',
    resource: 'Cleanroom Station #4',
    date: '2024-10-06',
    time: '09:00 AM - 01:00 PM',
    status: 'Rejected',
  }
];

const AdminDashboard = () => {
  const [bookings, setBookings] = useState(mockBookings);

  const handleApprove = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
  };

  const handleReject = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Rejected' } : b));
  };

  return (
    <AdminLayout activeMenu="dashboard">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of campus resource reservations and requests.</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon-wrapper">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="card-value">1,248</div>
            <div className="card-label">Total Bookings</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div className="card-value">24</div>
            <div className="card-label">Pending Requests</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="card-value">1,180</div>
            <div className="card-label">Approved Bookings</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <div className="card-value">44</div>
            <div className="card-label">Rejected Bookings</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">Recent Reservations</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Booking Type</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time / Pickup Slot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.user}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{booking.id}</div>
                    </td>
                    <td>{booking.type}</td>
                    <td>{booking.resource}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>
                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'Pending' ? (
                        <>
                          <button className="action-btn btn-approve" onClick={() => handleApprove(booking.id)}>
                            Approve
                          </button>
                          <button className="action-btn btn-reject" onClick={() => handleReject(booking.id)}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                          {booking.status === 'Approved' ? 'Ready for pickup' : 'No action needed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
