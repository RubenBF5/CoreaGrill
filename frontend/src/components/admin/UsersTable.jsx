import React, { useState } from 'react'
import Button from '../shared/Button'

const UsersTable = ({ users, onDelete, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const getRoleBadge = (role) => {
    const badges = {
      admin: { class: 'role-admin', icon: '👑', label: 'Administrador' },
      chef: { class: 'role-chef', icon: '👨‍🍳', label: 'Chef' },
      mesero: { class: 'role-mesero', icon: '🛎️', label: 'Mesero' }
    }
    return badges[role] || badges.mesero
  }
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="users-table-container">
      <div className="table-filters">
        <input
          type="text"
          placeholder="Buscar usuario..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="users-grid">
        {filteredUsers.map(user => {
          const roleBadge = getRoleBadge(user.role)
          return (
            <div key={user._id} className="user-card">
              <div className="user-avatar" style={{ background: `${roleBadge.class}22` }}>
                {roleBadge.icon}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-username">@{user.user}</div>
                <span className={`user-role ${roleBadge.class}`}>
                  {roleBadge.label}
                </span>
              </div>
              {user._id !== currentUserId && (
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => onDelete(user._id)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          )
        })}
        
        {filteredUsers.length === 0 && (
          <div className="empty-state">No se encontraron usuarios</div>
        )}
      </div>
    </div>
  )
}

export default UsersTable