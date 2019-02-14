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
      db.getPlayer(playerId)
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

  start(gameId) {
    return db.getGame(gameId)
      .then(game => {
        Object.assign(game, {status: 'running'});
        return db.updateGame(game);
      });
  }
};

module.exports = new GameService();