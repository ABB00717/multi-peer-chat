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

io.on('connection', (socket) => {
  console.log('a user connected'); 
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});