const unoRouter = require('express').Router();
const unoController = require('./uno.controller');

unoRouter
  .route('/new')
  .post(unoController.createGame);

unoRouter
  .route('/player')
  .post(unoController.addPlayer);

unoRouter
  .route('/player/ready')
  .post(unoController.playerReady);

unoRouter
  .route('/:gameId/player/:playerId/leave')
  .delete(unoController.leaveGame);

module.exports = unoRouter;