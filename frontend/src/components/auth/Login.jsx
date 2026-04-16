import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import API from '../../api/api'  // ← Cambia esta línea
import toast from 'react-hot-toast'
import Button from '../shared/Button'
import Loader from '../shared/Loader'

const Login = () => {
  const [credentials, setCredentials] = useState({ user: '', pass: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Usa API.login directamente
      const userData = await API.login(credentials.user, credentials.pass)
      login(userData)
      
      const redirectPath = {
        admin: '/admin',
        chef: '/chef',
        mesero: '/mesero'
      }[userData.role] || '/login'
      
      navigate(redirectPath)
      toast.success(`Bienvenido ${userData.name}`)
    } catch (error) {
      toast.error(error.msg || 'Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }
  
  const quickLogin = (user, pass) => {
    setCredentials({ user, pass })
    // Pequeño timeout para asegurar que el estado se actualice
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} })
    }, 100)
  }
  
  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-logo">🍔</div>
        <h1 className="login-title">CoreaGrill</h1>
        <p className="login-subtitle">Hot Dogs · Hamburguesas · Papas · Refrescos</p>
        
        <form onSubmit={handleSubmit} className="login-card">
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={credentials.user}
              onChange={(e) => setCredentials({ ...credentials, user: e.target.value })}
              placeholder="Ej: admin"
              required
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={credentials.pass}
              onChange={(e) => setCredentials({ ...credentials, pass: e.target.value })}
              placeholder="••••••"
              required
            />
          </div>
          
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? <Loader size="sm" /> : 'ENTRAR →'}
          </Button>
        </form>
        
        <div className="quick-logins">
          <p className="quick-title">ACCESO RÁPIDO (demo)</p>
          <button onClick={() => quickLogin('admin', 'admin123')} className="quick-btn">
            👑 Admin — admin / admin123
          </button>
          <button onClick={() => quickLogin('chef1', 'chef123')} className="quick-btn">
            👨‍🍳 Chef — chef1 / chef123
          </button>
          <button onClick={() => quickLogin('mesero1', 'mes123')} className="quick-btn">
            🛎️ Mesero — mesero1 / mes123
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login