const WebSocket = require('ws');

let players = {};
let turn = 1;

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🟢 Un jugador se ha conectado');

    ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'join') {
        players[data.playerId] = ws;
        broadcast({
          type: 'system',
          message: `Jugador ${data.playerId} se ha unido a la partida`,
        });
      }

      if (data.type === 'move') {
        broadcast({
          type: 'move',
          playerId: data.playerId,
          position: data.position,
          money: data.money
        });
      }

      if (data.type === 'turn') {
        turn = data.nextTurn;
        broadcast({
          type: 'turn',
          nextTurn: turn
        });
      }
    });

    ws.on('close', () => {
      console.log('🔴 Un jugador se ha desconectado');
    });
  });

  function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = initWebSocket;
