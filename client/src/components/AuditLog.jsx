import React, { useState } from 'react'
import './AuditLog.css'

const AuditLog = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  const auditLogs = [
    { 
      id: 1, 
      timestamp: '2024-10-11 14:32:15', 
      user: 'Dr. Sarah Johnson', 
      action: 'SELECT', 
      resource: 'MedicalRecords', 
      status: 'Success',
      ip: '192.168.1.45',
      details: 'Viewed patient record #12345'
    },
    { 
      id: 2, 
      timestamp: '2024-10-11 14:28:03', 
      user: 'Nurse Mike Chen', 
      action: 'UPDATE', 
      resource: 'Patients', 
      status: 'Success',
      ip: '192.168.1.67',
      details: 'Updated medication for patient #12346'
    },
    { 
      id: 3, 
      timestamp: '2024-10-11 14:15:42', 
      user: 'admin@hospital.com', 
      action: 'GRANT', 
      resource: 'Roles', 
      status: 'Success',
      ip: '192.168.1.100',
      details: 'Added user to Doctor role'
    },
    { 
      id: 4, 
      timestamp: '2024-10-11 13:58:21', 
      user: 'unknown@test.com', 
      action: 'LOGIN', 
      resource: 'Authentication', 
      status: 'Failed',
      ip: '203.45.67.89',
      details: 'Invalid credentials - 3rd attempt'
    },
    { 
      id: 5, 
      timestamp: '2024-10-11 13:45:11', 
      user: 'Dr. Emily Brown', 
      action: 'DELETE', 
      resource: 'Appointments', 
      status: 'Success',
      ip: '192.168.1.52',
      details: 'Cancelled appointment #789'
    },
    { 
      id: 6, 
      timestamp: '2024-10-11 13:30:05', 
      user: 'hacker@evil.com', 
      action: 'SELECT', 
      resource: 'MedicalRecords', 
      status: 'Failed',
      ip: '185.220.101.45',
      details: 'Unauthorized access attempt'
    },
  ]

  const securityAlerts = [
    { 
      id: 1, 
      severity: 'high', 
      message: 'Multiple failed login attempts from IP 203.45.67.89', 
      count: 5,
      timestamp: '14:30'
    },
    { 
      id: 2, 
      severity: 'medium', 
      message: 'Unusual access pattern detected for user: Dr. Sarah Johnson', 
      count: 1,
      timestamp: '13:45'
    },
    { 
      id: 3, 
      severity: 'low', 
      message: 'New user role created: Pharmacy', 
      count: 1,
      timestamp: '12:20'
    },
  ]

  const stats = [
    { label: 'Total Events', value: '1,847', icon: '📊', color: '#007aff' },
    { label: 'Failed Logins', value: '23', icon: '⚠️', color: '#ff9500' },
    { label: 'Unauthorized Access', value: '7', icon: '🚫', color: '#ff3b30' },
    { label: 'Role Changes', value: '15', icon: '🔑', color: '#34c759' },
  ]

  const getStatusColor = (status) => {
    return status === 'Success' ? 'success' : 'failed'
  }

  const getActionIcon = (action) => {
    switch(action) {
      case 'SELECT': return '👁️'
      case 'INSERT': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'GRANT': return '🔑'
      case 'LOGIN': return '🔐'
      default: return '📝'
    }
  }

  const getSeverityClass = (severity) => {
    return `alert-${severity}`
  }

  return (
    <div className="audit-log">
      {/* Statistics */}
      <div className="audit-stats">
        {stats.map((stat, index) => (
          <div key={index} className="audit-stat-card" style={{'--stat-color': stat.color}}>
            <span className="stat-icon-large">{stat.icon}</span>
            <div className="stat-info">
              <h3 className="stat-value-large">{stat.value}</h3>
              <p className="stat-label-small">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="audit-content">
        {/* Security Alerts */}
        <div className="security-alerts">
          <div className="alerts-header">
            <h2 className="alerts-title">Security Alerts</h2>
            <span className="alert-count">{securityAlerts.length}</span>
          </div>
          <div className="alerts-list">
            {securityAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                <div className="alert-indicator"></div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <div className="alert-meta">
                    <span className="alert-time">🕒 {alert.timestamp}</span>
                    <span className={`severity-badge ${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="audit-table-container">
          <div className="table-header">
            <h2 className="table-title">Audit Trail</h2>
            <div className="table-controls">
              <select 
                className="filter-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <select 
                className="filter-select"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="success">Success Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>
          </div>

          <div className="table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="audit-row">
                    <td className="timestamp-cell">{log.timestamp}</td>
                    <td className="user-cell">
                      <div className="user-info-cell">
                        <div className="user-avatar-small">👤</div>
                        <span>{log.user}</span>
                      </div>
                    </td>
                    <td className="action-cell">
                      <div className="action-tag">
                        <span className="action-icon-small">{getActionIcon(log.action)}</span>
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="resource-cell">{log.resource}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="ip-cell">
                      <code>{log.ip}</code>
                    </td>
                    <td className="details-cell">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="results-count">Showing {auditLogs.length} of 1,847 events</span>
            <div className="pagination">
              <button className="page-btn">←</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditLog
