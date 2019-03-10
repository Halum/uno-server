const CardDeck = require('./card.deck');
const Player = require('./player');
const socketService = require('./../socket.service');

class Uno {
  constructor(gameId) {
    this.id = '12345' || gameId;
    this.currentPlayerIdx = 0;
    this.deck = new CardDeck();
    this.direction = 1;
    this.players = [];
    this.status = 'waiting';
    this.ranking = [];

    socketService.manageGame(this);
  }

  addPlayer(playerName) {
    const newPlayer = new Player(playerName, this.deck.getForPlayer());

    this.players.push(newPlayer);
    this.broadcastGameState();
    
    return newPlayer;
  }

  broadcastGameState() {
    const cardState = {
      desk: this.deck.state
    };
    const currentPlayer = this.players[ this.currentPlayerIdx ];
    const direction = this.direction;
    const ranking = this.ranking.map(player => player.summary());
    // make a list of all players along with their card count to show in the game
    // also let each player know who is current player
    const participants = this.participantsState();

    // need to broadcast to both running players and ranking players
    for(let player of [...this.players, ...this.ranking]) {
      let turn = currentPlayer.id === player.id
        ? true
        : false;
      let state = {
        player: {...player.json(), turn}, 
        game: {...cardState, participants, direction, ranking}
      };

      console.log('broadcast', player.id, JSON.stringify(state));
      console.log('-------------------------------------------');

      socketService.broadcast(this.id, player.id, state);
    }
  }

  canPlay(playerId, card) {
    const player = this.players[ this.currentPlayerIdx ];
    const isValidPlayer = player.id === playerId;
    const isValidCard = card ? player.canPlay(card) : true;
    const isValidPlay = card ? this.deck.canPlay(card) : true;

    return isValidPlayer && isValidCard && isValidPlay;
  }

  canStart() {
    if(this.players.length > 1 && this.players.every(player => player.isReady())) {
      return Promise.resolve();
    }

    return Promise.reject('Some players are not ready');
  }

  getPlayer(playerId) {
    return this.players.find(player => player.id === playerId);
  }

  rankPlayer(player) {
    this.players = this.players.filter(val => val.id !== player.id);
    this.ranking.push(player);
  }

  nextPlayer(increament = 1) {
    if(this.direction < 0) increament *= -1 ;

    this.currentPlayerIdx += increament;

    if(this.currentPlayerIdx < 0) this.currentPlayerIdx += this.players.length;

    this.currentPlayerIdx %= this.players.length;
  }

  participantsState() {
    // if game is not running then we do not have any current player
    const currentPlayerId = this.status === 'running' 
      ? this.players[ this.currentPlayerIdx ].id
      : null;
    // make a list of all players along with their card count to show in the game
    // also let each player know who is current player
    const participants = this.players.map(player => player.summary(currentPlayerId));

    return participants;
  }

  playCard(data) {
    const {playerId, card} = data;
    const player = this.getPlayer(playerId);
    console.log('playCard', playerId, player.name, card);

    if(!this.canPlay(playerId, card)) return;

    console.log('playCard valid', playerId, player.name, card);

    player.give(this.deck, card);

    if(player.isGameComplete()) {
      // this player is done with the game, move him to the ranking section
      console.log('player.isGameComplete', playerId, player.name);
      this.rankPlayer(player);
    }

    if(this.players.length === 1) {
      // only one player remaing, so move him to the ranking section
      this.rankPlayer(this.players[0]);
    }

    const result = this.deck.getPlayResult(card);

    this.direction *= result.direction;

    if(result.nexPlayerTake) {
      // as next player must take cards from deck
      // make him next palyer and force him to take cards
      this.nextPlayer();
      const player = this.players[ this.currentPlayerIdx ];
      return this.takeCard(player.id, result.nexPlayerTake);
    }

    this.nextPlayer(result.increament);
    this.broadcastGameState();
  }

  playerReady(playerId) {
    for(let player  of this.players) {
      if(player.id === playerId) {
        return player.statusReady();
      }
    }
  }

  start() {
    return this
      .canStart()
      .then(() => {
        this.status = 'running';
        this.deck.begin();

        for(let player of this.players) {
          player.statusPlaying();
        }

        this.startCountDown();
      })
      .catch(console.error);
  }

  startCountDown() {
    let count = 3;
    let channel = 'count-down';

    let intervalTimer = setInterval(()=>{
      socketService.broadcast(this.id, channel, count--);
      if(count === 0) {
        clearInterval(intervalTimer);
        this.broadcastGameState();
      }
    }, 900);
  }

  takeCard(playerId, totalTake = 1) {
    console.log('takeCard', playerId, totalTake);
    if(!this.canPlay(playerId)) return;
    console.log('takeCard valid', playerId, totalTake);

    const player = this.getPlayer(playerId);

    for(let i of Array(totalTake)) this.deck.give(player);
    
    this.nextPlayer();
    this.broadcastGameState();
  }
}

module.exports = Uno;