const gameService = require('./../service/game.service');
const playerService = require('./../service/player.service');

class UnoController {
  createNewGame(req, res) {
    gameService
      .createNewGame()
      .then(game => res.send(game));
  }

  createNewPlayer(req, res) {
    let playerName = req.body.playerName;

    playerService
      .createNewPlayer(playerName)
      .then(player => res.send(player));
  }

  joinGame(req, res) {
    let {gameId, playerId} = req.body;

    gameService
      .addPlayer(gameId, playerId)
      .then(game => res.send(game));
  }

  playerReady(req, res) {

  }

  playerSkip(req, res) {

  }

  playerMove(req, res) {
    
  }
};

module.exports = new UnoController();