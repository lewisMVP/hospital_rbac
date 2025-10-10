import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import UserManagement from './components/UserManagement'
import RoleMatrix from './components/RoleMatrix'
import AuditLog from './components/AuditLog'

function App() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return <UserManagement />
      case 'roles':
        return <RoleMatrix />
      case 'audit':
        return <AuditLog />
      default:
        return <Dashboard />
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

export default App
