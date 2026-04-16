import { useState, useEffect } from 'react'
import { productsAPI } from '../api/api'
import { useApp } from '../context/AppContext'

export const useProducts = () => {
  const { products, setProducts } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getAll()
      setProducts(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  
  const createProduct = async (productData) => {
    try {
      const newProduct = await productsAPI.create(productData)
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (err) {
      setError(err)
      throw err
    }
  }
  
  const updateProduct = async (id, productData) => {
    try {
      const updated = await productsAPI.update(id, productData)
      setProducts(prev => prev.map(p => p._id === id ? updated : p))
      return updated
    } catch (err) {
      setError(err)
      throw err
    }
  }
  
  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      setError(err)
      throw err
    }
  }
  
  useEffect(() => {
    loadProducts()
  }, [])
  
  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    reloadProducts: loadProducts
  }
}