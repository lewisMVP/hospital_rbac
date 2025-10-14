import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import { roleAPI } from '../services/api';
import ErrorMessage from './ErrorMessage';
import ConfirmModal from './ConfirmModal';
import './RoleMatrix.css';

const RoleMatrix = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  // Fetch roles from API
  const { data: roles, loading, error, refetch } = useAPI(roleAPI.getAll);

  // Debug log
  console.log('RoleMatrix - roles:', roles);
  console.log('RoleMatrix - loading:', loading);
  console.log('RoleMatrix - error:', error);

  // Static permissions for each role (based on your role_permission.sql)
  const rolePermissions = {
    'Admin': [
      { table: 'Patients', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { table: 'MedicalRecords', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { table: 'Appointments', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { table: 'Users', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { table: 'Roles', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] }
    ],
    'Doctor': [
      { table: 'Patients', permissions: ['SELECT'] },
      { table: 'MedicalRecords', permissions: ['SELECT', 'INSERT', 'UPDATE'] },
      { table: 'Appointments', permissions: ['SELECT'] }
    ],
    'Nurse': [
      { table: 'Patients', permissions: ['SELECT'] },
      { table: 'MedicalRecords', permissions: ['SELECT'] },
      { table: 'Appointments', permissions: ['SELECT'] }
    ],
    'Receptionist': [
      { table: 'Patients', permissions: ['SELECT', 'INSERT'] },
      { table: 'Appointments', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] }
    ],
    'Billing': [
      { table: 'Patients', permissions: ['SELECT'] }
    ]
  };

  const getPermissionIcon = (permission) => {
    const icons = {
      'SELECT': '👁️',
      'INSERT': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️'
    };
    return icons[permission] || '🔧';
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      alert('Please enter a role name');
      return;
    }

    try {
      await roleAPI.create({
        role_name: newRoleName,
        description: newRoleDescription
      });
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      refetch(); // Refresh roles list
      alert('Role created successfully!');
    } catch (error) {
      console.error('Error creating role:', error);
      alert(error.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
  };

  const confirmDeleteRole = async () => {
    try {
      await roleAPI.delete(roleToDelete.role_id);
      setRoleToDelete(null);
      refetch(); // Refresh roles list
      alert('Role deleted successfully!');
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(error.message || 'Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="roles-matrix-container">
        <div className="loading">Loading roles and permissions matrix...</div>
      </div>
    );
  }
  if (error) return <ErrorMessage error={error} onRetry={refetch} fullScreen />;

  return (
    <div className="role-matrix">
      {/* Header */}
      <div className="matrix-header">
        <div>
          <h2>Roles & Permissions Matrix</h2>
          <p className="matrix-subtitle">Access control overview for all roles</p>
        </div>
        <button className="btn-create-role" onClick={() => setShowCreateModal(true)}>
          ➕ Create New Role
        </button>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>Note:</strong> Permissions are managed at the PostgreSQL database level using GRANT statements.
          To modify permissions, please update the database roles directly.
        </div>
      </div>

      {/* Roles Grid */}
      <div className="roles-permission-grid">
        {roles && roles.length > 0 ? (
          roles.map((role) => {
            const permissions = rolePermissions[role.role_name] || [];
            return (
              <div key={role.role_id} className="role-permission-card">
                <div className="role-card-header">
                  <div className="role-icon">{role.icon || '🔑'}</div>
                  <div className="role-header-info">
                    <h3 className="role-title">{role.role_name}</h3>
                    <p className="role-user-count">{role.user_count || 0} users</p>
                  </div>
                  <button 
                    className="btn-delete-role-icon" 
                    onClick={() => handleDeleteRole(role)}
                    title="Delete role"
                  >
                    🗑️
                  </button>
                </div>

                <div className="permissions-list">
                  {permissions.length > 0 ? (
                    permissions.map((perm, index) => (
                      <div key={index} className="permission-group">
                        <div className="permission-table-name">
                          📁 {perm.table}
                        </div>
                        <div className="permission-actions">
                          {perm.permissions.map((action, i) => (
                            <span key={i} className="permission-badge granted">
                              {getPermissionIcon(action)} {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-permissions">
                      <span>No permissions assigned</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-roles">
            <p>No roles found</p>
          </div>
        )}
      </div>
      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter role name (e.g., Manager)"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Enter role description (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleCreateRole}>
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={confirmDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete role "${roleToDelete?.role_name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default RoleMatrix;
