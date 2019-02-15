const CardDeck = require('./card.deck');
const Player = require('./player');
const socketService = require('./../socket.service');

class Uno {
  constructor(gameId) {
    this.id = '12345' || gameId;
    this.players = [];
    this.deck = new CardDeck();
    this.status = 'waiting';
    this.currentPlayerIdx = 0;
    this.direction = 1;

    
    socketService.manageGame(this);
  }

  addPlayer(playerName) {
    const newPlayer = new Player(playerName, this.deck.getForPlayer());

    this.players.push(newPlayer);
    
    return newPlayer;
  }

  getPlayer(playerId) {
    return this.players.find(player => player.id === playerId);
  }

  playerReady(playerId) {
    for(let player  of this.players) {
      if(player.id === playerId) {
        return player.statusReady();
      }
    }
  }

  canStart() {
    if(this.players.length > 1 && this.players.every(player => player.isReady())) {
      return Promise.resolve();
    }

    return Promise.reject('Some players are not ready');
  }

  startCountDown() {
    let count = 5;
    let channel = 'count-down';

    let intervalTimer = setInterval(()=>{
      socketService.broadcast(this.id, channel, count--);
      if(count === 0) {
        clearInterval(intervalTimer);
        this.broadcastPlayerState();
      }
    }, 900);
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

  broadcastPlayerState() {
    const cardState = {
      desk: this.deck.state
    };

    for(let player of this.players) {
      let turn = this.players[ this.currentPlayerIdx ].id === player.id
        ? true
        : false;
      let state = Object.assign({}, player, cardState, {turn});

      socketService.broadcast(this.id, player.id, state);
    }
  }

  isValidPlayer(playerId) {
    return this.players[ this.currentPlayerIdx ].id === playerId;
  }

  nextPlayer(increament = 1) {
    if(!this.direction) increament *= -1 ;

    this.currentPlayerIdx += increament;

    if(this.currentPlayerIdx < 0) this.currentPlayerIdx += this.players.length;

    this.currentPlayerIdx %= this.players.length;
  }

  takeCard(playerId) {
    if(!this.isValidPlayer(playerId)) return;

    const player = this.getPlayer(playerId);

    this.deck.give(player);
    this.nextPlayer();
    this.broadcastPlayerState();
  }

  playCard(data) {
    const {playerId, card} = data;
    const player = this.getPlayer(playerId);

    if(!this.isValidPlayer(playerId)) return;

    player.give(this.deck, card);
    this.nextPlayer();
    this.broadcastPlayerState();
  }
}

module.exports = Uno;