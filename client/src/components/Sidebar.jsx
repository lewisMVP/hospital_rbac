import React from 'react'
import './Sidebar.css'

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users', description: 'User Management' },
    { id: 'roles', icon: '🔐', label: 'Roles & Permissions', description: 'Access Matrix' },
    { id: 'audit', icon: '📋', label: 'Audit Logs', description: 'Security Trail' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <div className="logo-text">
            <h2>Hospital RBAC</h2>
            <p>Access Control System</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">System Administrator</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
