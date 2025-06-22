const words = ["apple", "banana", "cherry", "date", "elderberry"];

const rooms = {
    round: 0,
    maxRounds: 3,
    timer: null,
    scores: {}
}

function startGame(roomId){
    const room = rooms[roomId]
    if(!room || room.players.length === 0) return

    room.artistIndex = (room.artistIndex + 1) % room.players.length
    room.guesses = {}
    room.word = pickRandomWord()
    room.revealed = maskWord(room.word)

    const artist = room.players[room.artistIndex]

    return {
        artist,
        wordOptions: generateWordOptions(room.word),
        masked: room.revealed
    }
}

function maskWord(word){
    return word.replace(/[a-zA-Z]/g, '_')
}

function pickRandomWord(){
    return words[Math.floor(Math.random() * words.length)]
}

function generateWordOptions(correct){
    const options = [correct]
    while(options.length < 3){
        const w = pickRandomWord()
        if(!options.includes(w)) options.push(w)
    }
    return shuffle(options)
}

function shuffle(arr){
    return arr.sort(()=>0.5 - Math.random())
}

function setArtistWord(roomId, word){
    const room = rooms[roomId]
    if(room){
        room.word = word
        room.revealed = maskWord(word)
    }
}

function handleGuess(roomId, playerId, guess){
    const room = rooms[roomId]
    if(!room || room.guesses[playerId]) return false
    
    if(guess.toLowerCase() === room.word.toLowerCase()){
        room.guesses[playerId] = true
        if(room.scores[playerId]) room.scores[playerId] += 100
        return true
    }
    return false
}

function scheduleNextRound(io, roomId){
    const game = startGame(roomId)
    if(!game) return

    const room = rooms[roomId]
    room.round += 1

    const artist = game.artist 
    io.to(game.artist).emit('choose_word', game.wordOptions)
    io.to(roomId).emit('round_start', {
        artist,
        masked: game.masked,
        round: room.round,
        totalRounds: room.maxRounds
    })

    if(!room.scores) room.scores = {}
    room.players.forEach((p)=>{
        if(!room.scores[p.id]) room.scores[p.id] = 0
    })

    if(room.timer) clearTimeout(room.timer)

    room.timer = setTimeout(()=>{
        io.to(roomId).emit('round_end', {
            word:room.word,
            scores:room.scores,
        })
        if(room.round >= room.maxRounds){
            io.to(roomId).emit('game_over', {
                scores:room.scores
                })
        }
        else {
            scheduleNextRound(io, roomId)
        }
    }, 60000)

}

module.exports = {
    rooms,
    startGame,
    setArtistWord,
    handleGuess,
    scheduleNextRound
}