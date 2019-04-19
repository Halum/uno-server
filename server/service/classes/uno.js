const CardDeck = require('./card.deck');
const Player = require('./player');
const socketService = require('./../socket.service');
const randomStringGenerator = require('randomstring');
const shuffle = require('shuffle-array');

class Uno {
  constructor(gameId, randomizePlayers = false) {
    this.id = gameId || randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.currentPlayerIdx = 0;
    this.deck = new CardDeck();
    this.direction = 1;
    this.players = [];
    this.ranking = [];
    this.randomizePlayers = randomizePlayers;
    this.status = 'waiting';

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
    // if game is complete then we do not have any current player.
    // TODO: Broadcast game specific logic separately
    const currentPlayer = this.status === 'complete' || this.status === 'waiting'
      ? {} 
      : this.getCurrentPlayer();
    const direction = this.direction;
    const ranking = this.ranking.map(player => player.summary());
    const status = this.status;

    // need to broadcast to both running players and ranking players
    // TODO ranking player does not need everything to broadcasted
    for(let player of [...this.players, ...this.ranking]) {
      const participants = this.participantsState(player);
      let turn = currentPlayer.id === player.id;
      let state = {
        player: {...player.json(), turn, takenCard: player.takenCard}, 
        game: {...cardState, participants, direction, ranking, status}
      };

      console.log('broadcast', player.id, JSON.stringify(state));
      console.log('-------------------------------------------');

      socketService.broadcast(this.id, player.id, state);
    }
  }

  broadcastParticipants() {
    for(let player of [...this.players, ...this.ranking]) {
      const participants = this.participantsState(player);

      socketService.broadcast(this.id, player.id, {game: {participants}});
    }
  }

  callUno(playerId) {
    const player = this.getPlayer(playerId);
    player.callUno(this.canPlay(playerId));

    if(player.isUno()) {
      this.broadcastParticipants();
    }
  }

  canJoin(playerName) {
    let errorMessage = '';
    // Verify that game is in waiting and no other player has same name
    if(this.status === 'running') {
      errorMessage = 'Game has already began';
    } else if(this.status === 'complete') {
      errorMessage = 'Game is complete';
    } else if(playerName.length > 12) {
      errorMessage = 'Player name should be max 12 characters';
    } else if( this.players.some(player => player.name.toLowerCase() === playerName.toLowerCase()) ) {
      errorMessage = 'Duplicate name is not allowed';
    } else {
      return true;
    }

    return new Error(errorMessage);
  }

  canPlay(playerId, card) {
    const player = this.getCurrentPlayer();
    const isValidPlayer = player.id === playerId;
    const isValidCard = card ? player.canPlay(card) : true;
    const isValidPlay = card ? this.deck.canPlay(card) : true;

    console.log('canPlay', playerId, card, isValidPlayer, isValidCard, isValidPlay);

    return isValidPlayer && isValidCard && isValidPlay;
  }

  canSkip(playerId) {
    const player = this.getPlayer(playerId);

    return this.canPlay(playerId) && player.takenCard !== null;
  }

  canTake(playerId) {
    const player = this.getPlayer(playerId);

    return this.canPlay(playerId) && player.takenCard === null;
  }

  canStart() {
    if(this.players.length > 1 && this.players.every(player => player.isReady())) {
      return Promise.resolve();
    }

    return Promise.reject('Some players are not ready');
  }

  gameOver() {
    this.status = 'complete';
    this.broadcastGameState();
  }

  getCurrentPlayer() {
    return this.players[ this.currentPlayerIdx ];
  }

  getPlayer(playerId) {
    return [...this.players, ...this.ranking].find(player => player.id === playerId);
  }

  rankPlayer(player) {
    this.players = this.players.filter(val => !val.isGameComplete());
    this.ranking.push(player);
  }

  nextPlayer(increament = 1) {
    if(this.direction < 0) increament *= -1 ;

    this.currentPlayerIdx += increament;

    if(this.currentPlayerIdx < 0) this.currentPlayerIdx += this.players.length;

    this.currentPlayerIdx %= this.players.length;
  }

  participantsState(forPlayer = {}) {
    // if game is not running then we do not have any current player
    const currentPlayerId = this.status === 'running' 
      ? this.getCurrentPlayer().id
      : null;
    // make a list of all players along with their card count to show in the game
    // also let each player know who is current player
    const participants = this.players.map(player => player.summary(currentPlayerId, forPlayer.visiting));

    return participants;
  }

  playCard({playerId, card}) {
    const player = this.getPlayer(playerId);
    console.log('playCard', playerId, player.name, card);

    if(!this.canPlay(playerId, card)) return;

    console.log('playCard valid', playerId, player.name, card);

    // check for UNO call penalty
    if(player.isValidForPenalty()) {
      // next player did not call uno, so give him two cards as penalty
      console.log('playCard UNO penalty', playerId, player.name, card);
      this.takeCard(playerId, 2);
      return this.broadcastGameState();
    }

    player.give(this.deck, card);

    if(player.isGameComplete()) {
      // this player is done with the game, move him to the ranking section
      console.log('player.isGameComplete', playerId, player.name);
      this.rankPlayer(player);
    }

    if(this.players.length === 1) {
      // update last player status
      this.players[0].gameComplete();
      // only one player remaing, so move him to the ranking section
      this.rankPlayer(this.players[0]);
      return this.gameOver();
    }

    const result = this.deck.getPlayResult(card, this.players.length);

    this.direction *= result.direction;

    if(result.nexPlayerTake) {
      // as next player must take cards from deck
      // add this card to stack

      console.log('Stacking', card);
      this.deck.addToStack(card);
    }

    this.nextPlayer(result.increament);
    this.broadcastGameState();
  }

  playerReady(playerId) {
    const player = this.getPlayer(playerId);
    player.statusReady();
    this.broadcastGameState();
    return player;
  }

  skipCard(playerId) {
    console.log('skipCard', playerId);
    if(!this.canSkip(playerId)) return;

    const player = this.getPlayer(playerId);
    player.skipCard();
    console.log('skipCard', playerId, 'player skipped');
    // player skipped, move onto next player
    this.nextPlayer();
    this.broadcastGameState();
  }

  start() {
    return this
      .canStart()
      .then(() => {
        if(this.randomizePlayers) shuffle(this.players);
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

  takeCard(playerId, totalTake = 1, timePenalty = false) {
    console.log('takeCard', playerId, totalTake, timePenalty);
    if(!this.canTake(playerId)) return;
    console.log('takeCard valid', playerId, totalTake, timePenalty);

    const player = this.getPlayer(playerId);
    const takeForStacked = this.deck.cardCountForStack();
    console.log('takeCard', 'takeForStacked', takeForStacked);

    if(takeForStacked) {
      // player will taked tolat number of cards that stacked wild cards demands
      // also if it is a time penalty, then he will get one extra
      totalTake = takeForStacked + (timePenalty ? 1 : 0);
      this.deck.clearStack();
      console.log('takeCard', 'From stack', totalTake);
    }    

    for(let i of Array(totalTake)) this.deck.give(player);

    if(totalTake !== 1 || timePenalty) {
      // player did not take by will, so someone feed him 2+/4+
      // we need to skip current player and move to next player
      // Or player got a time penalty so can't play penalty card
      console.log('takeCard', 'nextPlayer', playerId, totalTake, timePenalty);
      this.nextPlayer();
    } else {
      console.log('takeCard', playerId, 'skipAbale');
      player.takeCard();

      if(!this.canPlay(playerId, player.takenCard)) {
        // as player can't play the taken card, so no need to stay with him
        return this.skipCard(playerId);
      }
    }
    
    this.broadcastGameState();
  }

  timesUp(playerId) {
    if(this.canSkip(playerId)) {
      // player taken a card but not played, so skip his playing
      this.skipCard(playerId);
    } else {
      // give the player a penalty
      this.takeCard(playerId, 1, true);
    }
  }

  viewCards({playerId, playerName}) {
    const player = this.getPlayer(playerId);
    console.log('viewCards', playerId, playerName, player, this.players.map(a => a.id));

    if(!player.isGameComplete()) return;

    player.visiting = playerName;
    this.broadcastParticipants();
  }
}

module.exports = Uno;