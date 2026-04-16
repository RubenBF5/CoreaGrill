import { ordersAPI } from '../api/api'

export const salesService = {
  getTodaySales: async () => {
    const orders = await ordersAPI.getAll()
    const today = new Date().toISOString().split('T')[0]
    return orders.filter(o => o.fecha === today && o.status === 'paid')
  },
  
  getSalesByDate: async (date) => {
    const orders = await ordersAPI.getAll()
    return orders.filter(o => o.fecha === date && o.status === 'paid')
  },
  
  getTopProducts: async (limit = 5) => {
    const orders = await ordersAPI.getAll()
    const productSales = {}
    
    orders.forEach(order => {
      if (order.status === 'paid') {
        order.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { qty: 0, total: 0, emoji: item.emoji }
          }
          productSales[item.name].qty += item.qty
          productSales[item.name].total += item.price * item.qty
        })
      }
    })
    
    return Object.entries(productSales)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, limit)
      .map(([name, data]) => ({ name, ...data }))
  },
  
  getDailyStats: async () => {
    const todaySales = await salesService.getTodaySales()
    const totalVentas = todaySales.reduce((sum, o) => sum + o.total, 0)
    const totalCostos = todaySales.reduce((sum, o) => sum + (o.cost || 0), 0)
    
    return {
      ordenes: todaySales.length,
      ventas: totalVentas,
      costos: totalCostos,
      ganancia: totalVentas - totalCostos,
      margen: totalVentas > 0 ? ((totalVentas - totalCostos) / totalVentas) * 100 : 0
    }
  }
}