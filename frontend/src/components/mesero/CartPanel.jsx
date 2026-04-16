import React from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../shared/Button'

const CartPanel = ({ cart, products, onUpdateQuantity, onClear, onSend, total }) => {
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p._id === id)
    return { ...product, qty, cartId: id }
  }).filter(item => item)
  
  if (cartItems.length === 0) return null
  
  return (
    <div className="cart-panel">
      <div className="cart-drag"></div>
      <div className="cart-header">
        <h3 className="cart-title">🛒 CARRITO</h3>
        <Button size="sm" variant="ghost" onClick={onClear}>
          Limpiar
        </Button>
      </div>
      
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.cartId} className="cart-item">
            <span className="cart-emoji">{item.emoji}</span>
            <div className="cart-info">
              <div className="cart-name">{item.name}</div>
              <div className="cart-price">{formatCurrency(item.price * item.qty)}</div>
            </div>
            <div className="cart-quantity">
              <button 
                className="qty-btn qty-minus"
                onClick={() => onUpdateQuantity(item.cartId, -1)}
              >
                −
              </button>
              <span className="qty-number">{item.qty}</span>
              <button 
                className="qty-btn qty-plus"
                onClick={() => onUpdateQuantity(item.cartId, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <span className="total-label">TOTAL</span>
        <span className="total-value">{formatCurrency(total)}</span>
      </div>
      
      <Button fullWidth variant="primary" onClick={onSend}>
        ✅ ENVIAR A COCINA
      </Button>
    </div>
  )
}

export default CartPanel