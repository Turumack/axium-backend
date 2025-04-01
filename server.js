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

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Iniciar WebSocket
initWebSocket(server);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ WebSocket inicializado`);
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
