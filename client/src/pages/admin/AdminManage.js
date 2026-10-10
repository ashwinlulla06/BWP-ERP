import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getEquipment, getBooks, createEquipment, updateEquipment, deleteEquipment, createBook, updateBook, deleteBook } from '../../services/api';

const AdminManage = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [error, setError] = useState(null);
  
  // States for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add-eq', 'edit-eq', 'add-bk', 'edit-bk'
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setError(null);
      if (activeTab === 'equipment') {
        const data = await getEquipment();
        setEquipmentList(data);
      } else {
        const data = await getBooks();
        setBookList(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (type, record = null) => {
    setModalType(type);
    setCurrentRecord(record || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'add-eq') {
        await createEquipment(currentRecord);
      } else if (modalType === 'edit-eq') {
        await updateEquipment(currentRecord.id, currentRecord);
      } else if (modalType === 'add-bk') {
        await createBook(currentRecord);
      } else if (modalType === 'edit-bk') {
        await updateBook(currentRecord.id, currentRecord);
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      if (type === 'equipment') {
        await deleteEquipment(id);
      } else {
        await deleteBook(id);
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
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
                  {error ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', color: 'red', padding: '20px'}}>{error}</td></tr>
                  ) : equipmentList.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No equipment found.</td></tr>
                  ) : equipmentList.map((eq) => (
                    <tr key={eq.id}>
                      <td>{eq.id}</td>
                      <td style={{ fontWeight: 600 }}>{eq.name}</td>
                      <td>{eq.description}</td>
                      <td>{eq.total_qty}</td>
                      <td>
                        <span className={`status-badge status-available`}>Available</span>
                      </td>
                      <td>
                        <button className="action-btn btn-reject" style={{ marginRight: 8 }} onClick={() => openModal('edit-eq', eq)}>Edit</button>
                        <button className="action-btn btn-reject" style={{ color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => handleDelete(eq.id, 'equipment')}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
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
                  {error ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', color: 'red', padding: '20px'}}>{error}</td></tr>
                  ) : bookList.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No books found.</td></tr>
                  ) : bookList.map((bk) => (
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
                        <button className="action-btn btn-reject" style={{ color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => handleDelete(bk.id, 'book')}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
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
                    <input type="text" className="form-control" value={currentRecord?.name || ''} onChange={(e) => setCurrentRecord({...currentRecord, name: e.target.value})} placeholder="e.g. Digital Oscilloscope" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={currentRecord?.description || ''} onChange={(e) => setCurrentRecord({...currentRecord, description: e.target.value})} placeholder="Equipment specs" />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" value={currentRecord?.total_qty || 1} onChange={(e) => setCurrentRecord({...currentRecord, total_qty: Number(e.target.value)})} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Book Title</label>
                    <input type="text" className="form-control" value={currentRecord?.title || ''} onChange={(e) => setCurrentRecord({...currentRecord, title: e.target.value})} placeholder="Enter title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author</label>
                    <input type="text" className="form-control" value={currentRecord?.author || ''} onChange={(e) => setCurrentRecord({...currentRecord, author: e.target.value})} placeholder="Enter author" />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">ISBN</label>
                      <input type="text" className="form-control" value={currentRecord?.isbn || ''} onChange={(e) => setCurrentRecord({...currentRecord, isbn: e.target.value})} placeholder="ISBN number" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Status</label>
                      <select className="form-control" value={currentRecord?.status || 'available'} onChange={(e) => setCurrentRecord({...currentRecord, status: e.target.value})}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="action-btn btn-reject" onClick={closeModal} style={{ padding: '10px 20px', fontSize: '14px' }}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManage;
