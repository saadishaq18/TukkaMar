const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const {rooms, startGame, setArtistWord, handleGuess, scheduleNextRound} = require('./gameManager')

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

    if(!rooms[roomId]){
      rooms[roomId] = {players:[], artistIndex: -1}
    }

    const player = {id: socket.id, nickname}
    rooms[roomId].players.push(player)

    updateRoomUsers(roomId)

    if(rooms[roomId].player.length >= 2){
      const gameState = startGame(roomId) 
      io.to(gameState.artist.id).emit('choose_word', gameState.wordOptions)
      io.to(roomId).emit('round_start', {
        artist: gameState.artist,
        masked: gameState.masked
      })
    }

    // const roomUsers = Object.entries(users)
    //     .filter(([id, user])=> user.roomId === roomId)
    //     .map(([id, user])=>({id, nickname: user.nickname}))

    // io.to(roomId).emit('room_user', roomUsers)
  })

  socket.on('word_selected', ({roomId, word})=> {
    setArtistWord(roomId, word)
    io.to(roomId).emit('word_chosen', {masked: '_'.repeat(word.length)})
  })

  socket.on('guess_word', ({roomId, guess})=>{
    const playerId = socket.id
    const correct = handleGuess(roomId, playerId, guess)

    if(correct){
      socket.emit('guess_result', {correct: true})
      io.to(roomId).emit('chat_message', {
        sender: 'SYSTEM',
        message: `${users[playerId].nickname} guessed the word correctly!`
      })
    }
  })

  socket.on('leave_room', ({roomId})=>{
    socket.leave(roomId)
    delete users[socket.id]

    const roomUsers = Object.entries(users)
    .filter(([id, user])=>user.roomId === roomId)
    .map(([id, user])=> ({id, nickname: user.nickname}))

    io.to(roomId).emit('room_users', roomUsers)
  })

  socket.on('word_selected', ({roomId, word})=>{
    setArtistWord(roomId, word)
    io.to(roomId).emit('word_chosen', {masked: '_'.repeat(word.length) })

    scheduleNextRound(io,roomId)
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
