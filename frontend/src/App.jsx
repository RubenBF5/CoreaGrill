import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/Dashboard'
import Inventario from './pages/admin/Inventario'
import Ventas from './pages/admin/Ventas'
import Usuarios from './pages/admin/Usuarios'
import MenuEditor from './pages/admin/MenuEditor'
import ChefDashboard from './pages/chef/ChefDashboard'
import MeseroDashboard from './pages/mesero/MeseroDashboard'
import PrivateRoute from './components/auth/PrivateRoute'

function App() {
  return (
    <AppProvider>
      <Router>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0e1117',
              color: '#f1f5f9',
              border: '1px solid #1e2535',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }>
            <Route index element={<Ventas />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="menu" element={<MenuEditor />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
          <Route path="/chef" element={
            <PrivateRoute role="chef">
              <ChefDashboard />
            </PrivateRoute>
          } />
          <Route path="/mesero" element={
            <PrivateRoute role="mesero">
              <MeseroDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App