const configuration = {
  iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
}

class WebRtcClient {
  constructor() {
  }

  addAudio = () => {
    return navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true
      })
      .then(localStream => {
        localStream.getTracks().forEach(track => {
          connection.addTrack(track, localStream);
        });
      });
  }

  addRemoteCandidate = candidate => {
    return this.connection 
      && this.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  initiate = () => {
    this.connection = new RTCPeerConnection(configuration);

    this.connection.onicecandidate = this._onIceCanditate;
    this.connection.onnegotiationneeded = this._onNegotiationNeeded;
    this.ontrack = this._onTrack;

    return Promise.resolve();
  }

  _onIceCanditate = event => {
    const {candidate} = event;

    if(candidate) {
      // send candiate to remote
    }
  }

  _onNegotiationNeeded = event => {
    this.connection.createOffer()
      .then(offer => {
        // local descriptor created
        this.connection.setLocalDescription(offer);
        // send the offer to remote
      })
      .catch(console.error);
  }

  _onTrack = event => {
    // send remote stream for use event.streams[0]
  }

  remoteAnswered = answer => {
    return this.connection 
      && this.connection.setRemoteDescription(new RTCSessionDescription(msg.answer));
  }

  remoteOffered = offer => {
    return this.initiate()
      .then(() => this.connection.setRemoteDescription(new RTCSessionDescription(offer)))
      .then(this.addAudio)
      .then(() => this.connection.createAnswer())
      then(answer => {
        //send answer to remote
      })
  }
}
