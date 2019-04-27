const app = require('./server/app');
const config = require('./server/config/config');
const http = require('http');
const SocketService = require('./server/service/socket.service');

const server = http.createServer(app);
const ip = process.env.IP || '0.0.0.0';
const port = process.env.PORT || config.server.port;

const onError = (error)=> {
  if(error.syscall !== 'listen') throw error;

  switch(error.code) {
    case 'EACCES':
      console.error(`${port} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${port} is already in use.`);
      process.exit(1);
      break;
    default: throw error;
  }
}

const onListen = () => {
  const address = server.address();
  const msg = typeof address === 'string' ? address : `port ${address.port}`;

  console.log(`server is listening on ${msg}`);
}

SocketService.init(server);
server.listen(port, ip);
server.on('error', onError);
server.on('listening', onListen);

module.exports = server;