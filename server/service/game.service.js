const db = require('./database');
const playerService = require('./player.service');


class GameService {
  constructor() {
    
  }

  createNewGame() {
    return db.createGame();
  }

  addPlayer(gameId, playerId) {
    let promises = [
      db.getGame(gameId),
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