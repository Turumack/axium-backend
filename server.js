// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();
const server = http.createServer(app);

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/rooms");
const { initWebSocket } = require("./websocket-server");

app.use(cors());
app.use(bodyParser.json());

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Iniciar WebSocket
initWebSocket(server);

// Puerto
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
});
