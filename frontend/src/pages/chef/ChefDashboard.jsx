import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import API from '../../api/api'
import Navbar from '../../layout/Navbar'
import toast from 'react-hot-toast'

const ChefDashboard = () => {
  const { user, logout, orders, setOrders } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  
  // Filtrar órdenes activas (pending, preparing, ready)
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
  
  // Eliminar duplicados por _id
  const uniqueOrders = activeOrders.filter((order, index, self) => 
    index === self.findIndex(o => o._id === order._id)
  )
  
  // Ordenar por fecha (las más antiguas primero)
  const sortedOrders = [...uniqueOrders].sort((a, b) => {
    const dateA = new Date(`${a.fecha} ${a.hora}`)
    const dateB = new Date(`${b.fecha} ${b.hora}`)
    return dateA - dateB
  })
  
  const updateOrderStatus = async (orderId, newStatus) => {
    if (loading || updatingId === orderId) return
    
    setLoading(true)
    setUpdatingId(orderId)
    
    try {
      console.log(`🔄 Actualizando orden ${orderId} a estado: ${newStatus}`)
      
      const response = await API.updateOrderStatus(orderId, newStatus)
      
      if (response && response._id) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ))
        
        const message = newStatus === 'preparing' 
          ? '👨‍🍳 Preparando orden' 
          : '✅ Orden lista para entregar'
        
        toast.success(message)
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Error al actualizar el estado de la orden')
    } finally {
      setLoading(false)
      setUpdatingId(null)
    }
  }
  
  // Nueva función para eliminar orden
  const deleteOrder = async (orderId, orderNumber) => {
    if (!confirm(`¿Eliminar la orden #${orderNumber}? Esta acción no se puede deshacer.`)) return
    
    if (loading || updatingId === orderId) return
    
    setLoading(true)
    setUpdatingId(orderId)
    
    try {
      console.log(`🗑️ Eliminando orden ${orderId}`)
      
      await API.deleteOrder(orderId)
      
      // Eliminar la orden del estado local
      setOrders(prev => prev.filter(order => order._id !== orderId))
      
      toast.success(`🗑️ Orden #${orderNumber} eliminada`)
    } catch (error) {
      console.error('❌ Error al eliminar:', error)
      toast.error('Error al eliminar la orden')
    } finally {
      setLoading(false)
      setUpdatingId(null)
    }
  }
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const getStatusLabel = (status) => {
    const labels = {
      pending: { text: '⏳ PENDIENTE', class: 'status-pending' },
      preparing: { text: '🔥 PREPARANDO', class: 'status-preparing' },
      ready: { text: '✅ LISTO', class: 'status-ready' }
    }
    return labels[status] || { text: status, class: '' }
  }
  
  return (
    <div className="chef-dashboard">
      <Navbar user={user} onLogout={handleLogout} role="chef" />
      
      <div className="dashboard-content">
        <div className="chef-header">
          <h2>👨‍🍳 Órdenes en Cocina</h2>
          <span className="order-count">{sortedOrders.length} orden(es) activa(s)</span>
        </div>
        
        {sortedOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍳</div>
            <div className="empty-text">No hay órdenes pendientes</div>
          </div>
        ) : (
          sortedOrders.map(order => {
            const status = getStatusLabel(order.status)
            const isUpdating = updatingId === order._id
            
            return (
              <div key={order._id} className={`chef-order-card status-${order.status}`}>
                <div className="order-header">
                  <div>
                    <div className="order-number">#{order.orderId}</div>
                    <div className="order-meta">
                      {order.hora} · Mesa: {order.mesa} · Mesero: {order.waiter}
                    </div>
                  </div>
                  <span className={`order-status ${status.class}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="order-items">
                  {order.items && order.items.map((item, idx) => (
                    <div key={`${order._id}-item-${idx}`} className="chef-item">
                      <span className="item-qty">{item.qty}×</span>
                      <span className="item-name">{item.emoji} {item.name}</span>
                      <span className="item-price">${item.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-total-row">
                  <span>Total:</span>
                  <span className="order-total">${order.total}</span>
                </div>
                
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      className="btn-preparing"
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? '⏳ Procesando...' : '👨‍🍳 PREPARANDO'}
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      className="btn-ready"
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? '⏳ Procesando...' : '✅ LISTO'}
                    </button>
                  )}
                  {(order.status === 'ready') && (
                    <button 
                      className="btn-delete"
                      onClick={() => deleteOrder(order._id, order.orderId)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? '⏳ Eliminando...' : '🗑️ ELIMINAR'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      
      <style>{`
        .chef-dashboard {
          min-height: 100vh;
          background: var(--bg);
        }
        
        .chef-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .chef-header h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          color: var(--chef-color);
          margin: 0;
        }
        
        .order-count {
          background: var(--surface2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .dashboard-content {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .chef-order-card {
          background: var(--surface);
          border: 2px solid var(--chef-color);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        
        .chef-order-card.status-ready {
          border-color: var(--green);
        }
        
        .chef-order-card.status-ready .order-number {
          color: var(--green);
        }
        
        .chef-order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .order-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          color: var(--chef-color);
          line-height: 1;
        }
        
        .order-meta {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
        }
        
        .order-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        
        .status-pending {
          background: rgba(245, 166, 35, 0.15);
          color: var(--gold);
        }
        
        .status-preparing {
          background: rgba(249, 115, 22, 0.15);
          color: var(--chef-color);
        }
        
        .status-ready {
          background: rgba(34, 197, 94, 0.15);
          color: var(--green);
        }
        
        .order-items {
          margin: 16px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        
        .chef-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
        }
        
        .chef-item:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }
        
        .item-qty {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          color: var(--chef-color);
          min-width: 45px;
        }
        
        .item-name {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
        }
        
        .item-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          color: var(--gold);
        }
        
        .order-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-weight: 700;
        }
        
        .order-total {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          color: var(--gold);
        }
        
        .order-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .btn-preparing, .btn-ready, .btn-delete {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        
        .btn-preparing {
          background: var(--surface2);
          border: 1px solid var(--chef-color);
          color: var(--chef-color);
        }
        
        .btn-ready {
          background: linear-gradient(135deg, var(--green), #16a34a);
          color: white;
        }
        
        .btn-delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        
        .btn-preparing:active, .btn-ready:active, .btn-delete:active {
          transform: scale(0.97);
        }
        
        .btn-preparing:disabled, .btn-ready:disabled, .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--surface);
          border-radius: 20px;
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        .empty-text {
          font-size: 16px;
          color: var(--muted);
        }
        
        @media (max-width: 768px) {
          .dashboard-content {
            padding: 16px;
          }
          
          .chef-order-card {
            padding: 16px;
          }
          
          .order-number {
            font-size: 24px;
          }
          
          .item-qty {
            font-size: 18px;
            min-width: 35px;
          }
          
          .item-name {
            font-size: 13px;
          }
          
          .order-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default ChefDashboard