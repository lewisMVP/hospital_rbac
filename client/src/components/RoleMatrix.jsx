import React from 'react';
import { useAPI } from '../hooks/useAPI';
import { roleAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './RoleMatrix.css';

const RoleMatrix = () => {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} fullScreen />;

  return (
    <div className="role-matrix">
      {/* Header */}
      <div className="matrix-header">
        <h2>Roles & Permissions Matrix</h2>
        <p className="matrix-subtitle">Access control overview for all roles</p>
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
                  <div>
                    <h3 className="role-title">{role.role_name}</h3>
                    <p className="role-user-count">{role.user_count || 0} users</p>
                  </div>
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

      {/* Info Banner */}
      <div className="info-banner">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>Note:</strong> Permissions are managed at the PostgreSQL database level using GRANT statements.
          To modify permissions, please update the database roles directly.
        </div>
      </div>
    </div>
  );
};

export default RoleMatrix;
