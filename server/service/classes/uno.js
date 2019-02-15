const CardDeck = require('./card.deck');
const Player = require('./player');
const socketService = require('./../socket.service');

class Uno {
  constructor(gameId) {
    this.id = '12345' || gameId;
    this.players = [];
    this.cards = new CardDeck();
    this.status = 'waiting';
    this.currentPlayer = null;

    
    socketService.manageGame(this);
  }

  addPlayer(playerName) {
    const newPlayer = new Player(playerName, this.cards.getForPlayer());

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
        this.cards.begin();
        this.currentPlayer = 0;

        for(let player of this.players) {
          player.statusPlaying();
        }

        this.startCountDown();
      })
      .catch(console.error);
  }

  broadcastPlayerState() {
    const cardState = this.cards.state;

    for(let player of this.players) {
      let state = Object.assign({}, player, cardState);

      socketService.broadcast(this.id, player.id, state);
    }
  }

  takeCard(playerId) {
    let player = this.getPlayer(playerId);

    this.cards.give(player);

    this.broadcastPlayerState(playerId);
  }
}

module.exports = Uno;