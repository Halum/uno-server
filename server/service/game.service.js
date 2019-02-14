const db = require('./database');
const playerService = require('./player.service');


class GameService {
  constructor() {
    
  }

  createNewGame() {
    return db.createGame();
  }

  getGame(gameId) {
    return db.getGame(gameId);
  }

  addPlayer(gameId, playerId) {
    let promises = [
      this.getGame(gameId),
      playerService.getPlayer(playerId)
    ];
    return Promise
      .all(promises)
      .then(data => {
        let [game, player] = data;

        if(game.status !== 'waiting') return Promise.reject('Game already running');

        game.players.push(playerId);
        return game;
      })
      .then(game => db.updateGame(game));
  }

  startGame(gameId) {
    let updates = {status: 'running'};

    return db.updateGameById(gameId, updates);
  }
};

module.exports = new GameService();