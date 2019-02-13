const dbStructure = require('./db.structure');
const randomStringGenerator = require('randomstring');


class Database {
  constructor() {
    this.games = [];
    this.players = [];
  }

  getGame(gameId) {
    for(let game of this.games) {
      if(game.id ==gameId) {
        return Promise.resolve(game);
      }
    }

    return Promise.reject();
  }

  getPlayer(playerId) {
    for(let player of this.players) {
      if(player.id ==playerId) {
        return Promise.resolve(player);
      }
    }

    return Promise.reject();
  }

  get _id() {
    return randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
  }

  createGame() {
    let newProperties = {
      id: this._id,
      status: 'waiting'
    };
    let newGame = Object.assign({}, dbStructure.game, newProperties);

    this.games.push(newGame);

    return Promise.resolve(newGame);
  }

  createPlayer(name) {
    let newProperties = {
      id: this._id,
      status: 'waiting',
      name
    };

    let newPlayer = Object.assign({}, dbStructure.gamplayere, newProperties);

    this.players.push(newPlayer);

    return Promise.resolve(newPlayer);
  }

  updateGame(game) {
    for(let i=0; i<this.games.length; ++i) {
      if(this.games[i].id == game.id) {
        this.games[i] = game;
        break;
      }
    }

    return Promise.resolve();
  }

  updatePlayer(player) {
    for(let i=0; i<this.players.length; ++i) {
      if(this.players[i].id == player.id) {
        this.players[i] = player;
        break;
      }
    }
    
    return Promise.resolve();
  }

};

module.exports = new Database();