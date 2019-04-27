class History {
  constructor(gameId, socket) {
    this.gameId = gameId;
    this.socket = socket;
    this.timeline = [];
  }

  add(item) {
    this.timeline.push(item);
    this.socket.broadcast(this.gameId, item);
  }

  calledUno(playerName) {
    this.add(`${playerName} called UNO`);
  }
  
  calledUnoEarly(playerName) {
    this.add(`${playerName} got 2 cards penalty for early UNO call`);
  }

  cardPlayed(playerName, card) {
    this.add(`${playerName} played ${card.color}-${card.symbol}`);
  }

  cardSkipped(playerName) {
    this.add(`${playerName} skipped his turn`);
  }

  claimedUno(playerName) {
    this.add(`Someone claimed UNO & ${playerName} got 2 cards penalty`);
  }

  directionChanged(direction) {
    this.add(`Game direction ${direction === 1 ? 'changed' : 'reversed'}`);
  }

  gameOver() {
    this.add(`Game ${this.gameId} is over`);
  }

  getTimeline() {
    return this.timeline;
  }

  gotUnoPenalty(playerName) {
    this.add(`${playerName} got 2 cards as UNO penalty`);
  }

  kickedPlayer(kickerName, kickedPlayerName) {
    this.add(`${kickerName} wants to kick ${kickedPlayerName}`);
  }

  kickSuccess(kickedPlayerName) {
    this.add(`${kickedPlayerName} has been kicked successfully`);
  }

  nextPlayerTake(cardCount) {
    this.add(`Next player have to take ${cardCount} cards`);
  }

  playerJoined(playerName) {
    this.add(`${playerName} has joined game`);
  }

  playerLeft(playerName) {
    this.add(`${playerName} has left`);
  }

  playerRanked(playerName, rank) {
    this.add(`${playerName} has been ranked to ${rank}`);
  }

  movedToNextPlayer(playerName) {
    this.add(`${playerName} has got his turn`);
  }

  viewingCards(spectator, viewed) {
    this.add(`${spectator} is spectating ${viewed}`);
  }
}

module.exports = History;