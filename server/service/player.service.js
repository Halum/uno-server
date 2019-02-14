const db = require('./database');

class PlayerService{

  createNewPlayer(playerName) {
    return db.createPlayer(playerName);
  }

  getPlayer(playerId) {
    return db.getPlayer(playerId);
  }

  getPlayers(playerIds) {
    let playerPromises = [];
    
    for(let playerId of playerIds) {
      playerPromises.push(db.getPlayer(playerId));
    }

    return Promise.all(playerPromises);
  }

  updatePlayersAsPlaying(playerIds) {
    let promises = [];
    let updates = {status: 'playing'};

    for(let playerId of playerIds) {
      promises.push(db.updatePlayerById(playerId, updates));
    }

    return Promise.all(promises);
  }

  updatePlayerAsReady(playerId) {
    let updates = {status: 'ready'};

    return db.updatePlayerById(playerId, updates);
  }
}

module.exports = new PlayerService();