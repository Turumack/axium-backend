const db = require('../database');

function generarCodigoSala() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

exports.createRoom = (req, res) => {
  const { username } = req.body;
  const codigo = generarCodigoSala();

  const insertRoomQuery = 'INSERT INTO rooms (codigo, owner_id, estado) VALUES (?, ?, ?)';
  db.query(insertRoomQuery, [codigo, username, 'esperando'], (err, result) => {
    if (err) {
      console.error('Error al crear la sala:', err);
      return res.status(500).json({ error: 'Error al crear la sala' });
    }

    const roomId = result.insertId;

    const insertPlayerQuery = 'INSERT INTO room_players (room_id, username) VALUES (?, ?)';
    db.query(insertPlayerQuery, [roomId, username], (err) => {
      if (err) {
        console.error('Error al agregar jugador:', err);
        return res.status(500).json({ error: 'Error al registrar al creador en la sala' });
      }

      return res.status(201).json({ codigo, creador: username, estado: 'esperando' });
    });
  });
};

exports.joinRoom = (req, res) => {
  const { codigo, username } = req.body;

  const getRoomQuery = 'SELECT * FROM rooms WHERE codigo = ?';
  db.query(getRoomQuery, [codigo], (err, rooms) => {
    if (err || rooms.length === 0) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    const room = rooms[0];

    const checkPlayersQuery = 'SELECT * FROM room_players WHERE room_id = ?';
    db.query(checkPlayersQuery, [room.id], (err, players) => {
      if (err) {
        return res.status(500).json({ error: 'Error al consultar la sala' });
      }

      if (players.find(p => p.username === username)) {
        return res.status(409).json({ error: 'Ya estás en esta sala' });
      }

      if (players.length >= 6) {
        return res.status(403).json({ error: 'Sala llena (máx. 6 jugadores)' });
      }

      const insertPlayerQuery = 'INSERT INTO room_players (room_id, username) VALUES (?, ?)';
      db.query(insertPlayerQuery, [room.id, username], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al unirse a la sala' });
        }

        return res.status(200).json({
          codigo,
          jugadores: [...players.map(p => p.username), username],
          estado: room.estado
        });
      });
    });
  });
};

exports.getUserRooms = (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT r.id, r.codigo, r.creador, r.estado
    FROM rooms r
    JOIN room_players rp ON rp.room_id = r.id
    WHERE rp.username = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener las salas:', err);
      return res.status(500).json({ error: 'Error al consultar las salas del usuario' });
    }

    res.json({ salas: results });
  });
};

exports.changeRoomState = (req, res) => {
  const { codigo } = req.params;
  const { nuevoEstado } = req.body;

  const estadosPermitidos = ['esperando', 'jugando', 'finalizada'];
  if (!estadosPermitidos.includes(nuevoEstado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const query = 'UPDATE rooms SET estado = ? WHERE codigo = ?';
  db.query(query, [nuevoEstado, codigo], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    res.json({ mensaje: `Estado de la sala cambiado a "${nuevoEstado}"` });
  });
};
