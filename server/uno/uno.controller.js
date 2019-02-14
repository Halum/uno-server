const gameService = require('./../service/game.service');
const playerService = require('./../service/player.service');
const socketService = require('./../service/socket.service');

class UnoController {
  constructor() {
    this.playerReady = this.playerReady.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  createNewGame(req, res) {
    gameService
      .createNewGame()
      .then(game => {
        socketService.manageGame(game.id);
        res.send(game);
      })
      .catch(error => res.status(400).send({error}));
  }

  createNewPlayer(req, res) {
    let playerName = req.body.playerName;

    playerService
      .createNewPlayer(playerName)
      .then(player => res.send(player))
      .catch(error => res.status(400).send({error}));
  }

  joinGame(req, res) {
    let {gameId, playerId} = req.body;

    gameService
      .addPlayer(gameId, playerId)
      .then(game => res.send(game))
      .catch(error => res.status(400).send({error}));
  }

  startGame(gameId) {
    return gameService
      .getGame(gameId)
      .then(game => {
        let promises = [
          playerService.updatePlayersAsPlaying(game.players),
          gameService.startGame(gameId, game.players)
        ];

        return Promise.all(promises);
      })
      .then(() => gameService.startCountDown(gameId));
  }

  playerReady(req, res) {
    let {gameId, playerId} = req.body;

    playerService
      .updatePlayerAsReady(playerId)
      .then(player => {
        return gameService
          .checkIfALlPlayerReady(gameId)
          .then(() => this.startGame(gameId))
          .catch(console.error)
          .then(() => {
            res.send(player);
          });
      })
      .catch(error => res.status(400).send({error}));

  }

  playerSkip(req, res) {

  }

  playerMove(req, res) {
    
  }
};

module.exports = new UnoController();