import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Icons, UserAvatar } from './Icons';
import './Patients.css';
import './Modal.css';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });

  const canCreate = user?.role_name === 'Admin' || user?.role_name === 'Receptionist';
  const canEdit = user?.role_name === 'Admin';
  const canDelete = user?.role_name === 'Admin';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients/');
      if (response.data.success) {
        setPatients(response.data.patients);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, patient = null) => {
    setModalMode(mode);
    setCurrentPatient(patient);
    
    if (mode === 'edit' && patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPatient(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        const response = await api.post('/patients/', formData);
        if (response.data.success) {
          fetchPatients();
          handleCloseModal();
        }
      } else {
        const response = await api.put(`/patients/${currentPatient.patient_id}`, formData);
        if (response.data.success) {
          fetchPatients();
          handleCloseModal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/patients/${patientToDelete.patient_id}`);
      if (response.data.success) {
        fetchPatients();
        setShowDeleteConfirm(false);
        setPatientToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <div className="patients-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-container">
      <div className="patients-header">
        <div>
          <h1>Patients Management</h1>
          <p className="subtitle">Manage patient records and information</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => handleOpenModal('create')}>
            {Icons.plus}
            <span>Add Patient</span>
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">{Icons.alertCircle}</span>
          <span>{error}</span>
          <button onClick={() => setError('')}>{Icons.close}</button>
        </div>
      )}

      <div className="patients-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">{Icons.users}</div>
          <div className="stat-content">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{patients.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">{Icons.shield}</div>
          <div className="stat-content">
            <div className="stat-label">Your Access Level</div>
            <div className="stat-value">{user?.role_name}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">{Icons.checkCircle}</div>
          <div className="stat-content">
            <div className="stat-label">Permissions</div>
            <div className="stat-value">
              {canCreate && canEdit && canDelete ? 'Full Access' : 
               canCreate ? 'View & Create' : 'View Only'}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No patients found. {canCreate && 'Click "Add Patient" to create one.'}
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>{patient.patient_id}</td>
                  <td>
                    <div className="patient-name-cell">
                      <UserAvatar name={patient.first_name} role="Patient" size={32} />
                      <span className="patient-name">{patient.first_name} {patient.last_name}</span>
                    </div>
                  </td>
                  <td>{formatDate(patient.date_of_birth)}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.email || '-'}</td>
                  <td>{patient.address || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      {canEdit && (
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenModal('edit', patient)}
                          title="Edit patient"
                        >
                          {Icons.edit}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-action btn-delete"
                          onClick={() => {
                            setPatientToDelete(patient);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete patient"
                        >
                          {Icons.trash}
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="no-actions">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Add New Patient' : 'Edit Patient'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>{Icons.close}</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Create Patient' : 'Update Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>{Icons.close}</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this patient?</p>
              <p className="patient-info">
                <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong>
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
