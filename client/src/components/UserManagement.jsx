import React, { useState } from 'react'
import './UserManagement.css'

const UserManagement = () => {
  const [selectedTab, setSelectedTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')

  const users = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com', role: 'Doctor', status: 'Active', avatar: '👩‍⚕️' },
    { id: 2, name: 'Nurse Mike Chen', email: 'mike.c@hospital.com', role: 'Nurse', status: 'Active', avatar: '👨‍⚕️' },
    { id: 3, name: 'Dr. Emily Brown', email: 'emily.b@hospital.com', role: 'Doctor', status: 'Active', avatar: '👩‍⚕️' },
    { id: 4, name: 'John Doe', email: 'john.d@hospital.com', role: 'Admin', status: 'Active', avatar: '👤' },
    { id: 5, name: 'Anna Lee', email: 'anna.l@hospital.com', role: 'Receptionist', status: 'Inactive', avatar: '👩' },
    { id: 6, name: 'Dr. Robert Kim', email: 'robert.k@hospital.com', role: 'Doctor', status: 'Active', avatar: '👨‍⚕️' },
  ]

  const roles = [
    { id: 1, name: 'Doctor', users: 45, permissions: 12, color: '#007aff', icon: '👨‍⚕️' },
    { id: 2, name: 'Nurse', users: 78, permissions: 8, color: '#34c759', icon: '👩‍⚕️' },
    { id: 3, name: 'Receptionist', users: 56, permissions: 5, color: '#ff9500', icon: '👩' },
    { id: 4, name: 'Admin', users: 12, permissions: 20, color: '#5856d6', icon: '⚙️' },
    { id: 5, name: 'Billing', users: 34, permissions: 6, color: '#ff3b30', icon: '💰' },
  ]

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
                <div className="user-avatar-large">{user.avatar}</div>
                <span className={`status-badge ${user.status.toLowerCase()}`}>
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
                <button className="action-btn-small">
                  <span>✏️</span>
                </button>
                <button className="action-btn-small">
                  <span>🔑</span>
                </button>
                <button className="action-btn-small danger">
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
                  <span className="role-icon-large">{role.icon}</span>
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

export default UserManagement
