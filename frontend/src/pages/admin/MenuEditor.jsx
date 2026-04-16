import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import API from '../../api/api'  // ← Asegúrate que importa API
import ProductTable from '../../components/admin/ProductTable'
import ProductForm from '../../components/admin/ProductForm'
import Modal from '../../components/shared/Modal'
import Button from '../../components/shared/Button'
import toast from 'react-hot-toast'

const MenuEditor = () => {
  const { products, setProducts } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      if (editingProduct) {
        // ✅ Usa updateProduct
        const updated = await API.updateProduct(editingProduct._id, data)
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updated : p))
        toast.success('✅ Producto actualizado')
      } else {
        // ✅ Usa createProduct (NO create solo)
        const newProduct = await API.createProduct(data)
        setProducts(prev => [...prev, newProduct])
        toast.success('✅ Producto agregado')
      }
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    
    try {
      // ✅ Usa deleteProduct
      await API.deleteProduct(id)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Producto eliminado')
    } catch (error) {
      toast.error('Error al eliminar producto')
    }
  }
  
  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }
  
  return (
    <div className="menu-editor-page">
      <div className="page-header">
        <h2>🍽️ Menú</h2>
        <Button onClick={() => setIsModalOpen(true)} disabled={loading}>
          + Agregar Producto
        </Button>
      </div>
      
      <ProductTable 
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        title={editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
      >
        <ProductForm 
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default MenuEditor