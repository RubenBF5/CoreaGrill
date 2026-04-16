import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import API from '../../api/api'
import Navbar from '../../layout/Navbar'
import CartPanel from '../../components/mesero/CartPanel'
import TableOrders from '../../components/mesero/TableOrders'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/formatCurrency'

const MeseroDashboard = () => {
  const { user, logout, products, cart, addToCart, removeFromCart, clearCart, orders, setOrders } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orden')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [mesa, setMesa] = useState('')
  
  const categories = [
    { id: 'todas', label: 'Todo', emoji: '🍽️' },
    { id: 'hamburguesas', label: 'Hambur.', emoji: '🍔' },
    { id: 'hotdogs', label: 'Hot Dogs', emoji: '🌭' },
    { id: 'papas', label: 'Papas', emoji: '🍟' },
    { id: 'refrescos', label: 'Bebidas', emoji: '🥤' },
  ]
  
  const filteredProducts = selectedCategory === 'todas' 
    ? products 
    : products.filter(p => p.cat === selectedCategory)
  
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find(p => p._id === id)
    return sum + (product?.price || 0) * qty
  }, 0)
  
  const handleSendOrder = async () => {
    if (Object.keys(cart).length === 0) {
      toast.error('Carrito vacío')
      return
    }
    
    const items = Object.entries(cart).map(([id, qty]) => {
      const product = products.find(p => p._id === id)
      return {
        id: product._id,
        name: product.name,
        emoji: product.emoji,
        qty,
        price: product.price,
        cost: product.cost
      }
    })
    
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const cost = items.reduce((sum, i) => sum + i.cost * i.qty, 0)
    
    try {
      const newOrder = await API.createOrder({
        mesa: mesa || 'Mesa',
        items,
        total,
        cost,
        status: 'pending',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString(),
        waiter: user.name,
        waiterId: user._id
      })
      
      setOrders(prev => [...prev, newOrder])
      clearCart()
      setMesa('')
      toast.success('✅ Orden enviada a cocina')
      setActiveTab('mis-ordenes')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar orden')
    }
  }
  
  const handlePay = async (orderId) => {
    try {
      // ✅ CORREGIDO: updateOrderStatus en lugar de updateStatus
      await API.updateOrderStatus(orderId, 'paid')
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'paid' } : o))
      toast.success('🧾 Orden cobrada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cobrar')
    }
  }
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const showCart = Object.keys(cart).length > 0
  
  return (
    <div className="mesero-dashboard">
      <Navbar user={user} onLogout={handleLogout} role="mesero" />
      
      <div className="bottom-nav">
        <button 
          className={`nav-btn ${activeTab === 'orden' ? 'active' : ''}`}
          onClick={() => setActiveTab('orden')}
        >
          <span className="nav-icon">🛒</span>
          Orden
        </button>
        <button 
          className={`nav-btn ${activeTab === 'mis-ordenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('mis-ordenes')}
        >
          <span className="nav-icon">📋</span>
          Mis Órdenes
          {orders.filter(o => o.waiterId === user?._id && o.status === 'ready').length > 0 && (
            <span className="nav-badge">
              {orders.filter(o => o.waiterId === user?._id && o.status === 'ready').length}
            </span>
          )}
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'orden' ? (
          <div className="orden-container">
            <input
              type="text"
              className="mesa-input"
              placeholder="Mesa o nombre del cliente..."
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
            />
            
            <div className="categories-row">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            
            <div className="menu-grid">
              {filteredProducts.map(product => {
                const qtyInCart = cart[product._id] || 0
                return (
                  <div 
                    key={product._id} 
                    className={`menu-item ${qtyInCart > 0 ? 'in-cart' : ''}`}
                    onClick={() => addToCart(product._id, 1)}
                  >
                    {qtyInCart > 0 && <div className="item-badge">{qtyInCart}</div>}
                    <div className="menu-emoji">{product.emoji}</div>
                    <div className="menu-name">{product.name}</div>
                    <div className="menu-price">{formatCurrency(product.price)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <TableOrders orders={orders} onPay={handlePay} user={user} />
        )}
      </div>
      
      {showCart && activeTab === 'orden' && (
        <CartPanel
          cart={cart}
          products={products}
          onUpdateQuantity={(id, delta) => {
            if (delta > 0) addToCart(id, delta)
            else removeFromCart(id, Math.abs(delta))
          }}
          onClear={clearCart}
          onSend={handleSendOrder}
          total={cartTotal}
        />
      )}
    </div>
  )
}

export default MeseroDashboard