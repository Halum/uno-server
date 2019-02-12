const app = require('./server/app');
const config = require('./server/config/config');
const http = require('http')

const server = http.createServer(app);
const port = config.server.port;

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

server.listen(port);
server.on('error', onError);
server.on('listening', onListen);

module.exports = server;