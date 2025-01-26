const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// init
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("chat message", (msg) => {
    console.log("Message received ", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 2727;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access : https://localhost:${PORT}`);
});
