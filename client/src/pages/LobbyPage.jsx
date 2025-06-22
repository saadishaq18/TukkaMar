import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import DrawingBoard from '../components/DrawingBoard';
import WordPicker from '../components/WordPicker';
import ChatBox from '../components/ChatBox';

function LobbyPage() {
  const { roomId } = useParams();
  const nickname = localStorage.getItem('nickname');
  const [users, setUsers] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [scores, setScores] = useState({})
  const [round, setRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(3)

  useEffect(() => {
    if (!nickname) return;

    socket.emit('join_room', { roomId, nickname });

    socket.on('room_users', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('room_users');
    };
  }, [roomId, nickname]);

  useEffect(()=> {
    socket.on('choose_word', (options)=>{
      setWordOptions(options);
    })

    socket.on('round_start', ({artist, masked, round, totalRound})=>{
      setTimeLeft(60)
      setRound(round)
      setTotalRounds(totalRound)
    })

    socket.on('round_end', ({ word, scores }) => {
    alert(`Round over! Word was: ${word}`);
    setScores(scores);
  });

  socket.on('game_over', ({ scores }) => {
    alert('Game over!');
    setScores(scores);
  });

    return () => {
      socket.off('choose_word');
      socket.off('round_start');
    socket.off('round_end');
    socket.off('game_over');
    }
  }, [])

  useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);
  return () => clearInterval(interval);
}, []);


  const selectWord = (word) => {
    socket.emit('word_selected', { roomId, word });
    setWordOptions([]);
  }

  

  return (
    <>
    <div className="p-6">
      <h2 className="text-2xl font-bold">Room: {roomId}</h2>
      <h3 className="text-lg mt-4">Players:</h3>
      <ul className="mt-2">
        {users.map((user, i) => (
          <li key={i}>{user.nickname}</li>
        ))}
      </ul>
    </div>
    <div className='mt-4'>
        <DrawingBoard roomId={roomId} />

    </div>
    {
      wordOptions.length > 0 && (
        <WordPicker options={wordOptions} onSelect={selectWord} />
      )
    }
    <div className='justify-end'>
      <ChatBox roomId={roomId} />
    </div>
    <div className="flex justify-between mt-4">
  <div>🕒 Time: {timeLeft}s</div>
  <div>📅 Round: {round}/{totalRounds}</div>
</div>

<div className="mt-2">
  <h3 className="font-bold">Scores:</h3>
  <ul>
    {Object.entries(scores).map(([id, score]) => (
      <li key={id}>{id.slice(0, 5)}: {score}</li>
    ))}
  </ul>
</div>

    </>
  );
}

export default LobbyPage;
