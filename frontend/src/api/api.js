// URL tomada de variables de entorno o local
const URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API = {
  // Auth
  login: async (user, pass) => {
    const res = await fetch(`${URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Usuarios
  getUsers: async () => {
    const res = await fetch(`${URL}/users`);
    return res.json();
  },
  createUser: async (data) => {
    const res = await fetch(`${URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateUser: async (id, data) => {
    const res = await fetch(`${URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteUser: async (id) => {
    const res = await fetch(`${URL}/users/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Productos
  getProducts: async () => {
    const res = await fetch(`${URL}/products`);
    return res.json();
  },
  createProduct: async (data) => {
    const res = await fetch(`${URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateProduct: async (id, data) => {
    const res = await fetch(`${URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${URL}/products/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Inventario
  getInventory: async () => {
    const res = await fetch(`${URL}/inventory`);
    return res.json();
  },
  createInventory: async (data) => {
    const res = await fetch(`${URL}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateInventory: async (id, data) => {
    const res = await fetch(`${URL}/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteInventory: async (id) => {
    const res = await fetch(`${URL}/inventory/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Órdenes
  getOrders: async () => {
    const res = await fetch(`${URL}/orders`);
    return res.json();
  },
  createOrder: async (data) => {
    const res = await fetch(`${URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${URL}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.msg || 'Error al actualizar');
    }
    return res.json();
  },
  deleteOrder: async (id) => {
    const res = await fetch(`${URL}/orders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.msg || 'Error al eliminar');
    }
    return res.json();
  },

  // Estadísticas
  getTodayStats: async () => {
    const res = await fetch(`${URL}/stats/today`);
    return res.json();
  },
};

export default API;