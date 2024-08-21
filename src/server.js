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
  res.sendFile(__dirname + '/public/lobby.html');
});

let roomMembers = {};

io.on('connection', (socket) => {
  socket.on('join', (roomId, displayName) => {
    if (!roomMembers[roomId]) {
      roomMembers[roomId] = [];
    } else {
      io.to(roomId).emit('memberJoined', JSON.stringify({ name: displayName, id: socket.id }));
    }
    
    socket.join(roomId);
    roomMembers[roomId].push({ id: socket.id, name: displayName });
    console.log(`User ${socket.id} joined room ${roomId}`);
    console.log(`Room members: ${roomMembers[roomId]}`);
  });

  socket.on('messageFromPeer', (message, roomId) => {
    io.to(roomId).emit('messageFromPeer', message, socket.id);
  });

  socket.on('getMembers', (roomId, callback) => {
    callback(roomMembers[roomId]);
  });

  socket.on('leave', (roomId) => {
    if (!roomMembers[roomId]) {
      return;
    }
    
    const member = roomMembers[roomId].find(member => member.id === socket.id);
    if (!member) {
      return;
    }
    
    socket.leave(roomId);
    roomMembers[roomId] = roomMembers[roomId].filter(member => member.id !== socket.id);
    io.to(roomId).emit('memberLeft', socket.id);

    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});