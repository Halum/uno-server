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

module.exports = unoRouter;