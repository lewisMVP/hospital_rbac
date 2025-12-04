import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Icons, HospitalLogo, UserAvatar } from './Icons'
import './Sidebar.css'

const Sidebar = ({ activeView, setActiveView }) => {
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const allMenuItems = [
    { id: 'dashboard', icon: Icons.dashboard, label: 'Dashboard', description: 'Overview', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Billing'] },
    { id: 'patients', icon: Icons.users, label: 'Patients', description: 'Patient Records', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { id: 'medical-records', icon: Icons.clipboard, label: 'Medical Records', description: 'Medical History', roles: ['Admin', 'Doctor', 'Nurse'] },
    { id: 'appointments', icon: Icons.calendar, label: 'Appointments', description: 'Scheduling', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { id: 'users', icon: Icons.userPlus, label: 'Users', description: 'User Management', roles: ['Admin'] },
    { id: 'roles', icon: Icons.shield, label: 'Roles & Permissions', description: 'Access Matrix', roles: ['Admin'] },
    { id: 'audit', icon: Icons.fileText, label: 'Audit Logs', description: 'Security Trail', roles: ['Admin'] },
  ]

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role_name)
  )

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    await logout()
    setShowLogoutConfirm(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? Icons.close : Icons.menu}
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
            <div className="logo-icon">
              <HospitalLogo size={40} />
            </div>
            <div className="logo-text">
              <h2>Hospital Role-Based</h2>
              <p>Access Control System</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
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
              {activeView === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <UserAvatar name={user?.username} role={user?.role_name} size={40} />
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">{user?.role_name || 'Role'}</span>
            </div>
            <button 
              className="logout-button" 
              onClick={handleLogout}
              title="Logout"
            >
              {Icons.logout}
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <div className="modal-icon">
              {Icons.logout}
            </div>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out of your account?</p>
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
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
