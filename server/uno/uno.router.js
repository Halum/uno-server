const unoRouter = require('express').Router();
const unoController = require('./uno.controller');

unoRouter
  .route('/new')
  .post(unoController.createNewGame);

unoRouter
  .route('/players/new')
  .post(unoController.createNewPlayer);

unoRouter
  .route('/join')
  .post(unoController.joinGame);

unoRouter
  .route(':gameId/players/:playerId/ready')
  .post(unoController.playerReady);

unoRouter
  .route(':gameId/players/:playerId/play')
  .post(unoController.playerMove);

unoRouter
  .route(':gameId/players/:playerId/skip')
  .post(unoController.playerSkip);

module.exports = unoRouter;