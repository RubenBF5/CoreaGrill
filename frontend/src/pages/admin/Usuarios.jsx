import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import API from '../../api/api'
import UsersTable from '../../components/admin/UsersTable'
import Modal from '../../components/shared/Modal'
import Button from '../../components/shared/Button'
import toast from 'react-hot-toast'

const Usuarios = () => {
  const { users, setUsers, user: currentUser } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    user: '',
    pass: '',
    role: 'mesero'
  })
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.user || formData.pass.length < 4) {
      toast.error('Completa todos los campos (contraseña mínimo 4 caracteres)')
      return
    }
    
    if (users.find(u => u.user === formData.user)) {
      toast.error('Ese usuario ya existe')
      return
    }
    
    setLoading(true)
    try {
      // 🔧 CAMBIO IMPORTANTE: createUser en lugar de create
      const newUser = await API.createUser(formData)
      setUsers(prev => [...prev, newUser])
      toast.success('✅ Usuario creado')
      setIsModalOpen(false)
      setFormData({ name: '', user: '', pass: '', role: 'mesero' })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    
    try {
      await API.deleteUser(id)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('Usuario eliminado')
    } catch (error) {
      toast.error('Error al eliminar usuario')
    }
  }
  
  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h2>👥 Usuarios</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          + Agregar Usuario
        </Button>
      </div>
      
      <UsersTable 
        users={users} 
        onDelete={handleDelete}
        currentUserId={currentUser?._id}
      />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="➕ Nuevo Usuario">
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ej: María González"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value.toLowerCase() })}
              required
              placeholder="Ej: maria123"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={formData.pass}
              onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
              required
              minLength="4"
              placeholder="Mínimo 4 caracteres"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="admin">👑 Administrador</option>
              <option value="chef">👨‍🍳 Chef</option>
              <option value="mesero">🛎️ Mesero</option>
            </select>
          </div>
          
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Usuarios