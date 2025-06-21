import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import DrawingBoard from '../components/DrawingBoard';

function LobbyPage() {
  const { roomId } = useParams();
  const nickname = localStorage.getItem('nickname');
  const [users, setUsers] = useState([]);

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
    </>
  );
}

export default LobbyPage;
