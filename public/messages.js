const socket = io();

// Handle message submission
document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message");
  const message = messageInput.value;
  messageInput.value = "";

  // Emit the message to the server
  socket.emit("chat message l", message);
});

// Listen for incoming messages
socket.on("chat message", (msg) => {
  const messagesList = document.getElementById("messages");
  const li = document.createElement("li");

  // Get current UTC time in HH:MM:SS format
  const now = new Date();
  const utcTime = now.toISOString().substr(11, 8); // Extract HH:MM:SS from ISO string

  // Add timestamp and message to list item
  li.innerHTML = `<span class="timestamp">[${utcTime}]</span> ${msg}`;
  messagesList.appendChild(li);

  // Scroll to the bottom of the messages list
  messagesList.scrollTop = messagesList.scrollHeight;
});
