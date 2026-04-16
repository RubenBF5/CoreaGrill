import React, { createContext, useState, useContext, useEffect } from 'react'
import API from '../api/api'
import { initSocket, disconnectSocket, onOrderUpdate, onInventoryUpdate, onProductUpdate } from '../services/socketService'
import toast from 'react-hot-toast'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState({})

  // Load user from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Load initial data when user logs in
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [productsData, inventoryData, ordersData, usersData] = await Promise.all([
        API.getProducts(),
        API.getInventory(),
        API.getOrders(),
        API.getUsers(),
      ])
      
      // Eliminar duplicados de órdenes basado en _id
      const uniqueOrders = ordersData.filter((order, index, self) => 
        index === self.findIndex(o => o._id === order._id)
      )
      
      // Eliminar duplicados de productos
      const uniqueProducts = productsData.filter((product, index, self) => 
        index === self.findIndex(p => p._id === product._id)
      )
      
      // Eliminar duplicados de inventario
      const uniqueInventory = inventoryData.filter((item, index, self) => 
        index === self.findIndex(i => i._id === item._id)
      )
      
      // Eliminar duplicados de usuarios
      const uniqueUsers = usersData.filter((user, index, self) => 
        index === self.findIndex(u => u._id === user._id)
      )
      
      setProducts(uniqueProducts)
      setInventory(uniqueInventory)
      setOrders(uniqueOrders)
      setUsers(uniqueUsers)
      
      console.log('✅ Datos cargados:', {
        products: uniqueProducts.length,
        inventory: uniqueInventory.length,
        orders: uniqueOrders.length,
        users: uniqueUsers.length
      })
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  // Initialize socket when user logs in
  useEffect(() => {
    if (user) {
      const socket = initSocket()
      
      // Listen to order updates - CORREGIDO para evitar duplicados
      onOrderUpdate((updatedOrder) => {
        console.log('📦 Orden actualizada en tiempo real:', updatedOrder)
        
        setOrders(prev => {
          // Verificar si la orden ya existe
          const existingIndex = prev.findIndex(o => o._id === updatedOrder._id)
          
          if (existingIndex !== -1) {
            // Actualizar orden existente
            const newOrders = [...prev]
            newOrders[existingIndex] = updatedOrder
            return newOrders
          } else {
            // Agregar nueva orden al inicio sin duplicados
            // Verificar que no haya otra orden con el mismo ID
            const exists = prev.some(o => o._id === updatedOrder._id)
            if (!exists) {
              return [updatedOrder, ...prev]
            }
            return prev
          }
        })
        
        // Notification for ready orders
        if (updatedOrder.status === 'ready' && updatedOrder.waiterId === user._id) {
          toast.success(`🍽️ Orden #${updatedOrder.orderId} lista!`, {
            duration: 5000,
            icon: '🔔',
          })
        }
        
        // Notification for new orders (para chef)
        if (updatedOrder.status === 'pending' && user.role === 'chef') {
          toast.success(`🍳 Nueva orden #${updatedOrder.orderId} de ${updatedOrder.mesa}`, {
            duration: 3000,
            icon: '📋',
          })
        }
      })
      
      // Listen to inventory updates
      onInventoryUpdate((updatedItem) => {
        console.log('📦 Inventario actualizado:', updatedItem)
        
        setInventory(prev => {
          const index = prev.findIndex(i => i._id === updatedItem._id)
          if (index !== -1) {
            const newInventory = [...prev]
            newInventory[index] = updatedItem
            return newInventory
          }
          return [...prev, updatedItem]
        })
        
        if (updatedItem.qty <= updatedItem.min) {
          toast.error(`⚠️ Stock bajo: ${updatedItem.name}`, { duration: 5000 })
        }
      })
      
      // Listen to product updates
      onProductUpdate((updatedProduct) => {
        console.log('🍔 Producto actualizado:', updatedProduct)
        
        if (updatedProduct.deleted) {
          setProducts(prev => prev.filter(p => p._id !== updatedProduct.id))
          toast.success('Producto eliminado')
        } else {
          setProducts(prev => {
            const index = prev.findIndex(p => p._id === updatedProduct._id)
            if (index !== -1) {
              const newProducts = [...prev]
              newProducts[index] = updatedProduct
              return newProducts
            }
            return [...prev, updatedProduct]
          })
          toast.success('Menú actualizado')
        }
      })
      
      // Load initial data
      loadInitialData()
      
      // Cleanup on unmount
      return () => {
        disconnectSocket()
      }
    }
  }, [user])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    toast.success(`Bienvenido ${userData.name}`)
  }

  const logout = () => {
    setUser(null)
    setCart({})
    setProducts([])
    setInventory([])
    setOrders([])
    setUsers([])
    localStorage.removeItem('user')
    disconnectSocket()
    toast.success('Sesión cerrada')
  }

  const addToCart = (productId, quantity = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }))
  }

  const removeFromCart = (productId, quantity = 1) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) - quantity
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQty }
    })
  }

  const clearCart = () => setCart({})

  const value = {
    user,
    login,
    logout,
    products,
    setProducts,
    inventory,
    setInventory,
    orders,
    setOrders,
    users,
    setUsers,
    loading,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    loadInitialData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppProvider