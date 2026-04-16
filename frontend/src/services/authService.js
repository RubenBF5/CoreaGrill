import { authAPI } from '../api/api'

export const authService = {
  login: async (user, pass) => {
    return await authAPI.login(user, pass)
  },
  
  logout: () => {
    localStorage.removeItem('user')
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('user')
  },
  
  hasRole: (role) => {
    const user = authService.getCurrentUser()
    return user?.role === role
  }
}