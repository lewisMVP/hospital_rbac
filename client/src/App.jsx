import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import UserManagement from './components/UserManagement'
import RoleMatrix from './components/RoleMatrix'
import AuditLog from './components/AuditLog'
import Patients from './components/Patients'
import MedicalRecords from './components/MedicalRecords'
import Appointments from './components/Appointments'
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Main App Layout
function AppLayout() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />
      case 'users':
        return <UserManagement />
      case 'roles':
        return <RoleMatrix />
      case 'patients':
        return <Patients />
      case 'medical-records':
        return <MedicalRecords />
      case 'appointments':
        return <Appointments />
      case 'audit':
        return <AuditLog />
      default:
        return <Dashboard setActiveView={setActiveView} />
    }
  }

  return (
    <div className="app">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <Header activeView={activeView} />
        <div className="content-area">
          {renderView()}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
