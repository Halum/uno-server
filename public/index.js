const socket = io.connect();

const room = 'random';
const configuration = {
  iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
}

let connection = null;
let isInitiator = null;

document.getElementById('login').addEventListener('click', event => {
  socket.emit('create or join', room);
})

socket.on('connect', () => {
  console.log('Connected');
})

socket.on('message', msg => {
  switch(msg.type) {
    case 'remote-candidate':
      console.log('remote-candidate', msg.candidate);
      connection.addIceCandidate(new RTCIceCandidate(msg.candidate));
      break;
    case 'remote-offer':
      console.log('remote-offer', msg.offer);
      createConnection();
      connection.setRemoteDescription(new RTCSessionDescription(msg.offer))
        .then(addAudio)
        .then(() => connection.createAnswer())
        .then(answer => {
          console.log('Answer created', answer);
          connection.setLocalDescription(answer);
          sendMessage({
            type: 'answer',
            answer
          });
        })
        .catch(error => {
          console.error('Answer error', error);
        });
      break;
    case 'remote-answer':
      console.log('remote-answer', msg.answer);
      connection.setRemoteDescription(new RTCSessionDescription(msg.answer), () => {}, console.error);
      break;
  }
})

socket.on('created', function(room, clientId) {
  isInitiator = true;
  console.log('created', room, clientId);
});

socket.on('full', function(room) {
  console.log('Message from client: Room ' + room + ' is full :^(');
});

socket.on('ready', function() {
  console.log(room, 'room is now ready');
  
  if(isInitiator) {
    createConnection();
    addAudio();
  }
});

socket.on('joined', function(room, clientId) {
  isInitiator = false;
  console.log('joined -', room, clientId);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

const sendMessage = data => {
  socket.emit('message', data);
}

const createConnection = () => {
  connection = new RTCPeerConnection(configuration);

  connection.ontrack = event => {
    console.log('Track added', event.streams);
    document.getElementById('remote').srcObject = event.streams[0];
  };
  connection.onnegotiationneeded = () => {
    console.log('Creating offer');
    connection.createOffer()
      .then(offer => {
        console.log('Offer created', offer);
        connection.setLocalDescription(offer);

        sendMessage({
          type: 'offer',
          offer
        })
      })
      .catch(error => {
        console.error('Offer error', error);
      });
  };
  connection.onremovetrack = event => {
    console.log('Track removed');
  };
  connection.oniceconnectionstatechange = event => {
    console.log('oniceConnectionStateChange', connection.iceConnectionState, event);
  };
  connection.onicegatheringstatechange = event => {
    console.log('oniceGatheringStateChange', event);
  };
  connection.onsignalingstatechange = event => {
    console.log('onSignalingStateChange', connection.signalingState, event);
  };
  
  connection.onicecandidate = event => {
    console.log('onicecandidate', event);
    const {candidate} = event;

    if(candidate) {
      console.log('ICE candidate found', candidate);
      sendMessage({
        type: 'candidate',
        candidate: candidate
      })
    } else {
      console.log('End of candidates');
    }
  }
}

const addAudio = () => {
  return navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
  })
  .then(localStream => {
    console.log('Audio stream found', localStream);
    localStream.getTracks().forEach(track => {
      console.log('Adding track', track);
      connection.addTrack(track, localStream);
    });
  })
  .catch(err => {
      console.error('Audio stream not found', err);
  });
}