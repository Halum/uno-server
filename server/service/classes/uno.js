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
    let count = 3;
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
      let state = {
        player: {...player.json(), turn}, 
        game: {...cardState}
      };

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

  nextPlayer(increament = 1) {
    if(this.direction < 0) increament *= -1 ;

    this.currentPlayerIdx += increament;

    if(this.currentPlayerIdx < 0) this.currentPlayerIdx += this.players.length;

    this.currentPlayerIdx %= this.players.length;
  }

  takeCard(playerId, totalTake = 1) {
    if(!this.canPlay(playerId)) return;

    const player = this.getPlayer(playerId);

    for(let i of Array(totalTake)) this.deck.give(player);
    
    this.nextPlayer();
    this.broadcastPlayerState();
  }

  playCard(data) {
    const {playerId, card} = data;
    const player = this.getPlayer(playerId);

    if(!this.canPlay(playerId, card)) return;

    player.give(this.deck, card);

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
    this.broadcastPlayerState();
  }
}

module.exports = Uno;