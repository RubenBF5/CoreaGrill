import React, { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../shared/Button'

const ProductTable = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  const categories = ['hamburguesas', 'hotdogs', 'papas', 'refrescos']
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.cat === categoryFilter
    return matchesSearch && matchesCategory
  })
  
  return (
    <div className="product-table-container">
      <div className="table-filters">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="product-table">
        <div className="table-header">
          <div className="col-emoji">Emoji</div>
          <div className="col-name">Nombre</div>
          <div className="col-category">Categoría</div>
          <div className="col-price">Precio</div>
          <div className="col-actions">Acciones</div>
        </div>
        
        {filteredProducts.map(product => (
          <div key={product._id} className="table-row">
            <div className="col-emoji">{product.emoji}</div>
            <div className="col-name">{product.name}</div>
            <div className="col-category">{product.cat}</div>
            <div className="col-price">{formatCurrency(product.price)}</div>
            <div className="col-actions">
              <Button size="sm" variant="secondary" onClick={() => onEdit(product)}>
                ✏️
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(product._id)}>
                🗑️
              </Button>
            </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="empty-state">No se encontraron productos</div>
        )}
      </div>
    </div>
  )
}

export default ProductTable