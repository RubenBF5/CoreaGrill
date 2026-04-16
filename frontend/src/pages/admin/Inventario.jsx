import React, { useState, useEffect } from 'react'
import API from '../../api/api'
import Modal from '../../components/shared/Modal'
import Button from '../../components/shared/Button'
import toast from 'react-hot-toast'

// Componente separado para cada item (para evitar hooks en el map)
const InventoryItem = ({ item, onUpdate, onDelete, onEdit }) => {
  const [editQty, setEditQty] = useState(false)
  const [tempQty, setTempQty] = useState(item.qty)

  const isLow = item.qty <= item.min
  const percentage = Math.min(100, (item.qty / (item.min * 4)) * 100)
  const barColor = isLow ? '#ef4444' : (item.qty <= item.min * 2 ? '#f5a623' : '#22c55e')

  const handleQuickUpdate = async () => {
    if (tempQty < 0) return
    await onUpdate(item._id, tempQty)
    setEditQty(false)
  }

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <span className="inventory-emoji">{item.emoji || '📦'}</span>
        <div className="inventory-info">
          <div className="inventory-name">{item.name}</div>
          {isLow && <span className="low-stock-badge">⚠ STOCK BAJO</span>}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${percentage}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="inventory-min">Mínimo: {item.min} {item.unit}</div>
        </div>
        <div className="inventory-actions">
          <div className="inventory-qty" style={{ color: isLow ? '#ef4444' : '#f5a623' }}>
            {editQty ? (
              <input
                type="number"
                className="edit-input"
                value={tempQty}
                onChange={(e) => setTempQty(parseFloat(e.target.value))}
                onBlur={handleQuickUpdate}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleQuickUpdate()
                }}
                autoFocus
                step={item.unit === 'kg' ? '0.1' : '1'}
              />
            ) : (
              <div onClick={() => {
                setTempQty(item.qty)
                setEditQty(true)
              }}>
                {item.qty}
                <div className="inventory-unit">{item.unit}</div>
              </div>
            )}
          </div>
          <div className="inventory-buttons">
            <button 
              className="icon-btn edit-btn"
              onClick={() => onEdit(item)}
              title="Editar item"
            >
              ✏️
            </button>
            <button 
              className="icon-btn delete-btn"
              onClick={() => onDelete(item._id, item.name)}
              title="Eliminar item"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Inventario = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    emoji: '📦',
    qty: '',
    min: '',
    unit: 'kg'
  })
  const [submitting, setSubmitting] = useState(false)

  // Cargar inventario
  const loadInventory = async () => {
    setLoading(true)
    try {
      const data = await API.getInventory()
      setInventory(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      emoji: '📦',
      qty: '',
      min: '',
      unit: 'kg'
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      emoji: item.emoji || '📦',
      qty: item.qty,
      min: item.min,
      unit: item.unit
    })
    setIsModalOpen(true)
  }

  // Guardar item (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.qty === '' || formData.min === '') {
      toast.error('Completa todos los campos')
      return
    }

    setSubmitting(true)
    try {
      const data = {
        name: formData.name,
        emoji: formData.emoji,
        qty: parseFloat(formData.qty),
        min: parseFloat(formData.min),
        unit: formData.unit
      }

      if (editingItem) {
        // Actualizar
        const updated = await API.updateInventory(editingItem._id, data)
        setInventory(prev => prev.map(i => i._id === editingItem._id ? updated : i))
        toast.success('✅ Item actualizado')
      } else {
        // Crear
        const newItem = await API.createInventory(data)
        setInventory(prev => [...prev, newItem])
        toast.success('✅ Item agregado al inventario')
      }
      
      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar item')
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar item
  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar "${name}" del inventario?`)) return
    
    try {
      await API.deleteInventory(id)
      setInventory(prev => prev.filter(i => i._id !== id))
      toast.success('🗑️ Item eliminado')
    } catch (error) {
      toast.error('Error al eliminar item')
    }
  }

  // Actualizar cantidad
  const handleUpdateQty = async (id, newQty) => {
    if (newQty < 0) return
    
    try {
      const updated = await API.updateInventory(id, { qty: parseFloat(newQty) })
      setInventory(prev => prev.map(i => i._id === id ? updated : i))
      toast.success('Cantidad actualizada')
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  // Unidades disponibles
  const units = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'g', label: 'Gramos (g)' },
    { value: 'pzas', label: 'Piezas' },
    { value: 'litros', label: 'Litros (L)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'latas', label: 'Latas' },
    { value: 'bolsas', label: 'Bolsas' },
  ]

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loader"></div>
        <div className="empty-text">Cargando inventario...</div>
      </div>
    )
  }

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h2>📦 Inventario</h2>
        <Button onClick={openCreateModal}>
          + Agregar Item
        </Button>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">No hay items en el inventario</div>
          <Button onClick={openCreateModal}>Agregar primer item</Button>
        </div>
      ) : (
        inventory.map(item => (
          <InventoryItem
            key={item._id}
            item={item}
            onUpdate={handleUpdateQty}
            onDelete={handleDelete}
            onEdit={openEditModal}
          />
        ))
      )}

      {/* Modal para crear/editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? '✏️ Editar Item' : '➕ Nuevo Item'}
      >
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label className="form-label">Nombre del item</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ej: Carne de res"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input
                type="text"
                className="form-input"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                maxLength="2"
                placeholder="📦"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad actual</label>
              <input
                type="number"
                className="form-input"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                required
                step={formData.unit === 'kg' ? '0.1' : '1'}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cantidad mínima</label>
              <input
                type="number"
                className="form-input"
                value={formData.min}
                onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                required
                step={formData.unit === 'kg' ? '0.1' : '1'}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Inventario