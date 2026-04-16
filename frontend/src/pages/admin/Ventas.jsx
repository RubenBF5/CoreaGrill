import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../utils/formatCurrency'
import API from '../../api/api'
import toast from 'react-hot-toast'

const Ventas = () => {
  const { orders, products } = useApp()
  const [stats, setStats] = useState({ ventas: 0, ganancia: 0, ordenes: 0, margen: 0 })
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter(o => o.fecha === today && o.status === 'paid')
  
  useEffect(() => {
    loadStats()
  }, [orders])
  
  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await API.getTodayStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // Calcular top productos
    const productSales = {}
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { qty: 0, total: 0, emoji: item.emoji }
        }
        productSales[item.name].qty += item.qty
        productSales[item.name].total += item.price * item.qty
      })
    })
    
    const top = Object.entries(productSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))
    
    setTopProducts(top)
  }, [orders])
  
  if (loading) {
    return <div className="loader-container">Cargando...</div>
  }
  
  return (
    <div className="ventas-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Órdenes Hoy</div>
          <div className="stat-val">{stats.ordenes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ventas Totales</div>
          <div className="stat-val" style={{ color: '#f5a623' }}>{formatCurrency(stats.ventas)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ganancia Neta</div>
          <div className="stat-val" style={{ color: '#22c55e' }}>{formatCurrency(stats.ganancia)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Margen</div>
          <div className="stat-val">{stats.margen.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">🏆 Top Productos Hoy</h3>
        {topProducts.length > 0 ? (
          topProducts.map((product, idx) => (
            <div key={idx} className="top-product-item">
              <span className="top-rank">#{idx + 1}</span>
              <span className="top-emoji">{product.emoji}</span>
              <div className="top-info">
                <div className="top-name">{product.name}</div>
                <div className="top-qty">{product.qty} vendidos</div>
              </div>
              <span className="top-total">{formatCurrency(product.total)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">Sin ventas hoy</div>
        )}
      </div>
      
      <div className="card">
        <h3 className="card-title">📋 Últimas Órdenes</h3>
        {todayOrders.slice(-8).reverse().map(order => (
          <div key={order._id} className="order-item">
            <span className="order-id">#{order.orderId}</span>
            <div className="order-info">
              <div className="order-mesa">{order.mesa}</div>
              <div className="order-time">{order.hora} · {order.waiter}</div>
            </div>
            <span className="order-total">{formatCurrency(order.total)}</span>
          </div>
        ))}
        {todayOrders.length === 0 && (
          <div className="empty-state">No hay órdenes hoy</div>
        )}
      </div>
    </div>
  )
}

export default Ventas