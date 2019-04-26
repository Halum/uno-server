const Uno = require('./../service/classes/uno');

class UnoController {
  constructor() {
    this.games = {};

    this.addPlayer = this.addPlayer.bind(this);
    this.createGame = this.createGame.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
    this.kickPlayer = this.kickPlayer.bind(this);
    this.playerReady = this.playerReady.bind(this);
  }

  addPlayer(req, res) {
    const {gameId, playerName} = req.body;
    const game = this.games[gameId];

    if(!game) {
      return res.status(400).send({error: 'Invalid game ID'});
    }

    const validJoin = game.canJoin(playerName);

    if(validJoin instanceof Error) {
      return res.status(400).send({error: validJoin.message});
    }

    const player = game.addPlayer(playerName);
    const participants = game.participantsState();

    res.send({player: player.json(), game: {participants, gameId}});
  }

  createGame(req, res) {
    let {gameId, randomizePlayers, progressiveUno} = req.body;
    // create a game with given ID or a new game
    let game = new Uno(gameId, randomizePlayers, progressiveUno);
    
    // this line is needed if no gameId is passed in the request
    gameId = game.id;
    // if this ID is used by any game then use that game
    this.games[gameId] = this.games[gameId] || game;

    res.status(201).send({gameId});
  }

  kickPlayer(req, res) {

  }

  leaveGame(req, res) {
    const {gameId, playerId} = req.params;
    const game = this.games[gameId];

    if(!game) {
      return res.status(400).send({error: 'Invalid game ID'});
    }
    
    const player = game.getPlayer(playerId);
    if(!player) {
      return res.status(400).send({error: 'Invalid player ID'});
    }

    game.removePlayer(player);
    res.send({message: `Left from game ${gameId}`});
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