import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { auditAPI } from '../services/api'
import './Header.css'

const Header = ({ activeView }) => {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  
  // Settings states
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false'
  })
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem('emailAlerts') === 'true'
  })
  const [twoFactorAuth, setTwoFactorAuth] = useState(() => {
    return localStorage.getItem('twoFactorAuth') === 'true'
  })
  
  const notifRef = useRef(null)
  const settingsRef = useRef(null)

  // Check if user is Admin (only Admin can access audit log)
  const isAdmin = user?.roles === 'Admin' || user?.role_name === 'Admin'

  // Fetch real notifications from audit log (only for Admin)
  useEffect(() => {
    if (!isAdmin) {
      // Non-admin users don't have access to audit log
      return
    }

    const fetchNotifications = async () => {
      try {
        const response = await auditAPI.getAll({ limit: 10 })
        if (response.success && response.data) {
          const recentLogs = response.data.slice(0, 5).map(log => ({
            id: log.audit_id,
            text: formatNotificationText(log),
            time: formatTimeAgo(log.event_time),
            type: getNotificationType(log.event_type, log.status)
          }))
          setNotifications(recentLogs)
          
          // Count important notifications (failed logins, errors)
          const importantCount = response.data.filter(log => 
            log.status === 'failed' || log.event_type === 'DELETE'
          ).length
          setNotificationCount(Math.min(importantCount, 99))
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Clear notifications on error (likely permission denied)
        setNotifications([])
        setNotificationCount(0)
      }
    }

    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  // Format notification text based on audit log
  const formatNotificationText = (log) => {
    const eventMap = {
      'LOGIN': log.status === 'failed' ? 
        `🔒 Failed login attempt by ${log.username}` : 
        `✅ ${log.username} logged in`,
      'LOGOUT': `👋 ${log.username} logged out`,
      'INSERT': `➕ New ${log.table_name} record created`,
      'UPDATE': `✏️ ${log.table_name} record updated`,
      'DELETE': `🗑️ ${log.table_name} record deleted`,
    }
    return eventMap[log.event_type] || log.details || 'System activity'
  }

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000) // seconds

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  // Get notification type for styling
  const getNotificationType = (eventType, status) => {
    if (status === 'failed') return 'warning'
    if (eventType === 'DELETE') return 'warning'
    if (eventType === 'LOGIN') return 'success'
    if (eventType === 'INSERT') return 'info'
    return 'info'
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])
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

  // Toggle functions with localStorage persistence
  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', newValue)
    if (newValue) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }

  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('soundEnabled', newValue)
    // Play a test sound if enabled
    if (newValue) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0PWqzn77BdGAg+ltryxnNfC0m04PfIg0QPTKnh8NdfGQdIp+TwsmkjBzp+z/fUgjIHI3fH8d2QQRY=')
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
  }

  const toggleEmailAlerts = () => {
    const newValue = !emailAlerts
    setEmailAlerts(newValue)
    localStorage.setItem('emailAlerts', newValue)
  }

  const toggleTwoFactor = () => {
    const newValue = !twoFactorAuth
    setTwoFactorAuth(newValue)
    localStorage.setItem('twoFactorAuth', newValue)
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
        <div className="header-actions">
          {/* Notifications Button */}
          <div className="header-btn-wrapper" ref={notifRef}>
            <button 
              className="header-btn header-btn-secondary"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <span className="btn-icon">🔔</span>
              {isAdmin && notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="dropdown-menu notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowNotifications(false)}
                  >✕</button>
                </div>
                <div className="notifications-list">
                  {!isAdmin ? (
                    <div className="no-notifications">
                      <span className="no-notif-icon">🔒</span>
                      <p>Admin Access Only</p>
                      <small>System notifications require administrator privileges</small>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      <span className="no-notif-icon">🔕</span>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${notif.type}`}>
                        <p className="notification-text">{notif.text}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    ))
                  )}
                </div>
                {isAdmin && (
                  <div className="dropdown-footer">
                    <button 
                      className="btn-view-all"
                      onClick={() => {
                        setShowNotifications(false)
                        // Navigate to audit log - you can add navigation logic here
                        window.location.hash = '#audit'
                      }}
                    >
                      View All in Audit Log
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="header-btn-wrapper" ref={settingsRef}>
            <button 
              className="header-btn header-btn-secondary"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <span className="btn-icon">⚙️</span>
            </button>
            
            {showSettings && (
              <div className="dropdown-menu settings-dropdown">
                <div className="dropdown-header">
                  <h3>Quick Settings</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowSettings(false)}
                  >✕</button>
                </div>
                <div className="settings-list">
                  <button className="setting-item" onClick={toggleDarkMode}>
                    <span className="setting-icon">{darkMode ? '☀️' : '🌙'}</span>
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span className={`toggle-switch ${darkMode ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleSound}>
                    <span className="setting-icon">🔊</span>
                    <span>Notifications Sound</span>
                    <span className={`toggle-switch ${soundEnabled ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleEmailAlerts}>
                    <span className="setting-icon">📧</span>
                    <span>Email Alerts</span>
                    <span className={`toggle-switch ${emailAlerts ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleTwoFactor}>
                    <span className="setting-icon">🔒</span>
                    <span>Two-Factor Auth</span>
                    <span className={`toggle-switch ${twoFactorAuth ? 'active' : ''}`}></span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Entry Button - Disabled for demo */}
          <button 
            className="header-btn header-btn-primary"
            onClick={() => alert('🚧 Quick add feature coming soon!')}
            title="Quick add new entry"
          >
            <span className="btn-icon">➕</span>
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
