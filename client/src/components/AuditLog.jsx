import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import { auditAPI } from '../services/api';
import ErrorMessage from './ErrorMessage';
import { Icons, UserAvatar } from './Icons';
import './AuditLog.css';

const AuditLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;
  const maxRecords = 1000;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  const { data: auditLogs, loading, error } = useAPI(() => 
    auditAPI.getAll({ 
      limit: maxRecords,
      event_type: filterType !== 'all' ? filterType : undefined,
      search: searchTerm || undefined
    })
  );

  const { data: stats } = useAPI(auditAPI.getStats);
  const { data: securityAlerts } = useAPI(auditAPI.getSecurityAlerts);

  // Filter logs
  const filteredLogs = auditLogs?.filter(log => {
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

  // Pagination
  const totalPages = Math.ceil((filteredLogs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

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
    if (eventType === 'LOGIN' && status === 'failed') {
      return Icons.xCircle;
    }
    
    const iconMap = {
      'LOGIN': Icons.login,
      'LOGOUT': Icons.logout,
      'FAILED_LOGIN': Icons.xCircle,
      'INSERT': Icons.plus,
      'UPDATE': Icons.edit,
      'DELETE': Icons.trash,
      'GRANT': Icons.unlock,
      'REVOKE': Icons.lock
    };
    return iconMap[eventType] || Icons.fileText;
  };

  // CSV Export
  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Audit ID', 'Event Type', 'Username', 'Table', 'Status', 'Details', 'Timestamp'];
    
    const rows = filteredLogs.map(log => [
      log.audit_id,
      log.event_type,
      log.username || 'System',
      log.table_name || 'N/A',
      log.status || 'success',
      (log.details || '').replace(/,/g, ';'),
      new Date(log.event_time).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

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
      <div className="audit-log">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="audit-log">
      {/* Header */}
      <div className="audit-header">
        <div>
          <h1>Audit Logs</h1>
          <p className="subtitle">Security trail and system activity monitoring</p>
        </div>
      </div>

      {/* Security Alerts */}
      {securityAlerts && securityAlerts.length > 0 && (
        <div className="security-alerts">
          <div className="alerts-header">
            <div className="alerts-title">
              {Icons.alertTriangle}
              <span>Security Alerts</span>
            </div>
            <span className="alert-count">{securityAlerts.length}</span>
          </div>
          <div className="alerts-grid">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${getSeverityClass(alert.severity)}`}>
                <div className="alert-header">
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
            <div className="stat-icon-wrapper">{Icons.barChart}</div>
            <div className="stat-content">
              <p className="stat-label">Total Events</p>
              <p className="stat-value">{stats.total_events || 0}</p>
            </div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-icon-wrapper">{Icons.xCircle}</div>
            <div className="stat-content">
              <p className="stat-label">Failed Logins</p>
              <p className="stat-value">{stats.failed_logins || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">{Icons.users}</div>
            <div className="stat-content">
              <p className="stat-label">Active Users</p>
              <p className="stat-value">{stats.active_users || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">{Icons.clock}</div>
            <div className="stat-content">
              <p className="stat-label">Last 24h</p>
              <p className="stat-value">{stats.events_24h || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="audit-filters">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
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
        <button className="btn-export" onClick={exportToCSV}>
          {Icons.download}
          <span>Export</span>
        </button>
      </div>

      {/* Audit Table */}
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>User</th>
              <th>Table</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No audit logs found
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.audit_id}>
                  <td>
                    <div className="event-badge">
                      <span className="event-icon">{getEventIcon(log.event_type, log.status)}</span>
                      <span>{log.event_type}</span>
                      {log.status === 'failed' && <span className="failed-tag">Failed</span>}
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <UserAvatar name={log.username} role="User" size={28} />
                      <span>{log.username || 'System'}</span>
                    </div>
                  </td>
                  <td>{log.table_name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${log.status === 'failed' ? 'status-failed' : 'status-success'}`}>
                      {log.status || 'success'}
                    </span>
                  </td>
                  <td className="timestamp">
                    {new Date(log.event_time).toLocaleString()}
                  </td>
                  <td>
                    <button className="btn-details" title={log.details || 'View details'}>
                      {Icons.eye}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} records
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
