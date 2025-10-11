// API Service Layer for Hospital RBAC
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Backend already returns {success, data} format
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      throw new Error(result.message || 'API request failed')
    }
  } catch (error) {
    console.error('API Error:', error)
    return { success: false, error: error.message }
  }
}

// ==================== DASHBOARD APIs ====================
export const dashboardAPI = {
  // Lấy thống kê tổng quan
  getStats: () => fetchAPI('/dashboard/stats'),
  
  // Lấy hoạt động gần đây
  getRecentActivities: (limit = 5) => fetchAPI(`/dashboard/activities?limit=${limit}`),
  
  // Lấy phân bố roles
  getRoleDistribution: () => fetchAPI('/dashboard/role-distribution'),
}

// ==================== USER APIs ====================
export const userAPI = {
  // Lấy danh sách users
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetchAPI(`/users${queryString ? `?${queryString}` : ''}`)
  },
  
  // Lấy user theo ID
  getById: (id) => fetchAPI(`/users/${id}`),
  
  // Tạo user mới
  create: (userData) => fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Cập nhật user
  update: (id, userData) => fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Xóa user
  delete: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Gán role cho user
  assignRole: (userId, roleId) => fetchAPI(`/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ roleId }),
  }),
}

// ==================== ROLE APIs ====================
export const roleAPI = {
  // Lấy danh sách roles
  getAll: () => fetchAPI('/roles'),
  
  // Lấy role theo ID
  getById: (id) => fetchAPI(`/roles/${id}`),
  
  // Tạo role mới
  create: (roleData) => fetchAPI('/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  }),
  
  // Cập nhật role
  update: (id, roleData) => fetchAPI(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  }),
  
  // Xóa role
  delete: (id) => fetchAPI(`/roles/${id}`, {
    method: 'DELETE',
  }),
  
  // Lấy permissions của role
  getPermissions: (roleId) => fetchAPI(`/roles/${roleId}/permissions`),
  
  // Cập nhật permissions của role
  updatePermissions: (roleId, permissions) => fetchAPI(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  }),
}

// ==================== PERMISSION APIs ====================
export const permissionAPI = {
  // Lấy permission matrix
  getMatrix: () => fetchAPI('/permissions/matrix'),
  
  // Lấy permissions theo role
  getByRole: (roleId) => fetchAPI(`/permissions/role/${roleId}`),
  
  // Grant permission
  grant: (roleId, resource, action) => fetchAPI('/permissions/grant', {
    method: 'POST',
    body: JSON.stringify({ roleId, resource, action }),
  }),
  
  // Revoke permission
  revoke: (roleId, resource, action) => fetchAPI('/permissions/revoke', {
    method: 'POST',
    body: JSON.stringify({ roleId, resource, action }),
  }),
}

// ==================== AUDIT APIs ====================
export const auditAPI = {
  // Lấy audit logs (alias cho compatibility)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetchAPI(`/audit/${queryString ? `?${queryString}` : ''}`)
  },
  
  // Lấy audit logs
  getLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetchAPI(`/audit/${queryString ? `?${queryString}` : ''}`)
  },
  
  // Lấy failed login attempts  
  getFailedLogins: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetchAPI(`/audit/failed-logins${queryString ? `?${queryString}` : ''}`)
  },
  
  // Lấy security alerts
  getSecurityAlerts: () => fetchAPI('/audit/security-alerts'),
  
  // Lấy audit statistics
  getStats: () => fetchAPI('/audit/stats'),
  
  // Export audit logs
  export: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetchAPI(`/audit/export${queryString ? `?${queryString}` : ''}`)
  },
}

// ==================== AUTHENTICATION APIs ====================
export const authAPI = {
  // Login
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Logout
  logout: () => fetchAPI('/auth/logout', {
    method: 'POST',
  }),
  
  // Get current user
  getCurrentUser: () => fetchAPI('/auth/me'),
  
  // Change password
  changePassword: (passwordData) => fetchAPI('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(passwordData),
  }),
}

// Export tất cả APIs
export default {
  dashboard: dashboardAPI,
  users: userAPI,
  roles: roleAPI,
  permissions: permissionAPI,
  audit: auditAPI,
  auth: authAPI,
}
