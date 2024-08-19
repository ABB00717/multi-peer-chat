let uid = sessionStorage.getItem("uid");
if (!uid) {
  uid = String(Math.floor(Math.random() * 100000));
  sessionStorage.setItem("uid", uid);
}
var socket = io();

let client;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

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

let localStream;
let remoteStream;
let remoteUsers = {};
let peerConnection;

let joinRoomInit = async () => {
  socket.emit('join', roomId);

  socket.on('memberJoined', handleUserJoined);
  socket.on('memberLeft', handleMemberLeft);
  socket.on('messageFromPeer', handleMessageFromPeer);

  joinStream();
};  

let handleUserJoined = async () => {};

let handleMessageFromPeer = async () => {};

let joinStream = async () => {
  localStream = await navigator.mediaDevices.getUserMedia(constraints);

  let player = `<div class="video__container" id="user-container-${socket.id}">
                  <video class="video-player" id="user-${socket.id}" autoplay playsinline></video>
                </div>`;
  
  document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  let videoPlayer = document.getElementById(`user-${socket.id}`);
  videoPlayer.srcObject = localStream;
};

let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player == null) {
    player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
              </div>`;
                  
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  }

  if (mediaType === 'video') {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

let handleMemberLeft = async (uid) => {
  console.log('User left:', memberId);
  document.getElementById(`user-container-${uid}`).remove();
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

joinRoomInit();
