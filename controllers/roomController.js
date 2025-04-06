const db = require('../database');

function generarCodigoSala() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Crear nueva sala
exports.createRoom = (req, res) => {
  const { username } = req.body;
  const codigo = generarCodigoSala();

  const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err || result.length === 0) {
      console.error('Usuario no encontrado:', err);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userId = result[0].id;

    const insertRoomQuery = 'INSERT INTO rooms (codigo, owner_id, estado) VALUES (?, ?, ?)';
    db.query(insertRoomQuery, [codigo, userId, 'esperando'], (err, result) => {
      if (err) {
        console.error('Error al crear la sala:', err);
        return res.status(500).json({ error: 'Error al crear la sala' });
      }

      const roomId = result.insertId;

      const insertPlayerQuery = 'INSERT INTO room_users (room_id, user_id) VALUES (?, ?)';
      db.query(insertPlayerQuery, [roomId, userId], (err) => {
        if (err) {
          console.error('Error al agregar jugador:', err);
          return res.status(500).json({ error: 'Error al registrar al creador en la sala' });
        }

        return res.status(201).json({ codigo, creador: username, estado: 'esperando' });
      });
    });
  });
};

// Unirse a una sala existente
exports.joinRoom = (req, res) => {
  const { codigo, username } = req.body;

  const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userId = result[0].id;

    const getRoomQuery = 'SELECT * FROM rooms WHERE codigo = ?';
    db.query(getRoomQuery, [codigo], (err, rooms) => {
      if (err || rooms.length === 0) {
        return res.status(404).json({ error: 'Sala no encontrada' });
      }

      const room = rooms[0];

      const checkPlayersQuery = 'SELECT * FROM room_users WHERE room_id = ?';
      db.query(checkPlayersQuery, [room.id], (err, players) => {
        if (err) {
          return res.status(500).json({ error: 'Error al consultar la sala' });
        }

        if (players.find(p => p.user_id === userId)) {
          return res.status(409).json({ error: 'Ya estás en esta sala' });
        }

        if (players.length >= 6) {
          return res.status(403).json({ error: 'Sala llena (máx. 6 jugadores)' });
        }

        const insertPlayerQuery = 'INSERT INTO room_users (room_id, user_id) VALUES (?, ?)';
        db.query(insertPlayerQuery, [room.id, userId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error al unirse a la sala' });
          }

          res.status(200).json({
            codigo,
            jugadores: [...players.map(p => p.user_id), userId],
            estado: room.estado
          });
        });
      });
    });
  });
};

// Obtener todas las salas de un usuario
exports.getUserRooms = (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT r.id, r.codigo, r.owner_id AS creador, r.estado
    FROM rooms r
    JOIN room_users ru ON ru.room_id = r.id
    WHERE ru.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener las salas:', err);
      return res.status(500).json({ error: 'Error al consultar las salas del usuario' });
    }

    res.json({ salas: results });
  });
};

// Cambiar el estado de una sala
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

    res.json({ mensaje: `Estado cambiado a "${nuevoEstado}"` });
  });
};

// Obtener detalles de una sala por su código
exports.getRoomByCode = (req, res) => {
  const { codigo } = req.params;

  const query = `
    SELECT r.id, r.codigo, r.estado, r.owner_id,
           GROUP_CONCAT(u.username) AS jugadores
    FROM rooms r
    LEFT JOIN room_users ru ON ru.room_id = r.id
    LEFT JOIN users u ON u.id = ru.user_id
    WHERE r.codigo = ?
    GROUP BY r.id
  `;

  db.query(query, [codigo], (err, results) => {
    if (err) {
      console.error('Error al obtener sala por código:', err);
      return res.status(500).json({ error: 'Error al consultar la sala' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    const sala = results[0];
    sala.jugadores = sala.jugadores ? sala.jugadores.split(',') : [];

    res.json({ sala });
  });
};
