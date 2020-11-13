const express = require("express");
const app = express();
//import uuid library version 4
const { v4: uuidv4 } = require("uuid");

const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use('/peerjs', peerServer);
//uuid gives the visiter an id then redirects him to it
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
//connection
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    //alert others that another user will join the room
    socket.to(roomId).broadcast.emit("user-connected", userId);
    //sending the message that we received to our room then resend it
    socket.on('message',message=>{
      io.to(roomId).emit('createMessage',message);
    })
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  });
});

server.listen(process.env.PORT || 8888);
