const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const banchoJS = require("bancho.js");
require("dotenv").config();
const bodyParser = require("body-parser");
const { cpSync } = require("fs");
const { info } = require("console");
// init
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/submit", (req, res) => {
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.post("/submit", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const bot = new banchoJS.BanchoClient({
      username: username,
      password: password,
    });

    await bot.connect();
    console.log("Connected to Bancho");

    const token = Buffer.from(username + ":" + password).toString("base64");
    const queryParams = new URLSearchParams({
      success: true,
      info: token,
    });
    res.redirect(`./main.html?${queryParams.toString()}`);

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

      socket.on("chat message l", (msg) => {
        console.log("Local message");
        channel.sendMessage(msg);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        bot.disconnect();
      });
    });
  } catch (err) {
    console.error("Error connecting bot:", err);
    res.status(500).json({ error: "Failed to connect bot" });
  }
});

const PORT = process.env.PORT || 2727;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access: http://localhost:${PORT}`);
});
