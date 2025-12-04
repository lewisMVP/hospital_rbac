import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Icons, UserAvatar } from './Icons';
import './MedicalRecords.css';
import './Modal.css';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0]
  });

  const canCreate = user?.role_name === 'Admin' || user?.role_name === 'Doctor';
  const canEdit = user?.role_name === 'Admin' || user?.role_name === 'Doctor';
  const canDelete = user?.role_name === 'Admin';

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/');
      if (response.data.success) {
        setRecords(response.data.records);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/');
      if (response.data.success) {
        setPatients(response.data.patients);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users/doctors');
      if (response.data.success) {
        const doctors = response.data.data || [];
        setDoctors(doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(record);
    
    if (mode === 'edit' && record) {
      setFormData({
        patient_id: record.patient_id || '',
        doctor_id: record.doctor_id || '',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        prescription: record.prescription || '',
        notes: record.notes || '',
        record_date: record.record_date || ''
      });
    } else {
      setFormData({
        patient_id: '',
        doctor_id: user?.role_name === 'Doctor' ? user.user_id : '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
        record_date: new Date().toISOString().split('T')[0]
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRecord(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        const response = await api.post('/medical-records/', formData);
        if (response.data.success) {
          fetchRecords();
          handleCloseModal();
        }
      } else {
        const response = await api.put(`/medical-records/${currentRecord.record_id}`, formData);
        if (response.data.success) {
          fetchRecords();
          handleCloseModal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/medical-records/${recordToDelete.record_id}`);
      if (response.data.success) {
        fetchRecords();
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medical record');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <div className="medical-records-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-records-container">
      <div className="medical-records-header">
        <div>
          <h1>Medical Records</h1>
          <p className="subtitle">Patient medical history and diagnoses</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => handleOpenModal('create')}>
            {Icons.plus}
            <span>Add Medical Record</span>
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

      <div className="medical-records-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">{Icons.clipboard}</div>
          <div className="stat-content">
            <div className="stat-label">Total Records</div>
            <div className="stat-value">{records.length}</div>
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
               canCreate && canEdit ? 'View, Create & Edit' : 'View Only'}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="medical-records-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Record Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No medical records found. {canCreate && 'Click "Add Medical Record" to create one.'}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.record_id}</td>
                  <td>
                    <div className="patient-name-cell">
                      <UserAvatar name={record.patient_name} role="Patient" size={32} />
                      <span className="patient-name">{record.patient_name}</span>
                    </div>
                  </td>
                  <td>{record.doctor_name || '-'}</td>
                  <td className="diagnosis-cell">{record.diagnosis}</td>
                  <td className="treatment-cell">{record.treatment || '-'}</td>
                  <td>{formatDate(record.record_date)}</td>
                  <td>
                    <div className="action-buttons">
                      {canEdit && (
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenModal('edit', record)}
                          title="Edit record"
                        >
                          {Icons.edit}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-action btn-delete"
                          onClick={() => {
                            setRecordToDelete(record);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete record"
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
              <h2>{modalMode === 'create' ? 'Add New Medical Record' : 'Edit Medical Record'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>{Icons.close}</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient *</label>
                    <select
                      value={formData.patient_id}
                      onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(p => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.first_name} {p.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Doctor</label>
                    <select
                      value={formData.doctor_id}
                      onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                      disabled={user?.role_name === 'Doctor'}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(d => (
                        <option key={d.user_id} value={d.user_id}>
                          {d.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Record Date *</label>
                    <input
                      type="date"
                      value={formData.record_date}
                      onChange={(e) => setFormData({...formData, record_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Diagnosis *</label>
                    <textarea
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Treatment</label>
                    <textarea
                      value={formData.treatment}
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Prescription</label>
                    <textarea
                      value={formData.prescription}
                      onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                      rows="2"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Create Record' : 'Update Record'}
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
              <p>Are you sure you want to delete this medical record?</p>
              <div className="record-info">
                <strong>Patient: {recordToDelete?.patient_name}</strong><br/>
                Diagnosis: {recordToDelete?.diagnosis}
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
