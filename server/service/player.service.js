const db = require('./database');

class PlayerService{

  createNewPlayer(playerName) {
    return db.createPlayer(playerName);
  }

  getPlayers(playerIds) {
    let playerPromises = [];
    for(let playerId of playerIds) {
      playerPromises.push(db.getPlayer(playerId));
    }

    return Promise.all(playerPromises);
  }
}

module.exports = new PlayerService();