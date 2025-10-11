import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import { userAPI, roleAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './UserManagement.css';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Fetch data from API
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useAPI(userAPI.getAll);
  const { data: roles, loading: rolesLoading, error: rolesError } = useAPI(roleAPI.getAll);

  // Filter users based on search and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.roles?.includes(filterRole);
    return matchesSearch && matchesRole;
  }) || [];

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(roles?.map(r => r.role_name) || [])];

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(userId);
        refetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleAPI.delete(roleId);
        window.location.reload(); // Refresh to update roles
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role');
      }
    }
  };

  if (activeTab === 'users' && usersLoading) return <LoadingSpinner />;
  if (activeTab === 'roles' && rolesLoading) return <LoadingSpinner />;
  if (activeTab === 'users' && usersError) return <ErrorMessage error={usersError} onRetry={refetchUsers} fullScreen />;
  if (activeTab === 'roles' && rolesError) return <ErrorMessage error={rolesError} onRetry={() => window.location.reload()} fullScreen />;

  return (
    <div className="user-management">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          🔑 Roles
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-section">
          {/* Filters */}
          <div className="filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Users Grid */}
          <div className="users-grid">
            {filteredUsers.length === 0 ? (
              <div className="no-results">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.user_id} className="user-card">
                  <div className="user-avatar">
                    {user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p className="user-email">Role: {user.roles || 'No role'}</p>
                    <div className="user-roles">
                      {user.roles ? (
                        <span className="role-badge">{user.roles}</span>
                      ) : (
                        <span className="role-badge">No roles</span>
                      )}
                    </div>
                    <div className="user-meta">
                      <span className="join-date">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="btn-edit" title="Edit user">✏️</button>
                    <button 
                      className="btn-delete" 
                      title="Delete user"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="roles-section">
          <div className="roles-grid">
            {!roles || roles.length === 0 ? (
              <div className="no-results">
                <p>No roles found</p>
              </div>
            ) : (
              roles.map((role) => (
                <div key={role.role_id} className="role-card">
                  <div className="role-header">
                    <h3>{role.role_name}</h3>
                    <button 
                      className="btn-delete-role"
                      onClick={() => handleDeleteRole(role.role_id)}
                      title="Delete role"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="role-description">{role.description || 'No description'}</p>
                  <div className="role-stats">
                    <div className="stat">
                      <span className="stat-label">Users</span>
                      <span className="stat-value">{role.user_count || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Permissions</span>
                      <span className="stat-value">{role.permission_count || 0}</span>
                    </div>
                  </div>
                  <div className="role-actions">
                    <button className="btn-edit-role">Edit Permissions</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
