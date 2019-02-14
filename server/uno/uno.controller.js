const gameService = require('./../service/game.service');
const playerService = require('./../service/player.service');

class UnoController {
  createNewGame(req, res) {
    gameService
      .createNewGame()
      .then(game => res.send(game))
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

  startGame(req, res) {
    let {gameId} = req.body;
    let game = null;

    gameService
      .getGame(gameId)
      .then(data => {
        game = data;
        return playerService.getPlayers(game.players);
      })
      .then(players => {
        if(players.every(player => player.status === 'ready')) {
          let promises = [
            playerService.updatePlayersAsPlaying(game.players),
            gameService.startGame(gameId, players)
          ];

          return Promise.all(promises);
        }
        return Promise.reject('Some players are not ready');
      })
      .then(([players, game]) => res.send(game))
      .catch(error => res.status(400).send({error}));
  }

  playerReady(req, res) {
    let {playerId} = req.body;

    playerService
      .updatePlayerAsReady(playerId)
      .then(player => res.send(player))
      .catch(error => res.status(400).send({error}));

  }

  playerSkip(req, res) {

  }

  playerMove(req, res) {
    
  }
};

module.exports = new UnoController();