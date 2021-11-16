const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");
require("dotenv").config();
// console.log(process.env);

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));

// app.get("/a", (req, res) => {
//   res.redirect(`/${uuidV4()}`);
// });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/room", (req, res) => {
  console.log(req.query);
  if (!req.query.roomid) {
    console.log(true);
    let roomid = uuidV4();
    res.render("room", { roomId: roomid, name: req.query.name });
  } else {
    res.render("room", { roomId: req.query.roomid, name: req.query.name });
  }
  console.log("im /room");
});

// app.get("/:room", (req, res) => {
//   console.log(req.params);
//   res.render("room", { roomId: req.params.room });
//   console.log("im /:room");
// });

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    // messages
    socket.on("code", (message) => {
      //send message to the same room
      // console.log("msg come to sever via msg");
      socket.to(roomId).broadcast.emit("code", message);
    });

    socket.on("inpmsg", (message) => {
      //send message to the same room
      // console.log("msg come to sever via inpmsg");
      socket.to(roomId).broadcast.emit("inpmsg", message);
    });
    socket.on("outmsg", (message) => {
      //send message to the same room
      // console.log("msg come to sever via outmsg");
      socket.to(roomId).broadcast.emit("outmsg", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

// 443 for production
server.listen(process.env.PORT || 443);
