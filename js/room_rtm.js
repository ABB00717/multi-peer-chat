let handleMemberJoined = async (memberId) => {
  console.log('Member joined:', memberId);
  addMemberToDom(memberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);
};

let addMemberToDom = async (memberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name']);
  let membersWrapper = document.getElementById(`member__list`);
  let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                      <span class="green__icon"></span>
                      <p class="member_name">${name}</p>
                    </div>`;

  membersWrapper.insertAdjacentHTML('beforeend', memberItem);
};

let updateMemberTotal = async (members) => {
  let total = document.getElementById('members__count');
  total.innerText = members.length;
};

let handleMemberLeft = async (memberId) => {
  removeMemberFromDom(memberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);
};

let removeMemberFromDom = async (memberId) => {
  let memberWrapper = document.getElementById(`member__${memberId}__wrapper`);
  memberWrapper.remove();
};

let getMembers = async () => {
  let members = await channel.getMembers();
  updateMemberTotal(members);

  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i]);
  }
};

let handleChannelMessage = async (messageData, memberId) => {
  console.log('Channel message:', messageData);
  let data = JSON.parse(messageData.text);

  if (data.type === 'chat') {
    addMessageToDom(data.displayName, data.message);
  }
};

let sendMessage = async (event) => {
  event.preventDefault();

  let message = event.target.message.value;
  channel.sendMessage({ text: JSON.stringify({ 'type':'chat', 'message':message, 'displayName':displayName }) });
  addMessageToDom(displayName, message);

  event.target.reset();
};

let addMessageToDom = (name, message) => {
  if (!name || !message) return;
  let messagesWrapper = document.getElementById('messages');

  let newMessage = `<div class="message__wrapper">
                      <div class="message__body">
                        <strong class="message__author">${name}</strong>
                        <p class="message__text">${message}</p>
                      </div>
                    </div>`

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
  if (lastMessage)
    lastMessage.scrollIntoView();
};

let addBotMessageToDom = (botMessage) => {
  if (!botMessage) return;
  let messagesWrapper = document.getElementById('messages');

  let newMessage = `<div class="message__wrapper">
                      <div class="message__body__bot">
                        <strong class="message__author__bot">🤖 Mumble Bot</strong>
                        <p class="message__text__bot">${botMessage}</p>
                      </div>
                    </div>`

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child');
  if (lastMessage)
    lastMessage.scrollIntoView();
};

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener('beforeunload', leaveChannel);
let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage);