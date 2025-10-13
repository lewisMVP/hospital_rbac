import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import { auditAPI } from '../services/api';
import ErrorMessage from './ErrorMessage';
import './AuditLog.css';

const AuditLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Fetch data from API
  const { data: auditLogs, loading, error } = useAPI(() => 
    auditAPI.getAll({ 
      page: currentPage, 
      limit: itemsPerPage,
      event_type: filterType !== 'all' ? filterType : undefined,
      search: searchTerm || undefined
    })
  );

  const { data: stats } = useAPI(auditAPI.getStats);
  const { data: securityAlerts } = useAPI(auditAPI.getSecurityAlerts);

  // Debug logging
  console.log('🔍 Audit Log Debug:', {
    auditLogs,
    loading,
    error,
    stats,
    securityAlerts
  });

  // Filter logs - auditLogs is already the data array from useAPI
  const filteredLogs = auditLogs?.filter(log => {
    // Handle FAILED_LOGIN filter: match LOGIN events with failed status
    const matchesType = filterType === 'all' || 
      log.event_type === filterType ||
      (filterType === 'FAILED_LOGIN' && log.event_type === 'LOGIN' && log.status === 'failed');
    
    const matchesSearch = !searchTerm || 
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  const totalPages = Math.ceil((filteredLogs?.length || 0) / itemsPerPage);

  const getSeverityClass = (severity) => {
    const severityMap = {
      'critical': 'severity-critical',
      'high': 'severity-high',
      'medium': 'severity-medium',
      'low': 'severity-low'
    };
    return severityMap[severity?.toLowerCase()] || 'severity-low';
  };

  const getEventIcon = (eventType, status) => {
    // Show failed login icon if it's a LOGIN with failed status
    if (eventType === 'LOGIN' && status === 'failed') {
      return '❌';
    }
    
    const iconMap = {
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'FAILED_LOGIN': '❌',
      'INSERT': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'GRANT': '🔓',
      'REVOKE': '🔒'
    };
    return iconMap[eventType] || '📝';
  };

  // CSV Export Function
  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV Headers
    const headers = ['Audit ID', 'Event Type', 'Username', 'Table', 'Status', 'Details', 'Timestamp'];
    
    // CSV Rows
    const rows = filteredLogs.map(log => [
      log.audit_id,
      log.event_type,
      log.username || 'System',
      log.table_name || 'N/A',
      log.status || 'success',
      (log.details || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
      new Date(log.event_time).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="audit-log-container">
        <div className="loading">Loading audit logs...</div>
      </div>
    );
  }
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="audit-log">
      {/* Security Alerts */}
      {securityAlerts && securityAlerts.length > 0 && (
        <div className="security-alerts">
          <h3>🚨 Security Alerts</h3>
          <div className="alerts-grid">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${getSeverityClass(alert.severity)}`}>
                <div className="alert-header">
                  <span className="alert-icon">{alert.icon}</span>
                  <span className="alert-severity">{alert.severity}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="audit-stats">
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div>
              <p className="stat-label">Total Events</p>
              <p className="stat-value">{stats.total_events || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">❌</span>
            <div>
              <p className="stat-label">Failed Logins</p>
              <p className="stat-value">{stats.failed_logins || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <p className="stat-label">Active Users</p>
              <p className="stat-value">{stats.active_users || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🕐</span>
            <div>
              <p className="stat-label">Last 24h</p>
              <p className="stat-value">{stats.events_24h || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="audit-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="LOGIN">Logins</option>
          <option value="FAILED_LOGIN">Failed Logins</option>
          <option value="INSERT">Inserts</option>
          <option value="UPDATE">Updates</option>
          <option value="DELETE">Deletes</option>
          <option value="GRANT">Grants</option>
          <option value="REVOKE">Revokes</option>
        </select>
        <button className="btn-export" onClick={exportToCSV}>📥 Export Logs</button>
      </div>

      {/* Audit Table */}
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>User</th>
              <th>Table</th>
              <th>Action</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No audit logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.audit_id}>
                  <td>
                    <span className="event-badge">
                      {getEventIcon(log.event_type, log.status)} {log.event_type}
                      {log.status === 'failed' && ' (Failed)'}
                    </span>
                  </td>
                  <td>{log.username || 'System'}</td>
                  <td>{log.table_name || 'N/A'}</td>
                  <td>
                    <span className={log.status === 'failed' ? 'status-failed' : 'status-success'}>
                      {log.status || 'success'}
                    </span>
                  </td>
                  <td className="timestamp">
                    {new Date(log.event_time).toLocaleString()}
                  </td>
                  <td>
                    <button className="btn-details" title={log.details || 'View details'}>
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
