import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { auditAPI } from '../services/api'
import './Header.css'

// SVG Icons
const Icons = {
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  volume: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  bellOff: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
      <path d="M18 8a6 6 0 0 0-9.33-5"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12,5 19,12 12,19"/>
    </svg>
  )
}

const Header = ({ activeView, setActiveView }) => {
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
          
          const importantCount = response.data.filter(log => 
            log.status === 'failed' || log.event_type === 'DELETE'
          ).length
          setNotificationCount(Math.min(importantCount, 99))
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        setNotifications([])
        setNotificationCount(0)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  const formatNotificationText = (log) => {
    const eventMap = {
      'LOGIN': log.status === 'failed' ? 
        `Failed login attempt by ${log.username}` : 
        `${log.username} logged in`,
      'LOGOUT': `${log.username} logged out`,
      'INSERT': `New ${log.table_name} record created`,
      'UPDATE': `${log.table_name} record updated`,
      'DELETE': `${log.table_name} record deleted`,
    }
    return eventMap[log.event_type] || log.details || 'System activity'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const getNotificationType = (eventType, status) => {
    if (status === 'failed') return 'warning'
    if (eventType === 'DELETE') return 'warning'
    if (eventType === 'LOGIN') return 'success'
    if (eventType === 'INSERT') return 'info'
    return 'info'
  }

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
      case 'patients':
        return { title: 'Patients', subtitle: 'Patient records management' }
      case 'medical-records':
        return { title: 'Medical Records', subtitle: 'View and manage medical history' }
      case 'appointments':
        return { title: 'Appointments', subtitle: 'Schedule and manage appointments' }
      case 'audit':
        return { title: 'Audit Logs', subtitle: 'Security and activity monitoring' }
      default:
        return { title: 'Dashboard', subtitle: 'System Overview' }
    }
  }

  const { title, subtitle } = getTitle()

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
              className="header-btn header-btn-icon"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              {Icons.bell}
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
                  >{Icons.close}</button>
                </div>
                <div className="notifications-list">
                  {!isAdmin ? (
                    <div className="no-notifications">
                      <span className="no-notif-icon">{Icons.lock}</span>
                      <p>Admin Access Only</p>
                      <small>System notifications require administrator privileges</small>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      <span className="no-notif-icon">{Icons.bellOff}</span>
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
                        setActiveView('audit')
                      }}
                    >
                      <span>View All in Audit Log</span>
                      {Icons.arrowRight}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="header-btn-wrapper" ref={settingsRef}>
            <button 
              className="header-btn header-btn-icon"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              {Icons.settings}
            </button>
            
            {showSettings && (
              <div className="dropdown-menu settings-dropdown">
                <div className="dropdown-header">
                  <h3>Quick Settings</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowSettings(false)}
                  >{Icons.close}</button>
                </div>
                <div className="settings-list">
                  <button className="setting-item" onClick={toggleDarkMode}>
                    <span className="setting-icon">{darkMode ? Icons.sun : Icons.moon}</span>
                    <span className="setting-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span className={`toggle-switch ${darkMode ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleSound}>
                    <span className="setting-icon">{Icons.volume}</span>
                    <span className="setting-label">Notifications Sound</span>
                    <span className={`toggle-switch ${soundEnabled ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleEmailAlerts}>
                    <span className="setting-icon">{Icons.mail}</span>
                    <span className="setting-label">Email Alerts</span>
                    <span className={`toggle-switch ${emailAlerts ? 'active' : ''}`}></span>
                  </button>
                  <button className="setting-item" onClick={toggleTwoFactor}>
                    <span className="setting-icon">{Icons.shield}</span>
                    <span className="setting-label">Two-Factor Auth</span>
                    <span className={`toggle-switch ${twoFactorAuth ? 'active' : ''}`}></span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Entry Button */}
          <button 
            className="header-btn header-btn-primary"
            onClick={() => alert('Quick add feature coming soon!')}
            title="Quick add new entry"
          >
            {Icons.plus}
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
