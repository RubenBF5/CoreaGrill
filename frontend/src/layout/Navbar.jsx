import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ user, onLogout, role }) => {
  const navigate = useNavigate()
  
  const getRoleBadge = () => {
    const badges = {
      admin: { class: 'badge-admin', icon: '👑', label: 'ADMIN' },
      chef: { class: 'badge-chef', icon: '👨‍🍳', label: 'CHEF' },
      mesero: { class: 'badge-mesero', icon: '🛎️', label: 'MESERO' }
    }
    return badges[role] || badges.mesero
  }
  
  const badge = getRoleBadge()
  
  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }
  
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <span className="navbar-icon">🍔</span>
        <span className="navbar-title">CoreaGrill</span>
      </div>
      <div className="navbar-user">
        <span className={`navbar-badge ${badge.class}`}>
          {badge.icon} {badge.label}
        </span>
        <span className="navbar-name">{user?.name?.split(' ')[0]}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </div>
  )
}

export default Navbar