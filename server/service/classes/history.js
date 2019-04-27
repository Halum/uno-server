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

  claimedUno(playerName) {
    this.add(`Someone claimed UNO & ${playerName} got 2 cards penalty`);
  }

  getTimeline() {
    return this.timeline;
  }

  playerJoined(playerName) {
    this.add(`${playerName} has joined game`);
  }

  playerLeft(playerName) {
    this.add(`${playerName} has left`);
  }

  cardSkipped(playerName) {
    this.add(`${playerName} skipped his turn`);
  }

  viewingCards(spectator, viewed) {
    this.add(`${spectator} is spectating ${viewed}`);
  }
}

module.exports = History;