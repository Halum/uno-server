const db = require('./database');
const playerService = require('./player.service');
const socketService = require('./socket.service');


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

  startGame(gameId, players) {
    let updates = {
      status: 'running',
      currentPlayer: players[0].id
    };

    return db.updateGameById(gameId, updates);
  }

  checkIfALlPlayerReady(gameId) {
    return this
      .getGame(gameId)
      .then(game => {
        return playerService.getPlayers(game.players);
      })
      .then(players => {
        if(players.length > 1 && players.every(player => player.status === 'ready')) {
          return Promise.resolve()
        }
        return Promise.reject('Some players are not ready');
      })
  }

  startCountDown(gameId) {
    let count = 5;
    let channel = 'count-down';

    let intervalTimer = setInterval(()=>{
      socketService.broadcast(gameId, channel, count--);
      if(count === 0) clearInterval(intervalTimer);
    }, 900);
  }
};

module.exports = new GameService();