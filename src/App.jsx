import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-xl font-bold">Midnight Hackathon</h1>
            <div className="space-x-4">
              <a href="/" className="text-white hover:text-blue-200">Home</a>
              <a href="/leaderboard" className="text-white hover:text-blue-200">Leaderboard</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;