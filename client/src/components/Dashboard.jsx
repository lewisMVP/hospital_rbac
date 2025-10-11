import React, { useEffect, useState, useCallback } from 'react'
import './Dashboard.css'
import { dashboardAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const Dashboard = () => {
  const [stats, setStats] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [roleDistribution, setRoleDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load stats
      const statsResponse = await dashboardAPI.getStats()
      if (!statsResponse.success) {
        throw new Error(statsResponse.error || 'Failed to load stats')
      }
      const statsData = statsResponse.data // Already unwrapped in api.js
      
      const statsArray = statsData.map(stat => ({
        label: stat.label,
        value: stat.value,
        change: stat.change,
        trend: stat.trend,
        icon: stat.icon,
        color: stat.color
      }))
      setStats(statsArray)

      // Load recent activities
      const activitiesResponse = await dashboardAPI.getRecentActivities()
      if (activitiesResponse.success) {
        const activitiesData = activitiesResponse.data || [] // Already unwrapped
        const formattedActivities = activitiesData.map(activity => ({
          user: activity.user || 'Unknown',
          action: activity.details || activity.type || 'No action',
          time: formatTimeAgo(activity.time),
          type: getActionType(activity.type)
        }))
        setRecentActivities(formattedActivities)
      }

      // Load role distribution
      const roleResponse = await dashboardAPI.getRoleDistribution()
      if (roleResponse.success) {
        const roleData = roleResponse.data || [] // Already unwrapped
        const colors = ['#007aff', '#34c759', '#ff9500', '#5856d6', '#ff3b30', '#86868b']
        const formattedRoles = roleData.map((role, index) => ({
          role: role.name,
          count: role.value,
          percentage: Math.round((role.value / roleData.reduce((sum, r) => sum + r.value, 0)) * 100) || 0,
          color: colors[index % colors.length]
        }))
        setRoleDistribution(formattedRoles)
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const seconds = Math.floor((now - then) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  const getActionType = (action) => {
    if (!action) return 'view'
    const actionLower = action.toLowerCase()
    if (actionLower.includes('view') || actionLower.includes('read')) return 'view'
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'update'
    if (actionLower.includes('create') || actionLower.includes('add')) return 'create'
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'delete'
    return 'view'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />
  }

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
