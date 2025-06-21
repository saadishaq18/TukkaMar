const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React client
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server running!');
});

const users = {}
// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', ({roomId, nickname})=>{
    users[socket.id] = {nickname, roomId}
    socket.join(roomId)

    const roomUsers = Object.entries(users)
        .filter(([id, user])=> user.roomId === roomId)
        .map(([id, user])=>({id, nickname: user.nickname}))

    io.to(roomId).emit('room_user', roomUsers)
  })

  socket.on('leave_room', ({roomId})=>{
    socket.leave(roomId)
    delete users[socket.id]

    const roomUsers = Object.entries(users)
    .filter(([id, user])=>user.roomId === roomId)
    .map(([id, user])=> ({id, nickname: user.nickname}))

    io.to(roomId).emit('room_users', roomUsers)
  })

  socket.on('drawing_data', ({roomId, x, y, type})=>{
    io.to(roomId).emit('drawing_data', {x, y, type})
  })

  socket.on('disconnect', () => {
    const user = users[socket.id]
    if(user){
        const roomId = user.roomId
        delete users[socket.id]

        const roomUsers = Object.entries(users)
            .filter(([id,u])=>u.roomId === roomId)
            .map(([id,u])=>({id, nickname: u.nickname}))

        io.to(roomId).emit('room_users', roomUsers)
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
