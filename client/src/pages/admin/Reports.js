import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1200);
  };

  return (
    <AdminLayout activeMenu="reports">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Booking Reports</h1>
          <p className="page-subtitle">Generate comprehensive resource usage reports via XSLT engine.</p>
        </div>

        <div className="summary-cards" style={{ display: 'block' }}>
          <div className="summary-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Report Configuration</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                <label className="form-label">Report Type</label>
                <select className="form-control">
                  <option>All Bookings</option>
                  <option>Equipment Usage</option>
                  <option>Library Checkout</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" defaultValue="2024-10-01" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" defaultValue="2024-10-31" />
              </div>
              <button 
                className="btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ padding: '10px 24px' }}
              >
                {isGenerating ? 'Processing XML...' : 'Generate Report'}
              </button>
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#64748B' }}>
              * Note: Data will be fetched via AJAX, converted to XML, and styled using XSLT on the backend.
            </div>
          </div>
        </div>

        <div className="table-container" style={{ minHeight: '300px', padding: reportGenerated ? '0' : '40px' }}>
          {!reportGenerated && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>description</span>
              <p>Configure parameters above and click "Generate Report" to view preview.</p>
            </div>
          )}

          {isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>sync</span>
              <p style={{ fontWeight: 500 }}>Applying XSLT Stylesheet...</p>
            </div>
          )}

          {reportGenerated && !isGenerating && (
            <>
              <div className="table-header">
                <h2 className="table-title">Report Preview: All Bookings (Oct 2024)</h2>
                <button className="action-btn btn-reject" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Download HTML
                </button>
              </div>
              <div style={{ overflowX: 'auto', padding: '24px', backgroundColor: '#F8FAFC' }}>
                {/* Mock HTML Report mimicking what XSLT would produce */}
                <div style={{ backgroundColor: 'white', padding: '32px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid var(--secondary)', paddingBottom: '16px' }}>
                    <h2>UniReserve Master Report</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Generated on: October 7, 2024</p>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9' }}>
                        <th style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Transaction ID</th>
                        <th style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Resource</th>
                        <th style={{ border: '1px solid #E2E8F0', padding: '12px' }}>User</th>
                        <th style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>BKG-001</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Digital Oscilloscope</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Alex Morgan</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>2024-10-08</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>BKG-002</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Cleanroom Station</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>Emily Chen</td>
                        <td style={{ border: '1px solid #E2E8F0', padding: '12px' }}>2024-10-06</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
