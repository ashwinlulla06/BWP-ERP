import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { getReports } from '../../services/api';

const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportHtml, setReportHtml] = useState('');
  const [reportType, setReportType] = useState('All Bookings');
  const [fromDate, setFromDate] = useState('2024-10-01');
  const [toDate, setToDate] = useState('2024-10-31');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReportGenerated(false);
    try {
      const html = await getReports(fromDate, toDate, reportType);
      setReportHtml(html);
      setReportGenerated(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
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
                <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option>All Bookings</option>
                  <option>Equipment Usage</option>
                  <option>Library Checkout</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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
                <h2 className="table-title">Report Preview: {reportType} ({fromDate} to {toDate})</h2>
                <button className="action-btn btn-reject" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Download HTML
                </button>
              </div>
              <div style={{ overflowX: 'auto', padding: '24px', backgroundColor: '#F8FAFC' }}>
                <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
