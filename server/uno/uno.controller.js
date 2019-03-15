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

    res.send({gameId: game.id});
  }

  addPlayer(req, res) {
    const {gameId, playerName} = req.body;
    const game = this.games[gameId];

    if(!game.canJoin()) return res.send({});

    const player = game.addPlayer(playerName);
    const participants = game.participantsState();

    res.send({player: player.json(), game: {participants}});
  }

  playerReady(req, res) {
    let {gameId, playerId} = req.body;
    let game = this.games[gameId];
    let player = game.playerReady(playerId);

    game.start();

    res.send(player.json());
  }
};

module.exports = new UnoController();