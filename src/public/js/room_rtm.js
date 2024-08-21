let handleMemberJoinedChannel = async (memberId) => {
  console.log('A new member joined:', memberId)
  addMemberToDom(memberId)
}

let handleMemberLeftChannel = async (memberId) => {
  removeMemberFromDom(memberId)
}

let addMemberToDom = async (memberId) => {
  let membersWrapper = document.getElementById('member__list')
  let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                      <span class="green__icon"></span>
                      <p class="member_name">${memberId}</p>
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