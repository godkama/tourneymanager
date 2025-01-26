const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const banchoJS = require("bancho.js");
require("dotenv").config();
const bodyParser = require("body-parser");
// init
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the login page as the default page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// POST route to handle form submission and bot connection
app.post("/submit", async (req, res) => {
  const usernameIRC = req.body.username;
  const pwdIRC = req.body.password;

  const bot = new banchoJS.BanchoClient({
    username: usernameIRC,
    password: pwdIRC,
  });

  try {
    // Wait for the bot to connect
    await bot.connect();
    console.log("Connected to Bancho");

    // Bot is connected, set up the socket
    io.on("connection", (socket) => {
      console.log("new user connected");

      const channel = bot.getChannel("#osu");
      channel.join();

      bot.on("CM", (message) => {
        console.log(`${message.user.ircUsername}: ${message.content}`);
        io.emit(
          "chat message",
          `${message.user.ircUsername}: ${message.content}`
        );
      });

      socket.on("chat message", (msg) => {
        console.log("Message received ", msg);
        io.emit("chat message", msg);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });

    // Send the main page with the bot's info
    res.sendFile(__dirname + "/public/main.html");
  } catch (err) {
    console.error("Error connecting bot: ", err);
    res.status(500).send("Failed to connect bot.");
  }
});

const PORT = process.env.PORT || 2727;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access: https://localhost:${PORT}`);
});
