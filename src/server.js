const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const port = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/room.html');
});

let roomMembers = {};

io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    if (!roomMembers[roomId]) {
      roomMembers[roomId] = [];
    } else {
      io.to(roomId).emit('MemberJoined', socket.id);
    }
    
    socket.join(roomId);
    roomMembers[roomId].push(socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
    console.log(`Room members: ${roomMembers[roomId]}`);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});