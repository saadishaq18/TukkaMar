import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // Adjust if needed

export default socket;
