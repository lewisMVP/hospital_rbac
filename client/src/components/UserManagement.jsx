import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import { userAPI, roleAPI } from '../services/api';
import ErrorMessage from './ErrorMessage';
import UserModal from './UserModal';
import ConfirmModal from './ConfirmModal';
import { Icons, UserAvatar } from './Icons';
import './UserManagement.css';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useAPI(userAPI.getAll);
  const { data: roles } = useAPI(roleAPI.getAll);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.roles?.includes(filterRole);
    return matchesSearch && matchesRole;
  }) || [];

  const uniqueRoles = [...new Set(roles?.map(r => r.role_name) || [])];

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        await userAPI.update(selectedUser.user_id, userData);
      } else {
        await userAPI.create(userData);
      }
      refetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      throw new Error(error.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    try {
      await userAPI.delete(userToDelete.user_id);
      refetchUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (usersLoading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }
  if (usersError) return <ErrorMessage error={usersError} onRetry={refetchUsers} fullScreen />;

  return (
    <div className="user-management">
      <div className="users-section">
        {/* Header with Create Button */}
        <div className="section-header">
          <div>
            <h1>User Management</h1>
            <p className="subtitle">Manage user accounts and roles</p>
          </div>
          <button className="btn-primary" onClick={handleCreateUser}>
            {Icons.userPlus}
            <span>New User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <span className="search-icon">{Icons.search}</span>
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
              <div className="no-results-icon">{Icons.users}</div>
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.user_id} className="user-card">
                <div className="user-card-header">
                  <UserAvatar name={user.username} role={user.roles} size={56} />
                  <div className="user-status-badge active">Active</div>
                </div>
                <div className="user-info">
                  <h3>{user.username}</h3>
                  <div className="user-roles">
                    {user.roles ? (
                      <span className="role-badge">{user.roles}</span>
                    ) : (
                      <span className="role-badge no-role">No roles</span>
                    )}
                  </div>
                  <div className="user-meta">
                    <span className="join-date">
                      {Icons.calendar}
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn-action btn-edit" 
                    title="Edit user"
                    onClick={() => handleEditUser(user)}
                  >
                    {Icons.edit}
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    title="Delete user"
                    onClick={() => handleDeleteUser(user)}
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        roles={roles}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default UserManagement;
