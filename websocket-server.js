const { Server } = require('socket.io');

function initWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'https://turumack.github.io',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Diccionario para guardar lanzamientos por sala
  const dadosPorSala = {};

  io.on('connection', socket => {
    console.log('🟢 Cliente conectado');

    socket.on('joinRoom', roomCode => {
      socket.join(roomCode);
      console.log(`👤 Cliente unido a sala: ${roomCode}`);
    });

    socket.on('dadoInicial', ({ roomCode, username, valor }) => {
      if (!dadosPorSala[roomCode]) dadosPorSala[roomCode] = {};
      dadosPorSala[roomCode][username] = valor;

      const jugadores = Object.keys(dadosPorSala[roomCode]);
      const resultados = jugadores.map(j => ({ jugador: j, valor: dadosPorSala[roomCode][j] }));

      // Espera a que todos tiren antes de emitir el orden
      if (resultados.every(r => r.valor > 0) && resultados.length >= 2) {
        resultados.sort((a, b) => b.valor - a.valor);
        const orden = resultados.map(r => r.jugador);
        io.to(roomCode).emit('ordenDefinido', { orden });
        console.log(`🎯 Orden definido en sala ${roomCode}:`, orden);
      }
    });

    socket.on('turnoLanzado', ({ roomCode, username, valor, siguiente }) => {
      io.to(roomCode).emit('actualizarTurno', { username, valor, siguiente });
      console.log(`🎲 ${username} lanzó ${valor} en ${roomCode}`);
    });
  });
}

module.exports = initWebSocket;
