const db = require('./database');
const playerService = require('./player.service');


class GameService {
  constructor() {
    
  }

  createNewGame() {
    return db.createGame();
  }

  addPlayer(gameId, playerId) {
    return db.getGame(gameId)
      .then(game => {
        if(game.status !== 'waiting') return Promise.reject('Game already running');

        game.players.push(playerId);
        return game;
      })
      .then(game => db.updateGame(game))
      .catch(console.error);
  }

  start(gameId) {
    return db.getGame(gameId)
      .then(game => {
        return playerService.getPlayers(game.players);
      })
      .then(players => {
        let readyPlayers = players.filter(player => player.status === 'ready');
        if(players.length && players.length === readyPlayers.length) {
          Object.assign(game, {status: 'running'});
          return db.updateGame(game);
        }
        return Promise.reject();
      })
  }
};

module.exports = new GameService();