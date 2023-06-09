const btnName = document.querySelector('.btn-name');
const inputName = document.querySelector('.user-name input');
const userLabel = document.querySelector('.form-msg label');
const login = document.querySelector('.login');
const formMsg = document.querySelector('.form-msg');
const chat = document.querySelector('.chat');
const msg = document.getElementById('msg');
let userName= '';

const socket = io(); 

btnName.addEventListener('click', ()=>{ 
    userName = inputName.value;
    userLabel.innerHTML = userName;
    login.style.display = "none";
    socket.emit("set_username", {username: userName});
});

formMsg.addEventListener('submit', (e)=>{
    e.preventDefault();

    socket.emit("send_msg", {msg: msg.value})
    msg.value = "";

    socket.on("new_msg", message => {
        const li = document.createElement("li");
        li.innerHTML = `
        <p class="name">${message.name}</p>
        <p class="message">${message.msg}</p>`;
        chat.appendChild(li);
    })
});

const btnSave = document.querySelector('.btn-msg[type="button"][data-action="save"]');

btnSave.addEventListener('click', () => {
  const messages = Array.from(document.querySelectorAll('.chat .message')).map(message => message.textContent);
  const formattedMessages = messages.join('\n');

  fetch('/save-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: formattedMessages,
  })
    .then(response => {
      if (response.ok) {
        console.log('Messages saved successfully.');
      } else {
        console.log('Failed to save messages.');
      }
    })
    .catch(error => {
      console.log('Error saving messages:', error);
    });
});
