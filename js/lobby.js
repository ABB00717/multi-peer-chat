let form = document.getElementById('lobby__form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  let inviteCode = event.target.room.value;
  if (!inviteCode) {
    inviteCode = String(Math.floor(Math.random() * 100000));
  }

  window.location = `/room.html?room=${inviteCode}`;
});