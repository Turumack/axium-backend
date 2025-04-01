const db = require('../database');

const roomController = {};

// Crear una sala
roomController.createRoom = (req, res) => {
  const { name, userId } = req.body;

  const sql = 'INSERT INTO rooms (name, owner_id) VALUES (?, ?)';
  db.query(sql, [name, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Sala creada correctamente' });
  });
};

// Unirse a una sala
roomController.joinRoom = (req, res) => {
  const { roomId, userId } = req.body;

  const sql = 'INSERT INTO room_players (room_id, user_id) VALUES (?, ?)';
  db.query(sql, [roomId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Te uniste a la sala correctamente' });
  });
};

// Ver salas de un usuario
roomController.getUserRooms = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT rooms.id, rooms.name 
    FROM rooms 
    INNER JOIN room_players ON rooms.id = room_players.room_id 
    WHERE room_players.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
};

module.exports = roomController;
