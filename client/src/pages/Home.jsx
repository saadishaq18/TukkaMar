import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    localStorage.setItem('nickname', nickname);
    navigate(`/lobby/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">Tukka Mar</h1>
      <input
        className="border rounded p-2"
        placeholder="Enter nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!nickname}
        onClick={handleCreateRoom}
      >
        Create Room
      </button>
    </div>
  );
}

export default Home;
