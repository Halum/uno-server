const io = require('socket.io');

let socketServer = null;

class SocketService {
  constructor(game) {
    this.game = game;
    this.namespace = socketServer.of(game.id);

    this.manageGame();
  }
  
  static init(server) {
    socketServer = socketServer || io(server);

    return Promise.resolve();
  }

  manageGame() {
    const game = this.game;
    const gameId = this.game.id;

    console.log('Managing game', gameId);
    this.namespace.on('connection', socket => {
      console.log('Connected to', gameId);
      this.namespace.emit(gameId, 'You are connected to ' + gameId);

      socket.on('take-card', game.takeCard.bind(game));
      socket.on('play-card', game.playCard.bind(game));
      socket.on('skip-card', game.skipCard.bind(game));
      socket.on('times-up', game.timesUp.bind(game));
      socket.on('call-uno', game.callUno.bind(game));
      socket.on('view-cards', game.viewCards.bind(game));
      socket.on('claim-uno', game.claimUno.bind(game));
    });
  }

  broadcast(channel, data) {
    this.namespace.emit(channel, data);
  }
};

module.exports = SocketService;