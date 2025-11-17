import { useState, useEffect } from 'react';
import { fetchActivities } from '../context/ActivityContext.jsx';


const Test = () => {
    const [userDistance , setUserDistance] = useState(0);


    const handleFetchActivities = async () => {
        const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
        const activities = await fetchActivities(accessToken);

        console.log('Fetched activities:', activities);
    }


  
    return (
        <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Page</h2>
        <p className="text-gray-600 mb-8">This is a test page for the Midnight Hackathon project.</p>
        <button 
            onClick={handleFetchActivities} 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Fetch Activities
        </button>
        </div>
    );
};

export default Test;