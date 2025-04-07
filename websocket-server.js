// websocket-server.js
import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "*"
  }
});

const salas = {}; // Almacenamiento temporal por sala

io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado");

  socket.on("joinRoom", ({ roomCode, username }) => {
    socket.join(roomCode);
    socket.username = username;
    socket.roomCode = roomCode;

    if (!salas[roomCode]) {
      salas[roomCode] = {
        jugadores: [],
        dadosIniciales: {},
        ordenEstablecido: false,
        posiciones: {}
      };
    }

    if (!salas[roomCode].jugadores.includes(username)) {
      salas[roomCode].jugadores.push(username);
    }

    console.log(`👥 ${username} se unió a la sala ${roomCode}`);
  });

  socket.on("dadoInicial", ({ roomCode, username, valor }) => {
    const sala = salas[roomCode];
    if (!sala || sala.ordenEstablecido) return;

    sala.dadosIniciales[username] = valor;

    io.to(roomCode).emit("resultadoDadoInicial", { username, dado: valor });

    // Verifica si todos ya tiraron
    if (Object.keys(sala.dadosIniciales).length === sala.jugadores.length) {
      const orden = Object.entries(sala.dadosIniciales)
        .sort((a, b) => b[1] - a[1])
        .map(([jug]) => jug);
      
      sala.ordenEstablecido = true;
      orden.forEach(j => sala.posiciones[j] = 0);

      io.to(roomCode).emit("ordenDefinido", { orden });
    }
  });

  socket.on("jugadorMovido", ({ roomCode, username, nuevaPos, valor }) => {
    const sala = salas[roomCode];
    if (!sala) return;

    sala.posiciones[username] = nuevaPos;

    io.to(roomCode).emit("jugadorMovido", { username, nuevaPos, valor });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

io.listen(3001);
console.log("🧩 WebSocket activo en puerto 3001");
