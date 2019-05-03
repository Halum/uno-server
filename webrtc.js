const SocketService = require('./server/service/socket.service');
const server = new SocketService({id: 'test'}).server;
const os = require('os');


server.sockets.on('connection', socket => {
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  console.log('Connected', socket.id);

  socket.on('message', msg => {
    log('Client said: ', msg);
    // for a real app, would be room-only (not broadcast)
    // socket.broadcast.emit('message', message);
    switch(msg.type) {
      case 'candidate':
        socket.broadcast.to(socket.room).emit('message', {
          type: 'remote-candidate',
          candidate: msg.candidate
        });
        break;
      case 'offer':
        socket.broadcast.to(socket.room).emit('message', {
          type: 'remote-offer',
          offer: msg.offer
        })
        break;
      case 'answer':
        socket.broadcast.to(socket.room).emit('message', {
          type: 'remote-answer',
          answer: msg.answer
        })
        break;
    }
  });

  socket.on('create or join', function(room) {
    //it shouldnt be here
    socket.room = room;

    log('Received request to create or join room ' + room);

    var clientsInRoom = server.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;

    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      server.sockets.in(room).emit('join', room, socket.id);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      server.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });
});

module.exports = {};