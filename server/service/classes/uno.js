const randomStringGenerator = require('randomstring');
const shuffle = require('shuffle-array');

const CardDeck = require('./card.deck');
const History = require('./../classes/history');
const Player = require('./player');
const SocketService = require('./../socket.service');

class Uno {
  constructor(gameId, randomizePlayers = false, progressiveUno = false) {
    this.id = gameId || randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.currentPlayerIdx = 0;
    this.deck = new CardDeck();
    this.direction = 1;
    this.players = [];
    this.progressiveUno = progressiveUno;
    this.rankedPlayers = [];
    this.randomizePlayers = randomizePlayers;
    this.status = 'waiting';
    this.socket = new SocketService(this);
    this.history = new History(this.id, this.socket);
  }

  addPlayer(playerName) {
    const newPlayer = new Player(playerName, this.deck.getForPlayer());

    this.players.push(newPlayer);
    this.broadcastGameState();

    // update history
    this.history.playerJoined(newPlayer.name);

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
    const ranking = this.rankedPlayers.map(player => player.summary());
    const status = this.status;

    // need to broadcast to both running players and ranking players
    // TODO ranking player does not need everything to broadcasted
    for(let player of [...this.players, ...this.rankedPlayers]) {
      const participants = this.participantsState(player);
      let turn = currentPlayer.id === player.id;
      let state = {
        player: {...player.json(), turn, takenCard: player.takenCard}, 
        game: {...cardState, participants, direction, ranking, status}
      };

      console.log('broadcast', player.id, JSON.stringify(state));
      console.log('-------------------------------------------');

      this.socket.broadcast(player.id, state);
    }
  }

  broadcastParticipants() {
    for(let player of [...this.players, ...this.rankedPlayers]) {
      const participants = this.participantsState(player);

      this.socket.broadcast(player.id, {game: {participants}});
    }
  }

  callUno(playerId) {
    const player = this.getPlayer(playerId);
    const playersTurn = this.canPlay(playerId);

    console.log('callUno', playerId);
    // update history
    this.history.calledUno(player.name);

    if(player.isEarlyForUno()) {
      console.log('callUno', 'isEarlyForUno', playerId);
      // update history
      this.history.calledUnoEarly(player.name);
      for(let i of Array(2)) this.deck.give(player);
      return this.broadcastGameState();
    }

    player.callUno(playersTurn);

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
    } else if(playerName.length > 12 || playerName.length < 3) {
      errorMessage = 'Player name should be between 3 to 12 characters';
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
    const isValidPlay = card ? this.deck.canPlay(card, this.progressiveUno) : true;

    console.log('canPlay', playerId, card, isValidPlayer, isValidCard, isValidPlay);

    if(isValidPlayer && player.kickCount) {
      onsole.log('canPlay', 'resetKick', player.id);
      // as the player is still active, people shouldn't be able to kick him
      player.resetKick();
    }

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

  claimUno(playerName) {
    const player = this.getPlayerByName(playerName);

    console.log('claimUno', playerName);

    if(player.isValidForPenalty()) {
      console.log('claimUno', 'success', playerName);
      for(let i of Array(2)) this.deck.give(player);
      this.broadcastGameState();

      // update history
      this.history.claimedUno(playerName);
    }
  }

  gameOver() {
    this.status = 'complete';
    this.broadcastGameState();

    // update history
    this.history.gameOver();
  }

  getCurrentPlayer() {
    return this.players[ this.currentPlayerIdx ];
  }

  getPlayer(playerId) {
    console.log('getPlayer', playerId);
    return [...this.players, ...this.rankedPlayers].find(player => player.id === playerId);
  }

  getPlayerByName(playerName) {
    console.log('getPlayerByName', playerName);
    return this.players.find(item => item.name === playerName);
  }

  isGameOverPossible() {
    if(this.players.length === 1) {
      // update last player status
      this.players[0].gameComplete();
      // only one player remaing, so move him to the ranking section
      this.rankPlayer(this.players[0]);
      
      return true;
    }

    return false;
  }

  kickPlayer({kickerId: playerId, kickedName: playerName}) {
    console.log('kickPlayer', playerId, playerName);
    const kickerPlayer = this.getPlayer(playerId);
    const kickedPlayer = this.getPlayerByName(playerName);

    // kicker and kicked should be valid
    // when only 2 players, no kicking
    if(!kickedPlayer || !kickerPlayer || this.playerCount <= 2) return;

    kickedPlayer.kick(playerId);
    
    // update history
    this.history.kickedPlayer(kickerPlayer.name, kickedPlayer.name);
    console.log('kickPlayer', playerName, 'kickCount', kickedPlayer.kickCount);

    if((this.playerCount > 3 && kickedPlayer.kickCount >= 3) || (this.playerCount === 3 && kickedPlayer.kickCount >= 2)) {
      console.log('kickPlayer', 'kicked', playerName);
      // when total players more than 3 then minimum 3 kick is required
      // when total players 3 then minimum 2 kick required
      this.removePlayer(kickedPlayer);

      // update history
      this.history.kickSuccess(kickedPlayer.name);
    }
  }

  nextPlayer(increament = 1) {
    if(this.direction < 0) increament *= -1 ;

    this.currentPlayerIdx += increament;

    if(this.currentPlayerIdx < 0) this.currentPlayerIdx += this.players.length;

    this.currentPlayerIdx %= this.players.length;

    // update history
    this.history.movedToNextPlayer(this.getCurrentPlayer().name);
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

      // update history
      this.history.gotUnoPenalty(player.name);

      return this.takeCard(playerId, 2);
    }

    player.give(this.deck, card);
    // update history
    this.history.cardPlayed(player.name, card);

    if(player.isGameComplete()) {
      // this player is done with the game, move him to the ranking section
      console.log('player.isGameComplete', playerId, player.name);
      this.rankPlayer(player);
    }

    if(this.isGameOverPossible()) {
      return this.gameOver();
    }

    const result = this.deck.getPlayResult(card, this.players.length);

    this.direction *= result.direction;

    if(result.direction === -1) {
      // update history
      this.history.directionChanged(this.direction);
    }

    if(result.nexPlayerTake) {
      // as next player must take cards from deck
      // add this card to stack

      console.log('Stacking', card);
      this.deck.addToStack(card);

      // update history
      this.history.nextPlayerTake(this.deck.cardCountForStack());
    }

    this.nextPlayer(result.increament);
    this.broadcastGameState();
  }

  get playerCount() {
    return this.players.length + this.rankedPlayers.length;
  }

  playerReady(playerId) {
    const player = this.getPlayer(playerId);
    player.statusReady();
    this.broadcastGameState();

    // update history
    this.history.playerReady(player.name);

    return player;
  }

  rankPlayer(player) {
    this.players = this.players.filter(val => !val.isGameComplete());
    this.rankedPlayers.push(player);

    // update history
    this.history.playerRanked(player.name, this.rankedPlayers.length);
  }

  removePlayer(player) {
    console.log('removePlayer', player.id);
    player.releaseCards(this.deck);
    // only active player need to be removed not ranked one
    this.players = this.players.filter(item => item.id !== player.id);

    // update history
    this.history.playerLeft(player.name);

    if(this.isGameOverPossible()) {
      this.gameOver();
      return this.broadcastGameState();
    }

    if(this.currentPlayerIdx === player.id) {
      this.nextPlayer();
    }

    this.broadcastGameState();
  }

  skipCard(playerId) {
    console.log('skipCard', playerId);
    if(!this.canSkip(playerId)) return;

    const player = this.getPlayer(playerId);
    player.skipCard();
    // update history
    this.history.cardSkipped(this.getPlayer(playerId).name);

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
      this.socket.broadcast(channel, count--);
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
      // also will get UNO penalty, when toalTake is 2, its coming from UNO penalty
      totalTake = takeForStacked + (timePenalty ? 1 : 0) + (totalTake === 2 ? 2 : 0);
      this.deck.clearStack();
      console.log('takeCard', 'From stack', totalTake);

      // update history
      this.history.gotWildForceTake(player.name, takeForStacked);
    }

    for(let i of Array(totalTake)) this.deck.give(player);

    // update history
    this.history.tookCard(player.name, totalTake);

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
    const player = this.getPlayer(playerId);
    // update history
    this.history.playerTimesUp(player.name)

    if(this.canSkip(playerId)) {
      // player taken a card but not played, so skip his playing
      this.skipCard(playerId);
    } else {
      // update history
      this.history.gotTimePenalty(player.name);
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
    // update history
    this.history.viewingCards(player.name, playerName);
  }
}

module.exports = Uno;