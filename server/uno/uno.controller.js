const Uno = require('./../service/classes/uno');

class UnoController {
  constructor() {
    this.games = {};

    this.createGame = this.createGame.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.playerReady = this.playerReady.bind(this);
  }

  createGame(req, res) {
    let {gameId} = req.body;
    // create a game with given ID or a new game
    let game = new Uno(gameId);
    
    // this line is needed if no gameId is passed in the request
    gameId = game.id;
    // if this ID is used by any game then use that game
    this.games[gameId] = this.games[gameId] || game;

    res.send({gameId});
  }

  addPlayer(req, res) {
    const {gameId, playerName} = req.body;
    const game = this.games[gameId];

    if(!game.canJoin()) return res.send({});

    const player = game.addPlayer(playerName);
    const participants = game.participantsState();

    res.send({player: player.json(), game: {participants, gameId}});
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