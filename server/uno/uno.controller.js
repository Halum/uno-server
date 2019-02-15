const Uno = require('./../service/classes/uno');

class UnoController {
  constructor() {
    console.log('new controller');
    this.games = {};

    this.createGame = this.createGame.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.playerReady = this.playerReady.bind(this);
  }

  createGame(req, res) {
    let game = new Uno();
    let gameId = game.id;

    this.games[gameId] = this.games[gameId] || game;

    res.send(game);
  }

  addPlayer(req, res) {
    let {gameId, playerName} = req.body;
    let game = this.games[gameId];
    let player = game.addPlayer(playerName);

    res.send(player);
  }

  playerReady(req, res) {
    let {gameId, playerId} = req.body;
    let game = this.games[gameId];
    let player = game.playerReady(playerId);

    game.start();

    res.send(player);
  }
};

module.exports = new UnoController();