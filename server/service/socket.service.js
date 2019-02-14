const io = require('socket.io');

class SocketService {
  constructor() {
    this.socketServer = null;
    this.namespaces = {};
  }
  
  init(server) {
    this.socketServer = this.socketServer || io(server);

    return Promise.resolve();
  }

  manageGame(gameId) {
    if(this.namespaces[gameId]) return;

    const gameNamespace = this.socketServer.of(gameId);
    this.namespaces[gameId] = gameNamespace;

    console.log('Managing game', gameId);
    gameNamespace.on('connection', socket => {
      console.log('Connected to', gameId);
      gameNamespace.emit(gameId, 'You are connected to '+gameId);
    });
  }

  broadcast(gameId, channel, data) {
    const gameNamespace = this.namespaces[gameId];

    gameNamespace.emit(channel, data);
  }
};

module.exports = new SocketService();