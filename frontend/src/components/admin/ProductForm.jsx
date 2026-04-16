import React, { useState, useEffect } from 'react'
import Button from '../shared/Button'

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🍔',
    price: '',
    cost: '',
    cat: 'hamburguesas'
  })
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        emoji: product.emoji,
        price: product.price,
        cost: product.cost,
        cat: product.cat
      })
    }
  }, [product])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost)
    }
    onSubmit(data)
  }
  
  const categories = [
    { value: 'hamburguesas', label: '🍔 Hamburguesas' },
    { value: 'hotdogs', label: '🌭 Hot Dogs' },
    { value: 'papas', label: '🍟 Papas' },
    { value: 'refrescos', label: '🥤 Bebidas' }
  ]
  
  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label className="form-label">Nombre</label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Ej: Hamburguesa Clásica"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Emoji</label>
        <input
          type="text"
          className="form-input"
          value={formData.emoji}
          onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
          maxLength="2"
          placeholder="🍔"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Precio ($)</label>
          <input
            type="number"
            className="form-input"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Costo ($)</label>
          <input
            type="number"
            className="form-input"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            required
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Categoría</label>
        <select
          className="form-select"
          value={formData.cat}
          onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {product ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  )
}

export default ProductForm