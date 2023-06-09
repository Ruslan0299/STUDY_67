import { EventEmitter } from "events";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";

const PORT = 3000;
const app = express();
const myEmitter = new EventEmitter();
const server = http.createServer(app);
const io = new Server(server);
const messages = [];

// const readStream = fs.createReadStream("./index.js");
// const writeStream = fs.createWriteStream("./message.txt");

// readStream.on("data", (chunk) => {
//   writeStream.write(chunk);
// });

// readStream.on("error", (err) => {
//   console.error("Error reading file:", err);
// });

// writeStream.on("error", (err) => {
//   console.error("Error writing file:", err);
// });

// readStream.on("end", () => {
//   console.log("File copied successfully.");
// });

app.post("/save-messages", (req, res) => {
  const formattedMessages =  messages.map(({name, msg}) => `${name}: ${msg}`).join("\n");

  fs.writeFile("message.txt", formattedMessages, (err) => {
    if (err) {
      console.error("Error saving messages:", err);
      res.sendStatus(500);
    } else {
      console.log("Messages saved successfully.");
      res.sendStatus(200);
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

myEmitter.on("message", (msg) => {
  console.clear();
  console.log(`Recieved message: ${msg}`);
});
myEmitter.emit("message", "Hello, EventEmitter");

io.on("connection", (socket) => {
  let userName = "";

  socket.on("disconnect", (reason) => {
    console.log(`System user ${userName} is disconnected, reason: ${reason}`);
  });

  socket.on("set_username", (data) => {
    userName = data.username;
    console.log(`System user ${userName} is connected`);
  });

  socket.on("send_msg", (data) => {
    const message = { name: userName, msg: data.msg };
    messages.push(message);
    io.emit("new_msg", message);

    fs.appendFile("message.txt", `${message.name}: ${message.msg}\n`, (err) => {
      if (err) {
        console.error("Error saving:", err);
      } else {
        console.log("Message saved successfully.");
      }
    });
  });
});
