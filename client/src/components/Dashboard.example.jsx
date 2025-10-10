// EXAMPLE: Dashboard component với backend integration
// File này cho bạn xem cách sử dụng API service và hooks

import React from 'react'
import './Dashboard.css'
import { useAPI } from '../hooks/useAPI'
import { dashboardAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const DashboardWithBackend = () => {
  // Fetch dashboard stats
  const { 
    data: stats, 
    loading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useAPI(dashboardAPI.getStats)

  // Fetch recent activities
  const { 
    data: activities, 
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities 
  } = useAPI(() => dashboardAPI.getRecentActivities(5))

  // Fetch role distribution
  const { 
    data: roleDistribution, 
    loading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles 
  } = useAPI(dashboardAPI.getRoleDistribution)

  // Loading state
  if (statsLoading || activitiesLoading || rolesLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Error state
  if (statsError || activitiesError || rolesError) {
    return (
      <ErrorMessage 
        error={statsError || activitiesError || rolesError}
        onRetry={() => {
          refetchStats()
          refetchActivities()
          refetchRoles()
        }}
        fullScreen
      />
    )
  }

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats?.map((stat, index) => (
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
            <button className="card-action" onClick={refetchActivities}>
              Refresh
            </button>
          </div>
          
          {activitiesLoading ? (
            <LoadingSpinner size="small" />
          ) : activitiesError ? (
            <ErrorMessage error={activitiesError} onRetry={refetchActivities} />
          ) : (
            <div className="activities-list">
              {activities?.map((activity, index) => (
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
          )}
        </div>

        {/* Role Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Role Distribution</h2>
            <button className="card-action">Details</button>
          </div>
          
          {rolesLoading ? (
            <LoadingSpinner size="small" />
          ) : rolesError ? (
            <ErrorMessage error={rolesError} onRetry={refetchRoles} />
          ) : (
            <div className="role-chart">
              {roleDistribution?.map((role, index) => (
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
          )}
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

export default DashboardWithBackend
