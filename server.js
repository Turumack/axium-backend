const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const initWebSocket = require('./websocket-server');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Configuración CORS completa para GitHub Pages
const corsOptions = {
  origin: 'https://turumack.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// ⚠️ Soporte a preflight (importantísimo para evitar errores CORS)
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// WebSocket
initWebSocket(server);

// Iniciar servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ WebSocket inicializado`);
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
