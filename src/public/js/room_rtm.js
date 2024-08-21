let handleMemberJoinedChannel = async (member) => {
  console.log('A new member joined:', member.id)
  addMemberToDom(member)

  let members = await socket.emitWithAck('getMembers', roomId)
  updateMemberTotal(members)
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
  memberWrapper.remove()
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