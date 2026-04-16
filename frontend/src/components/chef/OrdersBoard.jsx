import React from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../shared/Button'

const OrdersBoard = ({ orders, onUpdateStatus }) => {
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  
  const getStatusLabel = (status) => {
    const labels = {
      pending: { label: 'PENDIENTE', class: 'status-pending' },
      preparing: { label: 'PREPARANDO', class: 'status-preparing' },
      ready: { label: 'LISTO', class: 'status-ready' }
    }
    return labels[status] || labels.pending
  }
  
  const OrderCard = ({ order }) => {
    const status = getStatusLabel(order.status)
    
    return (
      <div className="chef-order-card">
        <div className="order-header">
          <div>
            <div className="order-number">#{order.orderId}</div>
            <div className="order-meta">{order.hora} · {order.mesa} · {order.waiter}</div>
          </div>
          <span className={`order-status ${status.class}`}>
            {status.label}
          </span>
        </div>
        
        <div className="order-items">
          {order.items.map((item, idx) => (
            <div key={idx} className="chef-item">
              <span className="item-qty">{item.qty}×</span>
              <span className="item-name">{item.emoji} {item.name}</span>
            </div>
          ))}
        </div>
        
        <div className="order-actions">
          {order.status === 'pending' && (
            <Button 
              fullWidth 
              variant="secondary"
              onClick={() => onUpdateStatus(order._id, 'preparing')}
            >
              👨‍🍳 PREPARANDO
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button 
              fullWidth 
              variant="success"
              onClick={() => onUpdateStatus(order._id, 'ready')}
            >
              ✅ LISTO
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="chef-orders-board">
      {pendingOrders.length > 0 && (
        <div className="orders-section">
          <h3 className="section-title">⏳ Nuevas Órdenes</h3>
          {pendingOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
      
      {preparingOrders.length > 0 && (
        <div className="orders-section">
          <h3 className="section-title">🔥 En Preparación</h3>
          {preparingOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
      
      {pendingOrders.length === 0 && preparingOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍳</div>
          <div className="empty-text">No hay órdenes pendientes</div>
        </div>
      )}
    </div>
  )
}

export default OrdersBoard