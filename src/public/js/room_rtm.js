let handleMemberJoinedChannel = async (member) => {
  console.log('A new member joined:', member.id)
  addMemberToDom(member)

  let members = await socket.emitWithAck('getMembers', roomId)
  updateMemberTotal(members)

  addBotMessageToDom(`${member.name} joined the room`)
}

let handleMemberLeftChannel = async (memberId) => {
  removeMemberFromDom(memberId)

  let members = await socket.emitWithAck('getMembers', roomId)
  updateMemberTotal(members)
}

let addMemberToDom = async (member) => {
  let membersWrapper = document.getElementById('member__list')
  let memberItem = `<div class="member__wrapper" id="member__${member.id}__wrapper">
                      <span class="green__icon"></span>
                      <p class="member_name">${member.name}</p>
                    </div>`

  membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let removeMemberFromDom = async (memberId) => {
  let memberWrapper = document.getElementById(`member__${memberId}__wrapper`)
  let name = memberWrapper.getElementsByClassName('member_name')[0].textContent

  memberWrapper.remove()
  addBotMessageToDom(`${name} has left the room.`)
}

let updateMemberTotal = async (members) => {
  let total = document.getElementById('members__count')
  total.innerText = members.length
}

let getMembers = async () => {
  let members = await socket.emitWithAck('getMembers', roomId)
  updateMemberTotal(members)

  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i])
  }
}

let sendMessage = async (e) => {
  e.preventDefault()

  let message = e.target.message.value
  if (!message) 
    return

  socket.emit('messageFromPeer', JSON.stringify({ 'type':'chat', 'message':message, 'name':displayName }), roomId)
  e.target.reset()
}

let addChannelMessage = async (message) => {
  message = JSON.parse(message)

  if (message.type === 'chat')
    addMessageToDom(message.name, message.message)
  else if (message.type === 'bot')
    addBotMessageToDom(message.message)
}

let addMessageToDom = async (name, message) => {
  let messagesWrapper = document.getElementById('messages')

  let newMessage = `<div class="message__wrapper">
                      <div class="message__body">
                        <strong class="message__author">${name}</strong>
                        <p class="message__text">${message}</p>
                      </div>
                    </div>`

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
  if (lastMessage)
    lastMessage.scrollIntoView()
}

let addBotMessageToDom = async (message) => {
  let messagesWrapper = document.getElementById('messages')

  let newMessage = `<div class="message__wrapper">
                      <div class="message__body__bot">
                        <strong class="message__author__bot">🤖 Mumble Bot</strong>
                        <p class="message__text__bot">${message}</p>
                      </div>
                    </div>`

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
  if (lastMessage)
    lastMessage.scrollIntoView()
}

let messageForm = document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)