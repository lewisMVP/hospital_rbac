import React from 'react'
import './Header.css'

const Header = ({ activeView }) => {
  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'System Overview & Statistics' }
      case 'users':
        return { title: 'User Management', subtitle: 'Manage users and their roles' }
      case 'roles':
        return { title: 'Roles & Permissions', subtitle: 'Access control matrix' }
      case 'audit':
        return { title: 'Audit Logs', subtitle: 'Security and activity monitoring' }
      default:
        return { title: 'Dashboard', subtitle: 'System Overview' }
    }
  }

  const { title, subtitle } = getTitle()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
        <div className="header-actions">
          <button className="header-btn header-btn-secondary">
            <span className="btn-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
          <button className="header-btn header-btn-secondary">
            <span className="btn-icon">⚙️</span>
          </button>
          <button className="header-btn header-btn-primary">
            <span className="btn-icon">➕</span>
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
