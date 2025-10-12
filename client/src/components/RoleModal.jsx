import React, { useState, useEffect } from 'react';
import './UserModal.css'; // Reuse same modal styles

const RoleModal = ({ isOpen, onClose, onSave, role }) => {
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      // Edit mode
      setFormData({
        role_name: role.role_name || '',
        description: role.description || '',
      });
    } else {
      // Create mode
      setFormData({
        role_name: '',
        description: '',
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    } else if (formData.role_name.length < 3) {
      newErrors.role_name = 'Role name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({
        role_name: formData.role_name,
        description: formData.description,
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save role' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{role ? '✏️ Edit Role' : '➕ Create New Role'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.submit && (
            <div className="form-error-banner">
              <span className="error-icon">⚠️</span>
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role_name">
              Role Name <span className="required">*</span>
            </label>
            <input
              id="role_name"
              name="role_name"
              type="text"
              value={formData.role_name}
              onChange={handleChange}
              className={errors.role_name ? 'error' : ''}
              placeholder="e.g., Admin, Manager, Viewer"
              autoFocus
            />
            {errors.role_name && <span className="field-error">{errors.role_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role's responsibilities..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  {role ? '💾 Update' : '✨ Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
