import React from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../shared/Button'

const TableOrders = ({ orders, onPay, user }) => {
  // Filtrar órdenes del mesero actual y no pagadas
  const myOrders = orders.filter(o => o.waiterId === user?._id && o.status !== 'paid')
  
  // Eliminar duplicados por _id
  const uniqueOrders = myOrders.filter((order, index, self) => 
    index === self.findIndex(o => o._id === order._id)
  )
  
  const getStatusLabel = (status) => {
    const labels = {
      pending: { text: '⏳ PENDIENTE', class: 'status-pending' },
      preparing: { text: '🔥 PREPARANDO', class: 'status-preparing' },
      ready: { text: '✅ LISTO', class: 'status-ready' }
    }
    return labels[status] || { text: status, class: '' }
  }
  
  if (uniqueOrders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🍽️</div>
        <div className="empty-text">No tienes órdenes activas</div>
      </div>
    )
  }
  
  return (
    <div className="table-orders">
      {uniqueOrders.map(order => {
        const status = getStatusLabel(order.status)
        
        return (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-number">#{order.orderId}</div>
                <div className="order-meta">{order.hora} · {order.mesa}</div>
              </div>
              <span className={`order-status ${status.class}`}>
                {status.text}
              </span>
            </div>
            
            <div className="order-items-list">
              {order.items && order.items.map((item, idx) => (
                <span key={`${order._id}-item-${idx}`} className="order-item-tag">
                  {item.emoji} {item.qty}× {item.name}
                </span>
              ))}
            </div>
            
            <div className="order-footer">
              <span className="order-total">{formatCurrency(order.total)}</span>
              {order.status === 'ready' && (
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => onPay(order._id)}
                >
                  🧾 COBRAR
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TableOrders