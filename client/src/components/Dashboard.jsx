import React, { useEffect, useState, useCallback } from 'react'
import './Dashboard.css'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ErrorMessage from './ErrorMessage'
import { Icons, UserAvatar } from './Icons'

const Dashboard = ({ setActiveView }) => {
  const { user } = useAuth()
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
      const statsData = statsResponse.data
      
      const iconMap = {
        'Total Users': Icons.users,
        'Active Sessions': Icons.activity,
        'Total Roles': Icons.shield,
        'Audit Logs': Icons.database
      }
      
      const statsArray = statsData.map(stat => ({
        label: stat.label,
        value: stat.value,
        change: stat.change,
        trend: stat.trend,
        icon: iconMap[stat.label] || Icons.activity,
        color: stat.color
      }))
      setStats(statsArray)

      // Load recent activities
      const activitiesResponse = await dashboardAPI.getRecentActivities()
      if (activitiesResponse.success) {
        const activitiesData = activitiesResponse.data || []
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
        const roleData = roleResponse.data || []
        const colors = ['#4f7cff', '#a855f7', '#ec4899', '#22c55e', '#f97316', '#06b6d4']
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'view': return Icons.eye
      case 'update': return Icons.edit
      case 'create': return Icons.plus
      case 'delete': return Icons.trash
      default: return Icons.eye
    }
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addUser':
        setActiveView('users')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'createRole':
        setActiveView('roles')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'generateReport':
        setActiveView('audit')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'auditSearch':
        setActiveView('audit')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />
  }

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{'--accent-color': stat.color}}>
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className={`stat-change ${stat.trend}`}>
                {stat.trend === 'up' ? Icons.trendingUp : Icons.trendingDown}
                <span>{stat.change}</span>
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
            <button className="card-action" onClick={() => setActiveView('audit')}>
              View All
              {Icons.arrowRight}
            </button>
          </div>
          <div className="activities-list">
            {recentActivities.length === 0 ? (
              <div className="empty-state">
                <p>No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-user">{activity.user}</p>
                    <p className="activity-action">{activity.action}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Role Distribution</h2>
            <button className="card-action" onClick={() => setActiveView('roles')}>
              Details
              {Icons.arrowRight}
            </button>
          </div>
          <div className="role-chart">
            {roleDistribution.length === 0 ? (
              <div className="empty-state">
                <p>No role data available</p>
              </div>
            ) : (
              roleDistribution.map((role, index) => (
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
                        background: `linear-gradient(90deg, ${role.color} 0%, ${role.color}80 100%)`
                      }}
                    ></div>
                  </div>
                  <span className="role-percentage">{role.percentage}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Only for Admin */}
      {user?.role_name === 'Admin' && (
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => handleQuickAction('addUser')}>
              <span className="action-icon">{Icons.userPlus}</span>
              <span className="action-label">Add User</span>
            </button>
            <button className="action-card" onClick={() => handleQuickAction('createRole')}>
              <span className="action-icon">{Icons.key}</span>
              <span className="action-label">Create Role</span>
            </button>
            <button className="action-card" onClick={() => handleQuickAction('generateReport')}>
              <span className="action-icon">{Icons.barChart}</span>
              <span className="action-label">Generate Report</span>
            </button>
            <button className="action-card" onClick={() => handleQuickAction('auditSearch')}>
              <span className="action-icon">{Icons.search}</span>
              <span className="action-label">Audit Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
