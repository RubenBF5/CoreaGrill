import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as SocketIO } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// La conexión se realiza al final del archivo para asegurar un inicio limpio


// ============================
// MODELOS
// ============================

// Usuarios
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  role: { type: String, enum: ['admin', 'chef', 'mesero'], default: 'mesero' }
});
const User = mongoose.model("User", userSchema);

// Productos
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  cat: { type: String, required: true },
  emoji: { type: String, default: "🍔" }
});
const Product = mongoose.model("Product", productSchema);

// Inventario
const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: "📦" },
  qty: { type: Number, required: true, default: 0 },
  min: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: "pzas" }
});
const Inventory = mongoose.model("Inventory", inventorySchema);

// Órdenes - CORREGIDO: waiterId ahora es String
const orderSchema = new mongoose.Schema({
  mesa: { type: String, default: "Mesa" },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'paid'],
    default: 'pending' 
  },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  waiter: { type: String, required: true },
  waiterId: { type: String, required: true }, // ← CORREGIDO: String en lugar de Number
  orderId: { type: Number, unique: true }
});
const Order = mongoose.model("Order", orderSchema);

// ============================
// SOCKET.IO
// ============================
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Cliente desconectado:", socket.id));
});

// ============================
// FUNCIÓN PARA INICIALIZAR DATOS
// ============================
async function inicializarDatos() {
  try {
    // Verificar si hay usuarios
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("📦 Creando datos iniciales...");
      
      const demoUsers = [
        { name: "Administrador", user: "admin", pass: "admin123", role: "admin" },
        { name: "Chef Principal", user: "chef1", pass: "chef123", role: "chef" },
        { name: "Mesero de Turno", user: "mesero1", pass: "mes123", role: "mesero" }
      ];

      for (const u of demoUsers) {
        const exists = await User.findOne({ user: u.user });
        if (!exists) {
          await User.create(u);
          console.log(`👤 Usuario ${u.user} creado con éxito`);
        }
      }
      
      // Crear productos de ejemplo
      await Product.create([
        { name: "Hamburguesa Clásica", price: 65, cost: 30, cat: "hamburguesas", emoji: "🍔" },
        { name: "Hamburguesa Especial", price: 85, cost: 40, cat: "hamburguesas", emoji: "🍔" },
        { name: "Hot Dog Clásico", price: 45, cost: 18, cat: "hotdogs", emoji: "🌭" },
        { name: "Papas Chicas", price: 30, cost: 10, cat: "papas", emoji: "🍟" },
        { name: "Refresco Chico", price: 20, cost: 5, cat: "refrescos", emoji: "🥤" }
      ]);
      
      // Crear inventario de ejemplo
      await Inventory.create([
        { name: "Carne de res", emoji: "🥩", qty: 5, min: 1, unit: "kg" },
        { name: "Pan hamburguesa", emoji: "🍞", qty: 30, min: 10, unit: "pzas" },
        { name: "Papas", emoji: "🥔", qty: 8, min: 2, unit: "kg" },
        { name: "Refrescos", emoji: "🥤", qty: 24, min: 6, unit: "latas" }
      ]);
      
      console.log("✅ Datos iniciales creados");
    }
  } catch (error) {
    console.error("Error al inicializar datos:", error);
  }
}

// Ejecutar inicialización después de conectar
mongoose.connection.once("open", () => {
  inicializarDatos();
});

// ============================
// 🔐 LOGIN
// ============================
app.post("/login", async (req, res) => {
  const { user, pass } = req.body;
  const found = await User.findOne({ user, pass });
  if (!found) return res.status(401).json({ msg: "Usuario incorrecto" });
  res.json(found);
});

// ============================
// 👤 USUARIOS CRUD
// ============================
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  io.emit("usuarios_actualizados", newUser);
  res.json(newUser);
});

app.put("/users/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("usuarios_actualizados", updated);
  res.json(updated);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  io.emit("usuarios_actualizados", { id: req.params.id, deleted: true });
  res.json({ msg: "Usuario eliminado" });
});

// ============================
// 🍔 PRODUCTOS CRUD
// ============================
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  io.emit("productos_actualizados", newProduct);
  res.json(newProduct);
});

app.put("/products/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("productos_actualizados", updated);
  res.json(updated);
});

app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  io.emit("productos_actualizados", { id: req.params.id, deleted: true });
  res.json({ msg: "Producto eliminado" });
});

// ============================
// 📦 INVENTARIO CRUD
// ============================
app.get("/inventory", async (req, res) => {
  const inv = await Inventory.find();
  res.json(inv);
});

app.post("/inventory", async (req, res) => {
  const newItem = new Inventory(req.body);
  await newItem.save();
  io.emit("inventario_actualizado", newItem);
  res.json(newItem);
});

app.put("/inventory/:id", async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("inventario_actualizado", updated);
  res.json(updated);
});

app.delete("/inventory/:id", async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  io.emit("inventario_actualizado", { id: req.params.id, deleted: true });
  res.json({ msg: "Item eliminado" });
});

// ============================
// 📋 ÓRDENES CRUD COMPLETO
// ============================
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener órdenes", error: error.message });
  }
});

app.post("/orders", async (req, res) => {
  console.log("📝 Nueva orden recibida:", JSON.stringify(req.body, null, 2));
  
  try {
    // Obtener el último orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = (lastOrder?.orderId || 0) + 1;
    
    // Crear la orden con el nuevo orderId
    const newOrder = new Order({ 
      ...req.body, 
      orderId: nextOrderId
    });
    
    await newOrder.save();
    console.log("✅ Orden creada exitosamente. ID:", newOrder._id, "OrderId:", nextOrderId);
    
    // Emitir eventos de socket
    io.emit("nueva_orden", newOrder);
    io.emit("orden_actualizada", newOrder);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error al crear orden:", error);
    res.status(500).json({ msg: "Error al crear orden", error: error.message });
  }
});

app.put("/orders/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.emit("orden_actualizada", updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar orden", error: error.message });
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    io.emit("orden_actualizada", { id: req.params.id, deleted: true });
    res.json({ msg: "Orden eliminada" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar orden", error: error.message });
  }
});

// ============================
// 📊 ENDPOINTS ADICIONALES
// ============================

// Estadísticas del día
app.get("/stats/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const orders = await Order.find({ fecha: today, status: "paid" });
    
    const totalVentas = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCostos = orders.reduce((sum, o) => sum + (o.cost || 0), 0);
    
    res.json({
      ordenes: orders.length,
      ventas: totalVentas,
      costos: totalCostos,
      ganancia: totalVentas - totalCostos,
      margen: totalVentas > 0 ? ((totalVentas - totalCostos) / totalVentas) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener estadísticas", error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ============================
// 🍟 SERVIR FRONTEND (MONOLITO)
// ============================
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Conexión a MongoDB (Base de datos propia del usuario)
mongoose.connect("mongodb+srv://admin:hamburguesas123@coreagrill.efjzjy5.mongodb.net/coreagrill?retryWrites=true&w=majority")
  .then(() => {
    console.log("🟢 Conectado a TU PROPIA MongoDB");
    inicializarDatos();
    
    // ============================
    // 🚀 INICIAR SERVIDOR (Solo cuando la DB esté lista)
    // ============================
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Health check listo`);
    });
  })
  .catch(err => {
    console.log("🔴 Error de conexión inicial:", err);
    process.exit(1);
  });