const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve a simple HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Default Namespace (Chat Room)
io.on('connection', (socket) => {
  console.log('A user connected to the default chat room');

  socket.on('chat message', (message) => {
    io.emit('chat message', message); // Broadcast message to all clients in the default namespace
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected from the default chat room');
  });
});

// Custom Namespace (Admin Chat Room)
const adminNamespace = io.of('/admin');
adminNamespace.on('connection', (socket) => {
  console.log('A user connected to the admin chat room');

  socket.on('admin message', (message) => {
    adminNamespace.emit('admin message', message); // Broadcast message to all clients in the admin namespace
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected from the admin chat room');
  });
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
