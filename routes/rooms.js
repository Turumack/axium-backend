const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/create', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.get('/user/:userId', roomController.getUserRooms);
router.post('/:codigo/state', roomController.changeRoomState);
router.get('/:codigo', roomController.getRoomByCode);

module.exports = router;
