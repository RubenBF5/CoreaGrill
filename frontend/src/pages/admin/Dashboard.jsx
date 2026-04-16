import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Navbar from '../../layout/Navbar'
import Sidebar from '../../layout/Sidebar'

const AdminDashboard = () => {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const menuItems = [
    { path: '/admin/ventas', icon: '💰', label: 'Ventas' },
    { path: '/admin/inventario', icon: '📦', label: 'Inventario' },
    { path: '/admin/menu', icon: '🍽️', label: 'Menú' },
    { path: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
  ]
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <div className="admin-dashboard">
      <Navbar user={user} onLogout={handleLogout} role="admin" />
      <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminDashboard