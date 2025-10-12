import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Appointments.css';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'Scheduled',
    reason: '',
    notes: ''
  });

  // Check permissions based on role (from matrix)
  const canCreate = user?.role_name === 'Admin' || user?.role_name === 'Receptionist';
  const canEdit = user?.role_name === 'Admin' || user?.role_name === 'Receptionist';
  const canDelete = user?.role_name === 'Admin' || user?.role_name === 'Receptionist';

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
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
      const response = await api.get('/users/');
      if (response.data.success) {
        const doctorUsers = response.data.users.filter(u => u.role_name === 'Doctor');
        setDoctors(doctorUsers);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const handleOpenModal = (mode, appointment = null) => {
    setModalMode(mode);
    setCurrentAppointment(appointment);
    
    if (mode === 'edit' && appointment) {
      setFormData({
        patient_id: appointment.patient_id || '',
        doctor_id: appointment.doctor_id || '',
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        status: appointment.status || 'Scheduled',
        reason: appointment.reason || '',
        notes: appointment.notes || ''
      });
    } else {
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        status: 'Scheduled',
        reason: '',
        notes: ''
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAppointment(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        const response = await api.post('/appointments/', formData);
        if (response.data.success) {
          fetchAppointments();
          handleCloseModal();
        }
      } else {
        const response = await api.put(`/appointments/${currentAppointment.appointment_id}`, formData);
        if (response.data.success) {
          fetchAppointments();
          handleCloseModal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/appointments/${appointmentToDelete.appointment_id}`);
      if (response.data.success) {
        fetchAppointments();
        setShowDeleteConfirm(false);
        setAppointmentToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'status-scheduled',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'No-Show': 'status-noshow'
    };
    return colors[status] || 'status-scheduled';
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div>
          <h1>Appointments</h1>
          <p className="subtitle">Schedule and manage patient appointments</p>
        </div>
        {canCreate && (
          <button 
            className="btn-primary"
            onClick={() => handleOpenModal('create')}
          >
            <span className="icon">+</span>
            Schedule Appointment
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="appointments-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{appointments.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Scheduled</div>
            <div className="stat-value">
              {appointments.filter(a => a.status === 'Scheduled').length}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <div className="stat-label">Your Access Level</div>
            <div className="stat-value">{user?.role_name}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Permissions</div>
            <div className="stat-value">
              {canCreate && canEdit && canDelete ? 'Full Access' : 'View Only'}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No appointments found. {canCreate && 'Click "Schedule Appointment" to create one.'}
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td>{appointment.appointment_id}</td>
                  <td className="patient-name">{appointment.patient_name}</td>
                  <td>{appointment.doctor_name || 'Unassigned'}</td>
                  <td>{formatDate(appointment.appointment_date)}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>{appointment.reason || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      {canEdit && (
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal('edit', appointment)}
                          title="Edit appointment"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-delete"
                          onClick={() => {
                            setAppointmentToDelete(appointment);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete appointment"
                        >
                          🗑️
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
              <h2>{modalMode === 'create' ? 'Schedule New Appointment' : 'Edit Appointment'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
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
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-Show">No-Show</option>
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows="2"
                    placeholder="Reason for visit..."
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Schedule Appointment' : 'Update Appointment'}
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
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this appointment?</p>
              <p className="appointment-info">
                <strong>Patient: {appointmentToDelete?.patient_name}</strong><br/>
                Date: {formatDate(appointmentToDelete?.appointment_date)} at {appointmentToDelete?.appointment_time}<br/>
                Status: {appointmentToDelete?.status}
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDelete}
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
