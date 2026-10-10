import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getReservations, updateReservation } from '../../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getReservations();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      const typeStr = type === 'Equipment' ? 'equipment' : 'book';
      await updateReservation(typeStr, id, 'approve');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id, type) => {
    try {
      const typeStr = type === 'Equipment' ? 'equipment' : 'book';
      await updateReservation(typeStr, id, 'reject');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
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
            <div className="card-value">{loading ? '-' : bookings.length}</div>
            <div className="card-label">Total Bookings</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div className="card-value">{loading ? '-' : bookings.filter(b => b.status === 'pending').length}</div>
            <div className="card-label">Pending Requests</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="card-value">{loading ? '-' : bookings.filter(b => b.status === 'approved').length}</div>
            <div className="card-label">Approved Bookings</div>
          </div>
          <div className="summary-card">
            <div className="card-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <div className="card-value">{loading ? '-' : bookings.filter(b => b.status === 'rejected').length}</div>
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
                {error ? (
                  <tr><td colSpan="7" style={{textAlign: 'center', color: 'red', padding: '20px'}}>{error}</td></tr>
                ) : bookings.length === 0 && !loading ? (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No reservations found.</td></tr>
                ) : bookings.map((booking) => (
                    <tr key={`${booking.type}-${booking.id}`}>
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
                      {booking.status === 'pending' ? (
                        <>
                          <button className="action-btn btn-approve" onClick={() => handleApprove(booking.id, booking.type)}>
                            Approve
                          </button>
                          <button className="action-btn btn-reject" onClick={() => handleReject(booking.id, booking.type)}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                          {booking.status === 'approved' ? 'Ready for pickup' : 'No action needed'}
                        </span>
                      )}
                    </td>
                  </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
