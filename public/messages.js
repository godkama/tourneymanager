const socket = io();
// message handle
document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message");
  const message = messageInput.value;
  messageInput.value = "";

  socket.emit("chat message", `LOCAL: ${message}`);
});

//listen

socket.on("chat message", (msg) => {
  const messagesList = document.getElementById("messages");
  const li = document.createElement("li");
  li.textContent = msg;
  messagesList.appendChild(li);
});
