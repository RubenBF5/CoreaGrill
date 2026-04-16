import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const PrivateRoute = ({ children, role }) => {
  const { user } = useApp()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (role && user.role !== role) {
    const redirectPath = {
      admin: '/admin',
      chef: '/chef',
      mesero: '/mesero'
    }[user.role] || '/login'
    
    return <Navigate to={redirectPath} />
  }
  
  return children
}

export default PrivateRoute