require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
const initWebSocket = require('./websocket-server');

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

// Iniciar WebSocket con socket.io
initWebSocket(server);

// Iniciar servidor HTTP
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
