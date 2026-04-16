import { io } from 'socket.io-client'

let socket = null

export const initSocket = () => {
  if (socket && socket.connected) return socket
  
  // URL tomada de variables de entorno o auto-descubrimiento para monolito
  const API_URL = import.meta.env.VITE_API_URL || undefined;
  
  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
  })
  
  socket.on('connect', () => {
    console.log('✅ Conectado al servidor en tiempo real')
  })
  
  socket.on('disconnect', (reason) => {
    console.log('⚠️ Desconectado del servidor:', reason)
  })
  
  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error.message)
  })
  
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const onOrderUpdate = (callback) => {
  if (socket) {
    socket.on('orden_actualizada', callback)
    socket.on('nueva_orden', callback)
  }
}

export const onInventoryUpdate = (callback) => {
  if (socket) {
    socket.on('inventario_actualizado', callback)
  }
}

export const onProductUpdate = (callback) => {
  if (socket) {
    socket.on('productos_actualizados', callback)
  }
}

export const emitOrderStatus = (orderId, status) => {
  if (socket) {
    socket.emit('order_status_change', { orderId, status })
  }
}