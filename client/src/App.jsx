import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LobbyPage from './pages/LobbyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomId" element={<LobbyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
