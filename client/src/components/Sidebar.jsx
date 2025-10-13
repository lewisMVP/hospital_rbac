import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

const Sidebar = ({ activeView, setActiveView }) => {
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const allMenuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Overview', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Billing'] },
    { id: 'patients', icon: '🏥', label: 'Patients', description: 'Patient Records', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { id: 'medical-records', icon: '📋', label: 'Medical Records', description: 'Medical History', roles: ['Admin', 'Doctor', 'Nurse'] },
    { id: 'appointments', icon: '📅', label: 'Appointments', description: 'Scheduling', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { id: 'users', icon: '👥', label: 'Users', description: 'User Management', roles: ['Admin'] },
    { id: 'roles', icon: '🔐', label: 'Roles & Permissions', description: 'Access Matrix', roles: ['Admin'] },
    { id: 'audit', icon: '�', label: 'Audit Logs', description: 'Security Trail', roles: ['Admin'] },
  ]

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role_name)
  )

  // DEBUG: Log user info
  console.log('👤 Sidebar user:', user)
  console.log('📋 Menu items:', menuItems)

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    await logout()
    setShowLogoutConfirm(false)
  }

  const getRoleIcon = (roleName) => {
    const icons = {
      'Doctor': '👨‍⚕️',
      'Nurse': '👩‍⚕️',
      'Admin': '⚙️',
      'Receptionist': '👩',
      'Billing': '💰'
    }
    return icons[roleName] || '👤'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
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
            <div className="user-avatar">{getRoleIcon(user?.role_name)}</div>
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">{user?.role_name || 'Role'}</span>
            </div>
            <button 
              className="logout-button" 
              onClick={handleLogout}
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <h3>Confirm log out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
