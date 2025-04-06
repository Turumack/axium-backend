const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Crear sala
router.post('/create', roomController.createRoom);

// Unirse a sala
router.post('/join', roomController.joinRoom);

// Ver salas del usuario
router.get('/user/:userId', roomController.getUserRooms);

// Cambiar estado de una sala
router.post('/:codigo/state', roomController.changeRoomState);

module.exports = router;
