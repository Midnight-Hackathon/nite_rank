import React from 'react';

const Home = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Midnight Hackathon</h2>
      <p className="text-gray-600 mb-8">Join the exciting world of blockchain and zero-knowledge proofs!</p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">About the Hackathon</h3>
        <p className="text-gray-700">
          This is a platform for developers to showcase their skills in building decentralized applications
          on the Midnight network. Submit your run proofs and climb the leaderboard!
        </p>
      </div>
    </div>
  );
};

export default Home;