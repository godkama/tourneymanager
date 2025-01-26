const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const banchoJS = require("bancho.js");
require("dotenv").config();
// init
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const bot = new banchoJS.BanchoClient({
  username: process.env.IRCu,
  password: process.env.IRCp,
});

app.use(express.static("public"));
bot
  .connect()
  .then(() => {
    console.log("Connected to Bancho");
    io.on("connection", (socket) => {
      console.log("new user connected");
      const channel = bot.getChannel("#osu");
      channel.join();
      bot.on("CM", (message) => {
        console.log(`${message.user.ircUsername}: ${message.content}`);
        io.emit("chat message", message.content);
      });

      socket.on("chat message", (msg) => {
        console.log("Message received ", msg);
        io.emit("chat message", msg);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        bot.disconnect();
      });
    });
  })
  .catch(console.error);

const PORT = process.env.PORT || 2727;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access : https://localhost:${PORT}`);
});
