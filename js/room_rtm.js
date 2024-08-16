let handleMemberJoined = async (memberId) => {
  console.log('Member joined:', memberId);
  addMemberToDom(memberId);
};

let addMemberToDom = async (memberId) => {
  let membersWrapper = document.getElementById(`member__list`);
  let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                      <span class="green__icon"></span>
                      <p class="member_name">${memberId}</p>
                    </div>`;

  membersWrapper.insertAdjacentHTML('beforeend', memberItem);
};