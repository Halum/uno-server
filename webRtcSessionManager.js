import { init } from "./server/service/socket.service";

class WebRtcSessionManager{
  constructor(socket) {
    this.socket = socket;
    this.peers = [];

    init();
  }

  init = () => {
    
  }
}