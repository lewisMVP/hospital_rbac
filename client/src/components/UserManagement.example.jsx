// EXAMPLE: UserManagement với backend integration

import React, { useState } from 'react'
import './UserManagement.css'
import { useAPI, useMutation } from '../hooks/useAPI'
import { userAPI, roleAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const UserManagementWithBackend = () => {
  const [selectedTab, setSelectedTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch users
  const { 
    data: usersData, 
    loading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useAPI(() => userAPI.getAll({ search: searchQuery }), [searchQuery])

  // Fetch roles
  const { 
    data: rolesData, 
    loading: rolesLoading, 
    error: rolesError,
    refetch: refetchRoles 
  } = useAPI(roleAPI.getAll)

  // Delete user mutation
  const { mutate: deleteUser, loading: deleteLoading } = useMutation(userAPI.delete)

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await deleteUser(userId)
      
      if (result.success) {
        alert('User deleted successfully!')
        refetchUsers() // Refresh danh sách
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  // Loading state
  if (usersLoading || rolesLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Error state
  if (usersError || rolesError) {
    return (
      <ErrorMessage 
        error={usersError || rolesError}
        onRetry={() => {
          refetchUsers()
          refetchRoles()
        }}
        fullScreen
      />
    )
  }

  const users = usersData?.users || []
  const roles = rolesData?.roles || []

  return (
    <div className="user-management">
      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          <span className="tab-icon">👥</span>
          <span>Users</span>
          <span className="tab-count">{users.length}</span>
        </button>
        <button 
          className={`tab ${selectedTab === 'roles' ? 'active' : ''}`}
          onClick={() => setSelectedTab('roles')}
        >
          <span className="tab-icon">🔐</span>
          <span>Roles</span>
          <span className="tab-count">{roles.length}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={`Search ${selectedTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn">
          <span>⚙️</span>
          <span>Filters</span>
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'users' ? (
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar-large">{user.avatar || '👤'}</div>
                <span className={`status-badge ${user.status?.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <div className="user-role-badge">
                  <span className="role-dot"></span>
                  {user.role}
                </div>
              </div>
              <div className="user-actions">
                <button className="action-btn-small" title="Edit">
                  <span>✏️</span>
                </button>
                <button className="action-btn-small" title="Permissions">
                  <span>🔑</span>
                </button>
                <button 
                  className="action-btn-small danger" 
                  title="Delete"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={deleteLoading}
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="roles-list">
          {roles.map(role => (
            <div key={role.id} className="role-card" style={{'--role-color': role.color}}>
              <div className="role-header">
                <div className="role-icon-wrapper">
                  <span className="role-icon-large">{role.icon || '🔐'}</span>
                </div>
                <div className="role-content">
                  <h3 className="role-name">{role.name}</h3>
                  <div className="role-stats">
                    <span className="role-stat">
                      <span className="stat-icon">👥</span>
                      {role.users} users
                    </span>
                    <span className="role-stat">
                      <span className="stat-icon">🔑</span>
                      {role.permissions} permissions
                    </span>
                  </div>
                </div>
              </div>
              <div className="role-actions">
                <button className="role-btn-secondary">
                  <span>👁️</span>
                  <span>View</span>
                </button>
                <button className="role-btn-primary">
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserManagementWithBackend
