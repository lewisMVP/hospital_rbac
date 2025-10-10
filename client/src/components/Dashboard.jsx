import React from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const stats = [
    { 
      label: 'Total Users', 
      value: '247', 
      change: '+12%', 
      trend: 'up',
      icon: '👥',
      color: '#007aff'
    },
    { 
      label: 'Active Roles', 
      value: '8', 
      change: '+2', 
      trend: 'up',
      icon: '🔐',
      color: '#34c759'
    },
    { 
      label: 'Failed Logins', 
      value: '23', 
      change: '-15%', 
      trend: 'down',
      icon: '⚠️',
      color: '#ff9500'
    },
    { 
      label: 'Audit Entries', 
      value: '1,847', 
      change: '+89', 
      trend: 'up',
      icon: '📋',
      color: '#5856d6'
    },
  ]

  const recentActivities = [
    { user: 'Dr. Sarah Johnson', action: 'Viewed patient record', time: '2 minutes ago', type: 'view' },
    { user: 'Nurse Mike Chen', action: 'Updated medication', time: '15 minutes ago', type: 'update' },
    { user: 'Admin John Doe', action: 'Created new user role', time: '1 hour ago', type: 'create' },
    { user: 'Dr. Emily Brown', action: 'Deleted appointment', time: '2 hours ago', type: 'delete' },
    { user: 'Receptionist Anna Lee', action: 'Scheduled appointment', time: '3 hours ago', type: 'create' },
  ]

  const roleDistribution = [
    { role: 'Doctor', count: 45, percentage: 18, color: '#007aff' },
    { role: 'Nurse', count: 78, percentage: 32, color: '#34c759' },
    { role: 'Receptionist', count: 56, percentage: 23, color: '#ff9500' },
    { role: 'Admin', count: 12, percentage: 5, color: '#5856d6' },
    { role: 'Billing', count: 34, percentage: 14, color: '#ff3b30' },
    { role: 'Other', count: 22, percentage: 8, color: '#86868b' },
  ]

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{'--card-color': stat.color}}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
              <span className={`stat-change ${stat.trend}`}>
                {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button className="card-action">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'view' && '👁️'}
                  {activity.type === 'update' && '✏️'}
                  {activity.type === 'create' && '➕'}
                  {activity.type === 'delete' && '🗑️'}
                </div>
                <div className="activity-content">
                  <p className="activity-user">{activity.user}</p>
                  <p className="activity-action">{activity.action}</p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Role Distribution</h2>
            <button className="card-action">Details</button>
          </div>
          <div className="role-chart">
            {roleDistribution.map((role, index) => (
              <div key={index} className="role-item">
                <div className="role-info">
                  <div className="role-name-wrapper">
                    <div 
                      className="role-color-dot" 
                      style={{backgroundColor: role.color}}
                    ></div>
                    <span className="role-name">{role.role}</span>
                  </div>
                  <span className="role-count">{role.count} users</span>
                </div>
                <div className="role-bar-container">
                  <div 
                    className="role-bar" 
                    style={{
                      width: `${role.percentage}%`,
                      backgroundColor: role.color
                    }}
                  ></div>
                </div>
                <span className="role-percentage">{role.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">Add User</span>
          </button>
          <button className="action-card">
            <span className="action-icon">🔑</span>
            <span className="action-label">Create Role</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span className="action-label">Generate Report</span>
          </button>
          <button className="action-card">
            <span className="action-icon">🔍</span>
            <span className="action-label">Audit Search</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
