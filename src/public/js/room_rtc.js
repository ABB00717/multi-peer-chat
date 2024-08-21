let uid = sessionStorage.getItem("uid");
if (!uid) {
  uid = String(Math.floor(Math.random() * 100000));
  sessionStorage.setItem("uid", uid);
}
var socket = io();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");
let displayName = sessionStorage.getItem("display_name");

if (!displayName) {
  window.location = "lobby.html";
}

if (!roomId) {
  roomId = "main";
}

const servers = {
  iceServers: [
    {
      urls: ['stun:stun2.l.google.com:19302', 'stun:stun1.l.google.com:19302']
    }
  ]
}

let constraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 400, ideal: 720, max: 1080 }
  },
  audio: true
}

let localInitialized = false;
let localStream;
let remoteStreams = {};
let peerConnections = {};

let joinRoomInit = async () => {
  if (!localInitialized) {
    await joinStream();
    localInitialized = true;
  }
  
  socket.emit('join', roomId);

  socket.on('memberJoined', handleUserJoined);
  socket.on('memberLeft', handleMemberLeft);
  socket.on('messageFromPeer', handleMessageFromPeer);
};  

let createPeerConnection = async (memberId) => {
  if (!localInitialized) {
    await joinStream();
    localInitialized = true;
  }

  let peerConnection = new RTCPeerConnection(servers);
  peerConnections[memberId] = peerConnection;

  remoteStreams[memberId] = new MediaStream();
  let player = document.getElementById(`user-container-${memberId}`); 
  if (player === null) {
    player = `<div class="video__container" id="user-container-${memberId}">
                <video class="video-player" id="user-${memberId}" autoplay playsinline></video>
              </div>`;
              
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${memberId}`).addEventListener('click', expandVideoFrame);
    let videoPlayer = document.getElementById(`user-${memberId}`);
    videoPlayer.srcObject = remoteStreams[memberId];
  }
            
  if (displayFrame.style.display) {
    document.getElementById(`user-container-${memberId}`).style.height = '100px';
    document.getElementById(`user-container-${memberId}`).style.width = '100px';
  }

  localStream.getTracks().forEach(track => 
    peerConnections[memberId].addTrack(track, localStream)
  );
  
  peerConnections[memberId].ontrack = (event) => {
    event.streams[0].getTracks().forEach(track => remoteStreams[memberId].addTrack(track));
  };

  peerConnections[memberId].onicecandidate = async (event) => {
    if (event.candidate) {
      socket.emit('messageFromPeer', JSON.stringify({'type': 'candidate', 'candidate': event.candidate}), memberId);
    }
  };
};

let createAnswer = async (memberId, offer) => {
  await createPeerConnection(memberId);

  await peerConnections[memberId].setRemoteDescription(offer);

  let answer = await peerConnections[memberId].createAnswer();
  peerConnections[memberId].setLocalDescription(answer);

  socket.emit('messageFromPeer', JSON.stringify({'type': 'answer', 'answer': answer}), memberId);
};

let createOffer = async (memberId) => {
  await createPeerConnection(memberId);

  let offer = await peerConnections[memberId].createOffer();
  await peerConnections[memberId].setLocalDescription(offer);

  socket.emit('messageFromPeer', JSON.stringify({'type': 'offer', 'offer': offer}), memberId);
};

let handleUserJoined = async (memberId) => {
  console.log('User joined:', memberId);
  createOffer(memberId);
};

let handleMessageFromPeer = async (message, memberId) => {
  try {
    message = JSON.parse(message);
    if (message.type === 'offer') {
      createAnswer(memberId, message.offer);
    } 
    
    if (message.type === 'answer') {
      addAnswer(message.answer, memberId);
    }
    
    if (message.type === 'candidate') {
      if (peerConnections[memberId])
        addIceCandidate(message.candidate, memberId);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }  
};

let joinStream = async () => {
  if (localInitialized)
    return;

  localStream = await navigator.mediaDevices.getUserMedia(constraints);

  let player = `<div class="video__container" id="user-container-${socket.id}">
                  <video class="video-player" id="user-${socket.id}" autoplay playsinline></video>
                </div>`;
  
  document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  document.getElementById(`user-container-${socket.id}`).addEventListener('click', expandVideoFrame);

  let videoPlayer = document.getElementById(`user-${socket.id}`);
  videoPlayer.srcObject = localStream;
};

let addAnswer = async (answer, memberId) => {
  if (!peerConnections[memberId].currentRemoteDescription) {
    await peerConnections[memberId].setRemoteDescription(answer);
  }
};

let addIceCandidate = async (candidate, memberId) => {
  if (peerConnections[memberId]) {
    await peerConnections[memberId].addIceCandidate(candidate);
  }
};

let handleMemberLeft = async (memberId) => {
  console.log('User left:', memberId);
  delete peerConnections[memberId];
  delete remoteStreams[memberId];
  document.getElementById(`user-container-${memberId}`).remove();

  if (userIdDisplayFrame === `user-container-${memberId}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName('video__container');
    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = '300px';
      videoFrames[i].style.width = '300px';
    }
  }
};

let toggleCamera = async (event) => {
  let button = event.currentTarget;
  let videoTrack = localStream.getTracks().find(track => track.kind === 'video');
  
  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    button.classList.remove('active');
  } else {
    videoTrack.enabled = true;
    button.classList.add('active');
  }
}

let toggleMic = async (event) => {
  let button = event.currentTarget;
  let audioTrack = localStream.getTracks().find(track => track.kind === 'audio');
  
  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    button.classList.remove('active');
  } else {
    audioTrack.enabled = true;
    button.classList.add('active');
  }
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);

joinRoomInit();