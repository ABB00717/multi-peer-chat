const APP_ID = "16839e233420496e9da8fb63e0ec4056";

let uid = sessionStorage.getItem("uid");
if (!uid) {
  uid = String(Math.floor(Math.random() * 100000));
  sessionStorage.setItem("uid", uid);
}

let token = null;
let rtcClient;
let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
  roomId = "main";
}

let displayName = sessionStorage.getItem("display_name");
if (!displayName) {
  window.location = "lobby.html";
}

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ uid, token });
  rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await rtcClient.join(APP_ID, roomId, token, uid);

  channel = await rtmClient.createChannel(roomId);
  await channel.join();

  channel.on('MemberJoined', handleMemberJoined);

  rtcClient.on('user-published', handleUserPublished);
  rtcClient.on('user-left', handleUserLeft);

  joinStream();
};

let joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, { encoderConfig: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  }});
  

  let player = `<div class="video__container" id="user-container-${uid}">
                  <div class="video-player" id="user-${uid}"></div>
                </div>`;
  
  document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);

  localTracks[1].play(`user-${uid}`);
  await rtcClient.publish([localTracks[0], localTracks[1]]);
};

let switchToCamera = async () => {
  let player = `<div class="video__container" id="user-container-${uid}">
                  <div class="video-player" id="user-${uid}"></div>
                </div>`;

  displayFrame.insertAdjacentHTML('beforeend', player);

  await localTracks[0].setMuted(true);
  await localTracks[1].setMuted(true);

  document.getElementById('mic-btn').classList.remove('active');
  document.getElementById('screen-btn').classList.remove('active');

  localTracks[1].play(`user-${uid}`);
  await rtcClient.publish([localTracks[1]]);
};

let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await rtcClient.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player == null) {
    player = `<div class="video__container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                  </div>`;
                  
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame);
  }

  if (displayFrame.style.display) {
    let videoFrames = document.getElementById(`user-container-${user.uid}`);
    videoFrames.style.height = '100px';
    videoFrames.style.width = '100px';
  }

  if (mediaType === 'video') {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();

  if (userIdDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = 'none';

    let videoFrames = document.getElementsByClassName('video__container');

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = '300px';
      videoFrames[i].style.width = '300px';
    }
  }
};

let toggleCamera = async (event) => {
  let button = event.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add('active');
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove('active');
  }
};

let toggelMic = async (event) => {
  let button = event.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add('active');
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove('active');
  }
};

let toggleScreen = async (event) => {
  let screenButton = event.currentTarget;
  let cameraButton = document.getElementById('camera-btn');

  if (!sharingScreen) {
    sharingScreen = true;

    screenButton.classList.add('active');
    cameraButton.classList.remove('active');
    cameraButton.style.display = 'none';

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = 'block';

    player = `<div class="video__container" id="user-container-${uid}">
                <div class="video-player" id="user-${uid}"></div>
              </div>`;

    displayFrame.insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);

    userIdDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await rtcClient.unpublish([localTracks[1]]);
    await rtcClient.publish([localScreenTracks]);

    let videoFrames = document.getElementsByClassName('video__container');
    for (let i = 0; videoFrames.length > i; i++) {
      if (videoFrames[i].id !== userIdDisplayFrame) {
        videoFrames[i].style.height = '100px';
        videoFrames[i].style.width = '100px';
      }
    }
  } else {
    sharingScreen = false;
    screenButton.classList.remove('active');
    cameraButton.style.display = 'block';
    document.getElementById(`user-container-${uid}`).remove();

    await rtcClient.unpublish([localScreenTracks]);
    switchToCamera();
  }
};

document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggelMic);
document.getElementById('screen-btn').addEventListener('click', toggleScreen);

joinRoomInit();
 