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
    const gameNamespace = this.socketServer.of(gameId);
    this.namespaces[gameId] = gameNamespace;

    gameNamespace.on('connection', socket => {
      console.log('Connected to', gameId);
    });
  }

  broadcast(gameId, data) {
    const gameNamespace = this.namespaces[gameId];

    gameNamespace.emit(gameId, data);
  }
};

module.exports = new SocketService();