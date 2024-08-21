let handleMemberJoinedChannel = async (member) => {
  console.log('A new member joined:', member.id)
  addMemberToDom(member)
}

let handleMemberLeftChannel = async (memberId) => {
  removeMemberFromDom(memberId)
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

let getMembers = async () => {
  let members = await socket.emitWithAck('getMembers', roomId)

  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i])
  }
}