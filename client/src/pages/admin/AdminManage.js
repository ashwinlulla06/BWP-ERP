import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const mockEquipment = [
  { id: 'EQ-01', name: 'Digital Oscilloscope 100MHz', description: '4 Analogue Channels', qty: 5, status: 'Available' },
  { id: 'EQ-02', name: 'Cleanroom Station', description: 'Class 100 cleanroom bench', qty: 10, status: 'Available' },
];

const mockBooks = [
  { id: 'BK-01', title: 'Introduction to Algorithms (4th Ed)', author: 'Cormen et al.', isbn: '9780262046305', status: 'Available' },
  { id: 'BK-02', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', status: 'Checked Out' },
];

const AdminManage = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  
  // States for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add-eq', 'edit-eq', 'add-bk', 'edit-bk'
  const [currentRecord, setCurrentRecord] = useState(null);

  const openModal = (type, record = null) => {
    setModalType(type);
    setCurrentRecord(record || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
  };

  return (
    <AdminLayout activeMenu="manage">
      <div className="page-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Master Data Management</h1>
            <p className="page-subtitle">Manage campus equipment inventory and library catalogs.</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => openModal(activeTab === 'equipment' ? 'add-eq' : 'add-bk')}
          >
            <span className="material-symbols-outlined">add</span> Add {activeTab === 'equipment' ? 'Equipment' : 'Book'}
          </button>
        </div>

        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment Inventory
          </div>
          <div 
            className={`tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Library Catalog
          </div>
        </div>

        <div className="table-container">
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'equipment' ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Equipment Name</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockEquipment.map((eq) => (
                    <tr key={eq.id}>
                      <td>{eq.id}</td>
                      <td style={{ fontWeight: 600 }}>{eq.name}</td>
                      <td>{eq.description}</td>
                      <td>{eq.qty}</td>
                      <td>
                        <span className={`status-badge status-${eq.status.toLowerCase().replace(' ', '-')}`}>{eq.status}</span>
                      </td>
                      <td>
                        <button className="action-btn btn-reject" style={{ marginRight: 8 }} onClick={() => openModal('edit-eq', eq)}>Edit</button>
                        <button className="action-btn btn-reject" style={{ color: '#B91C1C', borderColor: '#FECACA' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBooks.map((bk) => (
                    <tr key={bk.id}>
                      <td>{bk.id}</td>
                      <td style={{ fontWeight: 600 }}>{bk.title}</td>
                      <td>{bk.author}</td>
                      <td>{bk.isbn}</td>
                      <td>
                        <span className={`status-badge status-${bk.status.toLowerCase().replace(' ', '-')}`}>
                          {bk.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn btn-reject" style={{ marginRight: 8 }} onClick={() => openModal('edit-bk', bk)}>Edit</button>
                        <button className="action-btn btn-reject" style={{ color: '#B91C1C', borderColor: '#FECACA' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType.includes('add') ? 'Add New' : 'Edit'} {modalType.includes('eq') ? 'Equipment' : 'Book'}
              </h3>
              <button className="modal-close" onClick={closeModal}><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="modal-body">
              {modalType.includes('eq') ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Equipment Name</label>
                    <input type="text" className="form-control" defaultValue={currentRecord?.name || ''} placeholder="e.g. Digital Oscilloscope" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" defaultValue={currentRecord?.description || ''} placeholder="Equipment specs" />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" defaultValue={currentRecord?.qty || 1} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Status</label>
                      <select className="form-control" defaultValue={currentRecord?.status || 'Available'}>
                        <option>Available</option>
                        <option>Maintenance</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Book Title</label>
                    <input type="text" className="form-control" defaultValue={currentRecord?.title || ''} placeholder="Enter title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author</label>
                    <input type="text" className="form-control" defaultValue={currentRecord?.author || ''} placeholder="Enter author" />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">ISBN</label>
                      <input type="text" className="form-control" defaultValue={currentRecord?.isbn || ''} placeholder="ISBN number" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Status</label>
                      <select className="form-control" defaultValue={currentRecord?.status || 'Available'}>
                        <option>Available</option>
                        <option>Checked Out</option>
                        <option>Lost</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="action-btn btn-reject" onClick={closeModal} style={{ padding: '10px 20px', fontSize: '14px' }}>Cancel</button>
              <button className="btn-primary" onClick={closeModal}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManage;
