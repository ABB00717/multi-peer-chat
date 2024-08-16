let handleMemberJoined = async (memberId) => {
  console.log('Member joined:', memberId);
  addMemberToDom(memberId);
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

let handleMemberLeft = async (memberId) => {
  removeMemberFromDom(memberId);
};

let removeMemberFromDom = async (memberId) => {
  let memberWrapper = document.getElementById(`member__${memberId}__wrapper`);
  memberWrapper.remove();
};

let getMembers = async () => {
  let members = await channel.getMembers();

  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i]);
  }
};

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener('beforeunload', leaveChannel);