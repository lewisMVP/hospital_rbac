import React, { useState } from 'react'
import './RoleMatrix.css'

const RoleMatrix = () => {
  const roles = ['Doctor', 'Nurse', 'Receptionist', 'Admin', 'Billing']
  const resources = [
    { name: 'Patients', actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    { name: 'Medical Records', actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    { name: 'Appointments', actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    { name: 'Doctors', actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
    { name: 'Invoices', actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  ]

  // Mock permission data
  const permissions = {
    'Doctor': {
      'Patients': ['SELECT', 'INSERT', 'UPDATE'],
      'Medical Records': ['SELECT', 'INSERT', 'UPDATE'],
      'Appointments': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Doctors': ['SELECT'],
      'Invoices': ['SELECT'],
    },
    'Nurse': {
      'Patients': ['SELECT', 'UPDATE'],
      'Medical Records': ['SELECT', 'INSERT'],
      'Appointments': ['SELECT', 'UPDATE'],
      'Doctors': ['SELECT'],
      'Invoices': [],
    },
    'Receptionist': {
      'Patients': ['SELECT', 'INSERT'],
      'Medical Records': [],
      'Appointments': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Doctors': ['SELECT'],
      'Invoices': ['SELECT'],
    },
    'Admin': {
      'Patients': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Medical Records': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Appointments': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Doctors': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      'Invoices': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
    'Billing': {
      'Patients': ['SELECT'],
      'Medical Records': ['SELECT'],
      'Appointments': ['SELECT'],
      'Doctors': ['SELECT'],
      'Invoices': ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
  }

  const [selectedRole, setSelectedRole] = useState('Doctor')
  const [viewMode, setViewMode] = useState('matrix') // 'matrix' or 'detailed'

  const hasPermission = (role, resource, action) => {
    return permissions[role]?.[resource]?.includes(action) || false
  }

  const getPermissionCount = (role) => {
    let count = 0
    Object.values(permissions[role] || {}).forEach(actions => {
      count += actions.length
    })
    return count
  }

  return (
    <div className="role-matrix">
      {/* View Mode Toggle */}
      <div className="view-controls">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            <span>📊</span>
            <span>Matrix View</span>
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            <span>📋</span>
            <span>Detailed View</span>
          </button>
        </div>
        <button className="export-btn">
          <span>📥</span>
          <span>Export Matrix</span>
        </button>
      </div>

      {viewMode === 'matrix' ? (
        <div className="matrix-container">
          <div className="matrix-scroll">
            <table className="permission-matrix">
              <thead>
                <tr>
                  <th className="resource-header">Resource / Role</th>
                  {roles.map(role => (
                    <th key={role} className="role-header">
                      <div className="role-header-content">
                        <span className="role-header-name">{role}</span>
                        <span className="permission-count">{getPermissionCount(role)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map(resource => (
                  <React.Fragment key={resource.name}>
                    <tr className="resource-row">
                      <td className="resource-name" colSpan={roles.length + 1}>
                        <div className="resource-name-content">
                          <span className="resource-icon">📁</span>
                          <span>{resource.name}</span>
                        </div>
                      </td>
                    </tr>
                    {resource.actions.map(action => (
                      <tr key={`${resource.name}-${action}`} className="action-row">
                        <td className="action-name">
                          <span className="action-badge">{action}</span>
                        </td>
                        {roles.map(role => (
                          <td key={`${role}-${resource.name}-${action}`} className="permission-cell">
                            <button 
                              className={`permission-toggle ${hasPermission(role, resource.name, action) ? 'granted' : 'denied'}`}
                            >
                              <span className="toggle-icon">
                                {hasPermission(role, resource.name, action) ? '✓' : '✕'}
                              </span>
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="detailed-view">
          {/* Role Selector */}
          <div className="role-selector">
            {roles.map(role => (
              <button
                key={role}
                className={`role-select-btn ${selectedRole === role ? 'active' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="role-select-content">
                  <span className="role-select-name">{role}</span>
                  <span className="role-select-count">{getPermissionCount(role)} permissions</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Permissions */}
          <div className="detailed-permissions">
            <div className="detailed-header">
              <h2 className="detailed-title">{selectedRole} Permissions</h2>
              <span className="total-permissions">{getPermissionCount(selectedRole)} Total</span>
            </div>
            
            <div className="resource-cards">
              {resources.map(resource => {
                const rolePermissions = permissions[selectedRole]?.[resource.name] || []
                const hasAny = rolePermissions.length > 0
                
                return (
                  <div key={resource.name} className={`resource-card ${hasAny ? 'has-permissions' : 'no-permissions'}`}>
                    <div className="resource-card-header">
                      <div className="resource-title">
                        <span className="resource-icon-large">📁</span>
                        <h3>{resource.name}</h3>
                      </div>
                      <span className="permission-badge-count">
                        {rolePermissions.length}/{resource.actions.length}
                      </span>
                    </div>
                    <div className="permissions-grid">
                      {resource.actions.map(action => {
                        const granted = rolePermissions.includes(action)
                        return (
                          <div key={action} className={`permission-item ${granted ? 'granted' : 'denied'}`}>
                            <span className="permission-icon">{granted ? '✓' : '✕'}</span>
                            <span className="permission-label">{action}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleMatrix
