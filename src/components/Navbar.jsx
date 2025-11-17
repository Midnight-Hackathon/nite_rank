import { Link } from 'react-router-dom';
import { useStrava } from '../context/StravaContext.jsx';

function Navbar() {
  const { isConnected, connectStrava } = useStrava();

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Midnight Hackathon</h1>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-blue-200">Home</Link>
          <Link to="/leaderboard" className="text-white hover:text-blue-200">Leaderboard</Link>
          {!isConnected && (
            <button
              onClick={connectStrava}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Connect Strava
            </button>
          )}
          {isConnected && (
            <span className="text-white">Strava Connected</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;