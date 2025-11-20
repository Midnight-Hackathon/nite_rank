import React, { createContext, useContext, useState, useEffect } from 'react';

const StravaContext = createContext();

export const useStrava = () => {
  const context = useContext(StravaContext);
  if (!context) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
};

export const StravaProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

  const connectStrava = () => {
    console.log('connectStrava called');
    const redirectUri = `${window.location.origin}`;
    const scope = 'read,activity:read';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    console.log('Auth URL:', authUrl);
    window.location.href = authUrl;
  };

  const handleCallback = async (code) => {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();

      console.log('Access Token:', data.access_token);
      console.log('Refresh Token:', data.refresh_token);

      // Set state directly (no localStorage for testing)
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setIsConnected(true);
    } catch (error) {
      console.error('Error during Strava auth:', error);
    }
  };

  useEffect(() => {
    const storedAccessToken = import.meta.env.VITE_ACCESS_TOKEN;
    const storedRefreshToken = import.meta.env.VITE_REFRESH_TOKEN;

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setIsConnected(true);
    }

    // Handle callback if we're on the callback page
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <StravaContext.Provider value={{
      isConnected,
      accessToken,
      refreshToken,
      connectStrava,
    }}>
      {children}
    </StravaContext.Provider>
  );
};