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

  updatePlayersAsPlaying(playerIds) {
    return this
      .getPlayers(playerIds)
      .then(players => {
        let promises = [];

        for(let player of players) {
          player.status = 'playing';

          promises.push(db.updatePlayer(player));
        }

        return Promise.all(promises);
      });
  }
}

module.exports = new PlayerService();