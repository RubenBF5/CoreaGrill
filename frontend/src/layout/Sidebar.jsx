import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/admin/ventas', icon: '💰', label: 'Ventas' },
    { path: '/admin/inventario', icon: '📦', label: 'Inventario' },
    { path: '/admin/menu', icon: '🍽️', label: 'Menú' },
    { path: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
  ]
  
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🍔</span>
          <span className="sidebar-title">CoreaGrill</span>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar