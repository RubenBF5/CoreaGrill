import { productsAPI } from '../api/api'

export const productService = {
  getAll: async () => {
    return await productsAPI.getAll()
  },
  
  getByCategory: async (category) => {
    const products = await productsAPI.getAll()
    return products.filter(p => p.cat === category)
  },
  
  create: async (data) => {
    return await productsAPI.create(data)
  },
  
  update: async (id, data) => {
    return await productsAPI.update(id, data)
  },
  
  delete: async (id) => {
    return await productsAPI.delete(id)
  }
}